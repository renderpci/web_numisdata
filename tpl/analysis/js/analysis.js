/*global tstring, page_globals, Promise, data_manager, common */
/*eslint no-undef: "error"*/

"use strict";


import { chart_wrapper } from "../../lib/charts/chart-wrapper.js";
import { boxvio_chart_wrapper } from "../../lib/charts/d3/boxvio-chart-wrapper.js";


export const analysis =  {

	// Form factory instance
	form: null,

	area_name				: null,
	row						: null,

	// DOM containers
	export_data_container		: null,
	form_items_container		: null,
	diameter_chart_container	: null,
	weight_chart_container		: null,

	/**
	 * Chart wrapper instance for diameter
	 * @type {chart_wrapper}
	 */
	diameter_chart_wrapper: null,
	/**
	 * Chart wrapper instance for weight
	 * @type {chart_wrapper}
	 */
	weight_chart_wrapper: null,


	set_up : function(options) {

		const self = this

		// options
			self.area_name					= options.area_name
			self.export_data_container		= options.export_data_container
			self.row						= options.row
			self.form_items_container		= options.form_items_container
			self.diameter_chart_container	= options.diameter_chart_container
			self.weight_chart_container		= options.weight_chart_container

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
		
		// number
			self.form.item_factory({
				id 			: "number",
				name 		: "number",
				q_column 	: "term",
				q_table 	: "types",
				label		: tstring.number_key || "Number & Key",
				is_term 	: false,
				parent		: form_row,
				group_op 	: '$or',
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'catalog'
					})
				}
			})
		
		// denomination
			self.form.item_factory({
				id 			: "denomination",
				name 		: "denomination",
				q_column 	: "ref_type_denomination",
				q_table 	: "any",
				label		: tstring.denomination || "denomination",
				is_term 	: false,
				parent		: form_row,
				callback	: function(form_item) {
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

		// scroll to head result
			if (scroll_result) {
				this.diameter_chart_container.scrollIntoView(
					{behavior: "smooth", block: "start", inline: "nearest"}
				);
			}

		// search rows exec against API
			const js_promise = self.search_rows({
				filter			: filter,
				limit			: 0,
				process_result	: {
					fn		: 'process_result::add_parents_and_children_recursive',
					columns	: [{name : "parents"}]
				}
			})
			.then((parsed_data)=>{

				event_manager.publish('form_submit', parsed_data)

				console.log(parsed_data)

				// const diameters = parsed_data
				// 	.map((ele) => ele.full_coins_reference_diameter_max)
				// 	.flat()
				// 	.filter((v) => v)
				// console.log(diameters)

				// this.chart_wrapper = new histogram_wrapper(
				// 	this.chart_wrapper_container,
				// 	diameters,
				// 	'Diameter'
				// )
				// this.chart_wrapper.render()

				const data = {}
				for (const ele of parsed_data) {
					const name = ele.ref_type_number
					// if (!['12', '59', '62', '18','11a','14'].includes(name)) continue
					// if (!['59', '62'].includes(name)) continue
					const tmpData = {}
					const calculable = ele.full_coins_reference_calculable
					const diameter_max = ele.full_coins_reference_diameter_max
					const diameter_min = ele.full_coins_reference_diameter_min
					const weight = ele.full_coins_reference_weight
					if (diameter_max && diameter_max.length) {
						tmpData.diameter_max = diameter_max.filter((v, i) => v && calculable[i])
					}
					if (diameter_min && diameter_min.length) {
						tmpData.diameter_min = diameter_min.filter((v, i) => v && calculable[i])
					}
					if (weight && weight.length) {
						tmpData.weight = weight.filter((v, i) => v && calculable[i])
					}
					if (Object.keys(tmpData).length) {
						data[name] = tmpData
					}
				}
				console.log(data)

				// Diameters
				const diameters = {}
				for (const [name, props] of Object.entries(data)) {
					diameters[name] = props.diameter_max
				}
				this.diameter_chart_wrapper = new boxvio_chart_wrapper(
					this.diameter_chart_container,
					diameters,
					true,
					'Diameter',
					true
				)
				this.diameter_chart_wrapper.render()

				// Diameters
				const weights = {}
				for (const [name, props] of Object.entries(data)) {
					weights[name] = props.weight
				}
				this.weight_chart_wrapper = new boxvio_chart_wrapper(
					this.weight_chart_container,
					weights,
					true,
					'Weight',
					true
				)
				this.weight_chart_wrapper.render()

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

