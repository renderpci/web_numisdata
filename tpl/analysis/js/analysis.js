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

	// Chart wrapper
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
				const diameters = parsed_data
					.map((ele) => ele.ref_type_averages_diameter)
					.filter((ele) => ele !== undefined && ele !== null)  // removes null or undefined entries
				this.chart_wrapper = new histogram_wrapper(
					this.chart_wrapper_container,
					diameters,
					"Diameter"
				)
				this.chart_wrapper.render()

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





/** Wrapper for charts (data plots) that includes the
 * chart itself and possible UI for controls
 * 
 * Subclasses implement particular types of charts,
 * such as histograms, pie-charts, etc.
 * 
 * Subclasses must implement their own constructor
 * and `render` method
*/
class chart_wrapper {

    /**
     * Construct a new chart wrapper
     * @param div_wrapper {Element} the div to work in
     */
    constructor(div_wrapper) {
        /**
         * Div element wrapping the chart itself and
         * the controls
         * @type {Element}
         * @protected
         */
        this.div_wrapper = div_wrapper
        /**
         * Canvas instance, will be created during
         * render
         * @type {Element}
         * @protected
         */
        this.canvas = undefined
		/**
		 * Chart instance (e.g., chart.js)
		 * @protected
		 */
		this.chart = undefined
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
     */
    render() {
        // Create canvas
        this.canvas = common.create_dom_element({
            element_type    : 'canvas',
            id              : 'result_graph',
			class_name		: 'o-blue',
        })
        // Replace all existing children of the div wrapper
        // by the canvas
        this.div_wrapper.replaceChildren(this.canvas)
		// Set chart instance to undefined
		this.chart = undefined
		// Set controls container to undefined
		this.controls_container = undefined
    }

}

/** Wrapper for a histogram
 * @extends chart_wrapper
 */
class histogram_wrapper extends chart_wrapper {

    /**
     * Construct a new histogram wrapper
     * @param div_wrapper {Element} the div to work in
     * @param data {number[]} the data
	 * @param xlabel {string} the label for the x-axis
     */
    constructor(div_wrapper, data, xlabel) {
        super(div_wrapper)
        /**
         * Data values
         * @type {number[]}
         * @private
         */
        this.data = data
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
		this.n_bins_default = Math.ceil(Math.sqrt(this.data.length))
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
		this.xlabel = xlabel
		/**
		 * Number of decimals to display
		 * @type {number}
		 * @private
		 */
		this.n_decimals = 3
		/**
		 * Maximum number of bins as mutiplier of default
		 * @type {number}
		 * @private
		 */
		this.max_bins_multiplier = 3
    }

	/**
	 * Check whether we are doing a density plot
	 * @returns {boolean} `true` if density plot,
	 * 			`false` otherwise
	 */
	get density() {
		return this._density
	}

	/**
	 * Change the density plot attribute
	 * @param newVal {boolean} `true` if density,
	 * 		  `false` otherwise
	 */
	set density(newVal) {
		this._density = newVal
		if (!this.chart) {
			return;
		}
		// Update chart
		const [
			bin_centers, plot_data, half_bin_width, data_min, data_max
		] = this.get_plotting_data()
		this.chart.data.datasets[0].label = this.density_string
		this.chart.data.datasets[0].data = plot_data
		this.chart.options.scales.y.title.text = this.density_string
		this.chart.update()
	}

	/** Get a string representing our plot mode
	 * @returns {string} `'Density'` if we are in density
	 * 			mode, `'Frequency'` otherwise
	*/
	get density_string() {
		return this.density ? 'Density' : 'Frequency'
	}

	/**
	 * Get the amount of bins in the histogram
	 * @returns {number} the amount of bins
	 */
	get n_bins() {
		return this._n_bins
	}

