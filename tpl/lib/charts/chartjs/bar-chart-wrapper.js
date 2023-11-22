"use strict";

import { chartjs_chart_wrapper } from "./chartjs-chart-wrapper.js";
import { COLOR_PALETTE, COLOR_PICKER_WIDTH } from "../chart-wrapper.js";

/**
 * Bar chart wrapper
 * @param {Element} div_wrapper the div to work in
 * @param {number[] | string[] | {[key: string | number]: number}} data
 * 		  input data. Either an array of occurences, which are parsed by
 * 		  the bar chart wrapper (e.g., `['bronze', 'bronze', 'iron']`), or
 * 		  an object with keys and counts (e.g. `{'bronze': 2, 'iron': 1}`)
 * @param {Object} options configuration options
 * @param {boolean} options.display_download whether to display the download panel (default `true`)
 * @param {boolean} options.display_control_panel whether to display the control panel (default `true`)
 * @param {string} options.ylabel the label for the y-axis (default `null`)
 * @class
 * @extends chartjs_chart_wrapper
 */
export function bar_chart_wrapper(div_wrapper, data, options) {
	chartjs_chart_wrapper.call(this, div_wrapper, options)
	/**
	 * Data for the bar chart
	 * @type {{labels: string[] | number[], values: number[]}}
	 * @private
	 */
	this._data = undefined
	if (Array.isArray(data)) {
		this._check_array_valid(data)
		this._data = this._parse_array(data)
	} else {
		this._check_object_valid(data)
		this._data = this._parse_object(data)
	}
	/**
	 * Label for the y-axis
	 * @type {string}
	 * @private
	 */
	this._ylabel = options.ylabel || null
	/**
	 * Color for each bar
	 * @type {string[]}
	 * @private
	 */
	this._bar_colors = Array(this._data.labels.length).fill(COLOR_PALETTE[0])
}
// Set prototype chain
Object.setPrototypeOf(bar_chart_wrapper.prototype, chartjs_chart_wrapper.prototype)

/**
 * Check if the input data array is valid
 * 
 * Throws error otherwise
 * @param {string[] | number[]} arr the array to check
 * @function
 * @private
 * @name bar_chart_wrapper#_check_array_valid
 */
bar_chart_wrapper.prototype._check_array_valid = function (arr) {
	if (!arr.length) {
		throw new Error("Input array is empty!")
	}
	/**
	 * Type of the first element of the array
	 * @type {string}
	 */
	const type = typeof arr[0]
	if (type !== 'number' && type !== 'string') {
		throw new Error("Input array is not made of numbers or strings")
	}
	for (const ele of arr.slice(1)) {
		if (typeof ele !== type) {
			throw new Error("Input array combines multiple types")
		}
	}
}

/**
 * Parse the input data array
 * 
 * @param {string[] | number[]} arr the input array
 * @returns {{labels: string[] | number[], values: number[]}}
 * 			the parsed input data in internal format
 * @function
 * @private
 * @name bar_chart_wrapper#_parse_array
 */
bar_chart_wrapper.prototype._parse_array = function (arr) {
	/**
	 * Unique values of the input array
	 * @type {number[] | string[]}
	 */
	const labels = arr.filter((v, i, a) => a.indexOf(v) === i)
	/**
	 * Count for each unique value in the input array
	 * @type {number[]}
	 */
	const values = labels.map((v) => arr.filter((ele) => ele === v).length)
	/**
	 * Parsed data
	 * @type {{labels: string[] | number[], values: number[]}}
	 */
	let parsed = {
		labels: labels,
		values: values,
	}
	return parsed
}

/**
 * Check if the input data object is valid
 * 
 * Throws error otherwise
 * @param {{[key: string | number]: number}} obj the object to check
 * @function
 * @private
 * @name bar_chart_wrapper#_check_object_valid
 */
bar_chart_wrapper.prototype._check_object_valid = function (obj) {
	if (!obj) {
		throw new Error("Input data object is null or undefined")
	}
	/**
	 * Keys of the input data object
	 * @type {number[] | string[]}
	 */
	const keys = Object.keys(obj)
	if (!keys.length) {
		throw new Error("Input data object is empty")
	}
	/**
	 * Values of the input data object
	 * @type {number}
	 */
	const values = Object.values(obj)
	for (const val of values) {
		if (typeof val !== 'number') {
			throw new Error("A value in the input data object is not a number")
		}
	}
}

