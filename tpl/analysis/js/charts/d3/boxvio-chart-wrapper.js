"use strict";

import { d3_chart_wrapper } from "./d3-chart-wrapper";
import { COLOR_PALETTE } from "../chart-wrapper";
import { toggle_visibility } from "./utils";


/**
 * Boxplot + violin chart wrapper
 * 
 * Inspired in http://bl.ocks.org/asielen/d15a4f16fa618273e10f
 * 
 * @param {Element}  div_wrapper the div to work in
 * @param {{[group_name: string]: number[]}} data the input data: group name
 *        and array of values
 * @param {string} ylabel the y label
 * @class
 * @extends d3_chart_wrapper
 */
export function boxvio_chart_wrapper(div_wrapper, data, ylabel) {
    d3_chart_wrapper.call(this, div_wrapper)
    /**
     * Data: group name to array of values
     * @type {Object.<string, number[]>}
     * @private
     */
    this._data = data
    /**
     * The label for the y axis
     * @type {string}
     * @private
     */
    this._ylabel = ylabel
    /**
     * Boxplot metrics for each group name
     * @type {{[group_name: string]: {
     *  max: number,
     *  upper_fence: number,
     *  quartile3: number,
     *  median: number,
     *  mean: number,
     *  iqr: number,
     *  quartile1: number,
     *  lower_fence: number,
     *  min: number,
     * }}}
     * @private
     */
    this._metrics = {}
    for (const [name, values] of Object.entries(data)) {
        this._metrics[name] = calc_metrics(values)
    }
    /**
     * Maximum and minimum of the input data
     * @type {[number, number]}
     */
    this._data_extent = d3.extent(Object.values(this._data).flat())
    /**
     * Full width of svg
     * @type {number}
     */
    this._full_width = 960
    /**
     * Full height of svg
     * @type {number}
     */
    this._full_height = 420
    /**
     * Non-graphic components of the chart: setting, scales, etc.
     * @private
     */
    this._chart = {}
    this._chart.margin = { top: 15, right: 3, bottom: 23, left: 50 }
    this._chart.width = this._full_width - this._chart.margin.left - this._chart.margin.right
    this._chart.height = this._full_height - this._chart.margin.top - this._chart.margin.bottom
    this._chart.yscale = d3.scaleLinear()
        .range([this._chart.height, 0])
        .domain(this._data_extent)
        .clamp(true)  // when input outside of domain, its output is clamped to range
    this._chart.yaxis = d3.axisLeft(this._chart.yscale)
    this._chart.xscale = d3.scaleBand()
        .domain(Object.keys(this._data))
        .range([0, this._chart.width])
        .padding(0.1)     // This is important: it is the space between 2 groups. 0 means no padding. 1 is the maximum.
    this._chart.xaxis = d3.axisBottom(this._chart.xscale)
    this._chart.histogram = d3.bin()
        .domain(this._chart.yscale.domain())
        // TODO: compute number of bins automatically depending on the range of the data
        .thresholds(this._chart.yscale.ticks(10)) // Important: how many bins approx are going to be made? It is the 'resolution' of the violin plot
        .value((d) => d)
    this._chart.bins = []  // TODO: can do a one-liner here with map() on Object.entries(this._data)
    for (const [name, values] of Object.entries(this._data)) {
        this._chart.bins.push({
            key: name,
            value: this._chart.histogram(values),
        })
    }
    /**
     * Graphic components of the chart: d3 selection objects
     * @private
     * @type {{[name: string]: d3.selection}}
     */
    this._graphics = {
        root_g: null,
        violins_g: null,
        boxes_g: null,
    }
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
    this.svg.attr('viewBox', `0 0 ${this._full_width} ${this._full_height}`)

    // Root g tag
    this._graphics.root_g = this.svg.append('g')
        .attr('transform', `translate(${this._chart.margin.left},${this._chart.margin.top})`)

    this._render_axis()
    this._render_violins()
    this._render_boxes()

}

/**
 * Render the axis
 * @function
 * @private
 * @name boxvio_chart_wrapper#_render_axis
 */
