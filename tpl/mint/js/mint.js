/*global tstring, page_globals, SHOW_DEBUG, row_fields, common, page, console, DocumentFragment  */
/*eslint no-undef: "error"*/


"use strict";



var mint =  {



	/**
	* SET_UP
	*/
	set_up : function(options) {

		const self = this

		// options
			const section_id = options.section_id
		if (section_id) {
			// search by section_id
			self.get_row_data({
				section_id : section_id
			})
			.then(function(response){
				console.log("--> set_up get_row_data API response:",response.result[1]);

				// mint draw
					const mint = response.result.find( el => el.id==='mint')
					self.draw_row({
						target	: document.getElementById('row_detail'),
						ar_rows	: mint.result
					})

				// map draw. Init default map
					self.draw_map({
						mint_map_data : JSON.parse(mint.result[0].map),
						mint_popup_data : {
							section_id	: mint.result[0].section_id,
							title		: mint.result[0].name,
							description	: mint.result[0].history.trim()
						},
						place_data : mint.result[0].place_data 
					})

				// types draw
					const mint_catalog = response.result.find( el => el.id==='mint_catalog')
					if (mint_catalog.result) {
						const catMint = mint_catalog.result.find(el => el.term_table==='mints')
						console.log(catMint.section_id)
						self.get_types_data({
							section_id : catMint.section_id
						})
						.then(function(result){
							self.draw_types({
								target	: document.getElementById('types'),
								ar_rows	: result
							})
						})
					}
			})
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
	*
	*/
	get_row_data : function(options) {

		const self = this

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
						'history',
						'numismatic_comments',
						'bibliography_data',
						'map'
					],
					sql_filter				: "section_id = " + parseInt(section_id),
					count					: false,
					resolve_portals_custom	: {
						"bibliography_data" : "bibliographic_references"
					}
				}
			})

		// mint in catalog call
			ar_calls.push({
				id		: "mint_catalog",
				options	: {
					dedalo_get				: 'records',
					table					: 'catalog',
					db_name					: page_globals.WEB_DB,
					lang					: page_globals.WEB_CURRENT_LANG_CODE,
					ar_fields				: ['section_id','term','term_table'],
					count					: false,
					limit					: 0,
					sql_filter				: "term_data='[\"" + parseInt(section_id) + "\"]'"
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
	* GET_types_DATA
	*
	*/
	get_types_data : function(options) {

		const self = this

		const section_id = options.section_id
		
		return new Promise(function(resolve){
			// request
				const js_promise = data_manager.request({
					body : {
						dedalo_get	: 'records',
						table		: 'catalog',
						db_name		: page_globals.WEB_DB,
						lang		: page_globals.WEB_CURRENT_LANG_CODE,
						ar_fields	: ['section_id','term_data','ref_type_denomination','term','term_table','parent','parents','children','ref_coins_image_obverse','ref_coins_image_reverse','ref_type_averages_diameter','ref_type_averages_weight','ref_mint_number'],
						count		: false,
						limit		: 0,
						order		: 'term_table DESC, term ASC',
						sql_filter	: "(term_table='types' OR term_table='ts_numismatic_group' OR term_table='ts_period') AND parents LIKE '%\"" + parseInt(section_id) + "\"%'",
						resolve_portals_custom	: {
							"parent" : "catalog" 
							//"children"	: "catalog"
						}




						// dedalo_get	: 'records',
						// table		: 'catalog',
						// db_name		: page_globals.WEB_DB,
						// lang		: page_globals.WEB_CURRENT_LANG_CODE,
						// ar_fields	: ['section_id','term_data','ref_type_denomination','term','term_table','parent','parents','children','ref_coins_image_obverse','ref_coins_image_reverse','ref_type_averages_diameter','ref_type_averages_weight','ref_mint_number'],
						// count		: false,
						// limit		: 0,
						// order		: 'norder ASC',
						// sql_filter	: "(term_table='ts_period') AND parents LIKE '%\"" + parseInt(section_id) + "\"%'",
						// process_result	: {
						// 	fn 		: 'process_result::add_parents_and_children_recursive',
						// 	columns : [{name : "parents"}]
						// }
					}
				})
				.then(function(response){
					const types_data = []
					console.log(response)
					if (response.result && response.result.length>0) {
						for (let i = 0; i < response.result.length; i++) {

							const row = {
								catalog			: 'MIB',
								section_id		: response.result[i].section_id,
								term_data 		: response.result[i].term_data,
								denomination	: response.result[i].ref_type_denomination,
								term_table		: response.result[i].term_table,
								term			: response.result[i].term,
								parent 			: response.result[i].parent,
								parents 		: response.result[i].parents,
								children 		: response.result[i].children,
								ref_coins_image_obverse 	: response.result[i].ref_coins_image_obverse,
								ref_coins_image_reverse 	: response.result[i].ref_coins_image_reverse,
								ref_type_averages_diameter 	: response.result[i].ref_type_averages_diameter,
								ref_type_averages_weight 	: response.result[i].ref_type_averages_weight,
								ref_mint_number 			: response.result[i].ref_mint_number,
							}

							types_data.push(row)
						}
					}
					//console.log("--> get_types_data types_data:",types_data);

					const parsed_types_data = self.parse_types_data(types_data)

					resolve(parsed_types_data)
				})
		})
	},//end get_types_data


	//return an object with structure: period>group(if exists)>types>children(for subtypes)
	parse_types_data : function (options){
		var parsedData = []
		const data = options;
		//console.log(data)
		const rows_length = data.length

		// var all_tables_no_types = data.filter(obj => obj.term_table !=  'types')
		// for (let i=0;i<all_tables_no_types.length;i++){
		// 	all_tables_no_types[i].children = {}
		// }

		var mint_parent_group = data.filter(obj => obj.parent[0].term_table ===  'mints')

		for (let i=0;i<mint_parent_group.length;i++){
			var currentObject = mint_parent_group[i]
	 		currentObject.children = {}
	 		currentObject.groups = []
	 		if (parsedData.children == null){
	 			parsedData.children = []
	 			parsedData.children.push(currentObject)
	 		} else {
	 			parsedData.children.push(currentObject)
	 		}
		 	
		}
		
		var period_parent_group = data.filter(obj => obj.parent[0].term_table ===  'ts_period')
		
		for (let i=0;i<period_parent_group.length;i++){
			const currentObj = period_parent_group[i]
			const currentObjParentId = currentObj.parent[0].section_id
		
			const parsedDataIndex = parsedData.children.findIndex(obj => obj.section_id == currentObjParentId)
			
			if (parsedDataIndex>-1){
				var children = parsedData.children[parsedDataIndex].children 
				if (children != null && children.length>0){
					parsedData.children[parsedDataIndex].children.push(currentObj)
				} else {
					parsedData.children[parsedDataIndex].children = []
					parsedData.children[parsedDataIndex].children .push(currentObj)
				}
			}
		}

		console.log(parsedData)

		var numismatic_parent_group = data.filter(obj => obj.parent[0].term_table ===  'ts_numismatic_group')
		var finded = false;

		while (numismatic_parent_group.length>0){
			for (let i=0;i<numismatic_parent_group.length;i++){
				const currentNumisGroup = numismatic_parent_group[i]
				finded = false;
				putObjectinArray(parsedData.children,currentNumisGroup,parsedData)
				if(finded){
					numismatic_parent_group.splice(i,1)
				}
			}
		}

		var types_parent_group = data.filter(obj => obj.parent[0].term_table ===  'types')
		console.log(types_parent_group)

		finded = false;

		while (types_parent_group.length>0){
			for (let i=0;i<types_parent_group.length;i++){
				const currentType = types_parent_group[i]
				finded = false;
				putObjectinArray(parsedData.children,currentType,parsedData)
				if(finded){
					types_parent_group.splice(i,1)
				}
			}
		}	

		function putObjectinArray (arr,obj,item){
			if (item.section_id == obj.parent[0].section_id){
				finded = true;
				if (Array.isArray(item.children)){
					item.children.push(obj)
				} else {
					item.children = []
					item.children.push(obj)
				}
			}

			if (!Array.isArray(arr)){
			
				return 
			}

			arr.forEach( function(item,index){
			 	putObjectinArray(item.children,obj,item)
			})

		}

		console.log("parsedData:",parsedData);

		return (parsedData);
	},


	/**
	* DRAW_ROW
	*/
	draw_row : function(options) {

		const row_object	= options.ar_rows[0]
		const container 	= options.target

		// fix row_object
			self.row_object = row_object

		// debug
			if(SHOW_DEBUG===true) {
				console.log("Mint row_object:",row_object);
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
					element_type 	: "a",
					class_name 		: "section_id go_to_dedalo",
					text_content 	: row_object.section_id,
					href 			: '/dedalo/lib/dedalo/main/?t=numisdata6&id=' + row_object.section_id,
					parent 			: line
				})
				link.setAttribute('target', '_blank');
			}

		// name & place
			if (row_object.name && row_object.name.length>0) {



				const lineTittleWrap = common.create_dom_element({
					element_type	: "div",
					class_name		: "line-tittle-wrap",
					parent 			: line
				})

		
				let name = row_object.name
				
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
						element_type 	: "div",
						class_name 		: "info_value",
						text_content 	: place,
						parent 			: lineTittleWrap
					})
				}

			}

			const comments_wrap = common.create_dom_element({
				element_type	: "div",
				class_name		: "block-expandable",
				parent			: line
			})

			let block_text_length = 0; //save block text length to create expandable block if necessary

		// history
			if (row_object.history && row_object.history.length>0) {

				const history = row_object.history
				block_text_length += history.length;

				const history_block = common.create_dom_element({
					element_type	: "div",
					class_name		: "info_text_block",
					inner_html		: history,
					parent			: comments_wrap
				})
			}

		// numismatic_comments
			if (row_object.numismatic_comments && row_object.numismatic_comments.length>0) {

				const numismatic_comments = row_object.numismatic_comments
				block_text_length += numismatic_comments.length;

				const numismatic_comments_block = common.create_dom_element({
					element_type	: "div",
					class_name		: "info_text_block",
					inner_html		: numismatic_comments,
					parent			: comments_wrap
				})

				
			}

			if (block_text_length > 220) {createExpandableBlock(comments_wrap,line);}

		// bibliography_data
			if (row_object.bibliography_data && row_object.bibliography_data.length>0) {
				//create the graphical red line that divide blocks
				const lineSeparator = common.create_dom_element({
					element_type	: "div",
					class_name		: "info_line separator",
					parent 			: line
				})
				//create the tittle block inside a red background
				common.create_dom_element({
					element_type	: "label",
					class_name 		: "big_label",
					text_content	: tstring.bibliographic_references || "Bibliographic references",
					parent			: lineSeparator
				})

				const ref_biblio		= row_object.bibliography_data
				const ref_biblio_length	= ref_biblio.length

				// row_field set
				const row_field = biblio_row_fields // placed in 'page/js/biblio_row_fields.js'

				const bibliography_block = common.create_dom_element({
					element_type	: "div",
					class_name		: "info_text_block",
					parent			: line
				})


				for (var i = 0; i < ref_biblio_length; i++) {

					const biblio_row_wrapper = common.create_dom_element({
						element_type	: "div",
						class_name		: "bibliographic_reference",
						parent			: bibliography_block
					})

					const current_biblio_object = ref_biblio[i]
					row_field.biblio_object = current_biblio_object

					const biblio_row = row_field.row_bibliography()


					biblio_row_wrapper.appendChild(biblio_row)

				}

				createExpandableBlock(bibliography_block,line);
			}


		// container final add
		container.appendChild(fragment)

		return container


		//Create an expandable block when text length is over 500
		function createExpandableBlock (textBlock,nodeParent) {

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
		}

	},//end draw_row

	/**
	* DRAW_TYPES
	*/
	draw_types : function(options) {
		const self = this
		
		if (options.ar_rows.period && options.ar_rows.period.length>0){

			const container 	 = options.target
			const ar_rows		 = options.ar_rows.children
			const ar_rows_length = ar_rows.length
			// container select and clean container div
			while (container.hasChildNodes()) {
				container.removeChild(container.lastChild);
			}

			const fragment = new DocumentFragment();

			// label types
			common.create_dom_element({
				element_type 	: "label",
				text_content 	: tstring.tipos || "Types",
				parent 			: fragment
			})

			//console.groupCollapsed("Types info");
			for (let i = 0; i < ar_rows_length; i++) {

				const row_object = ar_rows[i]

				// row_line
				const row_line = common.create_dom_element({
					element_type 	: "div",
					class_name 		: "type_row",
					parent 			: fragment
				})

				// section_id
				if (dedalo_logged===true) {

					const link = common.create_dom_element({
						element_type	: "a",
						class_name		: "section_id go_to_dedalo",
						text_content	: row_object.section_id,
						href			: '/dedalo/lib/dedalo/main/?t=numisdata3&id=' + row_object.section_id,
						parent			: row_line
					})
					link.setAttribute('target', '_blank');
				}

				const children_container = common.create_dom_element({
					element_type	: "div",
					class_name		: "children_container",
					parent 			: fragment
				})

				const period_label = common.create_dom_element({
					element_type	: "div",
					class_name		: "ts_period",
					text_content 	: row_object.term,
					parent 			: children_container
				})

				common.create_dom_element ({
					element_type 	: "div",
					class_name		: "arrow",
					parent 			: period_label
				})

				//PERIOD wrap
				const row_period = common.create_dom_element({
					element_type	: "div",
					class_name		: "row_node ts_period hide",
					parent 			: children_container
				})

				if (row_object.children != null){
					//if has numismatics groups
					const group_length = row_object.children.length
					for (let z = 0; z < group_length; z++) {

						//GROUP wrap
						const children_container = common.create_dom_element({
							element_type	: "div",
							class_name		: "children_container",
							parent 			: row_period
						})

						const children_label = common.create_dom_element({
							element_type	: "div",
							class_name		: "ts_numismatic_group",
							text_content 	: row_object.children[z].term,
							parent 			: children_container
						})

						common.create_dom_element ({
							element_type 	: "div",
							class_name		: "arrow",
							parent 			: children_label
						})

						const row_group = common.create_dom_element({
							element_type	: "div",
							class_name		: "row_node hide",
							parent 			: children_container
						})


						const types_block = self.draw_types_block (row_object.children[z].types)

						row_group.appendChild(types_block)

						const image_gallery_containers = types_block.querySelectorAll('.gallery')

						if (image_gallery_containers){
							for (let i=0;i<image_gallery_containers.length;i++){
								page.activate_images_gallery(image_gallery_containers[i])
							}
						}

						createFolderedGroup(children_label,row_group)

					}
				} else {
					//if doesn't has numismatics groups


					const types_block = self.draw_types_block (row_object.children)

					row_period.appendChild(types_block)

					const image_gallery_containers = types_block.querySelectorAll('.gallery')
					if (image_gallery_containers){
							for (let i=0;i<image_gallery_containers.length;i++){
								page.activate_images_gallery(image_gallery_containers[i])
							}
						}

				}
				createFolderedGroup(period_label,row_period)
			}

			// container final add
			container.appendChild(fragment)

			function createFolderedGroup(label,row_group) {

				const label_arrow = label.firstElementChild;

				label.addEventListener("click",function(){
					if (row_group.classList.contains("hide")){
						row_group.classList.remove ("hide");
						label_arrow.style.transform = "rotate(90deg)";
					} else {
						row_group.classList.add("hide");
						label_arrow.style.transform = "rotate(0deg)";
					}
				})

			}

		} else {
			document.getElementById('types').remove()
		}

	},//end draw_types

	//Draw a entyre block of types
	// param options: array with type objects
	// return: HTML Object with a types block
	draw_types_block : function(options) {
		const self = this
		const types_ar = options
		const types_ar_length = types_ar.length

		const children_container = common.create_dom_element({
			element_type	: "div",
			class_name		: "types_container",
		})

		let previowsTypeNumber = ""

		for (let i=0;i<types_ar_length;i++){
			const type_row = types_ar[i]
			//if has subtypes
			if (type_row.children.length > 0){
				const subTypes = type_row.children
				const subTypes_length = subTypes.length

				for (let z=0;z<subTypes_length;z++){
					const subType = subTypes[z]

					let isFirstElemenet = false

					z===0 ? isFirstElemenet = true : isFirstElemenet = false
					create_type_element(subType,true,isFirstElemenet,type_row.term);
				}
			} else {
				create_type_element(type_row,false,true);
			}
		}

		function create_type_element(data,isSubtype,isFirstElement,parentSubType){

			const type_row = data;

			// let type_row_term = ""
			const type_row_term = (type_row.term.indexOf(",") == -1)
				? type_row.term
				: type_row.term.slice(0,type_row.term.indexOf(","))

			const mint_number = (type_row.ref_mint_number)
				? type_row.ref_mint_number+'/'
				: ''

			let type_number = ""
			let subType_number = ""
			let SubTypeClass = ""
			const type_section_id = type_row.term_data.replace(/[\["\]]/g, '')
			let type_href = page_globals.__WEB_ROOT_WEB__ + '/type/' + type_section_id
			let subType_href = type_href

			if (!isSubtype) {
				type_number = "MIB "+mint_number+type_row_term
			} else {
				subType_number = "MIB "+mint_number+type_row_term
				SubTypeClass = "subType_number"
				if (isFirstElement){
					type_href = ""
					let parent_term = ""
					parentSubType.indexOf(",") == -1 ? parent_term = parentSubType : parent_term = parentSubType.slice(0,parentSubType.indexOf(","))
					type_number =  "MIB "+parent_term
				}
			}

			//Type wrap
			const row_type = common.create_dom_element({
				element_type	: "div",
				class_name		: "type_wrap",
				parent 			: children_container
			})

			const number_wrap = common.create_dom_element({
				element_type	: "div",
				class_name		: "type_number",
				parent 			: row_type
			})

			common.create_dom_element({
				element_type	: "a",
				inner_html  	: type_number,
				class_name		: "type_label",
				href 			: type_href,
				parent 			: number_wrap
			})

			common.create_dom_element({
				element_type	: "a",
				inner_html 	    : subType_number,
				class_name		: "subType_label "+SubTypeClass,
				href 			: subType_href,
				parent 			: number_wrap
			})

			const img_wrap = common.create_dom_element({
				element_type 	: "div",
				class_name 		: "types_img gallery",
				parent 			: row_type
			})

			const img_link_ob = common.create_dom_element({
				element_type 	: "a",
				class_name		: "image_link",
				href 			: common.local_to_remote_path(type_row.ref_coins_image_obverse),
				parent 			: img_wrap,
			})

			common.create_dom_element({
				element_type	: "img",
				src 			: common.local_to_remote_path(type_row.ref_coins_image_obverse),
				parent 			: img_link_ob
			}).loading="lazy"

			const img_link_re = common.create_dom_element({
				element_type 	: "a",
				class_name		: "image_link",
				href 			: common.local_to_remote_path(type_row.ref_coins_image_reverse),
				parent 			: img_wrap,
			})

			common.create_dom_element({
				element_type	: "img",
				src 			: common.local_to_remote_path(type_row.ref_coins_image_reverse),
				parent 			: img_link_re
			}).loading="lazy"

			const info_wrap = common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_wrap",
				parent 			: row_type
			})

			const type_measures = type_row.ref_type_averages_weight+" g; "+type_row.ref_type_averages_diameter+"mm"
			common.create_dom_element ({
				element_type 	: "p",
				class_name 		: "type_info",
				text_content 	: type_measures,
				parent 			: info_wrap
			})

			const permanent_uri = page_globals.__WEB_BASE_URL__ + page_globals.__WEB_ROOT_WEB__ + "/type/" + type_row.section_id
			const relative_uri = page_globals.__WEB_ROOT_WEB__ + "/type/" + type_section_id
			common.create_dom_element ({
				element_type 	: "a",
				class_name 		: "type_info",
				text_content 	: "URI",
				href 			: relative_uri,
				parent 			: info_wrap
			})
		}

		return children_container;
	},


	/**
	* DRAW_MAP
	*/
	draw_map : function(options) {

		const self = this

		// options
		const mint_map_data		= options.mint_map_data
		const mint_popup_data	= options.mint_popup_data
		const place_data = options.place_data


		self.get_place_data({
			place_data : place_data
		}).then(function(response){

			console.log (response);

			const map_position	= mint_map_data
			const container		= document.getElementById("map_container")

			self.map = self.map || new map_factory() // creates / get existing instance of map
			self.map.init({
				map_container	: container,
				map_position	: map_position,
				popup_builder	: page.map_popup_builder,
				popup_options	: page.maps_config.popup_options,
				source_maps		: page.maps_config.source_maps
			})

			var map_data_clean = self.map_data(mint_map_data, mint_popup_data) // prepares data to used in map
			
			//findspots to map
			const findspots_map_data = response.result[0].result;
			if (findspots_map_data && findspots_map_data.length>0){
			
				for (let i=0;i<findspots_map_data.length;i++){
					const findspot_map_data = JSON.parse(findspots_map_data[i].map)
					const findspot_popup_data = parse_popup_data(findspots_map_data[i])

					const findspot_map_data_clean = self.map_data(findspot_map_data,findspot_popup_data)
					
					console.log(findspot_popup_data)

					map_data_clean.push(findspot_map_data_clean[0])
				}
			}

			//hoards to map
			const hoards_map_data = response.result[1].result;
			if (hoards_map_data && hoards_map_data.length>0){
			
				for (let i=0;i<hoards_map_data.length;i++){
					const hoard_map_data = JSON.parse(hoards_map_data[i].map)
					const hoard_popup_data = parse_popup_data(hoard_map_data[i])

					const hoard_map_data_clean = self.map_data(hoard_map_data,hoard_popup_data)
					
					console.log(hoard_map_data_clean)

					map_data_clean.push(hoard_map_data_clean[0])
				}
			}

			console.log(map_data_clean)
			// draw points
			self.map.parse_data_to_map(map_data_clean, null)
			.then(function(){
				container.classList.remove("hide_opacity")
			})
	
		})

		function parse_popup_data(data){
			
			const popup_data = ({
				section_id : data.section_id,
				title 		: data.name,
				description : ""
			})

			return popup_data;
		}
		
	},//end draw_map

	get_place_data : function(data){

		const place_data = data.place_data

		const sql_filter = "place_data='" + place_data + "'";
		console.log (sql_filter)
			const ar_calls = []

			ar_calls.push ({
				id		: "findspots",
				options	: {
					dedalo_get				: 'records',
					table					: 'findspots',
					db_name					: page_globals.WEB_DB,
					lang					: page_globals.WEB_CURRENT_LANG_CODE,
					ar_fields				: ["*"],
					count					: false,
					sql_filter				: sql_filter
				}
			})

			ar_calls.push ({
				id		: "hoards",
				options	: {
					dedalo_get				: 'records',
					table					: 'hoards',
					db_name					: page_globals.WEB_DB,
					lang					: page_globals.WEB_CURRENT_LANG_CODE,
					ar_fields				: ['section_id','place_data','name','map'],
					count					: false,
					sql_filter				: sql_filter
				}
			})

			const js_promise = data_manager.request({
				body : {
					dedalo_get 	: 'combi',
					ar_calls 	: ar_calls
				}
			})
			
			return js_promise
	},


	/**
	* MAP_DATA
	* @return array data
	*/
	map_data : function(data, popup_data) {

		const self = this

		// console.log("--map_data data:",data);

		const ar_data = Array.isArray(data)
			? data
			: [data]

		const data_clean = []
		for (let i = 0; i < ar_data.length; i++) {

			const item = {
				lat			: ar_data[i].lat,
				lon			: ar_data[i].lon,
				marker_icon	: page.maps_config.markers.mint,
				data		: popup_data
			}
			data_clean.push(item)
		}

		// console.log("--map_data data_clean:",data_clean);

		return data_clean
	},//end map_data




}//end mints
