/*global tstring, page_globals, Promise, data_manager, common */
/*eslint no-undef: "error"*/

"use strict";


var analysis =  {

	// Form factory instance
	form: null,

	area_name				: null,
	row						: null,

	// DOM containers
	export_data_container	: null,
	form_items_container	: null,
	chart_wrapper_container	: null,

	/**
	 * Chart wrapper instance
	 * @type {chart_wrapper}
	 */
	chart_wrapper: null,


	set_up : function(options) {

		const self = this

		// options
			self.area_name					= options.area_name
			self.export_data_container		= options.export_data_container
			self.row						= options.row
			self.form_items_container		= options.form_items_container
			self.chart_wrapper_container	= options.chart_wrapper_container

		// form
		const form_node = self.render_form()
		self.form_items_container.appendChild(form_node)

		return true
	},//end set_up

	/**
	 * RENDER FORM
	 */
	render_form : function() {

		const self = this

		// DocumentFragment is like a virtual DOM
		const fragment = new DocumentFragment()

		// form_factory instance
			self.form = self.form || new form_factory()

		const form_row = common.create_dom_element({
			element_type	: "div",
			class_name		: "form-row fields",
			parent			: fragment
		})

		// mint
			self.form.item_factory({
				id				: "mint",
				name			: "mint",
				label			: tstring.mint || "mint",
				q_column		: "p_mint",
				value_wrapper	: ['["', '"]'], // to obtain ["value"] in selected value only
				eq				: "LIKE",
				eq_in			: "%",
				eq_out			: "%",
				is_term			: true,
				parent			: form_row,
				callback		: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'catalog'
					})
				}
			})

		// submit button
			const submit_group = common.create_dom_element({
				element_type	: "div",
				class_name		: "form-group field button_submit",
				parent			: fragment
			})
			const submit_button = common.create_dom_element({
				element_type	: "input",
				type			: "submit",
				id				: "submit",
				value			: tstring.search || "Search",
				class_name		: "btn btn-light btn-block primary",
				parent			: submit_group
			})
			submit_button.addEventListener("click", function (e) {
				e.preventDefault()
				self.form_submit(form)
			})

		// reset button
			const reset_button = common.create_dom_element({
				element_type	: "input",
				type			: "button",
				id				: "button_reset",
				value			: tstring.reset || 'Reset',
				class_name		: "btn btn-light btn-block secondary button_reset",
				parent			: submit_group
			})
			reset_button.addEventListener("click", function (e) {
				e.preventDefault()
				window.location.replace(window.location.pathname);
			})

		// operators
			// fragment.appendChild( forms.build_operators_node() )
			const operators_node = self.form.build_operators_node()
			fragment.appendChild( operators_node )

		// the form element itself!
			const form = common.create_dom_element({
				element_type	: "form",
				id				: "search_form",
				class_name		: "form-inline"
			})
			form.appendChild(fragment)


		return form
	},//end render_form

	/**
	 * FORM SUBMIT
	 * Form submit launch search
	 */
	form_submit : function(form_obj, options={}) {
		
		const self = this

		// options
			const scroll_result	= typeof options.scroll_result==="boolean" ? options.scroll_result : true
			const form_items	= options.form_items || self.form.form_items

		// build filter
			const filter = self.form.build_filter({
				form_items: form_items
			})
		
		// empty filter case
			if (!filter || filter.length<1) {
				return false
			}

		// search rows exec against API
			const js_promise = self.search_rows({
				filter			: filter,
				limit			: 0
			})
			.then((parsed_data)=>{

				event_manager.publish('form_submit', parsed_data)

				// TODO: do stuff with the data
				console.log(parsed_data)
				const cultures = parsed_data
					.map((ele) => ele.p_territory)
					.flat()
					.filter((ele) => ele)
				console.log(cultures)
				// this.chart_wrapper = new histogram_wrapper(
				// 	this.chart_wrapper_container,
				// 	diameters,
				// 	"Diameter"
				// )
				// this.chart_wrapper.render()

			})

	},

	/**
	 * SEARCH_ROWS
	 * Call to API and load json data results of search
	 */
	search_rows : function(options) {

		const self = this

		// sort vars
			const filter			= options.filter || null
			const ar_fields			= options.ar_fields || ["*"]
			const order				= options.order || "norder ASC"
			const lang				= page_globals.WEB_CURRENT_LANG_CODE
			const process_result	= options.process_result || null
			const limit				= options.limit != undefined
										? options.limit
										: 30
		
		return new Promise(function(resolve){
			// parse_sql_filter
				const group = []
			// parsed filters
				const sql_filter = self.form.parse_sql_filter(filter)
			// request
				const request_body = {
					dedalo_get		: 'records',
					table			: 'catalog',
					ar_fields		: ar_fields,
					lang			: lang,
					sql_filter		: sql_filter,
					limit			: limit,
					group			: (group.length>0) ? group.join(",") : null,
					count			: false,
					order			: order,
					process_result	: process_result
				}
				data_manager.request({
					body : request_body
				})
				.then((response)=>{
					// data parsed
					const data = page.parse_catalog_data(response.result)

					resolve(data)
				})
		})

	},

}//end analysis



