"use strict";

import { d3_chart_wrapper } from "./d3-chart-wrapper";


/**
 * Boxplot + violin chart wrapper
 * 
 * Inspired in http://bl.ocks.org/asielen/d15a4f16fa618273e10f
 * 
 * @param {Element}  div_wrapper the div to work in
 * @param {{string: number[]}} data the input data: group name
 *        and array of values
 * @param {string} ylabel the y label
 * @class
 * @extends d3_chart_wrapper
 */
export function boxvio_chart_wrapper(div_wrapper, data, ylabel) {
    d3_chart_wrapper.call(this, div_wrapper)
    /**
     * Data: group name to array of values
     * @type {{string: number[]}}
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
     * @type {{string: {
     *  max: number,
     *  upper_outer_fence: number,
     *  upper_inner_fence: number,
     *  quartile3: number,
     *  median: number,
     *  mean: number,
     *  iqr: number,
     *  quartile1: number,
     *  lower_inner_fence: number,
     *  lower_outer_fence: number,
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
     * Components of the chart
     * @private
     */
    this._chart = {}
    this._chart.margin = {top: 15, right: 40, bottom: 35, left: 50}
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
        .padding(0.05)     // This is important: it is the space between 2 groups. 0 means no padding. 1 is the maximum.
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
    this._chart.root_g = null
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
    this._chart.root_g = this.svg.append('g')
        .attr('transform', `translate(${this._chart.margin.left},${this._chart.margin.top})`)
    
    this._render_axis()
    this._render_violins()

}

/**
 * Render the axis
 * @function
 * @private
 * @name boxvio_chart_wrapper#_render_axis
 */
boxvio_chart_wrapper.prototype._render_axis = function () {
    // Render x axis
    this._chart.root_g.append('g')
        .attr('transform', `translate(0,${this._chart.height})`)
        .call(this._chart.xaxis)
    // Render y axis
    this._chart.root_g.append('g')
        .call(this._chart.yaxis)

    // Render Y axis label
    this._chart.root_g.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('y', -this._chart.margin.left + 20)
      .attr('x', -this._chart.height/2)
      .text(this._ylabel);
}

boxvio_chart_wrapper.prototype._render_violins = function () {

    const chart = this._chart

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
    chart.root_g
        .selectAll('violin')
        .data(chart.bins)
        .enter()  // Working per group now
        .append('g')
            .attr('transform', (d) => `translate(${chart.xscale(d.key)},0)`)
        .append('path')
            .datum((d) => d.value)  // Working per bin within a group
            .style('stroke', 'black')
            .style('stroke-width', 1)
            .style('fill', 'ghostwhite')
            .attr('d', d3.area()
                .x0((d) => xNum(-d.length))
                .x1((d) => xNum(d.length))
                .y((d) => this._chart.yscale(d.x0))
                .curve(d3.curveCatmullRom)
            )

}

/**
 * Render the control panel
 * @function
 * @private
 * @name boxvio_chart_wrapper#_render_control_panel
 */
boxvio_chart_wrapper.prototype._render_control_panel = function () {

}

// HELPER FUNCTIONS

/**
 * Compute (boxplot) metrics for the data
 * @param {number[]} values the data values
 * @returns {{
 *  max: number,
 *  upper_outer_fence: number,
 *  upper_inner_fence: number,
 *  quartile3: number,
 *  median: number,
 *  mean: number,
 *  iqr: number,
 *  quartile1: number,
 *  lower_inner_fence: number,
 *  lower_outer_fence: number,
 *  min: number,
 * }}
 */
function calc_metrics(values) {
    let metrics = {
        max: null,
        upper_outer_fence: null,
        upper_inner_fence: null,
        quartile3: null,
        median: null,
        mean: null,
        iqr: null,
        quartile1: null,
        lower_inner_fence: null,
        lower_outer_fence: null,
        min: null,
    }

    metrics.min = d3.min(values)
    metrics.quartile1 = d3.quantile(values, 0.25)
    metrics.median = d3.median(values)
    metrics.mean = d3.mean(values)
    metrics.quartile3 = d3.quantile(values, 0.75)
    metrics.max = d3.max(values)
    metrics.iqr = metrics.quartile3 - metrics.quartile1

    // The inner fences are the closest value to the IQR without going past it
    // Assuming sorted values
    const LIF = metrics.quartile1 - (1.5 * metrics.iqr)
    const UIF = metrics.quartile3 + (1.5 * metrics.iqr)
    for (let i = 0; i < values.length; i++) {
        if (values[i] < LIF) {
            continue
        }
        if (!metrics.lower_inner_fence && values[i] >= LIF) {
            metrics.lower_inner_fence = values[i]
            continue
        }
        if (values[i] > UIF) {
            metrics.upper_inner_fence = values[i-1]
            break
        }
    }

    metrics.lower_outer_fence = metrics.quartile1 - (3 * metrics.iqr)
    metrics.upper_outer_fence = metrics.quartile3 + (3 * metrics.iqr)
    if (!metrics.lower_inner_fence) {
        metrics.lower_inner_fence = metrics.min
    }
    if (!metrics.upper_inner_fence) {
        metrics.upper_inner_fence = metrics.max
    }

    return metrics
}