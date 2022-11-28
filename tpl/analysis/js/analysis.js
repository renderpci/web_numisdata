/*global tstring, page_globals, Promise, data_manager, common, event_manager */
/*eslint no-undef: "error"*/

"use strict";


import { chart_wrapper } from "../../lib/charts/chart-wrapper.js";
import { boxvio_chart_wrapper } from "../../lib/charts/d3/boxvio-chart-wrapper.js";
import { histogram_wrapper } from "../../lib/charts/chartjs/histogram-wrapper.js";


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

		// material
			self.form.item_factory({
				id 			: "material",
				name 		: "material",
				q_column 	: "ref_type_material",
				q_table 	: "any",
				label		: tstring.material || "material",
				is_term 	: false,
				parent		: form_row,
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

		// culture
			self.form.item_factory({
				id				: "culture",
				name			: "culture",
				label			: tstring.culture || "culture",
				q_column		: "p_culture",
				value_wrapper	: ['["','"]'], // to obtain ["value"] in selected value only
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
	
		// iconography_obverse
			self.form.item_factory({
				id				: "iconography_obverse",
				name			: "iconography_obverse",
				label			: tstring.iconography_obverse || "iconography obverse",
				q_column		: "ref_type_design_obverse_iconography",
				value_split		: ' | ',
				q_splittable	: true,
				q_selected_eq	: 'LIKE',
				eq_in			: "%",
				eq_out			: "%",
				// q_table		: "ts_period",
				is_term			: false,
				parent			: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'catalog'
					})
				}
			})
		
		// iconography_reverse
			self.form.item_factory({
				id				: "iconography_reverse",
				name			: "iconography_reverse",
				label			: tstring.iconography_reverse || "iconography reverse",
				q_column		: "ref_type_design_reverse_iconography",
				value_split		: ' | ',
				q_splittable	: true,
				q_selected_eq	: 'LIKE',
				eq_in			: "%",
				eq_out			: "%",
				// q_table		: "ts_period",
				is_term			: false,
				parent			: form_row,
				callback		: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'catalog'
					})
				}
			})
		
		// range slider date (range_slider) (!) WORKING HERE
			self.form.item_factory({
				id			: "range_slider",
				name		: "range_slider",
				input_type	: 'range_slider',
				label		: tstring.period || "Period",
				class_name	: 'range_slider',
				q_column	: "ref_date_in,ref_date_end",
				// eq		: "LIKE",
				// eq_in	: "",
				// eq_out	: "%",
				// q_table	: "catalog",
				sql_filter	: null,
				parent		: form_row,
				callback	: function(form_item) {

					// const form_item				= this
					const node_input				= form_item.node_input
					const range_slider_value_in		= node_input.parentNode.querySelector('#range_slider_in')
					const range_slider_value_out	= node_input.parentNode.querySelector('#range_slider_out')

					function set_up_slider() {

						// compute range years
						self.get_catalog_range_years()
						.then(function(range_data){
							// console.log("range_data:",range_data);

							// destroy current slider instance if already exists
								if ($(node_input).slider("instance")) {
									$(node_input).slider("destroy")
								}

							// reset filter
								form_item.sql_filter = null

							// set inputs values from database
								range_slider_value_in.value	= range_data.min
								range_slider_value_in.addEventListener("change",function(e){
									const value = (e.target.value>=range_data.min)
										? e.target.value
										: range_data.min
									$(node_input).slider( "values", 0, value );
									e.target.value = value
								})
								range_slider_value_out.value = range_data.max
								range_slider_value_out.addEventListener("change",function(e){
									const value = (e.target.value<=range_data.max)
										? e.target.value
										: range_data.max
									$(node_input).slider( "values", 1, e.target.value );
									e.target.value = value
								})

							// active jquery slider
								$(node_input).slider({
									range	: true,
									min		: range_data.min,
									max		: range_data.max,
									step	: 1,
									values	: [ range_data.min, range_data.max ],
									slide	: function( event, ui ) {
										// update input values on user drag slide points
										range_slider_value_in.value	 = ui.values[0]
										range_slider_value_out.value = ui.values[1]
										// console.warn("-----> slide range form_item.sql_filter:",form_item.sql_filter);
									},
									change: function( event, ui ) {
										// update form_item sql_filter value on every slider change
										form_item.sql_filter = "(ref_date_in >= " + ui.values[0] + " AND ref_date_in <= "+ui.values[1]+")"; // AND (ref_date_end <= " + ui.values[1] + " OR ref_date_end IS NULL)
										form_item.q = ui.value
										// console.warn("-----> change range form_item.sql_filter:", form_item.sql_filter);
									}
								});
						})
					}

					// initial_map_loaded event (triggered on initial map data is ready)
					// event_manager.subscribe('initial_map_loaded', set_up_slider)
					set_up_slider()
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

		// loading
			// cleanup html
				const info_lines = document.querySelectorAll('.info_line')
				const info_lines_length	= info_lines.length
				for (let i = 0; i < info_lines_length; i++) {
					info_lines[i].classList.add('hide')
				}
				while (self.diameter_chart_container.hasChildNodes()) {
					self.diameter_chart_container.removeChild(self.diameter_chart_container.lastChild);
				}
				while (self.weight_chart_container.hasChildNodes()) {
					self.weight_chart_container.removeChild(self.weight_chart_container.lastChild);
				}
			// spinner
				const result = document.getElementById('result')
				const spinner = common.create_dom_element({
					element_type	: 'div',
					class_name		: 'spinner',
					parent			: result
				})

		// scroll to head result
			// if (scroll_result) {
				// result.scrollIntoView(
				// 	{behavior: "smooth", block: "start", inline: "nearest"}
				// );
			// }

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
				// console.log(parsed_data)

				event_manager.publish('form_submit', parsed_data)

				// const diameters = parsed_data
				// 	.map((ele) => ele.full_coins_reference_diameter_max)
				// 	.flat()
				// 	.filter((v) => v)
				// console.log(diameters)

				// this.diameter_chart_wrapper = new histogram_wrapper(
				// 	this.diameter_chart_container,
				// 	diameters,
				// 	{
				// 		xlabel: 'Diameter',
				// 	}
				// )
				// this.diameter_chart_wrapper.render()

				// data
					const data = []
					for (const [i, ele] of parsed_data.entries()) {
						const number_key = ele.ref_type_number ? ele.ref_type_number : `Missing Number & Key (${i})`
						const mint = ele.p_mint ? ele.p_mint[0] : `Missing mint (${i})`
						const material = ele.ref_type_material ? ele.ref_type_material : `Missing material (${i})`
						const denomination = ele.ref_type_denomination ? ele.ref_type_denomination : `Missing denomination ${i}`
						// if (!['12', '59', '62', '18','11a','14'].includes(name)) continue
						// if (!['59', '62'].includes(name)) continue
						const tmp_data = {}
						const calculable = ele.full_coins_reference_calculable
						const diameter_max = ele.full_coins_reference_diameter_max
						const diameter_min = ele.full_coins_reference_diameter_min
						const weight = ele.full_coins_reference_weight
						if (diameter_max && diameter_max.length) {
							const tmp_diameter_max = diameter_max.filter((v, i) => v && calculable[i])
							if (tmp_diameter_max.length) {
								tmp_data.diameter_max = tmp_diameter_max
							}
						}
						if (diameter_min && diameter_min.length) {
							const tmp_diameter_min = diameter_min.filter((v, i) => v && calculable[i])
							if (tmp_diameter_min.length) {
								tmp_data.diameter_min = tmp_diameter_min
							}
						}
						if (weight && weight.length) {
							const tmp_weight = weight.filter((v, i) => v && calculable[i])
							if (tmp_weight.length) {
								tmp_data.weight = tmp_weight
							}
						}
						if (Object.keys(tmp_data).length) {
							tmp_data.number_key = number_key
							tmp_data.mint = mint
							tmp_data.material = material
							tmp_data.denomination = denomination
							data.push(tmp_data)
						}
					}
					// console.log(data)

				// Weights
				const weights = data.filter(
					(ele) => ele.weight
				).map(
					(ele) => {return {key: [ele.mint, ele.number_key], values: ele.weight}}
				)
				// console.log('Weights:')
				// console.log(weights)

				spinner.remove()

				this.weight_chart_wrapper = new boxvio_chart_wrapper(
					this.weight_chart_container,
					weights,
					[tstring.mint || 'Mint', tstring.number || 'Number'],
					{
						ylabel: tstring.weight || 'Weight',
						overflow: true,
						display_control_panel: true,
						display_download: true,
						sort_xaxis: true,
					}
				)
				this.weight_chart_wrapper.render()

				// Diameters
				const diameters = data.filter(
					(ele) => ele.diameter_max
				).map(
					(ele) => {return {key: [ele.mint, ele.number_key], values: ele.diameter_max}}
				)
				// console.log('Diameters:')
				// console.log(diameters)
				this.diameter_chart_wrapper = new boxvio_chart_wrapper(
					this.diameter_chart_container,
					diameters,
				 [tstring.mint || 'Mint', tstring.number || 'Number'],
					{
						ylabel: tstring.diameter || 'Diameter',
						overflow: true,
						display_control_panel: true,
						display_download: true,
						sort_xaxis: true,
					}
				)
				this.diameter_chart_wrapper.render()

				// show Weights and Diameters block labels
					for (let i = 0; i < info_lines_length; i++) {
						info_lines[i].classList.remove('hide')
					}
			})


		return js_promise
	},

	/**
	 * SEARCH_ROWS
	 * Call to API and load JSON data results of search
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
										: 100

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

	/**
	* GET_CATALOG_RANGE_YEARS
	* @return
	*/
	get_catalog_range_years : function() {

		return new Promise(function(resolve){

			const ar_fields = ['id','section_id','MIN(ref_date_in + 0) AS min','MAX(ref_date_in + 0) AS max']

			const request_body = {
				dedalo_get		: 'records',
				db_name			: page_globals.WEB_DB,
				lang			: page_globals.WEB_CURRENT_LANG_CODE,
				table			: 'catalog',
				ar_fields		: ar_fields,
				limit			: 0,
				count			: false,
				offset			: 0,
				order			: 'id ASC'
			}
			data_manager.request({
				body : request_body
			})
			.then(function(api_response){
				// console.log("-> get_catalog_range_years api_response:",api_response);

				let min = 0
				let max = 0
				if (api_response.result) {
					for (let i = 0; i < api_response.result.length; i++) {
						const row = api_response.result[i]
						const current_min = parseInt(row.min)
						if (min===0 || current_min<min) {
							min = current_min
						}
						const current_max = parseInt(row.max)
						// if (current_max>min) {
							max = current_max
						// }
					}
				}

				const data = {
					min : min,
					max : max
				}

				resolve(data)
			})
		})
	}//end get_catalog_range_years

}//end analysis

