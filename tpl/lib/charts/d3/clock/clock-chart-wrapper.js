"use strict";

import { d3_chart_wrapper } from "../d3-chart-wrapper";
import { keyed_data } from "../../keyed-data";
import { insert_after } from "../../utils";


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
 * Padding among clocks
 * @type {number}
 */
const CLOCK_MARGIN = 6
/**
 * Margin for the key2 label
 * @type {[number, number]}
 */
const KEY2_MARGIN = [6, 15]
/**
 * Limit for the amount of characters displayed in the labels of key 2
 * @type {number}
 */
const KEY2_LABEL_CHARACTER_LIMIT = 37
/**
 * Height reserved for the key1 and id label
 * @type {number}
 */
const LABEL_HEIGHT = 14

/**
 * Clock chart
 *
 * Draws a clock (see minimal clock chart) for every provided group. Utilizes keyed data to draw labels
 * and separators.
 * 
 * @param {Element} div_wrapper the div to work in
 * @param {{
 * 	id: string,
 * 	key: string[],
 * 	values: number[]
 * }[]} data the input data 
 * @param {Object} options configuration options
 * @param {boolean} options.display_download whether to display the download panel (default `false`)
 * @param {boolean} options.display_control_panel whether to display the control panel (default `false`)
 * @param {boolean} options.overflow whether going beyond the width of the plot container is allowed (default `false`).
 * 		if `false`, the svg will be stretched to fill the full width of its parent element
 * @param {string} options.outer_height outer height of the plot, will be the height applied to the SVG (default `500px`)
 * 		overflow must be enabled for outer_height to work
 * @param {boolean} options.sort whether to sort the clocks (default `false`). When there is more than one key-2, sorting is mandatory.
 * @param {(options: Object) => Promise<Element>} options.tooltip_callback called to fill the tooltip.
 *  It takes an options object as argument and returns a Promise of an HTML element to add to the
 * 	tooltip. The attributes of the options object come from the data and are determined by the
 * `tooltip_callback_options_attributes` option
 * @param {string[]} options.tooltip_callback_options_attributes list of datum attributes to include in the
 * 	options object for the tooltip callback. If the callback is provided, this list MUST be provided as well
 * @class
 * @extends d3_chart_wrapper
 */
export function clock_chart_wrapper(div_wrapper, data, options) {
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
	const sort = options.sort || data[0].key.length > 1 || false
	/**
	 * Input data
	 * @type {{
 	 * 	id: string,
	 * 	key: string[],
	 * 	values: number[]
	 * }[]}
	 * @private
	 */
	this._data = sort
				 ? data.sort((a, b) => a.key.join().localeCompare(b.key.join()))
				 : data
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
	 * Full width of svg
	 * @private
	 * @type {number}
	 */
	this._width = this._compute_width()
	/**
	 * Full height of the svg
	 * @private
	 * @type {number}
	 */
	this._height = CLOCK_DIAMETER + LABEL_HEIGHT
	/**
	 * Non-graphic components of the chart
	 * @private
	 * @type {{
	 * 	key2_start_x: {[key2: string]: number},
	 * 	datum_start_x: number[],
	 * 	tooltip_active: number
	 * }}
	 */
	this._chart = {}
	this._chart.key2_start_x = this._kdm.key_size > 1
		? this._compute_key2_start_x()
		: null
	this._chart.datum_start_x = this._compute_datum_start_x()
	this._chart.tooltip_active = null
	/**
	 * Graphic components of the chart
	 * @private
	 * @type {{
	 *  root_g: d3.selection,
	 * 	key2_dividers_g: d3.selection,
	 * 	datum_g: d3.selection,
	 * 	tooltip_div: d3.selection
	 * }}
	 */
   	this._graphics = {
		// Root g tag (translated to the center of the svg)
		root_g: null,
		// g tag for the key2 dividers
		key2_dividers_g: null,
		// g tag for all datum (clock + label)
		datum_g: null,
		// div tag for tooltip
		tooltip_div: null
	}
}
// Set prototype chain
Object.setPrototypeOf(clock_chart_wrapper.prototype, d3_chart_wrapper.prototype)

/**
 * Compute the full width of the SVG
 * @private
 * @returns {number} the full width of the SVG
 */
clock_chart_wrapper.prototype._compute_width = function () {
	const n = this._data.length
	if (this._kdm.key_size == 1) {
		return CLOCK_DIAMETER * n + CLOCK_MARGIN * (n - 1)
	}
	// full width when there are Rank 2 key components
	let width = this._key2_values.length * d3.sum(KEY2_MARGIN) - KEY2_MARGIN[0]
	for (const key2_value of this._key2_values) {
		const n_groups = this._kdm.get_next_key_component_values([key2_value]).length
		width += n_groups * CLOCK_DIAMETER + (n_groups - 1) * CLOCK_MARGIN
	}
	return width
}

