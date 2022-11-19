"use strict";

import { d3_chart_wrapper } from "./d3-chart-wrapper";
import { COLOR_PALETTE } from "../chart-wrapper";
import { toggle_visibility, linspace, CURVES } from "./utils";
import { compute_n_bins } from "../compute-n-bins";
import { array_equal, deepcopy, insert_after } from "../utils"


/**
 * CSS style for the tooltip
 * @type {Object.<string, string | number>}
 */
const TOOLTIP_STYLE = {
    'text-align': 'left',
    'padding': '0.7em',
    'padding-left': '0.8em',
    'font-size': '0.9em',
    'display': 'none',
}

/**
 * Default flex gap
 * @type {string}
 */
const DEFAULT_FLEX_GAP = '1em'
/**
 * Default margin
 * @type {string}
 */
const DEFUALT_MARGIN = '1em'


/**
 * TODO: make a superclass (in the middle of this and d3_chart_wrapper) called xy-chart-wrapper
 * which manages the axes, grid, and so on. This will be useful if we add other charts that make
 * use of x and y axis
 *
 * Boxplot + violin chart wrapper
 * 
 * Inspired in:
 * - http://bl.ocks.org/asielen/d15a4f16fa618273e10f,
 * - https://d3-graph-gallery.com/graph/violin_basicHist.html,
 * - https://d3-graph-gallery.com/graph/boxplot_show_individual_points.html
 * 
 * @param {Element} div_wrapper the div to work in
 * @param {{key: string[], values: number[]}[]} data the input data: an array of objects
 *        with key (array of components, from general to specific) and values (the datapoints)
 *        (KEY COMPONENTS MUST NOT INCLUDE `'_^PoT3sRanaCantora_'`, or things WILL break)
 * @param {string[]} key_titles the title for each key component
 * @param {Object} options configuration options
 * @param {boolean} options.display_download whether to display the download panel (default `false`)
 * @param {boolean} options.display_control_panel whether to display the control panel (default `false`)
 * @param {boolean} options.sort_xaxis whether to sort the xaxis (default `false`)
 * @param {string} options.ylabel the y-label (default `null`)
 * @param {boolean} options.overflow whether to go beyond the width of the plot container (default `false`)
 * @param {number} options.xticklabel_angle the angle (in degrees) for the xtick labels (default `0`)
 * @class
 * @extends d3_chart_wrapper
 */
