"use strict";


import { compute_n_bins } from "../compute-n-bins";
import { d3_chart_wrapper } from "./d3-chart-wrapper";
import { linspace } from "./utils";
import { calc_boxplot_metrics } from "./utils";


/**
 * Minimal boxplot + violin chart wrapper, containing only a vertical axis without label
 * and the box + violin drawing
 * 
 * @class
 * @extends d3_chart_wrapper
 * @param {Element} div_wrapper 
 * @param {number[]} data 
 * @param {Object} options
 * @param {boolean} options.display_download whether to display the download panel (default `false`)
 * @param {boolean} options.display_control_panel whether to display the control panel (default `false`)
 * @param {boolean} options.overflow whether going beyond the width of the plot container is allowed (default `false`).
 * 		if `false`, the svg will be stretched to fill the full width of its parent element
 * @param {string} options.outer_height outer height of the plot, will be the height applied to the SVG (default `500px`)
 * 		overflow must be enabled for outer_height to work
 * @param {[number, number]} options.whiskers_quantiles overrides default behavior of the whiskers
 * 		by specifying the quantiles of the lower and upper
 */
export function minimal_boxvio_chart_wrapper(div_wrapper, data, options) {
	d3_chart_wrapper.call(this, div_wrapper, options)

	/**
	 * Overrides default behavior of the whiskers by specifying
	 * the quantiles of the lower and upper
	 * @type {[number, number]}
	 * @private
	 */
	this._whiskers_quantiles = options.whiskers_quantiles || null
	if (!data.length) {
		throw new Error("Data array is empty")
	}
	/**
	 * Input data
	 * @type {number[]}
	 * @private
	 */
	this._data = data
	/**
	 * Data extent (minimim and maximum)
	 * @type {[number, number]}
	 */
	this._data_extent = d3.extent(data)
	/**
	 * Boxplot metrics
	 * @private
	 * @type {{
	 *	max: number,
	 *  upper_fence: number,
	 *  quartile3: number,
	 *  median: number,
	 *  mean: number,
	 *  iqr: number,
	 *  quartile1: number,
	 *  lower_fence: number,
	 *  min: number
	 * }}
	 */
	this._metrics = calc_boxplot_metrics(data, this._whiskers_quantiles)
	/**
	 * Full height of svg
	 * @type {number}
	 * @private
	 */
	this._full_height = 453
	/**
	 * Full width of svg
	 * @type {number}
	 * @private
	 */
	this._full_width = 195
	/**
	 * Non-graphic components of the chart: setting, scales,
	 * axis generators, spacing, etc.
	 * @private
	 * @type {{
	 * 	margin: {
	 *		top: number,
	 *		right: number,
	 *		bottom: number,
	 *		left: number
	 * 	},
	 * 	width: number,
	 * 	height: number,
	 * 	yscale: d3.scaleLinear,
	 * 	yaxis: d3.axisGenerator,
	 *  violin_scale: number,
	 * 	box_scale: number,
	 *  n_bins: number,
	 * 	histogram: d3.binGenerator,
	 * 	bins: d3.Bin[],
	 * 	violin_curve: string
	 * }}
	 */
	this._chart = {}
	this._chart.margin = { top: 15, right: 0, bottom: 15, left: 30 }
	this._chart.width = this._full_width - this._chart.margin.left - this._chart.margin.right
	this._chart.height = this._full_height - this._chart.margin.top - this._chart.margin.bottom
	this._chart.yscale = d3.scaleLinear()
		.range([this._chart.height, 0])
		.domain(this._data_extent)
		.clamp(true)  // when input outside of domain, its output is clamped to range
	this._chart.yaxis = d3.axisLeft(this._chart.yscale)
		.tickFormat((d) => d.toFixed(1))
	this._chart.violin_scale = 0.8
	this._chart.box_scale = 0.3
	this._chart.n_bins = compute_n_bins.sturges(this._data)
	this._chart.histogram = d3.bin()
		.domain(this._data_extent)
		.thresholds(
			linspace(this._data_extent[0], this._data_extent[1], this._chart.n_bins+1)
		)
	this._chart.bins = this._chart.histogram(this._data)
	this._chart.violin_curve = 'Basis'
	/**
	 * Graphic components of the chart
	 * @private
	 * @type {{
	 * 	root_g: d3.selection
	 * }}
	 */
	this._graphics = {
		// Root g tag (translated to account for the margins)
		root_g: null
	}
}
// Set prototype chain
Object.setPrototypeOf(minimal_boxvio_chart_wrapper.prototype, d3_chart_wrapper.prototype)

/**
 * Render the plot
 * @function
 * @protected
 * @name minimal_boxvio_chart_wrapper#render_plot
 */
minimal_boxvio_chart_wrapper.prototype.render_plot = function () {
	d3_chart_wrapper.prototype.render_plot.call(this)

	// Set viewBox of svg
	this.svg.attr('viewBox', `0 0 ${this._full_width} ${this._full_height}`)

	// Root g tag
	this._graphics.root_g = this.svg.append('g')
		.attr('transform', `translate(${this._chart.margin.left},${this._chart.margin.top})`)
}