boxvio_chart_wrapper.prototype._render_axis = function () {
    const g = this._graphics.root_g
    // Render x axis
    g.append('g')
        .attr('transform', `translate(0,${this._chart.height})`)
        .call(this._chart.xaxis)
    // Render y axis
    g.append('g')
        .call(this._chart.yaxis)

    // Render Y axis label
    g.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('y', -this._chart.margin.left + 20)
        .attr('x', -this._chart.height / 2)
        .text(this._ylabel);
}

/**
 * Render the violins
 * @function
 * @private
 * @name boxvio_chart_wrapper#_render_violins
 */
boxvio_chart_wrapper.prototype._render_violins = function () {

    const chart = this._chart
    const g = this._graphics.root_g

    // Get the largest count in a bin, as it will be the maximum width
    let max_count = 0
    for (const group of chart.bins) {
        const longest = d3.max(group.value.map((v) => v.length))
        if (longest > max_count) {
            max_count = longest
        }
    }

    // Make a scale linear to map bin counts to bandwidth
    const xNum = d3.scaleLinear()
        .range([0, chart.xscale.bandwidth()])
        .domain([-max_count, max_count])

    // Render
    this._graphics.violins_g = g.append('g')
        .selectAll('violin')
        .data(chart.bins)
        .enter()  // Working per group now
        .append('g')
        .attr('transform', (d) => `translate(${chart.xscale(d.key)},0)`)
        .append('path')
        .datum((d) => d.value)  // Working per bin within a group
        .style('stroke', 'black')
        .style('stroke-width', 0.5)
        .style('fill', 'ghostwhite')
        .attr('d', d3.area()
            .x0((d) => xNum(-d.length))
            .x1((d) => xNum(d.length))
            .y((d) => chart.yscale(d.x0))
            .curve(d3.curveCatmullRom)
        )

}

/**
 * Render the boxes (including whiskers and outliers)
 * @function
 * @private
 * @name boxvio_chart_wrapper#_render_boxes
 */
boxvio_chart_wrapper.prototype._render_boxes = function () {

    const chart = this._chart
    const g = this._graphics.root_g

    // Get outliers
    const outliers = {}
    for (const [name, values] of Object.entries(this._data)) {
        outliers[name] = values.filter(
            (v) => v < this._metrics[name].lower_fence || v > this._metrics[name].upper_fence
        )
    }

    // Draw
    const boxes = g.append('g')
    this._graphics.boxes_g = boxes
    const bandwidth = chart.xscale.bandwidth()
    const box_width = 0.6 * bandwidth

    const whiskers_lw = 2
    const median_lw = 3

    // Iterate over the groups
    for (const [i, name] of Object.entries(Object.keys(this._data))) {

        const metrics = this._metrics[name]
        const color = COLOR_PALETTE[i % COLOR_PALETTE.length]  // loop around!

        const group_box = boxes.append('g')
            .attr('transform', `translate(${chart.xscale(name) + bandwidth / 2},0)`)

        // Draw outliers
        for (const outlier of outliers[name]) {
            group_box.append('circle')
                .attr('cx', 0)
                .attr('cy', chart.yscale(outlier))
                .attr('r', 4)
                .style('fill', color)
                .style('opacity', 0.6)
        }

        // Draw whiskers
        const whiskers = group_box.append('g')
        whiskers.append('line')  // vertical line
            .attr('x1', 0)
            .attr('y1', chart.yscale(metrics.lower_fence))
            .attr('x2', 0)
            .attr('y2', chart.yscale(metrics.upper_fence))
            .attr('stroke', color)
            .attr('stroke-width', whiskers_lw)
        whiskers.append('line') // lower horizontal
            .attr('x1', -box_width / 2)
            .attr('y1', chart.yscale(metrics.lower_fence))
            .attr('x2', box_width / 2)
            .attr('y2', chart.yscale(metrics.lower_fence))
            .attr('stroke', color)
            .attr('stroke-width', whiskers_lw)
        whiskers.append('line') // upper horizontal
            .attr('x1', -box_width / 2)
            .attr('y1', chart.yscale(metrics.upper_fence))
            .attr('x2', box_width / 2)
            .attr('y2', chart.yscale(metrics.upper_fence))
            .attr('stroke', color)
            .attr('stroke-width', whiskers_lw)

        // Draw IQR box
        const iqr = group_box.append('g')
        iqr.append('rect')  // iqr rect
            .attr('x', -box_width / 2)
            .attr('y', chart.yscale(metrics.quartile3))
            .attr('width', box_width)
            .attr('height', chart.yscale(metrics.quartile1) - chart.yscale(metrics.quartile3))
            .attr('fill', color)
        iqr.append('line')  // median line
            .attr('x1', -box_width / 2)
            .attr('y1', chart.yscale(metrics.median))
            .attr('x2', box_width / 2)
            .attr('y2', chart.yscale(metrics.median))
            .attr('stroke', 'black')
            .attr('stroke-width', median_lw)
        iqr.append('circle')  // median dot
            .attr('cx', 0)
            .attr('cy', chart.yscale(metrics.median))
            .attr('r', 5)
            .style('fill', 'white')
            .attr('stroke', 'black')
            .attr('stroke-width', 2)
    }

}



