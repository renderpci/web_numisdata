var type_row_fields_min = (function (exports) {
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
	 * Minimal boxplot + violin chart wrapper, containing only a vertical axis without label
	 * and the box + violin drawing
	 * 
	 * @class
	 * @extends d3_chart_wrapper
	 * @param {Element} div_wrapper 
	 * @param {number[]} data 
	 * @param {Object} options
	 * @param {boolean} options.display_download whether to display the download panel (default `false`)
	 * @param {boolean} options.display_control_panel whether to display the control panel (default `false`)
	 * @param {boolean} options.overflow whether going beyond the width of the plot container is allowed (default `false`).
	 * 		if `false`, the svg will be stretched to fill the full width of its parent element
	 * @param {string} options.color color for the box in the plot (default: gets the first color in the default color palette)
	 * @param {string} options.outer_height outer height of the plot, will be the height applied to the SVG (default `500px`)
	 * 		overflow must be enabled for outer_height to work
	 * @param {[number, number]} options.whiskers_quantiles overrides default behavior of the whiskers
	 * 		by specifying the quantiles of the lower and upper
	 */
	function minimal_boxvio_chart_wrapper(div_wrapper, data, options) {
		d3_chart_wrapper.call(this, div_wrapper, options);

		/**
		 * The color for the box in the plot
		 * @type {string}
		 */
		this._color = options.color || COLOR_PALETTE[0];
		/**
		 * Overrides default behavior of the whiskers by specifying
		 * the quantiles of the lower and upper
		 * @type {[number, number]}
		 * @private
		 */
		this._whiskers_quantiles = options.whiskers_quantiles || null;
		if (!data.length) {
			throw new Error("Data array is empty")
		}
		/**
		 * Input data
		 * @type {number[]}
		 * @private
		 */
		this._data = data;
		/**
		 * Data extent (minimim and maximum)
		 * @type {[number, number]}
		 */
		this._data_extent = d3.extent(data);
		/**
		 * Boxplot metrics
		 * @private
		 * @type {{
		 *	max: number,
		 *  upper_fence: number,
		 *  quartile3: number,
		 *  median: number,
		 *  mean: number,
		 *  iqr: number,
		 *  quartile1: number,
		 *  lower_fence: number,
		 *  min: number
		 * }}
		 */
		this._metrics = calc_boxplot_metrics(data, this._whiskers_quantiles);
		/**
		 * Outliers
		 * @type {number[]}
		 * @private
		 */
		this._outliers = data.filter(
			(v) => v < this._metrics.lower_fence || v > this._metrics.upper_fence
		);
		/**
		 * Full height of svg
		 * @type {number}
		 * @private
		 */
		this._full_height = 453;
		/**
		 * Full width of svg
		 * @type {number}
		 * @private
		 */
		this._full_width = 300;
		/**
		 * Non-graphic components of the chart: setting, scales,
		 * axis generators, spacing, etc.
		 * @private
		 * @type {{
		 * 	margin: {
		 *		top: number,
		 *		right: number,
		 *		bottom: number,
		 *		left: number
		 * 	},
		 * 	width: number,
		 * 	height: number,
		 * 	yscale: d3.scaleLinear,
		 * 	yaxis: d3.axisGenerator,
		 *  violin_scale: number,
		 * 	box_scale: number,
		 *  n_bins: number,
		 * 	histogram: d3.binGenerator,
		 * 	bins: d3.Bin[],
		 * 	violin_curve: d3.curve
		 * }}
		 */
		this._chart = {};
		this._chart.margin = { top: 5, right: 0, bottom: 5, left: 40 };
		this._chart.width = this._full_width - this._chart.margin.left - this._chart.margin.right;
		this._chart.height = this._full_height - this._chart.margin.top - this._chart.margin.bottom;
		this._chart.yscale = d3.scaleLinear()
			.range([this._chart.height, 0])
			.domain(this._data_extent)
			.clamp(true);  // when input outside of domain, its output is clamped to range
		this._chart.yaxis = d3.axisLeft(this._chart.yscale)
			.tickFormat((d) => d.toFixed(1));
		this._chart.violin_scale = 0.8;
		this._chart.box_scale = 0.3;
		this._chart.n_bins = compute_n_bins.sturges(this._data);
		this._chart.histogram = d3.bin()
			.domain(this._data_extent)
			.thresholds(
				linspace(this._data_extent[0], this._data_extent[1], this._chart.n_bins+1)
			);
		this._chart.bins = this._chart.histogram(this._data);
		this._chart.violin_curve = CURVES['Basis'];
		/**
		 * Graphic components of the chart
		 * @private
		 * @type {{
		 * 	root_g: d3.selection
		 * }}
		 */
		this._graphics = {
			// Root g tag (translated to account for the margins)
			root_g: null
		};
	}
	// Set prototype chain
	Object.setPrototypeOf(minimal_boxvio_chart_wrapper.prototype, d3_chart_wrapper.prototype);

	/**
	 * Render the plot
	 * @function
	 * @protected
	 * @name minimal_boxvio_chart_wrapper#render_plot
	 */
	minimal_boxvio_chart_wrapper.prototype.render_plot = function () {
		d3_chart_wrapper.prototype.render_plot.call(this);

		// Set viewBox of svg
		this.svg.attr('viewBox', `0 0 ${this._full_width} ${this._full_height}`);

		// Root g tag
		this._graphics.root_g = this.svg.append('g')
			.attr('transform', `translate(${this._chart.margin.left},${this._chart.margin.top})`);
		
		this._render_y_axis();
		this._render_violin();
		this._render_box();
	};

	/**
	 * Render Y-axis
	 * @private
	 */
	minimal_boxvio_chart_wrapper.prototype._render_y_axis = function () {
		const g = this._graphics.root_g.append('g')
			.call(this._chart.yaxis);
		g.selectAll('g.tick').selectAll('text')
			.style('font-size', 15);
	};

	/**
	 * Render violin
	 * @private
	 */
	minimal_boxvio_chart_wrapper.prototype._render_violin = function () {
		const bins = this._chart.bins;
		const violin_scale = this._chart.violin_scale;
		const yscale = this._chart.yscale;
		const violin_curve = this._chart.violin_curve;

		const g = this._graphics.root_g.append('g');
		const max_count = d3.max(bins, (bin) => bin.length);
		const x_num = d3.scaleLinear()
			.range([0, this._chart.width])
			.domain([-max_count, max_count]);

		if (this._data.length <= 1) {
			return
		}
		g.append('path')
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
	};

	/**
	 * Render box
	 * @private
	 */
	minimal_boxvio_chart_wrapper.prototype._render_box = function () {
		const yscale = this._chart.yscale;
		const metrics = this._metrics;
		const whiskers_lw = 2;
		const median_lw = 3;
		const box_width = this._chart.box_scale * this._chart.width;

		const g = this._graphics.root_g.append('g')
			.attr('transform', `translate(${this._chart.width/2},0)`);

		// Outliers
		const outliers_g = g.append('g');
		for (const outlier of this._outliers) {
			outliers_g.append('circle')
				.attr('cx', 0)
				.attr('cy', yscale(outlier))
				.attr('r', 4)
				.style('fill', this._color)
				.style('opacity', 0.7);
		}

		// Whiskers
		const whiskers_g = g.append('g');
		whiskers_g.append('line')  // vertical line
			.attr('x1', 0)
			.attr('y1', yscale(metrics.lower_fence))
			.attr('x2', 0)
			.attr('y2', yscale(metrics.upper_fence))
			.attr('stroke', this._color)
			.attr('stroke-width', whiskers_lw);
		whiskers_g.append('line') // lower horizontal
			.attr('x1', -box_width / 2)
			.attr('y1', yscale(metrics.lower_fence))
			.attr('x2', box_width / 2)
			.attr('y2', yscale(metrics.lower_fence))
			.attr('stroke', this._color)
			.attr('stroke-width', whiskers_lw);
		whiskers_g.append('line') // upper horizontal
			.attr('x1', -box_width / 2)
			.attr('y1', yscale(metrics.upper_fence))
			.attr('x2', box_width / 2)
			.attr('y2', yscale(metrics.upper_fence))
			.attr('stroke', this._color)
			.attr('stroke-width', whiskers_lw);
		
		// IQR Box
		const iqr_g = g.append('g');
		if (this._data.length > 1) {
			iqr_g.append('rect')  // iqr rect
			.attr('x', -box_width / 2)
			.attr('y', yscale(metrics.quartile3))
			.attr('width', box_width)
			.attr('height', yscale(metrics.quartile1) - yscale(metrics.quartile3))
			.attr('fill', this._color);
		}
		iqr_g.append('line')  // median line
			.attr('x1', -box_width / 2)
			.attr('y1', yscale(metrics.median))
			.attr('x2', box_width / 2)
			.attr('y2', yscale(metrics.median))
			.attr('stroke', 'black')
			.attr('stroke-width', median_lw);
		iqr_g.append('circle')  // median dot
			.attr('cx', 0)
			.attr('cy', yscale(metrics.median))
			.attr('r', 4.5)
			.style('fill', 'white')
			.attr('stroke', 'black')
			.attr('stroke-width', 2);
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
	 * Minimal clock chart
	 * 
	 * Given a series of numbers, it draws equidistant (angle-wise) lines (like clock handles) around
	 * the origin so that the length is proportional to the corresponding number.
	 * For instance, if 4 numbers are given, lines wil be drawn with angles (pi/2, 0, -pi/2, -pi).
	 * 
	 * @class
	 * @extends d3_chart_wrapper
	 * @param {Element} div_wrapper the div to work in
	 * @param {number[]} data the input data
	 * @param {Object} options configuration options
	 * @param {boolean} options.display_download whether to display the download panel (default `false`)
	 * @param {boolean} options.display_control_panel whether to display the control panel (default `false`)
	 * @param {boolean} options.overflow whether going beyond the width of the plot container is allowed (default `false`).
	 * 		if `false`, the svg will be stretched to fill the full width of its parent element
	 * @param {string} options.outer_height outer height of the plot, will be the height applied to the SVG (default `500px`)
	 * 		overflow must be enabled for outer_height to work
	 */
	function minimal_clock_chart_wrapper(div_wrapper, data, options) {
		d3_chart_wrapper.call(this, div_wrapper, options);

		/**
		 * Input data
		 * @type {number[]}
		 * @private
		 */
		this._data = data;
	}
	// Set prototype chain
	Object.setPrototypeOf(minimal_clock_chart_wrapper.prototype, d3_chart_wrapper.prototype);

	/**
	 * Render the plot
	 * @function
	 * @protected
	 * @name minimal_clock_chart_wrapper#render_plot
	 */
	minimal_clock_chart_wrapper.prototype.render_plot = function () {
		d3_chart_wrapper.prototype.render_plot.call(this);

		// Set viewbox of svg
		this.svg.attr('viewBox', `0 0 ${CLOCK_DIAMETER} ${CLOCK_DIAMETER}`);

		const delta = 2*Math.PI/this._data.length;
		let angle = Math.PI/2;
		const max_value = d3.max(this._data);
		const scale = d3.scaleLinear()
			.domain([0, max_value])
			.range([0, CLOCK_RADIUS]);
		const g = this.svg.append('g')
			.attr('transform', `translate(${CLOCK_RADIUS},${CLOCK_RADIUS})`);
		for (const datum of this._data) {
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
				.attr('x2', scale(datum)*Math.cos(angle))
				.attr('y2', -scale(datum)*Math.sin(angle))  // Mirror vertically!
				.attr('stroke', 'black')
				.attr('stroke-width', 1);
			angle -= delta;
		}
		g.append('circle')
			.style('fill', 'black')
			.attr('r', 2.5);

	};

	/*global tstring, page_globals, page, SHOW_DEBUG, psqo_factory, biblio_row_fields, common, dedalo_logged */
	/*eslint no-undef: "error"*/


	const type_row_fields = {


		// caller. Like 'type'
		caller : null,
		type : '',
		equivalents : '',

		// charts
		/** @type {chart_wrapper} */
		weight_chat_wrapper: null,
		/** @type {chart_wrapper} */
		diameter_chart_wrapper: null,
		/** @type {chart_wrapper} */
		axis_chart_wrapper: null,

		draw_item : function(item) {

			const self = this;

			const fragment = new DocumentFragment();

			// dedalo_link
				if (dedalo_logged===true) {
					const dedalo_link_link = self.dedalo_link(item, 'numisdata3');
					fragment.appendChild(dedalo_link_link);
				}

			// Cite of record
				const golden_separator = document.querySelector('.golden-separator');
				requestAnimationFrame(
					() => {
						page.render_cite_record(
							item,
							golden_separator,
							'<em>'+self.type+'</em>' // title
						);
					}
				);

			// catalog_hierarchy
				fragment.appendChild(
					self.catalog_hierarchy(item, "catalog_hierarchy")
				);

			// creators
				fragment.appendChild(
					self.creators(item, "creators")
				);

			// identify_coin_wrapper
				const identify_coin = common.create_dom_element({
					element_type	: "div",
					class_name		: "identify_coin_wrapper gallery",
					parent			: fragment
				});

				// ref_coins_image_obverse
					requestAnimationFrame(
						() => {
							identify_coin.appendChild(
								self.image(item, "ref_coins_image_obverse")
							);
						}
					);

				// <a href="https://gallica.bnf.fr/ark:/12148/btv1b84812787/f1.highres" class="image_link">
				// <img title="44726" src="https://gallica.bnf.fr/ark:/12148/btv1b84812787/f1.highres" loading="lazy" data-caption="Bibliotèque nationale de France Fonds général.280 (36-5-29)">
				// </a>

				// ref_coins_image_reverse
					requestAnimationFrame(
						() => {
							identify_coin.appendChild(
								self.image(item, "ref_coins_image_reverse")
							);
						}
					);


				// embedded gallery reference node
				common.create_dom_element({
					element_type	: "div",
					id				: "embedded-gallery",
					parent			: fragment
				});

			// identify_coin
				// fragment.appendChild(
				// 	self.identify_coin(item, "identify_coin")
				// )

			// id_line
				fragment.appendChild(
					self.id_line(item, "id_line")
				);

			// sides_wrapper
			const sides_wrapper = common.create_dom_element({
				element_type	: "div",
				class_name		: "sides_wrapper",
				parent			: fragment
			});

			// obverse_info_wrapper
			const obverse_wrapper = common.create_dom_element({
				element_type	: "div",
				class_name		: "obverse_wrapper",
				parent			: sides_wrapper
			});

			// design_obverse
				if (item.design_obverse_data) {
					obverse_wrapper.appendChild(
						self.default(item, "design_obverse")
					);
				}

			// symbol_obverse
				if (item.symbol_obverse_data) {
					obverse_wrapper.appendChild(
						self.default(item, "symbol_obverse")
					);
				}

			// legend_obverse
				// fragment.appendChild(
				// 	self.default(item, "legend_obverse", page.local_to_remote_path)
				// )
				if (item.legend_obverse) {
					obverse_wrapper.appendChild(
						page.render_legend({
							value : item.legend_obverse,
							style : 'median legend_obverse_box'
						})
					);
				}
				// else{
				// 	common.create_dom_element({
				// 		element_type	: "div",
				// 		parent			: sides_wrapper
				// 	})
				// }

			// legend_obverse_transcription
				if (item.legend_obverse_transcription) {
					obverse_wrapper.appendChild(
						self.default(item, "legend_obverse_transcription")
					);
				}

			// reverse_info_wrapper
			const reverse_wrapper = common.create_dom_element({
				element_type	: "div",
				class_name		: "reverse_wrapper",
				parent			: sides_wrapper
			});

			// design_reverse
				if (item.design_reverse) {
					reverse_wrapper.appendChild(
						self.default(item, "design_reverse")
					);
				}

			// symbol_reverse
				if (item.symbol_reverse_data) {
					reverse_wrapper.appendChild(
						self.default(item, "symbol_reverse")
					);
				}

			// legend_reverse
				// fragment.appendChild(
				// 	self.default(item, "legend_reverse", page.local_to_remote_path)
				// )
				if (item.legend_reverse) {
					reverse_wrapper.appendChild(
						page.render_legend({
							value : item.legend_reverse,
							style : 'median legend_reverse_box'
						})
					);
				}

			// legend_reverse_transcription
				if (item.legend_reverse_transcription) {
					reverse_wrapper.appendChild(
						self.default(item, "legend_reverse_transcription")
					);
				}

			// public_info
				fragment.appendChild(
					self.default(item, "public_info", page.local_to_remote_path)
				);

			// equivalents : "ACIP | 1567<br>CNH | 237/1"
				fragment.appendChild(
					self.default(item, "equivalents", function(value){
						const beats = page.split_data(value, "<br>");
						const ar_final = [];
						for (let i = 0; i < beats.length; i++) {
							ar_final.push( beats[i].replace(/ \| /g, ' ') );
						}
						self.equivalents = ar_final.join(" | ");
						return self.equivalents
					})
				);
			// related_types : "MIB | 03a<br>MIB | 15b"
				if(item.related_types){
					item.related_types;
					const related_types_data	= item.related_types_data;

					const label		= tstring.related_types || "Related types";
					const beats 	= related_types_data.length;
					const ar_final 	= [];
					for (let i = 0; i < beats; i++) {
						const related_type = related_types_data[i];
						const related_mint = (related_type.mint)
							? related_type.mint
							: "...";
						const related_mint_number = (related_type.mint_number)
							? related_type.mint_number
							: '..';
						const related_type_number = (related_type.number)
							? related_type.number
							: '..';
						const related_label = related_mint +" "+related_mint_number+"/"+related_type_number;

						const related_id 	= (related_type.section_id)
								? related_type.section_id
								: false;
						const url		= page_globals.__WEB_ROOT_WEB__ + "/type/" + related_id;

						const current_related_typo = (related_id)
							? "<a href=\"" + url + "\">" +  related_label + "</a>"
							: related_label;
						ar_final.push( current_related_typo );
					}

					common.create_dom_element({
						element_type	: "span",
						class_name		: "info_value related_types",
						inner_html		: label +": "+ ar_final.join(" | "),
						parent			: fragment
					});
				}

			// bibliography
				const ar_references = item.bibliography_data;
					fragment.appendChild(
						self.draw_bibliographic_reference(ar_references)
					);

			// permanent uri
				fragment.appendChild(
					self.default(item, "section_id", function(value){
						const label		= tstring.permanent_uri || "Permanent URI";
						const url		= page_globals.__WEB_ROOT_WEB__ + "/type/" + value;
						const full_url	= page_globals.__WEB_BASE_URL__ + url;
						// return label + ": <a href=\"" + url + "\">" +  full_url + "</a>"
						return label + ": <span class=\"uri\">" +  full_url + "</span>"
					})
				);

			// other permanent uri
				if (item.uri && item.uri.length>0) {
					for (let i = 0; i < item.uri.length; i++) {

						const el = item.uri[i];

						fragment.appendChild(
							self.default(item, "section_id", function(value){
								const label	= tstring.uri || "URI";
								return label + " " + el.label + ": <span class=\"uri\"><a href=\""+el.value+"\" target=\"_blank\">" + el.value + "</a></span>"
							})
						);
					}
				}

			// catalog hierarchy
				// 	fragment.appendChild(
				// 		self.default(item, "section_id", function(value){
				// 			return "<em>Info about current type catalog hierarchy. Catalog section_id: " + item["catalogue_data"] + "</em>"
				// 		})
				// 	)

			// items (ejemplares) list
				if (item._coins_group && item._coins_group.length>0) {
					// exclude already showed items (identify images)
					const data = item._coins_group.filter(el => el.typology_id!="1");
					if (data.length>0) {
						// fragment.appendChild( self.label(item, "coins") )

						const coins_label = self.label(item, "coins");
						fragment.appendChild( coins_label );
						const coins_container = self.items_list(item, "items_list", data);

						coins_label.addEventListener("mouseup", (event) => {
							event.preventDefault();
							coins_container.classList.toggle("hide");
						});

						fragment.appendChild(coins_container);
						// fragment.appendChild(
						// 	self.items_list(item, "items_list", data)
						// )
					}
				}

			// Weight, diameter, and axis
				let color = COLOR_PALETTE[0];
				if (item.denomination_data
					&& item.denomination_data.length
					&& item.denomination_data[0].color) {
					color = item.denomination_data[0].color;
				}
				const catalog_data = item.catalog || {};
				const calculable = catalog_data.full_coins_reference_calculable
					? catalog_data.full_coins_reference_calculable
					: [];
				const diameter = catalog_data.full_coins_reference_diameter_max
					? catalog_data.full_coins_reference_diameter_max.filter((v, i) => v && calculable[i])
					: [];
				const weight = catalog_data.full_coins_reference_weight
					? catalog_data.full_coins_reference_weight.filter((v, i) => v && calculable[i])
					: [];
				const axis = catalog_data.full_coins_reference_axis
					? catalog_data.full_coins_reference_axis.filter((v) => v)
					: [];
				const axis_counts = Array(12).fill(0);
				for (const hour of axis) {
					axis_counts[hour % 12]++;
				}
				if (diameter.length || weight.length || axis.length) {
					const analytics_div_wrapper = common.create_dom_element({
						element_type	: 'div',
						id				: 'type_analytics'
					});
					fragment.appendChild(analytics_div_wrapper);

					if (weight.length) {
						const weight_wrapper = common.create_dom_element({
							element_type	: 'div',
							class_name		: 'type_analytics_component',
							parent			: analytics_div_wrapper
						});
						const separator = common.create_dom_element({
							element_type	: 'div',
							class_name		: 'info_line separator',
							parent			: weight_wrapper
						});
						common.create_dom_element({
							element_type	: 'div',
							class_name		: 'big_label',
							text_content	: tstring.weight || 'Weight',
							parent			: separator
						});
						const chart_wrapper = common.create_dom_element({
							element_type	: 'div',
							class_name		: 'chart_wrapper',
							parent			: weight_wrapper
						});
						self.weight_chat_wrapper = new minimal_boxvio_chart_wrapper(
							chart_wrapper,
							weight,
							{
								color				: color,
								whiskers_quantiles	: [10, 90],
							}
						);
						self.weight_chat_wrapper.render();
					}

					if (diameter.length) {
						const diameter_wrapper = common.create_dom_element({
							element_type	: 'div',
							class_name		: 'type_analytics_component',
							parent			: analytics_div_wrapper
						});
						const separator = common.create_dom_element({
							element_type	: 'div',
							class_name		: 'info_line separator',
							parent			: diameter_wrapper
						});
						common.create_dom_element({
							element_type	: 'div',
							class_name		: 'big_label',
							text_content	: tstring.diameter || 'Diameter',
							parent			: separator
						});
						const chart_wrapper = common.create_dom_element({
							element_type	: 'div',
							class_name		: 'chart_wrapper',
							parent			: diameter_wrapper
						});
						self.diameter_chart_wrapper = new minimal_boxvio_chart_wrapper(
							chart_wrapper,
							diameter,
							{
								color				: color,
								whiskers_quantiles	: [10, 90],
							}
						);
						self.diameter_chart_wrapper.render();
					}

					if (axis.length) {
						const axis_wrapper = common.create_dom_element({
							element_type	: 'div',
							class_name		: 'type_analytics_component',
							parent			: analytics_div_wrapper
						});
						const separator = common.create_dom_element({
							element_type	: 'div',
							class_name		: 'info_line separator',
							parent			: axis_wrapper
						});
						common.create_dom_element({
							element_type	: 'div',
							class_name		: 'big_label',
							text_content	: tstring.die_position || 'Die axis',
							parent			: separator
						});
						const chart_wrapper = common.create_dom_element({
							element_type	: 'div',
							class_name		: 'chart_wrapper',
							parent			: axis_wrapper
						});
						self.axis_chart_wrapper = new minimal_clock_chart_wrapper(
							chart_wrapper,
							axis_counts,
							{}
						);
						self.axis_chart_wrapper.render();
					}
				}

			// findspots - hoards_and_findspots - (hallazgos) list
				// if (item.ref_coins_findspots_data && item.ref_coins_findspots_data.length>0) {
				// 	fragment.appendChild( self.label(item, tstring.findspots) )
				// 	fragment.appendChild(
				// 		self.hoards_and_findspots(item, "findspots")
				// 	)
				// }

			// hoards - hoards_and_findspots - (tesoros) list
				// if (item.ref_coins_hoard_data && item.ref_coins_hoard_data.length>0) {
				// 	fragment.appendChild( self.label(item, tstring.hoards) )
				// 	fragment.appendChild(
				// 		self.hoards_and_findspots(item, "hoards")
				// 	)
				// }

			// mix hoards and findspots
				if ( (item.ref_coins_findspots_data && item.ref_coins_findspots_data.length>0) ||
					 (item.ref_coins_hoard_data && item.ref_coins_hoard_data.length>0)
					) {
					const label = tstring.findspots + "/" + tstring.hoards + "/" + tstring.mints;
					fragment.appendChild( self.label(item, label) );
					fragment.appendChild(
						self.hoards_and_findspots(item, label)
					);
				}

			// ref_documentation : archive record(s) (documentation table) this type
			// illustrates - a ONE-TO-MANY relation (the same type can be documented
			// across several index cards) - ref_documentation_data is already resolved
			// (see type.js resolve_portals_custom) into the full array of linked
			// 'documentation' rows, so this renders one card per entry instead of
			// assuming a single record. ref_documentation_title/ref_documentation_image
			// (flat, pipe-joined strings across all linked records) are NOT used for
			// display - each card pulls straight from its own resolved row instead.
			// Laid out the same way this page's own find_coins grid already does
			// (HALLAZGOS/TESOROS/CECAS section below) - flex-wrap, ~3 per row,
			// images_wrapper + info_wrapper - rather than a one-off card design.
			// Section header (a big_label via self.label()) matches every other
			// block on this page (MONEDAS, PESO, ...)
				if (item.ref_documentation_data && item.ref_documentation_data.length>0) {

					fragment.appendChild( self.label(item, tstring.archive || "Archive") );

					const ref_documentation_grid = common.create_dom_element({
						element_type	: "div",
						class_name		: "info_line ref_documentation_grid",
						parent			: fragment
					});

					item.ref_documentation_data.forEach(function(doc){

						const documentation_url	= page_globals.__WEB_ROOT_WEB__ + "/documentation/" + doc.section_id;
						const doc_title				= doc.title || doc.name || ("ID " + doc.section_id);

						const card = common.create_dom_element({
							element_type	: "a",
							class_name		: "ref_documentation",
							href			: documentation_url,
							target			: "_blank",
							parent			: ref_documentation_grid
						});
						card.setAttribute('rel', 'noopener');

						if (doc.identifying_images && doc.identifying_images.length>0) {

							const first_image	= doc.identifying_images.split(' | ')[0];
							// full-resolution ('/1.5MB/') image, not '/thumb/' - shown at full
							// width/natural height below (see .ref_documentation in type.less),
							// not cropped into a fixed-size box
							const full_url		= page_globals.__WEB_MEDIA_BASE_URL__ + first_image;

							const images = common.create_dom_element({
								element_type	: "div",
								class_name		: "images_wrapper",
								parent			: card
							});
							const img = common.create_dom_element({
								element_type	: "img",
								src				: full_url,
								title			: doc_title,
								loading			: "lazy",
								parent			: images
							});
							img.alt = doc_title;
						}

						// info column: title first, then every populated field the linked
						// record has - same field set/order archive.js's own draw_fields
						// uses for this exact table, so the vocabulary matches its own
						// detail page
							const info = common.create_dom_element({
								element_type	: "div",
								class_name		: "info_wrapper",
								parent			: card
							});

							common.create_dom_element({
								element_type	: "div",
								class_name		: "ref_documentation_title",
								text_content	: doc_title,
								parent			: info
							});

							const dating = [doc.dating_start, doc.dating_end].filter(Boolean).join(' - ') || doc.dating;

							self.ref_documentation_field(info, tstring.collection || 'Collection', doc.collection);
							self.ref_documentation_field(info, tstring.fund || 'Fund', doc.fund);
							self.ref_documentation_field(info, tstring.typology || 'Typology', doc.typology);
							self.ref_documentation_field(info, tstring.material || 'Material', doc.material);
							self.ref_documentation_field(info, tstring.name || 'Name of the property', doc.name);
							self.ref_documentation_field(info, tstring.technique || 'Technique', doc.technique);
							self.ref_documentation_field(info, tstring.dating || 'Dating', dating);
							self.ref_documentation_field(info, tstring.municipality || 'Municipality', doc.municipality);
							self.ref_documentation_field(info, tstring.curator || 'Curator', doc.curator);
							self.ref_documentation_field(info, tstring.description || 'Description', doc.description);
					});
				}

			// row_wrapper
				const row_wrapper = common.create_dom_element({
					element_type	: "div",
					class_name		: "row_wrapper"
				});
				row_wrapper.appendChild(fragment);


			return row_wrapper
		},//end draw_item



		dedalo_link : function(item, section_tipo) {

			const dedalo_link = common.create_dom_element({
				element_type	: "a",
				class_name		: "section_id go_to_dedalo",
				inner_html		: item.section_id + " <small>(" + section_tipo +")</small>",
				href			: '/dedalo/core/page/?tipo=' + section_tipo + '&id=' + item.section_id
			});
			dedalo_link.setAttribute('target', '_blank');

			return dedalo_link
		},//end dedalo_link



		default : function(item, name, fn) {

			// line
				const line = common.create_dom_element({
					element_type	: "div",
					class_name		: "info_line " + name
				});

			if (item[name] && item[name].length>0) {

				// common.create_dom_element({
					// 	element_type 	: "label",
					// 	class_name 		: "",
					// 	text_content 	: tstring[name]|| name,
					// 	parent 			: line
					// })

				const searchTerms = ["design_obverse","design_reverse","symbol_reverse","symbol_obverse"];

				const item_text = (typeof fn==="function")
					? fn(item[name])
					: page.remove_gaps(item[name], " | ");

				if (searchTerms.includes(name)) {

					// common.create_dom_element({
					// 	element_type	: "a",
					// 	class_name		: "info_value",
					// 	inner_html		: item_text.trim(),
					// 	parent			: line
					// })

					const psqo = {
						"$and":[{
							id	: name,
							q	: item[name],
							op	: '='
						}]
					};
					const safe_psqo		= psqo_factory.build_safe_psqo(psqo);
					const parse_psqo	= psqo_factory.encode_psqo(safe_psqo);

					const catalog_url = page_globals.__WEB_ROOT_WEB__+"/catalog/?psqo="+ parse_psqo;

					common.create_dom_element({
						element_type	: "a",
						class_name		: "info_value underline-text",
						inner_html 		: item_text ? item_text.trim() : '',
						href			: catalog_url,
						parent 			: line
					});

				} else {
					common.create_dom_element({
						element_type	: "span",
						class_name		: "info_value",
						inner_html		: item_text ? item_text.trim() : '',
						parent			: line
					});
				}
			}


			return line
		},//end default



		label : function(item, name) {

			// line
				const line = common.create_dom_element({
					element_type	: "div",
					class_name		: "info_line separator " + name
				});

				common.create_dom_element({
					element_type 	: "div",
					class_name 		: "big_label",
					text_content 	: tstring[name]|| name,
					parent 			: line
				});


			return line
		},//end label



		/**
		* REF_DOCUMENTATION_FIELD
		* Append one value line for the linked documentation record, same plain
		* text convention as the equivalents/related_types lines above - skips empty
		* values and strips Dédalo's leading/trailing "|" join artifact on multi-value
		* term fields (same fix archive.js's own add_field uses for this same table).
		* The label is still in the DOM (kept for screen readers/context) but hidden
		* visually - see .ref_documentation_field_label in type.css - so the cards
		* show just the values, not "Fund: ", "Typology: " etc labels
		* @return void
		*/
		ref_documentation_field : function(container, label, value) {

			if (typeof value==="string") {
				value = value.replace(/^(\s*\|\s*)+/, '').replace(/(\s*\|\s*)+$/, '').trim();
			}

			if (!value || (typeof value==="string" && value.trim().length===0)) {
				return
			}

			const field = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_value ref_documentation_field",
				parent			: container
			});

			common.create_dom_element({
				element_type	: "span",
				class_name		: "ref_documentation_field_label",
				text_content	: label + ": ",
				parent			: field
			});

			common.create_dom_element({
				element_type	: "span",
				class_name		: "ref_documentation_field_value",
				inner_html		: value,
				parent			: field
			});
		},//end ref_documentation_field



		catalog_hierarchy : function(item, name) {

			// line
				const line = common.create_dom_element({
					element_type	: "div",
					class_name		: "info_line inline " + name
				});

			const catalog = item.catalog;

			if (catalog && Object.keys(catalog).length > 0 && catalog.constructor === Object ) {

				const parents = catalog.parents;
				const parents_ordered = [];

				for (let i = 0; i < parents.length; i++) {
					parents_ordered.push(parents[i]);
					if(parents[i].term_table === 'mints') break;
				}

				for (let i = parents_ordered.length - 1; i >= 0; i--) {

					if (parents_ordered[i].term_table === 'mints') {

						const mint_section_id = (parents_ordered[i].term_data)
							? JSON.parse(parents_ordered[i].term_data)[0]
							: '';

						common.create_dom_element({
							element_type	: "a",
							class_name		: "breadcrumb link link_mint",
							href			: page_globals.__WEB_ROOT_WEB__ + '/mint/' + mint_section_id,
							target			: '_blank',
							text_content	: parents_ordered[i].term,
							parent			: line
						});
					}else {
						common.create_dom_element({
							element_type 	: "span",
							class_name 		: "breadcrumb " + parents_ordered[i].term_table,
							text_content	: parents_ordered[i].term,
							parent 			: line
						});
					}

					common.create_dom_element({
						element_type 	: "span",
						class_name 		: "breadcrumb_symbol",
						text_content	: " > ",
						parent 			: line
					});
				}

				(catalog.ref_mint_number)
					? catalog.ref_mint_number+'/'
					: '';

				const type_string = page.compose_catalog_id({
					archive		: page_globals.OWN_CATALOG_ACRONYM,
					section_id	: catalog.term_section_id,
					mint_number	: catalog.ref_mint_number,
					type		: catalog.term
				});

				common.create_dom_element({
					element_type	: 'span',
					class_name		: 'breadcrumb',
					inner_html		: type_string,
					parent			: line
				});
			}


			return line
		},//end catalog_hierarchy



		creators : function(item, name) {

			// line
				const line = common.create_dom_element({
					element_type	: "div",
					class_name		: "info_line " + name
				});


			if (item.creators_data && item.creators_data.length>0) {
				const data = JSON.parse(item.creators_data);

				const ar_names		= item.creators_names
					? item.creators_names.split(' | ')
					: [];
				const ar_surnames	= item.creators_surnames
					? item.creators_surnames.split(' | ')
					: [];
				const ar_roles		= item.creators_roles
					? item.creators_roles.split('|')
					: [];

				const text_creators = [];
				const data_length = data.length;

				for (var i = 0; i < data_length; i++) {
					const name		= ar_names[i]
						? ar_names[i]
						: '';
					const surname	= ar_surnames[i]
						? ar_surnames[i]
						: '';
					const rol		= ar_roles[i]
						? '('+ ar_roles[i] + ')'
						: '';

					const creator_name = name + ' ' + surname;
					const creator = creator_name.trim() + ' ' + rol;

					text_creators.push(creator.trim());
				}

				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "creators",
					text_content 	: text_creators.join(' | '),
					parent 			: line
				});

			}


			return line
		},//end creators



		image : function(item, name) {

			// line
				const line = common.create_dom_element({
					element_type	: 'div',
					class_name		: 'info_line inline ' + name
				});

			if (item[name] && item[name].length>0) {

				const url = item[name] || '';

				let caption = '';

				// search for math coin image in coin references
				const coin_references = item.coin_references || [];
				const found_coin = coin_references.find(el => el.image_obverse===url || el.image_reverse===url);
				if (found_coin) {

					// collection
						if (found_coin.collection && found_coin.collection.length) {
							const collection = found_coin.collection;
							caption += collection;
						}

					// ref_auction
						const parts = [];
						if (found_coin.ref_auction_group && found_coin.ref_auction_group.length) {
							// name
							const name = found_coin.ref_auction_group[0].name || '';
							parts.push(name);
							// date
							const date = found_coin.ref_auction_group[0].date || '';
							parts.push(date);
							// number
							const number = found_coin.ref_auction_group[0].number || '';
							parts.push(number);
						}
						caption += parts.join(' ');

					// lot
						if (found_coin.number && found_coin.number.length) {
							const lot = (found_coin.ref_auction_group && found_coin.ref_auction_group.length)
							 ? (tstring.lot || 'lot') +' '+ found_coin.number
							 : found_coin.number;
							caption += ', ' + lot;
						}

					// photographer
						if (found_coin.photographer && found_coin.photographer.length) {
							const photographer = found_coin.photographer;
							caption += '<spam> | </spam> <i class="fa fa-camera"></i> ' + photographer;
						}
				}

				const image_link = common.create_dom_element({
					element_type	: 'a',
					class_name		: 'image_link',
					href			: url,
					parent			: line
				});

				// caption text (bellow images)
					// const ar_caption = []
					// if (self.type) {
					// 	ar_caption.push(self.type)
					// }
					// if (self.equivalents) {
					// 	ar_caption.push(self.equivalents)
					// }

				// img
				common.create_dom_element({
					element_type	: 'img',
					class_name		: 'image',
					src				: url,
					title			: item.number,
					dataset			: {
						caption : caption
					},
					parent			: image_link
				});
			}


			return line
		},//end image



		identify_coin : function(item, name) {

			// const self = this
			//
			// // line
			// 	const line = common.create_dom_element({
			// 		element_type	: "div",
			// 		class_name		: "info_line inline " + name
			// 	})
			//
			// const ar_str_coins = page.split_data(item.ref_coins, ' | ')
			//
			// const ar_coins = []
			// for (var i = 0; i < ar_str_coins.length; i++) {
			// 	ar_coins.push(JSON.parse(ar_str_coins[i]))
			// }
			// const identify_coin_id = ar_coins[0][0]
			// const identify_coin = item.ref_coins_union.find(item => item.section_id===identify_coin_id)

			// if (identify_coin) {

				// // uri
				// 	const uri		= page_globals.__WEB_ROOT_WEB__ + "/coin/" + identify_coin_id
				// 	const full_url	= page_globals.__WEB_BASE_URL__ + uri
				// 	const uri_text	= '<a class="icon_link info_value" target="_blank" href="' +uri+ '"> URI </a> '
				// 	common.create_dom_element({
				// 		element_type	: "span",
				// 		class_name		: "",
				// 		inner_html		: uri_text,
				// 		parent			: line
				// 	})
				//
				// // collection uri
				//
				// 	if (identify_coin.uri && identify_coin.uri.length>0) {
				// 		for (let i = 0; i < identify_coin.uri.length; i++) {
				//
				// 			const el = identify_coin.uri[i]
				// 			const label	= el.label || "URI"
				// 			const uri_text	= '<a class="icon_link info_value" href="' + el.value + '" target="_blank"> ' + el.label  + '</a>'
				//
				// 			common.create_dom_element({
				// 				element_type	: "span",
				// 				class_name		: "",
				// 				inner_html		: uri_text,
				// 				parent			: line
				// 			})
				//
				// 		}
				// 	}



				// // collection
				// 	if (identify_coin.collection.length>0){
				//
				// 		// line
				// 			const line_collection = common.create_dom_element({
				// 				element_type	: "span",
				// 				class_name		: "info_value",
				// 				parent			: line
				// 			})
				//
				// 			common.create_dom_element({
				// 				element_type	: "span",
				// 				class_name		: name + " golden-color",
				// 				inner_html		: identify_coin.collection,
				// 				parent			: line_collection
				// 			})
				// 		// number
				// 			if (identify_coin.number.length>0){
				//
				// 				common.create_dom_element({
				// 					element_type	: "span",
				// 					class_name		: name + " golden-color",
				// 					inner_html		: " "+ identify_coin.number,
				// 					parent			: line_collection
				// 				})
				// 			}
				// 	}


				// // auction
				// 	function draw_auction(data, parent, class_name, prepend) {
				//
				// 		if (data.name.length<1) return
				// 		// line
				// 			const line = common.create_dom_element({
				// 				element_type	: "span",
				// 				class_name		: "info_value",
				// 				parent			: parent
				// 			})
				// 		// name
				// 			if (data.name) {
				// 				common.create_dom_element({
				// 					element_type	: "span",
				// 					class_name		: class_name+ " golden-color",
				// 					inner_html		: prepend + data.name,
				// 					parent			: line
				// 				})
				// 			}
				// 		// ref_auction_date
				// 			if (data.date) {
				// 				common.create_dom_element({
				// 					element_type	: "span",
				// 					class_name		: class_name+" golden-color",
				// 					inner_html		: " | " + data.date,
				// 					parent			: line
				// 				})
				// 			}
				// 		// number
				// 			if (data.number) {
				// 				common.create_dom_element({
				// 					element_type	: "span",
				// 					class_name		: class_name+" golden-color",
				// 					inner_html		: " "+ data.number,
				// 					parent			: line
				// 				})
				// 			}
				//
				// 		return true
				// 	}
				//
				// 	if (identify_coin.ref_auction_group) {
				// 		for (let i = 0; i < identify_coin.ref_auction_group.length; i++) {
				// 			draw_auction(identify_coin.ref_auction_group[i], line, name, '')
				// 		}
				// 	}
				// 	if (identify_coin.ref_related_coin_auction_group) {
				// 		for (let i = 0; i < identify_coin.ref_related_coin_auction_group.length; i++) {
				//
				// 			draw_auction(identify_coin.ref_related_coin_auction_group[i], line, name, '= ')
				// 		}
				// 	}
				//
				// 	// public_info
				// 		if (identify_coin.public_info && identify_coin.public_info.length>0){
				// 			// const label = (tstring.public_info || "Public_info")+": ";
				//
				// 			common.create_dom_element({
				// 			element_type	: "div",
				// 			class_name		: "",
				// 			inner_html		: identify_coin.public_info,
				// 			parent			: line
				// 		})
				// 	}
					// // auction name
					// 	common.create_dom_element({
					// 		element_type 	: "span",
					// 		class_name 		: name,
					// 		text_content 	: identify_coin.ref_auction,
					// 		parent 			: line
					// 	})

					// // auction final_date
					// 	const split_time 	= (identify_coin.ref_auction_date)
					// 		? identify_coin.ref_auction_date.split(' ')
					// 		: [""]
					// 	const split_date 	= split_time[0].split('-')
					// 	const correct_date 	= split_date.reverse()
					// 	const final_date 	= correct_date.join("-")

					// 	if (final_date) {
					// 		common.create_dom_element({
					// 			element_type 	: "span",
					// 			class_name 		: name,
					// 			text_content 	: " | "+final_date,
					// 			parent 			: line
					// 		})
					// 	}

					// // auction ref_auction_number
					// 	if(identify_coin.ref_auction_number){
					// 		common.create_dom_element({
					// 			element_type 	: "span",
					// 			class_name 		: name,
					// 			text_content 	: ", "+(tstring.n || "nº") +" "+ identify_coin.ref_auction_number,
					// 			parent 			: line
					// 		})
					// 	}

				// size_text. weight / dies / diameter
				// 	const ar_beats = []
				// 	if (identify_coin.weight && identify_coin.weight.length>0) {
				// 		ar_beats.push( identify_coin.weight.replace('.', ',') + " g" )
				// 	}
				//
				// 	if (identify_coin.diameter && identify_coin.diameter.length>0) {
				// 		ar_beats.push( identify_coin.diameter.replace('.', ',') + " mm" )
				// 	}
				// 	if (identify_coin.dies && identify_coin.dies.length>0) {
				// 		ar_beats.push( identify_coin.dies + " h" )
				// 	}
				// 	const size_text = ar_beats.join("; ")
				//
				// common.create_dom_element({
				// 	element_type 	: "span",
				// 	class_name 		: name,
				// 	text_content 	: " ("+size_text+")",
				// 	parent 			: line
				// })
			// }


			// return line
		},//end identify_coin



		id_line : function(item, name) {

			const self = this;

			// line
				const line = common.create_dom_element({
					element_type	: "div",
					class_name		: "info_line " + name
				});

			// ar_nodes
				const ar_nodes = [];

			// catalogue
				name = "catalogue";
				if (item[name] && item[name].length>0) {

					const type_string = page.compose_catalog_id({
						archive		: page_globals.OWN_CATALOG_ACRONYM,
						section_id	: item.section_id,
						mint_number	: item.mint_number,
						type		: item.number
					});

					self.type = type_string;
					const node = common.create_dom_element({
						element_type	: "span",
						class_name		: "info_value " + name,
						inner_html		: type_string
					});
					ar_nodes.push(node);
				}

			// denomination
				name = "denomination";
				if (item[name] && item[name].length>0) {

					const item_text = item[name];

					const node = common.create_dom_element({
						element_type 	: "span",
						class_name 		: "info_value " + name,
						text_content 	: item_text
					});
					ar_nodes.push(node);

					// denomination_description
					self.create_float_prompt(item,node,"denomination_data");
				}

			// material
				name = "material";
				if (item[name] && item[name].length>0) {

					const beats		= page.split_data(item[name], ' | ');
					const item_text	= beats.filter(Boolean).join(", ");

					var material_node = common.create_dom_element({
						element_type 	: "span",
						class_name 		: "info_value " + name,
						text_content 	: item_text
					});
					ar_nodes.push(material_node);
				}

			// material_uris
				self.create_float_prompt(item,material_node,"material_data");


			// averages
				name = "averages";
				if (item["averages_weight"] && item["averages_weight"].length>0) {

					const weight_text	= item["averages_weight"]
						? item["averages_weight"].replace('.', ',') + " g (" + item["total_weight_items"] + ")"
						: '';
					const diameter_text	= item["averages_diameter"]
						? '; '+item["averages_diameter"].replace('.', ',') + " mm (" + item["total_diameter_items"] + ")"
						: '';

					const node = common.create_dom_element({
						element_type 	: "span",
						class_name 		: "info_value " + name,
						text_content 	: weight_text + diameter_text
					});
					ar_nodes.push(node);
				}

			// nodes append
				const ar_nodes_length = ar_nodes.length;
				for (let i = 0; i < ar_nodes_length; i++) {
					// separator
					if (i>0 && i<ar_nodes_length) {
						common.create_dom_element({
							element_type	: "span",
							class_name		: "info_value separator",
							text_content	: " | ",
							parent			: line
						});
					}
					// node
					line.appendChild(ar_nodes[i]);
				}


			return line
		},//end id_line



		items_list : function(item, name, data) {

			const self = this;

			// line
				const line = common.create_dom_element({
					element_type	: "div",
					class_name		: "info_line " + name
				});

			// function draw_coin(data, container) {

			// 	const wrapper = common.create_dom_element({
			// 		element_type	: "div",
			// 		class_name		: "sorted_coin",
			// 		parent			: container
			// 	})

			// 	// images
			// 		const images = common.create_dom_element({
			// 			element_type	: "div",
			// 			class_name		: "images_wrapper",
			// 			parent			: wrapper
			// 		})
			// 		const image_link_obverse = common.create_dom_element({
			// 			element_type	: "a",
			// 			class_name		: "image_link",
			// 			href			: data.image_obverse,
			// 			parent			: images
			// 		})
			// 		const image_obverse = common.create_dom_element({
			// 			element_type	: "img",
			// 			src				: data.image_obverse,
			// 			parent			: image_link_obverse
			// 		})
			// 		image_obverse.loading="lazy"
			// 		const image_link_reverse = common.create_dom_element({
			// 			element_type	: "a",
			// 			class_name		: "image_link",
			// 			href			: data.image_reverse,
			// 			parent			: images
			// 		})
			// 		const image_reverse = common.create_dom_element({
			// 			element_type	: "img",
			// 			src				: data.image_reverse,
			// 			parent			: image_link_reverse
			// 		})
			// 		image_reverse.loading="lazy"

			// 	// collection
			// 		if (data.collection.length>0){

			// 			const collection_label = (data.number && data.number.length>0)
			// 				? data.collection + " (" + data.number + ")"
			// 				: data.collection

			// 			common.create_dom_element({
			// 				element_type	: "div",
			// 				class_name		: "golden-color",
			// 				inner_html		: collection_label,
			// 				parent			: wrapper
			// 			})

			// 			if (data.former_collection.length>0){
			// 				common.create_dom_element({
			// 					element_type	: "div",
			// 					class_name		: "",
			// 					inner_html		: "("+data.former_collection+")",
			// 					parent			: wrapper
			// 				})
			// 			}
			// 		}

			// 	// size. weight / dies / diameter
			// 		const ar_beats = []
			// 		if (data.weight && data.weight.length>0) {
			// 			ar_beats.push( data.weight.replace('.', ',') + " g" )
			// 		}
			// 		if (data.diameter && data.diameter.length>0) {
			// 			ar_beats.push( data.diameter.replace('.', ',') + " mm" )
			// 		}
			// 		if (data.dies && data.dies.length>0) {
			// 			ar_beats.push( data.dies + " h" )
			// 		}
			// 		const size_text = ar_beats.join("; ")
			// 		common.create_dom_element({
			// 			element_type	: "div",
			// 			class_name		: "",
			// 			inner_html		: size_text,
			// 			parent			: wrapper
			// 		})

			// 	// findspots + hoard
			// 		const ar_find = []
			// 		let label = ""
			// 		if(data.hoard){
			// 			const hoard = (data.hoard_place)
			// 				? data.hoard + " ("+data.hoard_place+")"
			// 				: data.hoard
			// 			label = (tstring.hoard || "Hoard")+": "
			// 			ar_find.push( hoard )
			// 		}
			// 		if(data.findspot){
			// 			const findspot = (data.findspot_place)
			// 				? data.findspot + " ("+data.findspot_place+")"
			// 				: data.findspot
			// 			label = (tstring.fiindspot || "Findspot")+": "
			// 			ar_find.push( findspot )
			// 		}

			// 		const find_text = ar_find.join(" | ")
			// 		common.create_dom_element({
			// 			element_type	: "div",
			// 			class_name		: "",
			// 			inner_html		: label+find_text,
			// 			parent			: wrapper
			// 		})

			// 	// auction
			// 		function draw_auction(data, parent, class_name, prepend) {

			// 			if (data.name.length<1) return

			// 			// line
			// 				const line = common.create_dom_element({
			// 					element_type	: "div",
			// 					class_name		: "line_full",
			// 					parent			: parent
			// 				})
			// 			// name
			// 				if (data.name) {
			// 					common.create_dom_element({
			// 						element_type	: "span",
			// 						class_name		: class_name+" golden-color",
			// 						inner_html		: prepend + " " + data.name,
			// 						parent			: line
			// 					})
			// 				}
			// 			// ref_auction_date
			// 				if (data.date) {
			// 					common.create_dom_element({
			// 						element_type	: "span",
			// 						class_name		: class_name+" golden-color",
			// 						inner_html		: " " + data.date,
			// 						parent			: line
			// 					})
			// 				}
			// 			// number
			// 				if (data.number) {
			// 					common.create_dom_element({
			// 						element_type	: "span",
			// 						class_name		: class_name+" golden-color",
			// 						inner_html		: " "+(tstring.n || "nº") +" "+ data.number,
			// 						parent			: line
			// 					})
			// 				}

			// 			return true
			// 		}
			// 		if (data.ref_auction_group) {
			// 			for (let i = 0; i < data.ref_auction_group.length; i++) {
			// 				draw_auction(data.ref_auction_group[i], wrapper, "identify_coin", '')
			// 			}
			// 		}
			// 		if (data.ref_related_coin_auction_group) {
			// 			for (let i = 0; i < data.ref_related_coin_auction_group.length; i++) {
			// 				draw_auction(data.ref_related_coin_auction_group[i], wrapper, "identify_coin", '= ')
			// 			}
			// 		}

			// 	// public_info
			// 		if (data.public_info && data.public_info.length>0){

			// 			const label = (tstring.public_info || "Public_info") + ": "
			// 			common.create_dom_element({
			// 				element_type	: "div",
			// 				inner_html		: label + data.public_info,
			// 				parent			: wrapper
			// 			})
			// 		}

			// 	// biblio
			// 		const references_container = common.create_dom_element({
			// 			element_type	: "div",
			// 			class_name		: "references",
			// 			parent			: wrapper
			// 		})
			// 		const ar_references = data.bibliography_data
			// 		references_container.appendChild(
			// 			self.draw_bibliographic_reference(ar_references)
			// 		)

			// 	// uri
			// 		const uri		= page_globals.__WEB_ROOT_WEB__ + "/coin/" + data.section_id
			// 		const full_url	= page_globals.__WEB_BASE_URL__ + uri
			// 		const uri_text	= "<a class=\"icon_link\" href=\""+uri+"\"> URI </a>"
			// 		common.create_dom_element({
			// 			element_type	: "div",
			// 			class_name		: "uri-text",
			// 			inner_html		: uri_text,
			// 			parent			: wrapper
			// 		})

			// }//end draw_coin


			// coins group iterate
				const coins_group_length = data.length;
				for (let i = 0; i < coins_group_length; i++) {

					const el			= data[i];
					const coinsLenght	= el.coins
						? el.coins.length
						: 0;

					if (coinsLenght<1) {
						continue; // ignore empty coins
					}

					if (el.typology_id==1) continue; // ignore identify images typology

					// typology label
					const typology_name	= el.typology;
					common.create_dom_element({
						element_type 	: "div",
						class_name 		: "medium_label",
						text_content 	: typology_name+" ("+coinsLenght+")",
						parent 			: line
					});

					const typology_coins = common.create_dom_element({
						element_type	: "div",
						class_name		: "coins_list typology_coins gallery",
						parent			: line
					});

					const coins			= el.coins;
					const coins_length	= coins.length;
					for (let j = 0; j < coins_length; j++) {
						const coin_section_id	= coins[j];

						const coin_data = item.ref_coins_union.find(element => element.section_id==coin_section_id);
						if (coin_data) {
							// draw_coin(coin_data, typology_coins)
							const coin_node = self.draw_coin(coin_data);
							typology_coins.appendChild(coin_node);
						}
					}
				}


			return line
		},//end items_list



		draw_coin : function(data) {

			const self = this;

			// load_hires. When thumb is loaded, this event is triggered
			function load_hires() {

				this.removeEventListener("load", load_hires, false);

				const image = this;
				const hires = this.hires;
				setTimeout(()=>{
					requestAnimationFrame(()=>{
						image.src = hires;
					});
				}, 1000);
			}

			const wrapper = common.create_dom_element({
				element_type	: "div",
				class_name		: "sorted_coin"
			});

			// images

				// obverse
				const images = common.create_dom_element({
					element_type	: "div",
					class_name		: "images_wrapper",
					parent			: wrapper
				});
				const image_link_obverse = common.create_dom_element({
					element_type	: "a",
					class_name		: "image_link",
					href			: data.image_obverse,
					parent			: images
				});
				const image_obverse = common.create_dom_element({
					element_type	: "img",
					src				: data.image_obverse_thumb,
					title 			: data.section_id,
					loading			: "lazy",
					parent			: image_link_obverse
				});
				image_obverse.hires = data.image_obverse;
				image_obverse.addEventListener("load", load_hires, false);

				// reverse
				const image_link_reverse = common.create_dom_element({
					element_type	: "a",
					class_name		: "image_link",
					href			: data.image_reverse,
					parent			: images
				});
				const image_reverse = common.create_dom_element({
					element_type	: "img",
					src				: data.image_reverse_thumb,
					title 			: data.section_id,
					loading			: "lazy",
					parent			: image_link_reverse
				});
				image_reverse.hires = data.image_reverse;
				image_reverse.addEventListener("load", load_hires, false);

			// additional_info
				// Additional info is calculated only by thesaurus -> countermarks
				if (data.additional_info && (data.additional_info.mint || data.additional_info.type)) {
					const additional_info = common.create_dom_element({
						element_type	: 'div',
						class_name		: 'additional_info',
						parent			: wrapper
					});
					// mint
						if (data.additional_info.mint) {
							common.create_dom_element({
								element_type	: 'span',
								class_name		: 'additional_info_item mint',
								inner_html		: data.additional_info.mint,
								parent			: additional_info
							});
						}
					// type
						if (data.additional_info.type) {
							const type_string = page.compose_catalog_id({
								archive		: page_globals.OWN_CATALOG_ACRONYM,
								section_id	: data.type_section_id,
								mint_number	: data.additional_info.mint_number,
								type		: data.additional_info.type
							});
							common.create_dom_element({
								element_type	: 'span',
								class_name		: 'additional_info_item type',
								inner_html		: type_string,
								parent			: additional_info
							});
						}
				}

			// collection
				if (data.collection && data.collection.length>0){

					const collection_former = (data.former_collection && data.former_collection.length>0)
						? data.collection + " ("+data.former_collection+")"
						: data.collection;

					const collection_label = (data.number && data.number.length>0)
						? collection_former+ " "+ data.number
						: collection_former;

					//put gallery attributes to img
					image_obverse.setAttribute("data-caption",collection_label);
					image_reverse.setAttribute("data-caption",collection_label);

					common.create_dom_element({
						element_type	: "div",
						class_name		: "golden-color",
						inner_html		: collection_label,
						parent			: wrapper
					});
				}

			// auction
				function draw_auction(data, parent, class_name, prepend) {

					if (data.name.length<1) return
					let auctionGalleryAttributes = "";

					// line
						const line = common.create_dom_element({
							element_type	: "div",
							class_name		: "line_full",
							parent			: parent
						});
					// name
						if (data.name) {
							auctionGalleryAttributes += prepend + " " + data.name;
							common.create_dom_element({
								element_type	: "span",
								class_name		: class_name+" golden-color",
								inner_html		: prepend + " " + data.name,
								parent			: line
							});
						}
					// ref_auction_date
						if (data.date) {
							auctionGalleryAttributes += " " + data.date;
							common.create_dom_element({
								element_type	: "span",
								class_name		: class_name+" golden-color",
								inner_html		: " " + data.date,
								parent			: line
							});
						}
					// number
						if (data.number) {
							auctionGalleryAttributes += ", "+ data.number;
							common.create_dom_element({
								element_type	: "span",
								class_name		: class_name+" golden-color",
								inner_html		: ", "+ data.number,
								parent			: line
							});
						}

					// lot
						if (data.lot) {
							auctionGalleryAttributes += ", "+(tstring.lot || 'lot') +" "+ data.lot;
							common.create_dom_element({
								element_type	: "span",
								class_name		: class_name+" golden-color",
								inner_html		: ", "+(tstring.lot || 'lot') +" "+ data.lot,
								parent			: line
							});
						}

						image_obverse.setAttribute("data-caption",auctionGalleryAttributes);
						image_reverse.setAttribute("data-caption",auctionGalleryAttributes);

					return true
				}

			// photographer. Get image photographer

				// (!) COMMENTED : UNFEASIBLE FOR MAP . REMOVED 14-03-2022 UNTIL RESOLVE IT IN A VIABLE WAY
					// const observer = new IntersectionObserver(async function(entries) {
					// 	const entry = entries[1] || entries[0]
					// 	if (entry.isIntersecting===true || entry.intersectionRatio > 0) {
					// 		observer.disconnect();

					// 		self.get_image_data({
					// 			section_id : JSON.parse(data.image_obverse_data)[0]
					// 		})
					// 		.then(function(result){
					// 			if (result[0] && result[0].photographer) {
					// 				const currentAttr = image_obverse.getAttribute("data-caption")
					// 				image_obverse.setAttribute("data-caption", currentAttr + '<spam> | </spam> <i class="fa fa-camera"></i> ' + result[0].photographer)
					// 			}
					// 		})
					// 	}
					// }, { threshold: [0] });
					// observer.observe(image_obverse);

				// direct from DDBB, column 'photographer'
					if (data.photographer) {
						const currentAttr = image_obverse.dataset.caption || '';
						image_obverse.setAttribute("data-caption", currentAttr + '<spam> | </spam> <i class="fa fa-camera"></i> ' + data.photographer);
					}

				/*
				self.get_image_data({
					section_id : JSON.parse(data.image_reverse_data)[0]
				})
				.then(function(result){
					const image_reverse_photographer = result.photographer
				})
				*/
				//END GET IMAGE PHOTOGRAPHER

				if (data.ref_auction_group) {
					for (let i = 0; i < data.ref_auction_group.length; i++) {

						// re-enable add lot 26-10-2024
						data.ref_auction_group[i].lot = data.number;

						draw_auction(data.ref_auction_group[i], wrapper, "identify_coin", '');
					}
				}

				if (data.ref_related_coin_auction_group) {
					for (let i = 0; i < data.ref_related_coin_auction_group.length; i++) {

						draw_auction(data.ref_related_coin_auction_group[i], wrapper, "identify_coin", '= ');
					}
				}

			// size. weight / dies / diameter
				const ar_beats = [];
				if (data.weight && data.weight.length>0) {
					ar_beats.push( data.weight.replace('.', ',') + " g" );
				}
				if (data.diameter && data.diameter.length>0) {
					ar_beats.push( data.diameter.replace('.', ',') + " mm" );
				}
				if (data.dies && data.dies.length>0) {
					ar_beats.push( data.dies + " h" );
				}
				const size_text = ar_beats.join("; ");
				common.create_dom_element({
					element_type	: "div",
					class_name		: "",
					inner_html		: size_text,
					parent			: wrapper
				});

			// findspots + hoard
				const ar_find = [];
				let label = "";
				if(data.hoard){
					const hoard = (data.hoard_place)
						? data.hoard + " ("+data.hoard_place+")"
						: data.hoard;
					label = (tstring.hoard || "Hoard")+": ";
					ar_find.push( hoard );
				}
				if(data.findspot){
					const findspot = (data.findspot_place)
						? data.findspot + " ("+data.findspot_place+")"
						: data.findspot;
					label = (tstring.findspot || "Findspot")+": ";
					ar_find.push( findspot );
				}

				const find_text = ar_find.join(" | ");
				common.create_dom_element({
					element_type	: "div",
					class_name		: "",
					inner_html		: label+find_text,
					parent			: wrapper
				});

			// public_info
				if (data.public_info && data.public_info.length>0){

					// const label = (tstring.public_info || "Public_info") + ": "
					common.create_dom_element({
						element_type	: "div",
						inner_html		: data.public_info, //label + data.public_info,
						parent			: wrapper
					});
				}

			// technique
				if (data.technique && data.technique.length>0){

					const label = (tstring.technique || "Technique") + ": ";
					common.create_dom_element({
						element_type	: "div",
						inner_html		: label + data.technique,
						parent			: wrapper
					});
				}

			// countermarks
				const countermarks = common.create_dom_element({
					element_type	: "div",
					class_name		: "countermarks_wrapper",
					parent			: wrapper
				});

			// countermark_obverse
				if (data.countermark_obverse && data.countermark_obverse.length>0){

					const node = common.create_dom_element({
						element_type	: "span",
						class_name		: "countermark_obverse",
						inner_html		: data.countermark_obverse,
						parent			: countermarks
					});

					// make images clickable to open thesaurus record
					page.make_images_links(node);
				}

			// countermark_reverse
				if (data.countermark_reverse && data.countermark_reverse.length>0){

					const node = common.create_dom_element({
						element_type	: "span",
						class_name		: "countermark_reverse",
						inner_html		: data.countermark_reverse,
						parent			: countermarks
					});

					// make images clickable to open thesaurus record
					page.make_images_links(node);
				}

			// bibliography
				const references_container = common.create_dom_element({
					element_type	: "div",
					class_name		: "references",
					parent			: wrapper
				});


				const ar_references = data.bibliography_data;
				if (ar_references && ar_references.length>0 && typeof ar_references[0]==='object') {
					const biblio_node = self.draw_bibliographic_reference(ar_references);
					if (biblio_node) references_container.appendChild(biblio_node);
				}

			// uri
				const uri		= page_globals.__WEB_ROOT_WEB__ + "/coin/" + data.section_id;
				page_globals.__WEB_BASE_URL__ + uri;
				const uri_text	= '<a class="icon_link" target="_blank" href="' +uri+ '"> '+page_globals.OWN_CATALOG_ACRONYM +' </a>';
				common.create_dom_element({
					element_type	: "span",
					class_name		: "uri-text",
					inner_html		: uri_text,
					parent			: wrapper
				});

			// collection uri
				if (data.uri && data.uri.length>0) {
					for (let i = 0; i < data.uri.length; i++) {

						const el		= data.uri[i];
						el.label || "URI";
						const uri_text	= `<a class="icon_link info_value" href="${el.value}" target="_blank"> ${el.label} </a>`;

						common.create_dom_element({
							element_type	: "span",
							class_name		: "",
							inner_html		: uri_text,
							parent			: wrapper
						});

					}
				}


			return wrapper
		},//end draw_coin


		// DES
			// get_image_data : function(options) {
			// 	const self = this

			// 	const section_id = options.section_id

			// 	// vars
			// 		const sql_filter	= 'section_id=' + parseInt(section_id)
			// 		const ar_fields		= ['*']

			// 	return new Promise(function(resolve){

			// 		// request
			// 		const request_body = {
			// 			dedalo_get	: 'records',
			// 			table		: 'images',
			// 			ar_fields	: ar_fields,
			// 			lang		: page_globals.WEB_CURRENT_LANG_CODE,
			// 			sql_filter	: sql_filter,
			// 		}
			// 		data_manager.request({
			// 			body : request_body
			// 		})
			// 		.then(function(response){
			// 			resolve(response.result)
			// 		})
			// 	})
			// },

		draw_bibliographic_reference : function(data) {

			const bib_fragment = new DocumentFragment;

			const ref_biblio		= data;
			const ref_biblio_length	= ref_biblio ? ref_biblio.length : 0;
			for (let i = 0; i < ref_biblio_length; i++) {

				// build full ref biblio node
				const biblio_row_node = biblio_row_fields.render_row_bibliography(ref_biblio[i]);

				const biblio_row_wrapper = common.create_dom_element({
					element_type	: "div",
					class_name		: "bibliographic_reference",
					parent			: bib_fragment
				});
				biblio_row_wrapper.appendChild(biblio_row_node);
			}

			return bib_fragment
		},//end draw_bibliographic_reference



		hoards_and_findspots : function(item, name) {
			if(SHOW_DEBUG===true) ;

			const self = this;

			// line
				const line = common.create_dom_element({
					element_type	: "div",
					id				: "findspots",
					class_name		: "info_line " + name
				});
				// common.when_in_dom(line, function(){line.scrollIntoView(false);})

			// map_container
				const map_container = common.create_dom_element({
					element_type	: "div",
					class_name		: "map_container hide_opacity map",
					parent			: line
				});

			function draw_coin_inside(data, container) {

				const wrapper = common.create_dom_element({
					element_type	: "div",
					class_name		: "find_coin",
					parent			: container
				});

				// images

					const images = common.create_dom_element({
						element_type	: "div",
						class_name		: "images_wrapper",
						parent			: wrapper
					});
					const image_link_obverse = common.create_dom_element({
						element_type	: "a",
						class_name		: "image_link",
						href			: data.image_obverse,
						parent			: images
					});
					const image_obverse = common.create_dom_element({
						element_type	: "img",
						src				: data.image_obverse,
						title 			: data.section_id,
						dataset 		: {
							caption: self.type + ' | '+ self.equivalents
						},
						parent			: image_link_obverse
					});
					image_obverse.loading="lazy";

					const image_link_reverse = common.create_dom_element({
						element_type	: "a",
						class_name		: "image_link",
						href			: data.image_reverse,
						parent			: images
					});
					const image_reverse = common.create_dom_element({
						element_type	: "img",
						src				: data.image_reverse,
						title 			: data.section_id,
						dataset 		: {
							caption: self.type + ' | ' + self.equivalents
						},
						parent			: image_link_reverse
					});
					image_reverse.loading="lazy";

				// info
					const info = common.create_dom_element({
						element_type	: "div",
						class_name		: "info_wrapper",
						parent			: wrapper
					});
					// collection
						common.create_dom_element({
							element_type	: "div",
							class_name		: "",
							inner_html		: data.collection,
							parent			: info
						});
					// size_text. weight / dies / diameter
						const ar_beats = [];
						if (data.weight && data.weight.length>0) {
							ar_beats.push( data.weight.replace('.', ',') + " g" );
						}

						if (data.diameter && data.diameter.length>0) {
							ar_beats.push( data.diameter.replace('.', ',') + " mm" );
						}
						if (data.dies && data.dies.length>0) {
							ar_beats.push( data.dies + " h" );
						}
						const size_text = ar_beats.join("; ");
						common.create_dom_element({
							element_type	: "div",
							class_name		: "",
							inner_html		: size_text,
							parent			: info
						});
					// uri
						const uri		= page_globals.__WEB_ROOT_WEB__ + "/coin/" + data.section_id;
						page_globals.__WEB_BASE_URL__ + uri;
						const uri_text	= '<a class="icon_link" target="_blank" href="' +uri+ '"> '+page_globals.OWN_CATALOG_ACRONYM +' </a>';
						common.create_dom_element({
							element_type	: "span",
							class_name		: "",
							inner_html		: uri_text,
							parent			: info
						});


					//collection uri
						if (data.uri && data.uri.length>0) {
							for (let i = 0; i < data.uri.length; i++) {

								const el = data.uri[i];
								el.label || "URI";
								const uri_text	= '<a class="icon_link info_value" href="' + el.value + '" target="_blank"> ' + el.label  + '</a>';

								common.create_dom_element({
									element_type	: "span",
									class_name		: "",
									inner_html		: uri_text,
									parent			: info
								});

							}
						}
					// hoard
						common.create_dom_element({
							element_type	: "div",
							class_name		: "",
							inner_html		: data.hoard,
							parent			: info
						});
					// biblio
						const references_container = common.create_dom_element({
							element_type	: "div",
							class_name		: "references",
							parent			: info
						});
						const ar_references = data.bibliography_data;
						references_container.appendChild(
							self.draw_bibliographic_reference(ar_references)
						);

			}//end draw_coin_inside


			// map, global array with all map data and cache for resolve section_id
				const map_data				= [];
				const findspots_solved		= [];
				const hoards_solved			= [];

			// hoards
				const hoards_data			= item.ref_coins_hoard_data;
				const hoards_data_length	= hoards_data.length;

				if (hoards_data_length) {
					const hoard_label = self.label(item, tstring.hoards);
					line.appendChild( hoard_label );
					const hoard_container = common.create_dom_element({
						element_type	: "div",
						class_name		: "hoard_container",
						parent			: line
					});
					hoard_label.addEventListener("mouseup", (event) => {
						event.preventDefault();
						hoard_container.classList.toggle("hide");
					});


					for (let i = 0; i < hoards_data_length; i++) {

						const hoard			= hoards_data[i];
						const coins			= JSON.parse(hoard.coins) || [];
						const coins_length	= coins.length;

						if (coins_length<1) {
							console.warn("! Skipped hoard without zero coins :", hoards_data);
							continue;
						}

						if (hoards_solved.find(section_id => section_id==hoard.section_id)) {
							continue;
						}

						const wrapper = common.create_dom_element({
							element_type	: "div",
							class_name		: "find_wrapper hoard",
							parent			: hoard_container
						});

						// title
							common.create_dom_element({
								element_type	: "span",
								inner_html		: " " + (hoard.name || "") + " (" + (hoard.place || "") + ") ",
								parent			: wrapper
							});
						// items (ejemplares)
							const items = common.create_dom_element({
								element_type	: "span",
								text_content	: " | ",
								parent			: wrapper
							});
						// draw coins inside
							const typology_coins = common.create_dom_element({
								element_type	: "div",
								class_name		: "find_coins hoard gallery",
								parent			: hoard_container
							});
							const ar_coins = [];
							for (let j = 0; j < coins_length; j++) {
								const coin_section_id	= coins[j];
								const current_coin		= item.coin_references.find(el => el.section_id==coin_section_id);
								if (current_coin) {
									draw_coin_inside(current_coin, typology_coins);
									ar_coins.push(coin_section_id);
								}
							}

							// replace text into the items
							items.innerHTML = items.innerHTML + ar_coins.length +" "+ (tstring.of || "of") +" "+ coins_length +" "+ (tstring.coins || "coins");


						// map data
							const hoard_data_map = JSON.parse(hoard.map);
							if (hoard_data_map) {
								map_data.push({
									section_id		: hoard.section_id,
									name			: hoard.name,
									place			: hoard.place,
									georef_geojson	: hoard.georef_geojson,
									data			: hoard_data_map,
									items			: ar_coins.length,
									total_items		: coins_length,
									type			: 'hoard',
									marker_icon		: page.maps_config.markers.hoard
								});
							}

						// store already solved
							hoards_solved.push(hoard.section_id);
					}// end for
				}// end if

			// findspots
				const findspots_data		= item.ref_coins_findspots_data;
				const findspots_data_length	= findspots_data.length;

				if(findspots_data_length){
					const findspots_label = self.label(item, tstring.findspots);
					line.appendChild( findspots_label );


					const findspots_container = common.create_dom_element({
						element_type	: "div",
						class_name		: "findspots_container",
						parent			: line
					});

					findspots_label.addEventListener("mouseup", (event) => {
						event.preventDefault();
						findspots_container.classList.toggle("hide");
					});

					for (let i = 0; i < findspots_data_length; i++) {

						const findspot		= findspots_data[i];
						const coins			= JSON.parse(findspot.coins) || [];
						const coins_length	= coins.length;

						if (coins_length<1) {
							console.warn("! Skipped findspot without zero coins :", findspots_data);
							continue;
						}

						if (findspots_solved.find(section_id => section_id==findspot.section_id)) {
							continue;
						}

						// findspot wrapper
							const wrapper = common.create_dom_element({
								element_type	: "div",
								class_name		: "find_wrapper findspot",
								parent			: findspots_container
							});

						// title
							common.create_dom_element({
								element_type	: "span",
								inner_html		: " " + (findspot.name || "") + " (" + (findspot.place || "") + ") ",
								parent			: wrapper
							});
						// link (falta hacer tpl 'findspots')
							// common.create_dom_element({
							// 	element_type	: "a",
							// 	class_name		: "icon_link_after",
							// 	inner_html		: " " + (findspot.name || "") + " (" + (findspot.place || "") + ") ",
							// 	target			: '_blank',
							// 	href			: '../hoard/' + findspot.section_id,
							// 	parent			: wrapper
							// })
						// items (ejemplares)
							const items = common.create_dom_element({
								element_type	: "span",
								text_content	: " | ",
								parent			: wrapper
							});
						// draw coin inside
							const typology_coins = common.create_dom_element({
								element_type	: "div",
								class_name		: "find_coins findspot gallery",
								parent			: findspots_container
							});

							const ar_coins = [];
							for (let j = 0; j < coins_length; j++) {
								const coin_section_id	= coins[j];
								const current_coin		= item.coin_references.find(el => el.section_id==coin_section_id);
								if (current_coin) {
									draw_coin_inside(current_coin, typology_coins);
									ar_coins.push(coin_section_id);
								}
							}

							// map data
							const findspot_data_map = JSON.parse(findspot.map);
							if (findspot_data_map) {
								map_data.push({
									section_id		: findspot.section_id,
									name			: findspot.name,
									place			: findspot.place,
									georef_geojson	: findspot.georef_geojson,
									data			: findspot_data_map,
									items			: ar_coins.length,
									total_items		: coins_length,
									type			: 'findspot',
									marker_icon		: page.maps_config.markers.findspot
								});
							}

						// replace text into the items
							items.innerHTML = items.innerHTML + ar_coins.length +" "+ (tstring.of || "of") +" "+ coins_length +" "+ (tstring.coins || "coins");

						// store already solved
							findspots_solved.push(findspot.section_id);
					}
				}//end findspots

			// mints
				const mint_data			= item.mint_data || [];
				const mint_data_length	= mint_data.length;
				if(mint_data_length>0){

					for (let i = 0; i < mint_data_length; i++) {

						const mint			= mint_data[i];
						const coins			= JSON.parse(mint.relations_coins) || [];
						const coins_length	= coins.length;

						// cross all mint coins with curertn type coin_references
							const ar_coins = [];
							for (let j = 0; j < coins_length; j++) {
								const coin_section_id	= coins[j];
								const current_coin		= item.coin_references.find(el => el.section_id==coin_section_id);
								if (current_coin) {
									ar_coins.push(coin_section_id);
								}
							}

						// map data
						const mint_data_map = JSON.parse(mint.map);
						if (mint_data_map) {
							map_data.push({
								section_id		: mint.section_id,
								name			: mint.name,
								place			: mint.place,
								georef_geojson	: mint.georef_geojson,
								data			: mint_data_map,
								items			: ar_coins.length,
								total_items		: coins_length,
								type			: 'mint',
								marker_icon		: page.maps_config.markers.mint
							});
						}
					}
				}//end mints_data



			// draw map
				if (map_data.length>0) {
					common.when_in_dom(map_container, draw_map);
					if(SHOW_DEBUG===true) {
						console.log('type row fields map_data:', map_data);
					}
					function draw_map() {
						self.caller.draw_map({
							container		: map_container,
							map_position	: null, // use default position
							map_data		: map_data
						});
					}
				}else {
					map_container.remove();
				}


			return line
		},//end findspots



		mint : function(item) {

			// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line mint"
			});

			if (item.mint && item.mint.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.mint || "Mint",
					parent 			: line
				});

				const mint_text = row_object.mint;
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: mint_text,
					parent 			: line
				});
			}


			return line
		},//end mint



		authors_alt : function(item) {

			// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line authors_alt"
			});

			if (item.authors_alt && item.authors_alt.length>0) {

				const authors_alt		= item.authors_alt || "";
				const final_authors_alt = " (" + authors_alt + "). ";

				// DOM node
					common.create_dom_element({
						element_type 	: "div",
						class_name 		: "info_value authors_alt",
						text_content 	: final_authors_alt,
						parent 			: line
					});
			}


			return line
		},//end authors_alt



		publication_date : function(item) {

			const line = common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_line publication_date"
			});

			if (item.publication_date) {

				const ar_date 	= item.publication_date.split("-");
				let final_date 	= parseInt(ar_date[0]);

				if( typeof(ar_date[1]!=="undefined") && parseInt(ar_date[1]) > 0 ) {
					final_date = final_date + "-" + parseInt(ar_date[1]);
				}
				if( typeof(ar_date[2]!=="undefined") && parseInt(ar_date[2]) > 0 ) {
					final_date = final_date + "-" + parseInt(ar_date[2]);
				}

				final_date = " (" + final_date + "). ";

				common.create_dom_element({
					element_type 	: "div",
					class_name 		: "info_value",
					text_content 	: final_date,
					parent 			: line
				});

				line.classList.remove("hide");
			}

			return line
		},//end publication_date



		title : function(item) {

			const typology = this.get_typology(item);

			// title
				const title			= item.title || "";
				const title_style	= (typology=='1' || typology=='20' || typology=='28' || typology=='30'|| typology=='32')
					? " italic"
					: "";

			// pdf data
				// const pdf_uri			= item.pdf || '[]'
				// const ar_pdf_uri		= JSON.parse(pdf_uri)
				// const ar_pdf_uri_length	= ar_pdf_uri.length

			// line
				const line = common.create_dom_element({
					element_type	: "div",
					class_name		: "info_line title"
				});

			// title
				const title_final = " " + title + ". ";
				common.create_dom_element({
					element_type	: "div",
					class_name		: "" + title_style,
					text_content	: title_final,
					parent			: line
				});

			// pdf_uri
				// for (let i = 0; i < ar_pdf_uri_length; i++) {

				// 	const pdf_item = ar_pdf_uri[i]

				// 	common.create_dom_element({
				// 		element_type	: "div",
				// 		class_name		: "pdf",
				// 		title			: pdf_item.title,
				// 		// text_content	: pdf_item.title,
				// 		// href			: pdf_item.iri,
				// 		parent			: line
				// 	}).addEventListener("click",(e) => {
				// 		window.open(pdf_item.iri, "PDF", "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes");
				// 	})
				// }


			return line
		},//end title



		editor : function(item) {

			// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line editor"
			});

			// editor
			if (item.editor && item.editor.length>0) {

				const en = tstring.en || "En";
				const editor = " " + en + " " + item.editor + ", ";

				common.create_dom_element({
					element_type 	: "div",
					class_name 		: "info_value",
					text_content 	: editor,
					parent 			: line
				});
			}


			return line
		},//end editor



		title_secondary : function(item) {

			// const typology = this.get_typology(item)

			// title_secondary
				const title_secondary = item.title_secondary || "";

			// line
				const line = common.create_dom_element({
					element_type	: "div",
					class_name		: "info_line row_title"
				});

			// title_secondary
				if (title_secondary.length>0) {
					const title_secondary_final = " " + title_secondary + " ";
					common.create_dom_element({
						element_type	: "div",
						class_name		: "title_secondary italic",
						text_content	: title_secondary_final,
						parent			: line
					});
				}


			return line
		},//end title_secondary



		magazine : function(item) {

			// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line magazine"
			});

			// magazine
			if (item.magazine && item.magazine.length>0) {

				const magazine_final = " " + item.magazine + ", ";
				common.create_dom_element({
					element_type 	: "div",
					class_name 		: "info_value italic",
					text_content 	: magazine_final,
					parent 			: line
				});
			}


			return line
		},//end magazine



		serie : function(item) {

			// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line serie"
			});

			// serie
			if (item.serie && item.serie.length>0) {

				const serie_text = (!item.copy || item.copy.length<1)
					? " " + item.serie + ", "
					: " " + item.serie + "";

				common.create_dom_element({
					element_type 	: "div",
					class_name 		: "info_value italic",
					text_content 	: serie_text,
					parent 			: line
				});
			}


			return line
		},//end serie



		copy : function(item) {

			// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line copy"
			});

			// copy
			if (item.copy && item.copy.length>0) {

				const copy = " (" + item.copy + "), ";

				common.create_dom_element({
					element_type 	: "div",
					class_name 		: "info_value",
					text_content 	: copy,
					parent 			: line
				});
			}


			return line
		},//end copy



		physical_description : function(item) {

			// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line physical_description"
			});

			// physical_description
			if (item.physical_description && item.physical_description.length>0) {

				const physical_description = " " + item.physical_description + ". ";

				common.create_dom_element({
					element_type 	: "div",
					class_name 		: "info_value",
					text_content 	: physical_description,
					parent 			: line
				});
			}


			return line
		},//end physical_description



		editorial : function(item) {

			// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line editorial"
			});

			// editorial
			if (item.editorial && item.editorial.length>0) {

				const editorial = " " + item.editorial + ". ";

				common.create_dom_element({
					element_type 	: "div",
					class_name 		: "info_value",
					text_content 	: editorial,
					parent 			: line
				});
			}


			return line
		},//end editorial



		url : function(item) {

			// line
				const line = common.create_dom_element({
					element_type	: "div",
					class_name		: "info_line url"
				});

			// url_data
				const url_data = item.url_data;
				if (url_data && url_data.length>0) {

					const ar_url_data 		 = JSON.parse(url_data);
					const ar_url_data_length = ar_url_data.length;
					for (let i = 0; i < ar_url_data_length; i++) {

						const url_item = ar_url_data[i];

						const title = (url_item.title && url_item.title.length>1)
							? url_item.title
							: url_item.iri;

						const link = common.create_dom_element({
							element_type	: "a",
							class_name		: "url_data",
							title			: title,
							text_content	: title,
							href			: url_item.iri,
							parent			: line
						});
						link.setAttribute('target', '_blank');

						if ( !(i%2) && i<ar_url_data_length && ar_url_data_length>1 ) {
							common.create_dom_element({
								element_type	: "span",
								class_name		: "separator",
								text_content	: " | ",
								parent			: line
							});
						}
					}
				}


			return line
		},//end url



		place : function(item) {

			// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line place"
			});

			// place
			if (item.place && item.place.length>0) {

				common.create_dom_element({
					element_type 	: "div",
					class_name 		: "info_value",
					text_content 	: item.place,
					parent 			: line
				});
			}


			return line
		},//end place



		descriptors : function(item) {

			// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line descriptors"
			});

			// descriptors
			if (item.descriptors && item.descriptors.length>0) {

				common.create_dom_element({
					element_type 	: "div",
					class_name 		: "info_value",
					text_content 	: item.descriptors,
					parent 			: line
				});
			}


			return line
		},//end descriptors



		typology_name : function(item) {

			// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line typology_name"
			});

			// typology_name
			if (item.typology_name && item.typology_name.length>0) {

				common.create_dom_element({
					element_type 	: "div",
					class_name 		: "info_value",
					text_content 	: item.typology_name,
					parent 			: line
				});
			}


			return line
		},//end typology_name



		/**
		* CREATE A FLOAT PROMPT WITH DESCRIPTION AND RELATED LINKS
		* Creates a floating popup attached to a parent element that displays
		* term information, definition, and external URIs. Clicking the parent
		* shows the popup; a close button hides it.
		*
		* @param {Object} item
		* 	The data item containing reference data and optional material info.
		* 	Expected structure: { [data_ref]: Array<{table, term, definition?, iri?}>, material? }
		* @param {HTMLElement} parentNode
		* 	The DOM element that triggers the popup on click. Receives pointer/underline styling.
		* @param {string} data_ref
		* 	Key in item object referencing the data array (e.g., 'material_data', 'mint_data').
		* 	When 'material_data', uses item.material as psqo_value instead of item[data_ref][0].term.
		*
		* @returns {void}
		*
		* @example
		* 	type_row_fields.create_float_prompt(item, spanElement, 'material_data')
		*/
		create_float_prompt : function (item, parentNode, data_ref){

			const safe_item			= item ?? {};
			const data_array		= safe_item[data_ref];
			const first_data_item	= Array.isArray(data_array) && data_array.length > 0
				? data_array[0]
				: null;

			if (!first_data_item) {
				return
			}

			parentNode.classList.add("active-pointer");
			parentNode.classList.add("underline-text");

			const main_node = document.getElementById("main");
			if (!main_node) {
				return
			}

			const float_prompt = common.create_dom_element({
				element_type	: "div",
				class_name		: "float-prompt hide",
				parent 			: main_node
			});

			const table = first_data_item.table ?? 'unknown';

			// field and id
			let field;
			let id;
			switch (table) {
				case 'ts_object':
					field = 'denomination';
					id = 'denomination';
					break
				default:
					field = table;
					id = table;
					break
			}

			// value
			const value = data_ref === "material_data"
				? (safe_item.material ?? '')
				: (first_data_item.term ?? '');

			// psqo
			const psqo = {
				"$and": [{
					"id"		: id,
					"field"		: field,
					"q"			: value,
					"q_type"	: "q_selected",
					"op"		: "="
				}]
			};

			if(SHOW_DEBUG) {
				console.log("item", safe_item);
				console.log("data_ref", data_ref);
				console.log("psqo", psqo);
			}

			const parse_psqo	= psqo_factory.encode_psqo(psqo);
			const catalog_url	= page_globals.__WEB_ROOT_WEB__+"/catalog/?psqo="+ parse_psqo;

			const prompt_term = first_data_item.term ?? '';
			common.create_dom_element({
				element_type	: "a",
				class_name		: "prompt-label underline-text",
				inner_html 		: prompt_term,
				href			: catalog_url,
				parent 			: float_prompt
			});

			const close_button = common.create_dom_element({
				element_type	: "div",
				class_name		: "close-button",
				parent 			: float_prompt
			});
			close_button.addEventListener("click", function(e){
				e.stopPropagation();
				float_prompt.classList.add("hide");
			});

			const definition = first_data_item.definition;
			if (definition) {
				common.create_dom_element({
					element_type	: "p",
					class_name		: "prompt-description",
					inner_html		: definition,
					parent 			: float_prompt
				});
			}

			const iri = first_data_item.iri;
			if (iri && iri.length > 0){
				const uris = page.split_data(iri, ' | ');
				for (let i=0; i<uris.length; i++){
					common.create_dom_element({
						element_type	: "a",
						class_name		: "image_link underline-text",
						target			: "_blank",
						href			: uris[i],
						inner_html		: uris[i],
						parent			: float_prompt
					});
				}
			}

			if(SHOW_DEBUG) {
				common.create_dom_element({
					element_type	: "pre",
					class_name		: "debug-info",
					inner_html		: JSON.stringify(psqo, null, 2),
					parent 			: float_prompt
				});
			}

			parentNode.addEventListener("click", function(e){
				e.stopPropagation();

				const float_prompts_list = document.getElementsByClassName("float-prompt");
				for (let i=0; i<float_prompts_list.length; i++){
					if (!float_prompts_list[i].classList.contains("hide")){
						float_prompts_list[i].classList.add("hide");
					}
				}

				float_prompt.style.left = e.clientX+'px';
				float_prompt.style.top = e.clientY+'px';
				float_prompt.classList.remove("hide");
			});
		}//end create_float_prompt



	};//end type_row_fields

	exports.type_row_fields = type_row_fields;

	return exports;

})({});
//# sourceMappingURL=type_row_fields-min.js.map
