"use strict";

import { d3_chart_wrapper } from "./d3-chart-wrapper";


/**
 * Boxplot + violin chart wrapper
 * @param {Element}  div_wrapper the div to work in
 * @class
 * @extends d3_chart_wrapper
 */
export function boxvio_chart_wrapper(div_wrapper) {
    d3_chart_wrapper.call(this, div_wrapper)
}
// Set prototype chain
Object.setPrototypeOf(boxvio_chart_wrapper.prototype, d3_chart_wrapper.prototype)

/**
 * Render the chart and the control panel
 * @function
 * @name boxvio_chart_wrapper#render
 */
boxvio_chart_wrapper.prototype.render = function () {
    // Call super render method
    d3_chart_wrapper.prototype.render.call(this)
    // Render chart
    this._render_chart()
    // Render control panel
    this._render_control_panel()
}

/**
 * Render the chart
 * @function
 * @private
 * @name boxvio_chart_wrapper#_render_chart
 */
boxvio_chart_wrapper.prototype._render_chart = function () {

    // Set viewBox of svg
    this.svg.attr('viewBox', '0 0 100 50')

    this.svg.append('rect')
        .attr('width', 30)
        .attr('height', 15)
        .attr('x', 35)
        .attr('y', 17.5)
        .style('stroke', 'black')
        .style('stroke-width', 1)
        .style('fill', 'blue')

}

/**
 * Render the control panel
 * @function
 * @private
 * @name boxvio_chart_wrapper#_render_control_panel
 */
boxvio_chart_wrapper.prototype._render_control_panel = function () {

}