export function boxvio_chart_wrapper(div_wrapper, data, key_titles, options) {
    d3_chart_wrapper.call(this, div_wrapper, options)
    /**
     * Whether to go beyond the width of the plot container
     * @type {boolean}
     */
    this._overflow = options.overflow || false
    const sort_xaxis = options.sort_xaxis || false
    if (!data.length) {
        throw new Error("Data array is empty")
    }
    /**
     * Data: key (general to specific components), index, values,
     * boxplot metrics, outliers, extent (min and max)
     * @type {{
     *  key: string[],
     *  index: number
     *  values: number[],
     *  metrics: {
     *      max: number,
     *      upper_fence: number,
     *      quartile3: number,
     *      median: number,
     *      mean: number,
     *      iqr: number,
     *      quartile1: number,
     *      lower_fence: number,
     *      min: number
     *  },
     *  outliers: number[],
     *  extent: [number, number]
     * }[]}
     * @private
     */
    this._data = sort_xaxis
                 ? data.sort((a, b) => a.key.join().localeCompare(b.key.join()))
                 : data
    for (const [i, ele] of this._data.entries()) {
        ele.metrics = calc_metrics(ele.values)
        ele.outliers = ele.values.filter(
            (v) => v < ele.metrics.lower_fence || v > ele.metrics.upper_fence
        )
        ele.extent = d3.extent(ele.values)
    }
    /**
     * Overall Maximum and minimum of the input data
     * @type {[number, number]}
     */
    this._data_extent = d3.extent(this._data.map((ele) => ele.extent).flat())
    /**
     * Existing keys as strings
     * @type {string[]}
     * @private
     */
    this._key_strings = this._data.map((ele) => join_key(ele.key))
    /**
     * Number of components of the key
     * @type {number}
     * @private
     */
    this._key_size = data[0].key.length
    /**
     * Title for each key component
     * @type {string[]}
     * @private
     */
    this._key_titles = key_titles
    /**
     * Colors
     * @type {string[]}
     * @private
     */
    this._colors = this._data.map((_, i) => COLOR_PALETTE[i % COLOR_PALETTE.length])
    /**
     * The label for the y axis
     * @type {string}
     * @private
     */
    this._ylabel = options.ylabel || null
    /**
     * Padding for the y axis, to account for the label and ticks
     * @type {number}
     */
    this.yaxis_padding = this._ylabel ? 62 : 35;
    /**
     * Full width of svg
     * @type {number}
     */
    this._full_width = 330.664701211*Math.sqrt(this._data.length) + -170.664701211 + this.yaxis_padding
    /**
     * Full height of svg
     * @type {number}
     */
    this._full_height = 453
    /**
     * Non-graphic components of the chart: setting, scales,
     * axis generators, spacing, etc.
     * @private
     * @type {{
     *  margin: {
     *      top: number,
     *      right: number,
     *      bottom: number,
     *      left: number
     *  },
     *  width: number,
     *  height: number,
     *  yscale: d3.scaleLinear,
     *  yticks_division: number,
     *  yaxis: d3.axisGenerator,
     *  violin_scale: {initial: number, value: number},
     *  box_scale: {initial: number, value: number},
     *  xscale: d3.scaleBand,
     *  xaxis: d3.axisGenerator,
     *  xticklabel_angle: number,
     *  n_bins: {initial: number, value: number}[],
     *  histogram: d3.binGenerator[],
     *  bins: d3.Bin[][],
     *  supported_curves: string[],
     *  violin_curve: string
     * }}
     */
    this._chart = {}
    this._chart.margin = { top: 15, right: 4, bottom: 61, left: this.yaxis_padding }
    this._chart.width = this._full_width - this._chart.margin.left - this._chart.margin.right
    this._chart.height = this._full_height - this._chart.margin.top - this._chart.margin.bottom
    this._chart.yscale = d3.scaleLinear()
        .range([this._chart.height, 0])
        .domain(this._data_extent)
        .clamp(true)  // when input outside of domain, its output is clamped to range
    this._chart.yticks_division = 2  // TODO: make this part of the input options object
    // TODO: make number of decimals and number of ticks part of input options object
    this._chart.yaxis = d3.axisLeft(this._chart.yscale)
        .tickFormat((d, i) => i % this._chart.yticks_division ? '' : d.toFixed(1))
        .ticks(19)
    this._chart.violin_scale = {initial: 0.8, value: 0.8}
    this._chart.box_scale = {initial: 0.3, value: 0.3}
    this._chart.xscale = d3.scaleBand()
        .domain(this._key_strings)
        .range([0, this._chart.width])
        // .padding(1-this._chart.violin_scale)     // This is important: it is the space between 2 groups. 0 means no padding. 1 is the maximum.
    this._chart.xaxis = d3.axisBottom(this._chart.xscale)
        .tickFormat((d) => split_key(d)[1])
    this._chart.xticklabel_angle = options.xticklabel_angle || 0
    this._chart.n_bins = this._data.map((ele) => {
        const initial_value = compute_n_bins.sturges(ele.values)
        return {
            initial: initial_value,
            value: initial_value,
        }
    })
    this._chart.histogram = this._data.map((ele, i) => {
        return d3.bin().domain(ele.extent)
            .thresholds(
                linspace(ele.extent[0], ele.extent[1], this._chart.n_bins[i].value+1)
            )
    })
    this._chart.bins = this._data.map((ele, i) => {
        return this._chart.histogram[i](ele.values)
    })
    this._chart.supported_curves = [
        'Basis', 'Bump Y', 'Cardinal', 'Catmull-Rom', 'Linear',
        'Monotone Y', 'Natural', 'Step'
    ]
    this._chart.violin_curve = CURVES[this._chart.supported_curves[0]]
    /**
     * Graphic components of the chart
     * @private
     * @type {{
     *  root_g: d3.selection,
     *  xaxwl_g: d3.selection
     *  xaxis_g: d3.selection,
     *  yaxwl_g: d3.selection,
     *  yaxis_g: d3.selection,
     *  key2_dividers_g: d3.selection,
     *  violins_g: d3.selection,
     *  violins: d3.selection[],
     *  boxes_g: d3.selection,
     *  outliers: d3.selection[],
     *  tooltip_div: d3.selection
     * }}
     */
    this._graphics = {
        // Root g tag (translated to account for the margins)
        root_g: null,
        // g tag for the x-axis and label
        yaxwl_g: null,
        // g tag for the x-axis
        xaxis_g: null,
        // g tag for the y-axis and label
        yaxwl_g: null,
        // g tag for the y-axis
        yaxis_g: null,
        // g tag for the class dividers
        cdividers_g: null,
        // g tag grouping all violins
        violins_g: null,
        // individual g tag for each violin
        violins: [],
        // g tag grouping all boxes
        boxes_g: null,
        // per group: g tag grouping all outliers of each box
        outliers: [],
        // div tag of the tooltip
        tooltip_div: null,
    }
    /**
     * Control panel things
     * TODO: if modifying a particular violin gets slow
     * because we have to fetch it based on key, we can
     * keep track of the selected one so that we only fetch
     * if when the selected key changes. Or something like that
     * @private
     * @type {{
     *  max_bins_multiplier: number,
     *  selected_index: number
     * }}
     */
    this._controls = {}
    this._controls.max_bins_multiplier = 3
    this._controls.selected_index = 0
}
// Set prototype chain
Object.setPrototypeOf(boxvio_chart_wrapper.prototype, d3_chart_wrapper.prototype)

/**
 * Query the data given a key template
 * @param {string[]} key_tpl the key template. Parts will be matched,
 * `null` counts as wildcard
 * @return {{
 *  key: string[],
 *  values: number[],
 *  metrics: {
 *      max: number,
 *      upper_fence: number,
 *      quartile3: number,
 *      median: number,
 *      mean: number,
 *      iqr: number,
 *      quartile1: number,
 *      lower_fence: number,
 *      min: number
 *  },
 *  outliers: number[],
 *  extent: [number, number]
 * }[]} the filtered data
 */
boxvio_chart_wrapper.prototype._query_data = function (key_tpl) {
    if (key_tpl.length !== this._key_size) {
        throw new Error("Key template is of different size than the plot keys")
    }
    return this._data.filter((ele) => {
        const key = ele.key
        for (let i = 0; i < key.length; i++) {
            if (key_tpl[i] && key_tpl[i] !== key[i]) {
                return false
            }
        }
        return true
    })
}

