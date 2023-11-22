"use strict";

import { chartjs_chart_wrapper } from "./chartjs-chart-wrapper.js";
import { COLOR_PICKER_WIDTH, COLOR_PALETTE } from "../chart-wrapper.js";
import { compute_n_bins } from "../compute-n-bins.js";

/**
 * Histogram wrapper
 * @param {Element}  div_wrapper the div to work in
 * @param {number[]} data the data
 * @param {Object} options configuration options
 * @param {boolean} options.display_download whether to display the download panel (default `false`)
 * @param {boolean} options.display_control_panel whether to display the control panel (default `false`)
 * @param {string} options.xlabel the label for the x-axis (default `null` )
 * @class
 * @extends chartjs_chart_wrapper
 */
export function histogram_wrapper(div_wrapper, data, options) {
	/*
	 * <Function>.call is a method that executes the defined function,
	 * but with the "this" variable pointing to the first argument,
	 * and the rest of the arguments being arguments of the function
	 * that is being "called". This essentially performs all of
	 * chart_wrapper's constructor logic on histogram_wrapper's "this".
	 */
	chartjs_chart_wrapper.call(this, div_wrapper, options)

	/**
	 * Data values
	 * @type {number[]}
	 * @private
	 */
	this._data = data
	/**
	 * Whether to perform a density plot
	 * @type {boolean}
	 * @private
	 */
	this._density = false
	/**
	 * Default number of bins
	 * @type {number}
	 * @private
	 */
	this._n_bins_default = compute_n_bins.sqrt(this._data)
	/**
	 * Number of bins in the histogram
	 * 
	 * Defined as the square root of the
	 * amount of datapoints, computed
	 * during render
	 * @type {number}
	 * @private
	 */
	this._n_bins = undefined
	/** Label for the xaxis
	 * @type {string}
	 * @private
	*/
	this._xlabel = options.xlabel || null
	/**
	 * Number of decimals to display
	 * @type {number}
	 * @private
	 */
	this._n_decimals = 3
	/**
	 * Maximum number of bins as mutiplier of default
	 * @type {number}
	 * @private
	 */
	this._max_bins_multiplier = 3
	/**
	 * Default color for the bars in rgba
	 * @type {string}
	 * @private
	 */
	this._bar_color = COLOR_PALETTE[0]
}
// Set prototype chain
Object.setPrototypeOf(histogram_wrapper.prototype, chartjs_chart_wrapper.prototype)

/**
 * Check whether we are doing a density plot
 * @returns {boolean} `true` if density plot,
 * 			`false` otherwise
 * @name histogram_wrapper#get_density
 * @function
 */
histogram_wrapper.prototype.get_density = function () {
	return this._density
}

/**
 * Change the density plot attribute
 * @param density {boolean} `true` if density, `false` otherwise
 * @function
 * @name histogram_wrapper#set_density
 */
histogram_wrapper.prototype.set_density = function (density) {
	this._density = density
	if (!this.chart) {
		return
	}
	// Update chart
	const [
		bin_centers, plot_data, half_bin_width, data_min, data_max
	] = this._get_plotting_data()
	this.chart.data.datasets[0].label = this._get_density_string()
	this.chart.data.datasets[0].data = plot_data
	this.chart.options.scales.y.title.text = this._get_density_string()
	this.chart.update()
}

/**
 * Get a string representing the plot mode
 * @returns {string} `'Density'` if we are in density
 * 			mode, `'Frequency'` otherwise
 * @function
 * @private
 * @name histogram_wrapper#_get_density_string
 */
histogram_wrapper.prototype._get_density_string = function () {
	return this._density ? 'Density' : 'Frequency'
}

/**
 * Get the amount of bins in the histogram
 * @returns {number} the amount of bins
 * @function
 * @name histogram_wrapper#get_n_bins
 */
histogram_wrapper.prototype.get_n_bins = function () {
	return this._n_bins
}

/**
 * Set a new number of bins for the histogram
 * 
 * Updates chart instance accordingly
 * @param {number} n_bins amount of bins
 * @function
 * @name histogram_wrapper#set_n_bins
 */
