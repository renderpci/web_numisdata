/*global $, page_globals, SHOW_DEBUG, paginator, page, biblio_row_fields, common, document, DocumentFragment, tstring, console */
/*eslint no-undef: "error"*/
/*jshint esversion: 6 */
"use strict";



var biblio =  {

	trigger_url		: page_globals.__WEB_TEMPLATE_WEB__ + "/biblio/trigger.biblio.php",
	search_options	: null,



	/**
	* SET_UP
	*/
	set_up : function() {

		const self = this

		const form = document.getElementById("search_form")
		if (form) {
			const ar_form_inputs  	 = form.querySelectorAll("input.form-control")
			const ar_form_inputs_len = ar_form_inputs.length
			for (let i = 0; i < ar_form_inputs_len; i++) {

				const item = ar_form_inputs[i]

				const autocomplete = item.dataset.autocomplete
					? JSON.parse(item.dataset.autocomplete)
					: true

				// Activate autocomplete behavior for each input
					if (autocomplete===true) {
						self.activate_autocomplete(ar_form_inputs[i])
					}

				// Add event keyup to all inputs
				//ar_form_inputs[i].addEventListener("keyup", function(e){
				//	//self.search(form, null)
				//},false)
			}

			// exec first default search without params
				self.search_rows({
					ar_query : [],
					limit 	 : 20
				}) // First search

		}else if (typeof biblio_section_id!=="undefined") {

			// Defined in html file
				const ar_query		= []
				const current_obj	= {
						name 		: "section_id", // input.name,
						value 		: biblio_section_id,
						search_mode : "string",
						table 		: "publicaciones"
					}
					ar_query.push(current_obj)

			// exec search with params
				self.search_rows({
					ar_query : ar_query,
					limit 	 : 1
				})
		}

		self.createExpandableBlock()

		return true
	},//end set_up



	/**
	* SET_VALUE
	*/
	set_value : function(object, value) {

		const container = document.getElementById(object.id + "_values")

		// Check if already exists
			const inputs		= container.querySelectorAll(".input_values")
			const inputs_length	= inputs.length
			for (let i = inputs_length - 1; i >= 0; i--) {
				if (value===inputs[i].value) return false;
			}

		// Create new line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "line_value",
				parent			: container
			})

			// trash icon. <i class="fal fa-trash-alt"></i>
				const trash = common.create_dom_element({
					element_type	: "i",
					//class_name	: "far fa-trash-alt", // awesome font 5
					class_name		: "icon fa-trash", //awesome font 4
					parent			: line
				})
				trash.addEventListener("click",function(){
					this.parentNode.remove()
				})

			// des
				// if (object.dataset.q_name.indexOf(' AS ')!==-1) {
				// 	const ar_parts = object.dataset.q_name.split(' AS ')
				// 	// overwrite q_name fro input value
				// 	object.dataset.q_name = ar_parts[1]
				// 	// use real_value
				// 	object.dataset.real_value = real_value[0]
				// }

			// input
				const input = common.create_dom_element({
					element_type	: "input",
					class_name		: "input_values",
					parent			: line,
					data_set		: object.dataset // Inherit dataset
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
			delay		: 150,
			minLength	: 0,
			source		: function( request, response ) {

				const term  = request.term;

				// // Cache
				// 	if ( term in cache ) {
				// 		response( cache[ term ] );
				// 		return;
				// 	}

				const body = {
					q				: term,
					mode			: element.dataset.mode,
					q_name			: element.dataset.q_name || null,
					q_search		: element.dataset.q_search || element.dataset.q_name,
					q_table			: element.dataset.q_table || null,
					dd_relations	: element.dataset.dd_relations || null,
					limit			: element.dataset.limit || 30
				}
				if(SHOW_DEBUG===true) {
					console.log('debug activate_autocomplete get_json_data body:', body);
				}
				common.get_json_data(
					self.trigger_url,
					body
				)
				.then(function(response_data) {

					let result_final = []
					switch (element.id) {

						case 'autoria':
							result_final = self.process_drop_down_list(term, response_data.result, ' | ')
							break;

						case 'descriptors_rec':
							result_final = self.process_drop_down_list(term, response_data.result, ' - ')
							break;

						case 'fecha_publicacion':
							result_final = response_data.result.map( item => {
								item.label = item.label.substring(0, 4)
								return item
							})
							break;

						default:
							result_final = response_data.result
							break;
					}

					response(result_final)

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
			for (var i = 0; i < ar_input_len; i++) {

				const input = ar_form_inputs[i]

				if (input.value.length>0) {

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
							// if (current_column==="authors") {
							// 	const regex = /\,/gi;
							// 	current_value = current_value.replace(regex, '');
							// }
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
				// console.log("search.ar_query:", ar_query);
			}

		// operators value
			const operators_value = form_obj.querySelector('input[name="operators"]:checked').value;


		// exec query (promise)
			const response = self.search_rows({
				ar_query : ar_query,
				operator : operators_value
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

		const container = document.getElementById("biblio_rows_list")
			  container.style.opacity = "0.4"

		const trigger_url  = self.trigger_url
		const trigger_vars = {
			mode		: "search_rows",
			ar_query	: typeof(options.ar_query)!=="undefined" ? options.ar_query : null,
			limit		: options.limit || 20,
			// pagination
			offset		: options.offset || 0,
			count		: options.count || false,
			total		: options.total || false,
			order		: options.order || 'section_id ASC',
			operator	: options.operator || '$or'
		}

		// debug
			if(SHOW_DEBUG===true) {
				// console.log("[biblio.search_rows] trigger_vars:",trigger_vars);
			}

		// Http request directly in javascript to the API is possible too..
		const js_promise = common.get_json_data(trigger_url, trigger_vars).then(function(response){
				if(SHOW_DEBUG===true) {
					console.log("[biblio.search_rows] get_json_data response:", response);
				}

				container.style.opacity = "1"

				if (!response) {
					// Error on load data from trigger
					console.warn("[biblio.search_rows] Error. Received response data is null");
					return false

				}else{
					// Success
					return biblio.draw_rows({
						target	: 'biblio_rows_list',
						ar_rows	: response.result.result,
						// pagination
						total	: response.result.total,
						limit	: trigger_vars.limit,
						offset	: trigger_vars.offset
					})
				}
		})


		return js_promise
	},//end search_rows



	/**
	* SEARCH_ITEM
	* Build a set of search options for gived column and exec the search
	*/
	search_item : function(name, value){

		const self = this

		const ar_query = [{
			name		: name,
			search_mode	: "string",
			table		: "publications",
			value		: value
		}]
		const count = true

		return self.search_rows({
			ar_query	: ar_query,
			count		: count
		}).then(function(){
			// scrool to head result
			const div_result = document.querySelector(".result")
			if (div_result) {
				div_result.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
			}
		})
	},//end search_item



	/**
	* DRAW_ROWS
	*/
	draw_rows : function(options) {

		const self = this

		const ar_rows 		 = options.ar_rows || []
		const ar_rows_length = ar_rows.length

		// clean container select and clean container div
			const container = document.getElementById(options.target)
			while (container.hasChildNodes()) {
				container.removeChild(container.lastChild);
			}

		const fragment = new DocumentFragment();

		// pagination top
			const pagination_container = common.create_dom_element({
				element_type	: "div",
				class_name		: "pagination top"
			})
			pagination_container.appendChild( self.draw_paginator({
				total	: options.total,
				limit	: options.limit,
				offset	: options.offset,
				count	: ar_rows_length
			}))
			fragment.appendChild(pagination_container)

		// sort rows
			const collator = new Intl.Collator('es',{ sensitivity: 'base', ignorePunctuation:true});
			ar_rows.sort( (a,b) => {
					let order_a = a.authors +" "+ a.publication_date
					let order_b = b.authors +" "+ b.publication_date
				return collator.compare(order_a , order_b)
			});

		// self.search_options
			// const transcription_query = self.search_options.ar_query.find(function(el){
			// 	return el.name==="transcription"
			// }) || null

		// rows build
			for (let i = 0; i < ar_rows_length; i++) {

				// Build dom row

				// item biblio_object
					const biblio_object = ar_rows[i]

					if(SHOW_DEBUG===true) {
						// console.log("i biblio_object:", i, biblio_object);
					}

					// for(var a in biblio_object) {
					// 	if (!biblio_object[a] || biblio_object[a].length<1) {
					// 		if (a.indexOf('dato')!==-1) {
					// 			// biblio_object[a] = "Untitled " + a
					// 		}
					// 	}
					// }

				// wrapper
					const biblio_row_wrapper = common.create_dom_element({
						  element_type 	: "div",
						  class_name 	: "biblio_row_wrapper",
						  data_set 		: {
						  	section_id 	: biblio_object.section_id
						  },
						  parent 		: fragment
					})

				// row_fields set
					const row_field = biblio_row_fields // placed in 'page/js/biblio_row_fields.js'
					// config
					row_field.biblio_object	= biblio_object
					row_field.caller		= self

				// author
					biblio_row_wrapper.appendChild( row_field.author() )

				// publication_date
					biblio_row_wrapper.appendChild( row_field.publication_date() )

				// row_title
					biblio_row_wrapper.appendChild( row_field.row_title() )

				// row_body
					biblio_row_wrapper.appendChild( row_field.row_body() )

				// row_url
					biblio_row_wrapper.appendChild( row_field.row_url() )

				// descriptors
				if (biblio_object.descriptors && biblio_object.descriptors.length>1) {
					biblio_row_wrapper.appendChild( row_field.descriptors(biblio_object.descriptors) )
				}

				// transcription
				if (biblio_object.transcription) {
					const transcription_node = row_field.transcription(biblio_object.transcription)
					if (transcription_node) {
						biblio_row_wrapper.appendChild(transcription_node)
					}
				}

			}//end for (var i = 0; i < len; i++)

		// pagination footer
			const pagination_container_bottom = common.create_dom_element({
				element_type 	: "div",
				class_name 		: "pagination bottom"
			})
			pagination_container_bottom.appendChild( self.draw_paginator({
				total  		: options.total,
				limit  		: options.limit,
				offset 		: options.offset,
				count  		: ar_rows_length
			}))
			fragment.appendChild(pagination_container_bottom)


		// bulk fragment nodes to container
			container.appendChild(fragment)


		return true
	},//end draw_rows



	/**
	* DRAW_PAGINATOR
	* Return a DocumentFragment with all pagination nodes
	*/
	draw_paginator : function(options) {

		const self = this

		const pagination_fragment = new DocumentFragment();
		// paginator (nav bar)
			const paginator_node = paginator.get_full_paginator({
				total  	: options.total,
				limit  	: options.limit,
				offset 	: options.offset,
				n_nodes : 6,
				callback: (item) => {

					const offset = item.offset
					const total  = item.total

					// update search_options
						self.search_options.offset = offset
						self.search_options.total  = total

					// search (returns promise)
						const search = self.search_rows(self.search_options)

					// scroll page to navigato header
						search.then(function(){
							const div_result = document.querySelector(".result")
							if (div_result) {
								div_result.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
							}
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
				total  	: options.total,
				limit  	: options.limit,
				offset 	: options.offset,
				count 	: options.count
			})
			pagination_fragment.appendChild(totals_node)


		return pagination_fragment
	},//end draw_paginator



	//Create an expandable block when text length is over 500
	createExpandableBlock : function() {

		const textBlock		= document.querySelector("#body-txt")
		const nodeParent	= document.querySelector("#body-txt-parent")
		textBlock.classList.add("contracted-block");

		const textBlockSeparator = common.create_dom_element({
			element_type	: "div",
			class_name		: "text-block-separator",
			parent 			: nodeParent
		})

		const separatorArrow = common.create_dom_element({
			element_type	: "div",
			class_name		: "separator-arrow",
			parent 			: textBlockSeparator
		})

		textBlockSeparator.addEventListener("click",function(){
			if (textBlock.classList.contains("contracted-block")){
				textBlock.classList.remove ("contracted-block");
				separatorArrow.style.transform = "rotate(-90deg)";
			} else {
				textBlock.classList.add("contracted-block");
				separatorArrow.style.transform = "rotate(90deg)";
			}
		})
	},//end createExpandableBlock



	/**
	* PROCESS_DROP_DOWN_LIST
	* Used to process fields like 'Authors' or 'Themes' autocomplete results
	* API call results are split by given separator, duplicates are removed and
	* result list is sorted alphabetically
	* @param string term
	* 	input value as 'ripoll'
	* @param array rows
	* 	API response.result array of rows
	* @param string separator
	* 	like ' | '
	* @return array ar_drow_down_list
	*/
	process_drop_down_list : function(term, rows, separator) {

		// debug
		if(SHOW_DEBUG===true) {
			console.log('debug process_drop_down_list rows:', term, rows);
		}

		let result_final = []

		const len = rows.length
		for (let i = 0; i < len; i++) {

			const item = rows[i]

			const terms = item.label.split(separator)
			const term_length = terms.length
			for (let k = 0; k < term_length; k++) {

				const term_name = terms[k].trim()
				const found = result_final.find(el => el.value===term_name)
				if (!found && term_name.length > 0) {
					result_final.push({
						label : term_name,
						value : term_name
					})
				}
			}
		}

		const ar_ordered_result	= page.sort_array_by_property(result_final, 'value')
		const ar_filtered_result= (term.length!=0)
			? page.filter_drop_down_list(ar_ordered_result, term)
			: ar_ordered_result

		// slice first 100 items to prevent too much large sets
		const ar_drow_down_list	= ar_filtered_result.slice(0, 100)

		// debug
		if(SHOW_DEBUG===true) {
			console.log('debug process_drop_down_list ar_drow_down_list:', term, ar_drow_down_list);
		}


		return ar_drow_down_list
	}//end process_drop_down_list



}//end biblio
