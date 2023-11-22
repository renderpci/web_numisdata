"use strict";

import { d3_chart_wrapper } from "../d3-chart-wrapper";
import { COLOR_PALETTE } from "../../chart-wrapper";
import { toggle_visibility, linspace, CURVES } from "../utils";
import { compute_n_bins } from "../../compute-n-bins";
import { insert_after } from "../../utils";
import { keyed_data } from "../../keyed-data";
import { calc_boxplot_metrics } from "./utils";


/**
 * Name of the group change event
 * @type {string}
 */
const GROUP_CHANGE_EVENT_NAME = 'ch_group_change'
/**
 * Group change event
 * @type {Event}
 */
const GROUP_CHANGE_EVENT = new Event(GROUP_CHANGE_EVENT_NAME)

/**
 * Margin for the key2 label
 * @type {[number, number]}
 */
const KEY2_MARGIN = [10, 33]

/**
 * Limit for the amount of characters displayed in the labels of key 2
 * @type {number}
 */
const KEY2_LABEL_CHARACTER_LIMIT = 45


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
 * @param {{id: string, key: string[], values: number[], color: string}[]} data the input data: an array of objects
 * 		with id (unique identifier), key (array of components, from general to specific), values
 * 		(the datapoints), and an optional color. It may contain any other keys, that can be passed to the tooltip callback
 * 		(KEY COMPONENTS MUST NOT INCLUDE `'_^PoT3sRanaCantora_'`, or things WILL break)
 * @param {string[]} key_titles the title for each key component
 * @param {Object} options configuration options
 * @param {boolean} options.display_download whether to display the download panel (default `false`)
 * @param {boolean} options.display_control_panel whether to display the control panel (default `false`)
 * @param {boolean} options.overflow whether going beyond the width of the plot container is allowed (default `false`).
 * 		if `false`, the svg will be stretched to fill the full width of its parent element
 * @param {string} options.outer_height outer height of the plot, will be the height applied to the SVG (default `500px`)
 * 		overflow must be enabled for outer_height to work
 * @param {[number, number]} options.whiskers_quantiles overrides default behavior of the whiskers
 * 		by specifying the quantiles of the lower and upper
 * @param {boolean} options.sort_xaxis whether to sort the xaxis (default `false`). When there is more than one key-2, sorting is mandatory.
 * @param {string} options.ylabel the y-label (default `null`)
 * @param {number} options.xticklabel_angle the angle (in degrees) for the xtick labels (default `0`)
 * @param {(options: Object) => Promise<Element>} options.tooltip_callback called to fill space in the tooltip
 * 	next to the metrics. It takes an options object as argument and returns a Promise of an HTML element to add to the
 * 	tooltip. The attributes of the options object come from the data and are determined by the
 * `tooltip_callback_options_attributes` option
 * @param {string[]} options.tooltip_callback_options_attributes list of datum attributes to include in the
 * 	options object for the tooltip callback. If the callback is provided, this list MUST be provided as well
 * @class
 * @extends d3_chart_wrapper
 */
