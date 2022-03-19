/*global tstring, form_factory, list_factory, Promise, 																																									psqo_factory, mints_rows, SHOW_DEBUG, common, page, data_manager, event_manager */
/*eslint no-undef: "error"*/

"use strict";



var mints =  {

	// trigger_url 	: page_globals.__WEB_TEMPLATE_WEB__ + "/mints/trigger.mints.php",
	search_options 	: {},

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
	*/
	set_up : function(options) {

		const self = this

		// options
			self.form_container	= options.form_container
			self.rows_container	= options.rows_container
			const psqo			= options.psqo


		// form
			self.form		= new form_factory()
			const form_node	= self.render_form()
			self.form_container.appendChild(form_node)

		// pagination
			self.pagination = {
				total	: null,
				limit	: 10,
				offset	: 0,
				n_nodes	: 8
			}

		// events
			event_manager.subscribe('paginate', paginate)
			function paginate(offset) {
				// updates pagination.offset
				self.pagination.offset = offset
				// submit again
				self.form_submit()
			}

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

				self.pagination = {
					total		: null,
					// limit	: 10,
					offset		: 0
					// n_nodes	: 8
				}
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

		// name
			self.form.item_factory({
				id			: "name",
				name		: "name",
				label		: tstring.mint || "Mint",
				q_column	: "name",
				eq			: "LIKE",
				eq_in		: "%",
				eq_out		: "%",
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'mints'
					})
				}
			})

		// Place
			self.form.item_factory({
				id			: "place",
				name		: "place",
				label		: tstring.place || "Place",
				q_column	: "place",
				eq			: "LIKE",
				eq_in		: "%",
				eq_out		: "%",
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'mints'
					})
				}
			})

		// public information
			self.form.item_factory({
				id			: "public_info",
				name		: "public_info",
				label		: tstring.history || "History",
				q_column	: "public_info",
				eq			: "LIKE",
				eq_in		: "%",
				eq_out		: "%",
				parent		: form_row
				// callback	: function(form_item) {
				// 	self.form.activate_autocomplete({
				// 		form_item	: form_item,
				// 		table		: 'mints'
				// 	})
				// }
			})
		// indexation
			self.form.item_factory({
				id			: "indexation",
				name		: "indexation",
				label		: tstring.indexation || "Indexation",
				q_column	: "indexation",
				eq			: "LIKE",
				eq_in		: "%",
				eq_out		: "%",
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'mints'
					})
				}
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
					total		: null,
					// limit	: 10,
					offset		: 0
					// n_nodes	: 8
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

			const table		= 'mints'
			const ar_fields	= ['*']
			const limit		= self.pagination.limit || 0
			const offset	= self.pagination.offset || 0
			const count		= true
			const order		= "name"

			// sql_filter
				const filter = self.form.build_filter()
				// parse_sql_filter
				const group			= []
				const parsed_filter	= self.form.parse_sql_filter(filter, group)
				const sql_filter	= parsed_filter
					? '(' + parsed_filter + ')'
					: null
				if(SHOW_DEBUG===true) {
					// console.log("-> coins form_submit sql_filter:",sql_filter);
				}
				// if (!sql_filter|| sql_filter.length<3) {
				// 	return new Promise(function(resolve){
				// 		// loading ends
				// 		rows_container.classList.remove("loading")
				// 		console.warn("Ignored submit. Invalid sql_filter.", sql_filter);
				// 		resolve(false)
				// 	})
				// }

			const body = {
				dedalo_get		: 'records',
				table			: table,
				ar_fields		: ar_fields,
				sql_filter		: sql_filter,
				limit			: limit,
				count			: count,
				offset			: offset,
				order			: order,
				process_result	: null
			}
			data_manager.request({
				body : body
			})
			.then(function(api_response){

				// parse data
					const data	= page.parse_mint_data(api_response.result)
					const total	= api_response.total

					self.pagination.total	= total
					self.pagination.offset	= offset

					if (!data) {
						rows_container.classList.remove("loading")
						resolve(null)
					}

				// loading end
					(function(){
						while (rows_container.hasChildNodes()) {
							rows_container.removeChild(rows_container.lastChild);
						}
						rows_container.classList.remove("loading")
					})()

				// render
					self.list = self.list || new list_factory() // creates / get existing instance of list
					self.list.init({
						data			: data,
						fn_row_builder	: self.list_row_builder,
						// pagination	: self.pagination,
						pagination		: false,
						caller			: self
					})
					self.list.render_list()
					.then(function(list_node){
						if (list_node) {
							rows_container.appendChild(list_node)
						}
						resolve(list_node)
					})

				// load all id sequence
					const ar_id_promise = (limit===0 && offset===0)
						? Promise.resolve( data.map(el => el.section_id) ) // use existing
						: (()=>{
							// create a unlimited search
							const new_body		= Object.assign({}, body)
							new_body.limit		= 0
							new_body.offset		= 0
							new_body.count		= false
							new_body.ar_fields	= ['section_id']

							return data_manager.request({
								body : new_body
							})
							.then(function(response){
								const ar_id = response.result
									? response.result.map(el => el.section_id)
									: null
								return(ar_id)
							})
						  })()
					ar_id_promise.then(function(){
						// console.log("********** ar_id:",ar_id);
					})
			})

			// scrool to head result
			const div_result = document.querySelector(".rows_container")
			if (div_result) {
				div_result.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
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

		return mints_rows.draw_item(data)
	}//end list_row_builder



	/**
	* SET_VALUE
	*/
		// set_value : function(object, value, real_value) {

		// 	const container = document.getElementById(object.id + "_values")

		// 	// Check if already exists
		// 		const inputs		= container.querySelectorAll(".input_values")
		// 		const inputs_length	= inputs.length
		// 		for (var i = inputs_length - 1; i >= 0; i--) {
		// 			if (value===inputs[i].value) return false;
		// 		}

		// 	// Create new line
		// 		const line = common.create_dom_element({
		// 			element_type 	: "div",
		// 			class_name   	: "line_value",
		// 			parent 			: container
		// 			})
		// 			// <i class="fal fa-trash-alt"></i>
		// 			var trash = common.create_dom_element({
		// 				element_type 	: "i",
		// 				//class_name   	: "far fa-trash-alt", // awesome font 5
		// 				class_name   	: "icon fa-trash", //awesome font 4
		// 				parent 			: line
		// 				})
		// 				trash.addEventListener("click",function(){
		// 					this.parentNode.remove()
		// 				})

		// 			// if (object.dataset.q_name.indexOf(' AS ')!==-1) {
		// 			// 	const ar_parts = object.dataset.q_name.split(' AS ')
		// 			// 	// overwrite q_name fro input value
		// 			// 	object.dataset.q_name = ar_parts[1]
		// 			// 	// use real_value
		// 			// 	object.dataset.real_value = real_value[0]
		// 			// }

		// 			var input = common.create_dom_element({
		// 				element_type 	: "input",
		// 				class_name   	: "input_values",
		// 				parent 			: line,
		// 				data_set 		: object.dataset // Inherit dataset
		// 			})
		// 			input.value = value

		// 	return true
		// },//end set_value



	/**
	* ACTIVATE_AUTOCOMPLETE
	*/
		// activate_autocomplete : function(element) {

		// 	const self = this

		// 	// const cache = {}
		// 	$(element).autocomplete({
		// 		delay		: 150,
		// 		minLength	: 0,
		// 		source		: function( request, response ) {

		// 			const term  = request.term;

		// 			// // Cache
		// 			// 	if ( term in cache ) {
		// 			// 		response( cache[ term ] );
		// 			// 		return;
		// 			// 	}

		// 			const trigger_url  = self.trigger_url
		// 			const trigger_vars = {
		// 					q				: term,
		// 					mode			: element.dataset.mode,
		// 					q_name  		: element.dataset.q_name || null,
		// 					q_search  		: element.dataset.q_search || element.dataset.q_name,
		// 					q_table 		: element.dataset.q_table || null,
		// 					dd_relations 	: element.dataset.dd_relations || null
		// 			}
		// 			if(SHOW_DEBUG===true) {
		// 				console.log("[mints.activate_autocomplete] trigger_vars:", trigger_vars);
		// 			}

		// 			common.get_json_data(trigger_url, trigger_vars).then(function(response_data) {
		// 				// if(SHOW_DEBUG===true) {
		// 					console.log("[mints.activate_autocomplete] response_data",response_data)
		// 				// }

		// 				const result = (element.id==="fecha_publicacion")
		// 					? response_data.result.map( item => {
		// 						item.label = item.label.substring(0, 4)
		// 						return item
		// 					})
		// 					: response_data.result

		// 				response(result)

		// 			}, function(error) {
		// 				console.error("[activate_autocomplete] Failed get_json!", error);
		// 			});
		// 		},
		// 		// When a option is selected in list
		// 		select: function( event, ui ) {
		// 			// prevent set selected value to autocomplete input
		// 			event.preventDefault();

		// 			/* MULTI
		// 			  var terms = split( this.value );
		// 	          // remove the current input
		// 	          terms.pop();
		// 	          // add the selected item
		// 	          terms.push( ui.item.label );
		// 	          // add placeholder to get the comma-and-space at the end
		// 	          terms.push( "" );
		// 	          this.value = terms.join( ", " );
		// 	          return false; */
		// 			self.set_value(this, ui.item.label, ui.item.value)
		// 			this.value = ''
		// 			//this.value = ui.item.label

		// 			//$(this).blur()
		// 			return false;
		// 		},
		// 		// When a option is focus in list
		// 		focus: function() {
		// 			// prevent value inserted on focus
		// 			return false;
		// 		},
		//         close: function( event, ui ) {

		//         },
		// 		change: function( event, ui ) {

		// 		},
		// 		response: function( event, ui ) {
		// 			//console.log(ui);
		// 		}
		// 	})
		// 	.on("keydown", function( event ) {
		// 		//return false
		// 		//console.log(event)
		// 		if ( event.keyCode === $.ui.keyCode.ENTER  ) {
		// 			// prevent set selected value to autocomplete input
		// 			//event.preventDefault();
		// 			//var term = $(this).val();
		// 			$(this).autocomplete('close')
		// 		}//end if ( event.keyCode === $.ui.keyCode.ENTER  )
		// 	})// bind
		// 	.focus(function() {
		// 	    $(this).autocomplete('search', null)
		// 	})
		// 	.blur(function() {
		// 	    //$(element).autocomplete('close');
		// 	})


		// 	return true
		// },//end activate_autocomplete



	/**
	* SEARCH
	*/
		// search : function(form_obj, event) {
		// 	if (event) event.preventDefault(); // Prevent submit and navigate to url
		// 	//console.log("form_obj:",form_obj,event);

		// 	const self = this

		// 	// ar_query
		// 		const ar_query			= []
		// 		const ar_form_inputs	= form_obj.querySelectorAll("input.input_values, input.form-control")
		// 		const ar_input_len		= ar_form_inputs.length
		// 		for (let i = 0; i < ar_input_len; i++) {

		// 			const input = ar_form_inputs[i]

		// 			if (input.value.length>0) {

		// 				// value
		// 					// const current_value = typeof input.dataset.real_value!=="undefined"
		// 					// 	? input.dataset.real_value
		// 					// 	: input.value
		// 					let current_value = input.value

		// 				// column
		// 					let current_column = input.dataset.q_name
		// 					if (input.dataset.q_name.indexOf(' AS ')!==-1) {
		// 						const ar_parts = input.dataset.q_name.split(' AS ')
		// 						// overwrite current_column
		// 						current_column = ar_parts[1]
		// 						if (current_column==="authors") {
		// 							const regex = /\,/gi;
		// 							current_value = current_value.replace(regex, '');
		// 						}
		// 					}

		// 				const current_obj = {
		// 					name 		: current_column, // input.dataset.q_name, // input.name,
		// 					value 		: current_value,  // input.value
		// 					search_mode : input.dataset.search,
		// 					table 		: input.dataset.q_table
		// 				}

		// 				ar_query.push(current_obj)
		// 			}
		// 		}
		// 		if(SHOW_DEBUG===true) {
		// 			console.log("search.ar_query:", ar_query);
		// 		}

		// 	// operators value
		// 		const operators_value = form_obj.querySelector('input[name="operators"]:checked').value;


		// 	// search_rows. exec query (promise)
		// 		const response = self.search_rows({
		// 			ar_query	: ar_query,
		// 			operator	: operators_value
		// 		})
		// 		.then(function(response){
		// 			console.log("search response:",response);

		// 			self.draw_rows({
		// 				target	: 'rows_list',
		// 				ar_rows	: response.result
		// 			})
		// 		})

		// 	// scrool to head result
		// 		const div_result = document.querySelector(".result")
		// 		if (div_result) {
		// 			div_result.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
		// 		}


		// 	return response
		// },//end search



	/**
	* SEARCH_ROWS
	* Call to trigger and load json data results of search. On complete load, draw list items
	*/
		// search_rows : function(options) {

		// 	const self = this

		// 	// options
		// 		const ar_query	= typeof(options.ar_query)!=="undefined" ? options.ar_query : null
		// 		const limit		= options.limit || 10
		// 		const offset	= options.offset || 0
		// 		const total		= options.total || false
		// 		const order		= options.order || 'section_id ASC'
		// 		const operator	= options.operator || 'OR'

		// 	// fix search options store
		// 		self.search_options = options

		// 	const container = document.getElementById("rows_list")
		// 		  container.style.opacity = "0.4"


		// 	const sql_filter	= null
		// 	const ar_fields		= [
		// 		'section_id', // int(12) unsigned NULL	Campo creado automáticamente para guardar section_id (sin correspondencia en estructura)
		// 		'lang', // 	varchar(8) NULL	Campo creado automáticamente para guardar el idioma (sin correspondencia en estructura)
		// 		'name',	//	text NULL	Ceca - numisdata16
		// 		'place_data',	//	text NULL	Localización - numisdata585
		// 		'place',	//	text NULL	Localización - numisdata585
		// 		'history',	//	text NULL	Historia - numisdata18
		// 		'numismatic_comments',	//	text NULL	Comentario numismático - numisdata17
		// 		'bibliography_data',	//	text NULL	Bibliografía - numisdata163
		// 		'map'
		// 	]
		// 	const count = !total ? true : false;

		// 	return new Promise(function(resolve, reject){

		// 		// request
		// 		data_manager.request({
		// 			body : {
		// 				dedalo_get				: 'records',
		// 				db_name					: page_globals.WEB_DB,
		// 				lang					: page_globals.WEB_CURRENT_LANG_CODE,
		// 				table					: 'mints',
		// 				ar_fields				: ar_fields,
		// 				sql_filter				: sql_filter,
		// 				limit					: limit,
		// 				count					: count,
		// 				offset					: offset,
		// 				order					: order,
		// 				resolve_portals_custom	: {
		// 					bibliography_data : 'bibliographic_references' // publications
		// 				}
		// 			}
		// 		})
		// 		.then(function(response){
		// 			if(SHOW_DEBUG===true) {
		// 				// console.log("[mints.search_rows] get_json_data response:", response);
		// 			}

		// 			container.style.opacity = "1"

		// 			if (!response) {
		// 				// Error on load data from trigger
		// 				console.warn("[mints.search_rows] Error. Received response data is null");
		// 				reject("[mints.search_rows] Error. Received response data is null")

		// 			}else{
		// 				// Success

		// 				// fix totals
		// 					self.search_options.total 	= (response.total && response.total>0)
		// 						? response.total // new total
		// 						: self.search_options.total // previous calculated total
		// 					self.search_options.limit 	= limit
		// 					self.search_options.offset 	= offset

		// 				resolve(response)
		// 			}
		// 		})
		// 	})
		// },//end search_rows



	// /**
	// * DRAW_ROWS
	// */
		// draw_rows : function(options) {

		// 	const self = this

		// 	const target 		 = options.target
		// 	const ar_rows 		 = options.ar_rows || []
		// 	const ar_rows_length = ar_rows.length

		// 	const total  		 = self.search_options.total
		// 	const limit  		 = self.search_options.limit
		// 	const offset 		 = self.search_options.offset


		// 	// container select and clean container div
		// 		const container = document.getElementById(target)
		// 		while (container.hasChildNodes()) {
		// 			container.removeChild(container.lastChild);
		// 		}

		// 	const fragment = new DocumentFragment();

		// 	// pagination top
		// 		const pagination_container = common.create_dom_element({
		// 			element_type 	: "div",
		// 			class_name 		: "pagination top"
		// 		})
		// 		pagination_container.appendChild( self.draw_paginator({
		// 			total  		: total,
		// 			limit  		: limit,
		// 			offset 		: offset,
		// 			count  		: ar_rows_length
		// 		}))
		// 		fragment.appendChild(pagination_container)

		// 	// sort rows
		// 		// let collator = new Intl.Collator('es',{ sensitivity: 'base', ignorePunctuation:true});
		// 		// ar_rows.sort( (a,b) => {
		// 		// 		let order_a = a.autoria +" "+ a.fecha_publicacion
		// 		// 		let order_b = b.autoria +" "+ b.fecha_publicacion
		// 		// 		//console.log("order_a",order_a, order_b);
		// 		// 		//console.log(collator.compare(order_a , order_b));
		// 		// 	return collator.compare(order_a , order_b)
		// 		// });

		// 	// rows build
		// 		for (let i = 0; i < ar_rows_length; i++) {

		// 			// Build dom row

		// 			// item row_object
		// 				const row_object = ar_rows[i]

		// 				if(SHOW_DEBUG===true) {
		// 					// console.log("i row_object:", i, row_object);
		// 				}

		// 			// wrapper
		// 				const mints_row_wrapper = common.create_dom_element({
		// 					  element_type 	: "div",
		// 					  class_name 	: "mints_row_wrapper",
		// 					  data_set 		: {
		// 					  	section_id 	: row_object.section_id
		// 					  },
		// 					  parent 		: fragment
		// 				})

		// 			// mint_rows set
		// 				const row_field = mint_rows
		// 					  row_field.row_object = row_object

		// 			// name
		// 				mints_row_wrapper.appendChild( row_field.name() )

		// 			// place
		// 				mints_row_wrapper.appendChild( row_field.place() )

		// 		}//end for (var i = 0; i < len; i++)

		// 	// pagination footer
		// 		const pagination_container_bottom = common.create_dom_element({
		// 			element_type 	: "div",
		// 			class_name 		: "pagination bottom"
		// 		})
		// 		pagination_container_bottom.appendChild( self.draw_paginator({
		// 			total  	: total,
		// 			limit  	: limit,
		// 			offset 	: offset,
		// 			count  	: ar_rows_length
		// 		}))
		// 		fragment.appendChild(pagination_container_bottom)


		// 	// bulk fragment nodes to container
		// 		container.appendChild(fragment)


		// 	return true
		// },//end draw_rows



	// /**
	// * DRAW_PAGINATOR
	// * Return a DocumentFragment with all pagination nodes
	// */
		// draw_paginator : function(options) {

		// 	const self = this

		// 	// short vars
		// 		const total 	= options.total
		// 		const limit 	= options.limit
		// 		const offset 	= options.offset
		// 		const count 	= options.count
		// 		const n_nodes 	= 10

		// 	const pagination_fragment = new DocumentFragment();

		// 	// paginator (nav bar)
		// 		const paginator_node = paginator.get_full_paginator({
		// 			total  	: total,
		// 			limit  	: limit,
		// 			offset 	: offset,
		// 			n_nodes : n_nodes,
		// 			callback: (item) => {

		// 				// update search_options
		// 					self.search_options.offset = item.offset
		// 					self.search_options.total  = item.total

		// 				// search (returns promise)
		// 					const search = self.search_rows(self.search_options)

		// 				// scroll page to navigato header
		// 					search.then(function(response){

		// 						// scroll to result
		// 							const div_result = document.querySelector(".result")
		// 							if (div_result) {
		// 								div_result.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
		// 							}

		// 						// draw records
		// 							self.draw_rows({
		// 								target  : 'rows_list',
		// 								ar_rows : response.result
		// 							})
		// 					})

		// 				return search
		// 			}
		// 		})
		// 		pagination_fragment.appendChild(paginator_node)

		// 	// spacer
		// 		common.create_dom_element({
		// 			element_type 	: "div",
		// 			class_name 		: "spacer",
		// 			parent 			: pagination_fragment
		// 		})

		// 	// totals (info about showed and total records)
		// 		const totals_node = paginator.get_totals_node({
		// 			total  	: total,
		// 			limit  	: limit,
		// 			offset 	: offset,
		// 			count 	: count
		// 		})
		// 		pagination_fragment.appendChild(totals_node)


		// 	return pagination_fragment
		// },//end draw_paginator



}//end mints