/**
 * Get key templates up to a key number
 * @param {number} i the key number. If 1, all existing keys
 *        will be returned. If 2, all existing keys with a wildcard in
 *        the last component will be returned. If 3, all existing keys
 *        with a wildcard in the last and second-to-last component will
 *        be returned.
 * @returns {string[][]} the templates
 */
boxvio_chart_wrapper.prototype._get_key_templates = function (i) {
    if (i < 1 || i > this._key_size) {
        throw new Error(`Invalid key number ${i}`)
    }
    // Convert to real index
    i = this._key_size - i
    const templates_wd = this._data.map((ele) => {
        return deepcopy(ele.key.slice(0,i+1)).concat(Array(this._key_size-i-1).fill(null))
    })
    if (!templates_wd.length) return templates_wd
    // Remove duplicates
    const templates = [templates_wd[0]]
    let tmp_template = templates_wd[0]
    for (const template of templates_wd.slice(1)) {
        if (!array_equal(tmp_template, template)) {
            templates.push(template)
            tmp_template = template
        }
    }
    return templates
}

/**
 * Get the possible values of the next key component, given a partial key.
 * E.g., if there are 4 components, and you provide the two leftmost ones
 * in the partial key, possible values for the third leftmost one will be
 * given
 * @param {string[]} pkey partial key
 * @returns {string[]} possible values for the next key component
 */
boxvio_chart_wrapper.prototype._get_next_key_component_values = function (pkey) {
    const psize = pkey.length
    if (psize >= this._key_size) {
        throw new Error(`Input key ${pkey} is longer than the data keys`)
    }
    const key_tpl = pkey.concat(Array(this._key_size-psize).fill(null))
    const values_wd = this._query_data(key_tpl).map((ele) => ele.key[psize])
    if (!values_wd.length) return values_wd
    const values = [values_wd[0]]
    let current_value = values_wd[0]
    for (const value of values_wd.slice(1)) {
        if (value !== current_value) {
            values.push(value)
            current_value = value
        }
    }
    return values
}

/**
 * Get the index of a key
 * @param {string[]} key the key 
 * @returns the index of the key
 */
boxvio_chart_wrapper.prototype.get_index_of_key = function (key) {
    const i = this._data.findIndex((ele) => ele.key.join() === key.join())
    if (i === -1) {
        throw new Error(`Key ${key} was not found in data`)
    }
    return i
}

/**
 * Set the scale for the violins
 * @function
 * @param {number} scale the scale [0, 1]
 * @name boxvio_chart_wrapper#set_violin_scale
 */
boxvio_chart_wrapper.prototype.set_violin_scale = function (scale) {
    this._chart.violin_scale.value = scale
    // Remove the violin graphics, only leaving its root g tag (violins_g)
    this._graphics.violins_g.selectAll('*').remove()
    this._render_violins(true)
}

/**
 * Set the number of bins for a particular violin
 * 
 * Updates the chart accordingly
 * @param {number} i the index of the violin
 * @param {number} n_bins number of bins
 * @name boxvio_chart_wrapper#set_n_bins
 */
boxvio_chart_wrapper.prototype.set_n_bins = function (i, n_bins) {
    const chart = this._chart
    const extent = this._data[i].extent
    chart.n_bins[i].value = n_bins
    chart.histogram[i].thresholds(
        linspace(extent[0], extent[1], n_bins+1)
    )
    chart.bins[i] = chart.histogram[i](this._data[i].values)
    // Delete the oath of the existing violin and redraw
    this._graphics.violins[i].selectAll('*').remove()
    this._render_violin(i)
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
    this._chart.box_scale.value = scale
    // Remove the box graphics, only leaving its root g tag (boxes_g)
    this._graphics.boxes_g.selectAll('*').remove()
    this._render_boxes(true)
}

/**
 * Render the plot
 * @function
 * @protected
 * @name boxvio_chart_wrapper#render_plot
 */
boxvio_chart_wrapper.prototype.render_plot = function () {
    d3_chart_wrapper.prototype.render_plot.call(this)

    if (this._overflow) {
        this.svg.attr('width', null)
        this.svg.attr('height', '500px')
        this.plot_container.style = "overflow: auto;"
    }

    // Set viewBox of svg
    this.svg.attr('viewBox', `0 0 ${this._full_width} ${this._full_height}`)

    // Root g tag
    this._graphics.root_g = this.svg.append('g')
        .attr('transform', `translate(${this._chart.margin.left},${this._chart.margin.top})`)

    this._render_axis()
    this._render_ygrid()
    if (this._key_size > 1) {
        this._render_key2_dividers()
    }
    this._render_violins()
    this._render_boxes()
    this._render_tooltip()

}

/**
 * Render the axis
 * @function
 * @private
 * @name boxvio_chart_wrapper#_render_axis
 */