/*
 * BEGIN chart_wrapper
 */

/**
 * Width (in pixels) of color picker
 * @type {number}
 */
const COLOR_PICKER_WIDTH = 200

/**
 * Default name for the chart -> when exporting,
 * `<name>.<format>`
 * @type {string}
 */
const DEFAULT_CHART_NAME = 'chart'


/**
 * Chart wrapper class
 * @class
 * @abstract
 * @param {Element} div_wrapper 
 */
function chart_wrapper(div_wrapper) {
	if (this.constructor === chart_wrapper) {
		throw new Error("Abstract class 'chart_wrapper' cannot be instantiated")
	}
	/**
	 * Div element wrapping the chart itself and
	 * the controls
	 * @type {Element}
	 * @protected
	 */
	this.div_wrapper = div_wrapper
	/**
	 * Div container for chart download
	 * @type {Element}
	 * @protected
	 */
	this.download_chart_container = undefined
	/**
	 * Div container for user controls
	 * @type {Element}
	 * @protected
	 */
	this.controls_container = undefined
}

/**
 * Render the chart and controls
 * 
 * Empties the div wrapper and resets properties
 * 
 * Subclasses must call this method at the top
 * of their own implementation
 * @name chart_wrapper#render
 * @function
 */
chart_wrapper.prototype.render = function() {
	// Save this chart_wrapper intance
	/**
	 * This chart_wrapper intance
	 * @type {chart_wrapper}
	 */
	const self = this
	// Remove all children in the div_wrapper
	this.div_wrapper.replaceChildren()
	// Set controls container to undefined
	this.controls_container = undefined
	// Create the chart download section
	this.download_chart_container = common.create_dom_element({
		element_type	: 'div',
		id				: 'download_chart_container',
		class_name		: 'o-purple',
		parent			: this.div_wrapper,
	})
	const format_select = common.create_dom_element({
		element_type	: 'select',
		id				: 'chart_export_format',
		parent			: this.download_chart_container,
		// TODO: add ARIA attributes?
	})
	for (const format of this.get_supported_export_formats()) {
		common.create_dom_element({
			element_type	: 'option',
			value			: format,
			text_content	: format.toUpperCase(),
			parent			: format_select,
		})
	}
	const chart_download_button = common.create_dom_element({
		element_type	: 'button',
		text_content	: 'Download',
		parent			: this.download_chart_container,
	})
	chart_download_button.addEventListener('click', () => {
		self.download_chart(format_select.value)
	})
}

/**
 * Download the chart as an image
 * 
 * For each supported format in the subclass,
 * @see chart_wrapper#get_supported_export_formats
 * the subclass must implement a method called
 * `download_chart_as_<format>`
 * @param {string} format the image format
 * @function
 * @abstract
 * @name chart_wrapper#download_chart
 */
