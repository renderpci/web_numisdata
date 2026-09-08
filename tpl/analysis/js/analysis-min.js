var analysis_min = (function (exports) {
	'use strict';

	/**
	 * Default name for the chart -> when exporting,
	 * `<name>.<format>`
	 * @type {string}
	 */
	const DEFAULT_CHART_NAME = 'chart';

	/**
	 * Color palette, totally stolen from matplotlib
	 * @type {string[]}
	 */
	const COLOR_PALETTE = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#17becf'];


	/**
	 * Normalize a color value coming from the Dedalo API into a usable color string.
	 * Dedalo color components store empty values as the placeholder `["_"]`
	 * (either as a JSON string or an already-parsed array) and populated values
	 * as a plain hex string (e.g. `#f78a1c`) or a JSON-wrapped one (e.g. `["#f78a1c"]`).
	 * An empty placeholder is treated as "no color" and resolved to `fallback`.
	 * @param {string|string[]|null|undefined} color raw color value from the API
	 * @param {string|null} fallback value returned when `color` is empty (default `COLOR_PALETTE[0]`)
	 * @returns {string|null} a color string or `fallback`
	 */
	function normalize_color(color, fallback=COLOR_PALETTE[0]) {
		if (color == null) {
			return fallback
		}
		let value = color;
		if (Array.isArray(value)) {
			value = value[0];
		} else if (typeof value === 'string' && value.trim().startsWith('[')) {
			try {
				value = JSON.parse(value);
				if (Array.isArray(value)) {
					value = value[0];
				}
			} catch (e) {
				return fallback
			}
		}
		if (typeof value !== 'string') {
			return fallback
		}
		value = value.trim();
		if (!value || value === '_') {
			return fallback
		}
		return value
	}


	/**
	 * Chart wrapper class (download panel, plot, and control panel)
	 *
	 * The `render` method must be called for the chart to be rendered to the DOM!!!
	 *
	 * Within the provided div wrapper, it will create three divs:
	 * 1. If download is supported, a div to containing the download section, with
	 *    id `chart<id>_download_chart_container` class `download_chart_container`
	 * 2. A div to contain the plot itself, with id `chart<id>_plot_wrapper` class `plot_wrapper`
	 * 3. A div to contain the control panel, with id `chart<id>_control_panel` and class `control_panel`
	 * The third div contains two divs. The first for the visibility toggle (class `control_panel_toggle`)
	 * and the second one for the control elements themselves (class `control_panel_content`)
	 *  
	 * It clears the container div during render, so subclasses should work with the dom
	 * after the render methods of this superclass (`render_plot` and `render_control_panel`) have been called.
	 * In other words, subclasses should override those specific methods instead of the general `render` function
	 *
	 * Last reminder, the constructor is the place to do data processing exclusively. All rendering to the DOM
	 * must be done in the specific render methods. Otherwise, bugs WILL appear.
	 * @class
	 * @abstract
	 * @param {Element} div_wrapper
	 * @param {Object} options configuration options
	 * @param {boolean} options.display_download whether to display the download panel (default `false`)
	 * @param {boolean} options.display_control_panel whether to display the control panel (default `false`)
	 */
	function chart_wrapper(div_wrapper, options) {
		if (this.constructor === chart_wrapper) {
			throw new Error("Abstract class 'chart_wrapper' cannot be instantiated")
		}
		chart_wrapper._n_charts_created++;
		/**
		 * Unique identifier for the chart.
		 *
		 * Subclasses MUST use this in order to assing IDs
		 * to DOM elements, in order to avoid bugs and cross-chart events
		 * @type {number}
		 * @protected
		 */
		this.id = chart_wrapper._n_charts_created;
		/**
		 * Div element wrapping the chart itself and
		 * the controls
		 * @type {Element}
		 * @protected
		 */
		this.div_wrapper = div_wrapper;
		/**
		 * Whether to display the download panel
		 * @type {boolean}
		 * @private
		 */
		this._display_download = options.display_download || false;
		/**
		 * Div container for chart download
		 * @type {Element}
		 * @private
		 */
		this._download_chart_container = undefined;
		/**
		 * Div inside the div_wrapper, that just wraps the drawing
		 * @type {Element}
		 * @protected
		 */
		this.plot_container = undefined;
		/**
		 * Whether to display the control panel
		 * @type {boolean}
		 * @private
		 */
		this._display_control_panel = options.display_control_panel || false;
		/**
		 * Div container for user controls
		 * @type {Element}
		 * @private
		 */
		this._controls_container = undefined;
		/**
		 * Div that expands and collapses the control panel
		 * @type {Element}
		 * @private
		*/
		this._controls_toggle = undefined;
		/**
		 * Div that contains all control elements
		 * Used freely by each subclass
		 * @type {Element}
		 * @protected
		 */
		this.controls_content_container = undefined;
	}

	/**
	 * Amount of created charts
	 * @type {number}
	 * @static
	 * @private
	 */
	chart_wrapper._n_charts_created = 0;

	/**
	 * Get a string representing the ID of the chart
	 * @returns {string} the id as a string
	 *          (`'chart1'`, `'chart2'`, ...)
	 */
	chart_wrapper.prototype.id_string = function () {
		return `chart${this.id}`
	};

	/**
	 * Render the chart
	 *
	 * Empties the div wrapper and resets properties
	 *
	 * Subclasses must call this method at the top
	 * of their own implementation
	 * @name chart_wrapper#render
	 * @function
	 * @public
	 */
	chart_wrapper.prototype.render = function () {
		// Remove all children in the div_wrapper
		this.div_wrapper.replaceChildren();

		// Create the div for wrapping the plot
		this.render_plot();

		// Create the div for the control panel
		if (this._display_control_panel) {
			this.render_control_panel();
		}

		// Create the chart download section
		if (this._display_download) {
			this._render_download_panel();
		}
	};

	/**
	 * Render the download panel to the DOM
	 * @function
	 * @private
	 * @name chart_wrapper#_render_download_panel
	 */
	chart_wrapper.prototype._render_download_panel = function () {
		const supported_formats = this.get_supported_export_formats();
		if (!supported_formats.length) {
			return
		}
		this.download_chart_container = common.create_dom_element({
			element_type: 'div',
			id: `${this.id_string()}_download_chart_container`,
			class_name: 'o-purple download_chart_container',
			// style: {
			// 	'display': 'flex',
			// 	'flex-direction': 'row',
			// 	'justify-content': 'center',
			// },
			parent: this.div_wrapper,
		});
		const format_select = common.create_dom_element({
			element_type	: 'select',
			id				: `${this.id_string()}_chart_export_format`,
			class_name		: 'chart_format_select',
			// style		: {
			// 	'width'		: '75%',
			// },
			parent			: this.download_chart_container,
			// TODO: add ARIA attributes?
		});
		for (const format of supported_formats) {
			common.create_dom_element({
				element_type	: 'option',
				value			: format,
				text_content	: format.toUpperCase(),
				parent			: format_select
			});
		}
		const chart_download_button = common.create_dom_element({
			element_type	: 'input',
			type			: 'button',
			class_name		: 'btn primary button_download chart',
			value			: tstring.download || 'Download',
			// style		: {
			// 	'width'		: '25%',
			// },
			parent			: this.download_chart_container
		});
		chart_download_button.addEventListener('click', () => {
			this.download_chart(format_select.value);
		});
	};

	/**
	 * Render the plot to the DOM
	 *
	 * Subclasses should override this method and make
	 * use of the plot container
	 * @function
	 * @protected
	 * @name chart_wrapper#render_plot
	 */
	chart_wrapper.prototype.render_plot = function () {
		this.plot_container = common.create_dom_element({
			element_type: 'div',
			id: `${this.id_string()}_plot_container`,
			class_name: 'o-purple plot_container',
			parent: this.div_wrapper,
		});
	};

	/**
	 * Render the control panel to the DOM
	 *
	 * Subclasses should override this method and make
	 * use of the controls container
	 * @function
	 * @protected
	 * @name chart_wrapper#render_control_panel
	 */
	chart_wrapper.prototype.render_control_panel = function () {
		/** @type {chart_wrapper} */
		const self = this;
		this._controls_container = common.create_dom_element({
			element_type	: 'div',
			id				: `${this.id_string()}_control_panel`,
			class_name		: 'control_panel',
			parent			: this.div_wrapper
		});
		this._controls_toggle = common.create_dom_element({
			element_type	: 'div',
			id				: `${this.id_string()}_control_panel_toggle`,
			text_content	: tstring.control_panel || 'Control panel',
			class_name		: 'o-red control_panel_toggle opened',
			parent			: this._controls_container
		});
		this._controls_toggle.addEventListener('click', function(){
			self._controls_toggle.classList.toggle('opened');
			self.controls_content_container.classList.toggle('hide');
		});
		this.controls_content_container = common.create_dom_element({
			element_type	: 'div',
			id				: `${this.id_string()}_control_panel_content`,
			class_name		: 'o-green control_panel_content hide',
			parent			: this._controls_container
		});
	};

	/**
	 * Download the chart as an image
	 *
	 * For each supported format in the subclass,
	 * @see chart_wrapper#get_supported_export_formats
	 * the subclass must implement a method called
	 * `download_chart_as_<format>`
	 * @param {string} format the image format
	 * @function
	 * @abstract
	 * @name chart_wrapper#download_chart
	 */
	chart_wrapper.prototype.download_chart = function (format) {
		/**
		 * File name for the chart
		 * @type {string}
		 */
		const filename = `${DEFAULT_CHART_NAME}.${format}`;
		/**
		 * Function name for downloading with the particular format
		 * @type {string}
		 */
		const download_func_name = `download_chart_as_${format}`;
		if (this[download_func_name] === undefined) {
			throw new Error(`${download_func_name} is not implemented!`)
		}
		this[download_func_name](filename);
	};

	/**
	 * Get the supported chart export formats
	 *
	 * Subclasses must return their own supported formats, if any, e.g.,
	 * `['png', 'jpg', 'eps']`. If no format is supported, there is no
	 * need to override this method.
	 * @function
	 * @returns {string[]} the supported formats
	 * @name chart_wrapper#get_supported_export_formats
	 */
	chart_wrapper.prototype.get_supported_export_formats = function () {
		return []
	};

	/**
	 * D3 chart wrapper class
	 * 
	 * Appends an `svg` tag to the provided div.
	 * 
	 * Subclasses MUST specify the viewBox of the svg, so that it responds to window resizing
	 * The created svg tag has width=100%, spanning the width of the parent element. Subclasses
	 * can alter this behavior by modifying the svg after the superclass `render_plot` method has been
	 * called
	 * @param {Element} div_wrapper the div containing the chart
	 * @param {Object} options configuration options
	 * @param {boolean} options.display_download whether to display the download panel (default `true`)
	 * @param {boolean} options.display_control_panel whether to display the control panel (default `true`)
	 * @param {boolean} options.overflow whether going beyond the width of the plot container is allowed (default `false`).
	 * 		if `false`, the svg will be stretched to fill the full width of its parent element
	 * @param {string} options.outer_height outer height of the plot, will be the height applied to the SVG (default `500px`)
	 * 		overflow must be enabled for outer_height to work
	 * @class
	 * @abstract
	 * @extends chart_wrapper
	 */
	function d3_chart_wrapper(div_wrapper, options) {
		if (this.constructor === d3_chart_wrapper) {
			throw new Error("Abstract class 'd3_chart_wrapper' cannot be instantiated")
		}
		chart_wrapper.call(this, div_wrapper, options);
		/**
		 * D3 selection object for the root `svg` tag
		 * @protected
		 */
		this.svg = undefined;
		/**
		 * Whether to go beyond the width of the plot container
		 * @type {boolean}
		 * @private
		 */
		this._overflow = options.overflow || false;
		/**
		 * Outer height of the plot, will be the height applied to the SVG
		 * @type {string}
		 * @private
		 */
		this._outer_height = options.outer_height || '500px';

	}
	// Set prototype chain
	Object.setPrototypeOf(d3_chart_wrapper.prototype, chart_wrapper.prototype);

	/**
	 * Render the plot to the DOM
	 * 
	 * Subclasses must call this method at the top
	 * of their own implementation. Then, they can
	 * make use of the svg d3.selection object
	 * @function
	 * @protected
	 * @name chart_wrapper#render_plot
	 */
	d3_chart_wrapper.prototype.render_plot = function () {
		chart_wrapper.prototype.render_plot.call(this);

		this.svg = d3.select(this.plot_container)
			.append('svg')
			// When drawing SVG to canvas with an `Image`, if we don't add version and xmlns the `Image` will never load :(
			.attr('version', '1.1')
			.attr('xmlns', 'http://www.w3.org/2000/svg');
		if (this._overflow) {
			this.svg
				.attr('width', null)
				.attr('height', this._outer_height);
			this.plot_container.style = "overflow: auto;";
		} else {
			this.svg.attr('width', '100%');
		}
	};

	/**
	 * Get the supported chart export formats
	 * @function
	 * @returns {string[]} the supported formats
	 * @name d3_chart_wrapper#get_supported_export_formats
	 */
	d3_chart_wrapper.prototype.get_supported_export_formats = function () {
		return ['svg']
	};

	/**
	 * Download the chart as svg
	 * @param {string} filename the name of the file
	 * @function
	 * @name d3_chart_wrapper#_download_chart_as_svg
	 */
	d3_chart_wrapper.prototype.download_chart_as_svg = function (filename) {
		const svg_data = this.svg.node().outerHTML;
		const svg_blob = new Blob([svg_data], { type: "image/svg+xml;charset=utf-8" });
		const url = URL.createObjectURL(svg_blob);
		/**
		 * Temporary link
		 * @type {Element}
		 */
		const tmpLink = common.create_dom_element({
			element_type: 'a',
			href: url,
		});
		tmpLink.setAttribute('download', filename);
		tmpLink.click();
		tmpLink.remove();
		URL.revokeObjectURL(url);
	};

	/**
	 * Toggle visibility of a d3 selection element
	 * @param {d3.selection} element the elememt
	 */
	function toggle_visibility(element) {
		if (element.attr('opacity') == 0) {
			element.transition().attr('opacity', 1);
		} else {
			element.transition().attr('opacity', 0);
		}
	}

	/**
	 * Get an array of values, evenly spaced over an
	 * interval
	 * 
	 * https://gist.github.com/davebiagioni/1ac21feb1c2db04be4e6
	 * @param {number} start start value
	 * @param {number} stop stop value
	 * @param {number} nsteps amount of steps
	 * @returns {number[]} the values
	 */
	function linspace(start, stop, nsteps){
		const delta = (stop-start)/(nsteps-1);
		return d3.range(nsteps).map((i) => start+i*delta)
	}

	/**
	 * Map from name to d3 curve
	 * https://github.com/d3/d3/blob/main/API.md#curves
	 * @type {Object.<string, d3.curve>}
	 */
	const CURVES = {
		// cubic basis spline, repeating the end points
		'Basis': d3.curveBasis,
		// a closed cubic basis spline
		'Basis closed': d3.curveBasisClosed,
		// a cubic basis spline
		'Basis open': d3.curveBasisOpen,
		// a straightened cubic basis spline (works only with d3.line, not d3.area!)
		'Bundle': d3.curveBundle,
		// a cubic Bézier spline with horizontal tangents
		'Bump X': d3.curveBumpX,
		// a cubic Bézier spline with vertical tangents
		'Bump Y': d3.curveBumpY,
		// a cubic cardinal spline, with one-sided difference at each end
		'Cardinal': d3.curveCardinal,
		// a closed cubic cardinal spline
		'Cardinal closed': d3.curveCardinalClosed,
		// a cubic cardinal spline
		'Cardinal open': d3.curveCardinalOpen,
		// a cubic Catmull–Rom spline, with one-sided difference at each end
		'Catmull-Rom': d3.curveCatmullRom,
		// a closed cubic Catmull–Rom spline
		'Catmull-Rom closed': d3.curveCatmullRomClosed,
		// a cubic Catmull–Rom spline
		'Catmull-Rom open': d3.curveCatmullRomOpen,
		// a polyline
		'Linear': d3.curveLinear,
		// a closed polyline.
		'Linear closed': d3.curveLinearClosed,
		// a cubic spline that, given monotonicity in x, preserves it in y
		'Monotone X': d3.curveMonotoneX,
		// a cubic spline that, given monotonicity in y, preserves it in x
		'Monotone Y': d3.curveMonotoneY,
		// a natural cubic spline
		'Natural': d3.curveNatural,
		// a piecewise constant function
		'Step': d3.curveStep,
		// a piecewise constant function
		'Step after': d3.curveStepAfter,
		// a piecewise constant function
		'Step before': d3.curveStepBefore,
	};

	/**
	 * Implements methods for computing the number of
	 * bins based on the data values
	 * 
	 * Each method takes an array of data values as input
	 * and outputs the number of bins
	 * @class
	 */
	function compute_n_bins() {}

	/**
	 * Compute number of bins with the square root rule
	 * @param {number[]} values the datapoints
	 * @returns {number} the number of bins 
	 */
	compute_n_bins.sqrt = function (values) {
		return Math.ceil(Math.sqrt(values.length))
	};

	/**
	 * Compute number of bins with the Sturges rule
	 * @param {number[]} values the datapoints
	 * @returns {number} the number of bins 
	 */
	compute_n_bins.sturges = function (values) {
		return Math.ceil(Math.log2(values.length)) + 1
	};

	/**
	 * Compute number of bins with the Rice rule
	 * @param {number[]} values the datapoints
	 * @returns {number} the number of bins 
	 */
	compute_n_bins.rice = function (values) {
		return Math.ceil(2*Math.pow(values.length, 1/3))
	};

	/**
	 * Compute number of bins with Doane's formula
	 * 
	 * @param {number[]} values the datapoints
	 * @returns {number} the number of bins 
	 */
	compute_n_bins.doane = function (values) {
		const n = values.length;
		if (n < 2) {
			throw new Error("Doane's rule needs at least 2 datapoints")
		}
		const sigma	= Math.sqrt(6*(n-2)/((n+1)*(n+3)));
		const std	= d3.deviation(values);
		const mean	= d3.mean(values);
		const sum	= d3.sum(values);
		// The adjusted Fisher-Pearson skewness coefficient
		// https://www.itl.nist.gov/div898/software/dataplot/refman2/auxillar/skewness.htm
		const skew = (Math.sqrt(n*(n+1))/(n-2))*((sum-n*mean)/(n*Math.pow(std, 3)));
		return 1 + Math.ceil(Math.log2(n)) + Math.ceil(Math.log2(1+Math.abs(skew)/sigma))
	};

	/**
	 * Compute number of bins with Scott's normal
	 * reference rule
	 * @param {number[]} values the datapoints
	 * @returns {number} the number of bins 
	 */
	compute_n_bins.scott = function (values) {
		if (values.length < 2) {
			throw new Error(
				"Cannot compute standard deviation of an array with less than 2 values"
			)
		}
		return Math.ceil(
			(d3.max(values)-d3.min(values))*Math.pow(values.length, 1/3)/(3.49*d3.deviation(values))
		)
	};

	/**
	 * Compute number of bins with Freedman-Diaconis' choice
	 * @param {number[]} values the datapoints
	 * @returns {number} the number of bins 
	 */
	compute_n_bins.freedman_diaconis = function (values) {
		const quartile3 = d3.quantile(values, 0.75);
		const quartile1 = d3.quantile(values, 0.25);
		const iqr =  quartile3 - quartile1;
		if (quartile1 === quartile3) {
			throw new Error("IQR is 0!")
		}
		return Math.ceil(
			(d3.max(values)-d3.min(values))*Math.pow(values.length, 1/3)/(2*iqr)
		)
	};

	/**
	 * Get a deep copy of an object
	 * @param {Object} obj the object
	 * @returns a deep copy of the object
	 */

	/**
	 * Insert a dom element after another
	 * @param {Eleemnt} new_node the new node 
	 * @param {Element} existing_node the one to add after of
	 */
	function insert_after(new_node, existing_node) {
		existing_node.parentNode.insertBefore(new_node, existing_node.nextSibling);
	}

	/**
	 * Check if arrays are equal
	 * @param {any[][]} arrs the arrays to compare
	 * @return {boolean} `true` if they are equal,
	 * 		   `false` otherwise
	 */
	function array_equal(...arrs) {
		if (!arrs.length) {
			throw new Error("There are no input arrays")
		}
		const size = arrs[0].length;
		for (const arr of arrs.slice(1)) {
			if (arr.length !== size) {
				return false
			}
		}
		for (let i = 0; i < size; i++) {
			const value = arrs[0][i];
			for (const arr of arrs.slice(1)) {
				if (arr[i] !== value) {
					return false
				}
			}
		}
		return true
	}

	/**
	 * Wrapper around keyed data. That is, data which has a key. Several
	 * datum are allowed to have the same key.
	 * The data can have other keys as well.
	 * 
	 * Key components (strings) have a rank. Rank 1 is the rightmost one,
	 * Rank 2 is the one on the left of Rank 1, and so on...
	 * 
	 * This class provides utilities to work with keys, querying data and
	 * such
	 * 
	 * @param {{key: string[]}[]} data the data
	 * @class
	 */
	function keyed_data(data) {
		/**
		 * Internal data
		 * @type {{key: string[]}[]}
		 * @private
		 */
		this._data = data;

		/**
		 * Amount of components of the key
		 * @type {number}
		 * @public
		 */
		this.key_size = data[0].key.length;
	}

	/**
	 * Get possible key values at a certain rank
	 * @param {number} rank the rank
	 * @returns {string[]} possible key values
	 */
	keyed_data.prototype.key_values = function (rank) {
		if (rank < 1 || rank > this.key_size) {
			throw new Error(`Rank ${rank} does not exist in a key of size ${this.key_size}`)
		}
		/** @type {number} */
		const index = this.key_size - rank;
		return Array.from(new Set(this._data.map((datum) => datum.key[index])))
	};

	/**
	 * Query the data given a key template
	 * @param {string[]} key_tpl the key template. Parts will be matched,
	 * 	`null` counts as wildcard
	 * @returns {{key: string[]}[]} the filtered data
	 */
	keyed_data.prototype.query = function (key_tpl) {
		if (key_tpl.length !== this.key_size) {
			throw new Error("Key template is of different size than the plot keys")
		}
		return this._data.filter((ele) => {
			const key = ele.key;
			for (let i = 0; i < key.length; i++) {
				if (key_tpl[i] && key_tpl[i] !== key[i]) {
					return false
				}
			}
			return true
		})
	};

	/**
	 * Get key templates up to a rank
	 * @param {number} rank the rank. If 1, all existing keys
	 *        will be returned. If 2, all existing key templates with a wildcard in
	 *        the last component will be returned. If 3, all existing key templates
	 *        with a wildcard in the last and second-to-last component will
	 *        be returned. Etc.
	 * @returns {string[][]} the templates
	 */
	keyed_data.prototype.get_key_templates = function (rank) {
		if (rank < 1 || rank > this.key_size) {
			throw new Error(`Invalid rank ${rank} for key with size ${this.key_size}`)
		}
		// Convert to real index
		/** @type {number} */
		const i = this.key_size - rank;
		const templates_wd = this._data.map((ele) => {
			return ele.key.slice(0,i+1).concat(Array(this.key_size-i-1).fill(null))
		});
		if (!templates_wd.length) return templates_wd
		// Remove duplicates
		const templates = [templates_wd[0]];
		let tmp_template = templates_wd[0];
		for (const template of templates_wd.slice(1)) {
			if (!array_equal(tmp_template, template)) {
				templates.push(template);
				tmp_template = template;
			}
		}
		return templates
	};

	/**
	 * Get the possible values of the next key component, given a partial key.
	 * E.g., if there are 4 components, and you provide the two leftmost ones
	 * in the partial key, possible values for the third leftmost one will be
	 * given
	 * @param {string[]} pkey partial key
	 * @returns {string[]} possible values for the next key component
	 */
	keyed_data.prototype.get_next_key_component_values = function (pkey) {
		const psize = pkey.length;
		if (psize >= this.key_size) {
			throw new Error(`Input key ${pkey} is as long or longer than the actual keys!`)
		}
		const key_tpl = pkey.concat(Array(this.key_size-psize).fill(null));
		/** @type {string[]} */
		return Array.from(
			new Set(
				this.query(key_tpl).map((ele) => ele.key[psize])
			)
		)
	};

	/**
	 * Compute (boxplot) metrics for the data
	 * @param {number[]} values the data values
	 * @param {[number, number]} whiskers_quantiles if specified, the whiskers will be at those
	 * 		quantiles. If not specified, they will be located at Q1 - 1.5 * IQR and Q3 + 1.5 * IQR
	 * @returns {{
	 *  max: number,
	 *  upper_fence: number,
	 *  quartile3: number,
	 *  median: number,
	 *  mean: number,
	 *  iqr: number,
	 *  quartile1: number,
	 *  lower_fence: number,
	 *  min: number,
	 * }}
	 */
	function calc_boxplot_metrics(values, whiskers_quantiles=null) {
		const metrics = {
			max: 			null,
			upper_fence:	null,
			quartile3: 		null,
			median: 		null,
			mean: 			null,
			iqr: 			null,
			quartile1: 		null,
			lower_fence: 	null,
			min: 			null,
		};

		metrics.min = d3.min(values);
		metrics.quartile1 = d3.quantile(values, 0.25);
		metrics.median = d3.median(values);
		metrics.mean = d3.mean(values);
		metrics.quartile3 = d3.quantile(values, 0.75);
		metrics.max = d3.max(values);
		metrics.iqr = metrics.quartile3 - metrics.quartile1;
		metrics.lower_fence = whiskers_quantiles
			? d3.quantile(values, whiskers_quantiles[0]/100)
			: metrics.quartile1 - 1.5 * metrics.iqr;
		metrics.upper_fence = whiskers_quantiles
			? d3.quantile(values, whiskers_quantiles[1]/100)
			: metrics.quartile3 + 1.5 * metrics.iqr;

		return metrics
	}

	/**
	 * Name of the group change event
	 * @type {string}
	 */
	const GROUP_CHANGE_EVENT_NAME = 'ch_group_change';
	/**
	 * Group change event
	 * @type {Event}
	 */
	const GROUP_CHANGE_EVENT = new Event(GROUP_CHANGE_EVENT_NAME);

	/**
	 * Margin for the key2 label
	 * @type {[number, number]}
	 */
	const KEY2_MARGIN$1 = [10, 33];

	/**
	 * Limit for the amount of characters displayed in the labels of key 2
	 * @type {number}
	 */
	const KEY2_LABEL_CHARACTER_LIMIT$1 = 45;


	/**
	 * TODO: make a superclass (in the middle of this and d3_chart_wrapper) called xy-chart-wrapper
	 * which manages the axes, grid, and so on. This will be useful if we add other charts that make
	 * use of x and y axis
	 *
	 * Boxplot + violin chart wrapper
	 *
	 * Inspired in:
	 * - http://bl.ocks.org/asielen/d15a4f16fa618273e10f,
	 * - https://d3-graph-gallery.com/graph/violin_basicHist.html,
	 * - https://d3-graph-gallery.com/graph/boxplot_show_individual_points.html
	 *
	 * @param {Element} div_wrapper the div to work in
	 * @param {{id: string, key: string[], values: number[], color: string}[]} data the input data: an array of objects
	 * 		with id (unique identifier), key (array of components, from general to specific), values
	 * 		(the datapoints), and an optional color. It may contain any other keys, that can be passed to the tooltip callback
	 * 		(KEY COMPONENTS MUST NOT INCLUDE `'_^PoT3sRanaCantora_'`, or things WILL break)
	 * @param {string[]} key_titles the title for each key component
	 * @param {Object} options configuration options
	 * @param {boolean} options.display_download whether to display the download panel (default `false`)
	 * @param {boolean} options.display_control_panel whether to display the control panel (default `false`)
	 * @param {boolean} options.overflow whether going beyond the width of the plot container is allowed (default `false`).
	 * 		if `false`, the svg will be stretched to fill the full width of its parent element
	 * @param {string} options.outer_height outer height of the plot, will be the height applied to the SVG (default `500px`)
	 * 		overflow must be enabled for outer_height to work
	 * @param {[number, number]} options.whiskers_quantiles overrides default behavior of the whiskers
	 * 		by specifying the quantiles of the lower and upper
	 * @param {boolean} options.sort_xaxis whether to sort the xaxis (default `false`). When there is more than one key-2, sorting is mandatory.
	 * @param {string} options.ylabel the y-label (default `null`)
	 * @param {number} options.xticklabel_angle the angle (in degrees) for the xtick labels (default `0`)
	 * @param {(options: Object) => Promise<Element>} options.tooltip_callback called to fill space in the tooltip
	 * 	next to the metrics. It takes an options object as argument and returns a Promise of an HTML element to add to the
	 * 	tooltip. The attributes of the options object come from the data and are determined by the
	 * `tooltip_callback_options_attributes` option
	 * @param {string[]} options.tooltip_callback_options_attributes list of datum attributes to include in the
	 * 	options object for the tooltip callback. If the callback is provided, this list MUST be provided as well
	 * @class
	 * @extends d3_chart_wrapper
	 */
	function boxvio_chart_wrapper(div_wrapper, data, key_titles, options) {
		d3_chart_wrapper.call(this, div_wrapper, options);
		/**
		 * Called when the tooltip is shown to render extra info
		 * @private
		 * @type {(options: Object) => Promise<Element>}
		 */
		this._tooltip_callback = options.tooltip_callback || null;
		/**
		 * List of datum attributes to include in the options argument of the tooltip callback
		 * @private
		 * @type {string[]}
		 */
		this._tooltip_callback_options_attributes = options.tooltip_callback_options_attributes || null;
		/**
		 * Overrides default behavior of the whiskers by specifying
		 * the quantiles of the lower and upper
		 * @type {[number, number]}
		 * @private
		 */
		this._whiskers_quantiles = options.whiskers_quantiles || null;
		const sort_xaxis = options.sort_xaxis || data[0].key.length > 1 || false;
		if (!data.length) {
			throw new Error("Data array is empty")
		}
		// Assign a color from the color palette if not provided
		for (const [i, datum] of data.entries()) {
			datum.color = datum.color || COLOR_PALETTE[i % COLOR_PALETTE.length];
		}
		/**
		 * Data: id, key (general to specific components), values,
		 * boxplot metrics, outliers, extent (min and max)
		 * @type {{
		 * 	id: string,
		 *  key: string[],
		 *  values: number[],
		 *  color: string,
		 *  metrics: {
		 *      max: number,
		 *      upper_fence: number,
		 *      quartile3: number,
		 *      median: number,
		 *      mean: number,
		 *      iqr: number,
		 *      quartile1: number,
		 *      lower_fence: number,
		 *      min: number
		 *  },
		 *  outliers: number[],
		 *  extent: [number, number]
		 * }[]}
		 * @private
		 */
		this._data = sort_xaxis
					 ? data.sort((a, b) => a.key.join().localeCompare(b.key.join()))
					 : data;
		for (const [i, ele] of this._data.entries()) {
			ele.metrics = calc_boxplot_metrics(ele.values, this._whiskers_quantiles);
			ele.outliers = ele.values.filter(
				(v) => v < ele.metrics.lower_fence || v > ele.metrics.upper_fence
			);
			ele.extent = d3.extent(ele.values);
		}
		/**
		 * Overall Maximum and minimum of the input data
		 * @type {[number, number]}
		 */
		this._data_extent = d3.extent(this._data.map((ele) => ele.extent).flat());
		/**
		 * IDs for the data
		 * @type {string[]}
		 * @private
		 */
		this._ids = this._data.map((ele) => ele.id);
		/**
		 * Title for each key component
		 * @type {string[]}
		 * @private
		 */
		this._key_titles = key_titles;
		/**
		 * Data manager (to handle keys)
		 * @type {keyed_data}
		 * @private
		 */
		this._kdm = new keyed_data(this._data);
		/**
		 * Available key2 values
		 * @type {string[]}
		 * @private
		 */
		this._key2_values = this._kdm.key_size > 1
			? this._kdm.key_values(2)
			: null;
		/**
		 * The label for the y axis
		 * @type {string}
		 * @private
		 */
		this._ylabel = options.ylabel || null;
		/**
		 * Padding for the y axis, to account for the label and ticks
		 * @type {number}
		 */
		this.yaxis_padding = this._ylabel ? 62 : 35;
		/**
		 * Full width of svg
		 * @type {number}
		 */
		this._full_width = this._data.length < 150
			? 330.664701211*Math.sqrt(this._data.length) - 170.664701211 + this.yaxis_padding
			: 26*this._data.length + this.yaxis_padding;
		if (this._kdm.key_size > 1) {  // If we have a key-2, add some margin
			this._full_width += this._key2_values.length*d3.sum(KEY2_MARGIN$1);
		}
		/**
		 * Full height of svg
		 * @type {number}
		 */
		this._full_height = 453;
		/**
		 * Non-graphic components of the chart: setting, scales,
		 * axis generators, spacing, etc.
		 * @private
		 * @type {{
		 * 	tooltip_active: number,
		 *  margin: {
		 *      top: number,
		 *      right: number,
		 *      bottom: number,
		 *      left: number
		 *  },
		 *  width: number,
		 *  height: number,
		 *  yscale: d3.scaleLinear,
		 *  yticks_division: number,
		 *  yaxis: d3.axisGenerator,
		 *  violin_scale: {initial: number, value: number},
		 *  violin_bandwidth: number,
		 *  box_scale: {initial: number, value: number},
		 *  xscale: d3.scaleBand,
		 *  key2_start_x: {[key2: string]: number},
		 *  datum_start_x: number[],
		 *  xaxis: d3.axisGenerator,
		 *  xticklabel_angle: number,
		 *  n_bins: {initial: number, value: number}[],
		 *  histogram: d3.binGenerator[],
		 *  bins: d3.Bin[][],
		 *  supported_curves: string[],
		 *  violin_curve: d3.curve
		 * }}
		 */
		this._chart = {};
		this._chart.tooltip_active = null;
		this._chart.margin = { top: 15, right: 4, bottom: 61, left: this.yaxis_padding };
		this._chart.width = this._full_width - this._chart.margin.left - this._chart.margin.right;
		this._chart.height = this._full_height - this._chart.margin.top - this._chart.margin.bottom;
		this._chart.yscale = d3.scaleLinear()
			.range([this._chart.height, 0])
			.domain(this._data_extent)
			.clamp(true);  // when input outside of domain, its output is clamped to range
		this._chart.yticks_division = 2;  // TODO: make this part of the input options object
		// TODO: make number of decimals and number of ticks part of input options object
		this._chart.yaxis = d3.axisLeft(this._chart.yscale)
			.tickFormat((d, i) => i % this._chart.yticks_division ? '' : d.toFixed(1))
			.ticks(19);
		this._chart.violin_scale = {initial: 0.8, value: 0.8};
		this._chart.violin_bandwidth =  // Subtract key2 margins from the plot width
			(this._chart.width - this._key2_values.length*d3.sum(KEY2_MARGIN$1))
			/ this._data.length;
		this._chart.box_scale = {initial: 0.3, value: 0.3};
		this._chart.xscale = d3.scaleBand()
			.domain(this._ids)
			.range([0, this._chart.width]);
			// .padding(1-this._chart.violin_scale)     // This is important: it is the space between 2 groups. 0 means no padding. 1 is the maximum.
		this._chart.key2_start_x = this._kdm.key_size > 1
			? this._compute_key2_start_x()
			: null;
		this._chart.datum_start_x = this._compute_datum_start_x();
		this._chart.xaxis = d3.axisBottom(this._chart.xscale)
			.tickFormat((id) => this._data.find((datum) => datum.id === id).key[this._kdm.key_size - 1]);
		this._chart.xticklabel_angle = options.xticklabel_angle || 0;
		this._chart.n_bins = this._data.map((ele) => {
			const initial_value = compute_n_bins.sturges(ele.values);
			return {
				initial: initial_value,
				value: initial_value,
			}
		});
		this._chart.histogram = this._data.map((ele, i) => {
			return d3.bin().domain(ele.extent)
				.thresholds(
					linspace(ele.extent[0], ele.extent[1], this._chart.n_bins[i].value+1)
				)
		});
		this._chart.bins = this._data.map((ele, i) => {
			return this._chart.histogram[i](ele.values)
		});
		this._chart.supported_curves = [
			'Basis', 'Bump Y', 'Cardinal', 'Catmull-Rom', 'Linear',
			'Monotone Y', 'Natural', 'Step'
		];
		this._chart.violin_curve = CURVES[this._chart.supported_curves[0]];
		/**
		 * Graphic components of the chart
		 * @private
		 * @type {{
		 *  root_g: d3.selection,
		 *  xaxwl_g: d3.selection
		 *  xaxis_g: d3.selection,
		 *  yaxwl_g: d3.selection,
		 *  yaxis_g: d3.selection,
		 *  key2_dividers_g: d3.selection,
		 *  violins_g: d3.selection,
		 *  violins: d3.selection[],
		 *  boxes_g: d3.selection,
		 *  outliers: d3.selection[],
		 * 	whiskers: d3.selection[],
		 *  tooltip_div: d3.selection
		 * }}
		 */
		this._graphics = {
			// Root g tag (translated to account for the margins)
			root_g: null,
			// g tag for the x-axis and label
			yaxwl_g: null,
			// g tag for the x-axis
			xaxis_g: null,
			// g tag for the y-axis and label
			yaxwl_g: null,
			// g tag for the y-axis
			yaxis_g: null,
			// g tag for the key2 dividers
			key2_dividers_g: null,
			// g tag grouping all violins
			violins_g: null,
			// individual g tag for each violin
			violins: [],
			// g tag grouping all boxes
			boxes_g: null,
			// per group: g tag grouping all outliers of each box
			outliers: [],
			// per group: g tag grouping the whiskers of each box
			whiskers: [],
			// div tag of the tooltip
			tooltip_div: null
		};
		/**
		 * Control panel things
		 * TODO: if modifying a particular violin gets slow
		 * because we have to fetch it based on key, we can
		 * keep track of the selected one so that we only fetch
		 * if when the selected key changes. Or something like that
		 * @private
		 * @type {{
		 *  max_bins_multiplier: number,
		 *  selected_index: number,
		 *	sections: {
		 *		general: {
		 *			title: HTMLDivElement,
		 *			content_container: HTMLDivElement
		 *		},
		 *		specific: {
		 *			title: HTMLDivElement,
		 *			content_container: HTMLDivElement
		 *		}
		 *	},
		 * 	grid_select: HTMLSelectElement,
		 * 	xticklabel_angle_slider: HTMLInputElement,
		 *	curve_select: HTMLSelectElement,
		 *	show_checkboxes: {
		 *		key2: HTMLInputElement,
		 *		violins: HTMLInputElement,
		 *		boxes: HTMLInputElement,
		 *		whiskers: HTMLInputElement,
		 *		outliers: HTMLInputElement
		 *	},
		 *	scale: {
		 *		violin: {
		 *			slider: HTMLInputElement,
		 *			reset: HTMLButtonElement
		 * 		},
		 *		box: {
		 *			slider: HTMLInputElement,
		 *			reset: HTMLButtonElement
		 * 		},
		 *	},
		 *	violin_n_bins: {
		 *		slider: HTMLInputElement,
		 *		reset: HTMLButtonElement,
		 *		reset_all: HTMLButtonElement
		 *	}
		 * }}
		 */
		this._controls = {
			max_bins_multiplier: 3,
			selected_index: 0,
			sections: {
				general: {
					title: null,
					content_container: null
				},
				specific: {
					title: null,
					content_container: null
				}
			},
			grid_select: null,
			xticklabel_angle_slider: null,
			curve_select: null,
			show_checkboxes: {
				key2: null,
				violins: null,
				boxes: null,
				whiskers: null,
				outliers: null
			},
			scale: {
				violin: {
					slider: null,
					reset: null
				},
				box: {
					slider: null,
					reset: null
				}
			},
			violin_n_bins: {
				slider: null,
				reset: null,
				reset_all: null
			}
		};
	}
	// Set prototype chain
	Object.setPrototypeOf(boxvio_chart_wrapper.prototype, d3_chart_wrapper.prototype);

	/**
	 * Compute starting points (in plot x-coordinates) for the different
	 * key2s. There we will draw the key2 labels and separating line
	 * @returns {{[key2: string]: number}} the starting position for each key2
	 */
	boxvio_chart_wrapper.prototype._compute_key2_start_x = function () {
		const positions = {};

		const key_tpls = this._kdm.get_key_templates(2);

		let current_x = 0;
		for (const key_tpl of key_tpls) {
			const queried_data = this._kdm.query(key_tpl);
			positions[key_tpl[key_tpl.length-2]] = current_x;
			// Increase current_x
			current_x += d3.sum(KEY2_MARGIN$1) + this._chart.violin_bandwidth*queried_data.length;
		}

		return positions
	};

	/**
	 * Compute starting points (in plot x-coordinates) for the datum (each population)
	 * @returns {number[]} the starting position for each datum
	 */
	boxvio_chart_wrapper.prototype._compute_datum_start_x = function () {
		if (this._kdm.key_size === 1) {
			return this._ids.map((id) => this._chart.xscale(id))
		}
		// Key size is 2 (for now. Maybe in the future, greater than 2)
		const datum_start_x = [];
		// Start here for the first key2
		let current_x = KEY2_MARGIN$1[1];
		let current_key2 = this._data[0].key[this._kdm.key_size-2];
		for (const datum of this._data) {
			const key2 = datum.key[this._kdm.key_size-2];
			if (current_key2 !== key2) {
				current_key2 = key2;
				// Add space for the key2 margin
				current_x += d3.sum(KEY2_MARGIN$1);
			}
			datum_start_x.push(current_x);
			current_x += this._chart.violin_bandwidth;
		}
		return datum_start_x
	};

	/**
	 * Set the scale for the violins
	 * @function
	 * @param {number} scale the scale [0, 1]
	 * @name boxvio_chart_wrapper#set_violin_scale
	 */
	boxvio_chart_wrapper.prototype.set_violin_scale = function (scale) {
		this._chart.violin_scale.value = scale;
		// Remove the violin graphics, only leaving its root g tag (violins_g)
		this._graphics.violins_g.selectAll('*').remove();
		this._render_violins(true);
	};

	/**
	 * Set the number of bins for a particular violin
	 *
	 * Updates the chart accordingly
	 * @param {number} i the index of the violin
	 * @param {number} n_bins number of bins
	 * @name boxvio_chart_wrapper#set_n_bins
	 */
	boxvio_chart_wrapper.prototype.set_n_bins = function (i, n_bins) {
		const chart = this._chart;
		const extent = this._data[i].extent;
		chart.n_bins[i].value = n_bins;
		chart.histogram[i].thresholds(
			linspace(extent[0], extent[1], n_bins+1)
		);
		chart.bins[i] = chart.histogram[i](this._data[i].values);
		// Delete the oath of the existing violin and redraw
		this._graphics.violins[i].selectAll('*').remove();
		this._render_violin(i);
	};

	/**
	 * Set the curve for the violins
	 *
	 * Updates the chart accordingly
	 * @param {string} curve_name name of the curve
	 * @name boxvio_chart_wrapper#set_violin_curve
	 */
	boxvio_chart_wrapper.prototype.set_violin_curve = function (curve_name) {
		this._chart.violin_curve = CURVES[curve_name];
		// Remove the violin graphics, only leaving its root g tag (violins_g)
		this._graphics.violins_g.selectAll('*').remove();
		this._render_violins(true);
	};

	/**
	 * Set the scale for the boxes
	 * @function
	 * @param {number} scale the scale [0, 1]
	 * @name boxvio_chart_wrapper#set_box_scale
	 */
	boxvio_chart_wrapper.prototype.set_box_scale = function (scale) {
		this._chart.box_scale.value = scale;
		// Remove the box graphics, only leaving its root g tag (boxes_g)
		this._graphics.boxes_g.selectAll('*').remove();
		this._render_boxes(true);
	};

	/**
	 * Render the plot
	 * @function
	 * @protected
	 * @name boxvio_chart_wrapper#render_plot
	 */
	boxvio_chart_wrapper.prototype.render_plot = function () {
		d3_chart_wrapper.prototype.render_plot.call(this);

		// Set viewBox of svg
		this.svg.attr('viewBox', `0 0 ${this._full_width} ${this._full_height}`);

		// Hide tooltip when clicking in SVG or plot_container
		this.svg.on('click', (e) => {
			e.stopPropagation();
			this._hide_tooltip();
		});
		this.plot_container.addEventListener('click', (e) => {
			e.stopPropagation();
			this._hide_tooltip();
		});

		// Root g tag
		this._graphics.root_g = this.svg.append('g')
			.attr('transform', `translate(${this._chart.margin.left},${this._chart.margin.top})`);

		this._render_axis();
		this._render_ygrid();
		if (this._kdm.key_size > 1) {
			this._render_key2_dividers();
		}
		this._render_violins();
		this._render_boxes();
		this._render_tooltip();

	};

	/**
	 * Render the axis
	 * @function
	 * @private
	 * @name boxvio_chart_wrapper#_render_axis
	 */
	boxvio_chart_wrapper.prototype._render_axis = function () {
		const g = this._graphics.root_g;
		// Render X axis
		this._graphics.xaxwl_g = g.append('g')
			.attr('transform', `translate(0,${this._chart.height})`);
		const xaxwl_g = this._graphics.xaxwl_g;
		this._graphics.xaxis_g = xaxwl_g.append('g')
			.call(this._chart.xaxis);
		// If we have key2s, relocate the ticks at their desired positions
		// to leave space for the key2 labels and separators
		if (this._kdm.key_size > 1) {
			const half_bandwidth = this._chart.violin_bandwidth/2;
			this._graphics.xaxis_g.selectAll('g.tick')
				.attr(
					'transform',
					(_, i) => `translate(${this._chart.datum_start_x[i]+half_bandwidth},0)`
				);
		}
		// Apply the xticklabel angle
		this.apply_xticklabel_angle();
		// Render X axis label
		xaxwl_g.append('text')
			.attr('text-anchor', 'middle')
			.attr('y', 50)
			.attr('x', this._chart.width / 2)
			.text(this._key_titles[this._key_titles.length-1]);

		// Render y axis
		this._graphics.yaxwl_g = g.append('g');
		const yaxwl_g = this._graphics.yaxwl_g;
		this._graphics.yaxis_g = yaxwl_g.append('g')
			.call(this._chart.yaxis);
		// Render Y axis label
		yaxwl_g.append('text')
			.attr('text-anchor', 'middle')
			.attr('transform', 'rotate(-90)')
			.attr('y', -this._chart.margin.left + 20)
			.attr('x', -this._chart.height / 2)
			.text(this._ylabel);

	};

	/**
	 * Apply an angle to the xtick labels
	 * @function
	 * @name boxvio_chart_wrapper#apply_xticklabel_angle
	 */
	boxvio_chart_wrapper.prototype.apply_xticklabel_angle = function () {
		const angle = this._chart.xticklabel_angle;
		const xaxis_g = this._graphics.xaxis_g;
		if (angle < 10) {
			xaxis_g.selectAll('text')
				.attr('text-anchor', 'middle')
				.attr("dy", "0.8em")
				.attr("dx", "0")
				.attr('transform', `rotate(${-this._chart.xticklabel_angle})`);
		} else {
			xaxis_g.selectAll('text')
				.attr('text-anchor', 'end')
				.attr("dy", `${-angle*angle*0.00006172839}em`)
				.attr("dx", "-0.9em")
				.attr('transform',
					`rotate(${-this._chart.xticklabel_angle})`
				);
			if (angle < 50) {
				xaxis_g.selectAll('text')
					.attr('dx', '-0.7em');
			}
		}
	};

	/**
	 * Render the grid for the y-axis
	 * @function
	 * @private
	 * @name boxvio_chart_wrapper#_render_ygrid
	 */
	boxvio_chart_wrapper.prototype._render_ygrid = function () {
		const ticks = this._graphics.yaxis_g.selectAll('g.tick');
		ticks.append('line')
			.attr('x1', 0)
			.attr('y1', 0)
			.attr('x2', this._chart.width)
			.attr('y2', 0)
			.attr('stroke', (_, i) => i % 2 ? '#E0E0E0' : '#D1D1D1')
			.attr('stroke-width', (_, i) => i % 2 ? 0.5 : 0.8)
			.attr('class', (_, i) => i % 2 ? 'minor' : 'major')
			.attr('opacity', 0);  // disabled by default
	};

	/**
	 * Apply a grid mode to the y axis
	 * @param {'None' | 'Major' | 'Major + Minor'} mode the mode
	 * @function
	 * @name boxvio_chart_wrapper#apply_ygrid_mode
	 */
	boxvio_chart_wrapper.prototype.apply_ygrid_mode = function (mode) {
		const major_lines = this._graphics.yaxis_g.selectAll('g.tick line.major');
		const major_opacity = major_lines.attr('opacity');
		const minor_lines = this._graphics.yaxis_g.selectAll('g.tick line.minor');
		const minor_opacity = minor_lines.attr('opacity');
		switch (mode) {
			case 'None':
				if (major_opacity == 1) {
					toggle_visibility(major_lines);
				}
				if (minor_opacity == 1) {
					toggle_visibility(minor_lines);
				}
				break
			case 'Major':
				if (major_opacity == 0) {
					toggle_visibility(major_lines);
				}
				if (minor_opacity == 1) {
					toggle_visibility(minor_lines);
				}
				break
			case 'Major + Minor':
				if (major_opacity == 0) {
					toggle_visibility(major_lines);
				}
				if (minor_opacity == 0) {
					toggle_visibility(minor_lines);
				}
				break
			default:
				throw new Error(`Grid mode '${mode}' is not supported?`)
		}
	};

	/**
	 * Render the dividers for key2
	 * @function
	 * @private
	 * @name boxvio_chart_wrapper#_render_key2_dividers
	 */
	boxvio_chart_wrapper.prototype._render_key2_dividers = function () {
		this._graphics.key2_dividers_g = this._graphics.root_g.append('g');
		const dividers_g = this._graphics.key2_dividers_g;
		const color = 'gray';

		for (const [index, key2] of this._key2_values.entries()) {
			const x = this._chart.key2_start_x[key2];
			const key2_label = key2.length > KEY2_LABEL_CHARACTER_LIMIT$1
				? key2.substring(0, KEY2_LABEL_CHARACTER_LIMIT$1-3) + '...'
				: key2;
			const divider_g = dividers_g.append('g')
				.attr('transform', `translate(${x},0)`);
			if (index !== 0) {
				divider_g.append('line')
					.attr('x1', 0)
					.attr('y1', 0)
					.attr('x2', 0)
					.attr('y2', this._chart.height)
					.attr('stroke', color)
					.attr('stroke-width', 0.9)
					.attr('stroke-dasharray', this._chart.height/35);
			}
			divider_g.append('text')
				.attr('text-anchor', 'end')
				.attr('transform', 'rotate(-90)')
				.attr('y', '1.3em')  // This is the horizontal axis now
				.attr('x', '-0.6em')  // This is the vertical axis now
				.attr('font-size', '0.8em')
				.attr('fill', color)
				.text(key2_label);
		}
	};

	/**
	 * Render the violins
	 * @function
	 * @private
	 * @param {boolean} is_g_ready whether the g tag for violins is
	 *        set up (default: `false`)
	 * @name boxvio_chart_wrapper#_render_violins
	 */
	boxvio_chart_wrapper.prototype._render_violins = function (is_g_ready=false) {
		const chart = this._chart;
		const g = this._graphics.root_g;

		// Render
		if (!is_g_ready) {
			this._graphics.violins_g = g.append('g');
		}
		const violins_g = this._graphics.violins_g;
		for (let i = 0; i < this._data.length; i++) {
			this._graphics.violins[i] = violins_g.append('g')
				.classed('clickable', true)
				.attr('transform', `translate(${chart.datum_start_x[i]},0)`);
			this._graphics.violins[i].on('click', (e) => {
				e.stopPropagation();
				this.set_selected_index(i);
			});
			this._render_violin(i);
		}

	};

	/**
	 * Render a violin
	 * @function
	 * @private
	 * @param {boolean} i the index of the violin
	 * @name boxvio_chart_wrapper#_render_violins
	 */
	boxvio_chart_wrapper.prototype._render_violin = function (i) {
		const bins = this._chart.bins[i];
		const violin_scale = this._chart.violin_scale.value;
		const bandwidth = this._chart.violin_bandwidth;
		const yscale = this._chart.yscale;
		const violin_curve = this._chart.violin_curve;

		// Get the largest count in a bin as it will be maximum width
		const max_count = d3.max(bins, (bin) => bin.length);
		// Make a linear scale to map bin counts to bandwidth
		const x_num = d3.scaleLinear()
			.range([0, bandwidth])
			.domain([-max_count, max_count]);

		// Only render violin if there is more than 1 datapoint (otherwise there are NaNs around)
		if (this._data[i].values.length > 1) {
			this._graphics.violins[i]
				.append('path')
				.datum(bins)
					.style('stroke', 'gray')
					.style('stroke-width', 0.4)
					.style('fill', '#d2d2d2')
					.attr('d', d3.area()
						.x0((d) => x_num(-d.length*violin_scale))
						.x1((d) => x_num(d.length*violin_scale))
						.y((d) => yscale(d.x0))
						.curve(violin_curve)
					);
		}
	};

	/**
	 * TODO: refactor
	 * Render the boxes (including whiskers and outliers)
	 * @function
	 * @private
	 * @param {boolean} is_g_ready whether the g tag for boxes is
	 *        set up (default: `false`)
	 * @name boxvio_chart_wrapper#_render_boxes
	 */
	boxvio_chart_wrapper.prototype._render_boxes = function (is_g_ready=false) {

		const chart = this._chart;
		const g = this._graphics.root_g;

		// Draw
		if (!is_g_ready) {
			this._graphics.boxes_g = g.append('g');
		}
		const boxes = this._graphics.boxes_g;
		const bandwidth = chart.violin_bandwidth;
		const box_width = this._chart.box_scale.value * bandwidth;

		const whiskers_lw = 2;
		const median_lw = 3;

		// Iterate over the groups
		for (const [i, ele] of this._data.entries()) {

			const metrics = ele.metrics;
			const color = ele.color;

			const group_box = boxes.append('g')
				.classed('clickable', true)
				.attr('transform', `translate(${chart.datum_start_x[i] + bandwidth / 2},0)`);
			group_box.on('click', (e) => {
				e.stopPropagation();
				this.set_selected_index(i);
			});
			// Draw outliers
			this._graphics.outliers[i] = group_box.append('g');
			const outliers = this._graphics.outliers[i];
			for (const outlier of ele.outliers) {
				outliers.append('circle')
					.attr('cx', 0)
					.attr('cy', chart.yscale(outlier))
					.attr('r', 4)
					.style('fill', color)
					.style('opacity', 0.7);
			}

			// Draw whiskers
			this._graphics.whiskers[i] = group_box.append('g');
			const whiskers = this._graphics.whiskers[i];
			whiskers.append('line')  // vertical line
				.attr('x1', 0)
				.attr('y1', chart.yscale(metrics.lower_fence))
				.attr('x2', 0)
				.attr('y2', chart.yscale(metrics.upper_fence))
				.attr('stroke', color)
				.attr('stroke-width', whiskers_lw);
			whiskers.append('line') // lower horizontal
				.attr('x1', -box_width / 2)
				.attr('y1', chart.yscale(metrics.lower_fence))
				.attr('x2', box_width / 2)
				.attr('y2', chart.yscale(metrics.lower_fence))
				.attr('stroke', color)
				.attr('stroke-width', whiskers_lw);
			whiskers.append('line') // upper horizontal
				.attr('x1', -box_width / 2)
				.attr('y1', chart.yscale(metrics.upper_fence))
				.attr('x2', box_width / 2)
				.attr('y2', chart.yscale(metrics.upper_fence))
				.attr('stroke', color)
				.attr('stroke-width', whiskers_lw);

			// Draw IQR box
			const iqr = group_box.append('g');
			// Only draw rectangle if there is more than 1 datapoint (otherwise NaNs appear)
			if (ele.values.length > 1) {
				iqr.append('rect')  // iqr rect
				.attr('x', -box_width / 2)
				.attr('y', chart.yscale(metrics.quartile3))
				.attr('width', box_width)
				.attr('height', chart.yscale(metrics.quartile1) - chart.yscale(metrics.quartile3))
				.attr('fill', color);
			}
			iqr.append('line')  // median line
				.attr('x1', -box_width / 2)
				.attr('y1', chart.yscale(metrics.median))
				.attr('x2', box_width / 2)
				.attr('y2', chart.yscale(metrics.median))
				.attr('stroke', 'black')
				.attr('stroke-width', median_lw);
			const circle = iqr.append('circle')  // median dot
				.attr('cx', 0)
				.attr('cy', chart.yscale(metrics.median))
				.attr('r', 4.5)
				.style('fill', 'white')
				.attr('stroke', 'black')
				.attr('stroke-width', 2)
				.classed('clickable', true);
			// Circle events for tooltip
			circle.on('click', (e) => {
				e.stopPropagation();
				this.set_selected_index(i);

				// already displayed. (Hide) -> do nothing
					if (this._chart.tooltip_active == i) {
						// this._hide_tooltip()
						return
					}

				// hover set and fix
					this.tooltip_show(i);
					this._graphics.tooltip_div.style('display', 'flex');
					this._chart.tooltip_active = i;

				// old
				// this._graphics.tooltip_div.style('display', null)
				// this.tooltip_show(i)
			});
			// .on('mouseout', () => {
			// 	this._graphics.tooltip_div.style('display', 'none')
			// })
		}

	};

	/**
	 * Set the selected index by the user
	 * @function
	 * @param {number} i the index
	 * @name boxvio_chart_wrapper#set_selected_index
	 */
	boxvio_chart_wrapper.prototype.set_selected_index = function (i) {
		if (this._controls.selected_index === i) {
			return
		}
		this._controls.selected_index = i;
		this._set_specific_controls_section_title(i);
		// Tell specific controls that the selection has changed
		this._controls.violin_n_bins.slider.dispatchEvent(GROUP_CHANGE_EVENT);
	};

	/**
	 * Set the title for the specific section of the controls
	 * @function
	 * @private
	 * @param {number} selected_index the selected group index
	 * @name boxvio_chart_wrapper#_set_specific_controls_section_title
	 */
	boxvio_chart_wrapper.prototype._set_specific_controls_section_title = function (selected_index) {
		const datum = this._data[selected_index];
		this._controls.sections.specific.title.innerText =
			`${tstring.settings_for || 'Settings for'} ${datum.key.join(', ')} (${datum.id})`;
	};

	/**
	 * Hide the tooltip
	 * @function
	 * @private
	 * @name boxvio_chart_wrapper#_hide_tooltip
	 */
	boxvio_chart_wrapper.prototype._hide_tooltip = function () {
		this._graphics.tooltip_div.style('display', 'none');
		this._chart.tooltip_active = null;
	};

	/**
	 * Add the tooltip to the DOM
	 * @function
	 * @private
	 * @name boxvio_chart_wrapper#_render_tooltip
	 */
	boxvio_chart_wrapper.prototype._render_tooltip = function () {
		const tooltip_element = common.create_dom_element({
			element_type	: 'div',
			id				: `${this.id_string()}_tooltip_div`,
			class_name		: 'o-red tooltip_div'
		});
		insert_after(tooltip_element, this.plot_container);
		this._graphics.tooltip_div = d3.select(tooltip_element);
		// Hide tooltip in the beginning
		this._hide_tooltip();
		const tooltip_metrics = common.create_dom_element({
			element_type	: 'div',
			id				: `${this.id_string()}_tooltip_metrics`,
			class_name		: 'tooltip_metrics_div',
			parent			: tooltip_element
		});
		common.create_dom_element({
			element_type	: 'div',
			id				: `${this.id_string()}_tooltip_metric_names_div`,
			class_name		: 'tooltip_metric_names_div',
			parent			: tooltip_metrics
		});
		common.create_dom_element({
			element_type	: 'div',
			id				: `${this.id_string()}_tooltip_metric_values_div`,
			class_name		: 'tooltip_metric_values_div',
			parent			: tooltip_metrics
		});
	};

	/**
	 * Set the tooltip to visible
	 * @param {number} i index of data
	 * @function
	 * @name boxvio_chart_wrapper#tooltip_show
	 */
	boxvio_chart_wrapper.prototype.tooltip_show = function (i) {

		const self = this;

		const decimals = 2;
		const values		= self._data[i].values;
		const metrics		= self._data[i].metrics;
		// const tooltip_text = `<b>${key.join(', ')}</b>`

		const metric_names = `${tstring.datapoints || 'Datapoints'}`
			+ `<br>${tstring.mean || 'Mean'}`
			+ `<br>${tstring.max || 'Maximum'}`
			+ (self._whiskers_quantiles
				? `<br>${tstring.quantile}-${self._whiskers_quantiles[1]}`
				: '')
			+ `<br>${tstring.quantile || 'Quantile'}-75`
			+ `<br>${tstring.median || 'Median'}`
			+ `<br>${tstring.quantile || 'Quantile'}-25`
			+ (self._whiskers_quantiles
				? `<br>${tstring.quantile}-${self._whiskers_quantiles[0]}`
				: '')
			+ `<br>${tstring.min || 'Minimum'}`;
		const metric_values = `${values.length}`
			+ `<br>${metrics.mean.toFixed(decimals)}`
			+ `<br>${metrics.max.toFixed(decimals)}`
			+ (self._whiskers_quantiles
				? `<br>${metrics.upper_fence.toFixed(decimals)}`
				: '')
			+ `<br>${metrics.quartile3.toFixed(decimals)}`
			+ `<br>${metrics.median.toFixed(decimals)}`
			+ `<br>${metrics.quartile1.toFixed(decimals)}`
			+ (self._whiskers_quantiles
				? `<br>${metrics.lower_fence.toFixed(decimals)}`
				: '')
			+ `<br>${metrics.min.toFixed(decimals)}`;
		self._graphics.tooltip_div.select('div.tooltip_metric_names_div')
			.html(metric_names);
		self._graphics.tooltip_div.select('div.tooltip_metric_values_div')
			.html(metric_values);

		// Call the tooltip callback
		if (self._tooltip_callback) {
			const options = {};
			for (const attr_name of this._tooltip_callback_options_attributes) {
				options[attr_name] = this._data[i][attr_name];
			}
			self._tooltip_callback(options)
				.then((ele) => {
					const tooltip_element = self._graphics.tooltip_div.node();
					ele.id = `${self.id_string()}_tooltip_callback_div`;
					ele.classList.add('tooltip_callback_div');
					const last_child = tooltip_element.lastChild;
					// If the last child is already a callback, delete it!
					if (last_child.classList.contains('tooltip_callback_div')) {
						last_child.remove();
					}
					tooltip_element.appendChild(ele);
				});
		}
	};

	/**
	 * Render the control panel
	 * @function
	 * @protected
	 * @name boxvio_chart_wrapper#render_control_panel
	 */
	boxvio_chart_wrapper.prototype.render_control_panel = function () {
		d3_chart_wrapper.prototype.render_control_panel.call(this);

		// GENRAL SETTINGS
		this._controls.sections.general.title = common.create_dom_element({
			element_type	: 'div',
			text_content	: tstring.general_settings || 'General settings',
			class_name		: 'control_panel_toggle control_panel_toggle_section',
			parent			: this.controls_content_container
		});
		this._controls.sections.general.content_container = common.create_dom_element({
			element_type	: 'div',
			parent			: this.controls_content_container
		});
		// TODO: refactor the first three (together)
		const upper_container = common.create_dom_element({
			element_type	: 'div',
			class_name		: 'control_panel_item controls_block',
			parent			: this._controls.sections.general.content_container
			// style			: {
			// 	'display': 'flex',
			// 	'direction': 'flex-row',
			// 	'justify-content': 'space-between',
			// 	'align-items': 'center',
			// }
		});
		this._render_grid_select(upper_container);
		this._render_xticklabel_angle_slider(upper_container);
		this._render_violin_curve_selector(upper_container);
		this._render_checkboxes();
		this._render_scale_sliders();

		// PARTICULAR SETTINGS
		this._controls.sections.specific.title = common.create_dom_element({
			element_type	: 'div',
			class_name		: 'control_panel_toggle control_panel_toggle_section',
			parent			: this.controls_content_container
		});
		this._set_specific_controls_section_title(this._controls.selected_index);
		this._controls.sections.specific.content_container = common.create_dom_element({
			element_type	: 'div',
			parent			: this.controls_content_container
		});
		this._render_n_bins_control();

		// Define the control panel logic
		this._control_panel_logic();
	};

	/**
	 * Render the selector for grid mode
	 * @function
	 * @private
	 * @param {Element} container the container element
	 * @name boxvio_chart_wrapper#_render_grid_select
	 */
	boxvio_chart_wrapper.prototype._render_grid_select = function (container) {
		const select_container = common.create_dom_element({
			element_type: 'div',
			parent: container,
			// style: {
			// 	'display': 'flex',
			// 	'gap': DEFAULT_FLEX_GAP,
			// },
		});
		const grid_select_id = `${this.id_string()}_grid_select`;
		const grid_select_label = common.create_dom_element({
			element_type: 'label',
			text_content: tstring.grid || 'Grid',
			parent: select_container,
			style: {'margin-block': 'auto'},
		});
		grid_select_label.setAttribute('for', grid_select_id);
		const grid_select = common.create_dom_element({
			element_type: 'select',
			id: grid_select_id,
			parent: select_container,
			// TODO: add ARIA attributes?
		});
		this._controls.grid_select = grid_select;
		common.create_dom_element({
			element_type: 'option',
			value: 'None',
			text_content: tstring.none_f || 'None',
			parent: grid_select,
		});
		common.create_dom_element({
			element_type: 'option',
			value: 'Major',
			text_content: tstring.major || 'Major',
			parent: grid_select,
		});
		common.create_dom_element({
			element_type: 'option',
			value: 'Major + Minor',
			text_content: tstring.major_minor || 'Major + Minor',
			parent: grid_select,
		});
	};

	/**
	 * Render the slider for the xticklabel angle
	 * @function
	 * @private
	 * @param {Element} container the container element
	 * @name boxvio_chart_wrapper#_render_xticklabel_angle_slider
	 */
	boxvio_chart_wrapper.prototype._render_xticklabel_angle_slider = function (container) {
		const slider_container = common.create_dom_element({
			element_type: 'div',
			parent: container,
			// style: {
			// 	'display': 'flex',
			// 	'gap': DEFAULT_FLEX_GAP,
			// },
		});
		const xticklabel_angle_slider_id = `${this.id_string()}_xticklabel_angle_slider`;
		const xticklabel_angle_slider_label = common.create_dom_element({
			element_type: 'label',
			text_content: tstring.xticklabel_angle || "X-Tick label angle",
			parent: slider_container,
			// style: {'margin-block': 'auto'},
		});
		xticklabel_angle_slider_label.setAttribute('for', xticklabel_angle_slider_id);
		/** @type {Element} */
		const xticklabel_angle_slider = common.create_dom_element({
			element_type: 'input',
			type: 'range',
			id: xticklabel_angle_slider_id,
			parent: slider_container,
		});
		this._controls.xticklabel_angle_slider = xticklabel_angle_slider;
		xticklabel_angle_slider.setAttribute('min', 0);
		xticklabel_angle_slider.setAttribute('max', 90);
		xticklabel_angle_slider.value = this._chart.xticklabel_angle;
	};

	/**
	 * Render the selector for the violin curve
	 * @function
	 * @private
	 * @param {Element} container the container element
	 * @name boxvio_chart_wrapper#_render_violin_curve_selector
	 */
	boxvio_chart_wrapper.prototype._render_violin_curve_selector = function (container) {
		const select_container = common.create_dom_element({
			element_type: 'div',
			parent: container,
			// style: {
			// 	'display': 'flex',
			// 	'gap': DEFAULT_FLEX_GAP,
			// },
		});
		const curve_select_id = `${this.id_string()}_curve_select`;
		const curve_select_label = common.create_dom_element({
			element_type: 'label',
			text_content: tstring.violin_curve || 'Violin curve',
			parent: select_container,
			// style: {'margin-block': 'auto'},
		});
		curve_select_label.setAttribute('for', curve_select_id);
		const curve_select = common.create_dom_element({
			element_type: 'select',
			id: curve_select_id,
			parent: select_container,
			// TODO: add ARIA attributes?
		});
		this._controls.curve_select = curve_select;
		for (const curve_name of this._chart.supported_curves) {
			common.create_dom_element({
				element_type: 'option',
				value: curve_name,
				text_content: curve_name,
				parent: curve_select,
			});
		}
	};

	/**
	 * Render the checkboxes of the control panel
	 * @function
	 * @private
	 * @name boxvio_chart_wrapper#_render_checkboxes
	 */
	boxvio_chart_wrapper.prototype._render_checkboxes = function () {
		// Container div
		const container_div = common.create_dom_element({
			element_type	: 'div',
			class_name		: 'control_panel_item checkboxes',
			parent			: this._controls.sections.general.content_container
			// style: {
			// 	'display': 'flex',
			// 	'direction': 'flex-row',
			// 	'justify-content': 'space-between',
			// 	'align-items': 'center',
			// 	'margin-top': DEFAULT_MARGIN,
			// },
		});

		// Show text
		common.create_dom_element({
			element_type: 'div',
			text_content: `${tstring.show || "Show"}:`,
			parent: container_div,
		});

		// Show key 2
		const show_key2_div = common.create_dom_element({
			element_type: 'div',
			parent: container_div,
		});
		const show_key2_checkbox_id = `${this.id_string()}_show_key2_checkbox`;
		/** @type {Element} */
		const show_key2_checkbox = common.create_dom_element({
			element_type: 'input',
			type: 'checkbox',
			id: show_key2_checkbox_id,
			parent: show_key2_div,
		});
		show_key2_checkbox.checked = true;
		this._controls.show_checkboxes.key2 = show_key2_checkbox;
		/** @type {Element} */
		const show_key2_label = common.create_dom_element({
			element_type: 'label',
			text_content: this._key_titles[this._kdm.key_size-2],
			parent: show_key2_div,
		});
		show_key2_label.setAttribute('for', show_key2_checkbox_id);

		// Show violins
		const show_violins_div = common.create_dom_element({
			element_type: 'div',
			parent: container_div,
		});
		const show_violins_checkbox_id = `${this.id_string()}_show_violins_checkbox`;
		/** @type {Element} */
		const show_violins_checkbox = common.create_dom_element({
			element_type: 'input',
			type: 'checkbox',
			id: show_violins_checkbox_id,
			parent: show_violins_div,
		});
		show_violins_checkbox.checked = true;
		this._controls.show_checkboxes.violins = show_violins_checkbox;
		/** @type {Element} */
		const show_violins_label = common.create_dom_element({
			element_type: 'label',
			text_content: tstring.violins || 'Violins',
			parent: show_violins_div,
		});
		show_violins_label.setAttribute('for', show_violins_checkbox_id);

		// Show boxes
		const show_boxes_div = common.create_dom_element({
			element_type: 'div',
			parent: container_div,
		});
		const show_boxes_checkbox_id = `${this.id_string()}_show_boxes_checkbox`;
		/** @type {Element} */
		const show_boxes_checkbox = common.create_dom_element({
			element_type: 'input',
			type: 'checkbox',
			id: show_boxes_checkbox_id,
			parent: show_boxes_div,
		});
		show_boxes_checkbox.checked = true;
		this._controls.show_checkboxes.boxes = show_boxes_checkbox;
		/** @type {Element} */
		const show_boxes_label = common.create_dom_element({
			element_type: 'label',
			text_content: tstring.boxes || 'Boxes',
			parent: show_boxes_div,
		});
		show_boxes_label.setAttribute('for', show_boxes_checkbox_id);

		// Show whiskers
		const show_whiskers_div = common.create_dom_element({
			element_type: 'div',
			parent: container_div,
		});
		const show_whiskers_checkbox_id = `${this.id_string()}_show_whiskers_checkbox`;
		/** @type {Element} */
		const show_whiskers_checkbox = common.create_dom_element({
			element_type: 'input',
			type: 'checkbox',
			id: show_whiskers_checkbox_id,
			parent: show_whiskers_div,
		});
		show_whiskers_checkbox.checked = true;
		this._controls.show_checkboxes.whiskers = show_whiskers_checkbox;
		/** @type {Element} */
		const show_whiskers_label = common.create_dom_element({
			element_type: 'label',
			text_content: tstring.whiskers || 'Whiskers',
			parent: show_whiskers_div,
		});
		show_whiskers_label.setAttribute('for', show_whiskers_checkbox_id);

		// Show outliers
		const show_outliers_div = common.create_dom_element({
			element_type: 'div',
			parent: container_div,
		});
		const show_outliers_checkbox_id = `${this.id_string()}_show_outliers_checkbox`;
		/** @type {Element} */
		const show_outliers_checkbox = common.create_dom_element({
			element_type: 'input',
			type: 'checkbox',
			id: show_outliers_checkbox_id,
			parent: show_outliers_div,
		});
		show_outliers_checkbox.checked = true;
		this._controls.show_checkboxes.outliers = show_outliers_checkbox;
		/** @type {Element} */
		const show_outliers_label = common.create_dom_element({
			element_type: 'label',
			text_content: tstring.outliers || 'Outliers',
			parent: show_outliers_div,
		});
		show_outliers_label.setAttribute('for', show_outliers_checkbox_id);
	};

	/**
	 * Render the sliders of the control panel that
	 * control the scale of violins and boxes
	 * @function
	 * @private
	 * @name boxvio_chart_wrapper#_render_scale_sliders
	 */
	boxvio_chart_wrapper.prototype._render_scale_sliders = function () {
		// Container div
		const container_div = common.create_dom_element({
			element_type	: 'div',
			parent			: this._controls.sections.general.content_container,
			class_name		: 'control_panel_item scale_sliders',
			// style			: {
			// 	'display': 'flex',
			// 	'direction': 'flex-row',
			// 	'justify-content': 'space-between',
			// 	'align-items': 'center',
			// },
		});

		// Violin scale
		const violin_container_div = common.create_dom_element({
			element_type: 'div',
			parent: container_div,
			// style: {
			// 	'display': 'flex',
			// 	'gap': DEFAULT_FLEX_GAP,
			// },
		});
		const violin_scale_slider_id = `${this.id_string()}_violin_scale_slider`;
		const violin_scale_slider_label = common.create_dom_element({
			element_type: 'label',
			text_content: tstring.violin_width || 'Violin width',
			parent: violin_container_div,
			// style: {
			// 	'margin-block': 'auto',
			// },
		});
		violin_scale_slider_label.setAttribute('for', violin_scale_slider_id);
		/** @type {Element} */
		const violin_scale_slider = common.create_dom_element({
			element_type: 'input',
			type: 'range',
			id: violin_scale_slider_id,
			parent: violin_container_div,
		});
		violin_scale_slider.setAttribute('min', 0);
		violin_scale_slider.setAttribute('max', 1);
		violin_scale_slider.setAttribute('step', 0.05);
		violin_scale_slider.value = this._chart.violin_scale.initial;
		this._controls.scale.violin.slider = violin_scale_slider;
		this._controls.scale.violin.reset = common.create_dom_element({
			element_type	: 'button',
			type			: 'button',
			class_name		: 'small',
			text_content	: tstring.reset || 'Reset',
			parent			: violin_container_div
		});

		// Box scale
		const box_container_div = common.create_dom_element({
			element_type: 'div',
			parent: container_div,
			// style: {
			// 	'display': 'flex',
			// 	'gap': DEFAULT_FLEX_GAP,
			// },
		});
		const box_scale_slider_id = `${this.id_string()}_box_scale_slider`;
		const box_scale_slider_label = common.create_dom_element({
			element_type: 'label',
			text_content: tstring.box_width || 'Box width',
			parent: box_container_div,
			// style: {
			// 	'margin-block': 'auto',
			// },
		});
		box_scale_slider_label.setAttribute('for', box_scale_slider_id);
		/** @type {Element} */
		const box_scale_slider = common.create_dom_element({
			element_type: 'input',
			type: 'range',
			id: box_scale_slider_id,
			parent: box_container_div,
		});
		box_scale_slider.setAttribute('min', 0);
		box_scale_slider.setAttribute('max', 1);
		box_scale_slider.setAttribute('step', 0.05);
		box_scale_slider.value = this._chart.box_scale.initial;
		this._controls.scale.box.slider = box_scale_slider;
		this._controls.scale.box.reset = common.create_dom_element({
			element_type	: 'button',
			type			: 'button',
			class_name		: 'small',
			text_content	: tstring.reset || 'Reset',
			parent			: box_container_div,
		});
	};

	/**
	 * Render the control elements to change the number of bins
	 * @function
	 * @private
	 * @name boxvio_chart_wrapper#_render_n_bins_control
	 */
	boxvio_chart_wrapper.prototype._render_n_bins_control = function () {
		const container = common.create_dom_element({
			element_type	: 'div',
			parent			: this._controls.sections.specific.content_container,
			class_name		: 'control_panel_item n_bins_control'
			// style			: {
			// 	'display': 'flex',
			// 	'align-items': 'center',
			// 	'gap': DEFAULT_FLEX_GAP,
			// 	'margin-top': DEFAULT_MARGIN,
			// },
		});
		// Slider for n bins
		const violin_n_bins_slider_id = `${this.id_string()}_violin_n_bins_slider`;
		const violin_n_bins_label = common.create_dom_element({
			element_type	: 'label',
			text_content	: tstring.violin_resolution || 'Violin resolution',
			parent			: container
			// style: {'margin-block': 'auto'},
		});
		violin_n_bins_label.setAttribute('for', violin_n_bins_slider_id);
		const violin_n_bins_slider = common.create_dom_element({
			element_type	: 'input',
			type			: 'range',
			id				: violin_n_bins_slider_id,
			parent			: container
		});
		this._controls.violin_n_bins.slider = violin_n_bins_slider;
		violin_n_bins_slider.setAttribute('min', 2);
		violin_n_bins_slider.setAttribute(
			'max',
			this._controls.max_bins_multiplier
				* this._chart.n_bins[this._controls.selected_index].initial
		);
		violin_n_bins_slider.value = this._chart.n_bins[this._controls.selected_index].value;

		// Reset n bins
		this._controls.violin_n_bins.reset = common.create_dom_element({
			element_type	: 'button',
			type			: 'button',
			class_name		: 'small',
			text_content	: tstring.reset || 'Reset',
			parent			: container
		});

		// Reset all n bins
		this._controls.violin_n_bins.reset_all = common.create_dom_element({
			element_type	: 'button',
			type			: 'button',
			class_name		: 'small',
			text_content	: tstring.reset_all_violins || 'Reset all violins',
			parent			: container
		});
	};

	/**
	 * Defines control panel logic (change events and such)
	 * @function
	 * @private
	 * @name boxvio_chart_wrapper#_control_panel_logic
	 */
	boxvio_chart_wrapper.prototype._control_panel_logic = function () {
		// General section toggle
		this._controls.sections.general.title.addEventListener('click', () => {
			this._controls.sections.general.title.classList.toggle('opened');
			this._controls.sections.general.content_container.classList.toggle('hide');
		});

		// Grid mode select
		this._controls.grid_select.addEventListener('change', () => {
			const mode = this._controls.grid_select.value;
			this.apply_ygrid_mode(mode);
		});
		// X-tick label angle slider
		this._controls.xticklabel_angle_slider.addEventListener('input', () => {
			this._chart.xticklabel_angle = Number(this._controls.xticklabel_angle_slider.value);
			this.apply_xticklabel_angle();
		});
		// Violin curve selector
		this._controls.curve_select.addEventListener('change', () => {
			this.set_violin_curve(this._controls.curve_select.value);
		});
		// Show checkboxes
		this._controls.show_checkboxes.key2.addEventListener('change', () => {
			toggle_visibility(this._graphics.key2_dividers_g);
		});
		this._controls.show_checkboxes.violins.addEventListener('change', () => {
			toggle_visibility(this._graphics.violins_g);
		});
		this._controls.show_checkboxes.boxes.addEventListener('change', () => {
			toggle_visibility(this._graphics.boxes_g);
			// (DISABLED) Disable the checkbox for outliers (defined below)
			// show_outliers_checkbox.disabled = !show_boxes_checkbox.checked
		});
		this._controls.show_checkboxes.whiskers.addEventListener('change', () => {
			for (const whisker of this._graphics.whiskers) {
				toggle_visibility(whisker);
			}
			// (DISABLED) Disable the checkbox for outliers (defined below)
			// show_outliers_checkbox.disabled = !show_boxes_checkbox.checked
		});
		this._controls.show_checkboxes.outliers.addEventListener('change', () => {
			for (const group of this._graphics.outliers) {
				toggle_visibility(group);
			}
		});
		// Scale controls
		this._controls.scale.violin.slider.addEventListener('input', () => {
			this.set_violin_scale(Number(this._controls.scale.violin.slider.value));
		});
		this._controls.scale.violin.reset.addEventListener('click', () => {
			this._controls.scale.violin.slider.value = this._chart.violin_scale.initial;
			this.set_violin_scale(Number(this._controls.scale.violin.slider.value));
		});
		this._controls.scale.box.slider.addEventListener('input', () => {
			this.set_box_scale(Number(this._controls.scale.box.slider.value));
		});
		this._controls.scale.box.reset.addEventListener('click', () => {
			this._controls.scale.box.slider.value = this._chart.box_scale.initial;
			this.set_box_scale(Number(this._controls.scale.box.slider.value));
		});

		// Particular section toggle
		this._controls.sections.specific.title.addEventListener('click', () => {
			this._controls.sections.specific.title.classList.toggle('opened');
			this._controls.sections.specific.content_container.classList.toggle('hide');
		});
		// Violin n bins controls
		const violin_n_bins_slider = this._controls.violin_n_bins.slider;
		violin_n_bins_slider.addEventListener('input', () => {
			this.set_n_bins(this._controls.selected_index, Number(violin_n_bins_slider.value));
		});
		violin_n_bins_slider.addEventListener(GROUP_CHANGE_EVENT_NAME, () => {
			violin_n_bins_slider.setAttribute(
				'max',
				this._controls.max_bins_multiplier
					* this._chart.n_bins[this._controls.selected_index].initial
			);
			violin_n_bins_slider.value = this._chart.n_bins[this._controls.selected_index].value;
		});
		this._controls.violin_n_bins.reset.addEventListener('click', () => {
			violin_n_bins_slider.value = this._chart.n_bins[this._controls.selected_index].initial;
			this.set_n_bins(this._controls.selected_index, Number(violin_n_bins_slider.value));
		});
		this._controls.violin_n_bins.reset_all.addEventListener('click', () => {
			// Update the value of the slider
			violin_n_bins_slider.value = this._chart.n_bins[this._controls.selected_index].initial;
			for (const [i, n_bins] of this._chart.n_bins.entries()) {
				this.set_n_bins(i, n_bins.initial);
			}
		});
	};

	/**
	 * Clock diameter
	 * @type {number}
	 */
	const CLOCK_DIAMETER = 100;
	/**
	 * Clock radius
	 * @type {number}
	 */
	const CLOCK_RADIUS = CLOCK_DIAMETER / 2;
	/**
	 * Padding among clocks
	 * @type {number}
	 */
	const CLOCK_MARGIN = 6;
	/**
	 * Margin for the key2 label
	 * @type {[number, number]}
	 */
	const KEY2_MARGIN = [6, 15];
	/**
	 * Limit for the amount of characters displayed in the labels of key 2
	 * @type {number}
	 */
	const KEY2_LABEL_CHARACTER_LIMIT = 37;
	/**
	 * Height reserved for the key1 and id label
	 * @type {number}
	 */
	const LABEL_HEIGHT = 14;

	/**
	 * Clock chart
	 *
	 * Draws a clock (see minimal clock chart) for every provided group. Utilizes keyed data to draw labels
	 * and separators.
	 * 
	 * @param {Element} div_wrapper the div to work in
	 * @param {{
	 * 	id: string,
	 * 	key: string[],
	 * 	values: number[]
	 * }[]} data the input data 
	 * @param {Object} options configuration options
	 * @param {boolean} options.display_download whether to display the download panel (default `false`)
	 * @param {boolean} options.display_control_panel whether to display the control panel (default `false`)
	 * @param {boolean} options.overflow whether going beyond the width of the plot container is allowed (default `false`).
	 * 		if `false`, the svg will be stretched to fill the full width of its parent element
	 * @param {string} options.outer_height outer height of the plot, will be the height applied to the SVG (default `500px`)
	 * 		overflow must be enabled for outer_height to work
	 * @param {boolean} options.sort whether to sort the clocks (default `false`). When there is more than one key-2, sorting is mandatory.
	 * @param {(options: Object) => Promise<Element>} options.tooltip_callback called to fill the tooltip.
	 *  It takes an options object as argument and returns a Promise of an HTML element to add to the
	 * 	tooltip. The attributes of the options object come from the data and are determined by the
	 * `tooltip_callback_options_attributes` option
	 * @param {string[]} options.tooltip_callback_options_attributes list of datum attributes to include in the
	 * 	options object for the tooltip callback. If the callback is provided, this list MUST be provided as well
	 * @class
	 * @extends d3_chart_wrapper
	 */
	function clock_chart_wrapper(div_wrapper, data, options) {
		d3_chart_wrapper.call(this, div_wrapper, options);

		/**
		 * Called when the tooltip is shown to render extra info
		 * @private
		 * @type {(options: Object) => Promise<Element>}
		 */
		this._tooltip_callback = options.tooltip_callback || null;
		/**
		 * List of datum attributes to include in the options argument of the tooltip callback
		 * @private
		 * @type {string[]}
		 */
		this._tooltip_callback_options_attributes = options.tooltip_callback_options_attributes || null;
		const sort = options.sort || data[0].key.length > 1 || false;
		/**
		 * Input data
		 * @type {{
	 	 * 	id: string,
		 * 	key: string[],
		 * 	values: number[]
		 * }[]}
		 * @private
		 */
		this._data = sort
					 ? data.sort((a, b) => a.key.join().localeCompare(b.key.join()))
					 : data;
		/**
		 * Data manager (to handle keys)
		 * @type {keyed_data}
		 * @private
		 */
		this._kdm = new keyed_data(this._data);
		/**
		 * Available key2 values
		 * @type {string[]}
		 * @private
		 */
		this._key2_values = this._kdm.key_size > 1
			? this._kdm.key_values(2)
			: null;
		/**
		 * Full width of svg
		 * @private
		 * @type {number}
		 */
		this._width = this._compute_width();
		/**
		 * Full height of the svg
		 * @private
		 * @type {number}
		 */
		this._height = CLOCK_DIAMETER + LABEL_HEIGHT;
		/**
		 * Non-graphic components of the chart
		 * @private
		 * @type {{
		 * 	key2_start_x: {[key2: string]: number},
		 * 	datum_start_x: number[],
		 * 	tooltip_active: number
		 * }}
		 */
		this._chart = {};
		this._chart.key2_start_x = this._kdm.key_size > 1
			? this._compute_key2_start_x()
			: null;
		this._chart.datum_start_x = this._compute_datum_start_x();
		this._chart.tooltip_active = null;
		/**
		 * Graphic components of the chart
		 * @private
		 * @type {{
		 *  root_g: d3.selection,
		 * 	key2_dividers_g: d3.selection,
		 * 	datum_g: d3.selection,
		 * 	tooltip_div: d3.selection
		 * }}
		 */
	   	this._graphics = {
			// Root g tag (translated to the center of the svg)
			root_g: null,
			// g tag for the key2 dividers
			key2_dividers_g: null,
			// g tag for all datum (clock + label)
			datum_g: null,
			// div tag for tooltip
			tooltip_div: null
		};
	}
	// Set prototype chain
	Object.setPrototypeOf(clock_chart_wrapper.prototype, d3_chart_wrapper.prototype);

	/**
	 * Compute the full width of the SVG
	 * @private
	 * @returns {number} the full width of the SVG
	 */
	clock_chart_wrapper.prototype._compute_width = function () {
		const n = this._data.length;
		if (this._kdm.key_size == 1) {
			return CLOCK_DIAMETER * n + CLOCK_MARGIN * (n - 1)
		}
		// full width when there are Rank 2 key components
		let width = this._key2_values.length * d3.sum(KEY2_MARGIN) - KEY2_MARGIN[0];
		for (const key2_value of this._key2_values) {
			const n_groups = this._kdm.get_next_key_component_values([key2_value]).length;
			width += n_groups * CLOCK_DIAMETER + (n_groups - 1) * CLOCK_MARGIN;
		}
		return width
	};

	/**
	 * Compute starting points (in plot x-coordinates) for the different
	 * key2s. There we will draw the key2 labels and separating line
	 * @returns {{[key2: string]: number}} the starting position for each key2
	 */
	clock_chart_wrapper.prototype._compute_key2_start_x = function () {
		const positions = {};

		const key_tpls = this._kdm.get_key_templates(2);

		let current_x = 0;
		for (const key_tpl of key_tpls) {
			const queried_data = this._kdm.query(key_tpl);
			positions[key_tpl[key_tpl.length-2]] = current_x;
			// Increase current_x
			current_x += d3.sum(KEY2_MARGIN) + queried_data.length * CLOCK_DIAMETER
				+ (queried_data.length - 1) * CLOCK_MARGIN;
		}

		return positions
	};

	/**
	 * Compute starting points (in svg x-coordinates) for the datum (each population)
	 * @returns {number[]} the starting position for each datum
	 */
	clock_chart_wrapper.prototype._compute_datum_start_x = function () {
		if (this._kdm.key_size === 1) {
			return Array(this._data.length).map((_, i) => i*(CLOCK_MARGIN+CLOCK_DIAMETER))
		}
		// Key size is 2 (for now. Maybe in the future, greater than 2)
		const datum_start_x = [];
		// Start here for the first key2
		let current_x = KEY2_MARGIN[1];
		let current_key2 = this._data[0].key[this._kdm.key_size-2];
		for (const datum of this._data) {
			const key2 = datum.key[this._kdm.key_size-2];
			if (current_key2 !== key2) {
				current_key2 = key2;
				// Add space for the key2 margin, but remove extra clock margin
				current_x += d3.sum(KEY2_MARGIN) - CLOCK_MARGIN;
			}
			datum_start_x.push(current_x);
			current_x += CLOCK_DIAMETER + CLOCK_MARGIN;
		}
		return datum_start_x
	};

	/**
	 * Render the plot
	 * @function
	 * @protected
	 * @name clock_chart_wrapper#render_plot
	 */
	clock_chart_wrapper.prototype.render_plot = function () {
		d3_chart_wrapper.prototype.render_plot.call(this);

		// Set viewbox of svg
		this.svg.attr('viewBox', `0 0 ${this._width} ${this._height}`);

		// Hide tooltip when clicking in SVG or plot_container
		this.svg.on('click', (e) => {
			e.stopPropagation();
			this._hide_tooltip();
		});
		this.plot_container.addEventListener('click', (e) => {
			e.stopPropagation();
			this._hide_tooltip();
		});

		// Root g tag
		this._graphics.root_g = this.svg.append('g');

		// Render the graphics!
		if (this._kdm.key_size > 1) {
			this._render_key2_dividers();
		}
		this._graphics.datum_g = this._graphics.root_g.append('g');
		for (let i = 0; i < this._data.length; i++) {
			this._render_datum(i);
		}

		// Render tooltip
		this._render_tooltip();

	};

	/**
	 * Render the dividers for key2
	 * @function
	 * @private
	 * @name clock_chart_wrapper#_render_key2_dividers
	 */
	clock_chart_wrapper.prototype._render_key2_dividers = function () {
		this._graphics.key2_dividers_g = this._graphics.root_g.append('g');
		const dividers_g = this._graphics.key2_dividers_g;
		const color = 'gray';

		for (const [index, key2] of this._key2_values.entries()) {
			const x = this._chart.key2_start_x[key2];
			const key2_label = key2.length > KEY2_LABEL_CHARACTER_LIMIT
				? key2.substring(0, KEY2_LABEL_CHARACTER_LIMIT-3) + '...'
				: key2;
			const divider_g = dividers_g.append('g')
				.attr('transform', `translate(${x},0)`);
			// divider_g.append('rect')
			// 	.attr('x', 0)
			// 	.attr('height', this._height)
			// 	.attr('width', KEY2_MARGIN[1])
			// 	.style('fill', 'none')
			// 	.style('stroke', 'red')
			// 	.style('stroke-width', 0.5)
			divider_g.append('line')
				.attr('x1', 0)
				.attr('y1', 0)
				.attr('x2', 0)
				.attr('y2', this._height)
				.attr('stroke', color)
				.attr('stroke-width', 0.9)
				.attr('stroke-dasharray', this._height/35);
			divider_g.append('text')
				.attr('text-anchor', 'end')
				.attr('transform', 'rotate(-90)')
				.attr('y', '1.3em')  // This is the horizontal axis now
				.attr('x', '-0.6em')  // This is the vertical axis now
				.attr('font-size', '0.3em')
				.attr('fill', color)
				.text(key2_label);
		}
	};

	/**
	 * Render a clock and its label
	 * @function
	 * @private
	 * @name clock_chart_wrapper#_render_datum
	 * @param {number} i the index of the datum to render
	 */
	clock_chart_wrapper.prototype._render_datum = function (i) {
		const datum = this._data[i];
		const g = this._graphics.datum_g.append('g')
			.attr('transform', `translate(${this._chart.datum_start_x[i]},0)`);
		this._render_handles(g, i, datum);
		this._render_label(g, datum);
	};

	/**
	 * Render the clock handles
	 * @function
	 * @private
	 * @name clock_chart_wrapper#_render_handles
	 * @param {d3.selection} container_g the container g tag
	 * @param {number} i the index of the datum
	 * @param {{
	 * 	id: string,
	 * 	key: string[],
	 * 	values: number[]
	 * }} datum the datum
	 */
	clock_chart_wrapper.prototype._render_handles = function (container_g, i, datum) {
		// container_g.append('rect')
		// 	.attr('x', 0)
		// 	.attr('height', CLOCK_DIAMETER)
		// 	.attr('width', CLOCK_DIAMETER)
		// 	.style('fill', 'none')
		// 	.style('stroke', 'blue')
		// 	.style('stroke-width', 0.5)
		const values = datum.values;
		const delta = 2*Math.PI/values.length;
		let angle = Math.PI/2;
		const max_value = d3.max(values);
		const scale = d3.scaleLinear()
			.domain([0, max_value])
			.range([0, CLOCK_RADIUS]);
		const g = container_g.append('g')
			.attr('transform', `translate(${CLOCK_RADIUS},${CLOCK_RADIUS})`);
		for (const value of values) {
			const handle_g = g.append('g');
			handle_g.append('line')
				.attr('x1', 0)
				.attr('y1', 0)
				.attr('x2', CLOCK_RADIUS*Math.cos(angle))
				.attr('y2', -CLOCK_RADIUS*Math.sin(angle))  // Mirror vertically!
				.attr('stroke', '#e3e3e3')
				.attr('stroke-width', 0.6);
			handle_g.append('line')
				.attr('x1', 0)
				.attr('y1', 0)
				.attr('x2', scale(value)*Math.cos(angle))
				.attr('y2', -scale(value)*Math.sin(angle))  // Mirror vertically!
				.attr('stroke', 'black')
				.attr('stroke-width', 1);
			angle -= delta;
		}
		const circle = g.append('circle')
			.style('fill', 'black')
			.attr('r', 2.5);
		if (this._tooltip_callback) {
			circle.classed('clickable', true);
			circle.on('click', (e) => {
				e.stopPropagation();
				if (this._chart.tooltip_active === i) {
					return
				}
				this.tooltip_show(datum);
				this._graphics.tooltip_div.style('display', 'flex');
				this._chart.tooltip_active = i;
			});
		}
	};


	/**
	 * Render the clock label
	 * @function
	 * @private
	 * @name clock_chart_wrapper#_render_label
	 * @param {d3.selection} container_g the container g tag
	 * @param {{
	 * 	id: string,
	 * 	key: string[],
	 * 	values: number[]
	 * }} datum the datum
	 */
	clock_chart_wrapper.prototype._render_label = function (container_g, datum) {
		// container_g.append('rect')
		// 	.attr('x', 0)
		// 	.attr('y', CLOCK_DIAMETER)
		// 	.attr('height', LABEL_HEIGHT)
		// 	.attr('width', CLOCK_DIAMETER)
		// 	.style('fill', 'none')
		// 	.style('stroke', 'green')
		// 	.style('stroke-width', 0.5)
		const g = container_g.append('g')
			.attr('transform', `translate(${CLOCK_RADIUS},${CLOCK_DIAMETER})`);
		const key1 = datum.key[this._kdm.key_size-1];
		datum.id;
		g.append('text')
			.attr('text-anchor', 'middle')
			.attr('y', '1.5em')
			.attr('font-size', '0.25em')
			.attr('fill', 'black')
			.text(key1);
		g.append('text')
			.attr('text-anchor', 'middle')
			.attr('y', '3.2em')
			.attr('font-size', '0.2em')
			.attr('fill', 'black')
			.text(`(${d3.sum(datum.values)})`);
	};

	/**
	 * Hide the tooltip
	 * @function
	 * @private
	 * @name clock_chart_wrapper#_hide_tooltip
	 */
	clock_chart_wrapper.prototype._hide_tooltip = function () {
		this._graphics.tooltip_div.style('display', 'none');
		this._chart.tooltip_active = null;
	};

	/**
	 * Add the tooltip to the DOM
	 * @function
	 * @private
	 * @name clock_chart_wrapper#_render_tooltip
	 */
	clock_chart_wrapper.prototype._render_tooltip = function () {
		const tooltip_element = common.create_dom_element({
			element_type	: 'div',
			id				: `${this.id_string()}_tooltip_div`,
			class_name		: 'o-red tooltip_div'
		});
		insert_after(tooltip_element, this.plot_container);
		this._graphics.tooltip_div = d3.select(tooltip_element);
		// Hide tooltip in the beginning
		this._hide_tooltip();
	};

	/**
	 * Set the tooltip to visible
	 * @param {{
	 * 	id: string,
	 * 	key: string[],
	 * 	values: number[]
	 * }} datum the datum
	 * @function
	 * @name clock_chart_wrapper#tooltip_show
	 */
	clock_chart_wrapper.prototype.tooltip_show = function (datum) {
		const self = this;

		const options = {};
		for (const attr_name of this._tooltip_callback_options_attributes) {
			options[attr_name] = datum[attr_name];
		}
		self._tooltip_callback(options)
			.then((ele) => {
				const tooltip_element = self._graphics.tooltip_div.node();
				ele.id = `${self.id_string()}_tooltip_callback_div`;
				ele.classList.add(
					'tooltip_callback_div'
				);
				tooltip_element.replaceChildren(
					ele
				);
			});
	};

	/**
	 * @fileoverview Analysis module for MIB project.
	 * Handles the generation of charts (weight, diameter, clock)
	 * based on coin catalog data filtered via a user-facing search form.
	 *
	 * @module analysis
	 *
	 * @example
	 * // Basic setup
	 * import { analysis } from './tpl/analysis/js/analysis.js';
	 *
	 * analysis.set_up({
	 *   area_name: 'catalog_analysis',
	 *   form_items_container: document.getElementById('form_container'),
	 *   weight_chart_container: document.getElementById('weight_chart'),
	 *   // ... other containers
	 * });
	 */




	/**
	 * Default color when Dedalo API does not provide one.
	 * @type {string}
	 */
	const DEFAULT_COLOR = '#1f77b4';


	/**
	 * Main analysis controller object.
	 * Integrates analysis functions and manages the UI for data filtering and visualization.
	 */
	const analysis =  {

		/**
		 * Form factory instance used to build the search interface.
		 * @type {form_factory|null}
		 */
		form: null,

		/**
		 * Form submit button element.
		 * @type {HTMLButtonElement|null}
		 */
		submit_button : null,

		/**
		 * Area name for the current context.
		 * @type {string|null}
		 */
		area_name : null,

		/**
		 * Current row data if applicable.
		 * @type {Object|null}
		 */
		row : null,

		// DOM containers
		/** @type {HTMLElement|null} Container for data export controls. */
		export_data_container				: null,
		/** @type {HTMLElement|null} Container where the form items are rendered. */
		form_items_container				: null,
		/** @type {HTMLElement|null} Container for the weight distribution chart. */
		weight_chart_container				: null,
		/** @type {HTMLElement|null} Container for the diameter distribution chart. */
		diameter_chart_container			: null,
		/** @type {HTMLElement|null} Container for the chronological/clock chart. */
		clock_chart_container				: null,

		/**
		 * Chart wrapper instance for weight
		 * @type {chart_wrapper}
		 */
		weight_chart_wrapper: null,
		/**
		 * Chart wrapper instance for diameter
		 * @type {chart_wrapper}
		 */
		diameter_chart_wrapper: null,
		/**
		 * Chart wrapper instance for clock
		 * @type {chart_wrapper}
		 */
		clock_chart_wrapper: null,

		/**
		 * Initializes the analysis module by setting up DOM containers,
		 * loading denomination colors, and rendering the search form.
		 *
		 * @param {Object} options - Configuration options for the module.
		 * @param {string} options.area_name - Name of the current working area.
		 * @param {HTMLElement} options.export_data_container - Container for export buttons.
		 * @param {Object} options.row - Current record data.
		 * @param {HTMLElement} options.form_items_container - Target container for the form.
		 * @param {HTMLElement} options.weight_chart_container - Target container for the weight chart.
		 * @param {HTMLElement} options.diameter_chart_container - Target container for the diameter chart.
		 * @param {HTMLElement} options.clock_chart_container - Target container for the clock chart.
		 * @returns {boolean} Returns true if setup was initiated successfully.
		 */
		set_up : function(options) {

			const self = this;

			// options
				self.area_name							= options.area_name;
				self.export_data_container				= options.export_data_container;
				self.row								= options.row;
				self.form_items_container				= options.form_items_container;
				self.weight_chart_container				= options.weight_chart_container;
				self.diameter_chart_container			= options.diameter_chart_container;
				self.clock_chart_container				= options.clock_chart_container;

			// form
				const form_node = self.render_form();
				self.form_items_container.appendChild(form_node);

			// first auto search
			setTimeout(() => {
				self.auto_search();
			}, 100);

			return true
		},//end set_up

		/**
		 * Executes a first search with a random mint automatically.
		 */
		auto_search : async function() {

			const self = this;

			// request possible mint values from catalog
			const request_body = {
				dedalo_get	: 'records',
				table		: 'catalog',
				ar_fields	: ['p_mint'],
				limit		: 50,
				group		: 'p_mint'
			};

			const api_response = await data_manager.request({
				body : request_body
			});

			if(SHOW_DEBUG) {
				console.log('auto_search API calll api_response', api_response);
			}

			if (api_response.result && api_response.result.length > 0) {
				// filter results to get valid mint names
				const mints = api_response.result
					.map(r => {
						try {
							return (typeof r.p_mint === 'string') ? JSON.parse(r.p_mint) : r.p_mint
						} catch(e) {
							return null
						}
					})
					.filter(val => Array.isArray(val) && val.length > 0)
					.map(val => val[0]);

				if (mints.length > 0) {
					// pick a random mint
					const random_mint = mints[Math.floor(Math.random() * mints.length)];
					// find mint form item and set its value
					const mint_item = self.form.form_items['mint'];
					if (mint_item) {
						mint_item.node_input.value = random_mint;
						mint_item.q = random_mint;

						// trigger input event to update floating label
						mint_item.node_input.dispatchEvent(new Event('input'));
						// trigger blur event to ensure label is positioned correctly
						mint_item.node_input.dispatchEvent(new Event('blur'));

						// auto-submit search
						self.form_submit();
					}
				}
			}
		},

		/**
		 * Renders the search form using the `form_factory`.
		 * Configures multiple input fields like Mint, Number, Material, Denomination,
		 * Culture, Iconography, and a Period range slider with auto-complete functionality.
		 *
		 * @returns {HTMLFormElement} The constructed form element.
		 */
		render_form : function() {

			const self = this;

			// DocumentFragment is like a virtual DOM
			const fragment = new DocumentFragment();

			// form_factory instance
				self.form = self.form || new form_factory();

			const form_row = common.create_dom_element({
				element_type	: "div",
				class_name		: "form-row fields",
				parent			: fragment
			});

			// mint
				self.form.item_factory({
					id				: "mint",
					name			: "mint",
					label			: tstring.mint || "mint",
					q_column		: "p_mint",
					value_wrapper	: ['["', '"]'], // to obtain ["value"] in selected value only
					eq				: "LIKE",
					eq_in			: "%",
					eq_out			: "%",
					is_term			: true,
					parent			: form_row,
					callback		: function(form_item) {
						self.form.activate_autocomplete({
							form_item	: form_item,
							table		: 'catalog'
						});
					}
				});

			// number
				self.form.item_factory({
					id 			: "number",
					name 		: "number",
					q_column 	: "term",
					q_table 	: "types",
					label		: tstring.number_key || "Number & Key",
					is_term 	: false,
					parent		: form_row,
					group_op 	: '$or',
					callback	: function(form_item) {
						self.form.activate_autocomplete({
							form_item	: form_item,
							table		: 'catalog'
						});
					}
				});

			// material
				self.form.item_factory({
					id 			: "material",
					name 		: "material",
					q_column 	: "ref_type_material",
					q_table 	: "any",
					label		: tstring.material || "material",
					is_term 	: false,
					parent		: form_row,
					callback	: function(form_item) {
						self.form.activate_autocomplete({
							form_item	: form_item,
							table		: 'catalog'
						});
					}
				});

			// denomination
				self.form.item_factory({
					id 			: "denomination",
					name 		: "denomination",
					q_column 	: "ref_type_denomination",
					q_table 	: "any",
					label		: tstring.denomination || "denomination",
					is_term 	: false,
					parent		: form_row,
					callback	: function(form_item) {
						self.form.activate_autocomplete({
							form_item	: form_item,
							table		: 'catalog'
						});
					}
				});

			// culture
				self.form.item_factory({
					id				: "culture",
					name			: "culture",
					label			: tstring.culture || "culture",
					q_column		: "p_culture",
					value_wrapper	: ['["','"]'], // to obtain ["value"] in selected value only
					eq_in			: "%",
					eq_out			: "%",
					is_term			: true,
					parent			: form_row,
					callback		: function(form_item) {
						self.form.activate_autocomplete({
							form_item	: form_item,
							table		: 'catalog'
						});
					}
				});

			// iconography_obverse
				self.form.item_factory({
					id				: "iconography_obverse",
					name			: "iconography_obverse",
					label			: tstring.iconography_obverse || "iconography obverse",
					q_column		: "ref_type_design_obverse_iconography",
					value_split		: ' | ',
					q_splittable	: true,
					q_selected_eq	: 'LIKE',
					eq_in			: "%",
					eq_out			: "%",
					// q_table		: "ts_period",
					is_term			: false,
					parent			: form_row,
					callback	: function(form_item) {
						self.form.activate_autocomplete({
							form_item	: form_item,
							table		: 'catalog'
						});
					}
				});

			// iconography_reverse
				self.form.item_factory({
					id				: "iconography_reverse",
					name			: "iconography_reverse",
					label			: tstring.iconography_reverse || "iconography reverse",
					q_column		: "ref_type_design_reverse_iconography",
					value_split		: ' | ',
					q_splittable	: true,
					q_selected_eq	: 'LIKE',
					eq_in			: "%",
					eq_out			: "%",
					// q_table		: "ts_period",
					is_term			: false,
					parent			: form_row,
					callback		: function(form_item) {
						self.form.activate_autocomplete({
							form_item	: form_item,
							table		: 'catalog'
						});
					}
				});

			// range slider date (range_slider) (!) WORKING HERE
				self.form.item_factory({
					id			: "range_slider",
					name		: "range_slider",
					input_type	: 'range_slider',
					label		: tstring.period || "Period",
					class_name	: 'range_slider',
					q_column	: "ref_date_in,ref_date_end",
					// eq		: "LIKE",
					// eq_in	: "",
					// eq_out	: "%",
					// q_table	: "catalog",
					sql_filter	: null,
					parent		: form_row,
					callback	: function(form_item) {

						// const form_item				= this
						const node_input				= form_item.node_input;
						const range_slider_value_in		= node_input.parentNode.querySelector('#range_slider_in');
						const range_slider_value_out	= node_input.parentNode.querySelector('#range_slider_out');

						/**
						 * Configures and initializes the jQuery UI range slider for period filtering.
						 * Fetches the available year range from the catalog and updates the UI inputs.
						 */
						function set_up_slider() {

							// compute range years
							self.get_catalog_range_years()
							.then(function(range_data){
								if(SHOW_DEBUG===true) {
									console.log('---> range_data', range_data);
								}

								// destroy current slider instance if already exists
									if ($(node_input).slider("instance")) {
										$(node_input).slider("destroy");
									}

								// reset filter
									form_item.sql_filter = null;

								// set inputs values from database
									range_slider_value_in.value	= range_data.min;
									range_slider_value_in.addEventListener("change",function(e){
										const value = (e.target.value>=range_data.min)
											? e.target.value
											: range_data.min;
										$(node_input).slider( "values", 0, value );
										e.target.value = value;
									});
									range_slider_value_out.value = range_data.max;
									range_slider_value_out.addEventListener("change",function(e){
										const value = (e.target.value<=range_data.max)
											? e.target.value
											: range_data.max;
										$(node_input).slider( "values", 1, e.target.value );
										e.target.value = value;
									});

								// active jquery slider
									$(node_input).slider({
										range	: true,
										min		: range_data.min,
										max		: range_data.max,
										step	: 1,
										values	: [ range_data.min, range_data.max ],
										slide	: function( event, ui ) {
											// update input values on user drag slide points
											range_slider_value_in.value	 = ui.values[0];
											range_slider_value_out.value = ui.values[1];
											if (SHOW_DEBUG === true) ;
										},
										change: function( event, ui ) {
											// update form_item sql_filter value on every slider change
											form_item.sql_filter = "(ref_date_in >= " + ui.values[0] + " AND ref_date_in <= "+ui.values[1]+")"; // AND (ref_date_end <= " + ui.values[1] + " OR ref_date_end IS NULL)
											form_item.q = ui.value;
											if (SHOW_DEBUG === true) ;
										}
									});
							});
						}

						// initial_map_loaded event (triggered on initial map data is ready)
						// event_manager.subscribe('initial_map_loaded', set_up_slider)
						set_up_slider();
					}
				});

			// submit button
				const submit_group = common.create_dom_element({
					element_type	: "div",
					class_name		: "form-group field button_submit",
					parent			: fragment
				});
				self.submit_button = common.create_dom_element({
					element_type	: "input",
					type			: "submit",
					id				: "submit",
					value			: tstring.search || "Search",
					class_name		: "btn btn-light btn-block primary",
					parent			: submit_group
				});
				self.submit_button.addEventListener("click", function (e) {
					e.preventDefault();
					self.form_submit(form);
				});

			// reset button
				const reset_button = common.create_dom_element({
					element_type	: "input",
					type			: "button",
					id				: "button_reset",
					value			: tstring.reset || 'Reset',
					class_name		: "btn btn-light btn-block secondary button_reset",
					parent			: submit_group
				});
				reset_button.addEventListener("click", function (e) {
					e.preventDefault();
					window.location.replace(window.location.pathname);
				});

			// operators
				// fragment.appendChild( forms.build_operators_node() )
				const operators_node = self.form.build_operators_node();
				fragment.appendChild( operators_node );

			// the form element itself!
				const form = common.create_dom_element({
					element_type	: "form",
					id				: "search_form",
					class_name		: "form-inline"
				});
				form.appendChild(fragment);


			return form
		},//end render_form

		/**
		 * Handles form submission and search execution.
		 * 1. Collects and builds filters from form items.
		 * 2. Cleans up previous results and UI state (show/hide sections, clear charts).
		 * 3. Executes API request for catalog rows.
		 * 4. Processes the results into datasets for weights, diameters, axes.
		 * 5. Instantiates and renders chart wrappers for each data category.
		 *
		 * @param {Object} form_obj - The form element or object (reserved for future use).
		 * @param {Object} [options={}] - Optional parameters.
		 * @param {boolean} [options.scroll_result=true] - Whether to scroll to results after search.
		 * @param {Object[]} [options.form_items] - Custom form items to use for filter building.
		 * @returns {Promise<Object[]>} A promise that resolves with the parsed and processed search data.
		 */
		form_submit : function(form_obj, options={}) {

			const self = this;

			// options
				typeof options.scroll_result==="boolean" ? options.scroll_result : true;
				const form_items	= options.form_items || self.form.form_items;

			// build filter
				const filter = self.form.build_filter({
					form_items: form_items
				});

			// empty filter case
				if (!filter || filter.length<1) {
					return false
				}

			// loading
				// cleanup html
					const section_container = {
						weight: document.getElementById('weight_section'),
						diameter: document.getElementById('diameter_section'),
						clock: document.getElementById('clock_section')
					};
					for (const [sec_name, container] of Object.entries(section_container)) {
						container.classList.add('hide');
					}
					self.diameter_chart_container.replaceChildren();
					self.weight_chart_container.replaceChildren();
					self.clock_chart_container.replaceChildren();
					// while (self.diameter_chart_container.hasChildNodes()) {
					// 	self.diameter_chart_container.removeChild(self.diameter_chart_container.lastChild);
					// }
					// while (self.weight_chart_container.hasChildNodes()) {
					// 	self.weight_chart_container.removeChild(self.weight_chart_container.lastChild);
					// }
					// while (self.clock_chart_container.hasChildNodes()) {
					// 	self.clock_chart_container.removeChild(self.clock_chart_container.lastChild);
					// }
				// spinner
					const result = document.getElementById('result');
					const spinner = common.create_dom_element({
						element_type	: 'div',
						class_name		: 'spinner',
						parent			: result
					});

			// scroll to head result
				// if (scroll_result) {
					// result.scrollIntoView(
					// 	{behavior: "smooth", block: "start", inline: "nearest"}
					// );
				// }

			// search rows exec against API
				const js_promise = self.search_rows({
					filter			: filter,
					limit			: 0,
					process_result	: {
						fn		: 'process_result::add_parents_and_children_recursive',
						columns	: [{name : "parents"}]
					}
				})
				.then((parsed_data)=>{
					if(SHOW_DEBUG===true) {
						console.log('---> parsed_data', parsed_data);
					}

					event_manager.publish('form_submit', parsed_data);

					// data
						const data = [];
						for (const [i, ele] of parsed_data.entries()) {
							// get section_id to be the key referent to search data again.
							const section_id				= ele.section_id;

							const number_key				= ele.ref_type_number ? ele.ref_type_number : `Missing Number & Key (${i})`; // Why need to change the name???? MR POTATOE !!!!!!!!
							const mint						= ele.p_mint ? ele.p_mint[0] : `Missing mint (${ele.section_id})`;
							const material					= ele.ref_type_material ? ele.ref_type_material : `Missing material (${i})`;
							const denomination				= ele.ref_type_denomination ? ele.ref_type_denomination : `Missing denomination ${i}`;
							const color						= normalize_color(ele.ref_type_denomination_color, DEFAULT_COLOR);
							if (SHOW_DEBUG === true) ;
							// if (!['12', '59', '62', '18','11a','14'].includes(name)) continue
							// if (!['59', '62'].includes(name)) continue
							const tmp_data		= {};

							const calculable	= ele.full_coins_reference_calculable;
							const discard		= ele.full_coins_reference_discard || [];// discard use true, false and null, null is interpreted as true.
							const diameter_max	= ele.full_coins_reference_diameter_max;
							const diameter_min	= ele.full_coins_reference_diameter_min;
							const weight		= ele.full_coins_reference_weight;
							const axis			= ele.full_coins_reference_axis;

							if (diameter_max && diameter_max.length) {
								const tmp_diameter_max = diameter_max.filter((v, i) => v && calculable[i] && discard[i]!==false);
								if (tmp_diameter_max.length) {
									tmp_data.diameter_max = tmp_diameter_max;
								}
							}
							if (diameter_min && diameter_min.length) {
								const tmp_diameter_min = diameter_min.filter((v, i) => v && calculable[i] && discard[i]!==false);
								if (tmp_diameter_min.length) {
									tmp_data.diameter_min = tmp_diameter_min;
								}
							}
							if (weight && weight.length) {
								const tmp_weight = weight.filter((v, i) => v && calculable[i] && discard[i]!==false);
								if (tmp_weight.length) {
									tmp_data.weight = tmp_weight;
								}
							}
							if (axis && axis.length) {
								const tmp_axis = axis.filter((v) => v);
								if (tmp_axis.length) {
									tmp_data.axis = tmp_axis;
								}
							}
							if (Object.keys(tmp_data).length) {
								tmp_data.section_id 				= section_id;
								tmp_data.number_key					= number_key;
								tmp_data.mint						= mint;
								tmp_data.type_number				= number_key; //type number is and will be type number! Raspa said.
								tmp_data.material					= material;
								tmp_data.denomination				= denomination;
								tmp_data.color						= color;
								data.push(tmp_data);
							}
						}

					// Weights
					const weights = data.filter( (ele) => ele.weight ).map( (ele) => {
							return {
								key			: [ele.mint, ele.number_key],
								values		: ele.weight,
								id			: ele.section_id,
								mint		: ele.mint,
								type_number	: ele.number_key,
								color		: ele.color
							}
						}
					);

					// Diameters
					const diameters = data.filter( (ele) => ele.diameter_max ).map(
						(ele) => {
							return {
								key			: [ele.mint, ele.number_key],
								values		: ele.diameter_max,
								id			: ele.section_id,
								mint		: ele.mint,
								type_number	: ele.number_key,
								color		: ele.color
							}
						}
					);

					// Axes
					const axes = data.filter( (ele) => ele.axis && ele.axis.length).map(
						(ele) => {
							const axis = Array(12).fill(0);
							for (const hour of ele.axis) {
								axis[hour % 12]++;
							}
							return {
								key			: [ele.mint, ele.number_key],
								values		: axis,
								id			: ele.section_id,
								mint		: ele.mint,
								type_number	: ele.number_key
							}
						}
					);

					// Reference calculable. Filter result rows with full_coins_reference_calculable data.
					parsed_data.filter( el => {
						return el.full_coins_reference_calculable && el.full_coins_reference_calculable.length > 0
					});

					spinner.remove();

					if (weights.length) {
						section_container.weight.classList.remove('hide');
						this.weight_chart_wrapper = new boxvio_chart_wrapper(
							this.weight_chart_container,
							weights,
							[tstring.mint || 'Mint', tstring.number || 'Number'],
							{
								whiskers_quantiles					: [10, 90],
								ylabel								: tstring.weight || 'Weight',
								overflow							: true,
								display_control_panel				: true,
								display_download					: true,
								sort_xaxis							: true,
								tooltip_callback					: type_tooltip_callback,
								tooltip_callback_options_attributes	: ['id', 'type_number', 'mint']
							}
						);
						this.weight_chart_wrapper.render();
					}

					if (diameters.length) {
						section_container.diameter.classList.remove('hide');
						this.diameter_chart_wrapper = new boxvio_chart_wrapper(
							this.diameter_chart_container,
							diameters,
							[tstring.mint || 'Mint', tstring.number || 'Number'],
							{
								whiskers_quantiles					: [10, 90],
								ylabel								: tstring.diameter || 'Diameter',
								overflow							: true,
								display_control_panel				: true,
								display_download					: true,
								sort_xaxis							: true,
								tooltip_callback					: type_tooltip_callback,
								tooltip_callback_options_attributes	: ['id', 'type_number', 'mint']
							}
						);
						this.diameter_chart_wrapper.render();
					}

					if (axes.length) {
						section_container.clock.classList.remove('hide');
						this.clock_chart_wrapper = new clock_chart_wrapper(
							this.clock_chart_container,
							axes,
							{
								overflow							: true,
								outer_height						: '300px',
								display_download					: true,
								sort								: true,
								tooltip_callback					: type_tooltip_callback,
								tooltip_callback_options_attributes	: ['id', 'type_number', 'mint']
							}
						);
						this.clock_chart_wrapper.render();
					}
				});


			return js_promise
		},

		/**
		 * Performs a search in the catalog records.
		 * @param {Object} options - Search options.
		 * @param {Object} [options.filter] - Search filter.
		 * @param {Array<string>} [options.ar_fields=['*']] - Fields to retrieve.
		 * @param {string} [options.order='norder ASC'] - Sort order.
		 * @param {number} [options.limit=100] - Result limit.
		 * @returns {Promise<Array<Object>>} A promise that resolves to the parsed catalog data.
		 */
		search_rows : function(options) {

			const self = this;

			// sort vars
				const filter			= options.filter || null;
				const ar_fields			= options.ar_fields || ["*"];
				const order				= options.order || "norder ASC";
				const lang				= page_globals.WEB_CURRENT_LANG_CODE;
				const process_result	= options.process_result || null;
				const limit				= options.limit != undefined
											? options.limit
											: 100;

			return new Promise(function(resolve){
				// parse_sql_filter
					const group = [];
				// parsed filters
					const sql_filter = self.form.parse_sql_filter(filter);
				// request
					const request_body = {
						dedalo_get		: 'records',
						table			: 'catalog',
						ar_fields		: ar_fields,
						lang			: lang,
						sql_filter		: sql_filter,
						limit			: limit,
						group			: (group.length>0) ? group.join(",") : null,
						count			: false,
						order			: order,
						process_result	: process_result
					};

					if(SHOW_DEBUG) {
						console.log('search_rows request_body', request_body);
					}

					data_manager.request({
						body : request_body
					})
					.then((response)=>{

						// data parsed
						const data = page.parse_catalog_data(response.result);

						resolve(data);
					});
			})
		},

		/**
		 * Retrieves the minimum and maximum year range from the catalog.
		 * @returns {Promise<{min: number, max: number}>}
		 */
		get_catalog_range_years : function() {

			return new Promise(function(resolve){

				const ar_fields = ['id','section_id','MIN(ref_date_in + 0) AS min','MAX(ref_date_in + 0) AS max'];

				const request_body = {
					dedalo_get		: 'records',
					db_name			: page_globals.WEB_DB,
					lang			: page_globals.WEB_CURRENT_LANG_CODE,
					table			: 'catalog',
					ar_fields		: ar_fields,
					limit			: 0,
					count			: false,
					offset			: 0,
					order			: 'id ASC'
				};
				data_manager.request({
					body : request_body
				})
				.then(function(api_response){
					if (SHOW_DEBUG === true) ;

					let min = 0;
					let max = 0;
					if (api_response.result) {
						for (let i = 0; i < api_response.result.length; i++) {
							const row = api_response.result[i];
							const current_min = parseInt(row.min);
							if (min===0 || current_min<min) {
								min = current_min;
							}
							const current_max = parseInt(row.max);
							// if (current_max>min) {
								max = current_max;
							// }
						}
					}

					const data = {
						min : min,
						max : max
					};

					resolve(data);
				});
			})
		}, //end get_catalog_range_years

	};//end analysis


	/**
	 * Callback for tooltip rendering in violin-boxplot visualizations.
	 * Fetches additional catalog data for a specific type and returns its rendered representation.
	 * @param {Object} options - Tooltip options.
	 * @param {string} options.id - Section ID of the record.
	 * @param {string} options.type_number - Type number string.
	 * @param {string} options.mint - Mint name.
	 * @returns {Promise<Element>} The DOM element representing the tooltip content.
	 * @example
	 * // Often used as a callback passed to a chart wrapper
	 * const tooltipHtml = await type_tooltip_callback({ id: '123', type_number: 'Ref 1', mint: 'Roma' });
	 */
	async function type_tooltip_callback(options) {
		if(SHOW_DEBUG===true) {
			console.warn('---> type_tooltip_callback options', options);
		}
		const section_id	= options.id;
		const type_number	= options.type_number;
		const mint			= options.mint;

		// CALL DEDALO API TO OBTAIN INFO
		// const sql_filter =
		// 	`(\`p_mint\` = '["${mint}"]' AND \`p_mint\` != '')`
		// 	+ `AND (\`term\` LIKE '${number}%' AND \`term\` != '')`
		const catalog_ar_fields = ['*'];

		const catalog_request_options = {
			dedalo_get	: 'records',
			lang		: page_globals.WEB_CURRENT_LANG_CODE,
			table		: 'catalog',
			ar_fields	: catalog_ar_fields,
			// sql_filter	: sql_filter,
			section_id 	: section_id, // unique id for the selected all data of the type
			limit		: 1,
			count		: false,
			// order	: "norder ASC"
		};

		const api_response = await data_manager.request({
			body : catalog_request_options
		});

		if (SHOW_DEBUG === true) {
			console.warn('---> type_tooltip_callback api_response', api_response);
		}

		const type_data = api_response.result || null;

		if (!type_data) {
			return common.create_dom_element({
				element_type: 'div',
				text_content: `Could not find number ${type_number} for mint ${mint} in the database.`
			})
		}
		const type_row = page.parse_catalog_data(type_data)[0];

		// set true to render material and denomination
		type_row.add_denomination = true;

		// CREATE THE RESULTING HTML Element
		// type_row.render_material	= true
		const type_node = catalog_row_fields.draw_item(type_row);

		if(type_node) {
			// Remove style of coins images container, since it is hardcoded to 124mm
			type_node.getElementsByClassName('coins_images')[0].removeAttribute('style');
		}


		return type_node
	}

	exports.analysis = analysis;
	exports.type_tooltip_callback = type_tooltip_callback;

	return exports;

})({});
//# sourceMappingURL=analysis-min.js.map
