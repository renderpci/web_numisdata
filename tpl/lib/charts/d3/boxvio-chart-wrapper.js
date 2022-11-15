"use strict";

import { d3_chart_wrapper } from "./d3-chart-wrapper";
import { COLOR_PALETTE } from "../chart-wrapper";
import { toggle_visibility, linspace, CURVES } from "./utils";
import { compute_n_bins } from "../compute-n-bins";
import { deepcopy } from "../utils"


/**
 * Padding for the y-axis, to fit the label
 * @type {number}
 */
const YAXIS_PADDING = 62;

/**
 * Boxplot + violin chart wrapper
 * 
 * Inspired in http://bl.ocks.org/asielen/d15a4f16fa618273e10f,
 * https://d3-graph-gallery.com/graph/violin_basicHist.html,
 * https://d3-graph-gallery.com/graph/boxplot_show_individual_points.html
 * 
 * @param {Element}  div_wrapper the div to work in
 * @param {{[group_name: string]: number[]}} data the input data: group name
 *        and array of values
 * @param {boolen} sort_xaxis whether to sort the xaxis
 * @param {string} ylabel the y label
 * @param {boolean} overflow whether to go beyond the width of the plot container
 * @class
 * @extends d3_chart_wrapper
 */
export function boxvio_chart_wrapper(div_wrapper, data, sort_xaxis, ylabel, overflow) {
    d3_chart_wrapper.call(this, div_wrapper)
    /**
     * Whether to go beyond the width of the plot container
     * @type {boolean}
     */
    this._overflow = overflow
    /**
     * Data: group name to array of values
     * @type {Object.<string, number[]>}
     * @private
     */
    this._data = data
    /**
     * Group names
     * @type {string[]}
     * @private
     */
    this._group_names = sort_xaxis ? Object.keys(this._data).sort() : Object.keys(this._data)
    /**
     * Colors
     * @type {string[]}
     * @private
     */
    this._colors = this._group_names.map((name, i) => COLOR_PALETTE[i % COLOR_PALETTE.length])
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
    this._metrics = Object.fromEntries(Object.entries(data).map(
        ([name, values]) => [name, calc_metrics(values)]
    ))
    /**
     * Outliers per group name
     * @type {{[group_name: string]: number[]}}
     * @private
     */
    this._outliers = Object.fromEntries(Object.entries(data).map(
        ([name, values]) => [
            name,
            values.filter(
                (v) => v < this._metrics[name].lower_fence || v > this._metrics[name].upper_fence
            )
        ]
    ))
    /**
     * Maximum and minimum values of each group
     * @type {Object.<string, [number, number]>}
     */
    this._data_extents = Object.fromEntries(Object.entries(data).map(
        ([name, values]) => [name, d3.extent(values)]
    ))
    /**
     * Maximum and minimum of the input data
     * @type {[number, number]}
     */
    this._data_extent = d3.extent(Object.values(this._data_extents).flat())
    /**
     * Full width of svg
     * @type {number}
     */
    this._full_width = 330.664701211*Math.sqrt(Object.keys(data).length) + -170.664701211 + YAXIS_PADDING
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
    this._chart.margin = { top: 15, right: 4, bottom: 23, left: YAXIS_PADDING }
    this._chart.width = this._full_width - this._chart.margin.left - this._chart.margin.right
    this._chart.height = this._full_height - this._chart.margin.top - this._chart.margin.bottom
    this._chart.yscale = d3.scaleLinear()
        .range([this._chart.height, 0])
        .domain(this._data_extent)
        .clamp(true)  // when input outside of domain, its output is clamped to range
    this._chart.yaxis = d3.axisLeft(this._chart.yscale)
    this._chart.yaxis.tickFormat(d3.format(".1f"))  // format y axis with 1 decimal
    this._chart.violin_scale_default = 0.8
    this._chart.violin_scale = this._chart.violin_scale_default
    this._chart.box_scale_default = 0.3
    this._chart.box_scale = this._chart.box_scale_default
    this._chart.xscale = d3.scaleBand()
        .domain(this._group_names)
        .range([0, this._chart.width])
        // .padding(1-this._chart.violin_scale)     // This is important: it is the space between 2 groups. 0 means no padding. 1 is the maximum.
    this._chart.xaxis = d3.axisBottom(this._chart.xscale)
    this._chart.n_bins_default = Object.fromEntries(Object.entries(data).map(
        ([name, values]) => [name, compute_n_bins.sturges(values)]
    ))
    this._chart.n_bins = deepcopy(this._chart.n_bins_default)
    this._chart.histogram = Object.fromEntries(Object.entries(this._data_extents).map(
        ([name, extent]) => {
            return [
                name,
                d3.bin().domain(extent).thresholds(
                    linspace(extent[0], extent[1], this._chart.n_bins[name])
                )
            ]
        }
    ))
    this._chart.bins = Object.fromEntries(Object.entries(data).map(
        ([name, values]) => [name, this._chart.histogram[name](values)]
    ))
    this._chart.supported_curves = [
        'Basis', 'Bump Y', 'Cardinal', 'Catmull-Rom', 'Linear',
        'Monotone Y', 'Natural', 'Step'
    ]
    this._chart.violin_curve = CURVES[this._chart.supported_curves[0]]
    /**
     * Graphic components of the chart: d3 selection objects
     * @private
     * @type {{[name: string]: d3.selection | {[group: string]: d3.selection}}}
     */
    this._graphics = {
        root_g: null,  // Root g tag (translated to account for the margins)
        violins_g: null, // g tag grouping all violins
        violins: {}, // individual g tag for each violin (mapped by group name)
        boxes_g: null, // g tag grouping all boxes
        outliers: {},  // per group: g tag grouping all outliers of the group
    }
    /**
     * Control panel things
     * @private
     */
    this._controls = {}
    this._controls.max_bins_multiplier = 3
}
// Set prototype chain
Object.setPrototypeOf(boxvio_chart_wrapper.prototype, d3_chart_wrapper.prototype)