chart_wrapper.prototype.download_chart = function(format) {
	/**
	 * File name for the chart
	 * @type {string}
	 */
	const filename = `${DEFAULT_CHART_NAME}.${format}`
	/**
	 * Function name for downloading with the particular format
	 * @type {string}
	 */
	const download_func_name = `download_chart_as_${format}`
	if (this[download_func_name] === undefined) {
		throw new Error(`${download_func_name} is not implemented!`)
	}
	this[download_func_name](filename)
}

/**
 * Get the supported chart export formats
 * 
 * Subclasses must return their own supported formats, e.g.,
 * `['png', 'jpg', 'eps']`
 * @function
 * @returns {string[]} the supported formats
 * @abstract
 * @name chart_wrapper#get_supported_export_formats
 */
chart_wrapper.prototype.get_supported_export_formats = function() {
	throw new Error(`Abstract method 'chart_wrapper.download_chart' cannot be called`)
}

/*
 * END chart_wrapper
 */

/*
 * BEGIN chartjs_chart_wrapper
 */

/**
 * Chart.js chart wrapper class
 * @class
 * @abstract
 * @param {Element} div_wrapper 
 * @extends chart_wrapper
 */
function chartjs_chart_wrapper(div_wrapper) {
	if (this.constructor === chartjs_chart_wrapper) {
		throw new Error("Abstract class 'chartjs_chart_wrapper' cannot be instantiated")
	}
	chart_wrapper.call(this, div_wrapper)
	/**
	 * Canvas instance, will be created during
	 * render
	 * @type {HTMLCanvasElement}
	 * @protected
	 */
	 this.canvas = undefined
	 /**
	  * Chart instance (chart.js)
	  * @protected
	  */
	 this.chart = undefined
}
// Set prototype chain
Object.setPrototypeOf(chartjs_chart_wrapper.prototype, chart_wrapper.prototype)

/**
 * Render the chart (chartjs) and controls
 * 
 * Subclasses must call this method at the top
 * of their own implementation
 * @name chartjs_chart_wrapper#render
 * @function
 */
chartjs_chart_wrapper.prototype.render = function() {
	chart_wrapper.prototype.render.call(this)
	// Create canvas
	this.canvas = common.create_dom_element({
		element_type    : 'canvas',
		id              : 'result_graph',
		class_name		: 'o-blue',
		parent			: this.div_wrapper,
	})
	// Set chart instance to undefined
	this.chart = undefined
}

/**
 * Get the supported chart export formats
 * @function
 * @returns {string[]} the supported formats
 * @name chartjs_chart_wrapper#get_supported_export_formats
 */
chartjs_chart_wrapper.prototype.get_supported_export_formats = function() {
	return ['png']
}

/**
 * Download the chart as png
 * @param {string} filename the name of the file
 * @function
 * @name chartjs_chart_wrapper#_download_chart_as_png
 */
chartjs_chart_wrapper.prototype.download_chart_as_png = function(filename) {
	/**
	 * Temporary link
	 * @type {Element}
	 */
	let tmpLink = common.create_dom_element({
		element_type	: 'a',
		href			: this.chart.toBase64Image(),
	})
	tmpLink.setAttribute('download', filename)
	tmpLink.click()
	tmpLink.remove()
}

/**
 * FIXME: this is not working...
 * Download the chart as svg
 * @param {string} filename the name of the file
 * @function
 * @name chartjs_chart_wrapper#_download_chart_as_svg
 */
chartjs_chart_wrapper.prototype.download_chart_as_svg = function(filename) {
	// Tweak C2S library
	this._tweak_c2s()
	// Get original width and height
	const width = this.canvas.offsetWidth
	const height = this.canvas.offsetHeight
	// TODO: Turn off responsiveness and animations
	this.chart.options.animation = false
	this.chart.options.reponsive = false
	// Replicate chart in C2S space
	const svgContext = C2S(width, height)
	const svgChart = new Chart(svgContext, this.chart.config._config)
	// Download
	/**
	 * Temporary link
	 * @type {Element}
	 */
	let tmpLink = common.create_dom_element({
		element_type	: 'a',
		href			: 'data:image/svg+xml;utf8,'
						  + encodeURIComponent(svgContext.getSerializedSvg()),
	})
	tmpLink.setAttribute('download', filename)
	tmpLink.click()
	tmpLink.remove()
	// TODO: Turn on responsiveness and animations
	this.chart.options.animation = true
	this.chart.options.reponsive = true
}

