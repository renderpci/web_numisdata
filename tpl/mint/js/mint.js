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
						map_data : JSON.parse(mint.result[0].map),
						popup_data : {
							section_id	: mint.result[0].section_id,
							title		: mint.result[0].name,
							description	: mint.result[0].history.trim()
						}
					})

				// types draw
					const mint_catalog = response.result.find( el => el.id==='mint_catalog')
					if (mint_catalog.result) {
						self.get_types_data({
							section_id : mint_catalog.result[0].section_id
						})
						.then(function(result){
							self.draw_types({
								target	: document.getElementById('types'),
								ar_rows	: result
							})
						})
					}

					// const catalog_response = response.result.find( el => el.id==='catalog')
					// if (catalog_response && catalog_response.result) {
					// 	const catalog_data = page.parse_catalog_data(catalog_response.result)
					// 	console.log("catalog_data:",catalog_data);
					// }

					var bibliography_data= response.result[0].result[0].bibliography_data;
					console.log(bibliography_data);
					if (bibliography_data.length>0){

						var bibliographics_references = [];

						for (let i=0; i<bibliography_data.length;i++){
							bibliographics_references.push(bibliography_data[i].publications_data);
						}
						console.log("BB",bibliographics_references)
						
						self.get_bibliography_data(bibliographics_references)
						.then(function(result){
							console.log("HECHO")
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
					ar_fields				: ['section_id','term'],
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
						ar_fields	: ['term_data','ref_type_denomination','term','parent','parents','children'],
						count		: false,
						limit		: 0,
						order		: 'norder ASC',
						sql_filter	: "term_table='types' AND parents LIKE '%\"" + parseInt(section_id) + "\"%'"
					}
				})
				.then(function(response){
					
					const types_data = []
					if (response.result && response.result.length>0) {
						for (let i = 0; i < response.result.length; i++) {
							
							const row = {
								catalog			: 'MIB',
								section_id		: response.result[i].term_data.replace(/[\["\]]/g, ''),
								denomination	: response.result[i].ref_type_denomination,
								number			: response.result[i].term,
								parent 			: JSON.parse(response.result[i].parent)[0],
								parents 		: JSON.parse(response.result[i].parents),
								children 		: JSON.parse(response.result[i].children)
							}							

							types_data.push(row)
						}
					}
					console.log("--> get_types_data types_data:",types_data);					

					resolve(types_data)
				})
		})
	},//end get_types_data



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

		// name
			if (row_object.name && row_object.name.length>0) {

				const lineTittleWrap = common.create_dom_element({
					element_type	: "div",
					class_name		: "line-tittle-wrap",
					parent 			: line
				})
				
				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "value-term",
					text_content 	: tstring.name || "Name:",
					parent 			: lineTittleWrap
				})


				const name = row_object.name
				common.create_dom_element({
					element_type 	: "div",
					class_name 		: "line-tittle",
					text_content 	: name,
					parent 			: lineTittleWrap
				})
			}

		// place
			if (row_object.place && row_object.place.length>0) {

				const lineSeparator = common.create_dom_element({
					element_type	: "div",
					class_name		: "info_line separator",
					parent 			: line
				})

				common.create_dom_element({
					element_type 	: "label",		
					class_name 		: "big_label",			
					text_content 	: tstring.place || "Place",
					parent 			: lineSeparator
				})

				const place = row_object.place
				common.create_dom_element({
					element_type 	: "div",
					class_name 		: "info_value",
					text_content 	: place,
					parent 			: line
				})
			}

		// history
			if (row_object.history && row_object.history.length>0) {

				const lineSeparator = common.create_dom_element({
					element_type	: "div",
					class_name		: "info_line separator",
					parent 			: line
				})

				common.create_dom_element({
					element_type	: "label",	
					class_name 		: "big_label",		
					text_content	: tstring.history || "History",
					parent			: lineSeparator
				})

				const history = row_object.history

				createTextBlock(history,line);
			}

		// numismatic_comments
			if (row_object.numismatic_comments && row_object.numismatic_comments.length>0) {

				const lineSeparator = common.create_dom_element({
					element_type	: "div",
					class_name		: "info_line separator",
					parent 			: line
				})

				common.create_dom_element({
					element_type	: "label",	
					class_name 		: "big_label",				
					text_content	: tstring.numismatic_comments || "Numismatic comments",
					parent			: lineSeparator
				})

				const numismatic_comments = row_object.numismatic_comments

				createTextBlock(numismatic_comments,line);
			}

		// container final add
		container.appendChild(fragment)

		return container


		//Create an expandable block when text length is over 500
		function createTextBlock (text,nodeParent) {
			const textBlock = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_text_block",
				inner_html		: text,
				parent			: nodeParent
			})

			if (text.length>500){
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
		}	

	},//end draw_row

	get_bibliography_data : function(options){

		const self = this

		//const section_id = options.section_id

		return new Promise(function(resolve){

			// request
				const js_promise = data_manager.request({
					body : {
						dedalo_get	: 'records',
						table		: 'publications',
						db_name		: page_globals.WEB_DB,
						lang		: page_globals.WEB_CURRENT_LANG_CODE,
						//ar_fields	: ['section_id','ref_publications_title','ref_publications_authors','ref_publications_url','ref_publications_place','children'],
						count		: false,
						limit		: 0,
						order		: 'norder ASC',
						//sql_filter	: "term_table='types' AND parents LIKE '%\"" + parseInt(section_id) + "\"%'"
					}
				})
				.then(function(response){
					
					const types_data = []
					if (response.result && response.result.length>0) {
						for (let i = 0; i < response.result.length; i++) {
							
							const row = {
								catalog			: 'MIB',
								section_id		: response.result[i].term_data.replace(/[\["\]]/g, ''),
								denomination	: response.result[i].ref_type_denomination,
								number			: response.result[i].term,
								parent 			: JSON.parse(response.result[i].parent)[0],
								parents 		: JSON.parse(response.result[i].parents),
								children 		: JSON.parse(response.result[i].children)
							}							

							types_data.push(row)
						}
					}
					console.log("--> get_types_data types_data:",types_data);					

					resolve(types_data)
				})
		})
	},

	/**
	* DRAW_BIBLIOGRAPHY
	*/
	draw_bibliography : function(options){
		
			if (row_object.bibliography_data && row_object.bibliography_data.length>0) {

				const lineSeparator = common.create_dom_element({
					element_type	: "div",
					class_name		: "info_line separator",
					parent 			: line
				})

				common.create_dom_element({
					element_type	: "label",
					class_name 		: "big_label",				
					text_content	: tstring.bibliographic_references || "Bibliographic references",
					parent			: lineSeparator
				})

				for (var i = 0; i < row_object.bibliography_data.length; i++) {
					
					const bibliographic_reference = row_object.bibliography_data[i]
					
					// debug
						if(SHOW_DEBUG===true) {
							console.log("bibliographic_reference:",bibliographic_reference);
						}
					
					// description
						const description = bibliographic_reference.description
						if (description.length>0) {
							common.create_dom_element({
								element_type	: "label",								
								text_content	: tstring.description || "Description",
								parent			: line
							})
							
							common.create_dom_element({
								element_type	: "div",
								class_name		: "info_value",
								inner_html		: description,
								parent			: line
							})
						}

					// info
						const items = common.clean_gaps(bibliographic_reference.items, " | ", ", ")
						if (items.length>0) {
							common.create_dom_element({
								element_type	: "label",								
								text_content	: tstring.info || "Info",
								parent			: line
							})
												
							common.create_dom_element({
								element_type 	: "div",
								class_name 		: "info_value",
								inner_html 		: items,
								parent 			: line
							})
						}

					// pages
						const pages = bibliographic_reference.pages
						if (pages.length>0) {
							common.create_dom_element({
								element_type 	: "label",								
								text_content 	: tstring.pages || "Pages",
								parent 			: line
							})
							
							common.create_dom_element({
								element_type 	: "div",
								class_name 		: "info_value",
								text_content	: pages,
								parent 			: line
							})
						}

					// authors
						const authors = common.clean_gaps(bibliographic_reference.ref_publications_authors, " | ", ", ")
						if (authors.length>0) {
							common.create_dom_element({
								element_type 	: "label",								
								text_content 	: tstring.authors || "Authors",
								parent 			: line
							})
							
							common.create_dom_element({
								element_type 	: "div",
								class_name 		: "info_value",
								text_content	: authors,
								parent 			: line
							})
						}

					// date
						const date = common.clean_gaps(bibliographic_reference.ref_publications_date, " | ", ", ");
						if (date.length>0) {
							common.create_dom_element({
								element_type 	: "label",								
								text_content 	: tstring.date || "Date",
								parent 			: line
							})
							
							common.create_dom_element({
								element_type 	: "div",
								class_name 		: "info_value",
								text_content	: date,
								parent 			: line
							})
						}

					// editor
						const editor = common.clean_gaps(bibliographic_reference.ref_publications_editor, " | ", ", ");
						if (editor.length>0) {
							common.create_dom_element({
								element_type 	: "label",								
								text_content 	: tstring.editor || "Editor",
								parent 			: line
							})
							
							common.create_dom_element({
								element_type 	: "div",
								class_name 		: "info_value",
								text_content	: editor,
								parent 			: line
							})
						}

					// magazine
						const magazine = common.clean_gaps(bibliographic_reference.ref_publications_magazine, " | ", ", ");
						if (editor.length>0) {
							common.create_dom_element({
								element_type 	: "label",								
								text_content 	: tstring.magazine || "Magazine",
								parent 			: line
							})
							
							common.create_dom_element({
								element_type 	: "div",
								class_name 		: "info_value",
								text_content	: magazine,
								parent 			: line
							})
						}

					//place
						const place = common.clean_gaps(bibliographic_reference.ref_publications_place, " | ", ", ");
						if (place.length>0) {
							common.create_dom_element({
								element_type 	: "label",								
								text_content 	: tstring.place || "Place",
								parent 			: line
							})
							
							common.create_dom_element({
								element_type 	: "div",
								class_name 		: "info_value",
								text_content	: place,
								parent 			: line
							})
						}

					//title
						const title = common.clean_gaps(bibliographic_reference.ref_publications_title, " | ", ", ");
						if (title.length>0) {
							common.create_dom_element({
								element_type 	: "label",								
								text_content 	: tstring.title || "Place",
								parent 			: line
							})
							
							common.create_dom_element({
								element_type 	: "div",
								class_name 		: "info_value",
								text_content	: title,
								parent 			: line
							})
						}

					//url
						const url = common.clean_gaps(bibliographic_reference.ref_publications_url, " | ", ", ");
						if (url.length>0) {
							common.create_dom_element({
								element_type 	: "label",								
								text_content 	: tstring.url || "Url",
								parent 			: line
							})
							
							common.create_dom_element({
								element_type 	: "div",
								class_name 		: "info_value",
								text_content	: url,
								parent 			: line
							})
						}
				}				
			}
	},//end draw_bibliography

	/**
	* DRAW_TYPES
	*/
	draw_types : function(options) {

		const container 	 = options.target
		const ar_rows		 = options.ar_rows
		const ar_rows_length = ar_rows.length

		// sort rows
			let collator = new Intl.Collator('es',{ sensitivity: 'base', ignorePunctuation:true});
			ar_rows.sort( (a,b) => {
					let order_a = a.catalogue +" "+ a.number
					let order_b = b.catalogue +" "+ b.number
					//console.log("order_a",order_a, order_b);
					//console.log(collator.compare(order_a , order_b));
				return collator.compare(order_a , order_b)
			});

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

		console.groupCollapsed("Types info");
		for (let i = 0; i < ar_rows_length; i++) {
			
			const row_object = ar_rows[i]

			// debug
				if(SHOW_DEBUG===true) {
					console.log("type row_object:",row_object);;
				}

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
			

			// name
				const name = common.create_dom_element({
					element_type	: "span",
					text_content	: row_object.catalogue + " " +row_object.number,
					parent			: row_line
				})

			// denomination
				const denomination = common.clean_gaps(row_object.denomination, " | ", ", ")
				if (denomination.length>0) {
					const denomination_info = common.create_dom_element({
						element_type	: "span",
						text_content	: " ("+denomination+")",
						parent			: row_line
					})
				}
			
			// equivalents
				// const equivalents = common.clean_gaps(row_object.equivalents, "<br>", ", ")
				// if (equivalents.length>0) {
				// 	const equivalents_info = common.create_dom_element({
				// 		element_type 	: "div",
				// 		class_name 		: "equivalents",
				// 		text_content 	: equivalents,
				// 		parent 			: row_line
				// 	})
				// }

		}
		console.groupEnd();

		// container final add
		container.appendChild(fragment)


		return container
	},//end draw_types



	/**
	* DRAW_MAP
	*/
	draw_map : function(options) {

		const self = this

		// options
			const map_data		= options.map_data
			const popup_data	= options.popup_data


		const map_position	= map_data
		const container		= document.getElementById("map_container")

		self.map = self.map || new map_factory() // creates / get existing instance of map
		self.map.init({
			map_container	: container,
			map_position	: map_position,
			popup_builder	: page.map_popup_builder,
			popup_options	: page.maps_config.popup_options,
			source_maps		: page.maps_config.source_maps
		})
		// draw points
		const map_data_clean = self.map_data(map_data, popup_data) // prepares data to used in map		
		self.map.parse_data_to_map(map_data_clean, null)
		.then(function(){
			container.classList.remove("hide_opacity")
		})
		

		return true
	},//end draw_map


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