export function boxvio_chart_wrapper(div_wrapper, data, key_titles, options) {
	d3_chart_wrapper.call(this, div_wrapper, options)
	/**
	 * Called when the tooltip is shown to render extra info
	 * @private
	 * @type {(options: Object) => Promise<Element>}
	 */
	this._tooltip_callback = options.tooltip_callback || null
	/**
	 * List of datum attributes to include in the options argument of the tooltip callback
	 * @private
	 * @type {string[]}
	 */
	this._tooltip_callback_options_attributes = options.tooltip_callback_options_attributes || null
	/**
	 * Overrides default behavior of the whiskers by specifying
	 * the quantiles of the lower and upper
	 * @type {[number, number]}
	 * @private
	 */
	this._whiskers_quantiles = options.whiskers_quantiles || null
	const sort_xaxis = options.sort_xaxis || data[0].key.length > 1 || false
	if (!data.length) {
		throw new Error("Data array is empty")
	}
	// Assign a color from the color palette if not provided
	for (const [i, datum] of data.entries()) {
		datum.color = datum.color || COLOR_PALETTE[i % COLOR_PALETTE.length]
	}
	/**
	 * Data: id, key (general to specific components), values,
	 * boxplot metrics, outliers, extent (min and max)
	 * @type {{
	 * 	id: string,
	 *  key: string[],
	 *  values: number[],
	 *  color: string,
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
		ele.metrics = calc_boxplot_metrics(ele.values, this._whiskers_quantiles)
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
	 * IDs for the data
	 * @type {string[]}
	 * @private
	 */
	this._ids = this._data.map((ele) => ele.id)
	/**
	 * Title for each key component
	 * @type {string[]}
	 * @private
	 */
	this._key_titles = key_titles
	/**
	 * Data manager (to handle keys)
	 * @type {keyed_data}
	 * @private
	 */
	this._kdm = new keyed_data(this._data)
	/**
	 * Available key2 values
	 * @type {string[]}
	 * @private
	 */
	this._key2_values = this._kdm.key_size > 1
		? this._kdm.key_values(2)
		: null
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
	this._full_width = this._data.length < 150
		? 330.664701211*Math.sqrt(this._data.length) - 170.664701211 + this.yaxis_padding
		: 26*this._data.length + this.yaxis_padding
	if (this._kdm.key_size > 1) {  // If we have a key-2, add some margin
		this._full_width += this._key2_values.length*d3.sum(KEY2_MARGIN)
	}
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
	 * 	tooltip_active: number,
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
	 *  violin_bandwidth: number,
	 *  box_scale: {initial: number, value: number},
	 *  xscale: d3.scaleBand,
	 *  key2_start_x: {[key2: string]: number},
	 *  datum_start_x: number[],
	 *  xaxis: d3.axisGenerator,
	 *  xticklabel_angle: number,
	 *  n_bins: {initial: number, value: number}[],
	 *  histogram: d3.binGenerator[],
	 *  bins: d3.Bin[][],
	 *  supported_curves: string[],
	 *  violin_curve: d3.curve
	 * }}
	 */
	this._chart = {}
	this._chart.tooltip_active = null
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
	this._chart.violin_bandwidth =  // Subtract key2 margins from the plot width
		(this._chart.width - this._key2_values.length*d3.sum(KEY2_MARGIN))
		/ this._data.length
	this._chart.box_scale = {initial: 0.3, value: 0.3}
	this._chart.xscale = d3.scaleBand()
		.domain(this._ids)
		.range([0, this._chart.width])
		// .padding(1-this._chart.violin_scale)     // This is important: it is the space between 2 groups. 0 means no padding. 1 is the maximum.
	this._chart.key2_start_x = this._kdm.key_size > 1
		? this._compute_key2_start_x()
		: null
	this._chart.datum_start_x = this._compute_datum_start_x()
	this._chart.xaxis = d3.axisBottom(this._chart.xscale)
		.tickFormat((id) => this._data.find((datum) => datum.id === id).key[this._kdm.key_size - 1])
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
	 * 	whiskers: d3.selection[],
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
		// g tag for the key2 dividers
		key2_dividers_g: null,
		// g tag grouping all violins
		violins_g: null,
		// individual g tag for each violin
		violins: [],
		// g tag grouping all boxes
		boxes_g: null,
		// per group: g tag grouping all outliers of each box
		outliers: [],
		// per group: g tag grouping the whiskers of each box
		whiskers: [],
		// div tag of the tooltip
		tooltip_div: null
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
	 *  selected_index: number,
	 *	sections: {
	 *		general: {
	 *			title: HTMLDivElement,
	 *			content_container: HTMLDivElement
	 *		},
	 *		specific: {
	 *			title: HTMLDivElement,
	 *			content_container: HTMLDivElement
	 *		}
	 *	},
	 * 	grid_select: HTMLSelectElement,
	 * 	xticklabel_angle_slider: HTMLInputElement,
	 *	curve_select: HTMLSelectElement,
	 *	show_checkboxes: {
	 *		key2: HTMLInputElement,
	 *		violins: HTMLInputElement,
	 *		boxes: HTMLInputElement,
	 *		whiskers: HTMLInputElement,
	 *		outliers: HTMLInputElement
	 *	},
	 *	scale: {
	 *		violin: {
	 *			slider: HTMLInputElement,
	 *			reset: HTMLButtonElement
	 * 		},
	 *		box: {
	 *			slider: HTMLInputElement,
	 *			reset: HTMLButtonElement
	 * 		},
	 *	},
	 *	violin_n_bins: {
	 *		slider: HTMLInputElement,
	 *		reset: HTMLButtonElement,
	 *		reset_all: HTMLButtonElement
	 *	}
	 * }}
	 */
	this._controls = {
		max_bins_multiplier: 3,
		selected_index: 0,
		sections: {
			general: {
				title: null,
				content_container: null
			},
			specific: {
				title: null,
				content_container: null
			}
		},
		grid_select: null,
		xticklabel_angle_slider: null,
		curve_select: null,
		show_checkboxes: {
			key2: null,
			violins: null,
			boxes: null,
			whiskers: null,
			outliers: null
		},
		scale: {
			violin: {
				slider: null,
				reset: null
			},
			box: {
				slider: null,
				reset: null
			}
		},
		violin_n_bins: {
			slider: null,
			reset: null,
			reset_all: null
		}
	}
}
// Set prototype chain
Object.setPrototypeOf(boxvio_chart_wrapper.prototype, d3_chart_wrapper.prototype)