boxvio_chart_wrapper.prototype._render_axis = function () {
    const g = this._graphics.root_g
    // Render X axis
    this._graphics.xaxwl_g = g.append('g')
        .attr('transform', `translate(0,${this._chart.height})`)
    const xaxwl_g = this._graphics.xaxwl_g
    this._graphics.xaxis_g = xaxwl_g.append('g')
        .call(this._chart.xaxis)
    this.apply_xticklabel_angle()
    // Render X axis label
    xaxwl_g.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', 50)
        .attr('x', this._chart.width / 2)
        .text(this._key_titles[this._key_titles.length-1])
    
    // Render y axis
    this._graphics.yaxwl_g = g.append('g')
    const yaxwl_g = this._graphics.yaxwl_g
    this._graphics.yaxis_g = yaxwl_g.append('g')
        .call(this._chart.yaxis)
    // Render Y axis label
    yaxwl_g.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('y', -this._chart.margin.left + 20)
        .attr('x', -this._chart.height / 2)
        .text(this._ylabel)

}

/**
 * Apply an angle to the xtick labels
 * @function
 * @name boxvio_chart_wrapper#apply_xticklabel_angle
 */
boxvio_chart_wrapper.prototype.apply_xticklabel_angle = function () {
    const angle = this._chart.xticklabel_angle
    const xaxis_g = this._graphics.xaxis_g
    if (angle < 10) {
        xaxis_g.selectAll('text')
            .attr('text-anchor', 'middle')
            .attr("dy", "0.8em")
            .attr("dx", "0")
            .attr('transform', `rotate(${-this._chart.xticklabel_angle})`)
    } else {
        xaxis_g.selectAll('text')
            .attr('text-anchor', 'end')
            .attr("dy", `${-angle*angle*0.00006172839}em`)
            .attr("dx", "-0.9em")
            .attr('transform',
                `rotate(${-this._chart.xticklabel_angle})`
            )
        if (angle < 50) {
            xaxis_g.selectAll('text')
                .attr('dx', '-0.7em')
        }
    }
}

/**
 * Render the grid for the y-axis
 * @function
 * @private
 * @name boxvio_chart_wrapper#_render_ygrid
 */
boxvio_chart_wrapper.prototype._render_ygrid = function () {
    const ticks = this._graphics.yaxis_g.selectAll('g.tick')
    ticks.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', this._chart.width)
        .attr('y2', 0)
        .attr('stroke', (_, i) => i % 2 ? '#E0E0E0' : '#D1D1D1')
        .attr('stroke-width', (_, i) => i % 2 ? 0.5 : 0.8)
        .attr('class', (_, i) => i % 2 ? 'minor' : 'major')
        .attr('opacity', 0)  // disabled by default
}

/**
 * Apply a grid mode to the y axis
 * @param {'None' | 'Major' | 'Major + Minor'} mode the mode
 * @function
 * @name boxvio_chart_wrapper#apply_ygrid_mode
 */
boxvio_chart_wrapper.prototype.apply_ygrid_mode = function (mode) {
    const major_lines = this._graphics.yaxis_g.selectAll('g.tick line.major')
    const major_opacity = major_lines.attr('opacity')
    const minor_lines = this._graphics.yaxis_g.selectAll('g.tick line.minor')
    const minor_opacity = minor_lines.attr('opacity')
    switch (mode) {
        case 'None':
            if (major_opacity == 1) {
                toggle_visibility(major_lines)
            }
            if (minor_opacity == 1) {
                toggle_visibility(minor_lines)
            }
            break
        case 'Major':
            if (major_opacity == 0) {
                toggle_visibility(major_lines)
            }
            if (minor_opacity == 1) {
                toggle_visibility(minor_lines)
            }
            break
        case 'Major + Minor':
            if (major_opacity == 0) {
                toggle_visibility(major_lines)
            }
            if (minor_opacity == 0) {
                toggle_visibility(minor_lines)
            }
            break
        default:
            throw new Error(`Grid mode '${mode}' is not supported?`)
    }
}

/**
 * Render the dividers for key2
 * @function
 * @private
 * @name boxvio_chart_wrapper#_render_key2_dividers
 */
