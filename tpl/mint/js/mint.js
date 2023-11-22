/*global tstring, page_globals, SHOW_DEBUG, event_manager, map_factory, biblio_row_fields, data_manager, dedalo_logged, Promise, common, page, console, mint_row, DocumentFragment  */
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
				// console.log("--> set_up get_row_data API response:",response.result);

				// mint draw
					const mint = response.result.find( el => el.id==='mint')
					const mint_data = page.parse_mint_data(mint.result[0])

					self.draw_row({
						target	: self.row_detail,
						ar_rows	: [mint_data]
					})

				// map draw
					if (typeof mint.result[0]!=="undefined") {
						if (mint_data.georef_geojson) {
							self.draw_map({
								mint_map_data	: mint_data.georef_geojson,
								mint_popup_data	: {
									section_id	: mint_data.section_id,
									title		: mint_data.name,
									description	: mint_data.public_info.trim()
								},
								types			: mint_data.relations_types
							})

							window.addEventListener('beforeprint', async function(e) {

								self.map_container.style.width = '210mm'
								self.map_container.style.height = '120mm'

								await self.map.map.invalidateSize()
								await self.map.map.fitBounds(self.map.feature_group.getBounds())

							})

							window.addEventListener('afterprint', async function(e) {

								self.map_container.style.width	= null
								self.map_container.style.height	= null

								await self.map.map.invalidateSize()
								await self.map.map.fitBounds(self.map.feature_group.getBounds())

							})
						}
					}

				// types draw
					const mint_catalog = response.result.find( el => el.id==='mint_catalog')
					if (mint_catalog.result) {
						const _mint_catalog = mint_catalog.result.find(el => el.term_table==='mints')
						if (_mint_catalog && _mint_catalog.section_id) {
							self.get_types_data2({
								section_id : _mint_catalog.section_id
							})
							.then(function(result){
								// self.draw_types({
								// 	target	: document.getElementById('types'),
								// 	ar_rows	: result
								// })

								//RESTORE term_section_id info
								for (let i=0;i<result.length;i++){
									result[i].catalog_info = result[i].term_section_id
									//result[i].term_section_id = result[i].term_section_id.section_id
								}

								const types_node = self.draw_types2({
									ar_rows			: result,
									mint_section_id	: _mint_catalog.section_id
								})
								if (types_node) {
									const target = document.getElementById('types')
									target.appendChild(types_node)
									page.activate_images_gallery(target)
								}
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

		return true
	},//end set_up



	/**
	* GET_ROW_DATA
	* Get dabase mint row from table mints and catalog
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
						'authorship_names',
						'authorship_surnames',
						'authorship_roles'
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
	* DRAW_TYPES2
	* @return
	*/
	draw_types2 : function(options) {

		// options
			const ar_rows			= options.ar_rows
			const mint_section_id	= options.mint_section_id


		const fragment = new DocumentFragment()

		// label
			const typesLabel = tstring.coin_production || "Coin production"
			const lineSeparator = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line separator",
				parent 			: fragment
			})
			common.create_dom_element({
				element_type 	: "label",
				class_name 		: "big_label",
				text_content 	: typesLabel,
				parent 			: lineSeparator
			})

		// create all nodes. Add in parallel to fragment and ar_nodes
			// const fragment = new DocumentFragment()
			const ar_nodes = []
			for (let i = 0; i < ar_rows.length; i++) {

				const row = ar_rows[i]

				// exclude self mint
					if (row.section_id==mint_section_id) continue;

				// exclude non mint children (to parents)
					const is_mint_child = row.parents
						? row.parents.find(el => el==mint_section_id)
						: false
					if (!is_mint_child) {
						console.log("Excluded row:",row);
						continue;
					}

				// append
					const node = mint_row.draw_type_item(row)
					if (node) {
						ar_nodes.push(node)
						fragment.appendChild(node)
					}
			}

		// hierarchize nodes.
		// (!) Note that changes in ar_nodes items are propagated to fragment becase the nodes are shared for both
			for (let i = 0; i < ar_nodes.length; i++) {
				const node = ar_nodes[i]
				if (node.parent) {
					const parent_node = ar_nodes.find(function(el){
						return el.section_id==node.parent
					})
						// console.log("parent_node:",parent_node);
					if (parent_node && parent_node.container) {
							// console.log("placed node:",node);
						parent_node.container.appendChild(node)
					}
				}else{
					console.warn("node without parent:",node);
				}
			}

		return fragment
	},//end draw_types2



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
				class_name 		: "",
				parent 			: fragment
			})

		// section_id
			if (dedalo_logged===true) {

				const link = common.create_dom_element({
					element_type	: "a",
					class_name		: "section_id go_to_dedalo",
					text_content	: row_object.section_id,
					href			: '/dedalo/lib/dedalo/main/?t=numisdata6&id=' + row_object.section_id,
					parent			: line
				})
				link.setAttribute('target', '_blank');
			}

		// Cite of record
			const golden_separator = document.querySelector('.golden-separator')
			const cite = common.create_dom_element({
				element_type	: "span",
				class_name		: "cite_this_record",
				text_content	: tstring.cite_this_record || 'cite this record',
				parent			: golden_separator
			})
			cite.addEventListener('click', async function(){
				const main_catalog_data = await page.load_main_catalog()
				const cite_data = main_catalog_data.result[0];
				const publication_data = cite_data.publication_data[0];
				cite_data.autors = {
					authorship_data		: row_object.authorship_data || null,
					authorship_names	: row_object.authorship_names || null,
					authorship_surnames	: row_object.authorship_surnames || null,
					authorship_roles	: row_object.authorship_roles || null,
				}
				cite_data.catalog = null
				cite_data.title = row_object.name
				cite_data.publication_data = publication_data
				cite_data.uri_location 	= window.location

				const cite_data_node = biblio_row_fields.render_cite_this(cite_data)


				const popUpContainer = common.create_dom_element({
					element_type	: "div",
					class_name		: "float-cite",
					parent 			: document.body
				})
				popUpContainer.addEventListener('mouseup',function() {

   					popUpContainer.classList.add('copy')
   					cite_data_node.classList.add('copy')

   					const selection = window.getSelection();
					//create a selection range
					const copy_range = document.createRange();
					//choose the element we want to select the text of
					copy_range.selectNodeContents(cite_data_node);
					//select the text inside the range
					selection.removeAllRanges();
       				selection.addRange( copy_range );

       				//copy the text to the clipboard
					document.execCommand("copy");

					//remove our selection range
					window.getSelection().removeAllRanges();
				})

				const title = common.create_dom_element({
					element_type	: "div",
					class_name		: "float-label",
					text_content	: tstring.cite_this_record || 'Cite this record',
					parent 			: popUpContainer
				})

				const close_buttom = common.create_dom_element({
					element_type	: "div",
					class_name		: "close-buttom",
					parent 			: popUpContainer
				})
				close_buttom.addEventListener("click",function(){
					// popUpContainer.remove()
				})
				document.body.addEventListener("click",function(event_cite){
					document.body.removeEventListener("click", function(event_cite){})
					popUpContainer.remove()
				})

				popUpContainer.appendChild(cite_data_node)

				const click_to_copy = common.create_dom_element({
					element_type	: "div",
					class_name		: "float-text_copy",
					text_content	: tstring.click_to_copy || 'Click to copy',
					parent 			: popUpContainer
				})
				
			})

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
					if (row_object.authorship_names && row_object.authorship_names.length>0) {

						const ar_names = row_object.authorship_names.split('|');
						const ar_surnames = row_object.authorship_surnames.split('|');
						const ar_roles = row_object.authorship_roles.split('|');

						const authorship_length = ar_names.length
						for (let i = 0; i < authorship_length; i++) {
							const name		= ar_names[i].trim().toUpperCase()
							const surname	= ar_surnames[i].trim().toUpperCase()
							const rol		= ar_roles[i].trim()

							const authorship = name + ' ' + surname+ ' | ' +rol
							common.create_dom_element({
								element_type 	: "div",
								class_name 		: "authorship",
								text_content 	: authorship,
								parent 			: lineTittleWrap
							})
						}
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

				const public_info = row_object.public_info
				block_text_length += public_info.length;

				const public_info_block = common.create_dom_element({
					element_type	: "div",
					class_name		: "info_text_block",
					inner_html		: public_info,
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

		// bibliography_data
			if (row_object.bibliography_data && row_object.bibliography_data.length>0) {
				//create the graphical red line that divide blocks
				const lineSeparator = common.create_dom_element({
					element_type	: "div",
					class_name		: "info_line separator",
					parent			: line
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
					parent			: line
				})

				const ref_biblio		= row_object.bibliography_data
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

				// createExpandableBlock(bibliography_block,line);
				page.create_expandable_block(bibliography_block, line)
			}

			// other permanent uri
				if (row_object.uri && row_object.uri.length>0) {

					//create the graphical red line that divide blocks
					// const lineSeparator = common.create_dom_element({
					// 	element_type	: "div",
					// 	class_name		: "info_line separator",
					// 	parent 			: line
					// })
					for (let i = 0; i < row_object.uri.length; i++) {

						const el		= row_object.uri[i]
						const label		= el.label || "URI"
						const uri_text	= '<a class="icon_link info_value" href="' + el.value + '" target="_blank"> ' + el.label  + '</a>'

						common.create_dom_element({
							element_type	: "span",
							inner_html		: uri_text,
							parent			: line
						})

					}
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
	*/
	draw_map : function(options) {

		const self = this

		// options
			const mint_map_data		= options.mint_map_data
			const mint_popup_data	= options.mint_popup_data
			const types				= options.types

		self.get_findspot_hoards({
			types : types
		})
		.then(function(response){
			// console.log("draw_map get_place_data: ",response);

			const container	= self.map_container // document.getElementById("map_container")

			if (response && response.result) {
				container.classList.remove('hide')
			}

			self.map = self.map || new map_factory() // creates / get existing instance of map
			self.map.init({
				map_container	: container,
				map_position	: null,
				popup_builder	: page.map_popup_builder,
				popup_options	: page.maps_config.popup_options,
				source_maps		: page.maps_config.source_maps,
				legend			: page.render_map_legend
			})

			const map_data_points = self.map_data(mint_map_data, mint_popup_data) // prepares data to used in map

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

		function parse_popup_data(data){
			const popup_data = {
				section_id	: data.section_id,
				title		: data.name,
				description	: ""
			}
			return popup_data;
		}


	},//end draw_map



	/**
	* GET_PLACE_DATA
	* Search findspots and hoards data with same place_data
	*/
	get_findspot_hoards : function(data){

		const types = data.types

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

			const js_promise = data_manager.request({
				body : {
					dedalo_get	: 'combi',
					ar_calls	: ar_calls
				}
			})

			return js_promise
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
		// console.log("--map_data map_points:",map_points);

		return map_points
	}//end map_data



}//end mints
