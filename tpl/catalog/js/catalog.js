"use strict";



var catalog =  {

	trigger_url			: page_globals.__WEB_TEMPLATE_WEB__ + "/catalog/trigger.catalog.php",
	search_options		: {},
	selected_term_table : null, // Like 'mints'



	/**
	* SET_UP
	*/
	set_up : function(options) {

		const self = this

		// const form = document.getElementById("search_form")
		// if (form) {
		// 	const ar_form_inputs  	 = form.querySelectorAll("input.form-control")
		// 	const ar_form_inputs_len = ar_form_inputs.length
		// 	for (var i = 0; i < ar_form_inputs_len; i++) {

		// 		// Activate autocomplete behabiour for each input
		// 			self.activate_autocomplete(ar_form_inputs[i])

		// 		// Add event keyup to all inputs
		// 		//ar_form_inputs[i].addEventListener("keyup", function(e){
		// 		//	//self.search(form, null)
		// 		//},false)
		// 	}
		// }

		// load mints list
			self.load_mint_list().then(function(response){						

				const select = self.draw_select({
					data		: response.result,
					term_table	: "mints",
					default		: [{section_id:'0',name:"Select mint"}]
				})

				const container = document.getElementById("items_container")
				container.appendChild(select)
			})
			

		// exec first default search without params
			// self.search_rows({
			// 	ar_query : [],
			// 	limit 	 : 10
			// }).then(function(response){
			// 	self.draw_rows({
			// 		target  : 'rows_list',
			// 		ar_rows : response.result
			// 	})
			// })




		return true
	},//end set_up



	/**
	* LOAD_MINT_LIST
	* @return promise
	*/
	load_mint_list : function() {
		
		const js_promise = page.request({
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
	* DRAW_SELECT
	* @return promise
	*/
	draw_select : function(options) {

		const self = this

		const data 			  	= options.data
		const term_table		= options.term_table
		const options_default	= options.default || [{section_id:'0',name:"Select option"}]
		
		const fragment = new DocumentFragment()

		// prepend empty option
			const elements = options_default.concat(data)

		// iterate option
			const elements_length = elements.length
			for (let i = 0; i < elements_length; i++) {
				
				const item = elements[i]

				// filter
					const filter_value = {
						"OR": []
					}

				// parents
					const parents = item.parents ? JSON.parse(item.parents) : null					
					if (parents) {
						for (let j = 0; j < parents.length; j++) {							
							filter_value["OR"].push({
								'field' : 'section_id',
								'value' : `${parents[j]}`,
								'op' 	: '='
							})
						}
					}

				// self
					filter_value["OR"].push({
						'field' : 'section_id',
						'value' : `${item.section_id}`,
						'op' 	: '='
					})

				// childrens
					filter_value["OR"].push({
						'field' : 'parents',
						'value' : `'%"${item.section_id}"%'`,
						'op' 	: 'LIKE'
					})

				common.create_dom_element({
					element_type	: 'option',
					value 			: JSON.stringify(filter_value),
					text_content 	: item.name,
					parent 			: fragment
				})		
			}

		// select node
			const select = common.create_dom_element({
				  element_type 	: "select",
				  class_name 	: "select_" + term_table
			})
			select.addEventListener("change", function(e){

				const value = e.target.value
				if (!value) return false

				// fix selected term_table (start point)
					self.selected_term_table = term_table

				// clean container and add_spinner
					const container = document.querySelector("#rows_list")
					while (container.hasChildNodes()) {
						container.removeChild(container.lastChild);
					}					
					page.add_spinner(container)

				// search
					// const search_promise = self.search_rows({
					// 	filter : {
					// 		"OR": [
					// 			{
					// 				'field' : 'term_data',
					// 				'value' : `'["${value}"]'`,
					// 				'op' 	: '='
					// 			},
					// 			{
					// 				'field' : 'parents',
					// 				'value' : `'%"${value}"%'`,
					// 				'op' 	: 'LIKE'
					// 			}
					// 		]
					// 	},
					// 	limit : 0
					// })
					const filter = JSON.parse(value)
					const search_promise = self.search_rows({
						filter	: filter,
						limit	: 0
					})

				// draw response rows
					search_promise.then(function(response){
						setTimeout(()=>{
							self.draw_rows({
								target  : 'rows_list',
								ar_rows : response.result
							})
						},200)
					})
			})
			select.appendChild(fragment)


		return select
	},//end draw_select



	/**
	* SET_VALUE
	*/
	set_value : function(object, value, real_value) {

		const container = document.getElementById(object.id + "_values")

		// Check if already exists
			const inputs 		= container.querySelectorAll(".input_values")
			const inputs_length = inputs.length
			for (var i = inputs_length - 1; i >= 0; i--) {
				if (value===inputs[i].value) return false;
			}

		// Create new line
			const line = common.create_dom_element({
				element_type 	: "div",
				class_name   	: "line_value",
				parent 			: container
				})
				// <i class="fal fa-trash-alt"></i>
				var trash = common.create_dom_element({
					element_type 	: "i",
					//class_name   	: "far fa-trash-alt", // awesome font 5
					class_name   	: "icon fa-trash", //awesome font 4
					parent 			: line
					})
					trash.addEventListener("click",function(){
						this.parentNode.remove()
					})

				// if (object.dataset.q_name.indexOf(' AS ')!==-1) {
				// 	const ar_parts = object.dataset.q_name.split(' AS ')
				// 	// overwrite q_name fro input value
				// 	object.dataset.q_name = ar_parts[1]
				// 	// use real_value
				// 	object.dataset.real_value = real_value[0]
				// }

				var input = common.create_dom_element({
					element_type 	: "input",
					class_name   	: "input_values",
					parent 			: line,
					data_set 		: object.dataset // Inherit dataset
				})
				input.value = value

		return true
	},//end set_value



	/**
	* ACTIVATE_AUTOCOMPLETE
	*/
	activate_autocomplete : function(element) {

		const self = this

		// const cache = {}
		$(element).autocomplete({
			delay 	 : 150,
			minLength: 0,
			source 	 : function( request, response ) {

				const term  = request.term;

				// // Cache
				// 	if ( term in cache ) {
				// 		response( cache[ term ] );
				// 		return;
				// 	}

				const trigger_url  = self.trigger_url
				const trigger_vars = {
						q				: term,
						mode			: element.dataset.mode,
						q_name  		: element.dataset.q_name || null,
						q_search  		: element.dataset.q_search || element.dataset.q_name,
						q_table 		: element.dataset.q_table || null,
						dd_relations 	: element.dataset.dd_relations || null
				}
				if(SHOW_DEBUG===true) {
					console.log("[catalog.activate_autocomplete] trigger_vars:", trigger_vars);
				}

				common.get_json_data(trigger_url, trigger_vars).then(function(response_data) {
					// if(SHOW_DEBUG===true) {
						console.log("[catalog.activate_autocomplete] response_data",response_data)
					// }

					const result = (element.id==="fecha_publicacion")
						? response_data.result.map( item => {
							item.label = item.label.substring(0, 4)
							return item
						})
						: response_data.result

					response(result)

				}, function(error) {
					console.error("[activate_autocomplete] Failed get_json!", error);
				});
			},
			// When a option is selected in list
			select: function( event, ui ) {
				// prevent set selected value to autocomplete input
				event.preventDefault();

				/* MULTI
				  var terms = split( this.value );
		          // remove the current input
		          terms.pop();
		          // add the selected item
		          terms.push( ui.item.label );
		          // add placeholder to get the comma-and-space at the end
		          terms.push( "" );
		          this.value = terms.join( ", " );
		          return false; */
				self.set_value(this, ui.item.label, ui.item.value)
				this.value = ''
				//this.value = ui.item.label

				//$(this).blur()
				return false;
			},
			// When a option is focus in list
			focus: function() {
				// prevent value inserted on focus
				return false;
			},
	        close: function( event, ui ) {

	        },
			change: function( event, ui ) {

			},
			response: function( event, ui ) {
				//console.log(ui);
			}
		})
		.on("keydown", function( event ) {
			//return false
			//console.log(event)
			if ( event.keyCode === $.ui.keyCode.ENTER  ) {
				// prevent set selected value to autocomplete input
				//event.preventDefault();
				//var term = $(this).val();
				$(this).autocomplete('close')
			}//end if ( event.keyCode === $.ui.keyCode.ENTER  )
		})// bind
		.focus(function() {
		    $(this).autocomplete('search', null)
		})
		.blur(function() {
		    //$(element).autocomplete('close');
		})


		return true
	},//end activate_autocomplete



	/**
	* SEARCH
	*/
	search : function(form_obj, event) {
		if (event) event.preventDefault(); // Prevent submit and navigate to url
		//console.log("form_obj:",form_obj,event);

		const self = this

		// ar_query
			var ar_query 		= []
			var ar_form_inputs  = form_obj.querySelectorAll("input.input_values, input.form-control")
			var ar_input_len 	= ar_form_inputs.length
			for (let i = 0; i < ar_input_len; i++) {

				const input = ar_form_inputs[i]

				if (input.value.length>0) {

						// console.log("input:",input);

					// value
						// const current_value = typeof input.dataset.real_value!=="undefined"
						// 	? input.dataset.real_value
						// 	: input.value
						let current_value = input.value

					// column
						let current_column = input.dataset.q_name
						if (input.dataset.q_name.indexOf(' AS ')!==-1) {
							const ar_parts = input.dataset.q_name.split(' AS ')
							// overwrite current_column
							current_column = ar_parts[1]
							if (current_column==="authors") {
								const regex = /\,/gi;
								current_value = current_value.replace(regex, '');
							}
						}

					const current_obj = {
						name 		: current_column, // input.dataset.q_name, // input.name,
						value 		: current_value,  // input.value
						search_mode : input.dataset.search,
						table 		: input.dataset.q_table
					}

					ar_query.push(current_obj)
				}
			}
			if(SHOW_DEBUG===true) {
				console.log("search.ar_query:", ar_query);
			}

		// operators value
			const operators_value = form_obj.querySelector('input[name="operators"]:checked').value;


		// search_rows. exec query (promise)
			const response = self.search_rows({
				ar_query : ar_query,
				operator : operators_value
			}).then(function(response){
				self.draw_rows({
					target  : 'rows_list',
					ar_rows : response.result
				})
			})

		// scrool to head result
			const div_result = document.querySelector(".result")
			if (div_result) {
				div_result.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
			}


		return response
	},//end search



	/**
	* SEARCH_ROWS
	* Call to trigger and load json data results of search. On complete load, draw list items
	*/
	search_rows : function(options) {

		const self = this

		// search options store
			self.search_options = options

		// filter parse
			const sql_filter = (function(){

				if (options.filter) {

					const op		= Object.keys(options.filter)[0]
					const ar_query	= options.filter[op]
					
					const ar_filter = []
					const ar_query_length = ar_query.length
					for (let i = 0; i < ar_query_length; i++) {
						
						const item = ar_query[i]

						const filter_line = "`"+item.field+"`" +" "+ item.op +" "+ item.value

						ar_filter.push(filter_line)
					}
					return ar_filter.join(" "+op+" ")
				}

				return null
			})()			

		const js_promise = page.request({
			body : {
				dedalo_get 	: 'records',
				table 		: 'catalog',
				ar_fields 	: ['*'],
				lang 		: page_globals.WEB_CURRENT_LANG_CODE,
				sql_filter	: sql_filter,
				limit 		: 0,
				count 		: false,
				order 		: 'norder ASC'				
			}
		})

		js_promise.then((response)=>{
			console.log("API response:",response);
		})
		

		return js_promise
	},//end search_rows



	/**
	* SEARCH_ROWS
	* Call to trigger and load json data results of search. On complete load, draw list items
	*/
	search_rows_SERVER : function(options) {

		const self = this

		// search options store
			self.search_options = options

		// const container = document.getElementById("rows_list")
			  // container.style.opacity = "0.4"

		const trigger_url  = self.trigger_url
		const trigger_vars = {
			mode 	 : "search_rows",
			ar_query : typeof(options.ar_query)!=="undefined" ? options.ar_query : null,
			limit 	 : options.limit || 10,
			// pagination
			offset 	 : options.offset || 0,
			// count 	 : options.count || false,
			total 	 : options.total || false,
			order 	 : options.order || 'section_id ASC',
			operator : options.operator || 'OR'
		}

		// debug
			if(SHOW_DEBUG===true) {
				console.log("[catalog.search_rows] trigger_vars:",trigger_vars);
			}

		// Http request directly in javascript to the API is possible too..
		const js_promise = common.get_json_data(trigger_url, trigger_vars).then(function(response){
				if(SHOW_DEBUG===true) {
					console.log("[catalog.search_rows] get_json_data response:", response);
				}

				// container.style.opacity = "1"

				if (!response) {
					// Error on load data from trigger
					console.warn("[catalog.search_rows] Error. Received response data is null");
					return false

				}else{
					// Success

					// fix totals
						self.search_options.total 	= (response.result.total && response.result.total>0)
							? response.result.total // new total
							: self.search_options.total // previous calculated total
						self.search_options.limit 	= trigger_vars.limit
						self.search_options.offset 	= trigger_vars.offset

					return response.result
				}
		})

		return js_promise
	},//end search_rows




	/**
	* DRAW_ROWS
	*/
	draw_rows : function(options) {

		const self = this

		const target 		 = options.target
		const ar_rows 		 = options.ar_rows || []
		const ar_rows_length = ar_rows.length

		const total  		 = self.search_options.total
		const limit  		 = self.search_options.limit
		const offset 		 = self.search_options.offset


		// container select and clean container div
			const container = document.getElementById(target)
			while (container.hasChildNodes()) {
				container.removeChild(container.lastChild);
			}

		// add_spinner
			// page.add_spinner(container)			

		const fragment = new DocumentFragment();

		const ar_mints = ar_rows.filter(item => item.term_table === 'mints')

		for (let i = 0; i < ar_mints.length; i++) {
			const parent = JSON.parse(ar_mints[i].parent)[0]
			const mint_parent 	= ar_rows.find(item => item.section_id === parent)
			if(!mint_parent){
					console.error("mint don't have public parent:",ar_mints[i]);
				continue
			} 
			const render_mints = self.get_children(ar_rows, mint_parent, fragment)
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

		// set row_fields items var
			row_fields.ar_rows = ar_rows

		// rows build
			for (let i = 0; i < ar_rows_length; i++) {

				
			}//end for (var i = 0; i < len; i++)

		


		// bulk fragment nodes to container
			container.appendChild(fragment)


		return true
	},//end draw_rows


	get_children : function(ar_rows, parent, parent_node){

		const self = this

		const children =  JSON.parse(parent.children)

		// wrapper
			const catalog_row_wrapper = common.create_dom_element({
				  element_type 	: "div",
				  class_name 	: "children_contanier",
			})
			parent_node.appendChild( catalog_row_wrapper )

		if(children){
			for (let i = 0; i < children.length; i++) {
				self.get_child(ar_rows, children[i], catalog_row_wrapper)
			}
		}
	},

	get_child : function(ar_rows, section_id, parent_node){

		const self = this

		const row_object 	= ar_rows.find(item => item.section_id === section_id)
		if (row_object) {
			const row_node 	= self.render_rows(row_object)
			parent_node.appendChild( row_node )

			if(row_object.children){
				self.get_children(ar_rows, row_object, row_node)
			}
		}
	},



	render_rows : function(row_object){

		// Build dom row
		// item row_object
			// const row_object = ar_rows[i]

			if(SHOW_DEBUG===true) {
				// console.log("i row_object:", i, row_object);
			}

		// row_fields set
			const node = row_fields.draw_item(row_object)

		return node
	},


	/**
	* DRAW_PAGINATOR
	* Return a DocumentFragment with all pagination nodes
	*/
	draw_paginator : function(options) {
	
		const self = this

		// short vars
			const total 	= options.total
			const limit 	= options.limit
			const offset 	= options.offset
			const count 	= options.count
			const n_nodes 	= 10
	
		const pagination_fragment = new DocumentFragment();
		
		// paginator (nav bar)
			const paginator_node = paginator.get_full_paginator({
				total  	: total,
				limit  	: limit,
				offset 	: offset,
				n_nodes : n_nodes,
				callback: (item) => {

					// update search_options
						self.search_options.offset = item.offset
						self.search_options.total  = item.total

					// search (returns promise)
						const search = self.search_rows(self.search_options)

					// scroll page to navigato header
						search.then(function(response){
							
							// scroll to result
								const div_result = document.querySelector(".result")
								if (div_result) {
									div_result.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
								}

							// draw records
								self.draw_rows({
									target  : 'rows_list',
									ar_rows : response.result
								})
						})					

					return search
				}
			})
			pagination_fragment.appendChild(paginator_node)
		
		// spacer
			common.create_dom_element({
				element_type 	: "div",
				class_name 		: "spacer",
				parent 			: pagination_fragment
			})
		
		// totals (info about showed and total records)
			const totals_node = paginator.get_totals_node({
				total  	: total,
				limit  	: limit,
				offset 	: offset,
				count 	: count
			})
			pagination_fragment.appendChild(totals_node)


		return pagination_fragment
	},//end draw_paginator



}//end catalog


