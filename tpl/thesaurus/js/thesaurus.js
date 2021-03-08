/*global $, tstring, page_globals, SHOW_DEBUG, page, Promise, common, document, DocumentFragment, tstring, console, form_factory, data_manager, tree_factory */
/*eslint no-undef: "error"*/
/*jshint esversion: 6 */
"use strict";



var thesaurus =  {
	

	/**
	* VARS
	*/
		// search_options
		search_options : {},

		// view_mode. rows view mode. default is 'list'. Others could be 'map', 'timeline' ..
		view_mode : null,

		// global filters
		filters		: {},
		filter_op	: "AND",
		draw_delay	: 200, // ms

		// form. instance of form_factory
		form : null, 

		// list. instance of form_list
		list : null,
		
		// map. instance of form_map
		map : null,

		// timeline. instance of form_timeline
		timeline : null,

		// table (array)
		table : [],

		// root_term (array)
		root_term : [],


		// term_id (from url get request)
		term_id : null,



	/**
	* SET_UP
	*/
	set_up : function(options) {
		console.log("-> thesaurus set_up options:", options);

		const self = this

		// options
			self.table		= options.table; // self table (array)
			self.root_term	= options.root_term; // self root_term (array)
			self.term_id	= options.term_id
			const rows_list	= options.rows_list

		// set view_mode default
			self.view_mode = 'tree'

		// spinner
			const spinner = common.create_dom_element({
				element_type	: "div",
				class_name		: "spinner"
			})

		// form. Created DOM form
			self.render_form({
				container : document.getElementById("items_container")
			})
			.then(function(){
				rows_list.appendChild(spinner)
			})
	
		// tree. load tree data and render tree nodes
			self.load_tree_data({})
			.then(function(response){
				console.log("/// load_tree_data response:",response);
				
				const render = self.render_data({
					target		: rows_list,
					ar_rows		: response.result,
					set_hilite	: (self.term_id && self.term_id.length>0)
				})
				.then(function(){
					spinner.remove()
				})
			})


		return true
	},//end set_up



	/**
	* LOAD_TREE_DATA
	* Call to API and load json data results of search
	*/
	load_tree_data : function(options) {

		const self = this

		const default_fields = [
			'section_id',
			'term_id',
			'term',
			'childrens',
			'code',
			'dd_relations',
			'descriptor',
			'illustration',
			'indexation',
			'model',
			'norder',
			'parent',
			'related',
			'scope_note',
			'space',
			'time',
			'tld',
			'mib_bibliography'
			// 'relations'
		]

		// sort vars
			const filter	= options.filter || null
			const ar_fields	= options.ar_fields || default_fields || ["*"]
			const order		= options.order || "norder ASC"
			const lang		= page_globals.WEB_CURRENT_LANG_CODE
			const table		= options.table || self.table.join(',')
		
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

							const current_filter_line = "(" + parse_sql_filter(item) + ")"
							ar_filter.push(current_filter_line)
							continue;
						}

						const filter_line = (item.field.indexOf("AS")!==-1)
							? "" +item.field+""  +" "+ item.op +" "+ item.value
							: "`"+item.field+"`" +" "+ item.op +" "+ item.value

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
				// console.log("--- load_tree_data parsed sql_filter:")
				// console.log(sql_filter)
			}

		// request
			const js_promise = data_manager.request({
				body : {
					dedalo_get	: 'records',
					db_name		: page_globals.WEB_DB,
					table		: table,
					ar_fields	: ar_fields,
					lang		: lang,
					sql_filter	: sql_filter,
					limit		: 0,
					// group	: (group.length>0) ? group.join(",") : null,
					count		: false,
					order		: order
				}
			})
			// js_promise.then((response)=>{
			// 	console.log("--- load_tree_data API response:",response);
			// 	if (response.result) {
			// 		sessionStorage.setItem('tree_data', JSON.stringify(response.result));
			// 	}
			// })
		

		return js_promise
	},//end load_tree_data



	/**
	* RENDER_DATA
	* Render received DB data based on 'view_mode' (list, map, timeline)
	* @return bool
	*/
	render_data : function(options) {
		
		const self = this

		return new Promise(function(resolve){

			const ar_rows	= options.ar_rows
			const target	= common.is_node(options.target)
				? options.target
				: document.getElementById(options.target)
				// modify element class
				target.className = ""; // reset target class
				target.classList.add(self.view_mode)

			const set_hilite = options.set_hilite || false

			const view_mode	= self.view_mode
			const root_term	= self.root_term

			switch(view_mode) {
				
				default:
				case 'tree':
					const hilite_terms = self.term_id
						? [self.term_id]
						: null
					self.data_clean	= page.parse_tree_data(ar_rows, hilite_terms) // prepares data to use in list
						console.log("self.data_clean:",self.data_clean);
					// temporal 
						// console.log("self.data_clean:",self.data_clean);
						// for (let i = 0; i < self.clean_data.length; i++) {
						// 	const relations = self.clean_data[i]
						// 	if (relations && relations.length>0) {
						// 		const ar = []
						// 		for (let h = 0; h < relations.length; h++) {
									
						// 			const id = relations[h].section_id + '_' + relations[h].section_tipo
						// 			if (ar.indexOf(id)!==-1) {
						// 				console.warn("Error. Duplicated itme:", id, self.clean_data[i]);
						// 			}else{
						// 				ar.push(id)
						// 			}
						// 		}
						// 	}
						// }
					self.tree		= self.tree || new tree_factory() // creates / get existing instance of tree
					self.tree.init({
						target		: target,
						data		: self.data_clean,
						root_term	: root_term,
						set_hilite	: set_hilite
					})
					self.tree.render()
					.then(function(){
						resolve(true)
					})
					break;
			}
		})
	},//end render_data



	/**
	* RENDER_FORM
	* Create logic and view of search 
	*/
	render_form : function(options) {

		const self = this

		return new Promise(function(resolve){

			const fragment = new DocumentFragment()
			
			// form_factory instance
				self.form = self.form || new form_factory()
				
			// inputs		

				// global_search
					const global_search_container = common.create_dom_element({
						element_type	: "div",
						class_name		: "global_search_container form-row fields",
						parent			: fragment
					})
					// input global search
						self.form.item_factory({
							id			: "term",
							name		: "term",
							class_name	: 'global_search',
							label		: tstring.term || "Term",
							q_column	: "term",
							eq			: "LIKE",
							eq_in		: "%",
							eq_out		: "%",
							// q_table	: "catalog",
							parent		: global_search_container,
							callback	: function(form_item) {
								const node_input = form_item.node_input
								self.activate_autocomplete(node_input) // node_input is the form_item.node_input
							}					
						})
					// button hide toggle advanced
						// const button_show_advanced = common.create_dom_element({
						// 	element_type	: "input",
						// 	type			: "button",
						// 	class_name		: "",
						// 	value			: tstring.advanced || "Advanced",
						// 	parent			: fragment
						// })
						// button_show_advanced.addEventListener("click", function(){
						// 	advanced_search_container.classList.toggle("hide")
						// })
				
			
			// submit button
				const submit_group = common.create_dom_element({
					element_type	: "div",
					class_name 		: "form-group submit field",
					parent 			: fragment
				})
				const submit_button = common.create_dom_element({
					element_type	: "input",
					type 			: "submit",
					id 				: "submit",
					value 			: tstring["buscar"] || "Search",
					class_name 		: "btn btn-light btn-block primary",
					parent 			: submit_group
				})
				submit_button.addEventListener("click",function(e){
					e.preventDefault()
					self.form_submit()
				})

			
			// form_node
				self.form.node = common.create_dom_element({
					element_type	: "form",
					id				: "search_form",
					class_name		: "form-inline form_factory"
				})
				self.form.node.appendChild(fragment)

			
			// add node
				options.container.appendChild(self.form.node)

			resolve(self.form.node)
		})
	},//end render_form



	/**
	* ACTIVATE_AUTOCOMPLETE
	*/
	activate_autocomplete : function(element) {

		const self = this
		
		// (!) define current_form_item in this scope to allow set and access from different places
		let current_form_item
		
		const cache = {}
		$(element).autocomplete({
			delay 	 : 150,
			minLength: 1,
			source 	 : function( request, response ) {
				
				const term = request.term
				
				// (!) fix selected form_item (needed to access from select)
				current_form_item	= self.form.form_items[element.id]
				const q_column		= current_form_item.q_column // Like 'term'
					
				// search
					self.search_rows({
						q			: term,
						q_column	: q_column,
						limit		: 25
					})			
					.then((api_response) => {

						// return results in standard format (label, value)	

						const ar_result = []
						const len  		= api_response.result.length
						for (let i = 0; i < len; i++) {
							
							const item = api_response.result[i]

							ar_result.push({
								label : item.label,
								value : item.value
							})
							
							// const current_ar_value = (item.name.indexOf("[")===0)
							// 	? JSON.parse(item.name)
							// 	: [item.name]
															
							// for (let j = 0; j < current_ar_value.length; j++) {
							
							// 	const item_name = current_ar_value[j]
							// 	// const item_name = item.name.replace(/[\["|"\]]/g, '')

							// 	const found = ar_result.find(el => el.value===item_name)
							// 	if (!found) {
							// 		ar_result.push({
							// 			label : item_name, // item_name,
							// 			value : item_name // item.name
							// 		})
							// 	}
							// }
						}

						// cache . Use only when there are no cross filters
							// if (filter[op].length===1) {
								// cache[ term ] = ar_result
							// }
						
						// debug
							if(SHOW_DEBUG===true) {
								console.log("--- autocomplete api_response:",api_response);
								console.log("autocomplete ar_result:",ar_result);
							}

						response(ar_result)
					})
			},
			// When a option is selected in list
			select: function( event, ui ) {
				// prevent set selected value to autocomplete input
				event.preventDefault();		

				// add_selected_value . Create input and button nodes and add it to current_form_item
				self.form.add_selected_value(current_form_item, ui.item.label, ui.item.value)		
				
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
		.blur(function() {
			//$(element).autocomplete('close');
		})


		return true
	},//end activate_autocomplete



	/**
	* SEARCH_ROWS
	* @return promise
	*	resolve array of objects
	*/
	search_rows : function(options) {
		// console.log("----> search_rows options:",options);

		const self = this

		return new Promise(function(resolve){
			const t0 = performance.now()			
	
			const q				= options.q
			const q_column		= options.q_column
			const q_selected	= options.q_selected || null
			const limit			= options.limit

			// data . Simplifies data format (allways on data_clean)
			const data = self.data_clean.map(item => {
				const element = {
					term		: item.term,
					scope_note	: item.scope_note,
					parent		: item.parent,
					term_id		: item.term_id,
					nd			: item.nd
				}
				return element
			})			

			// find_text
				let counter = 1
				function find_text(row) {

					if (limit>0 && counter>limit) {
						return false
					}

					let find = false

					// q try
						if (q && q.length>0) {

							// remove accents from text
							const text_normalized = row[q_column].normalize("NFD").replace(/[\u0300-\u036f]/g, "")
							
							const regex	= RegExp(q, 'i')
							find = regex.test(text_normalized)

							// try with nd
								if (!find && row.nd && row.nd.length>0) {
									for (let k = 0; k < row.nd.length; k++) {
										// console.log("row.nd[k]:",row.nd[k]);
										const text_normalized = row.nd[k].normalize("NFD").replace(/[\u0300-\u036f]/g, "")
							
										find = regex.test(text_normalized)

										if (find===true) {
											break;
										}
									}
								}
						}
					
					// q_selected try. Check user selections from autocomplete
						if (!find && q_selected) {
							for (let i = 0; i < q_selected.length; i++) {
								if(row.term_id===q_selected[i]) {
									find = true
									break;
								}
							}
						}

					if (find===true) {
						counter++;
					}

					return find
				}

			// found filter
				const found = data.filter(find_text)

			// result . Format result array to allow autocomplete to manage it
				const result = found.map(item => {

					// parent info (for desambiguation)
						const parent_term_id	= item.parent[0]
						const parent_row		= self.data_clean.find(el => el.term_id===parent_term_id)
						const parent_label		= parent_row ? (" (" + parent_row.term +")") : ''
						const nd_text			= item.nd ? (' ['+item.nd.join(', ')+']') : ''
					
					const label = item.term + nd_text + parent_label

					const element = {
						label	: label,
						value	: item.term_id
					}
					return element
				})

			// response. Format like a regular database result from API
				const response = {
					result	: result,
					debug	: {
						time : performance.now()-t0
					}
				}

			resolve(response)
		})
	},//end search_rows



	/**
	* FORM_SUBMIT
	* Form submit launch search
	*/
	form_submit : function() {
		
		const self = this

		// filter. Is built looking at form input values
			// const filter = self.build_filter()
			const form_items	= self.form.form_items
			const form_item		= form_items.term
				console.log("form_items:",form_items);
				console.log("form_item:",form_item);			
			
		// search rows exec against API
			const js_promise = self.search_rows({
				q			: form_item.q,
				q_column	: form_item.q_column,
				q_selected	: form_item.q_selected,
				limit		: 0
			})
			.then((response)=>{

				// debug
					if(SHOW_DEBUG===true) {
						console.log("--- form_submit response:",response)
					}

				const to_hilite = response.result.map(el => el.value)

				// remove self.term_id to avoid hilite again
					self.term_id = null


				// rows_list_node
					const rows_list_node	= document.getElementById('rows_list')
					while (rows_list_node.hasChildNodes()) {
						rows_list_node.removeChild(rows_list_node.lastChild);
					}
					// add spinner
						const spinner	= common.create_dom_element({
							element_type	: "div",
							id				: "spinner",
							class_name		: "spinner",
							parent			: rows_list_node
						})

				// load_tree_data
					self.load_tree_data({})
					.then(function(response){
						// console.log("/// load_tree_data response:",response);
						// console.log("to_hilite:",to_hilite);

						// const ar_rows = response.result
						const ar_rows = response.result.map(function(row){
							if (to_hilite.indexOf(row.term_id)!==-1) {
								row.hilite	= true
								row.status	= "closed"
							}
							return row
						})
						
						// render_data						
							self.render_data({
								target		: rows_list_node,
								ar_rows		: ar_rows,
								set_hilite	: true
							})
							.then(function(){
								spinner.remove()
							})
					})					
			})		


		return js_promise
	}//end form_submit



}//end thesaurus