/**
 * Compute starting points (in plot x-coordinates) for the different
 * key2s. There we will draw the key2 labels and separating line
 * @returns {{[key2: string]: number}} the starting position for each key2
 */
clock_chart_wrapper.prototype._compute_key2_start_x = function () {
	const positions = {}

	const key_tpls = this._kdm.get_key_templates(2)

	let current_x = 0
	for (const key_tpl of key_tpls) {
		const queried_data = this._kdm.query(key_tpl)
		positions[key_tpl[key_tpl.length-2]] = current_x
		// Increase current_x
		current_x += d3.sum(KEY2_MARGIN) + queried_data.length * CLOCK_DIAMETER
			+ (queried_data.length - 1) * CLOCK_MARGIN
	}

	return positions
}

/**
 * Compute starting points (in svg x-coordinates) for the datum (each population)
 * @returns {number[]} the starting position for each datum
 */
clock_chart_wrapper.prototype._compute_datum_start_x = function () {
	if (this._kdm.key_size === 1) {
		return Array(this._data.length).map((_, i) => i*(CLOCK_MARGIN+CLOCK_DIAMETER))
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
			// Add space for the key2 margin, but remove extra clock margin
			current_x += d3.sum(KEY2_MARGIN) - CLOCK_MARGIN
		}
		datum_start_x.push(current_x)
		current_x += CLOCK_DIAMETER + CLOCK_MARGIN
	}
	return datum_start_x
}

/**
 * Render the plot
 * @function
 * @protected
 * @name clock_chart_wrapper#render_plot
 */
clock_chart_wrapper.prototype.render_plot = function () {
	d3_chart_wrapper.prototype.render_plot.call(this)

	// Set viewbox of svg
	this.svg.attr('viewBox', `0 0 ${this._width} ${this._height}`)

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

	// Render the graphics!
	if (this._kdm.key_size > 1) {
		this._render_key2_dividers()
	}
	this._graphics.datum_g = this._graphics.root_g.append('g')
	for (let i = 0; i < this._data.length; i++) {
		this._render_datum(i)
	}

	// Render tooltip
	this._render_tooltip()

}

/**
 * Render the dividers for key2
 * @function
 * @private
 * @name clock_chart_wrapper#_render_key2_dividers
 */
clock_chart_wrapper.prototype._render_key2_dividers = function () {
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
		// divider_g.append('rect')
		// 	.attr('x', 0)
		// 	.attr('height', this._height)
		// 	.attr('width', KEY2_MARGIN[1])
		// 	.style('fill', 'none')
		// 	.style('stroke', 'red')
		// 	.style('stroke-width', 0.5)
		divider_g.append('line')
			.attr('x1', 0)
			.attr('y1', 0)
			.attr('x2', 0)
			.attr('y2', this._height)
			.attr('stroke', color)
			.attr('stroke-width', 0.9)
			.attr('stroke-dasharray', this._height/35)
		divider_g.append('text')
			.attr('text-anchor', 'end')
			.attr('transform', 'rotate(-90)')
			.attr('y', '1.3em')  // This is the horizontal axis now
			.attr('x', '-0.6em')  // This is the vertical axis now
			.attr('font-size', '0.3em')
			.attr('fill', color)
			.text(key2_label)
	}
}

/**
 * Render a clock and its label
 * @function
 * @private
 * @name clock_chart_wrapper#_render_datum
 * @param {number} i the index of the datum to render
 */
clock_chart_wrapper.prototype._render_datum = function (i) {
	const datum = this._data[i]
	const g = this._graphics.datum_g.append('g')
		.attr('transform', `translate(${this._chart.datum_start_x[i]},0)`)
	this._render_handles(g, i, datum)
	this._render_label(g, datum)
}

/**
 * Render the clock handles
 * @function
 * @private
 * @name clock_chart_wrapper#_render_handles
 * @param {d3.selection} container_g the container g tag
 * @param {number} i the index of the datum
 * @param {{
 * 	id: string,
 * 	key: string[],
 * 	values: number[]
 * }} datum the datum
 */
