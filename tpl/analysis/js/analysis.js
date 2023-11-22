/*global tstring, page_globals, Promise, data_manager, common, event_manager, catalog_row_fields */
/*eslint no-undef: "error"*/

"use strict";


import { chart_wrapper } from "../../lib/charts/chart-wrapper.js";
import { boxvio_chart_wrapper } from "../../lib/charts/d3/boxvio/boxvio-chart-wrapper.js";
import { clock_chart_wrapper } from "../../lib/charts/d3/clock/clock-chart-wrapper.js";


/**
 * Default color when Dedalo API does not provide one
 * @type {string}
 */
const DEFAULT_COLOR = '#1f77b4'


export const analysis =  {

	// Form factory instance
	form: null,

	/**
	 * Form submit button
	 * @type {HTMLButtonElement}
	 */
	submit_button: null,

	area_name				: null,
	row						: null,

	// DOM containers
	export_data_container		: null,
	form_items_container		: null,
	weight_chart_container		: null,
	diameter_chart_container	: null,
	clock_chart_container		: null,

	/**
	 * Color hexadecimal code for each denomination
	 * @type {{
	 * 	section_id: number,
	 * 	color: string
	 * }[]}
	 */
	denomination_colors: null,

	/**
	 * Chart wrapper instance for weight
	 * @type {chart_wrapper}
	 */
	weight_chart_wrapper: null,
	/**
	 * Chart wrapper instance for diameter
	 * @type {chart_wrapper}
	 */
	diameter_chart_wrapper: null,
	/**
	 * Chart wrapper instance for clock
	 * @type {chart_wrapper}
	 */
	clock_chart_wrapper: null,


	set_up : function(options) {

		const self = this

		// options
			self.area_name					= options.area_name
			self.export_data_container		= options.export_data_container
			self.row						= options.row
			self.form_items_container		= options.form_items_container
			self.weight_chart_container		= options.weight_chart_container
			self.diameter_chart_container	= options.diameter_chart_container
			self.clock_chart_container		= options.clock_chart_container

		// denomination colors
			self.load_denomination_colors()

		// form
			const form_node = self.render_form()
			self.form_items_container.appendChild(form_node)

		return true
	},//end set_up

	/**
	 * Call the Dedalo API and obtain colors for the different denominations
	 */
	load_denomination_colors : function() {
		
		const self = this

		const request_body = {
			dedalo_get		: 'records',
			table			: 'denomination',
			ar_fields		: ['color', 'section_id', 'term'],
			lang			: page_globals.WEB_CURRENT_LANG_CODE
		}
		data_manager.request({
			body : request_body
		}).then((response)=>{
			self.denomination_colors = response.result
				.filter((ele) => ele.color && ele.color.length)
				.map((ele) => {
					return {
						section_id	: ele.section_id,
						color		: ele.color
					}
				})
			// console.log(self.denomination_colors)
			// Enable submit button
			self.submit_button.disabled = false
		})

	},

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
			self.submit_button = common.create_dom_element({
				element_type	: "input",
				type			: "submit",
				id				: "submit",
				value			: tstring.search || "Search",
				class_name		: "btn btn-light btn-block primary",
				parent			: submit_group
			})
			self.submit_button.disabled = true  // disable the button until the denomination colors are loaded
			self.submit_button.addEventListener("click", function (e) {
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
				const section_container = {
					weight: document.getElementById('weight_section'),
					diameter: document.getElementById('diameter_section'),
					clock: document.getElementById('clock_section')
				}
				for (const [sec_name, container] of Object.entries(section_container)) {
					container.classList.add('hide')
				}
				self.diameter_chart_container.replaceChildren()
				self.weight_chart_container.replaceChildren()
				self.clock_chart_container.replaceChildren()
				// while (self.diameter_chart_container.hasChildNodes()) {
				// 	self.diameter_chart_container.removeChild(self.diameter_chart_container.lastChild);
				// }
				// while (self.weight_chart_container.hasChildNodes()) {
				// 	self.weight_chart_container.removeChild(self.weight_chart_container.lastChild);
				// }
				// while (self.clock_chart_container.hasChildNodes()) {
				// 	self.clock_chart_container.removeChild(self.clock_chart_container.lastChild);
				// }
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

				// data
					const data = []
					for (const [i, ele] of parsed_data.entries()) {
						// get section_id to be the key referent to search data again.
						const section_id				= ele.section_id

						const number_key				= ele.ref_type_number ? ele.ref_type_number : `Missing Number & Key (${i})` // Why need to change the name???? MR POTATOE !!!!!!!!
						const mint						= ele.p_mint ? ele.p_mint[0] : `Missing mint (${ele.section_id})`
						const material					= ele.ref_type_material ? ele.ref_type_material : `Missing material (${i})`
						const denomination				= ele.ref_type_denomination ? ele.ref_type_denomination : `Missing denomination ${i}`
						const denomination_section_id	= (ele.ref_type_denomination_data && ele.ref_type_denomination_data.length)
							? parseInt(ele.ref_type_denomination_data[0])
							: null
						const color						= denomination_section_id === null || !self.denomination_colors.find((ele)=>ele.section_id===denomination_section_id)
							? DEFAULT_COLOR
							: self.denomination_colors.find((ele)=>ele.section_id===denomination_section_id).color
						// console.log(`NumberKey ${number_key} Denomination section ID ${denomination_section_id} assigned color ${color}`)
						// if (!['12', '59', '62', '18','11a','14'].includes(name)) continue
						// if (!['59', '62'].includes(name)) continue
						const tmp_data		= {}

						const calculable	= ele.full_coins_reference_calculable
						const diameter_max	= ele.full_coins_reference_diameter_max
						const diameter_min	= ele.full_coins_reference_diameter_min
						const weight		= ele.full_coins_reference_weight
						const axis			= ele.full_coins_reference_axis

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
						if (axis && axis.length) {
							const tmp_axis = axis.filter((v) => v)
							if (tmp_axis.length) {
								tmp_data.axis = tmp_axis
							}
						}
						if (Object.keys(tmp_data).length) {
							tmp_data.section_id 				= section_id
							tmp_data.number_key					= number_key
							tmp_data.mint						= mint
							tmp_data.type_number				= number_key //type number is and will be type number! Raspa said.
							tmp_data.material					= material
							tmp_data.denomination				= denomination
							tmp_data.denomination_section_id 	= denomination_section_id
							tmp_data.color						= color
							data.push(tmp_data)
						}
					}
					// console.log(data)

				// Weights
				const weights = data.filter( (ele) => ele.weight ).map( (ele) => {
						return {
							key			: [ele.mint, ele.number_key],
							values		: ele.weight,
							id			: ele.section_id,
							mint		: ele.mint,
							type_number	: ele.number_key,
							color		: ele.color
						}
					}
				)
				
				// Diameters
				const diameters = data.filter( (ele) => ele.diameter_max ).map(
					(ele) => {
						return {
							key			: [ele.mint, ele.number_key],
							values		: ele.diameter_max,
							id			: ele.section_id,
							mint		: ele.mint,
							type_number	: ele.number_key,
							color		: ele.color
						}
					}
				)

				// Axes
				const axes = data.filter( (ele) => ele.axis && ele.axis.length).map(
					(ele) => {
						const axis = Array(12).fill(0)
						for (const hour of ele.axis) {
							axis[hour % 12]++
						}
						return {
							key			: [ele.mint, ele.number_key],
							values		: axis,
							id			: ele.section_id,
							mint		: ele.mint,
							type_number	: ele.number_key
						}
					}
				)

				spinner.remove()

				if (weights.length) {
					section_container.weight.classList.remove('hide')
					this.weight_chart_wrapper = new boxvio_chart_wrapper(
						this.weight_chart_container,
						weights,
						[tstring.mint || 'Mint', tstring.number || 'Number'],
						{
							whiskers_quantiles					: [10, 90],
							ylabel								: tstring.weight || 'Weight',
							overflow							: true,
							display_control_panel				: true,
							display_download					: true,
							sort_xaxis							: true,
							tooltip_callback					: type_tooltip_callback,
							tooltip_callback_options_attributes	: ['id', 'type_number', 'mint']
						}
					)
					this.weight_chart_wrapper.render()
				}

				if (diameters.length) {
					section_container.diameter.classList.remove('hide')
					this.diameter_chart_wrapper = new boxvio_chart_wrapper(
						this.diameter_chart_container,
						diameters,
						[tstring.mint || 'Mint', tstring.number || 'Number'],
						{
							whiskers_quantiles					: [10, 90],
							ylabel								: tstring.diameter || 'Diameter',
							overflow							: true,
							display_control_panel				: true,
							display_download					: true,
							sort_xaxis							: true,
							tooltip_callback					: type_tooltip_callback,
							tooltip_callback_options_attributes	: ['id', 'type_number', 'mint']
						}
					)
					this.diameter_chart_wrapper.render()
				}

				if (axes.length) {
					section_container.clock.classList.remove('hide')
					this.clock_chart_wrapper = new clock_chart_wrapper(
						this.clock_chart_container,
						axes,
						{
							overflow							: true,
							outer_height						: '300px',
							display_download					: true,
							sort								: true,
							tooltip_callback					: type_tooltip_callback,
							tooltip_callback_options_attributes	: ['id', 'type_number', 'mint']
						}
					)
					this.clock_chart_wrapper.render()
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


/**
 * Callback for tooptip in violin-boxplot
 * @param {{id: string, type_number: string, mint: string}} options
 * @returns {Promise<Element>} the html element to add to the tooltip 
 */
async function type_tooltip_callback(options) {

	const section_id	= options.id
	const type_number	= options.type_number
	const mint			= options.mint

	// CALL DEDALO API TO OBTAIN INFO
	// const sql_filter =
	// 	`(\`p_mint\` = '["${mint}"]' AND \`p_mint\` != '')`
	// 	+ `AND (\`term\` LIKE '${number}%' AND \`term\` != '')`
	const catalog_ar_fields = ['*']

	const catalog_request_options = {
		dedalo_get	: 'records',
		lang		: page_globals.WEB_CURRENT_LANG_CODE,
		table		: 'catalog',
		ar_fields	: catalog_ar_fields,
		// sql_filter	: sql_filter,
		section_id 	: section_id, // unique id for the selected all data of the type
		limit		: 1,
		count		: false,
		// order		: "norder ASC"
	}

	const api_response = await data_manager.request({
		body: catalog_request_options
	})
	const type_data = api_response.result || null

	if (!type_data) {
		return common.create_dom_element({
			element_type: 'div',
			text_content: `Could not find number ${type_number} for mint ${mint} in the database.`
		})
	}
	const type_row = page.parse_catalog_data(type_data)[0]

	// set true to render material and denonimation
	type_row.add_denomination = true
	// CREATE THE RESULTING HTML Element
	// type_row.render_material	= true
	const ele = catalog_row_fields.draw_item(type_row)
	// Remove style of coins images container, since it is hardcoded to 124mm
	ele.getElementsByClassName('coins_images')[0].removeAttribute('style')
	return ele

}
