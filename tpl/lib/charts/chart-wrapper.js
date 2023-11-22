"use strict";

/**
 * Width (in pixels) of color picker
 * @type {number}
 */
export const COLOR_PICKER_WIDTH = 200

/**
 * Default name for the chart -> when exporting,
 * `<name>.<format>`
 * @type {string}
 */
const DEFAULT_CHART_NAME = 'chart'

/**
 * Color palette, totally stolen from matplotlib
 * @type {string[]}
 */
export const COLOR_PALETTE = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#17becf']


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
export function chart_wrapper(div_wrapper, options) {
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
	this.id = chart_wrapper._n_charts_created
	/**
	 * Div element wrapping the chart itself and
	 * the controls
	 * @type {Element}
	 * @protected
	 */
	this.div_wrapper = div_wrapper
	/**
	 * Whether to display the download panel
	 * @type {boolean}
	 * @private
	 */
	this._display_download = options.display_download || false
	/**
	 * Div container for chart download
	 * @type {Element}
	 * @private
	 */
	this._download_chart_container = undefined
	/**
	 * Div inside the div_wrapper, that just wraps the drawing
	 * @type {Element}
	 * @protected
	 */
	this.plot_container = undefined
	/**
	 * Whether to display the control panel
	 * @type {boolean}
	 * @private
	 */
	this._display_control_panel = options.display_control_panel || false
	/**
	 * Div container for user controls
	 * @type {Element}
	 * @private
	 */
	this._controls_container = undefined
	/**
	 * Div that expands and collapses the control panel
	 * @type {Element}
	 * @private
	*/
	this._controls_toggle = undefined
	/**
	 * Div that contains all control elements
	 * Used freely by each subclass
	 * @type {Element}
	 * @protected
	 */
	this.controls_content_container = undefined
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
}

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
	this.div_wrapper.replaceChildren()

	// Create the div for wrapping the plot
	this.render_plot()

	// Create the div for the control panel
	if (this._display_control_panel) {
		this.render_control_panel()
	}

	// Create the chart download section
	if (this._display_download) {
		this._render_download_panel()
	}
}

/**
 * Render the download panel to the DOM
 * @function
 * @private
 * @name chart_wrapper#_render_download_panel
 */
chart_wrapper.prototype._render_download_panel = function () {
	const supported_formats = this.get_supported_export_formats()
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
	})
	const format_select = common.create_dom_element({
		element_type	: 'select',
		id				: `${this.id_string()}_chart_export_format`,
		class_name		: 'chart_format_select',
		// style		: {
		// 	'width'		: '75%',
		// },
		parent			: this.download_chart_container,
		// TODO: add ARIA attributes?
	})
	for (const format of supported_formats) {
		common.create_dom_element({
			element_type	: 'option',
			value			: format,
			text_content	: format.toUpperCase(),
			parent			: format_select
		})
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
	})
	chart_download_button.addEventListener('click', () => {
		this.download_chart(format_select.value)
	})
}

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
	})
}

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
	const self = this
	this._controls_container = common.create_dom_element({
		element_type	: 'div',
		id				: `${this.id_string()}_control_panel`,
		class_name		: 'control_panel',
		parent			: this.div_wrapper
	})
	this._controls_toggle = common.create_dom_element({
		element_type	: 'div',
		id				: `${this.id_string()}_control_panel_toggle`,
		text_content	: tstring.control_panel || 'Control panel',
		class_name		: 'o-red control_panel_toggle opened',
		parent			: this._controls_container
	})
	this._controls_toggle.addEventListener('click', function(){
		self._controls_toggle.classList.toggle('opened')
		self.controls_content_container.classList.toggle('hide')
	})
	this.controls_content_container = common.create_dom_element({
		element_type	: 'div',
		id				: `${this.id_string()}_control_panel_content`,
		class_name		: 'o-green control_panel_content hide',
		parent			: this._controls_container
	})
}

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
	const filename = `${DEFAULT_CHART_NAME}.${format}`
	/**
	 * Function name for downloading with the particular format
	 * @type {string}
	 */
	const download_func_name = `download_chart_as_${format}`
	if (this[download_func_name] === undefined) {
		throw new Error(`${download_func_name} is not implemented!`)
	}
	this[download_func_name](filename)
}

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
}