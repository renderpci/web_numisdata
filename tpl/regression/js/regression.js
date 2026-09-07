/**
 * @fileoverview Analysis module for MIB project.
 * Handles the generation of charts (weight, diameter, clock) and regression models
 * based on coin catalog data filtered via a user-facing search form.
 *
 * @module analysis
 *
 * @example
 * // Basic setup
 * import { regression } from './tpl/regression/js/regression.js';
 *
 * regression.set_up({
 *   area_name: 'catalog_regression',
 *   form_items_container: document.getElementById('form_container'),
 *   regression_model_chart_container: document.getElementById('regression_model_chart'),
 * });
 */

/*global tstring, page_globals, Promise, data_manager, common, event_manager, catalog_row_fields, form_factory */
/*eslint no-undef: "error"*/

"use strict";


// import { chart_wrapper } from "../../lib/charts/chart-wrapper.js";
// regression_logic is loaded as a plain global (tpl/regression/js/regression_logic.js)
// and must be available before this bundle evaluates.


/**
 * Default color when Dedalo API does not provide one.
 * @type {string}
 */
const DEFAULT_COLOR = '#1f77b4'


/**
 * Main regression controller object.
 * Integrates regression analysis functions and manages the UI for data filtering and visualization.
 */
export const regression =  {

	// Include regression_logic module functions
	...regression_logic,

	/**
	 * Form factory instance used to build the search interface.
	 * @type {form_factory|null}
	 */
	form: null,

	/**
	 * Form submit button element.
	 * @type {HTMLButtonElement|null}
	 */
	submit_button: null,

	/**
	 * Area name for the current context.
	 * @type {string|null}
	 */
	area_name				: null,

	/**
	 * Current row data if applicable.
	 * @type {Object|null}
	 */
	row						: null,

	// DOM containers
	/** @type {HTMLElement|null} Container for data export controls. */
	export_data_container				: null,
	/** @type {HTMLElement|null} Container where the form items are rendered. */
	form_items_container				: null,
	/** @type {HTMLElement|null} Container for the regression model visualization. */
	regression_model_chart_container	: null,
	/** @type {HTMLElement|null} Container for the regression data table. */
	regression_model_table_container	: null,
	/** @type {HTMLButtonElement|null} Toggle button to expand/collapse the data table. */
	regression_model_table_toggle		: null,
	/** @type {HTMLButtonElement|null} Download button for the data table CSV. */
	regression_model_table_download		: null,

	/**
	 * localStorage key used to persist the data table fold/unfold state.
	 * @type {string}
	 */
	table_storage_key					: 'regression_table_expanded',

	/**
	 * Color hexadecimal code for each denomination
	 * @type {{
	 * 	section_id: number,
	 * 	color: string
	 * }[]}
	 */
	denomination_colors: null,

	/**
	 * Initializes the regression module by setting up DOM containers,
	 * loading denomination colors, and rendering the search form.
	 *
	 * @param {Object} options - Configuration options for the module.
	 * @param {string} options.area_name - Name of the current working area.
	 * @param {HTMLElement} options.export_data_container - Container for export buttons.
	 * @param {Object} options.row - Current record data.
	 * @param {HTMLElement} options.form_items_container - Target container for the form.
	 * @param {HTMLElement} options.regression_model_chart_container - Target container for regression plot.
	 * @param {HTMLElement} [options.regression_model_table_container] - Target container for the regression data table.
	 * @param {HTMLButtonElement} [options.regression_model_table_toggle] - Toggle button to expand/collapse the data table.
	 * @param {HTMLButtonElement} [options.regression_model_table_download] - Download button for the data table CSV.
	 * @returns {boolean} Returns true if setup was initiated successfully.
	 */
	set_up : function(options) {

		const self = this

		// options
			self.area_name							= options.area_name
			self.export_data_container				= options.export_data_container
			self.row								= options.row
			self.form_items_container				= options.form_items_container
			self.regression_model_chart_container	= options.regression_model_chart_container
			self.regression_model_table_container	= options.regression_model_table_container
			self.regression_model_table_toggle		= options.regression_model_table_toggle
			self.regression_model_table_download	= options.regression_model_table_download
			self.pdf_current						= options.pdf_current

		// data table toggle (collapsible, state persisted in localStorage)
			if (self.regression_model_table_toggle && self.regression_model_table_container) {
				// restore saved state (default: collapsed)
					try {
						if (localStorage.getItem(self.table_storage_key) === 'expanded') {
							self.regression_model_table_container.classList.remove('hide')
							self.regression_model_table_toggle.setAttribute('aria-expanded', 'true')
							const icon = self.regression_model_table_toggle.querySelector('.regression_table_toggle_icon')
							if (icon) {
								icon.textContent = '\u25BC'
							}
						}
					} catch (e) {
						// localStorage may be unavailable (private mode, etc.); ignore
					}

				self.regression_model_table_toggle.addEventListener('click', function() {
					const is_hidden = self.regression_model_table_container.classList.toggle('hide')
					self.regression_model_table_toggle.setAttribute('aria-expanded', String(!is_hidden))
					const icon = self.regression_model_table_toggle.querySelector('.regression_table_toggle_icon')
					if (icon) {
						icon.textContent = is_hidden ? '\u25B6' : '\u25BC'
					}
					try {
						localStorage.setItem(self.table_storage_key, is_hidden ? 'collapsed' : 'expanded')
					} catch (e) {
						// ignore storage errors
					}
				})
			}

		// data table download (CSV)
			if (self.regression_model_table_download) {
				self.regression_model_table_download.addEventListener('click', function() {
					self.download_table_csv(self.regression_model_table_container)
				})
			}

		// form (render first so submit_button exists before async color load resolves)
			const form_node = self.render_form()
			self.form_items_container.appendChild(form_node)

		// denomination colors + first auto search, both gated on form readiness
			self.load_denomination_colors()
				.then(() => self.auto_search())
				.catch((err) => {
					if(SHOW_DEBUG===true) {
						console.error('load_denomination_colors error:', err)
					}
					// ensure submit button is enabled even if colors fail to load
					if (self.submit_button) {
						self.submit_button.disabled = false
					}
				})

		return true
	},//end set_up

	/**
	 * Executes a first search with a random mint automatically.
	 */
	auto_search : function() {

		const self = this

		// request possible mint values from catalog
		const request_body = {
			dedalo_get	: 'records',
			table		: 'catalog',
			ar_fields	: ['p_mint'],
			limit		: 50,
			group		: 'p_mint'
		}

		data_manager.request({
			body : request_body
		})
		.then((response)=>{
			if (response.result && response.result.length > 0) {
				// filter results to get valid mint names
				const mints = response.result
					.map(r => {
						try {
							return (typeof r.p_mint === 'string') ? JSON.parse(r.p_mint) : r.p_mint
						} catch(e) {
							return null
						}
					})
					.filter(val => Array.isArray(val) && val.length > 0)
					.map(val => val[0])

				if (mints.length > 0) {
					// pick a random mint
					const random_mint = mints[Math.floor(Math.random() * mints.length)]

					// find mint form item and set its value
					const mint_item = self.form.form_items['mint']
					if (mint_item) {
						mint_item.node_input.value = random_mint
						mint_item.q = random_mint

						// trigger input event to update floating label
						mint_item.node_input.dispatchEvent(new Event('input'))
						// trigger blur event to ensure label is positioned correctly
						mint_item.node_input.dispatchEvent(new Event('blur'))

						// auto-submit search
						self.form_submit()
					}
				}
			}
		})
		.catch((err) => {
			if(SHOW_DEBUG===true) {
				console.error('auto_search error:', err)
			}
		})
	},

	/**
	 * Call the Dedalo API and obtain colors for the different denominations
	 * Loads color definitions for different coin denominations from the Dedalo API.
	 * These colors are used for consistent visualization across different charts.
	 * Once colors are loaded, the search submit button is enabled.
	 *
	 * @returns {void}
	 */
	load_denomination_colors : async function() {

		const self = this

		const request_body = {
			dedalo_get	: 'records',
			table		: 'ts_object',
			ar_fields	: ['color', 'section_id', 'term'],
			sql_filter	: "color IS NOT NULL AND color != ''",
			lang		: page_globals.WEB_CURRENT_LANG_CODE
		}

		const api_response = await data_manager.request({
			body : request_body
		})
		if(SHOW_DEBUG) {
			console.log('load_denomination_colors API call response', api_response)
		}

		const result = api_response.result || []
		self.denomination_colors = result
			.filter((ele) => ele.color && ele.color.length)
			.map((ele) => {
				return {
					section_id	: ele.section_id,
					color		: ele.color
				}
			})

		if(SHOW_DEBUG) {
			console.log('load_denomination_colors processed colors', self.denomination_colors)
		}

		// Enable submit button
		self.submit_button.disabled = false
	},

	/**
	 * Renders the search form using the `form_factory`.
	 * Configures multiple input fields like Mint, Number, Material, Denomination,
	 * Culture, Iconography, and a Period range slider with auto-complete functionality.
	 *
	 * @returns {HTMLFormElement} The constructed form element.
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

					/**
					 * Configures and initializes the jQuery UI range slider for period filtering.
					 * Fetches the available year range from the catalog and updates the UI inputs.
					 */
					function set_up_slider() {

						// compute range years
						self.get_catalog_range_years()
						.then(function(range_data){
							if(SHOW_DEBUG===true) {
								console.log('---> range_data', range_data)
							}

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
									$(node_input).slider( "values", 1, value );
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
	 * Handles form submission and search execution.
	 * 1. Collects and builds filters from form items.
	 * 2. Cleans up previous results and UI state (show/hide sections, clear charts).
	 * 3. Executes API request for catalog rows.
	 * 4. Processes the results into datasets for weights, diameters, axes, and regression.
	 * 5. Instantiates and renders chart wrappers for each data category.
	 *
	 * @param {Object} form_obj - The form element or object (reserved for future use).
	 * @param {Object} [options={}] - Optional parameters.
	 * @param {boolean} [options.scroll_result=true] - Whether to scroll to results after search.
	 * @param {Object[]} [options.form_items] - Custom form items to use for filter building.
	 * @returns {Promise<Object[]>} A promise that resolves with the parsed and processed search data.
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
				self.regression_model_chart_container.replaceChildren()
				if (self.regression_model_table_container) {
					self.regression_model_table_container.replaceChildren()
				}
				if (self.regression_model_table_download) {
					self.regression_model_table_download.disabled = true
				}
				document.getElementById('regression_model_section').classList.add('hide')

			// spinner
				const result = document.getElementById('result')
				const spinner = common.create_dom_element({
					element_type	: 'div',
					class_name		: 'spinner',
					parent			: result
				})

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
				if(SHOW_DEBUG===true) {
					console.log('---> parsed_data', parsed_data)
				}

				event_manager.publish('form_submit', parsed_data)

				// Reference calculable. Filter result rows with full_coins_reference_calculable data.
				const reference_calculable = parsed_data.filter( el => {
					return el.full_coins_reference_calculable && el.full_coins_reference_calculable.length > 0
				});

				// Modelo_Regresión
				if (!IS_PRODUCTION) { // Only display in PRE from now (!)
					if (reference_calculable.length) {

						// Show hidden DOM node 'regression_model_chart_container'
						document.getElementById('regression_model_section').classList.remove('hide')

						this.plot_rev_and_anv(
							this.regression_model_chart_container,
							parsed_data,
							{
								table_container: this.regression_model_table_container,
								download_button: this.regression_model_table_download
							}
						)
							.then(() => {
								// show pdf section if available
								if (self.pdf_current) {
									requestAnimationFrame(() => {
										const pdf_section = document.getElementById('pdf_section')
										if (pdf_section) {
											pdf_section.classList.remove('hide')
										}
									})
								}
							})
							.catch((err) => {
								if(SHOW_DEBUG===true) {
									console.error('plot_rev_and_anv error:', err)
								}
							})
					}
				}
			})
			.catch((err) => {
				if(SHOW_DEBUG===true) {
					console.error('form_submit search error:', err)
				}
			})
			.finally(() => {
				spinner.remove()
			})


		return js_promise
	},

	/**
	 * Performs a search in the catalog records.
	 * @param {Object} options - Search options.
	 * @param {Object} [options.filter] - Search filter.
	 * @param {Array<string>} [options.ar_fields=['*']] - Fields to retrieve.
	 * @param {string} [options.order='norder ASC'] - Sort order.
	 * @param {number} [options.limit=100] - Result limit.
	 * @returns {Promise<Array<Object>>} A promise that resolves to the parsed catalog data.
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

		return new Promise(function(resolve, reject){
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
				.catch((err)=>{
					reject(err)
				})
		})
	},

	/**
	 * Retrieves the minimum and maximum year range from the catalog.
	 * @returns {Promise<{min: number, max: number}>}
	 */
	get_catalog_range_years : function() {

		return new Promise(function(resolve, reject){

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
				if (SHOW_DEBUG === true) {
					// console.log("-> get_catalog_range_years api_response:",api_response);
				}

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
			.catch((err)=>{
				reject(err)
			})
		})
	}, //end get_catalog_range_years

}//end analysis