/**
 * Compute starting points (in plot x-coordinates) for the different
 * key2s. There we will draw the key2 labels and separating line
 * @returns {{[key2: string]: number}} the starting position for each key2
 */
boxvio_chart_wrapper.prototype._compute_key2_start_x = function () {
	const positions = {}

	const key_tpls = this._kdm.get_key_templates(2)

	let current_x = 0
	for (const key_tpl of key_tpls) {
		const queried_data = this._kdm.query(key_tpl)
		positions[key_tpl[key_tpl.length-2]] = current_x
		// Increase current_x
		current_x += d3.sum(KEY2_MARGIN) + this._chart.violin_bandwidth*queried_data.length
	}

	return positions
}

/**
 * Compute starting points (in plot x-coordinates) for the datum (each population)
 * @returns {number[]} the starting position for each datum
 */
boxvio_chart_wrapper.prototype._compute_datum_start_x = function () {
	if (this._kdm.key_size === 1) {
		return this._ids.map((id) => this._chart.xscale(id))
	}
	// Key size is 2 (for now. Maybe in the future, greater than 2)
	const datum_start_x = []
	// Start here for the first key2
	let current_x = KEY2_MARGIN[1]
	let current_key2 = this._data[0].key[this._kdm.key_size-2]
	for (const datum of this._data) {
		const key2 = datum.key[this._kdm.key_size-2]
		if (current_key2 !== key2) {
			current_key2 = key2
			// Add space for the key2 margin
			current_x += d3.sum(KEY2_MARGIN)
		}
		datum_start_x.push(current_x)
		current_x += this._chart.violin_bandwidth
	}
	return datum_start_x
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

	// Set viewBox of svg
	this.svg.attr('viewBox', `0 0 ${this._full_width} ${this._full_height}`)

	// Hide tooltip when clicking in SVG or plot_container
	this.svg.on('click', (e) => {
		e.stopPropagation()
		this._hide_tooltip()
	})
	this.plot_container.addEventListener('click', (e) => {
		e.stopPropagation()
		this._hide_tooltip()
	})

	// Root g tag
	this._graphics.root_g = this.svg.append('g')
		.attr('transform', `translate(${this._chart.margin.left},${this._chart.margin.top})`)

	this._render_axis()
	this._render_ygrid()
	if (this._kdm.key_size > 1) {
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
	// If we have key2s, relocate the ticks at their desired positions
	// to leave space for the key2 labels and separators
	if (this._kdm.key_size > 1) {
		const half_bandwidth = this._chart.violin_bandwidth/2
		this._graphics.xaxis_g.selectAll('g.tick')
			.attr(
				'transform',
				(_, i) => `translate(${this._chart.datum_start_x[i]+half_bandwidth},0)`
			)
	}
	// Apply the xticklabel angle
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

	for (const [index, key2] of this._key2_values.entries()) {
		const x = this._chart.key2_start_x[key2]
		const key2_label = key2.length > KEY2_LABEL_CHARACTER_LIMIT
			? key2.substring(0, KEY2_LABEL_CHARACTER_LIMIT-3) + '...'
			: key2
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
			.text(key2_label)
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
	for (let i = 0; i < this._data.length; i++) {
		this._graphics.violins[i] = violins_g.append('g')
			.classed('clickable', true)
			.attr('transform', `translate(${chart.datum_start_x[i]},0)`)
		this._graphics.violins[i].on('click', (e) => {
			e.stopPropagation()
			this.set_selected_index(i)
		})
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
	const bandwidth = this._chart.violin_bandwidth
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
	const bandwidth = chart.violin_bandwidth
	const box_width = this._chart.box_scale.value * bandwidth

	const whiskers_lw = 2
	const median_lw = 3

	// Iterate over the groups
	for (const [i, ele] of this._data.entries()) {

		const metrics = ele.metrics
		const color = ele.color

		const group_box = boxes.append('g')
			.classed('clickable', true)
			.attr('transform', `translate(${chart.datum_start_x[i] + bandwidth / 2},0)`)
		group_box.on('click', (e) => {
			e.stopPropagation()
			this.set_selected_index(i)
		})
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
		this._graphics.whiskers[i] = group_box.append('g')
		const whiskers = this._graphics.whiskers[i]
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
			.classed('clickable', true)
		// Circle events for tooltip
		circle.on('click', (e) => {
			e.stopPropagation()
			this.set_selected_index(i)

			// already displayed. (Hide) -> do nothing
				if (this._chart.tooltip_active == i) {
					// this._hide_tooltip()
					return
				}

			// hover set and fix
				this.tooltip_show(i)
				this._graphics.tooltip_div.style('display', 'flex')
				this._chart.tooltip_active = i

			// old
			// this._graphics.tooltip_div.style('display', null)
			// this.tooltip_show(i)
		})
		// .on('mouseout', () => {
		// 	this._graphics.tooltip_div.style('display', 'none')
		// })
	}

}

/**
 * Set the selected index by the user
 * @function
 * @param {number} i the index
 * @name boxvio_chart_wrapper#set_selected_index
 */
boxvio_chart_wrapper.prototype.set_selected_index = function (i) {
	if (this._controls.selected_index === i) {
		return
	}
	this._controls.selected_index = i
	this._set_specific_controls_section_title(i)
	// Tell specific controls that the selection has changed
	this._controls.violin_n_bins.slider.dispatchEvent(GROUP_CHANGE_EVENT)
}

/**
 * Set the title for the specific section of the controls
 * @function
 * @private
 * @param {number} selected_index the selected group index
 * @name boxvio_chart_wrapper#_set_specific_controls_section_title
 */
boxvio_chart_wrapper.prototype._set_specific_controls_section_title = function (selected_index) {
	const datum = this._data[selected_index]
	this._controls.sections.specific.title.innerText =
		`${tstring.settings_for || 'Settings for'} ${datum.key.join(', ')} (${datum.id})`
}

/**
 * Hide the tooltip
 * @function
 * @private
 * @name boxvio_chart_wrapper#_hide_tooltip
 */
boxvio_chart_wrapper.prototype._hide_tooltip = function () {
	this._graphics.tooltip_div.style('display', 'none')
	this._chart.tooltip_active = null
}

/**
 * Add the tooltip to the DOM
 * @function
 * @private
 * @name boxvio_chart_wrapper#_render_tooltip
 */
boxvio_chart_wrapper.prototype._render_tooltip = function () {
	const tooltip_element = common.create_dom_element({
		element_type	: 'div',
		id				: `${this.id_string()}_tooltip_div`,
		class_name		: 'o-red tooltip_div'
	})
	insert_after(tooltip_element, this.plot_container)
	this._graphics.tooltip_div = d3.select(tooltip_element)
	// Hide tooltip in the beginning
	this._hide_tooltip()
	const tooltip_metrics = common.create_dom_element({
		element_type	: 'div',
		id				: `${this.id_string()}_tooltip_metrics`,
		class_name		: 'tooltip_metrics_div',
		parent			: tooltip_element
	})
	const tooltip_metric_names = common.create_dom_element({
		element_type	: 'div',
		id				: `${this.id_string()}_tooltip_metric_names_div`,
		class_name		: 'tooltip_metric_names_div',
		parent			: tooltip_metrics
	})
	const tooltip_metric_values = common.create_dom_element({
		element_type	: 'div',
		id				: `${this.id_string()}_tooltip_metric_values_div`,
		class_name		: 'tooltip_metric_values_div',
		parent			: tooltip_metrics
	})
}

/**
 * Set the tooltip to visible
 * @param {number} i index of data
 * @function
 * @name boxvio_chart_wrapper#tooltip_show
 */
boxvio_chart_wrapper.prototype.tooltip_show = function (i) {

	const self = this

	const decimals = 2
	const values		= self._data[i].values
	const metrics		= self._data[i].metrics
	// const tooltip_text = `<b>${key.join(', ')}</b>`

	const metric_names = `${tstring.datapoints || 'Datapoints'}`
		+ `<br>${tstring.mean || 'Mean'}`
		+ `<br>${tstring.max || 'Maximum'}`
		+ (self._whiskers_quantiles
			? `<br>${tstring.quantile}-${self._whiskers_quantiles[1]}`
			: '')
		+ `<br>${tstring.quantile || 'Quantile'}-75`
		+ `<br>${tstring.median || 'Median'}`
		+ `<br>${tstring.quantile || 'Quantile'}-25`
		+ (self._whiskers_quantiles
			? `<br>${tstring.quantile}-${self._whiskers_quantiles[0]}`
			: '')
		+ `<br>${tstring.min || 'Minimum'}`
	const metric_values = `${values.length}`
		+ `<br>${metrics.mean.toFixed(decimals)}`
		+ `<br>${metrics.max.toFixed(decimals)}`
		+ (self._whiskers_quantiles
			? `<br>${metrics.upper_fence.toFixed(decimals)}`
			: '')
		+ `<br>${metrics.quartile3.toFixed(decimals)}`
		+ `<br>${metrics.median.toFixed(decimals)}`
		+ `<br>${metrics.quartile1.toFixed(decimals)}`
		+ (self._whiskers_quantiles
			? `<br>${metrics.lower_fence.toFixed(decimals)}`
			: '')
		+ `<br>${metrics.min.toFixed(decimals)}`
	self._graphics.tooltip_div.select('div.tooltip_metric_names_div')
		.html(metric_names)
	self._graphics.tooltip_div.select('div.tooltip_metric_values_div')
		.html(metric_values)
	
	// Call the tooltip callback
	if (self._tooltip_callback) {
		const options = {}
		for (const attr_name of this._tooltip_callback_options_attributes) {
			options[attr_name] = this._data[i][attr_name]
		}
		self._tooltip_callback(options)
			.then((ele) => {
				const tooltip_element = self._graphics.tooltip_div.node()
				ele.id = `${self.id_string()}_tooltip_callback_div`
				ele.classList.add('tooltip_callback_div')
				const last_child = tooltip_element.lastChild
				// If the last child is already a callback, delete it!
				if (last_child.classList.contains('tooltip_callback_div')) {
					last_child.remove()
				}
				tooltip_element.appendChild(ele)
			})
	}
}

/**
 * Render the control panel
 * @function
 * @protected
 * @name boxvio_chart_wrapper#render_control_panel
 */
boxvio_chart_wrapper.prototype.render_control_panel = function () {
	d3_chart_wrapper.prototype.render_control_panel.call(this)

	// GENRAL SETTINGS
	this._controls.sections.general.title = common.create_dom_element({
		element_type	: 'div',
		text_content	: tstring.general_settings || 'General settings',
		class_name		: 'control_panel_toggle control_panel_toggle_section',
		parent			: this.controls_content_container
	})
	this._controls.sections.general.content_container = common.create_dom_element({
		element_type	: 'div',
		parent			: this.controls_content_container
	})
	// TODO: refactor the first three (together)
	const upper_container = common.create_dom_element({
		element_type	: 'div',
		class_name		: 'control_panel_item controls_block',
		parent			: this._controls.sections.general.content_container
		// style			: {
		// 	'display': 'flex',
		// 	'direction': 'flex-row',
		// 	'justify-content': 'space-between',
		// 	'align-items': 'center',
		// }
	})
	this._render_grid_select(upper_container)
	this._render_xticklabel_angle_slider(upper_container)
	this._render_violin_curve_selector(upper_container)
	this._render_checkboxes()
	this._render_scale_sliders()

	// PARTICULAR SETTINGS
	this._controls.sections.specific.title = common.create_dom_element({
		element_type	: 'div',
		class_name		: 'control_panel_toggle control_panel_toggle_section',
		parent			: this.controls_content_container
	})
	this._set_specific_controls_section_title(this._controls.selected_index)
	this._controls.sections.specific.content_container = common.create_dom_element({
		element_type	: 'div',
		parent			: this.controls_content_container
	})
	this._render_n_bins_control()

	// Define the control panel logic
	this._control_panel_logic()
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
		// style: {
		// 	'display': 'flex',
		// 	'gap': DEFAULT_FLEX_GAP,
		// },
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
	this._controls.grid_select = grid_select
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
		// style: {
		// 	'display': 'flex',
		// 	'gap': DEFAULT_FLEX_GAP,
		// },
	})
	const xticklabel_angle_slider_id = `${this.id_string()}_xticklabel_angle_slider`
	const xticklabel_angle_slider_label = common.create_dom_element({
		element_type: 'label',
		text_content: tstring.xticklabel_angle || "X-Tick label angle",
		parent: slider_container,
		// style: {'margin-block': 'auto'},
	})
	xticklabel_angle_slider_label.setAttribute('for', xticklabel_angle_slider_id)
	/** @type {Element} */
	const xticklabel_angle_slider = common.create_dom_element({
		element_type: 'input',
		type: 'range',
		id: xticklabel_angle_slider_id,
		parent: slider_container,
	})
	this._controls.xticklabel_angle_slider = xticklabel_angle_slider
	xticklabel_angle_slider.setAttribute('min', 0)
	xticklabel_angle_slider.setAttribute('max', 90)
	xticklabel_angle_slider.value = this._chart.xticklabel_angle
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
		// style: {
		// 	'display': 'flex',
		// 	'gap': DEFAULT_FLEX_GAP,
		// },
	})
	const curve_select_id = `${this.id_string()}_curve_select`
	const curve_select_label = common.create_dom_element({
		element_type: 'label',
		text_content: tstring.violin_curve || 'Violin curve',
		parent: select_container,
		// style: {'margin-block': 'auto'},
	})
	curve_select_label.setAttribute('for', curve_select_id)
	const curve_select = common.create_dom_element({
		element_type: 'select',
		id: curve_select_id,
		parent: select_container,
		// TODO: add ARIA attributes?
	})
	this._controls.curve_select = curve_select
	for (const curve_name of this._chart.supported_curves) {
		common.create_dom_element({
			element_type: 'option',
			value: curve_name,
			text_content: curve_name,
			parent: curve_select,
		})
	}
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
		element_type	: 'div',
		class_name		: 'control_panel_item checkboxes',
		parent			: this._controls.sections.general.content_container
		// style: {
		// 	'display': 'flex',
		// 	'direction': 'flex-row',
		// 	'justify-content': 'space-between',
		// 	'align-items': 'center',
		// 	'margin-top': DEFAULT_MARGIN,
		// },
	})

	// Show text
	const show_text_div = common.create_dom_element({
		element_type: 'div',
		text_content: `${tstring.show || "Show"}:`,
		parent: container_div,
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
	this._controls.show_checkboxes.key2 = show_key2_checkbox
	/** @type {Element} */
	const show_key2_label = common.create_dom_element({
		element_type: 'label',
		text_content: this._key_titles[this._kdm.key_size-2],
		parent: show_key2_div,
	})
	show_key2_label.setAttribute('for', show_key2_checkbox_id)

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
	this._controls.show_checkboxes.violins = show_violins_checkbox
	/** @type {Element} */
	const show_violins_label = common.create_dom_element({
		element_type: 'label',
		text_content: tstring.violins || 'Violins',
		parent: show_violins_div,
	})
	show_violins_label.setAttribute('for', show_violins_checkbox_id)

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
	this._controls.show_checkboxes.boxes = show_boxes_checkbox
	/** @type {Element} */
	const show_boxes_label = common.create_dom_element({
		element_type: 'label',
		text_content: tstring.boxes || 'Boxes',
		parent: show_boxes_div,
	})
	show_boxes_label.setAttribute('for', show_boxes_checkbox_id)

	// Show whiskers
	const show_whiskers_div = common.create_dom_element({
		element_type: 'div',
		parent: container_div,
	})
	const show_whiskers_checkbox_id = `${this.id_string()}_show_whiskers_checkbox`
	/** @type {Element} */
	const show_whiskers_checkbox = common.create_dom_element({
		element_type: 'input',
		type: 'checkbox',
		id: show_whiskers_checkbox_id,
		parent: show_whiskers_div,
	})
	show_whiskers_checkbox.checked = true
	this._controls.show_checkboxes.whiskers = show_whiskers_checkbox
	/** @type {Element} */
	const show_whiskers_label = common.create_dom_element({
		element_type: 'label',
		text_content: tstring.whiskers || 'Whiskers',
		parent: show_whiskers_div,
	})
	show_whiskers_label.setAttribute('for', show_whiskers_checkbox_id)

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
	this._controls.show_checkboxes.outliers = show_outliers_checkbox
	/** @type {Element} */
	const show_outliers_label = common.create_dom_element({
		element_type: 'label',
		text_content: tstring.outliers || 'Outliers',
		parent: show_outliers_div,
	})
	show_outliers_label.setAttribute('for', show_outliers_checkbox_id)
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
		element_type	: 'div',
		parent			: this._controls.sections.general.content_container,
		class_name		: 'control_panel_item scale_sliders',
		// style			: {
		// 	'display': 'flex',
		// 	'direction': 'flex-row',
		// 	'justify-content': 'space-between',
		// 	'align-items': 'center',
		// },
	})

	// Violin scale
	const violin_container_div = common.create_dom_element({
		element_type: 'div',
		parent: container_div,
		// style: {
		// 	'display': 'flex',
		// 	'gap': DEFAULT_FLEX_GAP,
		// },
	})
	const violin_scale_slider_id = `${this.id_string()}_violin_scale_slider`
	const violin_scale_slider_label = common.create_dom_element({
		element_type: 'label',
		text_content: tstring.violin_width || 'Violin width',
		parent: violin_container_div,
		// style: {
		// 	'margin-block': 'auto',
		// },
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
	this._controls.scale.violin.slider = violin_scale_slider
	this._controls.scale.violin.reset = common.create_dom_element({
		element_type	: 'button',
		type			: 'button',
		class_name		: 'small',
		text_content	: tstring.reset || 'Reset',
		parent			: violin_container_div
	})

	// Box scale
	const box_container_div = common.create_dom_element({
		element_type: 'div',
		parent: container_div,
		// style: {
		// 	'display': 'flex',
		// 	'gap': DEFAULT_FLEX_GAP,
		// },
	})
	const box_scale_slider_id = `${this.id_string()}_box_scale_slider`
	const box_scale_slider_label = common.create_dom_element({
		element_type: 'label',
		text_content: tstring.box_width || 'Box width',
		parent: box_container_div,
		// style: {
		// 	'margin-block': 'auto',
		// },
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
	this._controls.scale.box.slider = box_scale_slider
	this._controls.scale.box.reset = common.create_dom_element({
		element_type	: 'button',
		type			: 'button',
		class_name		: 'small',
		text_content	: tstring.reset || 'Reset',
		parent			: box_container_div,
	})
}

/**
 * Render the control elements to change the number of bins
 * @function
 * @private
 * @name boxvio_chart_wrapper#_render_n_bins_control
 */
boxvio_chart_wrapper.prototype._render_n_bins_control = function () {
	const container = common.create_dom_element({
		element_type	: 'div',
		parent			: this._controls.sections.specific.content_container,
		class_name		: 'control_panel_item n_bins_control'
		// style			: {
		// 	'display': 'flex',
		// 	'align-items': 'center',
		// 	'gap': DEFAULT_FLEX_GAP,
		// 	'margin-top': DEFAULT_MARGIN,
		// },
	})
	// Slider for n bins
	const violin_n_bins_slider_id = `${this.id_string()}_violin_n_bins_slider`
	const violin_n_bins_label = common.create_dom_element({
		element_type	: 'label',
		text_content	: tstring.violin_resolution || 'Violin resolution',
		parent			: container
		// style: {'margin-block': 'auto'},
	})
	violin_n_bins_label.setAttribute('for', violin_n_bins_slider_id)
	const violin_n_bins_slider = common.create_dom_element({
		element_type	: 'input',
		type			: 'range',
		id				: violin_n_bins_slider_id,
		parent			: container
	})
	this._controls.violin_n_bins.slider = violin_n_bins_slider
	violin_n_bins_slider.setAttribute('min', 2)
	violin_n_bins_slider.setAttribute(
		'max',
		this._controls.max_bins_multiplier
			* this._chart.n_bins[this._controls.selected_index].initial
	)
	violin_n_bins_slider.value = this._chart.n_bins[this._controls.selected_index].value

	// Reset n bins
	this._controls.violin_n_bins.reset = common.create_dom_element({
		element_type	: 'button',
		type			: 'button',
		class_name		: 'small',
		text_content	: tstring.reset || 'Reset',
		parent			: container
	})

	// Reset all n bins
	this._controls.violin_n_bins.reset_all = common.create_dom_element({
		element_type	: 'button',
		type			: 'button',
		class_name		: 'small',
		text_content	: tstring.reset_all_violins || 'Reset all violins',
		parent			: container
	})
}

/**
 * Defines control panel logic (change events and such)
 * @function
 * @private
 * @name boxvio_chart_wrapper#_control_panel_logic
 */
boxvio_chart_wrapper.prototype._control_panel_logic = function () {
	// General section toggle
	this._controls.sections.general.title.addEventListener('click', () => {
		this._controls.sections.general.title.classList.toggle('opened')
		this._controls.sections.general.content_container.classList.toggle('hide')
	})

	// Grid mode select
	this._controls.grid_select.addEventListener('change', () => {
		const mode = this._controls.grid_select.value
		this.apply_ygrid_mode(mode)
	})
	// X-tick label angle slider
	this._controls.xticklabel_angle_slider.addEventListener('input', () => {
		this._chart.xticklabel_angle = Number(this._controls.xticklabel_angle_slider.value)
		this.apply_xticklabel_angle()
	})
	// Violin curve selector
	this._controls.curve_select.addEventListener('change', () => {
		this.set_violin_curve(this._controls.curve_select.value)
	})
	// Show checkboxes
	this._controls.show_checkboxes.key2.addEventListener('change', () => {
		toggle_visibility(this._graphics.key2_dividers_g)
	})
	this._controls.show_checkboxes.violins.addEventListener('change', () => {
		toggle_visibility(this._graphics.violins_g)
	})
	this._controls.show_checkboxes.boxes.addEventListener('change', () => {
		toggle_visibility(this._graphics.boxes_g)
		// (DISABLED) Disable the checkbox for outliers (defined below)
		// show_outliers_checkbox.disabled = !show_boxes_checkbox.checked
	})
	this._controls.show_checkboxes.whiskers.addEventListener('change', () => {
		for (const whisker of this._graphics.whiskers) {
			toggle_visibility(whisker)
		}
		// (DISABLED) Disable the checkbox for outliers (defined below)
		// show_outliers_checkbox.disabled = !show_boxes_checkbox.checked
	})
	this._controls.show_checkboxes.outliers.addEventListener('change', () => {
		for (const group of this._graphics.outliers) {
			toggle_visibility(group)
		}
	})
	// Scale controls
	this._controls.scale.violin.slider.addEventListener('input', () => {
		this.set_violin_scale(Number(this._controls.scale.violin.slider.value))
	})
	this._controls.scale.violin.reset.addEventListener('click', () => {
		this._controls.scale.violin.slider.value = this._chart.violin_scale.initial
		this.set_violin_scale(Number(this._controls.scale.violin.slider.value))
	})
	this._controls.scale.box.slider.addEventListener('input', () => {
		this.set_box_scale(Number(this._controls.scale.box.slider.value))
	})
	this._controls.scale.box.reset.addEventListener('click', () => {
		this._controls.scale.box.slider.value = this._chart.box_scale.initial
		this.set_box_scale(Number(this._controls.scale.box.slider.value))
	})

	// Particular section toggle
	this._controls.sections.specific.title.addEventListener('click', () => {
		this._controls.sections.specific.title.classList.toggle('opened')
		this._controls.sections.specific.content_container.classList.toggle('hide')
	})
	// Violin n bins controls
	const violin_n_bins_slider = this._controls.violin_n_bins.slider
	violin_n_bins_slider.addEventListener('input', () => {
		this.set_n_bins(this._controls.selected_index, Number(violin_n_bins_slider.value))
	})
	violin_n_bins_slider.addEventListener(GROUP_CHANGE_EVENT_NAME, () => {
		violin_n_bins_slider.setAttribute(
			'max',
			this._controls.max_bins_multiplier
				* this._chart.n_bins[this._controls.selected_index].initial
		)
		violin_n_bins_slider.value = this._chart.n_bins[this._controls.selected_index].value
	})
	this._controls.violin_n_bins.reset.addEventListener('click', () => {
		violin_n_bins_slider.value = this._chart.n_bins[this._controls.selected_index].initial
		this.set_n_bins(this._controls.selected_index, Number(violin_n_bins_slider.value))
	})
	this._controls.violin_n_bins.reset_all.addEventListener('click', () => {
		// Update the value of the slider
		violin_n_bins_slider.value = this._chart.n_bins[this._controls.selected_index].initial
		for (const [i, n_bins] of this._chart.n_bins.entries()) {
			this.set_n_bins(i, n_bins.initial)
		}
	})
}

// HELPER FUNCTIONS

/**
 * Splitter string (EMERITUS)
 * @type {string}
 */
const SPLITTER = '_^PoT3sRanaCantora_'