/**
 * Parse the input data object
 * 
 * @param {{[key: string | number]: number}} obj the input array
 * @returns {{labels: string[] | number[], values: number[]}}
 * 			the parsed input data in internal format
 * @function
 * @private
 * @name bar_chart_wrapper#_parse_object
 */
bar_chart_wrapper.prototype._parse_object = function (obj) {
	return {
		labels: Object.keys(obj),
		values: Object.values(obj),
	}
}

/**
 * Get the bar colors
 * @returns {string[]} the bar colors as rgba strings
 */
bar_chart_wrapper.prototype.get_bar_colors = function () {
	return this._bar_colors
}

/**
 * Set new bar colors
 * 
 * Updates chart instance accordingly
 * @param {string[]} bar_colors the new bar colors as rgba strings
 */
bar_chart_wrapper.prototype.set_bar_colors = function (bar_colors) {
	this._bar_colors = bar_colors
	this.chart.data.datasets[0].backgroundColor = bar_colors
	this.chart.update()
}

/**
 * Set a color for a given bar
 * @param {number} index the index of the bar 
 * @param {string} bar_color the new bar color as an rgba string
 */
bar_chart_wrapper.prototype.set_bar_color = function (index, bar_color) {
	if (typeof index !== 'number') {
		throw new Error("Index is not a number")
	} else if (!Number.isInteger(index)) {
		throw new Error("Index is not an integer")
	} else if (index < 0 || index >= this._data.labels.length) {
		throw new Error("Index is out of bounds")
	}
	this._bar_colors[index] = bar_color
	this.chart.data.datasets[0].backgroundColor[index] = bar_color
	this.chart.update()
}

/**
 * Render the plot
 * @function
 * @protected
 * @name bar_chart_wrapper#render_plot
 */
bar_chart_wrapper.prototype.render_plot = function () {
	chartjs_chart_wrapper.prototype.render_plot.call(this)

	const chart_data = {
		labels: this._data.labels,
		datasets: [{
			label: this._ylabel,
			data: this._data.values,
			backgroundColor: this._bar_colors,
		}],
	}
	const scales_options = {
		y: {
			title: {
				display: Boolean(this._ylabel),  // Only display if there is a label
				text: this._ylabel,
				font: {
					size: 14,
				}
			},
		},
	}
	const plugins_options = {
		legend: {
			display: false,
		},
	}
	// Render the graph
	this.chart = new Chart(this.canvas, {
		type: 'bar',
		data: chart_data,
		options: {
			scales: scales_options,
			plugins: plugins_options,
			normalized: true,
		},
	})
}

/**
 * Render the control panel
 * @function
 * @protected
 * @name bar_chart_wrapper#render_control_panel
 */
bar_chart_wrapper.prototype.render_control_panel = function () {
	chartjs_chart_wrapper.prototype.render_control_panel.call(this)

	/**
	 * This bar_chart_wrapper instance
	 * @type {bar_chart_wrapper}
	 */
	const self = this

	const bar_select_id = `${this.id_string()}_bar_select`
	/**
	 * Select for bar choice
	 * @type {Element}
	 */
	const bar_select = common.create_dom_element({
		element_type: 'select',
		id: bar_select_id,
		parent: this.controls_content_container,
		// TODO: add ARIA attributes?
	})
	for (const [index, label] of this._data.labels.entries()) {
		common.create_dom_element({
			element_type: 'option',
			value: String(index),  // 0 as a number becomes false as a boolean...
			text_content: label,
			parent: bar_select,
		})
	}

	/** iro.js color picker */
	const color_picker_container = common.create_dom_element({
		element_type: 'div',
		id: `${this.id_string()}_color_picker_container`,
		parent: this.controls_content_container
	})
	const color_picker = new window.iro.ColorPicker(color_picker_container, {
		color: this._bar_colors[0],
		width: COLOR_PICKER_WIDTH,
		layoutDirection: 'horizontal',
		layout: [
			{
				component: window.iro.ui.Wheel,
			},
			{
				component: window.iro.ui.Slider,
			},
			{
				component: window.iro.ui.Slider,
				options: {
					sliderType: 'alpha',
				}
			},
		],
	})
	// Bar select change event
	bar_select.addEventListener('change', () => {
		const index = Number(bar_select.value)
		color_picker.color.set(self._bar_colors[index])
	})
	// Color change event
	color_picker.on('color:change', function (color) {
		const index = Number(bar_select.value)
		self.set_bar_color(index, color.rgbaString)
	})
}