/**
 * Set the scale for the violins
 * @function
 * @param {number} scale the scale [0, 1]
 * @name boxvio_chart_wrapper#set_violin_scale
 */
boxvio_chart_wrapper.prototype.set_violin_scale = function (scale) {
    this._chart.violin_scale = scale
    // Remove the violin graphics, only leaving its root g tag (violins_g)
    this._graphics.violins_g.selectAll('*').remove()
    this._render_violins(true)
}

/**
 * Set the number of bins for a particular violin
 * 
 * Updates the chart accordingly
 * @param {string} name name of the group 
 * @param {number} n_bins number of bins
 * @name boxvio_chart_wrapper#set_n_bins
 */
boxvio_chart_wrapper.prototype.set_n_bins = function (name, n_bins) {
    const chart = this._chart
    const extent = this._data_extents[name]
    chart.n_bins[name] = n_bins
    chart.histogram[name].thresholds(
        linspace(extent[0], extent[1], n_bins)
    )
    chart.bins[name] = chart.histogram[name](this._data[name])
    // Delete the oath of the existing violin and redraw
    this._graphics.violins[name].selectAll('*').remove()
    this._render_violin(name)
}

/**
 * Set the curve for the violins
 * 
 * Updates the chart accordingly
 * @param {string} curve_name name of the curve 
 * @name boxvio_chart_wrapper#set_violin_curve
 */
boxvio_chart_wrapper.prototype.set_violin_curve = function (curve_name) {
    this._chart.violin_curve = CURVES[curve_name]
    // Remove the violin graphics, only leaving its root g tag (violins_g)
    this._graphics.violins_g.selectAll('*').remove()
    this._render_violins(true)
}

/**
 * Set the scale for the boxes
 * @function
 * @param {number} scale the scale [0, 1]
 * @name boxvio_chart_wrapper#set_box_scale
 */
