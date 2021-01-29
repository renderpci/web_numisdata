/*global tstring, page_globals, SHOW_DEBUG, common, page*/
/*eslint no-undef: "error"*/

"use strict";



var coins =  {



	/**
	* SET_UP
	* When the HTML page is loaded
	* @param object options
	*/
	set_up : function(options) {

		const self = this

		// options
			const form_container	= options.form_container
			const row_detail		= options.row_detail


		// form
			const form = self.render_form()
			form_container.appendChild(form)

		

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
		
	
		// public_info
			self.form.item_factory({
				id			: "public_info",
				name		: "public_info",
				label		: tstring.public_info || "public_info",
				q_column	: "public_info",
				eq			: "LIKE",
				eq_in		: "%",
				eq_out		: "%",
				parent		: form_row,
				callback	: function(node_input) {
					self.activate_autocomplete(node_input) // node_input is the form_item.node_input
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
				self.form_submit(form)
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
	* ACTIVATE_AUTOCOMPLETE
	*/
	activate_autocomplete : function(element) {

		const self = this

		// define current_form_item in this scope 
		// to allow acces from different places
		let current_form_item


		/*
		 * jQuery UI Autocomplete HTML Extension
		 *
		 * Copyright 2010, Scott González (http://scottgonzalez.com)
		 * Dual licensed under the MIT or GPL Version 2 licenses.
		 *
		 * http://github.com/scottgonzalez/jquery-ui-extensions
		 */
		(function( $ ) {

			var proto = $.ui.autocomplete.prototype,
				initSource = proto._initSource;

			function filter( array, term ) {
				var matcher = new RegExp( $.ui.autocomplete.escapeRegex(term), "i" );
				return $.grep( array, function(value) {
					return matcher.test( $( "<div>" ).html( value.label || value.value || value ).text() );
				});
			}

			$.extend( proto, {
				_initSource: function() {
					if ( this.options.html && $.isArray(this.options.source) ) {
						this.source = function( request, response ) {
							response( filter( this.options.source, request.term ) );
						};
					} else {
						initSource.call( this );
					}
				},

				_renderItem: function( ul, item) {					

					var final_label = item.label

					// remove empty values when separator is present						
						var ar_parts 	= final_label.split(' | ')
						var ar_clean 	= []
						for (var i = 0; i < ar_parts.length; i++) {
							var current = ar_parts[i]
							if (current.length>1 && current!=='<i>.</i>') {
								ar_clean.push(current)
							}
						}
						final_label = ar_clean.join(' | ') // overwrite

					return $( "<li></li>" )
						.data( "item.autocomplete", item )
						//.append( $( "<a></a>" )[ this.options.html ? "html" : "text" ]( item.label ) )
						.append( $( "<div></div>" )[ this.options.html ? "html" : "text" ]( final_label ) )
						.appendTo( ul );
				}
			});

		})( jQuery );


		const cache = {}
		$(element).autocomplete({
			delay		: 150,
			minLength	: 0,
			html		: true,
			source		: function( request, response ) {
				
				const term = request.term
				
				// fix selected form_item (needed to access from select)
				// current_form_item = self.form_items[element.id]
				// (!) fix selected form_item (needed to access from select)
				current_form_item = self.form.form_items[element.id]

				const field		= current_form_item.q_name // Like 'mint'
				const q_column	= current_form_item.q_column // Like 'term'

				// filter build 
					const op 	 = "AND"
					const filter = {}
						  filter[op] = []

					const value_parsed = (current_form_item.eq_in || '') + term + (current_form_item.eq_out || '%')

					// main column search item
						filter[op].push({
							field	: q_column,
							value	: `'${value_parsed}'`,
							op		: current_form_item.eq, // 'LIKE',
							group	: q_column
						})

					// optional second column 'term_table' search item. Add column name filter
						// const q_table	= current_form_item.q_table
						// if (q_table!=="any") {
						// 	filter[op].push({
						// 		field	: "term_table",
						// 		value	: `'${q_table}'`,
						// 		op		: '='
						// 	})
						// }

					// cross filter. Add other selected values to the filter to create a interactive filter					
						const c_op		= "OR"
						const c_filter	= {}
							  c_filter[c_op] = []
						for (let [id, form_item] of Object.entries(self.form.form_items)) {
							if (form_item.id===current_form_item.id) continue; // skip self

							// q . Value from input
								if (form_item.q.length>0) {

									const value = form_item.q

									c_filter[c_op].push({
										field	: form_item.q_column,
										value	: `'%${value}%'`,
										op		: "LIKE"
									})
								}

							// q_selected. Values from user already selected values
								if (form_item.q_selected.length>0) {
									for (let k = 0; k < form_item.q_selected.length; k++) {
										
										const value = form_item.q_selected[k]
										
										c_filter[c_op].push({
											field	: form_item.q_column,
											value	: (form_item.is_term===true) ? `'%"${value}"%'` : `'${value}'`,
											op		: (form_item.is_term===true) ? "LIKE" : "="
										})
									}
								}
						}
						if (c_filter[c_op].length>0) {
							filter[op].push(c_filter)
						}

					// cache . Use only when there are no cross filters
						if (filter[op].length===1) {
							if ( term in cache ) {
								if(SHOW_DEBUG===true) {
									console.warn("Returning values from cache:", cache[term])
								}
								response( cache[ term ] );
								return;
							}
						}
					
					// search
						self.search_rows({
							filter		: filter,
							ar_fields	: [q_column + " AS name"],
							limit		: 30,
							order		: "name ASC" // "term ASC"
						})
						.then((api_response) => { // return results in standard format (label, value)
								
							const ar_result	= []
							const len		= api_response.result.length
							for (let i = 0; i < len; i++) {
								
								const item = api_response.result[i]

								const current_ar_value = (item.name.indexOf("[\"")===0)
									? JSON.parse(item.name)
									: [item.name]
								
								for (let j = 0; j < current_ar_value.length; j++) {
								
									const item_name = current_ar_value[j]
									// const item_name = item.name.replace(/[\["|"\]]/g, '')

									const found = ar_result.find(el => el.value===item_name)
									if (!found) {
										ar_result.push({
											label	: item_name, // item_name,
											value	: item_name // item.name
										})
									}
								}
							}

							// parse result
								function parse_result(ar_result, term) {
									
									return ar_result.map(function(item){
										item.label	= item.label.replace(/<br>/g," ")
										item.label	= page.parse_legend_svg(item.label)
										return item
									})
									// const ar_final = []

									// for (let i = 0; i < ar_result.length; i++) {

									// 	const all_values = []
										
									// 	const current = ar_result[i].label

									// 	const ar_br = current.split("<br>");
									// 	for (let g = 0; g < ar_br.length; g++) {
									// 		all_values.push(ar_br[g])
									// 	}

									// 	// const ar_bar = current.split(" | ")
									// 	// for (let k = 0; k < ar_bar.length; k++) {
									// 	// 	all_values.push(ar_bar[k])
									// 	// }
											
									// 	for (let j = 0; j < all_values.length; j++) {
											
									// 		const value = all_values[j].trim();

									// 		if (ar_final.indexOf(value)===-1) {

									// 			let find = false
									// 			if (term.length>0) {
									// 				// remove accents from text
									// 				const value_normalized	= value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
									// 				// search by regex
									// 				const regex	= RegExp(term, 'i')
									// 				const find = regex.test(value_normalized)
									// 			}else{
									// 				find = true
									// 			}
												
									// 			if (find) {
									// 				ar_final.push(value)
									// 			}
									// 		}
									// 	}
									// }

									// // sort
									// 	ar_final.sort()

									
									// return ar_final
								}
								const ar_result_final = parse_result(ar_result, term)
									// console.log("ar_result_final:",ar_result_final);

							// cache . Use only when there are no cross filters
								if (filter[op].length===1) {
									cache[ term ] = ar_result_final
								}
							
							// debug
								if(SHOW_DEBUG===true) {
									// console.log("--- autocomplete api_response:",api_response);
									// console.log("autocomplete ar_result_final:",ar_result_final);
								}

							response(ar_result_final)
						})				
			},
			// When a option is selected in list
			select: function( event, ui ) {
				// prevent set selected value to autocomplete input
				event.preventDefault();		

				// self.set_value(this, ui.item.label, ui.item.value)
				self.add_selected_value(current_form_item, ui.item.label, ui.item.value)				
				
				// reset input value
				this.value = ''

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
			if ( event.keyCode===$.ui.keyCode.ENTER  ) {
				// prevent set selected value to autocomplete input
				//event.preventDefault();
				//var term = $(this).val();
				$(this).autocomplete('close')
			}//end if ( event.keyCode===$.ui.keyCode.ENTER  )
		})// bind
		.focus(function() {
		    $(this).autocomplete('search', null)
		})
		// .blur(function() {
		//     //$(element).autocomplete('close');
		// })


		return true
	},//end activate_autocomplete




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

		// parse_sql_filter
			const group = []
			const parse_sql_filter = function(filter){

				if (filter) {
					
					const op		= Object.keys(filter)[0]
					const ar_query	= filter[op]
					
					const ar_filter = []
					const ar_query_length = ar_query.length
					for (let i = 0; i < ar_query_length; i++) {
						
						const item = ar_query[i]

						const item_op = Object.keys(item)[0]
						if(item_op==="AND" || item_op==="OR") {

							const current_filter_line = "" + parse_sql_filter(item) + ""
							ar_filter.push(current_filter_line)
							continue;
						}

						let filter_line
						if (item.op==='MATCH') {
							filter_line = "MATCH (" + item.field + ") AGAINST ("+item.value+" IN BOOLEAN MODE)"
						}else{
							filter_line = (item.field.indexOf("AS")!==-1)
								? "" +item.field+""  +" "+ item.op +" "+ item.value
								: "`"+item.field+"`" +" "+ item.op +" "+ item.value	
						}

						ar_filter.push(filter_line)

						// group
							if (item.group) {
								group.push(item.group)
							}
					}
					return ar_filter.join(" "+op+" ")
				}

				return null
			}

		// parsed_filters
			const sql_filter = parse_sql_filter(filter)

		// debug
			if(SHOW_DEBUG===true) {
				console.log("--- search_rows parsed sql_filter:")
				console.log(sql_filter)
			}		
		
		const js_promise = data_manager.request({
			body : {
				dedalo_get		: 'records',
				table			: 'coins',
				ar_fields		: ar_fields,
				lang			: lang,
				sql_filter		: sql_filter,
				limit			: limit,
				// group			: (group.length>0) ? group.join(",") : null,
				count			: false,
				order			: order,
				// process_result	: process_result
			}
		})
		// js_promise.then((response)=>{
		// 	// console.log("--- search_rows API response:",response);
		// })
		

		return js_promise
	},//end search_rows



	
}//end coins
