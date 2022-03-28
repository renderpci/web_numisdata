/*global tstring, form_factory, psqo_factory, list_factory, coins_row_fields, Promise, SHOW_DEBUG, common, page, data_manager, event_manager */
/*eslint no-undef: "error"*/

"use strict";



var coins =  {



	/**
	* VARS
	*/
		form			: null,
		pagination		: null,
		list			: null,
		form_node		: null,
		// DOM items ready from page html
		form_container	: null,
		rows_container	: null,



	/**
	* SET_UP
	* When the HTML page is loaded
	* @param object options
	*/
	set_up : function(options) {

		const self = this

		// options
			self.form_container	= options.form_container
			self.rows_container	= options.rows_container
			const psqo			= options.psqo

		// pagination
			self.pagination = {
				total	: null,
				limit	: 100,
				offset	: 0,
				n_nodes	: 8
			}

		// form
			self.form		= new form_factory()
			const form_node	= self.render_form()
			self.form_container.appendChild(form_node)

		// form submit
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

				// autoload first time
				self.form_submit()
			}


		// events
			event_manager.subscribe('paginate', paginate)
			function paginate(offset) {
				// updates pagination.offset
				self.pagination.offset = offset
				// submit again
				self.form_submit()
			}


		return true
	},//end set_up



	/**
	* RENDER_FORM
	*/
	render_form : function() {

		const self = this

		const fragment = new DocumentFragment()

		const form_row = common.create_dom_element({
			element_type	: "div",
			class_name 		: "form-row fields",
			parent 			: fragment
		})

		// mint
			self.form.item_factory({
				id			: "mint",
				name		: "mint",
				label		: tstring.mint || "mint",
				q_column	: "mint_name",
				eq			: "LIKE",
				eq_in		: "%",
				eq_out		: "%",
				is_term		: true,
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'coins'
					})
				}
			})

		// collection
			self.form.item_factory({
				id			: "collection",
				name		: "collection",
				label		: tstring.collection || "collection",
				q_column	: "collection",
				eq			: "LIKE",
				eq_in		: "%",
				eq_out		: "%",
				is_term		: true,
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'coins'
					})
				}
			})

		// ref_auction
			self.form.item_factory({
				id				: "ref_auction",
				name			: "ref_auction",
				label			: tstring.auction || "auction",
				q_column		: "ref_auction",
				eq				: "LIKE",
				eq_in			: "%",
				eq_out			: "%",
				value_wrapper	: ['["','"]'],
				parent			: form_row,
				callback		: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'coins'
					})
				}
			})

		// number
			self.form.item_factory({
				id 			: "number",
				name 		: "number",
				q_column 	: "number",
				label		: tstring.number || "number",
				is_term 	: false,
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'coins'
					})
				}
			})

		// type
			self.form.item_factory({
				id				: "type_full_value",
				name			: "type_full_value",
				q_column		: "type_full_value",
				label			: tstring.type || "type",
				value_split		: ' - ',
				q_splittable	: true,
				q_selected_eq	: 'LIKE',
				eq_in			: "%",
				eq_out			: "%",
				is_term			: false,
				parent			: form_row,
				callback		: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'coins'
					})
				}
			})

		// material
			self.form.item_factory({
				id				: "material",
				name			: "material",
				label			: tstring.material || "Material",
				q_column		: "material",
				eq				: "LIKE",
				value_split		: ' | ',
				q_splittable	: true,
				q_selected_eq	: 'LIKE',
				eq_in			: "%",
				eq_out			: "%",
				parent			: form_row,
				callback		: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'coins'
					})
				}
			})

		// technique
			// 	self.form.item_factory({
			// 		id 			: "technique",
			// 		name 		: "technique",
			// 		q_column 	: "ref_type_technique",
			// 		q_table 	: "types",
			// 		label		: tstring.technique || "technique",
			// 		is_term 	: false,
			// 		parent		: form_row,
			// 		callback	: function(form_item) {
			// 			self.form.activate_autocomplete({
			// 				form_item	: form_item,
			// 				table		: 'catalog'
			// 			})
			// 		}
			// 	})

		// denomination
			self.form.item_factory({
				id				: "denomination",
				name			: "denomination",
				label			: tstring.denomination || "Denomination",
				q_column		: "denomination",
				value_split		: ' | ',
				q_splittable	: true,
				q_selected_eq	: 'LIKE',
				eq_in			: "%",
				eq_out			: "%",
				parent			: form_row,
				callback		: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'coins'
					})
				}
			})

		// section_id
			self.form.item_factory({
				id			: "section_id",
				name		: "section_id",
				label		: tstring.id || "ID",
				q_column	: "section_id",
				eq			: "=",
				eq_in		: "",
				eq_out		: "",
				parent		: form_row
			})

		// hoard
			self.form.item_factory({
				id			: "hoard",
				name		: "hoard",
				label		: tstring.hoard || "hoard",
				q_column	: "hoard",
				eq			: "LIKE",
				eq_in		: "%",
				eq_out		: "%",
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'coins'
					})
				}
			})

		// findspot
			self.form.item_factory({
				id			: "findspot",
				name		: "findspot",
				label		: tstring.findspot || "findspot",
				q_column	: "findspot",
				eq			: "LIKE",
				eq_in		: "%",
				eq_out		: "%",
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'coins'
					})
				}
			})

		// public_info
			// 	self.form.item_factory({
			// 		id 			: "public_info",
			// 		name 		: "public_info",
			// 		q_column 	: "public_info",
			// 		label		: tstring.public_info || "Public info",
			// 		is_term 	: false,
			// 		parent		: form_row,
			// 		callback	: function(form_item) {
			// 			self.form.activate_autocomplete({
			// 				form_item	: form_item,
			// 				table		: 'coins'
			// 			})
			// 		}
			// 	})

		// countermark_obverse
			self.form.item_factory({
				id			: "countermark_obverse",
				name		: "countermark_obverse",
				label		: tstring.countermark_obverse || "Countermark obverse",
				q_column	: "countermark_obverse",
				eq_in		: "%",
				is_term		: false,
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'coins'
					})
				}
			})

		// countermark_reverse
			self.form.item_factory({
				id			: "countermark_reverse",
				name		: "countermark_reverse",
				label		: tstring.countermark_reverse || "Countermark reverse",
				q_column	: "countermark_reverse",
				eq_in		: "%",
				is_term		: false,
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'coins'
					})
				}
			})

		// equivalents
			// 	self.form.item_factory({
			// 		id			: "equivalents",
			// 		name		: "equivalents",
			// 		q_column	: "ref_type_equivalents",
			// 		eq_in		: "%",
			// 		eq_out		: "%",
			// 		label		: tstring.equivalents || "equivalents",
			// 		is_term		: false,
			// 		parent		: form_row,
			// 		callback	: function(form_item) {
			// 			self.form.activate_autocomplete({
			// 				form_item	: form_item,
			// 				table		: 'types'
			// 			})
			// 		}
			// 	})

		// bibliography_author
			self.form.item_factory({
				id				: "bibliography_author",
				name			: "bibliography_author",
				q_column		: "bibliography_author",
				label			: tstring.authorship || "Authorship",
				value_split		: ' | ',
				q_splittable	: true,
				q_selected_eq	: 'LIKE',
				eq_in			: "%",
				eq_out			: "%",
				is_term			: false,
				parent			: form_row,
				callback		: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'coins'
					})
				}
			})

		// bibliography_title
			self.form.item_factory({
				id				: "bibliography_title",
				name			: "bibliography_title",
				q_column		: "bibliography_title",
				label			: tstring.bibliography || "Bibliography",
				value_split		: ' | ',
				q_splittable	: true,
				q_selected_eq	: 'LIKE',
				eq_in			: "%",
				eq_out			: "%",
				is_term			: false,
				parent			: form_row,
				callback		: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'coins'
					})
				}
			})

		// countermark_obverse_data
			self.form.item_factory({
				id				: "countermark_obverse_data",
				name			: "countermark_obverse_data",
				class_name		: 'hide',
				label			: "countermark_obverse_data",
				q_column		: "countermark_obverse_data",
				q_selected_eq	: 'LIKE',
				eq_in			: '%"',
				eq_out			: '"%',
				is_term			: false,
				parent			: form_row
			})

		// countermark_reverse_data
			self.form.item_factory({
				id				: "countermark_reverse_data",
				name			: "countermark_reverse_data",
				class_name		: 'hide',
				label			: "countermark_reverse_data",
				q_column		: "countermark_reverse_data",
				q_selected_eq	: 'LIKE',
				eq_in			: '%"',
				eq_out			: '"%',
				is_term			: false,
				parent			: form_row
			})


		// submit button
			const submit_group = common.create_dom_element({
				element_type	: "div",
				class_name 		: "form-group field button_submit",
				parent 			: fragment
			})
			const submit_button = common.create_dom_element({
				element_type	: "input",
				type 			: "submit",
				id 				: "submit",
				value 			: tstring.search || "Search",
				class_name 		: "btn btn-light btn-block primary",
				parent 			: submit_group
			})
			submit_button.addEventListener("click",function(e){
				e.preventDefault()
				self.pagination = {
					total	: null,
					limit	: 100,
					offset	: 0,
					n_nodes	: 8
				}
				self.form_submit()
			})

		// operators
			// fragment.appendChild( forms.build_operators_node() )
			const operators_node = self.form.build_operators_node()
			fragment.appendChild( operators_node )

		// form_node
			self.form.node = common.create_dom_element({
				element_type	: "form",
				id				: "search_form",
				class_name		: "form-inline form_factory"
			})
			self.form.node.appendChild(fragment)


		return self.form.node
	},//end render_form



	/**
	* FORM_SUBMIT
	*/
	form_submit : function() {

		const self = this

		const form_node = self.form.node
		if (!form_node) {
			return new Promise(function(resolve){
				console.error("Error on submit. Invalid form_node.", form_node);
				resolve(false)
			})
		}

		const rows_container = self.rows_container

		// loading start
			if (!self.pagination.total) {
				page.add_spinner(rows_container)
			}else{
				rows_container.classList.add("loading")
			}

		return new Promise(function(resolve){

			const table		= 'coins'
			const ar_fields	= ['*']
			const limit		= self.pagination.limit
			const offset	= self.pagination.offset
			const count		= true
			const order		= "type IS NULL, type ASC"
			// const resolve_portals_custom = {"mint_data" : "mints"}

			// sql_filter
				const filter = self.form.build_filter()
				// parse_sql_filter
				const group			= []
				const parsed_filter	= self.form.parse_sql_filter(filter, group)
				const sql_filter	= parsed_filter
					? '(' + parsed_filter + ')'
					: null
				if(SHOW_DEBUG===true) {
					// console.log("-> filter:",filter);
					console.log("-> coins form_submit sql_filter:",sql_filter);
				}
				// if (!sql_filter|| sql_filter.length<3) {
				// 	return new Promise(function(resolve){
				// 		// loading ends
				// 		rows_container.classList.remove("loading")
				// 		console.warn("Ignored submit. Invalid sql_filter.", sql_filter);
				// 		resolve(false)
				// 	})
				// }

			data_manager.request({
				body : {
					dedalo_get		: 'records',
					table			: table,
					ar_fields		: ar_fields,
					sql_filter		: sql_filter,
					limit			: limit,
					count			: count,
					offset			: offset,
					order			: order,
					process_result	: null,
					resolve_portals_custom	: {
						'image_obverse_data' : 'images'
					}
				}
			})
			.then(function(api_response){
				// console.log("--------------- api_response:",api_response);

				coins_row_fields.last_type = null

				// parse data
					const data	= page.parse_coin_data(api_response.result)
					const total	= api_response.total

					self.pagination.total	= total
					self.pagination.offset	= offset

					if (!data) {
						rows_container.classList.remove('loading')
						resolve(null)
					}

				// loading end
					(function(){
						while (rows_container.hasChildNodes()) {
							rows_container.removeChild(rows_container.lastChild);
						}
						rows_container.classList.remove('loading')
					})()

				// render
					self.list = self.list || new list_factory() // creates / get existing instance of list
					self.list.init({
						data			: data,
						fn_row_builder	: self.list_row_builder,
						pagination		: self.pagination,
						caller			: self
					})
					self.list.render_list()
					.then(function(list_node){
						if (list_node) {
							rows_container.appendChild(list_node)
						}
						resolve(list_node)
					})
			})

			// scrool to head result
			const div_result = document.querySelector('.rows_container')
			if (div_result) {
				div_result.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
			}
		})
	},//end form_submit



	/**
	* LIST_ROW_BUILDER
	* This function is a callback defined when list_factory is initialized (!)
	* @param object data (db row parsed)
	* @param object caller (instance of class caller like coin)
	* @return DocumentFragment node
	*/
	list_row_builder : function(data){

		return coins_row_fields.draw_item(data)
	}//end list_row_builder




}//end coins