clock_chart_wrapper.prototype._render_handles = function (container_g, i, datum) {
	// container_g.append('rect')
	// 	.attr('x', 0)
	// 	.attr('height', CLOCK_DIAMETER)
	// 	.attr('width', CLOCK_DIAMETER)
	// 	.style('fill', 'none')
	// 	.style('stroke', 'blue')
	// 	.style('stroke-width', 0.5)
	const values = datum.values
	const delta = 2*Math.PI/values.length
	let angle = Math.PI/2
	const max_value = d3.max(values)
	const scale = d3.scaleLinear()
		.domain([0, max_value])
		.range([0, CLOCK_RADIUS])
	const g = container_g.append('g')
		.attr('transform', `translate(${CLOCK_RADIUS},${CLOCK_RADIUS})`)
	for (const value of values) {
		const handle_g = g.append('g')
		handle_g.append('line')
			.attr('x1', 0)
			.attr('y1', 0)
			.attr('x2', CLOCK_RADIUS*Math.cos(angle))
			.attr('y2', -CLOCK_RADIUS*Math.sin(angle))  // Mirror vertically!
			.attr('stroke', '#e3e3e3')
			.attr('stroke-width', 0.6)
		handle_g.append('line')
			.attr('x1', 0)
			.attr('y1', 0)
			.attr('x2', scale(value)*Math.cos(angle))
			.attr('y2', -scale(value)*Math.sin(angle))  // Mirror vertically!
			.attr('stroke', 'black')
			.attr('stroke-width', 1)
		angle -= delta
	}
	const circle = g.append('circle')
		.style('fill', 'black')
		.attr('r', 2.5)
	if (this._tooltip_callback) {
		circle.classed('clickable', true)
		circle.on('click', (e) => {
			e.stopPropagation()
			if (this._chart.tooltip_active === i) {
				return
			}
			this.tooltip_show(datum)
			this._graphics.tooltip_div.style('display', 'flex')
			this._chart.tooltip_active = i
		})
	}
}


/**
 * Render the clock label
 * @function
 * @private
 * @name clock_chart_wrapper#_render_label
 * @param {d3.selection} container_g the container g tag
 * @param {{
 * 	id: string,
 * 	key: string[],
 * 	values: number[]
 * }} datum the datum
 */
clock_chart_wrapper.prototype._render_label = function (container_g, datum) {
	// container_g.append('rect')
	// 	.attr('x', 0)
	// 	.attr('y', CLOCK_DIAMETER)
	// 	.attr('height', LABEL_HEIGHT)
	// 	.attr('width', CLOCK_DIAMETER)
	// 	.style('fill', 'none')
	// 	.style('stroke', 'green')
	// 	.style('stroke-width', 0.5)
	const g = container_g.append('g')
		.attr('transform', `translate(${CLOCK_RADIUS},${CLOCK_DIAMETER})`)
	const key1 = datum.key[this._kdm.key_size-1]
	const id = datum.id
	g.append('text')
		.attr('text-anchor', 'middle')
		.attr('y', '1.5em')
		.attr('font-size', '0.25em')
		.attr('fill', 'black')
		.text(key1)
	g.append('text')
		.attr('text-anchor', 'middle')
		.attr('y', '3.2em')
		.attr('font-size', '0.2em')
		.attr('fill', 'black')
		.text(`(${d3.sum(datum.values)})`)
}

/**
 * Hide the tooltip
 * @function
 * @private
 * @name clock_chart_wrapper#_hide_tooltip
 */
clock_chart_wrapper.prototype._hide_tooltip = function () {
	this._graphics.tooltip_div.style('display', 'none')
	this._chart.tooltip_active = null
}

/**
 * Add the tooltip to the DOM
 * @function
 * @private
 * @name clock_chart_wrapper#_render_tooltip
 */
clock_chart_wrapper.prototype._render_tooltip = function () {
	const tooltip_element = common.create_dom_element({
		element_type	: 'div',
		id				: `${this.id_string()}_tooltip_div`,
		class_name		: 'o-red tooltip_div'
	})
	insert_after(tooltip_element, this.plot_container)
	this._graphics.tooltip_div = d3.select(tooltip_element)
	// Hide tooltip in the beginning
	this._hide_tooltip()
}

/**
 * Set the tooltip to visible
 * @param {{
 * 	id: string,
 * 	key: string[],
 * 	values: number[]
 * }} datum the datum
 * @function
 * @name clock_chart_wrapper#tooltip_show
 */
clock_chart_wrapper.prototype.tooltip_show = function (datum) {
	const self = this

	const options = {}
	for (const attr_name of this._tooltip_callback_options_attributes) {
		options[attr_name] = datum[attr_name]
	}
	self._tooltip_callback(options)
		.then((ele) => {
			const tooltip_element = self._graphics.tooltip_div.node()
			ele.id = `${self.id_string()}_tooltip_callback_div`
			ele.classList.add(
				'tooltip_callback_div'
			)
			tooltip_element.replaceChildren(
				ele
			)
		})
}
