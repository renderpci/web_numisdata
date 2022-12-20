"use strict";

import { d3_chart_wrapper } from "./d3-chart-wrapper";

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
}
// Set prototype chain
Object.setPrototypeOf(clock_chart_wrapper.prototype, d3_chart_wrapper.prototype)