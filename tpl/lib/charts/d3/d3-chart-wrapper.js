"use strict";

import { chart_wrapper } from "../chart-wrapper";

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
export function d3_chart_wrapper(div_wrapper, options) {
	if (this.constructor === d3_chart_wrapper) {
		throw new Error("Abstract class 'd3_chart_wrapper' cannot be instantiated")
	}
	chart_wrapper.call(this, div_wrapper, options)
	/**
	 * D3 selection object for the root `svg` tag
	 * @protected
	 */
	this.svg = undefined
	/**
	 * Whether to go beyond the width of the plot container
	 * @type {boolean}
	 * @private
	 */
	this._overflow = options.overflow || false
	/**
	 * Outer height of the plot, will be the height applied to the SVG
	 * @type {string}
	 * @private
	 */
	this._outer_height = options.outer_height || '500px'

}
// Set prototype chain
Object.setPrototypeOf(d3_chart_wrapper.prototype, chart_wrapper.prototype)

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
	chart_wrapper.prototype.render_plot.call(this)

	this.svg = d3.select(this.plot_container)
		.append('svg')
		// When drawing SVG to canvas with an `Image`, if we don't add version and xmlns the `Image` will never load :(
		.attr('version', '1.1')
		.attr('xmlns', 'http://www.w3.org/2000/svg')
	if (this._overflow) {
		this.svg
			.attr('width', null)
			.attr('height', this._outer_height)
		this.plot_container.style = "overflow: auto;"
	} else {
		this.svg.attr('width', '100%')
	}
}

/**
 * Get the supported chart export formats
 * @function
 * @returns {string[]} the supported formats
 * @name d3_chart_wrapper#get_supported_export_formats
 */
d3_chart_wrapper.prototype.get_supported_export_formats = function () {
	return ['svg']
}

/**
 * Download the chart as svg
 * @param {string} filename the name of the file
 * @function
 * @name d3_chart_wrapper#_download_chart_as_svg
 */
d3_chart_wrapper.prototype.download_chart_as_svg = function (filename) {
	const svg_data = this.svg.node().outerHTML
	const svg_blob = new Blob([svg_data], { type: "image/svg+xml;charset=utf-8" })
	const url = URL.createObjectURL(svg_blob)
	/**
	 * Temporary link
	 * @type {Element}
	 */
	const tmpLink = common.create_dom_element({
		element_type: 'a',
		href: url,
	})
	tmpLink.setAttribute('download', filename)
	tmpLink.click()
	tmpLink.remove()
	URL.revokeObjectURL(url)
}