boxvio_chart_wrapper.prototype._render_key2_dividers = function () {
    this._graphics.key2_dividers_g = this._graphics.root_g.append('g')
    const dividers_g = this._graphics.key2_dividers_g
    const color = 'gray'
    const key_tpls = this._get_key_templates(2)

    let i = 0;
    for (const [index, key_tpl] of key_tpls.entries()) {
        const queried_data = this._query_data(key_tpl)
        const x = this._chart.xscale(this._key_strings[i])
        const divider_g = dividers_g.append('g')
            .attr('transform', `translate(${x},0)`)
        if (index !== 0) {
            divider_g.append('line')
                .attr('x1', 0)
                .attr('y1', 0)
                .attr('x2', 0)
                .attr('y2', this._chart.height)
                .attr('stroke', color)
                .attr('stroke-width', 0.9)
                .attr('stroke-dasharray', this._chart.height/35)
        }
        divider_g.append('text')
            .attr('text-anchor', 'end')
            .attr('transform', 'rotate(-90)')
            .attr('y', '1.3em')  // This is the horizontal axis now
            .attr('x', '-0.6em')  // This is the vertical axis now
            .attr('font-size', '0.8em')
            .attr('fill', color)
            .text(key_tpl[key_tpl.length-2])
        // Increase the index by the number of groups in the class
        i += queried_data.length
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
boxvio_chart_wrapper.prototype._render_violins = function (is_g_ready=false) {
    const chart = this._chart
    const g = this._graphics.root_g

    // Render
    if (!is_g_ready) {
        this._graphics.violins_g = g.append('g')
    }
    const violins_g = this._graphics.violins_g
    for (const [i, key_string] of this._key_strings.entries()) {
        this._graphics.violins[i] = violins_g.append('g')
            .attr('transform', `translate(${chart.xscale(key_string)},0)`)
        this._render_violin(i)
    }

}

/**
 * Render a violin
 * @function
 * @private
 * @param {boolean} i the index of the violin
 * @name boxvio_chart_wrapper#_render_violins
 */
boxvio_chart_wrapper.prototype._render_violin = function (i) {
    const bins = this._chart.bins[i]
    const violin_scale = this._chart.violin_scale.value
    const bandwidth = this._chart.xscale.bandwidth()
    const yscale = this._chart.yscale
    const violin_curve = this._chart.violin_curve

    // Get the largest count in a bin as it will be maximum width
    const max_count = d3.max(bins, (bin) => bin.length)
    // Make a linear scale to map bin counts to bandwidth
    const x_num = d3.scaleLinear()
        .range([0, bandwidth])
        .domain([-max_count, max_count])

    // Only render violin if there is more than 1 datapoint (otherwise there are NaNs around)
    if (this._data[i].values.length > 1) {
        this._graphics.violins[i]
            .append('path')
            .datum(bins)
                .style('stroke', 'gray')
                .style('stroke-width', 0.4)
                .style('fill', '#d2d2d2')
                .attr('d', d3.area()
                    .x0((d) => x_num(-d.length*violin_scale))
                    .x1((d) => x_num(d.length*violin_scale))
                    .y((d) => yscale(d.x0))
                    .curve(violin_curve)
                )
    }
}

/**
 * TODO: refactor
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
    const box_width = this._chart.box_scale.value * bandwidth

    const whiskers_lw = 2
    const median_lw = 3

    // Iterate over the groups
    for (const [i, ele] of this._data.entries()) {

        const metrics = ele.metrics
        const color = this._colors[i]
        const key = ele.key

        const group_box = boxes.append('g')
            .attr('transform', `translate(${chart.xscale(join_key(key)) + bandwidth / 2},0)`)

        // Draw outliers
        this._graphics.outliers[i] = group_box.append('g')
        const outliers = this._graphics.outliers[i]
        for (const outlier of ele.outliers) {
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
        // Only draw rectangle if there is more than 1 datapoint (otherwise NaNs appear)
        if (ele.values.length > 1) {
            iqr.append('rect')  // iqr rect
            .attr('x', -box_width / 2)
            .attr('y', chart.yscale(metrics.quartile3))
            .attr('width', box_width)
            .attr('height', chart.yscale(metrics.quartile1) - chart.yscale(metrics.quartile3))
            .attr('fill', color)
        }
        iqr.append('line')  // median line
            .attr('x1', -box_width / 2)
            .attr('y1', chart.yscale(metrics.median))
            .attr('x2', box_width / 2)
            .attr('y2', chart.yscale(metrics.median))
            .attr('stroke', 'black')
            .attr('stroke-width', median_lw)
        const circle = iqr.append('circle')  // median dot
            .attr('cx', 0)
            .attr('cy', chart.yscale(metrics.median))
            .attr('r', 4.5)
            .style('fill', 'white')
            .attr('stroke', 'black')
            .attr('stroke-width', 2)
        // Circle events for tooltip
        circle.on('mouseover', () => {
            this._graphics.tooltip_div.style('display', null)
            this.tooltip_hover(i)
        }).on('mouseout', () => {
            this._graphics.tooltip_div.style('display', 'none')
        })
    }

}

/**
 * Add the tooltip to the DOM
 * @function
 * @private
 * @name boxvio_chart_wrapper#_render_tooltip
 */
boxvio_chart_wrapper.prototype._render_tooltip = function () {
    const tooltip_element = common.create_dom_element({
        element_type: 'div',
        id: `${this.id_string()}_tooltip_div`,
        class_name: 'o-red',
    })
    insert_after(tooltip_element, this.plot_container)
    this._graphics.tooltip_div = d3.select(tooltip_element)
    const tooltip_div = this._graphics.tooltip_div
    for (const [k, v] of Object.entries(TOOLTIP_STYLE)) {
        tooltip_div.style(k, v)
    }
        
}

/**
 * Set the tooltip to visible when we hover over
 * @param {number} i index of data
 * @function
 * @name boxvio_chart_wrapper#tooltip_hover
 */
boxvio_chart_wrapper.prototype.tooltip_hover = function (i) {
    const decimals = 3
    const key = this._data[i].key
    const values = this._data[i].values
    const metrics = this._data[i].metrics
    const tooltip_text = `<b>${key.join(', ')}</b>`
        + '<span style="font-size: smaller;">'
        + `<br>Datapoints: ${values.length}`
        + `<br>Mean: ${metrics.mean.toFixed(decimals)}`
        + `<br>Max: ${metrics.max.toFixed(decimals)}`
        + `<br>Q3: ${metrics.quartile3.toFixed(decimals)}`
        + `<br>Median: ${metrics.median.toFixed(decimals)}`
        + `<br>Q1: ${metrics.quartile1.toFixed(decimals)}`
        + `<br>Min: ${metrics.min.toFixed(decimals)}`
        + '</span>'
    this._graphics.tooltip_div
        .html(tooltip_text)
}

/**
 * Render the control panel
 * @function
 * @protected
 * @name boxvio_chart_wrapper#render_control_panel
 */
boxvio_chart_wrapper.prototype.render_control_panel = function () {
    d3_chart_wrapper.prototype.render_control_panel.call(this)

    const upper_container = common.create_dom_element({
        element_type: 'div',
        parent: this.controls_container,
        style: {
            'display': 'flex',
            'direction': 'flex-row',
            'justify-content': 'space-between',
            'align-items': 'center',
        },
    })
    this._render_grid_select(upper_container)
    this._render_xticklabel_angle_slider(upper_container)
    this._render_violin_curve_selector(upper_container)
    this._render_checkboxes()
    this._render_scale_sliders()
    this._render_n_bins_control()

}

/**
 * Render the selector for grid mode
 * @function
 * @private
 * @param {Element} container the container element
 * @name boxvio_chart_wrapper#_render_grid_select
 */
boxvio_chart_wrapper.prototype._render_grid_select = function (container) {
    const select_container = common.create_dom_element({
        element_type: 'div',
        parent: container,
        style: {
            'display': 'flex',
            'gap': DEFAULT_FLEX_GAP,
        },
    })
    const grid_select_id = `${this.id_string()}_grid_select`
    const grid_select_label = common.create_dom_element({
        element_type: 'label',
        text_content: tstring.grid || 'Grid',
        parent: select_container,
        style: {'margin-block': 'auto'},
    })
    grid_select_label.setAttribute('for', grid_select_id)
    const grid_select = common.create_dom_element({
        element_type: 'select',
        id: grid_select_id,
        parent: select_container,
        // TODO: add ARIA attributes?
    })
    common.create_dom_element({
        element_type: 'option',
        value: 'None',
        text_content: tstring.none_f || 'None',
        parent: grid_select,
    })
    common.create_dom_element({
        element_type: 'option',
        value: 'Major',
        text_content: tstring.major || 'Major',
        parent: grid_select,
    })
    common.create_dom_element({
        element_type: 'option',
        value: 'Major + Minor',
        text_content: tstring.major_minor || 'Major + Minor',
        parent: grid_select,
    })
    grid_select.addEventListener('change', () => {
        const mode = grid_select.value
        this.apply_ygrid_mode(mode)
    })
}

/**
 * Render the slider for the xticklabel angle
 * @function
 * @private
 * @param {Element} container the container element
 * @name boxvio_chart_wrapper#_render_xticklabel_angle_slider
 */
boxvio_chart_wrapper.prototype._render_xticklabel_angle_slider = function (container) {
    const slider_container = common.create_dom_element({
        element_type: 'div',
        parent: container,
        style: {
            'display': 'flex',
            'gap': DEFAULT_FLEX_GAP,
        },
    })
    const xticklabel_angle_slider_id = `${this.id_string()}_xticklabel_angle_slider`
    const xticklabel_angle_slider_label = common.create_dom_element({
        element_type: 'label',
        text_content: tstring.xticklabel_angle || "X-Tick label angle",
        parent: slider_container,
        style: {'margin-block': 'auto'},
    })
    xticklabel_angle_slider_label.setAttribute('for', xticklabel_angle_slider_id)
    /** @type {Element} */
    const xticklabel_angle_slider = common.create_dom_element({
        element_type: 'input',
        type: 'range',
        id: xticklabel_angle_slider_id,
        parent: slider_container,
    })
    xticklabel_angle_slider.setAttribute('min', 0)
    xticklabel_angle_slider.setAttribute('max', 90)
    xticklabel_angle_slider.value = this._chart.xticklabel_angle
    xticklabel_angle_slider.addEventListener('input', () => {
        this._chart.xticklabel_angle = Number(xticklabel_angle_slider.value)
        this.apply_xticklabel_angle()
    })
}

/**
 * Render the selector for the violin curve
 * @function
 * @private
 * @param {Element} container the container element
 * @name boxvio_chart_wrapper#_render_violin_curve_selector
 */
boxvio_chart_wrapper.prototype._render_violin_curve_selector = function (container) {
    const select_container = common.create_dom_element({
        element_type: 'div',
        parent: container,
        style: {
            'display': 'flex',
            'gap': DEFAULT_FLEX_GAP,
        },
    })
    const curve_select_id = `${this.id_string()}_curve_select`
    const curve_select_label = common.create_dom_element({
        element_type: 'label',
        text_content: tstring.violin_curve || 'Violin curve',
        parent: select_container,
        style: {'margin-block': 'auto'},
    })
    curve_select_label.setAttribute('for', curve_select_id)
    const curve_select = common.create_dom_element({
        element_type: 'select',
        id: curve_select_id,
        parent: select_container,
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
    // Container div
    const container_div = common.create_dom_element({
        element_type: 'div',
        parent: this.controls_container,
        style: {
            'display': 'flex',
            'direction': 'flex-row',
            'justify-content': 'space-between',
            'align-items': 'center',
            'margin-top': DEFUALT_MARGIN,
        },
    })

    // Show key 2
    const show_key2_div = common.create_dom_element({
        element_type: 'div',
        parent: container_div,
    })
    const show_key2_checkbox_id = `${this.id_string()}_show_key2_checkbox`
    /** @type {Element} */
    const show_key2_checkbox = common.create_dom_element({
        element_type: 'input',
        type: 'checkbox',
        id: show_key2_checkbox_id,
        parent: show_key2_div,
    })
    show_key2_checkbox.checked = true
    /** @type {Element} */
    const show_key2_label = common.create_dom_element({
        element_type: 'label',
        text_content: (tstring.show || 'Show')
                      + ' '
                      + this._key_titles[this._key_size-2].toLowerCase(),
        parent: show_key2_div,
    })
    show_key2_label.setAttribute('for', show_key2_checkbox_id)
    show_key2_checkbox.addEventListener('change', () => {
        toggle_visibility(this._graphics.key2_dividers_g)
    })
    
    // Show violins
    const show_violins_div = common.create_dom_element({
        element_type: 'div',
        parent: container_div,
    })
    const show_violins_checkbox_id = `${this.id_string()}_show_violins_checkbox`
    /** @type {Element} */
    const show_violins_checkbox = common.create_dom_element({
        element_type: 'input',
        type: 'checkbox',
        id: show_violins_checkbox_id,
        parent: show_violins_div,
    })
    show_violins_checkbox.checked = true
    /** @type {Element} */
    const show_violins_label = common.create_dom_element({
        element_type: 'label',
        text_content: tstring.show_violins || 'Show violins',
        parent: show_violins_div,
    })
    show_violins_label.setAttribute('for', show_violins_checkbox_id)
    show_violins_checkbox.addEventListener('change', () => {
        toggle_visibility(this._graphics.violins_g)
    })

    // Show boxes
    const show_boxes_div = common.create_dom_element({
        element_type: 'div',
        parent: container_div,
    })
    const show_boxes_checkbox_id = `${this.id_string()}_show_boxes_checkbox`
    /** @type {Element} */
    const show_boxes_checkbox = common.create_dom_element({
        element_type: 'input',
        type: 'checkbox',
        id: show_boxes_checkbox_id,
        parent: show_boxes_div,
    })
    show_boxes_checkbox.checked = true
    /** @type {Element} */
    const show_boxes_label = common.create_dom_element({
        element_type: 'label',
        text_content: tstring.show_boxes || 'Show boxes',
        parent: show_boxes_div,
    })
    show_boxes_label.setAttribute('for', show_boxes_checkbox_id)
    show_boxes_checkbox.addEventListener('change', () => {
        toggle_visibility(this._graphics.boxes_g)
        // (DISABLED) Disable the checkbox for outliers (defined below)
        // show_outliers_checkbox.disabled = !show_boxes_checkbox.checked
    })

    // Show outliers
    const show_outliers_div = common.create_dom_element({
        element_type: 'div',
        parent: container_div,
    })
    const show_outliers_checkbox_id = `${this.id_string()}_show_outliers_checkbox`
    /** @type {Element} */
    const show_outliers_checkbox = common.create_dom_element({
        element_type: 'input',
        type: 'checkbox',
        id: show_outliers_checkbox_id,
        parent: show_outliers_div,
    })
    show_outliers_checkbox.checked = true
    /** @type {Element} */
    const show_outliers_label = common.create_dom_element({
        element_type: 'label',
        text_content: tstring.show_outliers || 'Show outliers',
        parent: show_outliers_div,
    })
    show_outliers_label.setAttribute('for', show_outliers_checkbox_id)
    show_outliers_checkbox.addEventListener('change', () => {
        for (const group of this._graphics.outliers) {
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
    // Container div
    const container_div = common.create_dom_element({
        element_type: 'div',
        parent: this.controls_container,
        style: {
            'display': 'flex',
            'direction': 'flex-row',
            'justify-content': 'space-between',
            'align-items': 'center',
        },
    })

    // Violin scale
    const violin_container_div = common.create_dom_element({
        element_type: 'div',
        parent: container_div,
        style: {
            'display': 'flex',
            'gap': DEFAULT_FLEX_GAP,
        },
    })
    const violin_scale_slider_id = `${this.id_string()}_violin_scale_slider`
    const violin_scale_slider_label = common.create_dom_element({
        element_type: 'label',
        text_content: tstring.violin_width || 'Violin width',
        parent: violin_container_div,
        style: {
            'margin-block': 'auto',
        },
    })
    violin_scale_slider_label.setAttribute('for', violin_scale_slider_id)
    /** @type {Element} */
    const violin_scale_slider = common.create_dom_element({
        element_type: 'input',
        type: 'range',
        id: violin_scale_slider_id,
        parent: violin_container_div,
    })
    violin_scale_slider.setAttribute('min', 0)
    violin_scale_slider.setAttribute('max', 1)
    violin_scale_slider.setAttribute('step', 0.05)
    violin_scale_slider.value = this._chart.violin_scale.initial
    violin_scale_slider.addEventListener('input', () => {
        this.set_violin_scale(Number(violin_scale_slider.value))
    })
    /** @type {Element} */
    const violin_scale_slider_reset = common.create_dom_element({
        element_type: 'button',
        type: 'button',
        text_content: tstring.reset || 'Reset',
        parent: violin_container_div,
    })
    violin_scale_slider_reset.addEventListener('click', () => {
        violin_scale_slider.value = this._chart.violin_scale.initial
        this.set_violin_scale(Number(violin_scale_slider.value))
    })

    // Box scale
    const box_container_div = common.create_dom_element({
        element_type: 'div',
        parent: container_div,
        style: {
            'display': 'flex',
            'gap': DEFAULT_FLEX_GAP,
        },
    })
    const box_scale_slider_id = `${this.id_string()}_box_scale_slider`
    const box_scale_slider_label = common.create_dom_element({
        element_type: 'label',
        text_content: tstring.box_width || 'Box width',
        parent: box_container_div,
        style: {
            'margin-block': 'auto',
        },
    })
    box_scale_slider_label.setAttribute('for', box_scale_slider_id)
    /** @type {Element} */
    const box_scale_slider = common.create_dom_element({
        element_type: 'input',
        type: 'range',
        id: box_scale_slider_id,
        parent: box_container_div,
    })
    box_scale_slider.setAttribute('min', 0)
    box_scale_slider.setAttribute('max', 1)
    box_scale_slider.setAttribute('step', 0.05)
    box_scale_slider.value = this._chart.box_scale.initial
    box_scale_slider.addEventListener('input', () => {
        this.set_box_scale(Number(box_scale_slider.value))
    })
    /** @type {Element} */
    const box_scale_slider_reset = common.create_dom_element({
        element_type: 'button',
        type: 'button',
        text_content: tstring.reset || 'Reset',
        parent: box_container_div,
    })
    box_scale_slider_reset.addEventListener('click', () => {
        box_scale_slider.value = this._chart.box_scale.initial
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
    // Render selects for the different key components
    const key_selects = []
    /**
     * Inner function for populating a key select tag
     * Previous key tags must be populated already
     * @param {number} i index of the key select 
     */
    const populate_key_select = (i) => {
        key_selects[i].replaceChildren()  // Delete existing children
        const pkey = key_selects.slice(0, i).map((key_select) => key_select.value)
        const values = this._get_next_key_component_values(pkey)
        for (const value of values) {
            common.create_dom_element({
                element_type: 'option',
                value: value,
                text_content: value,
                parent: key_selects[i],
            })
        }
    }
    for (let i = 0; i < this._key_size; i++) {
        const select_id = `${this.id_string()}_key${this._key_size-i}_select`
        const label = common.create_dom_element({
            element_type: 'label',
            text_content: this._key_titles[i],
            parent: this.controls_container,
        })
        label.setAttribute('for', select_id)
        const key_select = common.create_dom_element({
            element_type: 'select',
            id: select_id,
            parent: this.controls_container,
        })
        key_selects.push(key_select)
        populate_key_select(i)
        key_select.addEventListener('change', () => {
            // Repopulate the next key selects
            for (let j = i+1; j < key_selects.length; j++) {
                populate_key_select(j)
            }
            // Update the selected index
            this._controls.selected_index = this.get_index_of_key(
                key_selects.map((ks) => ks.value)
            )
            // Update the violin n bins slider
            violin_n_bins_slider.setAttribute(
                'max',
                this._controls.max_bins_multiplier
                    * this._chart.n_bins[this._controls.selected_index].initial
            )
            violin_n_bins_slider.value
                = this._chart.n_bins[this._controls.selected_index].value
        })
    }

    // Slider for n bins
    const violin_n_bins_slider_id = `${this.id_string()}_violin_n_bins_slider`
    const violin_n_bins_label = common.create_dom_element({
        element_type: 'label',
        text_content: tstring.violin_resolution || 'Violin resolution',
        parent: this.controls_container,
    })
    violin_n_bins_label.setAttribute('for', violin_n_bins_slider_id)
    const violin_n_bins_slider = common.create_dom_element({
        element_type: 'input',
        type: 'range',
        id: violin_n_bins_slider_id,
        parent: this.controls_container,
    })
    violin_n_bins_slider.setAttribute('min', 2)
    violin_n_bins_slider.setAttribute(
        'max',
        this._controls.max_bins_multiplier
            * this._chart.n_bins[this._controls.selected_index].initial
    )
    violin_n_bins_slider.value = this._chart.n_bins[this._controls.selected_index].value
    violin_n_bins_slider.addEventListener('input', () => {
        this.set_n_bins(this._controls.selected_index, Number(violin_n_bins_slider.value))
    })

    // Reset n bins
    const violin_n_bins_slider_reset = common.create_dom_element({
        element_type: 'button',
        type: 'button',
        text_content: tstring.reset || 'Reset',
        parent: this.controls_container,
    })
    violin_n_bins_slider_reset.addEventListener('click', () => {
        violin_n_bins_slider.value = this._chart.n_bins[this._controls.selected_index].initial
        this.set_n_bins(this._controls.selected_index, Number(violin_n_bins_slider.value))
    })

    // Reset all n bins
    const violin_all_n_bins_slider_reset = common.create_dom_element({
        element_type: 'button',
        type: 'button',
        text_content: tstring.reset_all_violins || 'Reset all violins',
        parent: this.controls_container,
    })
    violin_all_n_bins_slider_reset.addEventListener('click', () => {
        // Update the value of the slider
        violin_n_bins_slider.value = this._chart.n_bins[this._controls.selected_index].initial
        for (const [i, n_bins] of this._chart.n_bins.entries()) {
            this.set_n_bins(i, n_bins.initial)
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

/**
 * Splitter string
 * @type {string}
 */
const SPLITTER = '_^PoT3sRanaCantora_'

/**
 * Join key array into a string
 * @param {string[]} key the key
 * @returns {string} the join
 */
function join_key(key) {
    return key.join(SPLITTER)
}

/**
 * Split key string into array
 * @param {string} key the key join
 * @returns {string[]} the split key
 */
function split_key(key) {
    return key.split(SPLITTER)
}