/**
 * Render the control panel
 * @function
 * @private
 * @name boxvio_chart_wrapper#_render_control_panel
 */
boxvio_chart_wrapper.prototype._render_control_panel = function () {

    /**
     * This boxvio_chart_wrapper instance
     * @type {boxvio_chart_wrapper}
     */
    const self = this

    // Create controls container
    this.controls_container = common.create_dom_element({
        element_type: 'div',
        id: 'controls',
        class_name: 'o-green',
        parent: this.div_wrapper,
    })

    /**
     * Checkbox for showing violins
     * @type {Element}
     */
    const show_violins_checkbox = common.create_dom_element({
        element_type: 'input',
        type: 'checkbox',
        id: 'show_violins_checkbox',
        parent: this.controls_container,
    })
    show_violins_checkbox.checked = true
    /**
     * Checkbox label for density plot
     * @type {Element}
     */
    const show_violins_label = common.create_dom_element({
        element_type: 'label',
        text_content: 'Show violins',
        parent: this.controls_container,
    })
    show_violins_label.setAttribute('for', 'show_violins_checkbox')
    show_violins_checkbox.addEventListener('change', () => {
        toggle_visibility(this._graphics.violins_g)
    })

    /**
     * Checkbox for showing boxes
     * @type {Element}
     */
     const show_boxes_checkbox = common.create_dom_element({
        element_type: 'input',
        type: 'checkbox',
        id: 'show_boxes_checkbox',
        parent: this.controls_container,
    })
    show_boxes_checkbox.checked = true
    /**
     * Checkbox label for density plot
     * @type {Element}
     */
    const show_boxes_label = common.create_dom_element({
        element_type: 'label',
        text_content: 'Show boxes',
        parent: this.controls_container,
    })
    show_boxes_label.setAttribute('for', 'show_boxes_checkbox')
    show_boxes_checkbox.addEventListener('change', () => {
        toggle_visibility(this._graphics.boxes_g)
    })

}

// HELPER FUNCTIONS

/**
 * Compute (boxplot) metrics for the data
 * @param {number[]} values the data values
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
function calc_metrics(values) {
    const metrics = {
        max: null,
        upper_fence: null,
        quartile3: null,
        median: null,
        mean: null,
        iqr: null,
        quartile1: null,
        lower_fence: null,
        min: null,
    }

    metrics.min = d3.min(values)
    metrics.quartile1 = d3.quantile(values, 0.25)
    metrics.median = d3.median(values)
    metrics.mean = d3.mean(values)
    metrics.quartile3 = d3.quantile(values, 0.75)
    metrics.max = d3.max(values)
    metrics.iqr = metrics.quartile3 - metrics.quartile1
    metrics.lower_fence = metrics.quartile1 - 1.5 * metrics.iqr
    metrics.upper_fence = metrics.quartile3 + 1.5 * metrics.iqr

    return metrics
}