boxvio_chart_wrapper.prototype.set_box_scale = function (scale) {
    this._chart.box_scale = scale
    // Remove the box graphics, only leaving its root g tag (boxes_g)
    this._graphics.boxes_g.selectAll('*').remove()
    this._render_boxes(true)
}

/**
 * Render the chart and the control panel
 * @function
 * @name boxvio_chart_wrapper#render
 */
boxvio_chart_wrapper.prototype.render = function () {
    // Call super render method
    d3_chart_wrapper.prototype.render.call(this)
    if (this._overflow) {
        this.svg.attr('width', null)
        this.svg.attr('height', '500px')
        this.plot_container.style = "overflow: auto;"
    }
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
 * @param {boolean} is_g_ready whether the g tag for violins is
 *        set up (default: `false`)
 * @name boxvio_chart_wrapper#_render_violins
 */
boxvio_chart_wrapper.prototype._render_violins = function (is_g_ready=false) {

    const chart = this._chart
    const g = this._graphics.root_g

    // Render
    if (!is_g_ready) {
        this._graphics.violins_g = g.append('g')
    }
    const violins_g = this._graphics.violins_g
    for (const name of Object.keys(chart.bins)) {
        this._graphics.violins[name] = violins_g.append('g')
            .attr('transform', `translate(${chart.xscale(name)},0)`)
        this._render_violin(name)
    }

}

/**
 * Render the violins
 * @function
 * @private
 * @param {boolean} is_g_ready whether the g tag for violins is
 *        set up (default: `false`)
 * @name boxvio_chart_wrapper#_render_violins
 */
boxvio_chart_wrapper.prototype._render_violin = function (name) {
    const bins = this._chart.bins[name]
    const violin_scale = this._chart.violin_scale
    const bandwidth = this._chart.xscale.bandwidth()
    const yscale = this._chart.yscale
    const violin_curve = this._chart.violin_curve

    // Get the largest count in a bin as it will be maximum width
    const max_count = d3.max(bins, (bin) => bin.length)
    // Make a linear scale to map bin counts to bandwidth
    const x_num = d3.scaleLinear()
        .range([0, bandwidth])
        .domain([-max_count, max_count])

    this._graphics.violins[name]
        .append('path')
        .datum(bins)
            .style('stroke', 'gray')
            .style('stroke-width', 0.4)
            .style('fill', 'ghostwhite')
            .attr('d', d3.area()
                .x0((d) => x_num(-d.length*violin_scale))
                .x1((d) => x_num(d.length*violin_scale))
                .y((d) => yscale(d.x0))
                .curve(violin_curve)
            )
}

/**
 * Render the boxes (including whiskers and outliers)
 * @function
 * @private
 * @param {boolean} is_g_ready whether the g tag for boxes is
 *        set up (default: `false`)
 * @name boxvio_chart_wrapper#_render_boxes
 */
boxvio_chart_wrapper.prototype._render_boxes = function (is_g_ready=false) {

    const chart = this._chart
    const g = this._graphics.root_g

    // Draw
    if (!is_g_ready) {
        this._graphics.boxes_g = g.append('g')
    }
    const boxes = this._graphics.boxes_g
    const bandwidth = chart.xscale.bandwidth()
    const box_width = this._chart.box_scale * bandwidth

    const whiskers_lw = 2
    const median_lw = 3

    // Iterate over the groups
    for (const [i, name] of Object.entries(this._group_names)) {

        const metrics = this._metrics[name]
        const color = this._colors[i]

        const group_box = boxes.append('g')
            .attr('transform', `translate(${chart.xscale(name) + bandwidth / 2},0)`)

        // Draw outliers
        this._graphics.outliers[name] = group_box.append('g')
        const outliers = this._graphics.outliers[name]
        for (const outlier of this._outliers[name]) {
            outliers.append('circle')
                .attr('cx', 0)
                .attr('cy', chart.yscale(outlier))
                .attr('r', 4)
                .style('fill', color)
                .style('opacity', 0.7)
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
            .attr('r', 4.5)
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

    this._render_violin_curve_selector()
    this._render_checkboxes()
    this._render_scale_sliders()
    this._render_n_bins_control()

}

/**
 * Render the selector for the violin curve
 * @function
 * @private
 * @name boxvio_chart_wrapper#_render_violin_curve_selector
 */
boxvio_chart_wrapper.prototype._render_violin_curve_selector = function () {
    const curve_select_id = `${this.id_string()}_curve_select`
    const curve_select = common.create_dom_element({
        element_type: 'select',
        id: curve_select_id,
        parent: this.controls_container,
        // TODO: add ARIA attributes?
    })
    for (const curve_name of this._chart.supported_curves) {
        common.create_dom_element({
            element_type: 'option',
            value: curve_name,
            text_content: curve_name,
            parent: curve_select,
        })
    }
    curve_select.addEventListener('change', () => {
        this.set_violin_curve(curve_select.value)
    })
}

/**
 * Render the checkboxes of the control panel
 * @function
 * @private
 * @name boxvio_chart_wrapper#_render_checkboxes
 */
boxvio_chart_wrapper.prototype._render_checkboxes = function () {
    const show_violins_checkbox_id = `${this.id_string()}_show_violins_checkbox`
    /**
     * Checkbox for showing violins
     * @type {Element}
     */
    const show_violins_checkbox = common.create_dom_element({
        element_type: 'input',
        type: 'checkbox',
        id: show_violins_checkbox_id,
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
    show_violins_label.setAttribute('for', show_violins_checkbox_id)
    show_violins_checkbox.addEventListener('change', () => {
        toggle_visibility(this._graphics.violins_g)
    })

    const show_boxes_checkbox_id = `${this.id_string()}_show_boxes_checkbox`
    /**
     * Checkbox for showing boxes
     * @type {Element}
     */
     const show_boxes_checkbox = common.create_dom_element({
        element_type: 'input',
        type: 'checkbox',
        id: show_boxes_checkbox_id,
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
    show_boxes_label.setAttribute('for', show_boxes_checkbox_id)
    show_boxes_checkbox.addEventListener('change', () => {
        toggle_visibility(this._graphics.boxes_g)
        // (DISABLED) Disable the checkbox for outliers (defined below)
        // show_outliers_checkbox.disabled = !show_boxes_checkbox.checked
    })

    const show_outliers_checkbox_id = `${this.id_string()}_show_outliers_checkbox`
    /**
     * Checkbox for showing outliers
     * @type {Element}
     */
    const show_outliers_checkbox = common.create_dom_element({
        element_type: 'input',
        type: 'checkbox',
        id: show_outliers_checkbox_id,
        parent: this.controls_container,
    })
    show_outliers_checkbox.checked = true
    /**
     * Checkbox label for density plot
     * @type {Element}
     */
    const show_outliers_label = common.create_dom_element({
        element_type: 'label',
        text_content: 'Show outliers',
        parent: this.controls_container,
    })
    show_outliers_label.setAttribute('for', show_outliers_checkbox_id)
    show_outliers_checkbox.addEventListener('change', () => {
        for (const group of Object.values(this._graphics.outliers)) {
            toggle_visibility(group)
        }
    })
}

/**
 * Render the sliders of the control panel that
 * control the scale of violins and boxes
 * @function
 * @private
 * @name boxvio_chart_wrapper#_render_scale_sliders
 */
boxvio_chart_wrapper.prototype._render_scale_sliders = function () {
    /**
     * Slider for violin scale
     * @type {Element}
     */
    const violin_scale_slider = common.create_dom_element({
        element_type: 'input',
        type: 'range',
        // value: this._chart.violin_scale_default,  // This does not work here?
        parent: this.controls_container,
    })
    violin_scale_slider.setAttribute('min', 0)
    violin_scale_slider.setAttribute('max', 1)
    violin_scale_slider.setAttribute('step', 0.05)
    violin_scale_slider.value = this._chart.violin_scale_default
    violin_scale_slider.addEventListener('input', () => {
        this.set_violin_scale(Number(violin_scale_slider.value))
    })
    /**
     * Reset button for the violin_scale_slider
     * @type {Element}
     */
    const violin_scale_slider_reset = common.create_dom_element({
        element_type: 'button',
        type: 'button',
        text_content: 'Reset',
        parent: this.controls_container,
    })
    violin_scale_slider_reset.addEventListener('click', () => {
        violin_scale_slider.value = this._chart.violin_scale_default
        this.set_violin_scale(Number(violin_scale_slider.value))
    })

    /**
     * Slider for box scale
     * @type {Element}
     */
    const box_scale_slider = common.create_dom_element({
        element_type: 'input',
        type: 'range',
        // value: this._chart.box_scale_default,  // This does not work here?
        parent: this.controls_container,
    })
    box_scale_slider.setAttribute('min', 0)
    box_scale_slider.setAttribute('max', 1)
    box_scale_slider.setAttribute('step', 0.05)
    box_scale_slider.value = this._chart.box_scale_default
    box_scale_slider.addEventListener('input', () => {
        this.set_box_scale(Number(box_scale_slider.value))
    })
    /**
     * Reset button for the box_scale_slider
     * @type {Element}
     */
    const box_scale_slider_reset = common.create_dom_element({
        element_type: 'button',
        type: 'button',
        text_content: 'Reset',
        parent: this.controls_container,
    })
    box_scale_slider_reset.addEventListener('click', () => {
        box_scale_slider.value = this._chart.box_scale_default
        this.set_box_scale(Number(box_scale_slider.value))
    })
}

/**
 * Render the control elements to change the number of bins
 * @function
 * @private
 * @name boxvio_chart_wrapper#_render_n_bins_control
 */
boxvio_chart_wrapper.prototype._render_n_bins_control = function () {
    const group_select_id = `${this.id_string()}_group_select`
    const group_select = common.create_dom_element({
        element_type: 'select',
        id: group_select_id,
        parent: this.controls_container,
        // TODO: add ARIA attributes?
    })
    for (const name of this._group_names) {
        common.create_dom_element({
            element_type: 'option',
            value: name,
            text_content: name,
            parent: group_select,
        })
    }
    group_select.addEventListener('change', () => {
        const name = group_select.value
        violin_n_bins_slider.setAttribute(
            'max',
            this._controls.max_bins_multiplier * this._chart.n_bins_default[name]
        )
        violin_n_bins_slider.value = this._chart.n_bins[name]
    })

    const violin_n_bins_slider = common.create_dom_element({
        element_type: 'input',
        type: 'range',
        // value: this._chart.violin_scale_default,  // This does not work here?
        parent: this.controls_container,
    })
    violin_n_bins_slider.setAttribute('min', 1)
    violin_n_bins_slider.setAttribute(
        'max',
        this._controls.max_bins_multiplier * this._chart.n_bins_default[group_select.value]
    )
    violin_n_bins_slider.value = this._chart.n_bins[group_select.value]
    violin_n_bins_slider.addEventListener('input', () => {
        this.set_n_bins(group_select.value, Number(violin_n_bins_slider.value))
    })

    const violin_n_bins_slider_reset = common.create_dom_element({
        element_type: 'button',
        type: 'button',
        text_content: 'Reset',
        parent: this.controls_container,
    })
    violin_n_bins_slider_reset.addEventListener('click', () => {
        const name = group_select.value
        violin_n_bins_slider.value = this._chart.n_bins_default[name]
        this.set_n_bins(name, Number(violin_n_bins_slider.value))
    })

    const violin_all_n_bins_slider_reset = common.create_dom_element({
        element_type: 'button',
        type: 'button',
        text_content: 'Reset all bins',
        parent: this.controls_container,
    })
    violin_all_n_bins_slider_reset.addEventListener('click', () => {
        const name = group_select.value
        // Update the value of the slider
        violin_n_bins_slider.value = this._chart.n_bins_default[name]
        for (const [name, n_bins] of Object.entries(this._chart.n_bins_default)) {
            this.set_n_bins(name, n_bins)
        }
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