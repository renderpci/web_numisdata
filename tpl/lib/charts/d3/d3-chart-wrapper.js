"use strict";

import { chart_wrapper } from "../chart-wrapper";

/**
 * D3 chart wrapper class
 * 
 * Appends an `svg` tag to the provided div, so that it spans all width
 * 
 * Subclasses MUST specify the viewBox of the svg, so that it responds to window resizing
 * @param {Element} div_wrapper the div containing the chart
 * @class
 * @abstract
 * @extends chart_wrapper
 */
export function d3_chart_wrapper(div_wrapper) {
    if (this.constructor === d3_chart_wrapper) {
        throw new Error("Abstract class 'd3_chart_wrapper' cannot be instantiated")
    }
    chart_wrapper.call(this, div_wrapper)
    /**
     * Div inside the div_wrapper, that just wraps the drawing
     * @type {Element}
     * @protected
     */
    this.plot_div = undefined
    /**
     * D3 selection object for the root `svg` tag
     * @protected
     */
    this.svg = undefined

}
// Set prototype chain
Object.setPrototypeOf(d3_chart_wrapper.prototype, chart_wrapper.prototype)

/**
 * Render the chart (d3) and controls
 * 
 * Subclasses must call this method at the top
 * of their own implementation
 * @name d3_chart_wrapper#render
 * @function
 */
d3_chart_wrapper.prototype.render = function () {
    chart_wrapper.prototype.render.call(this)
    
    this.plot_div = common.create_dom_element({
        element_type: 'div',
            class_name: 'o-purple plot_wrapper',
            parent: this.div_wrapper,
    })

    this.svg = d3.select(this.plot_div)
        .append('svg')
        .attr('version', '1.1') // When drawing SVG to canvas with an `Image`, if we don't add version and xmlns the `Image` will never load :(
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .attr('width', '100%')
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