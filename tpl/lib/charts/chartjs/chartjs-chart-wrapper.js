"use strict";

import { chart_wrapper } from "../chart-wrapper.js";

/**
 * Chart.js chart wrapper class
 * @class
 * @abstract
 * @param {Element} div_wrapper the div conatining the chart
 * @param {Object} options configuration options
 * @param {boolean} options.display_download whether to display the download panel (default `false`)
 * @param {boolean} options.display_control_panel whether to display the control panel (default `false`)
 * @extends chart_wrapper
 */
export function chartjs_chart_wrapper(div_wrapper, options) {
	if (this.constructor === chartjs_chart_wrapper) {
		throw new Error("Abstract class 'chartjs_chart_wrapper' cannot be instantiated")
	}
	chart_wrapper.call(this, div_wrapper, options)
	/**
	 * Canvas instance, will be created during
	 * render
	 * @type {HTMLCanvasElement}
	 * @protected
	 */
	this.canvas = undefined
	/**
	 * Chart instance (chart.js)
	 * @protected
	 */
	this.chart = undefined
}
// Set prototype chain
Object.setPrototypeOf(chartjs_chart_wrapper.prototype, chart_wrapper.prototype)

/**
 * Render the plot
 * 
 * Subclasses must call this method at the top
 * of their own implementation. Then, they can make
 * use of the canvas and the chartjs chart instance
 * @name chartjs_chart_wrapper#render_plot
 * @function
 * @protected
 */
chartjs_chart_wrapper.prototype.render_plot = function () {
	chart_wrapper.prototype.render_plot.call(this)
	// Create canvas
	this.canvas = common.create_dom_element({
		element_type: 'canvas',
		id: 'result_graph',
		class_name: 'o-blue',
		parent: this.plot_container,
	})
	// Set chart instance to undefined
	this.chart = undefined
}

/**
 * Get the supported chart export formats
 * @function
 * @returns {string[]} the supported formats
 * @name chartjs_chart_wrapper#get_supported_export_formats
 */
chartjs_chart_wrapper.prototype.get_supported_export_formats = function () {
	return ['png']
}

/**
 * Download the chart as png
 * @param {string} filename the name of the file
 * @function
 * @name chartjs_chart_wrapper#_download_chart_as_png
 */
chartjs_chart_wrapper.prototype.download_chart_as_png = function (filename) {
	/**
	 * Temporary link
	 * @type {Element}
	 */
	const tmpLink = common.create_dom_element({
		element_type: 'a',
		href: this.chart.toBase64Image(),
	})
	tmpLink.setAttribute('download', filename)
	tmpLink.click()
	tmpLink.remove()
}

/**
 * FIXME: this is not working...
 * Download the chart as svg
 * @param {string} filename the name of the file
 * @function
 * @name chartjs_chart_wrapper#_download_chart_as_svg
 */
chartjs_chart_wrapper.prototype.download_chart_as_svg = function (filename) {
	// Tweak C2S library
	this._tweak_c2s()
	// Get original width and height
	const width = this.canvas.offsetWidth
	const height = this.canvas.offsetHeight
	// TODO: Turn off responsiveness and animations
	this.chart.options.animation = false
	this.chart.options.reponsive = false
	// Replicate chart in C2S space
	const svgContext = C2S(width, height)
	const svgChart = new Chart(svgContext, this.chart.config._config)
	// Download
	/**
	 * Temporary link
	 * @type {Element}
	 */
	const tmpLink = common.create_dom_element({
		element_type: 'a',
		href: 'data:image/svg+xml;utf8,'
			+ encodeURIComponent(svgContext.getSerializedSvg()),
	})
	tmpLink.setAttribute('download', filename)
	tmpLink.click()
	tmpLink.remove()
	// TODO: Turn on responsiveness and animations
	this.chart.options.animation = true
	this.chart.options.reponsive = true
}

/**
 * Some tweaks to the canvas2svg library are required for svg export to work
 * 
 * Via: https://stackoverflow.com/questions/62249315/export-canvas-to-svg-file
 * @function
 * @private
 * @name chartjs_chart_wrapper#_tweak_c2s
 */
chartjs_chart_wrapper.prototype._tweak_c2s = function () {
	C2S.prototype.getContext = function (contextId) {
		if (contextId === '2d' || contextId === '2D') {
			return this;
		}
		return null;
	}
	C2S.prototype.style = function () {
		return this.__canvas.style;
	}
	C2S.prototype.getAttribute = function (name) {
		return this[name];
	}
	C2S.prototype.addEventListener = function (type, listener, eventListenerOptions) {
		// nothing to do here, but we need this function :)
	}
}