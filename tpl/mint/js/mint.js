/*global tstring, page_globals, SHOW_DEBUG, IS_PRODUCTION, event_manager, map_factory, biblio_row_fields, data_manager, dedalo_logged, Promise, common, page, console, mint_row, catalog, die_estimation, DocumentFragment  */
/*eslint no-undef: "error"*/
"use strict";



var mint = {


	/**
	* VARS
	*/
		section_id				: null,
		export_data_container	: null,
		row_detail				: null,
		map_container			: null, // DOM node
		map 					: null,


	/**
	* SET_UP
	* When the HTML page is loaded
	*/
	set_up : function(options) {

		const self = this

		// options
			self.export_data_container	= options.export_data_container
			self.row_detail				= options.row_detail
			self.section_id				= options.section_id
			self.map_container			= options.map_container
			self.map 					= null

		// print button
			if (dedalo_logged===true) {
				const print_button = self.render_print_button()
				self.export_data_container.appendChild(print_button)
			}

		// export_data_buttons added once
			const export_data_buttons = page.render_export_data_buttons()
			self.export_data_container.appendChild(export_data_buttons)
			self.export_data_container.classList.add('hide')

		// suggestions_form_button
			const contact_form_button = page.create_suggestions_button()
			self.export_data_container.appendChild(contact_form_button)

		if (self.section_id) {

			// search by section_id
			self.get_row_data({
				section_id : self.section_id
			})
			.then(function(response){
				if(SHOW_DEBUG===true) {
					console.log("--> set_up get_row_data API response.result:", response.result);
				}

				// mint draw (get data from request combi -> id : mint)
					const mint = response.result.find( el => el.id==='mint')
					const mint_data = page.parse_mint_data(mint.result[0])

					// Check record exists
					if (!mint_data) {
						const title = document.getElementById('title')
						if(title) title.textContent = 'Error'
						self.row_detail.textContent = 'This record does not exist: ' + self.section_id
						console.error('This record does not exist:', self.section_id);
						return
					}

					self.draw_row({
						target	: self.row_detail,
						ar_rows	: [mint_data]
					})

				// map draw
					if (typeof mint.result[0]!=="undefined") {
						if (mint_data.georef_geojson) {
							const public_info = mint_data.public_info
								? mint_data.public_info.trim()
								: ''
							self.draw_map({
								mint_map_data	: mint_data.georef_geojson,
								mint_popup_data	: {
									section_id	: mint_data.section_id,
									title		: mint_data.name,
									description	: public_info
								},
								types			: mint_data.relations_types
							})

							// window.addEventListener('beforeprint', async function(e) {

							// 	self.map_container.style.width = '210mm'
							// 	self.map_container.style.height = '120mm'

							// 	await self.map.map.invalidateSize()
							// 	await self.map.map.fitBounds(self.map.feature_group.getBounds())

							// })

							// window.addEventListener('afterprint', async function(e) {

							// 	self.map_container.style.width	= null
							// 	self.map_container.style.height	= null

							// 	await self.map.map.invalidateSize()
							// 	await self.map.map.fitBounds(self.map.feature_group.getBounds())

							// })
						}
					}

				// types draw (get data from request combi -> id : mint_catalog)
					const mint_catalog = response.result.find( el => el.id==='mint_catalog')
					if (mint_catalog.result) {
						const _mint_catalog = mint_catalog.result.find(el => el.term_table==='mints')
						if (_mint_catalog && _mint_catalog.section_id) {

							// set mint section_id
							self.mint_section_id = _mint_catalog.section_id

							self.get_types_data2({
								section_id : _mint_catalog.section_id
							})
							.then(async function(ar_rows){

								// self.draw_types({
								// 	target	: document.getElementById('types'),
								// 	ar_rows	: ar_rows
								// })

								// RESTORE term_section_id info
								for (let i=0;i<ar_rows.length;i++){
									ar_rows[i].catalog_info = ar_rows[i].term_section_id
									//result[i].term_section_id = result[i].term_section_id.section_id
								}

								// types. Reuse the /catalog card design so both pages stay visually consistent
								const types_container = document.getElementById('types')
								if (types_container) {
									self.draw_types({
										ar_rows	: ar_rows,
										target	: types_container
									})
								}

								// types print
								const types_print_container = document.getElementById('types_print')
								if(types_print_container) {
									const rect = types_print_container.getBoundingClientRect();
									page_globals.types_print_left = rect.left; // fix left position

									const types_node_print = await mint_row.render_type_print(
										ar_rows
									)
									if (types_node_print) {
										types_print_container.appendChild(types_node_print)
									}
								}

								// die estimation (statistical estimation of the number of dies)
								self.draw_die_estimation(ar_rows)
							})
						}else{
							console.warn("Ignored invalid _mint_catalog:",_mint_catalog);
							console.warn("mint_catalog:",mint_catalog);
						}
					}

				// send event data_request_done (used by buttons download)
					event_manager.publish('data_request_done', {
						request_body        : null,
						result				: {
							mint			: mint.result,
							mint_catalog	: mint_catalog.result
						},
						export_data_parser	: page.export_parse_mint_data
					})

				// show export_data_container
					self.export_data_container.classList.remove('hide')
			})
		}
		else{
			self.row_detail.innerHTML = 'Error. Invalid section_id'
		}

		// navigate records group
			// document.onkeyup = function(e) {
			// 	if (e.which == 37) { // arrow left <-
			// 		let button = document.getElementById("go_prev")
			// 		if (button) button.click()
			// 	}else if (e.which == 39) { // arrow right ->
			// 		let button = document.getElementById("go_next")
			// 		if (button) button.click()
			// 	}
			// }

		// beforeprint event. Forces the page to scroll to the bottom and load all coin images
		window.addEventListener('beforeprint', (e) => {
			window.scrollTo(0, document.body.scrollHeight);

			// hide types and bibliography
			if (dedalo_logged!==true) {
				['types_print','biblio_print','row_detail'].forEach(el => {
					const node = document.getElementById(el)
					if (node) {
						node.style.visibility = 'hidden'
						node.classList.add('print_hide')
					}
				})
			}
		});

		// afterprint
		window.addEventListener("afterprint", (e) => {

			// show types and bibliography
			if (dedalo_logged!==true) {
				['types_print','biblio_print','row_detail'].forEach(el => {
					const node = document.getElementById(el)
					if (node) {
						node.style.visibility = ''
						node.classList.remove('print_hide')
					}
				})
			}
		})


		return true
	},//end set_up



	/**
	* GET_ROW_DATA
	* Get database mint row from table mints and catalog
	* @return promise
	*/
	get_row_data : function(options) {

		const section_id = options.section_id

		// combined call
			const ar_calls = []

		// mints call
			ar_calls.push({
				id		: "mint",
				options	: {
					dedalo_get				: 'records',
					table					: "mints",
					db_name					: page_globals.WEB_DB,
					lang					: page_globals.WEB_CURRENT_LANG_CODE,
					ar_fields				: [
						'section_id',
						'lang',
						'name',
						'place_data',
						'place',
						'public_info',
						'bibliography_data',
						'map',
						'uri',
						'indexation',
						'indexation_data',
						'georef_geojson',
						'relations_types',
						'authorship_data',
						// 'authorship_date'
						'authorship_names',
						'authorship_surnames',
						'authorship_entity',
						'authorship_roles',
						'change_to_uri',
						'related',
						'related_data'
					],
					sql_filter				: "section_id = " + parseInt(section_id),
					count					: false,
					resolve_portals_custom	: {
						bibliography_data : 'bibliographic_references'
					}
				}
			})

		// mint in catalog call
			ar_calls.push({
				id		: "mint_catalog",
				options	: {
					dedalo_get	: 'records',
					table		: 'catalog',
					db_name		: page_globals.WEB_DB,
					lang		: page_globals.WEB_CURRENT_LANG_CODE,
					ar_fields	: ['section_id','term','term_table'],
					count		: false,
					limit		: 0,
					sql_filter	: "term_data='[\"" + parseInt(section_id) + "\"]'"
				}
			})

		// catalog call
			// ar_calls.push({
			// 	id		: "types",
			// 	options	: {
			// 		dedalo_get				: 'records',
			// 		table					: 'types',
			// 		db_name					: page_globals.WEB_DB,
			// 		lang					: page_globals.WEB_CURRENT_LANG_CODE,
			// 		ar_fields				: ['*'],
			// 		count					: false,
			// 		limit					: 2000,
			// 		sql_filter				: "mint_data LIKE '[\"" + parseInt(section_id) + "\"]'",
			// 		resolve_portals_custom	: {
			// 			"parents" : "catalog"
			// 		}
			// 	}
			// })

		// request
			const js_promise = data_manager.request({
				body : {
					dedalo_get	: 'combi',
					ar_calls	: ar_calls
				}
			})


		return js_promise
	},//end get_row_data



	/**
	* GET_TYPES_DATA2
	* @return
	*/
	get_types_data2 : function(options) {

		const section_id = options.section_id

		return new Promise(function(resolve){

			// request
			const request_body = {
				dedalo_get	: 'records',
				table		: 'catalog',
				ar_fields	: ['*'],
				lang		: page_globals.WEB_CURRENT_LANG_CODE,
				sql_filter	: "section_id = " + parseInt(section_id),
				limit		: 0,
				group		: null,
				count		: false,
				order		: 'norder ASC',
				resolve_portals_custom	: {
					term_data : 'types'
				},
				process_result	: {
					fn 		: 'process_result::add_parents_and_children_recursive',
					columns : [{name : "parents"}]
				}
			}
			data_manager.request({
				body : request_body
			})
			.then(function(response){
				// console.log("++++++++++++ request_body:",request_body);
				 // console.log("get_types_data2 API response:",response);

				const parsed_data = response.result
					? page.parse_catalog_data(response.result)
					: null

				resolve(parsed_data)
			})
		})
	},//end get_types_data2



	/**
	* DRAW_TYPES
	* Renders the mint's coin production, reusing the same catalog card renderer as /catalog
	* (catalog.draw_rows / catalog_row_fields.draw_item) so both pages stay visually consistent.
	* @param object options
	* 	options.ar_rows : array of catalog rows (mint + its periods/groups/types), as returned by get_types_data2
	* 	options.target : container DOM node to render into
	* @return promise
	*/
	draw_types : function(options) {

		// options
			const ar_rows	= options.ar_rows
			const target	= options.target

		// clean container
			while (target.hasChildNodes()) {
				target.removeChild(target.lastChild);
			}

		// label
			const typesLabel = tstring.coin_production || "Coin production"
			const lineSeparator = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line separator",
				parent 			: target
			})
			common.create_dom_element({
				element_type 	: "label",
				class_name 		: "big_label",
				text_content 	: typesLabel,
				parent 			: lineSeparator
			})

		// rows. Same renderer /catalog uses, so cards (images, term info, weight/diameter, etc.) match exactly
			const rows_container = common.create_dom_element({
				element_type	: "div",
				id				: "mint_types_rows",
				parent			: target
			})

		return catalog.draw_rows({
			target	: rows_container,
			ar_rows	: ar_rows
		})
	},//end draw_types


	/**
	* DRAW_DIE_ESTIMATION
	* Renders the "statistical estimation of the number of dies" regression charts
	* (Anverso / Reverso) when the mint has types with calculable reference data.
	* @param array ar_rows
	* @return void
	*/
	draw_die_estimation : function(ar_rows) {

		// only available in PRE (regression_vars record lives in web_numisdata_mib_pre)
		if (IS_PRODUCTION===true) {
			return
		}

		const container = document.getElementById('die_estimation_chart_container')
		const section   = document.getElementById('die_estimation')
		if (!container || !section) {
			return
		}

		// only draw when there is at least one type with calculable reference data
		const calculable = (ar_rows || []).filter(function(el){
			return el.full_coins_reference_calculable && el.full_coins_reference_calculable.length > 0
		})
		if (calculable.length < 1) {
			return
		}

		section.classList.remove('hide')

		if (typeof die_estimation === 'undefined' || typeof die_estimation.plot_rev_and_anv !== 'function') {
			console.error('die_estimation module not loaded')
			return
		}

		// data table (collapsible) + CSV download
		const table_container  = document.getElementById('die_estimation_table_container')
		const table_toggle     = document.getElementById('die_estimation_table_toggle')
		const table_download   = document.getElementById('die_estimation_table_download')

		if (table_toggle && table_container) {
			table_toggle.addEventListener('click', function(){
				const is_hidden = table_container.classList.toggle('hide')
				table_toggle.setAttribute('aria-expanded', String(!is_hidden))
				const icon = table_toggle.querySelector('.regression_table_toggle_icon')
				if (icon) {
					icon.textContent = is_hidden ? '\u25B6' : '\u25BC'
				}
			})
		}

		if (table_download && table_container) {
			table_download.addEventListener('click', function(){
				die_estimation.download_table_csv(table_container)
			})
		}

		die_estimation.plot_rev_and_anv(container, ar_rows, {
			table_container  : table_container || null,
			download_button  : table_download || null
		})
			.catch(function(err){
				if (SHOW_DEBUG===true) {
					console.error('draw_die_estimation error:', err)
				}
			})
	},//end draw_die_estimation


	/**
	* GET_TYPES_DATA
	*
	*/
		// get_types_data : function(options) {

		// 	const self = this

		// 	const section_id = options.section_id

		// 	return new Promise(function(resolve){
		// 		// request
		// 			const js_promise = data_manager.request({
		// 				body : {
		// 					dedalo_get	: 'records',
		// 					table		: 'catalog',
		// 					db_name		: page_globals.WEB_DB,
		// 					lang		: page_globals.WEB_CURRENT_LANG_CODE,
		// 					ar_fields	: ['section_id','norder','term_data','ref_type_denomination','term','term_table','parent','parents','children','ref_coins_image_obverse','ref_coins_image_reverse','ref_type_averages_diameter','ref_type_averages_weight','ref_type_material','ref_mint_number'],
		// 					count		: false,
		// 					limit		: 0,
		// 					order		: "norder ASC",
		// 					sql_filter	: "(term_table='types' OR term_table='ts_numismatic_group' OR term_table='ts_period') AND parents LIKE '%\"" + parseInt(section_id) + "\"%'",
		// 					resolve_portals_custom	: {
		// 						"parent" : "catalog"
		// 						//"children"	: "catalog"
		// 					}

		// 					// dedalo_get	: 'records',
		// 					// table		: 'catalog',
		// 					// db_name		: page_globals.WEB_DB,
		// 					// lang		: page_globals.WEB_CURRENT_LANG_CODE,
		// 					// ar_fields	: ['section_id','term_data','ref_type_denomination','term','term_table','parent','parents','children','ref_coins_image_obverse','ref_coins_image_reverse','ref_type_averages_diameter','ref_type_averages_weight','ref_mint_number'],
		// 					// count		: false,
		// 					// limit		: 0,
		// 					// order		: 'norder ASC',
		// 					// sql_filter	: "(term_table='ts_period') AND parents LIKE '%\"" + parseInt(section_id) + "\"%'",
		// 					// process_result	: {
		// 					// 	fn 		: 'process_result::add_parents_and_children_recursive',
		// 					// 	columns : [{name : "parents"}]
		// 					// }
		// 				}
		// 			})
		// 			.then(function(response){
		// 				console.log("response:",response);

		// 				const types_data = []
		// 				if (response.result && response.result.length>0) {

		// 					for (let i = 0; i < response.result.length; i++) {

		// 						const row = {
		// 							catalog						: 'MIB',
		// 							section_id					: response.result[i].section_id,
		// 							norder						: response.result[i].norder,
		// 							term_data					: response.result[i].term_data,
		// 							denomination				: response.result[i].ref_type_denomination,
		// 							term_table					: response.result[i].term_table,
		// 							term						: response.result[i].term,
		// 							parent						: response.result[i].parent,
		// 							parents						: response.result[i].parents,
		// 							children					: response.result[i].children,
		// 							ref_coins_image_obverse		: response.result[i].ref_coins_image_obverse,
		// 							ref_coins_image_reverse		: response.result[i].ref_coins_image_reverse,
		// 							ref_type_averages_diameter	: response.result[i].ref_type_averages_diameter,
		// 							ref_type_averages_weight	: response.result[i].ref_type_averages_weight,
		// 							ref_type_material			: response.result[i].ref_type_material,
		// 							ref_mint_number				: response.result[i].ref_mint_number,
		// 						}

		// 						types_data.push(row)

		// 						// response.result[i].catalog = 'MIB'
		// 						// types_data.push(response.result[i])
		// 					}
		// 				}
		// 				// console.log("--> get_types_data types_data:",types_data); return

		// 				const parsed_types_data = self.parse_types_data(types_data)

		// 				resolve(parsed_types_data)
		// 			})
		// 	})
		// },//end get_types_data



	//return an object with structure: period>group(if exists)>types>children(for subtypes)
		// parse_types_data : function (options){
		// 	let parsedData = []
		// 	parsedData.children = []
		// 	const data = options;

		// 	const rows_length = data.length

		// 	//Get first data deep and put it to parsed array
		// 	let mint_parent_group = data.filter(obj => obj.parent[0].term_table ===  'mints')


		// 	for (let i=0;i<mint_parent_group.length;i++){
		// 		let currentObject = mint_parent_group[i]
		//  		currentObject.children = {}
		//  		currentObject.groups = []
		//  		parsedData.children.push(currentObject)
		// 	}

		// 	let numis_group_objects = data.filter(obj => obj.term_table ===  'ts_numismatic_group')
		// 	let finded = false; //set true if recursive function found seeked object

		// 	//console.log(numis_group_objects[3])

		// 	while (numis_group_objects.length>0){
		// 		for (let i=0;i<numis_group_objects.length;i++){
		// 			const currentObj = numis_group_objects[i]
		// 			finded = false;
		// 			const parentsIds = JSON.parse(currentObj.parents)
		// 			for (let z=0;z<parentsIds.length;z++){
		// 				putObjectinArray(parsedData.children,currentObj,parentsIds[z],parsedData)
		// 				if(finded){
		// 					numis_group_objects.splice(i,1)
		// 					break
		// 				}
		// 			}
		// 		}
		// 	}


		// 	let types_objects = data.filter(obj => (obj.term_table ===  'types' && obj.parent[0].term_table !==  'types'))
		// 	finded = false; //set true if recursive function found seeked object

		// 	while (types_objects.length>0){
		// 		for (let i=0;i<types_objects.length;i++){
		// 			const currentObj = types_objects[i]
		// 			finded = false;
		// 			const parentsIds = JSON.parse(currentObj.parents)
		// 			for (let z=0;z<parentsIds.length;z++){
		// 				putObjectinArray(parsedData.children,currentObj,parentsIds[z],parsedData)
		// 				if(finded){
		// 					types_objects.splice(i,1)
		// 					break
		// 				}
		// 			}
		// 		}
		// 	}

		// 	let subTypes_objects = data.filter(obj => obj.parent[0].term_table ===  'types')
		// 	finded = false; //set true if recursive function found seeked object

		// 	while (subTypes_objects.length>0){
		// 		for (let i=0;i<subTypes_objects.length;i++){
		// 			const currentObj = subTypes_objects[i]
		// 			finded = false;
		// 			const parentsIds = JSON.parse(currentObj.parents)
		// 			for (let z=0;z<parentsIds.length;z++){
		// 				putObjectinArray(parsedData.children,currentObj,parentsIds[z],parsedData)
		// 				if(finded){
		// 					subTypes_objects.splice(i,1)
		// 					break
		// 				}
		// 			}
		// 		}
		// 	}




		// 	// let period_parent_group = data.filter(obj => obj.parent[0].term_table ===  'ts_period')

		// 	// for (let i=0;i<period_parent_group.length;i++){
		// 	// 	const currentObj = period_parent_group[i]
		// 	// 	const currentObjParentId = currentObj.parent[0].section_id

		// 	// 	const parsedDataIndex = parsedData.children.findIndex(obj => obj.section_id == currentObjParentId)

		// 	// 	if (parsedDataIndex>-1){
		// 	// 		let children = parsedData.children[parsedDataIndex].children
		// 	// 		if (children != null && children.length>0){
		// 	// 			parsedData.children[parsedDataIndex].children.push(currentObj)
		// 	// 		} else {
		// 	// 			parsedData.children[parsedDataIndex].children = []
		// 	// 			parsedData.children[parsedDataIndex].children .push(currentObj)
		// 	// 		}
		// 	// 	}
		// 	// }

		// 	// let numismatic_parent_group = data.filter(obj => obj.parent[0].term_table==='ts_numismatic_group')

		// 	// let finded = false; //set true if recursive function found seeked object

		// 	// while (numismatic_parent_group.length>0){

		// 	// 	for (let i=0;i<numismatic_parent_group.length;i++){
		// 	// 		const currentNumisGroup = numismatic_parent_group[i]
		// 	// 		// console.log (currentNumisGroup.norder)
		// 	// 		finded = false;
		// 	// 		putObjectinArray(parsedData.children,currentNumisGroup,parsedData)
		// 	// 		if(finded){
		// 	// 			numismatic_parent_group.splice(i,1)
		// 	// 		}
		// 	// 	}
		// 	// }

		// 	// let types_parent_group = data.filter(obj => obj.parent[0].term_table ===  'types')


		// 	// let creators_parent_group = data.filter(obj => obj.parent[0].term_table ===  'creators')
		// 	// console.log(creators_parent_group)


		// 	// finded = false;

		// 	// while (types_parent_group.length>0){
		// 	// 	for (let i=0;i<types_parent_group.length;i++){
		// 	// 		const currentType = types_parent_group[i]
		// 	// 		//finded = false; // PROVISIONAL REMOVE TO AVOID CRASH (!) 11-03-2021 PACO
		// 	// 		putObjectinArray(parsedData.children,currentType,parsedData)
		// 	// 		if(finded){
		// 	// 			types_parent_group.splice(i,1)
		// 	// 		} else {

		// 	// 		}
		// 	// 	}
		// 	// }

		// 	// console.log("types_parent_group:",types_parent_group); return

		// 	//Recursive function that create a multidimensional array whith data hyerarchy

		// 	function putObjectinArray (arr,obj,parentId,item){

		// 		if (item.section_id == parentId){
		// 			finded = true;
		// 			if (Array.isArray(item.children)){
		// 				item.children.push(obj)
		// 			} else {
		// 				item.children = []
		// 				item.children.push(obj)
		// 			}
		// 		}

		// 		if (!Array.isArray(arr)){
		// 			return
		// 		}

		// 		arr.forEach( function(item,index){
		// 		 	putObjectinArray(item.children,obj,parentId,item)
		// 		})

		// 	}

		// 	console.log("parsedData:",parsedData);

		// 	return (parsedData);
		// },//end parse_types_data



	/**
	* DRAW_ROW
	*/
	draw_row : function(options) {

		// options
			const row_object	= typeof options.ar_rows[0]!=="undefined" ? options.ar_rows[0] : null;
			const container 	= options.target

		// check row_object
			if (!row_object) {
				console.warn("Warning! draw_row row_object no found in options");
				return null;
			}

		// fix row_object
			self.row_object = row_object

		// debug
			if(SHOW_DEBUG===true) {
				// console.log("Mint row_object:",row_object);
			}

		// container select and clean container div
			while (container.hasChildNodes()) {
				container.removeChild(container.lastChild);
			}

		const fragment = new DocumentFragment();

		// line
			const line = common.create_dom_element({
				element_type 	: "div",
				class_name 		: "line",
				parent 			: fragment
			})

		// section_id
			if (dedalo_logged===true) {

				const link = common.create_dom_element({
					element_type	: "a",
					class_name		: "section_id go_to_dedalo",
					text_content	: row_object.section_id,
					href			: '/dedalo/core/page/?tipo=numisdata6&id=' + row_object.section_id,
					parent			: line
				})
				link.setAttribute('target', '_blank');
			}

		// Cite of record
			const golden_separator = document.querySelector('.golden-separator')
			page.render_cite_record(row_object, golden_separator)

		// name & place
			if (row_object.name && row_object.name.length>0) {

				// line
					const lineTittleWrap = common.create_dom_element({
						element_type	: "div",
						class_name		: "line-tittle-wrap",
						parent			: line
					})

				// name
					const name = row_object.name
					common.create_dom_element({
						element_type 	: "div",
						class_name 		: "line-tittle golden-color",
						text_content 	: name,
						parent 			: lineTittleWrap
					})

				// place
					if (row_object.place && row_object.place.length>0) {

						const place = "| "+row_object.place;
						common.create_dom_element({
							element_type	: "div",
							class_name		: "info_value",
							text_content	: place,
							parent			: lineTittleWrap
						})
					}

				// authorship
					if(row_object.authorship_names && row_object.authorship_names.length>0) {
						const authorship_node = page.render_authorship(row_object)
						lineTittleWrap.appendChild(authorship_node)
					}
			}//end if (row_object.name && row_object.name.length>0)

			const comments_wrap = common.create_dom_element({
				element_type	: "div",
				class_name		: "block-expandable",
				parent			: line
			})

			let block_text_length = 0; //save block text length to create expandable block if necessary

		// public_info
			if (row_object.public_info && row_object.public_info.length>0) {

				const public_info = row_object.public_info;
				const public_info_p = public_info.replace(/<br\s*\/?>/gi, '</p><p>');

				block_text_length += public_info.length;
				// fix at least 3 words in the last line

				function fix_widows(html, minWords = 3) {
				    const parser = new DOMParser();
				    const doc = parser.parseFromString(html, 'text/html');
				    doc.querySelectorAll('p').forEach(p => {
				        // Walk to the last text node to preserve inner HTML tags
				        const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT, null);
				        let lastTextNode = null;
				        let node;
				        while ((node = walker.nextNode())) {
				            if (node.textContent.trim()) lastTextNode = node;
				        }
				        if (!lastTextNode) return;

				        const words = lastTextNode.textContent.trimEnd().split(/\s+/);
				        if (words.length >= minWords) {
				            const lastWords = words.slice(-minWords).join('\u00A0');
				            const rest = words.slice(0, -minWords).join(' ');
				            lastTextNode.textContent = (rest ? rest + ' ' : '') + lastWords;
				        } else {
				            // Fewer words than minWords in last node — join with previous text node
				            const allTextNodes = [];
				            const w2 = document.createTreeWalker(p, NodeFilter.SHOW_TEXT, null);
				            while ((node = w2.nextNode())) {
				                if (node.textContent.trim()) allTextNodes.push(node);
				            }
				            if (allTextNodes.length >= 2) {
				                const prev = allTextNodes[allTextNodes.length - 2];
				                const last = allTextNodes[allTextNodes.length - 1];
				                const combined = (prev.textContent.trimEnd() + ' ' + last.textContent.trim()).split(/\s+/);
				                if (combined.length > minWords) {
				                    const lastWords = combined.slice(-minWords).join('\u00A0');
				                    const rest = combined.slice(0, -minWords).join(' ');
				                    prev.textContent = rest + ' ';
				                    last.textContent = lastWords;
				                }
				            }
				        }
				    });
				    return doc.body.innerHTML;
				}

				const public_info_block = common.create_dom_element({
					element_type	: "div",
					class_name		: "info_text_block",
					inner_html		: fix_widows('<p>'+public_info_p+'</p>',4),
					parent			: comments_wrap
				})
			}

		// numismatic_comments
			// if (row_object.numismatic_comments && row_object.numismatic_comments.length>0) {
			// 	const numismatic_comments = row_object.numismatic_comments
			// 	block_text_length += numismatic_comments.length;
			// 	const numismatic_comments_block = common.create_dom_element({
			// 		element_type	: "div",
			// 		class_name		: "info_text_block",
			// 		inner_html		: numismatic_comments,
			// 		parent			: comments_wrap
			// 	})
			// }

			if (block_text_length > 220) {
				// createExpandableBlock(comments_wrap, line);
				page.create_expandable_block(comments_wrap, line)
			}

		// relations
			// change to
			if (row_object.change_to_uri && row_object.change_to_uri.length>0) {

				//create the tittle block inside a red background
				common.create_dom_element({
					element_type	: "div",
					class_name		: "related",
					text_content	: tstring.change_to || "Change to",
					parent			: line
				})


				for (let i = 0; i < row_object.change_to_uri.length; i++) {
					const el		= row_object.change_to_uri[i]
					const label		= el.title || "URI"
					const uri_text	= '<a class="icon_link info_value" href="' + el.iri + '" target="_blank"> ' + el.title  + '</a>'

					common.create_dom_element({
						element_type	: "span",
						inner_html		: uri_text,
						parent			: line
					})
				}
			}
			// related
			if (row_object.related_data && row_object.related_data.length>0) {
				//create the tittle block inside a red background
				common.create_dom_element({
					element_type	: "div",
					class_name		: "related",
					text_content	: tstring.related_to || "Related to",
					parent			: line
				})

				const ar_labels = row_object.related.split('<br>')

				for (let i = 0; i < row_object.related_data.length; i++) {

					const mint_id	= row_object.related_data[i]
					const label		= ' '+ar_labels[i] || ""

					const link = common.create_dom_element({
						element_type	: "a",
						class_name		: "icon_link info_value",
						href			: page_globals.__WEB_ROOT_WEB__ + '/mint/' + mint_id,
						inner_html		: label,
						target			: '_blank',
						parent			: line
					})
				}
			}

		// bibliography_data
			if (row_object.bibliography_data && row_object.bibliography_data.length>0) {

				const bibliography_container = common.create_dom_element({
					element_type	: 'div',
					class_name		: 'bibliography_container',
					parent			: line
				})

				//create the graphical red line that divide blocks
				const lineSeparator = common.create_dom_element({
					element_type	: "div",
					class_name		: "info_line separator",
					parent			: bibliography_container
				})
				//create the tittle block inside a red background
				common.create_dom_element({
					element_type	: "label",
					class_name		: "big_label",
					text_content	: tstring.bibliographic_references || "Bibliographic references",
					parent			: lineSeparator
				})

				const bibliography_block = common.create_dom_element({
					element_type	: "div",
					class_name		: "info_text_block",
					parent			: bibliography_container
				})

				const ref_biblio = row_object.bibliography_data
				const ref_biblio_length	= ref_biblio.length
				for (let i = 0; i < ref_biblio_length; i++) {

					// build full ref biblio node
					const biblio_row_node = biblio_row_fields.render_row_bibliography(ref_biblio[i])

					const biblio_row_wrapper = common.create_dom_element({
						element_type	: "div",
						class_name		: "bibliographic_reference",
						parent			: bibliography_block
					})
					biblio_row_wrapper.appendChild(biblio_row_node)
				}

				// createExpandableBlock(bibliography_block,bibliography_container);
				// page.create_expandable_block(bibliography_block, bibliography_container)

				// clone to bibliography_container for print
				const biblio_print = document.getElementById('biblio_print')
				if (biblio_print) {
					const bibliography_container_clone = bibliography_container.cloneNode(true);
					bibliography_container_clone.classList.remove('bibliography_container')
					bibliography_container_clone.classList.add('bibliography_container_print')
					biblio_print.appendChild(bibliography_container_clone)
				}
			}

		// other permanent URI
			if (row_object.uri && row_object.uri.length>0) {

				// create the graphical red line that divide blocks
				// const lineSeparator = common.create_dom_element({
				// 	element_type	: "div",
				// 	class_name		: "info_line separator",
				// 	parent 			: line
				// })
				for (let i = 0; i < row_object.uri.length; i++) {

					const el		= row_object.uri[i]
					const label		= el.label || "URI"
					const uri_text	= '<a class="icon_link info_value" href="' + el.value + '" target="_blank"> ' + label  + '</a>'

					common.create_dom_element({
						element_type	: "span",
						inner_html		: uri_text,
						parent			: line
					})
				}
			}

		// authorship PRINT ONLY
			if(row_object.authorship_names && row_object.authorship_names.length>0) {
				const authorship_print_container = common.create_dom_element({
					element_type	: 'div',
					class_name		: 'authorship_print_container hide',
					parent			: line
				})
				const authorship_node = page.render_authorship(row_object)
				authorship_print_container.appendChild(authorship_node)
			}

		// container final add
		container.appendChild(fragment)


		// Create an expandable block when text length is over 500
		// MOVED TO PAGE
			// function createExpandableBlock(textBlock,nodeParent) {

			// 	textBlock.classList.add("contracted-block");

			// 	const textBlockSeparator = common.create_dom_element({
			// 		element_type	: "div",
			// 		class_name		: "text-block-separator",
			// 		parent 			: nodeParent
			// 	})

			// 	const separatorArrow = common.create_dom_element({
			// 		element_type	: "div",
			// 		class_name		: "separator-arrow",
			// 		parent 			: textBlockSeparator
			// 	})

			// 	textBlockSeparator.addEventListener("click",function(){
			// 		if (textBlock.classList.contains("contracted-block")){
			// 			textBlock.classList.remove ("contracted-block");
			// 			separatorArrow.style.transform = "rotate(-90deg)";
			// 		} else {
			// 			textBlock.classList.add("contracted-block");
			// 			separatorArrow.style.transform = "rotate(90deg)";
			// 		}
			// 	})
			// }

		return container
	},//end draw_row



	/**
	* DRAW_TYPES
	*/
		// draw_types : function(options) {

		// 	const self = this

		// 	// options
		// 		const full_ar_rows	= options.ar_rows
		// 		const container		= options.target

		// 	let arrDeep = 0
		// 	let isFirstElement = false

		// 	if (full_ar_rows.children && full_ar_rows.children.length>0){

		// 		const ar_rows		 = full_ar_rows.children
		// 		const ar_rows_length = ar_rows.length

		// 		// clean container div
		// 		while (container.hasChildNodes()) {
		// 			container.removeChild(container.lastChild);
		// 		}

		// 		const fragment = new DocumentFragment();

		// 		// label
		// 			const typesLabel = tstring.coin_production || "Coin production"
		// 			const lineSeparator = common.create_dom_element({
		// 				element_type	: "div",
		// 				class_name		: "info_line separator",
		// 				parent 			: fragment
		// 			})
		// 			common.create_dom_element({
		// 				element_type 	: "label",
		// 				class_name 		: "big_label",
		// 				text_content 	: typesLabel,
		// 				parent 			: lineSeparator
		// 			})

		// 		// rows
		// 		for (let i = 0; i < ar_rows_length; i++) {

		// 			const row_object = ar_rows[i]

		// 			// section_id
		// 				if (dedalo_logged===true) {

		// 					const link = common.create_dom_element({
		// 						element_type	: "a",
		// 						class_name		: "section_id go_to_dedalo",
		// 						text_content	: row_object.section_id,
		// 						href			: '/dedalo/lib/dedalo/main/?t=numisdata3&id=' + row_object.section_id,
		// 						parent			: fragment
		// 					})
		// 					link.setAttribute('target', '_blank');
		// 				}

		// 			const children_container = common.create_dom_element({
		// 				element_type	: "div",
		// 				class_name		: "children_container",
		// 				parent 			: fragment
		// 			})

		// 			const period_label = common.create_dom_element({
		// 				element_type	: "div",
		// 				class_name		: "ts_period period_label",
		// 				text_content 	: row_object.term,
		// 				parent 			: children_container
		// 			})

		// 			common.create_dom_element ({
		// 				element_type 	: "div",
		// 				class_name		: "arrow",
		// 				parent 			: period_label
		// 			})

		// 			//PERIOD wrap
		// 			const row_period = common.create_dom_element({
		// 				element_type	: "div",
		// 				class_name		: "row_node ts_period period_wrap hide",
		// 				parent 			: children_container
		// 			})

		// 			const types_container = common.create_dom_element({
		// 				element_type	: "div",
		// 				class_name		: "types_container hide deep:",
		// 				parent 			: row_period
		// 			})

		// 			// row_line
		// 			const row_line = common.create_dom_element({
		// 				element_type 	: "div",
		// 				class_name 		: "type_row",
		// 				parent 			: fragment
		// 			})

		// 			createFolderedGroup(period_label,row_period)
		// 			createFolderedGroup(period_label,types_container)


		// 			if (row_object.children != null){
		// 				//if has children call recursive function that get all children hierarchy one by one
		// 				recursiveChildrenSearch(row_object.children,null,row_period)
		// 			}

		// 		}//end for (let i = 0; i < ar_rows_length; i++)


		// 		function recursiveChildrenSearch (arr,item,container){

		// 			if (item != null){
		// 				createNewItem(item,container);

		// 				if (item.children != null){
		// 					item.children.sort(function(a,b){
		// 						//sort every hierarchy level
		// 						if (parseInt(a.norder) > parseInt(b.norder)){
		// 							return 1
		// 						}
		// 						if (parseInt(a.norder) < parseInt(b.norder)){
		// 							return -1
		// 						}
		// 						return 0
		// 					})
		// 				}

		// 			}

		// 			if (!Array.isArray(arr)){
		// 				return
		// 			} else{
		// 				//save current hierarchy level
		// 				arrDeep +=1
		// 			}

		// 			for (let i=0;i<arr.length;i++){
		// 				recursiveChildrenSearch(arr[i].children,arr[i],container)
		// 				if (arr.length-1 == (i)){
		// 					//save current hierarchy level
		// 					arrDeep -=1
		// 				}
		// 			}
		// 		}

		// 		function createNewItem (item,container){
		// 			//if has numismatics groups
		// 			var currentContainer = container

		// 			if (item.term_table === 'ts_numismatic_group'){
		// 				if (arrDeep>1){
		// 					const deepEl = container.getElementsByClassName("row_node deep:"+(arrDeep-1).toString())
		// 					currentContainer = deepEl[deepEl.length-1]
		// 				}
		// 				//Create a numismatic group
		// 				//GROUP wrap
		// 				const classDeep = "row_node hide deep:"+arrDeep

		// 				const children_container = common.create_dom_element({
		// 					element_type	: "div",
		// 					class_name		: "children_container",
		// 					parent 			: currentContainer
		// 				})

		// 				const children_label = common.create_dom_element({
		// 					element_type	: "div",
		// 					class_name		: "ts_numismatic_group",
		// 					text_content 	: item.term,
		// 					parent 			: children_container
		// 				})

		// 				common.create_dom_element ({
		// 					element_type 	: "div",
		// 					class_name		: "arrow",
		// 					parent 			: children_label
		// 				})

		// 				const types_container = common.create_dom_element({
		// 					element_type	: "div",
		// 					class_name		: "types_container hide deep:"+arrDeep,
		// 					parent 			: children_container
		// 				})

		// 				const row_group = common.create_dom_element({
		// 					element_type	: "div",
		// 					class_name		: "row_node hide deep:"+arrDeep,
		// 					parent 			: children_container
		// 				})

		// 				createFolderedGroup(children_label,row_group)
		// 				createFolderedGroup(children_label,types_container)


		// 			} else if (item.term_table === 'types') {

		// 				//create a type element
		// 				if (item.children != null && item.children.length>0){
		// 					//if is a type and not a subtype mark variable but don't draw anything
		// 					isFirstElement = true
		// 				} else{//if is a subtype

		// 						//try to get a type container created yet
		// 						let deepEl = container.getElementsByClassName("types_container deep:"+(arrDeep-1).toString())
		// 						let newArrDeep = arrDeep

		// 						//if previously didn't found, search up in hierarchy until find the last types container
		// 						while (deepEl.length==0 && newArrDeep>1){
		// 							newArrDeep = newArrDeep-1
		// 							deepEl = container.getElementsByClassName("types_container deep:"+(newArrDeep-1).toString())
		// 						}

		// 						currentContainer = deepEl[deepEl.length-1]


		// 					if (currentContainer == null){
		// 						let deepEl = container.getElementsByClassName("types_container")
		// 						currentContainer = deepEl[deepEl.length-1]
		// 					}

		// 					let isSubtype = false
		// 					if (item.parent[0].term_table === 'types'){
		// 						isSubtype = true
		// 					}

		// 					const types_block = create_type_element(item,isSubtype)
		// 					currentContainer.appendChild(types_block)
		// 					isFirstElement = false
		// 				}
		// 			}


		// 			function create_type_element(data,isSubtype){

		// 				const parentSubType = data.parent[0]
		// 				const type_row = data;

		// 				// let type_row_term = ""
		// 				const type_row_term = (type_row.term.indexOf(",") == -1)
		// 					? type_row.term
		// 					: type_row.term.slice(0,type_row.term.indexOf(","))

		// 				const mint_number = (type_row.ref_mint_number)
		// 					? type_row.ref_mint_number+'/'
		// 					: ''

		// 				let type_number = ""
		// 				let subType_number = ""
		// 				let SubTypeClass = ""
		// 				let type_href = ""
		// 				let subType_href = ""

		// 				if (type_row.term_data != null){
		// 					const type_section_id = type_row.term_data.replace(/[\["\]]/g, '')
		// 					type_href = page_globals.__WEB_ROOT_WEB__ + '/type/' + type_section_id
		// 					subType_href = type_href
		// 				} else {
		// 					isSubtype = true
		// 				}

		// 				if (!isSubtype) {
		// 					type_number = "MIB "+mint_number+type_row_term
		// 				} else {
		// 					subType_number = "MIB "+mint_number+type_row_term
		// 					SubTypeClass = "subType_number"
		// 					if (isFirstElement){
		// 						type_href = ""
		// 						let parent_term = ""
		// 						parentSubType.term.indexOf(",") == -1 ? parent_term = parentSubType.term : parent_term = parentSubType.term.slice(0,parentSubType.term.indexOf(","))
		// 						type_number =  "MIB "+parent_term
		// 					}
		// 				}

		// 				//Type wrap
		// 				const row_type = common.create_dom_element({
		// 					element_type	: "div",
		// 					class_name		: "type_wrap"
		// 				})

		// 				const number_wrap = common.create_dom_element({
		// 					element_type	: "div",
		// 					class_name		: "type_number",
		// 					parent 			: row_type
		// 				})

		// 				common.create_dom_element({
		// 					element_type	: "a",
		// 					inner_html  	: type_number,
		// 					class_name		: "type_label",
		// 					href 			: type_href,
		// 					parent 			: number_wrap
		// 				})

		// 				common.create_dom_element({
		// 					element_type	: "a",
		// 					inner_html 	    : subType_number,
		// 					class_name		: "subType_label "+SubTypeClass,
		// 					href 			: subType_href,
		// 					parent 			: number_wrap
		// 				})

		// 				const img_wrap = common.create_dom_element({
		// 					element_type 	: "div",
		// 					class_name 		: "types_img gallery",
		// 					parent 			: row_type
		// 				})

		// 				const img_link_ob = common.create_dom_element({
		// 					element_type 	: "a",
		// 					class_name		: "image_link",
		// 					href 			: common.local_to_remote_path(type_row.ref_coins_image_obverse),
		// 					parent 			: img_wrap,
		// 				})

		// 				common.create_dom_element({
		// 					element_type	: "img",
		// 					src 			: common.local_to_remote_path(type_row.ref_coins_image_obverse),
		// 					parent 			: img_link_ob
		// 				}).loading="lazy"

		// 				const img_link_re = common.create_dom_element({
		// 					element_type 	: "a",
		// 					class_name		: "image_link",
		// 					href 			: common.local_to_remote_path(type_row.ref_coins_image_reverse),
		// 					parent 			: img_wrap,
		// 				})

		// 				common.create_dom_element({
		// 					element_type	: "img",
		// 					src 			: common.local_to_remote_path(type_row.ref_coins_image_reverse),
		// 					parent 			: img_link_re
		// 				}).loading="lazy"

		// 				const info_wrap = common.create_dom_element({
		// 					element_type 	: "div",
		// 					class_name 		: "info_wrap",
		// 					parent 			: row_type
		// 				})

		// 				const type_info = [
		// 					type_row.ref_type_material,
		// 					type_row.denomination,
		// 					type_row.ref_type_averages_weight+"g",
		// 					type_row.ref_type_averages_diameter+"mm"
		// 				]

		// 				common.create_dom_element ({
		// 					element_type 	: "p",
		// 					class_name 		: "type_info",
		// 					text_content 	: type_info.join(' | '),
		// 					parent 			: info_wrap
		// 				})

		// 				page.activate_images_gallery(img_wrap)

		// 				return row_type
		// 			}

		// 		}

		// 		// container final add
		// 		container.appendChild(fragment)


		// 		function createFolderedGroup(label,row_group) {

		// 			const label_arrow = label.firstElementChild;

		// 			label.addEventListener("click",function(){
		// 				if (row_group.classList.contains("hide")){
		// 					row_group.classList.remove ("hide");
		// 					label_arrow.style.transform = "rotate(90deg)";
		// 				} else {
		// 					row_group.classList.add("hide");
		// 					label_arrow.style.transform = "rotate(0deg)";
		// 				}
		// 			})
		// 		}

		// 	} else {
		// 		// const types_container = document.getElementById('types')
		// 		// if (types_container) {
		// 		// 	types_container.remove()
		// 		// }
		// 		container.remove()
		// 	}


		// 	return true
		// },//end draw_types



	/**
	* DRAW_MAP
	*
	* @param object options
	* @return void
	*/
	draw_map : function(options) {

		const self = this

		// options
			const mint_map_data		= options.mint_map_data
			const mint_popup_data	= options.mint_popup_data
			const types				= options.types || null

		// popup parser
			const parse_popup_data = (data) => {
				return {
					section_id	: data.section_id,
					title		: data.name,
					description	: ""
				}
			}

		self.get_findspot_hoards({
			types : types
		})
		.then(function(response){
			if(SHOW_DEBUG===true) {
				console.log('draw_map API response:', response);
			}

			if (!response || !response.result) {
				console.warn('Warning! Empty API response from hoard data. types:', types);
				return
			}

			const container	= self.map_container // document.getElementById("map_container")

			// show map (default is hidden)
			container.classList.remove('hide')

			// map factory init
			self.map = self.map || new map_factory() // creates / get existing instance of map
			self.map.init({
				map_container	: container,
				map_position	: null,
				popup_builder	: page.map_popup_builder,
				popup_options	: page.maps_config.popup_options,
				source_maps		: page.maps_config.source_maps,
				legend			: page.render_map_legend
			})

			// prepares data to be used in map
			const map_data_points = self.map_data(mint_map_data, mint_popup_data)

			// findspots to map
				const findspots_map_data = response.result[0].result;
				if (findspots_map_data && findspots_map_data.length>0){

					for (let i=0;i<findspots_map_data.length;i++){

						if (!findspots_map_data[i].georef_geojson) continue

						const findspot_map_data		= JSON.parse(findspots_map_data[i].georef_geojson)
						const findspot_popup_data	= parse_popup_data(findspots_map_data[i])

						findspot_popup_data.type = {}
						findspot_popup_data.type = "findspot"

						const findspot_map_data_points = self.map_data(findspot_map_data,findspot_popup_data)

						map_data_points.push(findspot_map_data_points[0])
					}
				}

			// hoards to map
				const hoards_map_data = response.result[1].result;
				if (hoards_map_data && hoards_map_data.length>0){
					for (let i=0;i<hoards_map_data.length;i++){

						if (!hoards_map_data[i].georef_geojson) continue

						const hoard_map_data	= JSON.parse(hoards_map_data[i].georef_geojson)
						const hoard_popup_data	= parse_popup_data(hoards_map_data[i])

						hoard_popup_data.type = {}
						hoard_popup_data.type = "hoard"

						const hoard_map_data_points = self.map_data(hoard_map_data,hoard_popup_data)

						map_data_points.push(hoard_map_data_points[0])
					}
				}

			// draw points
				self.map.parse_data_to_map(map_data_points, null)
				.then(function(){
					container.classList.remove("hide_opacity")
					return true
				})
		})
	},//end draw_map



	/**
	* GET_PLACE_DATA
	* Search findspots and hoards data with same place_data
	*/
	get_findspot_hoards : async function(data){

		const types = data.types || []

		if (!types || types.length<1) {
			return null
		}

		const ar_filter = []

		for (let i = types.length - 1; i >= 0; i--) {
			const current_coin = types[i]

			ar_filter.push("types like '%\"" + current_coin + "\"%'");
		}

		const sql_filter = '('+ ar_filter.join(' OR ') +')'

			const ar_calls = []

			ar_calls.push ({
				id		: "findspots",
				options	: {
					dedalo_get	: 'records',
					table		: 'findspots',
					db_name		: page_globals.WEB_DB,
					lang		: page_globals.WEB_CURRENT_LANG_CODE,
					ar_fields	: ["*"],
					count		: false,
					sql_filter	: sql_filter
				}
			})

			ar_calls.push ({
				id		: "hoards",
				options	: {
					dedalo_get	: 'records',
					table		: 'hoards',
					db_name		: page_globals.WEB_DB,
					lang		: page_globals.WEB_CURRENT_LANG_CODE,
					ar_fields	: ['*'],
					count		: false,
					sql_filter	: sql_filter
				}
			})

		// api request
			const api_response = await data_manager.request({
				body : {
					dedalo_get	: 'combi',
					ar_calls	: ar_calls
				}
			})


		return api_response
	},//end get_place_data



	/**
	* MAP_DATA
	* @return array data
	*/
	map_data : function(data, popup_data) {

		const markerIcon = (function(){
			switch(popup_data.type) {
				case 'findspot':
					return page.maps_config.markers.findspot
				case 'hoard':
					return page.maps_config.markers.hoard
				default:
					return page.maps_config.markers.mint
			}
		})()

		const ar_data = Array.isArray(data)
			? data
			: [data]

		const map_points = []
		for (let i = 0; i < ar_data.length; i++) {

			const geojson = [ar_data[i]]

			const item = {
				lat			: null,
				lon			: null,
				geojson		: geojson,
				marker_icon	: markerIcon,
				data		: popup_data
			}
			map_points.push(item)
		}


		return map_points
	},//end map_data



	/**
	* RENDER_PRINT_BUTTON
	* @return HTMLElement export_container
	*/
	render_print_button : function () {

		const export_container = common.create_dom_element({
			element_type	: 'div',
			class_name		: 'export_container'
		})

		// print_button
		const print_button = common.create_dom_element({
			element_type	: 'input',
			type			: 'button',
			class_name		: 'btn primary button_print',
			value			: tstring.print || 'Print',
			parent			: export_container
		})
		const click_handler = (e) => {
			e.stopPropagation()

			const is_chrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
			const msg = is_chrome
				? (tstring.print || 'Print') + '?\n'
				: (tstring.print || 'Print') + '?\n' + ' WARNING: ' + (tstring.use_chrome_for_print || 'Preferably use \'Chrome\' for printing')
			if (confirm(msg)) {
				window.print()
			}
		}
		print_button.addEventListener('click', click_handler)


		return export_container
	},//end render_print_button



}//end mints
