/*global $, tstring, page_globals, SHOW_DEBUG, page, psqo_factory, __WEB_TEMPLATE_WEB__, Promise, common, WEB_AREA, document, DocumentFragment, tstring, console, form_factory, data_manager, tree_factory */
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
	set_up : function(options) { // async
		// console.log("-> thesaurus set_up options:", options);

		const self = this

		// options
			self.table		= options.table; // self table (array)
			self.root_term	= options.root_term; // self root_term (array)
			self.term_id	= options.term_id
			self.ar_fields	= options.ar_fields
			const rows_list	= options.rows_list

		// root_term catalog
			// if (WEB_AREA==='mints_hierarchy') {

			// 	self.root_term = await (async function(){

			// 		data_manager.request({
			// 			dedalo_get	: 'records',
			// 			db_name		: page_globals.WEB_DB,
			// 			table		: 'catalog',
			// 			ar_fields	: ['section_id'],
			// 			lang		: page_globals.WEB_CURRENT_LANG_CODE,
			// 			sql_filter	: 'parent_term_id=["hierarchy1_262"]',
			// 			limit		: 0,
			// 			count		: false
			// 		})
			// 		.then(function(response){
			// 			console.log("response:",response);
			// 		})
			// 	}) ()
			// }

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
				// console.log("/// load_tree_data response:",response);

				// result check
					if (!response.result) {
						console.error(`Invalid API response!`);
						return false
					}

				// check root_term
					const root_term_length = self.root_term.length
					for (let i = 0; i < root_term_length; i++) {
						const term_id = self.root_term[i]
						const found = response.result.find(el => el.term_id===term_id)
						if (!found) {
							console.error(`ERROR: Broken tree branch. Root term '${term_id}' not found! Check if it is published`);
							common.create_dom_element({
								element_type	: 'div',
								class_name		: 'broken_branch no_results_found',
								inner_html		: `Sorry. Broken branch <b>${term_id}</b>. Tree it is not available.`,
								parent			: rows_list
							})
							spinner.remove()
							return false
						}
					}

				// render data
					self.render_data({
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

		// const default_fields = [
			// 	'section_id',
			// 	'term_id',
			// 	'term',
			// 	'childrens',
			// 	'code',
			// 	'dd_relations',
			// 	'descriptor',
			// 	'illustration',
			// 	'indexation',
			// 	'model',
			// 	'norder',
			// 	'parent',
			// 	'related',
			// 	'scope_note',
			// 	'space',
			// 	'time',
			// 	'tld',
			// 	'mib_bibliography'
			// 	// 'relations'
			// ]

		// options
			const filter	= options.filter || null
			const ar_fields	= options.ar_fields || self.ar_fields || ["*"]
			const order		= options.order || "norder ASC"
			const table		= options.table || self.table.join(',')

		// sort vars
			const lang = page_globals.WEB_CURRENT_LANG_CODE

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

		// filter adds
			const filter_end = WEB_AREA==='mints_hierarchy'
				? (sql_filter ? " AND (term_table='mints')" : "(term_table='mints')")
				: sql_filter

		// debug
			if(SHOW_DEBUG===true) {
				// console.log("--- load_tree_data parsed sql_filter:")
				// console.log(sql_filter)
			}

		// request
			const body = {
				dedalo_get	: 'records',
				db_name		: page_globals.WEB_DB,
				table		: table,
				ar_fields	: ar_fields,
				lang		: lang,
				sql_filter	: filter_end,
				limit		: 0,
				// group	: (group.length>0) ? group.join(",") : null,
				count		: false,
				order		: order
			}
			if (WEB_AREA==='mints_hierarchy') {
				body.process_result	= {
					fn				: 'process_result::add_parents_or_children',
					columns_name	: ['parents']
				}
			}
			const js_promise = data_manager.request({
				body : body
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

				case 'tree':
				default:
					// const hilite_terms = (self.term_id)
					// 	? [self.term_id]
					// 	: null;
					self.data_clean	= page.parse_tree_data(
						ar_rows,
						(self.term_id) ? [self.term_id] : null, // hilite_terms,
						self.root_term
					) // prepares data to use in list
					if(SHOW_DEBUG===true) {
						// console.log("self.data_clean:",self.data_clean);
					}
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
						set_hilite	: set_hilite,
						render_node : self.render_tree_node
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
	* RENDER_TREE_NODE
	* @return DOM node tree_node
	*/
	render_tree_node : function(row) {

		const self = this // is 'tree_factory' instance

		// node wrapper
			const tree_node = common.create_dom_element({
				element_type	: "div",
				class_name		: "tree_node",
				id				: row.term_id
			})
			// add properties to node
			tree_node.term_id	= row.term_id
			tree_node.parent	= row.parent

		// term
			const term_value	= row.term //+ " <small>[" + row.term_id + "]</small>"
			const to_hilite		= (row.hilite && row.hilite===true)
			const term_css		= to_hilite===true ? " hilite" : ""
			const term = common.create_dom_element({
				element_type	: "span",
				class_name		: "term" + term_css,
				inner_html		: term_value,
				parent			: tree_node
			})

		// links based on WEB_AREA value (mints_hierarchy, symbols, iconography, countermarks)
			switch (WEB_AREA) {
				case 'mints_hierarchy':
					// link to mint
					if (row.term_table && row.term_table==='mints' && row.term_data && row.term_data[0]) {

						const link = common.create_dom_element({
							element_type	: "a",
							class_name		: "icon_link",
							parent			: term
						})
						link.addEventListener("click", function(){

							const url = 'mint/' + row.term_data[0]
							// const windowFeatures = "popup";
							window.open(url, "mint", null);
						})
					}
					break;

				case 'symbols':
					// catalog
					if (row.illustration && row.illustration.length>0) {
						// ref_type_symbol_obverse_data
						// ref_type_symbol_reverse_data

						// set node only when it is in DOM (to save browser resources)
							const observer = new IntersectionObserver(function(entries) {
								const entry = entries[1] || entries[0]
								if (entry.isIntersecting===true || entry.intersectionRatio > 0) {
									observer.disconnect();

									// delegates chek task to worker. When finish, show link button if target result exists
										const current_worker = new Worker(__WEB_TEMPLATE_WEB__ + '/thesaurus/js/worker.js');
										const body = {
											code		: page_globals.API_WEB_USER_CODE,
											lang		: page_globals.WEB_CURRENT_LANG_CODE,
											db_name		: page_globals.WEB_DB,
											dedalo_get	: 'records',
											table		: 'catalog',
											ar_fields	: ['section_id'],
											limit		: 1,
											count		: false,
											order		: 'lang ASC',
											sql_filter	: `(ref_type_symbol_obverse_data LIKE '%"${row.section_id}"%' OR ref_type_symbol_reverse_data LIKE '%"${row.section_id}"%')`
										}
										current_worker.postMessage({
											url		: page_globals.JSON_TRIGGER_URL,
											body	: body
										});
										current_worker.onmessage = function(e) {
											current_worker.terminate()

											const api_response = e.data
											if (api_response.result && api_response.result.length>0) {
												const link_symbols = common.create_dom_element({
													element_type	: "a",
													class_name		: "icon_link",
													parent			: term
												})
												link_symbols.addEventListener("click", function(){

													const filter = {
													  "$or": [
														{
														  "$and": [
															{
															  "$and": [
																{
																  "id": "ref_type_symbol_obverse_data",
																  "field": "ref_type_symbol_obverse_data",
																  "q": ""+row.section_id+"",
																  "q_type": "q",
																  "op": "LIKE"
																}
															  ]
															}
														  ]
														},
														{
														  "$and": [
															{
															  "$and": [
																{
																  "id": "ref_type_symbol_reverse_data",
																  "field": "ref_type_symbol_reverse_data",
																  "q": ""+row.section_id+"",
																  "q_type": "q",
																  "op": "LIKE"
																}
															  ]
															}
														  ]
														}
													  ]
													};
													const encoded_psqo = psqo_factory.encode_psqo(filter)
													const url = 'catalog/?psqo=' + encoded_psqo
													// const windowFeatures = "popup";
													window.open(url, "mint", null);
												})
											}
										}
								}
							}, { threshold: [0] });
							observer.observe(term);
					}
					break;

				case 'iconography':
					// catalog
					// if (!row.children || row.children.length===0) {
						// ref_type_design_obverse_iconography_data
						// ref_type_design_reverse_iconography_data

						// set node only when it is in DOM (to save browser resources)
							const observer = new IntersectionObserver(function(entries) {
								const entry = entries[1] || entries[0]
								if (entry.isIntersecting===true || entry.intersectionRatio > 0) {
									observer.disconnect();

									// delegates chek task to worker. When finish, show link button if target result exists
										const current_worker = new Worker(__WEB_TEMPLATE_WEB__ + '/thesaurus/js/worker.js');
										const body = {
											code		: page_globals.API_WEB_USER_CODE,
											lang		: page_globals.WEB_CURRENT_LANG_CODE,
											db_name		: page_globals.WEB_DB,
											dedalo_get	: 'records',
											table		: 'catalog',
											ar_fields	: ['section_id','ref_coins_image_obverse','ref_coins_image_reverse'],
											limit		: 1,
											count		: false,
											order		: 'lang ASC',
											sql_filter	: `(ref_type_design_obverse_iconography_data LIKE '%"${row.section_id}"%' OR ref_type_design_reverse_iconography_data LIKE '%"${row.section_id}"%')`
										}
										current_worker.postMessage({
											url		: page_globals.JSON_TRIGGER_URL,
											body	: body
										});
										current_worker.onmessage = function(e) {
											current_worker.terminate()

											const api_response = e.data
											if (api_response.result && api_response.result.length>0) {
												const link_iconography = common.create_dom_element({
													element_type	: "a",
													class_name		: "icon_link",
													parent			: term
												})
												link_iconography.addEventListener("click", function(){

													const filter = {
													  "$or": [
														{
														  "$and": [
															{
															  "$and": [
																{
																  "id": "ref_type_design_obverse_iconography_data",
																  "field": "ref_type_design_obverse_iconography_data",
																  "q": ""+row.section_id+"",
																  "q_type": "q",
																  "op": "LIKE"
																}
															  ]
															}
														  ]
														},
														{
														  "$and": [
															{
															  "$and": [
																{
																  "id": "ref_type_design_reverse_iconography_data",
																  "field": "ref_type_design_reverse_iconography_data",
																  "q": ""+row.section_id+"",
																  "q_type": "q",
																  "op": "LIKE"
																}
															  ]
															}
														  ]
														}
													  ]
													};
													const encoded_psqo = psqo_factory.encode_psqo(filter)
													const url = 'catalog/?psqo=' + encoded_psqo
													// const windowFeatures = "popup";
													window.open(url, "mint", null);
												})

												if (api_response.result[0].ref_coins_image_obverse) {
													const url		= api_response.result[0].ref_coins_image_obverse
													const url_thumb	= url.replace('/1.5MB/','/thumb/')
													const image	= common.create_dom_element({
														element_type	: "img",
														class_name		: 'illustration thumb_image',
														src				: page_globals.__WEB_BASE_URL__ + url_thumb,
														parent			: term
													})
													const outsideClickListener = (event) => {
														const target = event.target;
														if (target===image) {
															image.classList.toggle('big')
															image.src = page_globals.__WEB_BASE_URL__ + url
														}else{
															image.classList.remove('big')
															image.src = page_globals.__WEB_BASE_URL__ + url_thumb
														}
													}
													// document event click
													document.addEventListener('click', outsideClickListener)
												}
												if (api_response.result[0].ref_coins_image_reverse) {
													const url		= api_response.result[0].ref_coins_image_reverse
													const url_thumb	= url.replace('/1.5MB/','/thumb/')
													const image	= common.create_dom_element({
														element_type	: "img",
														class_name		: 'illustration thumb_image',
														src				: page_globals.__WEB_BASE_URL__ + url_thumb,
														parent			: term
													})
													const outsideClickListener = (event) => {
														const target = event.target;
														if (target===image) {
															image.classList.toggle('big')
															image.src = page_globals.__WEB_BASE_URL__ + url
														}else{
															image.classList.remove('big')
															image.src = page_globals.__WEB_BASE_URL__ + url_thumb
														}
													}
													// document event click
													document.addEventListener('click', outsideClickListener)
												}
											}
										}
								}
							}, { threshold: [0] });
							observer.observe(term);
					// }
					break;

				case 'countermarks':
					// coins
					if (row.illustration && row.illustration.length>0) {
						// countermark_obverse_data
						// countermark_reverse_data

						// set node only when it is in DOM (to save browser resources)
							const observer = new IntersectionObserver(function(entries) {
								const entry = entries[1] || entries[0]
								if (entry.isIntersecting===true || entry.intersectionRatio > 0) {
									observer.disconnect();

									// delegates chek task to worker. When finish, show link button if target result exists
										const current_worker = new Worker(__WEB_TEMPLATE_WEB__ + '/thesaurus/js/worker.js');
										const body = {
											code		: page_globals.API_WEB_USER_CODE,
											lang		: page_globals.WEB_CURRENT_LANG_CODE,
											db_name		: page_globals.WEB_DB,
											dedalo_get	: 'records',
											table		: 'coins',
											ar_fields	: ['section_id'],
											limit		: 1,
											count		: false,
											order		: 'lang ASC',
											sql_filter	: `(countermark_obverse_data LIKE '%"${row.section_id}"%' OR countermark_reverse_data LIKE '%"${row.section_id}"%')`
										}
										current_worker.postMessage({
											url		: page_globals.JSON_TRIGGER_URL,
											body	: body
										});
										current_worker.onmessage = function(e) {
											current_worker.terminate()

											const api_response = e.data
											if (api_response.result && api_response.result.length>0) {
												const link_countermarks = common.create_dom_element({
													element_type	: "a",
													class_name		: "icon_link",
													parent			: term
												})
												link_countermarks.addEventListener("click", function(){

													const filter = {
													  "$or": [
														{
														  "$and": [
															{
															  "$and": [
																{
																  "id": "countermark_obverse_data",
																  "field": "countermark_obverse_data",
																  "q": ""+row.section_id+"",
																  "q_type": "q",
																  "op": "LIKE"
																}
															  ]
															}
														  ]
														},
														{
														  "$and": [
															{
															  "$and": [
																{
																  "id": "countermark_reverse_data",
																  "field": "countermark_reverse_data",
																  "q": ""+row.section_id+"",
																  "q_type": "q",
																  "op": "LIKE"
																}
															  ]
															}
														  ]
														}
													  ]
													};
													const encoded_psqo = psqo_factory.encode_psqo(filter)
													const url = 'coins/?psqo=' + encoded_psqo
													// const windowFeatures = "popup";
													window.open(url, "mint", null);
												})
											}
										}
								}
							}, { threshold: [0] });
							observer.observe(term);
					}
					break;

				default:
					// nothing to do
					break;
			}

		// scroll
			// self.scrolled = false
			// if (to_hilite && self.scrolled===false) {
			// 	// console.log("to_hilite:",row.term, row.term_id);
			// 	common.when_in_dom(tree_node, function(){
			// 		tree_node.scrollIntoView()
			// 	})
			// 	self.scrolled = true
			// }

		// nd (no descriptor)
			if (row.nd && row.nd.length>0) {
				common.create_dom_element({
					element_type	: "span",
					class_name		: "nd",
					inner_html		: "[" + row.nd.join(", ") + "]",
					parent			: tree_node
				})
			}

		// illustration (svg)
			if (row.illustration && row.illustration.length>0) {
				const image = common.create_dom_element({
					element_type	: "img",
					class_name		: "illustration",
					src				: page_globals.__WEB_BASE_URL__ + row.illustration,
					parent			: tree_node
				})
				const outsideClickListener = (event) => {
					const target = event.target;
					if (target===image) {
						image.classList.toggle('big')
					}else{
						image.classList.remove('big')
					}
				}
				// document event click
				document.addEventListener('click', outsideClickListener)
			}

		// buttons
			// button scope_note
				if (row.scope_note && row.scope_note.length>0) {
					const btn_scope_note = common.create_dom_element({
						element_type	: "span",
						class_name		: "btn_scope_note",
						parent			: tree_node
					})
					btn_scope_note.addEventListener("mousedown", function(){
						if (this.classList.contains("open")) {
							scope_note.classList.add("hide")
							this.classList.remove("open")
						}else{
							scope_note.classList.remove("hide")
							this.classList.add("open")
						}
					})
				}

			// button relations
				let btn_relations
				if (row.relations && row.relations.length>0) {
					btn_relations = common.create_dom_element({
						element_type	: "span",
						class_name		: "btn_relations",
						// inner_html	: "Relations",
						parent			: tree_node
					})
					btn_relations.addEventListener("mousedown", function(){
						if (this.classList.contains("open")) {
							relations_container.classList.add("hide")
							this.classList.remove("open")
						}else{
							relations_container.classList.remove("hide")
							this.classList.add("open")
						}
					})
				}

			// button indexation
				let btn_indexation
				if (row.indexation && row.indexation.length>0) {
					btn_indexation = common.create_dom_element({
						element_type	: "span",
						class_name		: "btn_indexation",
						// inner_html	: "indexation",
						parent			: tree_node
					})
					btn_indexation.addEventListener("mousedown", function(){
						if (this.classList.contains("open")) {
							indexation_container.classList.add("hide")
							this.classList.remove("open")
						}else{
							indexation_container.classList.remove("hide")
							this.classList.add("open")
						}
					})
				}

			// button children
				if (row.children && row.children.length>0) {

					const open_style = row.state==="opened" ? " open" : ""
					const arrow = common.create_dom_element({
						element_type	: "span",
						class_name		: "arrow" + open_style,
						parent			: tree_node
					})
					arrow.addEventListener("mousedown", function(e){
						e.stopPropagation()

						// state  set based on current classList contains open/hide
							let new_state
							if (this.classList.contains("open")) {
								branch.classList.add("hide")
								this.classList.remove("open")
								// new_state
								new_state = "closed"
							}else{
								branch.classList.remove("hide")
								this.classList.add("open")
								// new_state
								new_state = "opened"
							}

						// state update (sessionStorage)
							const current_state = self.tree_state[row.term_id]
							if (current_state!==new_state) {
								// current_state.state = new_state
								self.tree_state[row.term_id] = new_state
								// update sessionStorage tree_state var
								sessionStorage.setItem('tree_state_' + WEB_AREA, JSON.stringify(self.tree_state));
							}
					})
				}

		// scope note wrapper
			let scope_note
			if (row.scope_note && row.scope_note.length>0) {

				const hide_style = row.state==="opened" ? "" : " hide"

				// scope_note
					const scope_note_text = row.scope_note.replace(/^\s*<br\s*\/?>|<br\s*\/?>\s*$/g,'');
					scope_note = common.create_dom_element({
						element_type	: "div",
						class_name		: "scope_note hide",
						inner_html		: scope_note_text,
						parent			: tree_node
					})
			}

		// relations wrapper
			let relations_container
			if (row.relations && row.relations.length>0) {

				// relations_container
					relations_container = common.create_dom_element({
						element_type	: "div",
						class_name		: "relations_container hide",
						parent			: tree_node
					})

					// Callback function to execute when mutations are observed
					const callback = function(mutationsList, observer) {
						// Use traditional 'for loops' for IE 11
						for(let mutation of mutationsList) {
							if (mutation.type==='attributes' && mutation.attributeName==='class') {
									// console.log('The ' + mutation.attributeName + ' attribute was modified.');
									// console.log("mutationsList:",mutationsList);
									// console.log("mutationsList.target:",mutationsList[0].target);
								if (!mutationsList[0].target.classList.contains("hide")) {

									// draw nodes
									self.render_relation_nodes(row, relations_container, self, false)

									// Stop observing
									observer.disconnect();
								}
							}
						}
					};

					// Create an observer instance linked to the callback function
					const observer = new MutationObserver(callback);

					// Start observing the target node for configured mutations
					observer.observe(relations_container, { attributes: true, childList: false, subtree: false });

					// console.log("self.hilite_relations_limit:",self.hilite_relations_limit, self.hilite_relations_showed);

					if (row.hilite===true && self.hilite_relations_showed<self.hilite_relations_limit) {
						// relations_container.classList.remove("hide")
						// btn_relations.click()
						relations_container.classList.remove("hide")
						btn_relations.classList.add("open")

						// increment hilite_relations_showed until reach self.hilite_relations_limit
						self.hilite_relations_showed++
					}
			}

		// indexation wrapper
			let indexation_container
			if (row.indexation && row.indexation.length>0) {

				// indexation_container
					indexation_container = common.create_dom_element({
						element_type	: "div",
						class_name		: "indexation_container hide",
						parent			: tree_node
					})

					// Callback function to execute when mutations are observed
					const callback = function(mutationsList, observer) {
						// Use traditional 'for loops' for IE 11
						for(let mutation of mutationsList) {
							if (mutation.type==='attributes' && mutation.attributeName==='class') {
									// console.log('The ' + mutation.attributeName + ' attribute was modified.');
									// console.log("mutationsList:",mutationsList);
									// console.log("mutationsList.target:",mutationsList[0].target);
								if (!mutationsList[0].target.classList.contains("hide")) {

									// draw nodes
									self.render_indexation_nodes(row, indexation_container, self)

									// Stop observing
									observer.disconnect();
								}
							}
						}
					};

					// Create an observer instance linked to the callback function
					const observer = new MutationObserver(callback);

					// Start observing the target node for configured mutations
					observer.observe(indexation_container, { attributes: true, childList: false, subtree: false });

					// console.log("self.hilite_indexation_limit:",self.hilite_indexation_limit, self.hilite_indexation_showed);

					if (row.hilite===true && self.hilite_indexation_showed<self.hilite_indexation_limit) {
						// indexation_container.classList.remove("hide")
						// btn_indexation.click()
						indexation_container.classList.remove("hide")
						btn_indexation.classList.add("open")

						// increment hilite_indexation_showed until reach self.hilite_indexation_limit
						self.hilite_indexation_showed++
					}
			}

		// children wrapper
			let branch
			if (row.children && row.children.length>0) {

				const hide_style = row.state==="opened" ? "" : " hide"

				// branch
					branch = common.create_dom_element({
						element_type	: "div",
						class_name		: "branch" + hide_style,
						parent			: tree_node
					})

				tree_node.branch = branch

			}else{

				tree_node.branch = null
			}


		return tree_node
	},//end render_tree_node



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
								// console.log("--- autocomplete api_response:",api_response);
								// console.log("autocomplete ar_result:",ar_result);
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

							if(!q_column || !row[q_column]){
								return false
							}

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
			// const filter		= self.build_filter()
			const form_items	= self.form.form_items
			const form_item		= form_items.term

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
						// console.log("--- form_submit response:",response)
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