histogram_wrapper.prototype.set_n_bins = function (n_bins) {
	this._n_bins = n_bins
	if (!this.chart) {
		return
	}
	// Update chart
	const [
		bin_centers, plot_data, half_bin_width, data_min, data_max
	] = this._get_plotting_data()
	this.chart.data.datasets[0].data = plot_data
	this.chart.options.scales.x.min = data_min
	this.chart.options.scales.x.max = data_max
	this.chart.options.scales.x.ticks.stepSize = 2 * half_bin_width
	this.chart.options.plugins.tooltip.callbacks.title =
		this._get_tooltip_title_callback(bin_centers, half_bin_width)
	this.chart.update()
}

/**
 * Get the color of the bars in the histogram
 * @returns {string} the bar color as an rgba string
 * @function
 * @name histogram_wrapper#get_bar_color
 */
histogram_wrapper.prototype.get_bar_color = function () {
	return this._bar_color
}

/**
 * Set a new color for the bars in the histogram
 * 
 * Updates the chart instance accordingly
 * @param {string} bar_color the new bar color for the histogram
 * @function
 * @name histogram_wrapper#set_bar_color
 */
histogram_wrapper.prototype.set_bar_color = function (bar_color) {
	this._bar_color = bar_color
	if (!this.chart) {
		return
	}
	this.chart.data.datasets[0].backgroundColor = this._bar_color
	this.chart.update()
}

/**
 * Get data needed to generate the chart
 * TODO: there is no need to recompute bin_centers unless the number of bins
* 		 has changed
* @function
* @name histogram_wrapper#_get_plotting_data
* @private
* 
* @returns {[number[], {x: number, y: number}[], number, number, number]}
* 			the bin centers, {bin centers, count per bin}, half of the bin width,
* 			the minimum and maximum of input data
 */
histogram_wrapper.prototype._get_plotting_data = function () {
	const data_max = Math.max(...this._data)
	const data_min = Math.min(...this._data)
	const bin_width = (data_max - data_min) / this._n_bins
	const half_bin_width = 0.5 * bin_width
	/**
	 * Center of each bin
	 * @type {number[]}
	 */
	const bin_centers = Array.apply(null, Array(this._n_bins)).map(
		(value, index) => data_min + (2 * index + 1) * half_bin_width
	)
	// We bin with right-open intervals
	/**
	 * Count per bin
	 * @type {number[]}
	 */
	let entries = Array.apply(null, Array(this._n_bins)).map(() => 0)
	for (let i = 0; i < this._data.length; i++) {
		// If value is max, add it to last bin
		if (this._data[i] === data_max) {
			entries[this._n_bins - 1]++
			continue
		}
		// Proceed as usual
		for (let j = 0; j < this._n_bins; j++) {
			if (this._data[i] >= bin_centers[j] - half_bin_width
				&& this._data[i] < bin_centers[j] + half_bin_width) {
				entries[j]++
				break
			}
		}
	}
	// Normalize if density
	if (this._density) {
		const sum = entries.reduce((partialSum, val) => partialSum + val, 0)
		for (let j = 0; j < this._n_bins; j++) {
			entries[j] /= (sum * bin_width);
		}
	}
	return [
		bin_centers,
		bin_centers.map((val, i) => ({ x: val, y: entries[i] })),
		half_bin_width,
		data_min,
		data_max,
	]
}

/**
 * Get callback function for tooltip title
 * @param {number[]} bin_centers the bin centers
 * @param {number} half_bin_width half of the bin width
 * @returns the callback function
 * @function
 * @private
 * @name histogram_wrapper#_get_tooltip_title_callback
 */
histogram_wrapper.prototype._get_tooltip_title_callback = function (bin_centers, half_bin_width) {
	// Cannot use `this` inside inner function!!!
	const xlabel = this._xlabel
	const n_decimals = this._n_decimals
	/**
	 * Callback function for the tooltip title
	 * @param {TooltipItem[]} items the tooltip item contexts
	 * @returns {string} the title of the tooltip
	 * @function
	 * @name histogram_wrapper#_get_tooltip_title_callback~inner
	 */
	const callback = function (items) {
		if (!items.length) {
			return ''
		}
		const item = items[0]
		const index = item.dataIndex
		const min = bin_centers[index] - half_bin_width
		const max = bin_centers[index] + half_bin_width
		return `${xlabel}: ${min.toFixed(n_decimals)} `
			+ `- ${max.toFixed(n_decimals)}`
	}
	return callback
}