	/**
	 * Set a new number of bins for the histogram
	 * 
	 * Updates chart instance accordingly
	 * @param newVal {number} amount of bins
	 */
	set n_bins(newVal) {
		this._n_bins = newVal
		if (!this.chart) {
			return;
		}
		// Update chart
		const [
			bin_centers, plot_data, half_bin_width, data_min, data_max
		] = this.get_plotting_data()
		this.chart.data.datasets[0].data = plot_data
		this.chart.options.scales.x.min = data_min
		this.chart.options.scales.x.max = data_max
		this.chart.options.scales.x.ticks.stepSize = 2*half_bin_width
		this.chart.options.plugins.tooltip.callbacks.title =
			this.getTooltipTitleCallback(bin_centers, half_bin_width)
		this.chart.update()
	}

	/**
	 * Get data needed to generate the chart
	 * TODO: there is no need to recompute bin_centers unless the number of bins
	 * 		 has changed
	 * @private
	 * 
	 * @returns {[number[], {x: number, y: number}[], number, number, number]}
	 * 			the bin centers, {bin centers, count per bin}, half of the bin width,
	 * 			the minimum and maximum of input data
	 */
	get_plotting_data() {
		const data_max = Math.max(...this.data)
		const data_min = Math.min(...this.data)
		const bin_width = (data_max - data_min) / this.n_bins
		const half_bin_width = 0.5 * bin_width
		/**
		 * Center of each bin
		 * @type {number[]}
		 */
		const bin_centers = Array.apply(null, Array(this.n_bins)).map(
			(value, index) => data_min + (2*index+1)*half_bin_width
		)
		// We bin with right-open intervals
		/**
		 * Count per bin
		 * @type {number[]}
		 */
		let entries = Array.apply(null, Array(this.n_bins)).map(() => 0)
		for (let i = 0; i < this.data.length; i++) {
			// If value is max, add it to last bin
			if (this.data[i] === data_max) {
				bin_centers[this.n_bins-1]++
				continue
			}
			// Proceed as usual
			for (let j = 0; j < this.n_bins; j++) {
				if (this.data[i] >= bin_centers[j] - half_bin_width
					&& this.data[i] < bin_centers[j] + half_bin_width) {
					entries[j]++
					break
				}
			}
		}
		// Normalize if density
		if (this.density) {
			const sum = entries.reduce((partialSum, val) => partialSum + val, 0)
			for (let j = 0; j < this.n_bins; j++) {
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
	 * @param bin_centers {number[]} the bin centers
	 * @param half_bin_width {number} half of the bin width
	 * @returns the callback function
	 */
	getTooltipTitleCallback(bin_centers, half_bin_width) {
		/**
		 * Callback function for the tooltip title
		 * @param {TooltipItem[]} items the tooltip item contexts
		 * @returns {string} the title of the tooltip
		 */
		// Cannot use `this` inside inner function!!!
		const xlabel = this.xlabel
		const n_decimals = this.n_decimals
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

    render() {
        // Superclass render method
        super.render()

        // Subclass process
		this.n_bins =  this.n_bins_default
        const [
			bin_centers, plot_data, half_bin_width, data_min, data_max
		] = this.get_plotting_data()

		// Split chart options
		const chart_data = {
			datasets: [{
				label: this.density_string,
				data: plot_data,
				categoryPercentage: 1,
				barPercentage: 1,
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
						return Number(label).toFixed(this.n_decimals)
					}
				},
				title: {
					display: true,
					text: this.xlabel,
					font: {
						size: 14
					},
				}
			},
			y: {
				title: {
					display: true,
					text: this.density_string,
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
					title: this.getTooltipTitleCallback(bin_centers, half_bin_width),
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
			value			: this.n_bins_default,
			parent			: this.controls_container,
		})
		slider.setAttribute('min', 1)
		slider.setAttribute('max', this.max_bins_multiplier*this.n_bins_default)
		slider.addEventListener('input', () => {
			this.n_bins = Number(slider.value)
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
			slider.value = this.n_bins_default
			this.n_bins = Number(slider.value)
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
			this.density = Boolean(density_checkbox.checked)
		})
    }

}