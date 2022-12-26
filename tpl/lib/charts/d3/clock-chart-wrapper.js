"use strict";

import { d3_chart_wrapper } from "./d3-chart-wrapper";

/**
 * Clock diameter
 * @type {number}
 */
const CLOCK_DIAMETER = 100
/**
 * Clock radius
 * @type {number}
 */
const CLOCK_RADIUS = CLOCK_DIAMETER / 2

/**
 * Clock chart
 * 
 * Given a series of numbers, it draws equidistant (angle-wise) lines (like clock handles) around
 * the origin so that the length is proportional to the corresponding number.
 * For instance, if 4 numbers are given, lines wil be drawn with angles (pi/2, 0, -pi/2, -pi).
 * 
 * @param {Element} div_wrapper the div to work in
 * @param {number[]} data the input data 
 * @param {Object} options configuration options
 * @param {boolean} options.display_download whether to display the download panel (default `false`)
 * @param {boolean} options.display_control_panel whether to display the control panel (default `false`)
 * @param {boolean} options.overflow whether going beyond the width of the plot container is allowed (default `false`).
 * 		if `false`, the svg will be stretched to fill the full width of its parent element
 * @class
 * @extends d3_chart_wrapper
 */
export function clock_chart_wrapper(div_wrapper, data, options) {
	d3_chart_wrapper.call(this, div_wrapper, options)
	/**
	 * Input data
	 * @type {number[]}
	 * @private
	 */
	this._data = data
	/**
	 * Graphic components of the chart
	 * @private
	 * @type {{
	 *  root_g: d3.selection,
	 * }}
	 */
   	this._graphics = {
		// Root g tag (translated to the center of the svg)
		root_g: null
	}
}
// Set prototype chain
Object.setPrototypeOf(clock_chart_wrapper.prototype, d3_chart_wrapper.prototype)

/**
 * Render the plot
 * @function
 * @protected
 * @name clock_chart_wrapper#render_plot
 */
clock_chart_wrapper.prototype.render_plot = function () {
	d3_chart_wrapper.prototype.render_plot.call(this)

	// Set viewbox of svg
	this.svg.attr('viewBox', `0 0 ${CLOCK_DIAMETER} ${CLOCK_DIAMETER}`)

	// Root g tag
	this._graphics.root_g = this.svg.append('g')
		.attr('transform', `translate(${CLOCK_RADIUS},${CLOCK_RADIUS})`)

	this._render_handles()
}

/**
 * Render the clock handles
 * @function
 * @private
 * @name clock_chart_wrapper#_render_handles
 */
clock_chart_wrapper.prototype._render_handles = function () {
	const delta = 2*Math.PI/this._data.length
	let angle = Math.PI/2
	const scale = d3.scaleLinear()
		.domain([0, d3.max(this._data)])
		.range([0, CLOCK_RADIUS])
	const g = this._graphics.root_g
	for (const datum of this._data) {
		g.append('line')
			.attr('x1', 0)
			.attr('y1', 0)
			.attr('x2', scale(datum)*Math.cos(angle))
			.attr('y2', -scale(datum)*Math.sin(angle))  // Mirror vertically!
			.attr('stroke', 'black')
			.attr('stroke-width', 1.5)
		angle -= delta
	}
}