/**
 * Render the plot
 * @function
 * @protected
 * @name histogram_wrapper#render_plot
 */
histogram_wrapper.prototype.render_plot = function () {
	chartjs_chart_wrapper.prototype.render_plot.call(this)

	this._n_bins = this._n_bins_default
	const [
		bin_centers, plot_data, half_bin_width, data_min, data_max
	] = this._get_plotting_data()

	// Split chart options
	const chart_data = {
		datasets: [{
			label: this._get_density_string(),
			data: plot_data,
			categoryPercentage: 1,
			barPercentage: 1,
			backgroundColor: this._bar_color,
		}],
	}
	const scales_options = {
		x: {
			type: 'linear',  // otherwise it goes to a category axis...
			min: data_min,
			max: data_max,
			offset: false,
			grid: {
				offset: false,
			},
			ticks: {
				stepSize: 2 * half_bin_width,
				callback: (label, index, labels) => {
					return Number(label).toFixed(this._n_decimals)
				}
			},
			title: {
				display: Boolean(this._xlabel),  // Only display if there is a label
				text: this._xlabel,
				font: {
					size: 14
				},
			}
		},
		y: {
			title: {
				display: true,
				text: this._get_density_string(),
				font: {
					size: 14,
				},
			},
		},
	}
	const plugins_options = {
		legend: {
			display: false,
		},
		tooltip: {
			callbacks: {
				title: this._get_tooltip_title_callback(bin_centers, half_bin_width),
			},
		},
	}

	// Render the graph
	this.chart = new Chart(this.canvas, {
		type: 'bar',
		data: chart_data,
		options: {
			scales: scales_options,
			plugins: plugins_options,
			parsing: false,
			normalized: true,
		},
	})
}


/**
 * Render the control panel
 * @function
 * @protected
 * @name histogram_wrapper#render_control_panel
 */
histogram_wrapper.prototype.render_control_panel = function () {
	chartjs_chart_wrapper.prototype.render_control_panel.call(this)

	// Save this histogram wrapper instance, because when we change scope
	// we may still need to refer to it
	/**
	 * This histogram_wrapper instance
	 * @type {histogram_wrapper}
	 */
	const self = this
	/**
	 * Slider for number of bins
	 * @type {Element}
	 */
	const slider = common.create_dom_element({
		element_type: 'input',
		type: 'range',
		value: this._n_bins_default,
		parent: this.controls_content_container,
	})
	slider.setAttribute('min', 1)
	slider.setAttribute('max', this._max_bins_multiplier * this._n_bins_default)
	slider.addEventListener('input', () => {
		this.set_n_bins(Number(slider.value))
	})
	/**
	 * Reset button for the slider
	 * @type {Element}
	 */
	const slider_reset = common.create_dom_element({
		element_type: 'button',
		type: 'button',
		text_content: 'Reset',
		parent: this.controls_content_container,
	})
	slider_reset.addEventListener('click', () => {
		slider.value = this._n_bins_default
		this.set_n_bins(Number(slider.value))
	})

	const density_checkbox_id = `${this.id_string()}_density_checkbox`
	/**
	 * Checkbox for density plot
	 * @type {Element}
	 */
	const density_checkbox = common.create_dom_element({
		element_type: 'input',
		type: 'checkbox',
		id: density_checkbox_id,
		parent: this.controls_content_container,
	})
	/**
	 * Checkbox label for density plot
	 * @type {Element}
	 */
	const density_checkbox_label = common.create_dom_element({
		element_type: 'label',
		text_content: 'Density',
		parent: this.controls_container,
	})
	density_checkbox_label.setAttribute('for', density_checkbox_id)
	density_checkbox.addEventListener('change', () => {
		this.set_density(Boolean(density_checkbox.checked))
	})
	/** iro.js color picker */
	const color_picker_container = common.create_dom_element({
		element_type: 'div',
		id: `${this.id_string()}_color_picker_container`,
		parent: this.controls_content_container
	})
	const color_picker = new window.iro.ColorPicker(color_picker_container, {
		color: this._bar_color,
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
	color_picker.on('color:change', function (color) {
		self.set_bar_color(color.rgbaString)
	})
}