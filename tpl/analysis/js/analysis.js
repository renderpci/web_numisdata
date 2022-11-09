/*global tstring, page_globals, Promise, data_manager, common */
/*eslint no-undef: "error"*/

"use strict";


import { chart_wrapper } from "./charts/chart-wrapper.js";
import { histogram_wrapper } from "./charts/chartjs/histogram-wrapper.js";
import { bar_chart_wrapper } from "./charts/chartjs/bar-chart-wrapper.js";

export const analysis =  {

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
				const diameters = parsed_data
					.map((ele) => ele.full_coins_reference_diameter_max)
					.flat()
					.filter((ele) => ele)
				this.chart_wrapper = new histogram_wrapper(
					this.chart_wrapper_container,
					diameters,
					"Diameter"
				)
				// this.chart_wrapper = new bar_chart_wrapper(
				// 	this.chart_wrapper_container,
				// 	cultures,
				// 	'Count'
				// )
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

