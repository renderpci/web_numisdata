/*global tstring, page_globals, SHOW_DEBUG, Promise, event_manager, catalog_row_fields, psqo_factory, $, common, page, form_factory, data_manager */
/*eslint no-undef: "error"*/

"use strict";


var catalog = {

	trigger_url			: page_globals.__WEB_TEMPLATE_WEB__ + "/catalog/trigger.catalog.php",
	search_options		: {},
	selected_term_table : null, // Like 'mints'

	// global filters
	filters		: {},
	filter_op	: "AND",
	draw_delay	: 1, // ms 390

	// form_items
	// form_items : [],

	// form factory instance
	form : null,

	// DOM containers
	rows_list_container		: null,
	export_data_container	: null,



	/**
	* SET_UP
	*/
	set_up : function(options) {

		const self = this

		// options
			// const global_search		= options.global_search
			const rows_list_container	= options.rows_list_container
			const export_data_container	= options.export_data_container
			const form_items_container	= options.form_items_container
			const psqo					= options.psqo

		// fix
			self.rows_list_container	= rows_list_container
			self.export_data_container	= export_data_container
			self.form_items_container	= form_items_container

		// mints selector
			// 		const select = self.draw_select({
			// 			data		: response.result,
			// 			term_table	: "mints",
			// 			filter_id 	: "mints",
			// 			default		: [{section_id:'0',name:"Select mint"}],
			// 			filter 		: function(item) {
			// 				// filter
			// 					const filter_value = {
			// 						"OR": []
			// 					}

			// 				// parents
			// 					const parents = item.parents ? JSON.parse(item.parents) : null
			// 					if (parents) {
			// 						for (let j = 0; j < parents.length; j++) {
			// 							filter_value["OR"].push({
			// 								'field' : 'section_id',
			// 								'value' : `${parents[j]}`,
			// 								'op' 	: '='
			// 							})
			// 						}
			// 					}

			// 				// self
			// 					filter_value["OR"].push({
			// 						'field' : 'section_id',
			// 						'value' : `${item.section_id}`,
			// 						'op' 	: '='
			// 					})

			// 				// childrens
			// 					filter_value["OR"].push({
			// 						'field' : 'parents',
			// 						'value' : `'%"${item.section_id}"%'`,
			// 						'op' 	: 'LIKE'
			// 					})

			// 				return filter_value
			// 			}
			// 		})

			// 	container.appendChild(select)
			// })

		// load periods list
			// self.load_period_list().then(function(response){

			// 	// periods selector
			// 		const select = self.draw_select({
			// 			data		: response.result,
			// 			term_table	: "ts_period",
			// 			filter_id 	: "period",
			// 			default		: [{section_id:'0',name:"Select period"}],
			// 			filter 		: function(item) {

			// 				// filter
			// 					const filter_value = {
			// 						"OR": []
			// 					}

			// 				// parents
			// 					const parents = item.parents ? JSON.parse(item.parents) : null
			// 					if (parents) {
			// 						for (let j = 0; j < parents.length; j++) {
			// 							filter_value["OR"].push({
			// 								'field' : 'section_id',
			// 								'value' : `${parents[j]}`,
			// 								'op' 	: '='
			// 							})
			// 						}
			// 					}

			// 				// self
			// 					filter_value["OR"].push({
			// 						'field' : 'section_id',
			// 						'value' : `${item.section_id}`,
			// 						'op' 	: '='
			// 					})

			// 				// childrens
			// 					filter_value["OR"].push({
			// 						'field' : 'parents',
			// 						'value' : `'%"${item.section_id}"%'`,
			// 						'op' 	: 'LIKE'
			// 					})

			// 				return filter_value
			// 			}
			// 		})

			// 	container.appendChild(select)
			// })

		// load material list
			// self.load_material_list().then(function(response){

			// 	// material selector
			// 		const select = self.draw_select({
			// 			data		: response.result,
			// 			term_table	: "type",
			// 			filter_id 	: "material",
			// 			default		: [{section_id:'0',name:"Select material"}],
			// 			filter 		: function(item) {

			// 					console.log("item:",item);

			// 				// filter
			// 					const filter_value = {
			// 						"OR": []
			// 					}

			// 				// parents
			// 					const parents = item.parents ? JSON.parse(item.parents) : null
			// 					if (parents) {
			// 						for (let j = 0; j < parents.length; j++) {
			// 							filter_value["OR"].push({
			// 								'field' : 'section_id',
			// 								'value' : `${parents[j]}`,
			// 								'op' 	: '='
			// 							})
			// 						}
			// 					}

			// 				// self
			// 					filter_value["OR"].push({
			// 						'field' : 'ref_type_material_data',
			// 						'value' : `${item.section_id}`,
			// 						'op' 	: '='
			// 					})

			// 				// // childrens
			// 				// 	filter_value["OR"].push({
			// 				// 		'field' : 'parents',
			// 				// 		'value' : `'%"${item.section_id}"%'`,
			// 				// 		'op' 	: 'LIKE'
			// 				// 	})

			// 				return filter_value
			// 			}
			// 		})

			// 	container.appendChild(select)
			// })

		// form
			const form_node = self.render_form()
			self.form_items_container.appendChild(form_node)

		// first search
			if(psqo && psqo.length>1){

				// if psqo is received, recreate the original search into the current form and submit
				const decoded_psqo = psqo_factory.decode_psqo(psqo)
				if (decoded_psqo) {

					self.form.parse_psqo_to_form(decoded_psqo)

					self.form_submit(form_node, {
						scroll_result : true
					})
				}//end if (decoded_psqo)

			}else{

				// load mints list
					self.load_mint_list()
					.then(function(response){

						// pick random one value
						const mint = response.result[Math.floor(Math.random() * response.result.length)];

						// form_factory instance
						 const custom_form = new form_factory()
						 const mint_item = custom_form.item_factory({
							id			: "mint",
							name		: "mint",
							label		: tstring.mint || "mint",
							q_column	: "p_mint",
							eq			: "=",
							eq_in		: "",
							eq_out		: "",
							q  			: `["${mint.name}"]`,
							is_term		: true
						})
						// console.log("custom_form.form_items", [a]);
						self.form_submit(form_node, {
							form_items		: [mint_item],
							scroll_result	: true
						})
					})
			}


		return true
	},//end set_up



	/**
	* RENDER_FORM
	*/
	render_form : function() {

		const self = this

		const fragment = new DocumentFragment()

		// form_factory instance
			self.form = self.form || new form_factory()

		const form_row = common.create_dom_element({
			element_type	: "div",
			class_name 		: "form-row fields",
			parent 			: fragment
		})


		// global_search
			self.form.item_factory({
				id 			: "global_search",
				name 		: "global_search",
				label		: tstring.global_search || "global_search",
				q_column 	: "global_search",
				eq 			: "MATCH",
				eq_in 		: "",
				eq_out 		: "",
				// q_table 	: "mints",
				class_name	: 'global_search',
				parent		: form_row,
				callback	: function(form_item) {
					const node_input = form_item.node_input

					const button_info = common.create_dom_element({
						element_type	: "div",
						class_name		: "search_operators_info",
						parent			: node_input.parentNode
					})

					let operators_info
					button_info.addEventListener('click', function(event) {
						event.stopPropagation()
						if (operators_info) {
							operators_info.remove()
							operators_info = null
							return
						}
						operators_info = self.form.full_text_search_operators_info()
						node_input.parentNode.appendChild(operators_info)
					})

					window.addEventListener('click', function(e){
						if (operators_info && !node_input.contains(e.target)){
							// Clicked outside the box
							operators_info.remove()
							operators_info = null
						}
					})
				}
			})

		// mint
			self.form.item_factory({
				id				: "mint",
				name			: "mint",
				label			: tstring.mint || "mint",
				q_column		: "p_mint",
				value_wrapper	: ['["','"]'], // to obtain ["value"] in selected value only
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

		// creator (autoridad)
			self.form.item_factory({
				id				: "role",
				name			: "role",
				label			: tstring.role || "Role",
				q_column		: "ref_type_creators_roles", //"p_creator",
				// value_wrapper	: ['["','"]'], // to obtain ["value"] in selected value only
				value_split 	: '|',
				// q_splittable 	: true,
				q_selected_eq 	: 'LIKE',
				eq_in			: "%",
				eq_out			: "%",
				is_term			: false, //true
				parent			: form_row,
				callback		: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'catalog'
					})
				}
			})

		// creator (autoridad)
			self.form.item_factory({
				id				: "creator",
				name			: "creator",
				label			: tstring.creator || "creator",
				q_column		: "ref_type_creators_full_name", //"p_creator",
				// value_wrapper	: ['["','"]'], // to obtain ["value"] in selected value only
				value_split 	: ' | ',
				// q_splittable 	: true,
				q_selected_eq 	: 'LIKE',
				eq_in			: "%",
				eq_out			: "%",
				is_term			: false, //true
				parent			: form_row,
				callback		: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'catalog'
					})
				}
			})

		// design_obverse
			self.form.item_factory({
				id			: "design_obverse",
				name		: "design_obverse",
				label		: tstring.design_obverse || "design obverse",
				q_column	: "ref_type_design_obverse",
				eq_in		: "%",
				// q_table	: "ts_period",
				is_term		: false,
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'catalog'
					})
				}
			})

		// design_reverse
			self.form.item_factory({
				id			: "design_reverse",
				name		: "design_reverse",
				label		: tstring.design_reverse || "design reverse",
				q_column	: "ref_type_design_reverse",
				eq_in		: "%",
				// q_table	: "ts_period",
				is_term		: false,
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'catalog'
					})
				}
			})

		// symbol_obverse
			self.form.item_factory({
				id			: "symbol_obverse",
				name		: "symbol_obverse",
				label		: tstring.symbol_obverse || "symbol obverse",
				q_column	: "ref_type_symbol_obverse",
				eq_in		: "%",
				// q_table	: "ts_period",
				is_term		: false,
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'catalog'
					})
				}
			})

		// symbol_reverse
			self.form.item_factory({
				id			: "symbol_reverse",
				name		: "symbol_reverse",
				label		: tstring.symbol_reverse || "symbol reverse",
				q_column	: "ref_type_symbol_reverse",
				eq_in		: "%",
				// q_table	: "ts_period",
				is_term		: false,
				parent		: form_row,
				callback	: function(form_item) {
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

		// legend_obverse
			self.form.item_factory({
				id				: "legend_obverse",
				name			: "legend_obverse",
				label			: tstring.legend_obverse || "legend obverse",
				// q_column		: "ref_type_legend_obverse",
				q_column		: "CONCAT(ref_type_legend_obverse, ' | ', ref_type_legend_transcription_obverse)",
				q_column_filter	: "ref_type_legend_transcription_obverse",
				eq_in			: "%",
				is_term			: false,
				parent			: form_row,
				callback		: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'catalog'
					})
				}
			})

		// legend_reverse
			self.form.item_factory({
				id				: "legend_reverse",
				name			: "legend_reverse",
				label			: tstring.legend_reverse || "legend reverse",
				// q_column		: "ref_type_legend_reverse",
				q_column		: "CONCAT(ref_type_legend_reverse, ' | ', ref_type_legend_transcription_reverse)",
				q_column_filter	: "ref_type_legend_transcription_reverse",
				eq_in			: "%",
				is_term			: false,
				parent			: form_row,
				callback		: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'catalog'
					})
				}
			})

		// territory
			self.form.item_factory({
				id				: "territory",
				name			: "territory",
				label			: tstring.territory || "territory",
				q_column		: "p_territory",
				q_selected_eq	: 'LIKE',
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

		// group
			self.form.item_factory({
				id 			: "group",
				name 		: "group",
				label		: tstring.group || "group",
				q_column 	: "p_group",
				eq_in 		: "%",
				// q_table 	: "ts_period",
				is_term 	: true,
				parent		: form_row,
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

		// collection (disabled by keynote note 09-03-2021)
			// self.form.item_factory({
			// 	id 			: "collection",
			// 	name 		: "collection",
			// 	q_column 	: "ref_coins_collection",
			// 	q_table 	: "any",
			// 	label		: tstring.collection || "collection",
			// 	is_term 	: false,
			// 	parent		: form_row,
			// 	callback	: function(form_item) {
			// 		self.form.activate_autocomplete({
			//			form_item	: form_item,
			//			table		: 'catalog'
			//		})
			// 	}
			// })

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

		// company (disabled by keynote note 09-03-2021)
			// self.form.item_factory({
			// 	id 			: "company",
			// 	name 		: "company",
			// 	q_column 	: "ref_coins_auction_company",
			// 	q_table 	: "types",
			// 	label		: tstring.company || "company",
			// 	is_term 	: false,
			// 	parent		: form_row,
			// 	callback	: function(form_item) {
			// 		self.form.activate_autocomplete({
			//			form_item	: form_item,
			//			table		: 'catalog'
			//		})
			// 	}
			// })

		// technique
			self.form.item_factory({
				id 			: "technique",
				name 		: "technique",
				q_column 	: "ref_type_technique",
				q_table 	: "types",
				label		: tstring.technique || "technique",
				is_term 	: false,
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'catalog'
					})
				}
			})

		// equivalents
			self.form.item_factory({
				id			: "equivalents",
				name		: "equivalents",
				q_column	: "ref_type_equivalents",
				q_table		: "types",
				eq_in		: "%",
				eq_out		: "%",
				label		: tstring.equivalents || "equivalents",
				is_term		: false,
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'catalog'
					})
				}
			})

		// period
			// self.form.item_factory({
			// 	id				: "period",
			// 	name			: "period",
			// 	label			: tstring.period || "period",
			// 	q_column		: "p_period",
			// 	value_wrapper	: ['["','"]'], // to obtain ["value"] in selected value only
			// 	eq_in			: "%",
			// 	// q_table		: "ts_period",
			// 	is_term			: true,
			// 	parent			: form_row,
			// 	callback		: function(form_item) {
			// 		self.form.activate_autocomplete({
			// 			form_item	: form_item,
			// 			table		: 'catalog'
			// 		})
			// 	}
			// })

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

		// ref_type_design_obverse_iconography_data
			self.form.item_factory({
				id				: "ref_type_design_obverse_iconography_data",
				name			: "ref_type_design_obverse_iconography_data",
				class_name		: 'hide',
				label			: tstring.ref_type_design_obverse_iconography_data || "Design obverse iconography ID",
				q_column		: "ref_type_design_obverse_iconography_data",
				q_selected_eq	: 'LIKE',
				eq_in			: '%"',
				eq_out			: '"%',
				is_term			: false,
				parent			: form_row,
				callback		: function(form_item) {
					event_manager.subscribe('form_submit', fn_check_value)
					function fn_check_value() {
						if (form_item.q && form_item.q.length>0) {
							form_item.node_input.parentNode.classList.remove('hide')
							form_item.node_input.parentNode.querySelector('input').classList.remove('hide')
						}else{
							form_item.node_input.parentNode.classList.add('hide')
						}
					}
				}
			})

		// ref_type_design_reverse_iconography_data
			self.form.item_factory({
				id				: "ref_type_design_reverse_iconography_data",
				name			: "ref_type_design_reverse_iconography_data",
				class_name		: 'hide',
				label			: tstring.ref_type_design_reverse_iconography_data || "Design reverse iconography ID",
				q_column		: "ref_type_design_reverse_iconography_data",
				q_selected_eq	: 'LIKE',
				eq_in			: '%"',
				eq_out			: '"%',
				is_term			: false,
				parent			: form_row,
				callback		: function(form_item) {
					event_manager.subscribe('form_submit', fn_check_value)
					function fn_check_value() {
						if (form_item.q && form_item.q.length>0) {
							form_item.node_input.parentNode.classList.remove('hide')
							form_item.node_input.parentNode.querySelector('input').classList.remove('hide')
						}else{
							form_item.node_input.parentNode.classList.add('hide')
						}
					}
				}
			})

		// ref_type_symbol_obverse_data
			self.form.item_factory({
				id				: "ref_type_symbol_obverse_data",
				name			: "ref_type_symbol_obverse_data",
				class_name		: 'hide',
				label			: tstring.ref_type_symbol_obverse_data || "Symbol obverse ID",
				q_column		: "ref_type_symbol_obverse_data",
				q_selected_eq	: 'LIKE',
				eq_in			: '%"',
				eq_out			: '"%',
				is_term			: false,
				parent			: form_row,
				callback		: function(form_item) {
					event_manager.subscribe('form_submit', fn_check_value)
					function fn_check_value() {
						if (form_item.q && form_item.q.length>0) {
							form_item.node_input.parentNode.classList.remove('hide')
							form_item.node_input.parentNode.querySelector('input').classList.remove('hide')
						}else{
							form_item.node_input.parentNode.classList.add('hide')
						}
					}
				}
			})

		// ref_type_symbol_reverse_data
			self.form.item_factory({
				id				: "ref_type_symbol_reverse_data",
				name			: "ref_type_symbol_reverse_data",
				class_name		: 'hide',
				label			: tstring.ref_type_symbol_reverse_data || "Symbol reverse ID",
				q_column		: "ref_type_symbol_reverse_data",
				q_selected_eq	: 'LIKE',
				eq_in			: '%"',
				eq_out			: '"%',
				is_term			: false,
				parent			: form_row,
				callback		: function(form_item) {
					event_manager.subscribe('form_submit', fn_check_value)
					function fn_check_value() {
						if (form_item.q && form_item.q.length>0) {
							form_item.node_input.parentNode.classList.remove('hide')
							form_item.node_input.parentNode.querySelector('input').classList.remove('hide')
						}else{
							form_item.node_input.parentNode.classList.add('hide')
						}
					}
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
			submit_button.addEventListener("click",function(e){
				e.preventDefault()
				self.form_submit(form)
			})

		// reset_button
			const reset_button = common.create_dom_element({
				element_type	: "input",
				type 			: "button",
				id 				: "button_reset",
				value 			: tstring.reset || 'Reset',
				class_name 		: "btn btn-light btn-block secondary button_reset",
				parent 			: submit_group
			})
			reset_button.addEventListener("click",function(e){
				e.preventDefault()
				window.location.replace(window.location.pathname); // + window.location.search + window.location.hash
			})

		// operators
			// fragment.appendChild( forms.build_operators_node() )
			const operators_node = self.form.build_operators_node()
			fragment.appendChild( operators_node )

		// form
			const form = common.create_dom_element({
				element_type	: "form",
				id 				: "search_form",
				class_name 		: "form-inline"
			})
			form.appendChild(fragment)



		return form
	},//end render_form



	/**
	* LOAD_MINT_LIST
	* @return promise
	*/
	load_mint_list : function() {

		const js_promise = data_manager.request({
			body : {
				dedalo_get 	: 'records',
				table 		: 'catalog',
				ar_fields 	: ['section_id','term AS name','parents'],
				// sql_fullselect : 'DISTINCT term, '
				lang 		: page_globals.WEB_CURRENT_LANG_CODE,
				limit 		: 0,
				count 		: false,
				order 		: 'term ASC',
				sql_filter  : 'term_table=\'mints\''
			}
		})

		return js_promise
	},//end load_mint_list



	/**
	* LOAD_PERIOD_LIST
	* @return promise
	*/
		// load_period_list : function() {

		// 	const js_promise = data_manager.request({
		// 		body : {
		// 			dedalo_get 	: 'records',
		// 			table 		: 'catalog',
		// 			ar_fields 	: ['section_id','term AS name','parents'],
		// 			// sql_fullselect : 'DISTINCT term, '
		// 			lang 		: page_globals.WEB_CURRENT_LANG_CODE,
		// 			limit 		: 0,
		// 			count 		: false,
		// 			order 		: 'term ASC',
		// 			sql_filter  : 'term_table=\'ts_period\''
		// 		}
		// 	})

		// 	return js_promise
		// },//end load_period_list



	/**
	* LOAD_MATERIAL_LIST
	* @return promise
	*/
		// load_material_list : async function() {

		// 	// search base . Gets list of values for real table like 'materials'
		// 		const search_base = await data_manager.request({
		// 			body : {
		// 				dedalo_get 	: 'records',
		// 				table 		: 'material',
		// 				ar_fields 	: ['section_id','CONCAT(term, " | ", symbol) AS name'],
		// 				lang 		: page_globals.WEB_CURRENT_LANG_CODE,
		// 				limit 		: 0,
		// 				count 		: false,
		// 				order 		: 'name ASC',
		// 				sql_filter  : ''
		// 			}
		// 		})

		// 	// search secondary. Gets main table matches
		// 		const search_secondary = await data_manager.request({
		// 			body : {
		// 				dedalo_get 	: 'records',
		// 				table 		: 'catalog',
		// 				ar_fields 	: ['section_id', 'ref_type_material_data'],
		// 				lang 		: page_globals.WEB_CURRENT_LANG_CODE,
		// 				limit 		: 0,
		// 				count 		: false,
		// 				order 		: 'section_id ASC',
		// 				sql_filter  : search_base.result.map(item => "`ref_type_material_data` LIKE '%\"" + item.section_id + "\"%'").join(" OR ")
		// 			}
		// 		})

		// 	// add to search_base the secondary results
		// 		const ar_mix = search_base.result.map(item => {

		// 			const types = search_secondary.result.filter( el => el.ref_type_material_data==="[\"" + item.section_id +"\"]" )
		// 			item.types  = types.map(el => el.section_id)

		// 			return item
		// 		})

		// 	// final response object
		// 		const response = {
		// 			result : ar_mix
		// 		}

		// 	return response
		// },//end load_material_list



	/**
	* DRAW_SELECT
	* @return promise
	*/
		// draw_select : function(options) {

		// 	const self = this

		// 	const filter_id 		= options.filter_id
		// 	const data 			  	= options.data
		// 	const term_table		= options.term_table
		// 	const options_default	= options.default || [{section_id:'0',name:"Select option"}]

		// 	const fragment = new DocumentFragment()

		// 	// prepend empty option
		// 		const elements = options_default.concat(data)

		// 	// iterate option
		// 		const elements_length = elements.length
		// 		for (let i = 0; i < elements_length; i++) {

		// 			const item = elements[i]

		// 			const filter_value = options.filter(item)

		// 			common.create_dom_element({
		// 				element_type	: 'option',
		// 				value 			: JSON.stringify(filter_value),
		// 				text_content 	: item.name,
		// 				parent 			: fragment
		// 			})
		// 		}

		// 	// select node
		// 		const select = common.create_dom_element({
		// 			  element_type 	: "select",
		// 			  class_name 	: "select_" + term_table
		// 		})
		// 		select.addEventListener("change", function(e){

		// 			const value = e.target.value
		// 			if (!value) return false

		// 			// fix selected term_table (start point)
		// 				self.selected_term_table = term_table

		// 			// clean container and add_spinner
		// 				const container = document.querySelector("#rows_list")
		// 				while (container.hasChildNodes()) {
		// 					container.removeChild(container.lastChild);
		// 				}
		// 				page.add_spinner(container)

		// 			// search
		// 				const filter = JSON.parse(value)

		// 				// fix global_filter value (!)
		// 					self.filters[filter_id] = filter
		// 						console.log("self.filters:",self.filters);

		// 				const search_promise = self.search_rows({
		// 					limit	: 0
		// 				})

		// 			// draw response rows
		// 				search_promise.then(function(response){
		// 					setTimeout(()=>{
		// 						self.draw_rows({
		// 							target  : 'rows_list',
		// 							ar_rows : response.result
		// 						})
		// 					}, self.draw_delay)
		// 				})
		// 		})
		// 		select.appendChild(fragment)


		// 	return select
		// },//end draw_select



	/**
	* FORM_SUBMIT
	* Form submit launch search
	*/
	form_submit : function(form_obj, options={}) {

		const self = this

		// options
			const scroll_result	= typeof options.scroll_result==="boolean" ? options.scroll_result : true
			const form_items	= options.form_items || self.form.form_items

		// node containers
			const container_rows_list	= self.rows_list_container // div_result.querySelector("#rows_list")
			const div_result			= container_rows_list.parentNode // document.querySelector(".result")

		// spinner add
			const spinner = common.create_dom_element({
				element_type	: "div",
				class_name		: "spinner",
				parent			: div_result
			})

		// loading set css
			container_rows_list.classList.add("loading")


		// build filter
			const filter = self.form.build_filter({
				form_items : form_items
			})

		// empty filter case
			if (!filter || filter.length<1) {
				spinner.remove()
				container_rows_list.classList.remove("loading")
				return false;
			}

		// export_data_buttons added once
			if (!self.export_data_buttons) {
				self.export_data_buttons = page.render_export_data_buttons()
				self.export_data_container.appendChild(self.export_data_buttons)
				self.export_data_container.classList.add("hide")

				//suggestions_form_button
				const contact_form_button = page.create_suggestions_button()
				self.export_data_container.appendChild(contact_form_button)
			}

		// scrool to head result
			if (div_result && scroll_result===true) {
				div_result.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
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

				// draw
				// clean container_rows_list and add_spinner
					while (container_rows_list.hasChildNodes()) {
						container_rows_list.removeChild(container_rows_list.lastChild);
					}
					container_rows_list.classList.remove("loading")
					spinner.remove()

				// draw rows
					self.draw_rows({
						target  : self.rows_list_container,
						ar_rows : parsed_data
					})
					.then(function(){
						self.export_data_container.classList.remove("hide")
					})
			})


		return js_promise
	},//end form_submit



	/**
	* FORM_SUBMIT_OLD
	* Form submit launch search
	*/
		// form_submit_OLD : function(form_obj, options={}) {

		// 	const self = this

		// 	// options
		// 		const scroll_result	= typeof options.scroll_result==="boolean" ? options.scroll_result : true
		// 		const form_items	= options.form_items || self.form.form_items

		// 	const container_rows_list	= self.rows_list_container //	div_result.querySelector("#rows_list")
		// 	const div_result			= container_rows_list.parentNode // document.querySelector(".result")

		// 	// spinner add
		// 		// page.add_spinner(div_result)
		// 		const spinner = common.create_dom_element({
		// 			element_type	: "div",
		// 			class_name		: "spinner",
		// 			parent			: div_result
		// 		})

		// 	// ar_is_term
		// 		const ar_is_term = []
		// 		for (let [id, form_item] of Object.entries(form_items)) {
		// 			if (form_item.is_term===true) ar_is_term.push(form_item)
		// 		}

		// 	const ar_query_elements = []
		// 	for (let [id, form_item] of Object.entries(form_items)) {

		// 		const current_group = []

		// 		const group_op = (form_item.is_term===true) ? "$or" : "$and"
		// 		const group = {}
		// 			  group[group_op] = []

		// 		// q value
		// 			if (form_item.q.length>0) {

		// 				const c_group_op = '$and'
		// 				const c_group = {}
		// 					  c_group[c_group_op] = []

		// 				  const safe_value = (typeof form_item.q==='string' || form_item.q instanceof String)
		// 					  ? form_item.q.replace(/(')/g, "''")
		// 					  : form_item.q

		// 				// q element
		// 					const element = {
		// 						field	: form_item.q_column,
		// 						value	: `'%${safe_value}%'`,
		// 						op		: form_item.eq // default is 'LIKE'
		// 					}

		// 					c_group[c_group_op].push(element)

		// 				// q_table element
		// 					// if (form_item.q_table && form_item.q_table!=="any") {

		// 					// 	const element_table = {
		// 					// 		field	: form_item.q_table_name,
		// 					// 		value	: `'${form_item.q_table}'`,
		// 					// 		op		: '='
		// 					// 	}

		// 					// 	c_group[c_group_op].push(element_table)
		// 					// }

		// 				// add basic group
		// 					group[group_op].push(c_group)

		// 				// is_term
		// 					// const t_group_op = 'AND'
		// 					// const t_group = {}
		// 					// 	  t_group[t_group_op] = []

		// 					// if (form_item.is_term===true) {

		// 					// 	const element = {
		// 					// 		field	: 'parents_text',
		// 					// 		value	: `'%${form_item.q}%'`,
		// 					// 		op		: 'LIKE',
		// 					// 		debug_name 	: form_item.name
		// 					// 	}
		// 					// 	t_group[t_group_op].push(element)

		// 					// }else{

		// 					// 	for (let g = 0; g < ar_is_term.length; g++) {
		// 					// 		const is_term_item = ar_is_term[g]

		// 					// 		if (is_term_item.q.length<1) continue

		// 					// 		const element = {
		// 					// 			field	: 'parents_text',
		// 					// 			value	: `'%${is_term_item.q}%'`,
		// 					// 			op		: 'LIKE',
		// 					// 			debug_name 	: form_item.name
		// 					// 		}
		// 					// 		t_group[t_group_op].push(element)
		// 					// 	}
		// 					// }

		// 					// if (t_group[t_group_op].length>0) {
		// 					// 	group[group_op].push(t_group)
		// 					// }
		// 			}

		// 		// q_selected values
		// 			if (form_item.q_selected.length>0) {

		// 				for (let j = 0; j < form_item.q_selected.length; j++) {

		// 					// value
		// 						const value = form_item.q_selected[j]

		// 						// escape html strings containing single quotes inside.
		// 						// Like 'leyend <img data="{'lat':'452.6'}">' to 'leyend <img data="{''lat'':''452.6''}">'
		// 						const safe_value = value.replace(/(')/g, "''")

		// 					const c_group_op = "$and"
		// 					const c_group = {}
		// 						  c_group[c_group_op] = []

		// 					// elemet
		// 					const element = {
		// 						field	: form_item.q_column,
		// 						value	: (form_item.is_term===true) ? `'%"${safe_value}"%'` : `'${safe_value}'`,
		// 						op		: (form_item.is_term===true) ? "LIKE" : "="
		// 					}
		// 					c_group[c_group_op].push(element)

		// 					// q_table element
		// 						// if (form_item.q_table && form_item.q_table!=="any") {

		// 						// 	const element_table = {
		// 						// 		field	: form_item.q_table_name,
		// 						// 		value	: `'${form_item.q_table}'`,
		// 						// 		op		: '='
		// 						// 	}

		// 						// 	c_group[c_group_op].push(element_table)
		// 						// }

		// 					group[group_op].push(c_group)
		// 				}
		// 			}

		// 		if (group[group_op].length>0) {
		// 			ar_query_elements.push(group)
		// 		}
		// 	}

		// 	// debug
		// 		if(SHOW_DEBUG===true) {
		// 			// console.log("self.form_items:",self.form_items);
		// 			// console.log("ar_query_elements:",ar_query_elements);
		// 		}

		// 	// empty form case
		// 		if (ar_query_elements.length<1) {
		// 			// self.form_items.mint.node_input.focus()
		// 			// page.remove_spinner(div_result)
		// 			spinner.remove()
		// 			return false;
		// 		}

		// 	// export_data_buttons added once
		// 		if (!self.export_data_buttons) {
		// 			self.export_data_buttons = page.render_export_data_buttons()
		// 			self.export_data_container.appendChild(self.export_data_buttons)
		// 			self.export_data_container.classList.add("hide")
		// 		}

		// 	// loading set css
		// 		container_rows_list.classList.add("loading")

		// 	// scrool to head result
		// 		if (div_result && scroll_result===true) {
		// 			div_result.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
		// 		}

		// 	// operators value
		// 		const operators_value = form_obj.querySelector('input[name="operators"]:checked').value;
		// 			// console.log("operators_value:",operators_value);

		// 		const filter = {}
		// 			  filter[operators_value] = ar_query_elements


		// 	// search rows exec against API
		// 		const js_promise = self.search_rows({
		// 			filter			: filter,
		// 			limit			: 0,
		// 			process_result	: {
		// 				fn 		: 'process_result::add_parents_and_children_recursive',
		// 				columns : [{name : "parents"}]
		// 			}
		// 		})
		// 		.then((parsed_data)=>{
		// 			// if(SHOW_DEBUG===true) {
		// 				// console.log("--- form_submit_OLD response:", parsed_data)
		// 			// }

		// 			// draw
		// 				// clean container_rows_list and add_spinner
		// 					while (container_rows_list.hasChildNodes()) {
		// 						container_rows_list.removeChild(container_rows_list.lastChild);
		// 					}
		// 					container_rows_list.classList.remove("loading")
		// 					// page.remove_spinner(div_result)
		// 					spinner.remove()

		// 				// draw rows
		// 					self.draw_rows({
		// 						target  : self.rows_list_container,
		// 						ar_rows : parsed_data
		// 					})
		// 					.then(function(){
		// 						// // scrool to head result
		// 						// 	if (response.result.length>0) {
		// 						// 		const div_result = document.querySelector(".result")
		// 						// 		if (div_result) {
		// 						// 			div_result.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
		// 						// 		}
		// 						// 	}
		// 						self.export_data_container.classList.remove("hide")
		// 					})
		// 		})


		// 	return js_promise
		// },//end form_submit_OLD



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
				// old
					// const parse_sql_filter = function(filter){

					// 	if (filter) {

					// 		const op		= Object.keys(filter)[0]
					// 		const ar_query	= filter[op]

					// 		const ar_filter = []
					// 		const ar_query_length = ar_query.length
					// 		for (let i = 0; i < ar_query_length; i++) {

					// 			const item = ar_query[i]
					// 				console.log("------------- item:",item);



					// 			const item_op = Object.keys(item)[0]
					// 			if(item_op==="$and" || item_op==="$or") {

					// 				const current_filter_line = "" + parse_sql_filter(item) + ""
					// 				ar_filter.push(current_filter_line)
					// 				continue;
					// 			}

					// 			// const filter_line = (item.field.indexOf("AS")!==-1)
					// 			// 	? "" +item.field+""  +" "+ item.op +" "+ item.value
					// 			// 	: "`"+item.field+"`" +" "+ item.op +" "+ item.value

					// 			let filter_line
					// 			if (item.op==='MATCH') {
					// 				filter_line = "MATCH (" + item.field + ") AGAINST ("+item.value+" IN BOOLEAN MODE)"
					// 			}else{
					// 				filter_line = (item.field.indexOf("AS")!==-1)
					// 					? "" +item.field+""  +" "+ item.op +" "+ item.value
					// 					: "`"+item.field+"`" +" "+ item.op +" "+ item.value
					// 			}

					// 			ar_filter.push(filter_line)

					// 			// group
					// 				if (item.group) {
					// 					group.push(item.group)
					// 				}
					// 		}

					// 		const boolean_op = (op === '$and')
					// 			? 'AND'
					// 			: (op === '$or')
					// 				? 'OR'
					// 				: null

					// 		return ar_filter.join(" "+boolean_op+" ")
					// 	}

					// 	return null
					// }

			// parsed_filters
				const sql_filter = self.form.parse_sql_filter(filter)
				// const sql_filter = filter
				// console.log("Final sql_filter:", sql_filter);

			// debug
				if(SHOW_DEBUG===true) {
					// console.log("--- search_rows parsed sql_filter:")
					// console.log(sql_filter)
				}

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
					// console.log("++++++++++++ request_body:",request_body);
					// console.log("--- search_rows API response:",response);

					// data parsed
					const data = page.parse_catalog_data(response.result)

					// send event data_request_done (used by buttons download)
					event_manager.publish('data_request_done', {
						request_body		: request_body,
						result				: data,
						export_data_parser	: page.export_parse_catalog_data,
						filter 				: filter
					})

					resolve(data)
				})
		})
	},//end search_rows



	/**
	* DRAW_ROWS
	*/
	draw_rows : function(options) {
		// console.log("draw_rows options:",options);

		const self = this

		// options
			const target	= options.target // self.rows_list_container
			const ar_rows	= options.ar_rows || []

		return new Promise(function(resolve){

			// pagination vars
				// const total		= self.search_options.total
				// const limit		= self.search_options.limit
				// const offset	= self.search_options.offset

			// container select and clean container div
				const container = target

			// no_results_found check
				const ar_rows_length = ar_rows.length
				if (ar_rows_length<1) {

					while (container.hasChildNodes()) {
						container.removeChild(container.lastChild);
					}
					// node_no_results_found
					common.create_dom_element({
						element_type	: 'div',
						class_name		: "no_results_found",
						inner_html		: tstring.no_results_found || "No results found",
						parent			: container
					})

					// scrool to head again
						window.scrollTo(0, 0);

					resolve(container)
					return false
				}

			// add_spinner
				// page.add_spinner(container)

			// const render_nodes = async () => {
				const render_nodes = async function() {

					const fragment = new DocumentFragment();

					const ar_mints = ar_rows.filter(item => item.term_table==='mints')

					const ar_parent = []
					for (let i = 0; i < ar_mints.length; i++) {
						const parent = (ar_mints[i].parent && typeof ar_mints[i].parent[0]!=="undefined")
							? ar_mints[i].parent[0]
							: null
						const mint_parent = parent
							? ar_rows.find(item => item.section_id==parent)
							: null
						if(!mint_parent){
							console.warn("mint don't have public parent:",ar_mints[i]);
							continue
						}
						// check if the parent is inside the ar_aprents, if not push inside else nothing
						const unique_parent = ar_parent.find(item => item.section_id==parent)
						if(typeof unique_parent==='undefined'){
							ar_parent.push(mint_parent)
						}
					}
					self.parents = ar_parent
					// create the nodes with the unique parents: ar_parents
					for (let i = 0; i < ar_parent.length; i++) {
						// render_mints
						self.get_children(ar_rows, ar_parent[i], fragment)
					}

					// sort rows
						// let collator = new Intl.Collator('es',{ sensitivity: 'base', ignorePunctuation:true});
						// ar_rows.sort( (a,b) => {
						// 		let order_a = a.autoria +" "+ a.fecha_publicacion
						// 		let order_b = b.autoria +" "+ b.fecha_publicacion
						// 		//console.log("order_a",order_a, order_b);
						// 		//console.log(collator.compare(order_a , order_b));
						// 	return collator.compare(order_a , order_b)
						// });

					return fragment
				}

			render_nodes()
			.then(fragment => {

				while (container.hasChildNodes()) {
					container.removeChild(container.lastChild);
				}

				// bulk fragment nodes to container
				container.appendChild(fragment)

				// activate images lightbox
					setTimeout(function(){
						const images_gallery_containers = container
						page.activate_images_gallery(images_gallery_containers, true)
					}, 600)

				resolve(container)
			})

			return true
		})
	},//end draw_rows



	get_children : function(ar_rows, parent, parent_node){

		const self = this

		const children = parent.children

		// wrapper
			const catalog_row_wrapper = common.create_dom_element({
				element_type	: "div",
				class_name		: "children_contanier"
			})
			parent_node.appendChild( catalog_row_wrapper )

		if(children){
			for (let i = 0; i < children.length; i++) {

				const finded = self.parents.find(el => el.section_id == children[i])

				if(finded){
					continue
				}

				self.get_child(ar_rows, children[i], catalog_row_wrapper)
			}
		}
	},

	get_child : function(ar_rows, section_id, parent_node){

		const self = this

		const row_object 	= ar_rows.find(item => item.section_id==section_id)

		if (row_object) {
			const row_node 	= self.render_rows(row_object, ar_rows)
			parent_node.appendChild( row_node )

			if(row_object.children){
				self.get_children(ar_rows, row_object, row_node)
				row_node.addEventListener('mouseup', (event) => {
					event.preventDefault()
					const target = event.target.tagName === 'SPAN'
						? event.target.parentNode
						: event.target
						// console.log("event.target:",event.target);
					if (target === row_node.firstChild ){
						const children_node = row_node.querySelector('.children_contanier')
						children_node.classList.toggle("hide")
					}

				}, false);
			}
		}
	},



	render_rows : function(row_object, ar_rows){

		// Build dom row
		// item row_object
			// const row_object = ar_rows[i]

			if(SHOW_DEBUG===true) {
				// console.log("i row_object:", i, row_object);
			}

		// fix and set rows to catalog_row_fields
			catalog_row_fields.ar_rows = ar_rows

		// catalog_row_fields set
			const node = catalog_row_fields.draw_item(row_object)

		return node
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



}//end catalog