/**
 * Some tweaks to the canvas2svg library are required for svg export to work
 * 
 * Via: https://stackoverflow.com/questions/62249315/export-canvas-to-svg-file
 * @function
 * @private
 * @name chartjs_chart_wrapper#_tweak_c2s
 */
chartjs_chart_wrapper.prototype._tweak_c2s = function() {
	C2S.prototype.getContext = function(contextId) {
		if (contextId === '2d' || contextId === '2D') {
		  return this;
		}
		return null;
	  }
	  C2S.prototype.style = function() {
		return this.__canvas.style;
	  }
	  C2S.prototype.getAttribute = function(name) {
		return this[name];
	  }
	  C2S.prototype.addEventListener = function(type, listener, eventListenerOptions) {
		// nothing to do here, but we need this function :)
	  }
}

/*
 * END chartjs_chart_wrapper
 */

/*
 * BEGIN histogram_wrapper
 */

/**
 * Histogram wrapper
 * @param {Element}  div_wrapper the div to work in
 * @param {number[]} data the data
 * @param {string} xlabel the label for the x-axis
 * @class
 * @extends chartjs_chart_wrapper
 */
function histogram_wrapper(div_wrapper, data, xlabel) {
	/*
     * <Function>.call is a method that executes the defined function,
     * but with the "this" variable pointing to the first argument,
     * and the rest of the arguments being arguments of the function
     * that is being "called". This essentially performs all of
     * chart_wrapper's constructor logic on histogram_wrapper's "this".
     */
	chartjs_chart_wrapper.call(this, div_wrapper)

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
	this._n_bins_default = Math.ceil(Math.sqrt(this._data.length))
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
	this._xlabel = xlabel
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
	this._bar_color = 'rgba(255,190,92,0.5)'
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
histogram_wrapper.prototype.get_density = function() {
	return this._density
}

/**
 * Change the density plot attribute
 * @param density {boolean} `true` if density, `false` otherwise
 * @function
 * @name histogram_wrapper#set_density
 */
histogram_wrapper.prototype.set_density = function(density) {
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
histogram_wrapper.prototype._get_density_string = function() {
	return this._density ? 'Density' : 'Frequency'
}

/**
 * Get the amount of bins in the histogram
 * @returns {number} the amount of bins
 * @function
 * @name histogram_wrapper#get_n_bins
 */
histogram_wrapper.prototype.get_n_bins = function() {
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
histogram_wrapper.prototype.set_n_bins = function(n_bins) {
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
	this.chart.options.scales.x.ticks.stepSize = 2*half_bin_width
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
histogram_wrapper.prototype.get_bar_color = function() {
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
histogram_wrapper.prototype.set_bar_color = function(bar_color) {
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
histogram_wrapper.prototype._get_plotting_data = function() {
	const data_max = Math.max(...this._data)
	const data_min = Math.min(...this._data)
	const bin_width = (data_max - data_min) / this._n_bins
	const half_bin_width = 0.5 * bin_width
	/**
	 * Center of each bin
	 * @type {number[]}
	 */
	const bin_centers = Array.apply(null, Array(this._n_bins)).map(
		(value, index) => data_min + (2*index+1)*half_bin_width
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
			entries[this._n_bins-1]++
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
			entries[j] /= (sum*bin_width);
		}
	}
	return [
		bin_centers,
		bin_centers.map((val, i) => ({x: val, y: entries[i]})),
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
histogram_wrapper.prototype._get_tooltip_title_callback = function(bin_centers, half_bin_width) {
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
	const callback = function(items) {
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
 * Render the chart and the control panel
 * @function
 * @name histogram_wrapper#render
 */
histogram_wrapper.prototype.render = function() {
	// Call super render method
	chartjs_chart_wrapper.prototype.render.call(this)
	// Render chart
	this._render_chart()
	// Render control panel
	this._render_control_panel()
}

/**
 * Render the chart
 * @function
 * @private
 * @name histogram_wrapper#_render_chart
 */
histogram_wrapper.prototype._render_chart = function() {
	this._n_bins =  this._n_bins_default
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
				stepSize: 2*half_bin_width,
				callback: (label, index, labels) => {
					return Number(label).toFixed(this._n_decimals)
				}
			},
			title: {
				display: true,
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
					size: 14
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
 * @private
 * @name histogram_wrapper#_render_control_panel
 */
histogram_wrapper.prototype._render_control_panel = function() {
	// Save this histogram wrapper instance, because when we change scope
	// we may still need to refer to it
	/**
	 * This histogram_wrapper instance
	 * @type {histogram_wrapper}
	 */
	const self = this
	// Create controls container
	this.controls_container = common.create_dom_element({
		element_type    : 'div',
		id              : 'controls',
		class_name		: 'o-green',
		parent			: this.div_wrapper,
	})
	/**
	 * Slider for number of bins
	 * @type {Element}
	 */
	const slider = common.create_dom_element({
		element_type	: 'input',
		type			: 'range',
		value			: this._n_bins_default,
		parent			: this.controls_container,
	})
	slider.setAttribute('min', 1)
	slider.setAttribute('max', this._max_bins_multiplier*this._n_bins_default)
	slider.addEventListener('input', () => {
		this.set_n_bins(Number(slider.value))
	})
	/**
	 * Reset button for the slider
	 * @type {Element}
	 */
	const slider_reset = common.create_dom_element({
		element_type	: 'button',
		type			: 'button',
		text_content	: 'Reset',
		parent			: this.controls_container,
	})
	slider_reset.addEventListener('click', () => {
		slider.value = this._n_bins_default
		this.set_n_bins(Number(slider.value))
	})
	/**
	 * Checkbox for density plot
	 * @type {Element}
	 */
	const density_checkbox = common.create_dom_element({
		element_type	: 'input',
		type			: 'checkbox',
		id				: 'density_checkbox',
		parent			: this.controls_container,
	})
	/**
	 * Checkbox label for density plot
	 * @type {Element}
	 */
	const density_checkbox_label = common.create_dom_element({
		element_type	: 'label',
		text_content	: 'Density',
		parent			: this.controls_container,
	})
	density_checkbox_label.setAttribute('for', 'density_checkbox')
	density_checkbox.addEventListener('change', () => {
		this.set_density(Boolean(density_checkbox.checked))
	})
	/** iro.js color picker */
	const color_picker_container = common.create_dom_element({
		element_type	: 'div',
		id				: 'color_picker_container',
		parent			: this.controls_container
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
	color_picker.on('color:change', function(color) {
		self.set_bar_color(color.rgbaString)
	})
}

/*
 * END histogram_wrapper
 */

/*
 * BEGIN bar_chart_wrapper
 */

/**
 * Bar chart wrapper
 * @param {Element} div_wrapper the div to work in
 * @param {number[] | string[] | {[key: string | number]: number}} data
 * 		  input data. Either an array of occurences, which are parsed by
 * 		  the bar chart wrapper (e.g., `['bronze', 'bronze', 'iron']`), or
 * 		  an object with keys and counts (e.g. `{'bronze': 2, 'iron': 1}`)
 * @param {string} ylabel the label for the y-axis
 * @class
 * @extends chartjs_chart_wrapper
 */
function bar_chart_wrapper(div_wrapper, data, ylabel) {
	chartjs_chart_wrapper.call(this, div_wrapper)
	/**
	 * Data for the bar chart
	 * @type {{labels: string[] | number[], values: number[]}}
	 */
	this._data = undefined
	if (Array.isArray(data)) {
		// TODO: Check validity of array
		// TODO: parse array
	} else {
		// TODO: Check validity of object
		// TODO: Parse object
	}
}
// Set prototype chain
Object.setPrototypeOf(bar_chart_wrapper.prototype, chartjs_chart_wrapper.prototype)

/*
 * END bar_chart_wrapper
 */