"use strict";



var mints =  {

	trigger_url 	: page_globals.__WEB_TEMPLATE_WEB__ + "/mints/trigger.mints.php",
	search_options 	: null,



	/**
	* SET_UP
	*/
	set_up : function(options) {

		const self = this

		const form = document.getElementById("search_form")
		if (form) {
			const ar_form_inputs  	 = form.querySelectorAll("input.form-control")
			const ar_form_inputs_len = ar_form_inputs.length
			for (var i = 0; i < ar_form_inputs_len; i++) {

				// Activate autocomplete behabiour for each input
					self.activate_autocomplete(ar_form_inputs[i])

				// Add event keyup to all inputs
				//ar_form_inputs[i].addEventListener("keyup", function(e){
				//	//self.search(form, null)
				//},false)
			}

			// exec first default search without params
				self.search_rows({
					ar_query : [],
					limit 	 : 10
				}) // First search

		}else if (typeof mints_section_id!=="undefined") {

			// Defined in html file
				var ar_query 	= []
				var current_obj = {
						name 		: "section_id", // input.name,
						value 		: mints_section_id,
						search_mode : "string",
						table 		: "publicaciones"
					}
					ar_query.push(current_obj)

				self.search_rows({
					ar_query : ar_query,
					limit 	 : 1
				})
		}else{
			
			// exec first default search without params
				self.search_rows({
					ar_query : [],
					limit 	 : 10
				}) // First search
		}


		return true
	},//end set_up



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
					console.log("[mints.activate_autocomplete] trigger_vars:", trigger_vars);
				}

				common.get_json_data(trigger_url, trigger_vars).then(function(response_data) {
					// if(SHOW_DEBUG===true) {
						console.log("[mints.activate_autocomplete] response_data",response_data)
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
			for (var i = 0; i < ar_input_len; i++) {

				const input = ar_form_inputs[i]

				if (input.value.length>0) {

						console.log("input:",input);

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
console.log("options", options);
		const self = this

		// search options store
			self.search_options = options

		const container = document.getElementById("mints_rows_list")
			  container.style.opacity = "0.4"

		const trigger_url  = self.trigger_url
		const trigger_vars = {
			mode 	 : "search_rows",
			ar_query : typeof(options.ar_query)!=="undefined" ? options.ar_query : null,
			limit 	 : options.limit || 10,
			// pagination
			offset 	 : options.offset || 0,
			count 	 : options.count || false,
			total 	 : options.total || false,
			order 	 : options.order || 'section_id ASC',
			operator : options.operator || 'OR'
		}

		// debug
			if(SHOW_DEBUG===true) {
				console.log("[mints.search_rows] trigger_vars:",trigger_vars);
			}

		// Http request directly in javascript to the API is possible too..
		const js_promise = common.get_json_data(trigger_url, trigger_vars).then(function(response){
				if(SHOW_DEBUG===true) {
					console.log("[mints.search_rows] get_json_data response:", response);
				}

				container.style.opacity = "1"

				if (!response) {
					// Error on load data from trigger
					console.warn("[mints.search_rows] Error. Received response data is null");
					return false

				}else{
					// Success
					return mints.draw_rows({
						target  : 'mints_rows_list',
						ar_rows : response.result.result,
						// pagination
						total   : response.result.total,
						limit 	: trigger_vars.limit,
						offset 	: trigger_vars.offset
					})
				}
		})

		return js_promise
	},//end search_rows



	/**
	* DRAW_ROWS
	*/
	draw_rows : function(options) {

		const self = this

		const ar_rows 		 = options.ar_rows || []
		const ar_rows_length = ar_rows.length


		// container select and clean container div
			const container = document.getElementById(options.target)
			while (container.hasChildNodes()) {
				container.removeChild(container.lastChild);
			}

		const fragment = new DocumentFragment();

		// pagination top
			const pagination_container = common.create_dom_element({
				element_type 	: "div",
				class_name 		: "pagination top"
			})
			pagination_container.appendChild( self.draw_paginator({
				total  		: options.total,
				limit  		: options.limit,
				offset 		: options.offset,
				count  		: ar_rows_length
			}))
			fragment.appendChild(pagination_container)

		// sort rows
			let collator = new Intl.Collator('es',{ sensitivity: 'base', ignorePunctuation:true});
			ar_rows.sort( (a,b) => {
					let order_a = a.autoria +" "+ a.fecha_publicacion
					let order_b = b.autoria +" "+ b.fecha_publicacion
					//console.log("order_a",order_a, order_b);
					//console.log(collator.compare(order_a , order_b));
				return collator.compare(order_a , order_b)
			});

		// rows build
			for (var i = 0; i < ar_rows_length; i++) {

				// Build dom row

				// item mints_object
					const mints_object = ar_rows[i]

					if(SHOW_DEBUG===true) {
						console.log("i mints_object:", i, mints_object);
					}

					// for(var a in mints_object) {
					// 	if (!mints_object[a] || mints_object[a].length<1) {
					// 		if (a.indexOf('dato')!==-1) {
					// 			// mints_object[a] = "Untitled " + a
					// 		}
					// 	}
					// }

				// wrapper
					const mints_row_wrapper = common.create_dom_element({
						  element_type 	: "div",
						  class_name 	: "mints_row_wrapper",
						  data_set 		: {
						  	section_id 	: mints_object.section_id
						  },
						  parent 		: fragment
					})

				// row_fields set
					const row_field = row_fields
						  row_field.mints_object = mints_object

				// author
					mints_row_wrapper.appendChild( row_field.author() )

				// publication_date
					mints_row_wrapper.appendChild( row_fields.publication_date() )

				// row_title
					mints_row_wrapper.appendChild( row_fields.row_title() )

				// row_body
					mints_row_wrapper.appendChild( row_fields.row_body() )

				// row_url
					mints_row_wrapper.appendChild( row_fields.row_url() )


				continue;


				// div body
					const row_body = common.create_dom_element({
						element_type 	: "div",
						class_name 		: "row_body",
						parent 			: mints_row_wrapper
					})

					// title
						const titulo = mints_object.titulo || ''
						common.create_dom_element({
							element_type 	: "h1",
							text_content 	: titulo,
							parent 			: row_body
						})

					// series_colecciones
						if (mints_object.series_colecciones || mints_object.numero_serie) {
							const series_info = []
							if (mints_object.series_colecciones) {
								 series_info.push(mints_object.series_colecciones)
							}
							if (mints_object.numero_serie) {
								 series_info.push(mints_object.numero_serie)
							}
							common.create_dom_element({
								element_type 	: "em",
								parent 			: row_body,
								class_name 		: "series_colecciones",
								text_content 	: series_info.join(" ")
							})
						}

					// lugar_publicacion
						if (mints_object.lugar_publicacion) {
							const line = common.create_dom_element({
								element_type 	: "div",
								class_name 		: "lugar_publicacion info_line",
								parent 			: row_body
							})
							// common.create_dom_element({
							// 	element_type 	: "div",
							// 	parent 			: line,
							// 	class_name 		: "info_label",
							// 	text_content 	: tstring["lugar_publicacion"]
							// })
							const coma = (mints_object.series_colecciones===false) ? '' : ', '
							common.create_dom_element({
								element_type 	: "div",
								class_name 		: "info_value",
								text_content 	: coma + mints_object.lugar_publicacion,
								parent 			: line
							})
						}

					// description_fisica
						if (mints_object.description_fisica) {
							const line = common.create_dom_element({
								element_type 	: "div",
								class_name 		: "description_fisica info_line",
								parent 			: row_body
							})
							// common.create_dom_element({
							// 	element_type 	: "div",
							// 	parent 			: line,
							// 	class_name 		: "info_label",
							// 	text_content 	: tstring["lugar_publicacion"]
							// })

							const coma = (mints_object.lugar_publicacion===false) ? '' : ', '
							common.create_dom_element({
								element_type 	: "div",
								class_name 		: "info_value",
								text_content 	: coma + mints_object.description_fisica,
								parent 			: line
							})
						}
				/*
				// notas
					// if (mints_object.nota_general) {
					// 	var line = common.create_dom_element({
					// 		element_type 	: "div",
					// 		parent 			: row_body,
					// 		class_name 		: "nota_general"
					// 		})
					// 		common.create_dom_element({
					// 			element_type 	: "div",
					// 			parent 			: line,
					// 			class_name 		: "info_label",
					// 			text_content 	: tstring["notas"]
					// 		})
					// 		common.create_dom_element({
					// 			element_type 	: "div",
					// 			parent 			: line,
					// 			class_name 		: "info_value",
					// 			text_content 	: mints_object.nota_general
					// 		})
					// }

				// codigo
					// if (mints_object.codigo) {
					// 	var line = common.create_dom_element({
					// 		element_type 	: "div",
					// 		parent 			: row_body,
					// 		class_name 		: "fecha_publicacion info_line"
					// 		})
					// 		common.create_dom_element({
					// 			element_type 	: "div",
					// 			parent 			: line,
					// 			class_name 		: "info_label",
					// 			text_content 	: tstring["codigo"]
					// 		})
					// 		common.create_dom_element({
					// 			element_type 	: "div",
					// 			parent 			: line,
					// 			class_name 		: "info_value",
					// 			text_content 	: mints_object.codigo
					// 		})
					// }
				*/
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
				n_nodes : 10,
				callback: (item) => {

					const offset = item.offset
					const total  = item.total

					// update search_options
						self.search_options.offset = offset
						self.search_options.total  = total

					// search (returns promise)
						const search = self.search_rows(self.search_options)

					// scroll page to navigato header
						search.then(function(response){
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



}//end mints
