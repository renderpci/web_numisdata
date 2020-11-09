/*global get_label, page_globals, SHOW_DEBUG, DEDALO_CORE_URL*/
/*eslint no-undef: "error"*/
"use strict";



var type =  {



	// trigger_url
	// trigger_url : page_globals.__WEB_TEMPLATE_WEB__ + "/type/trigger.type.php",
	
	// search_options
	search_options : {},

	// map. Instance of map_factory
	map : null,



	/**
	* SET_UP
	* When the HTML page is loaded
	*/
	set_up : function(options) {

		const self = this

		// debug
			if(SHOW_DEBUG===true) {
				console.log("type set_up options:",options);
			}			

		// trigger render type with current options.section_id 
			if (typeof options.section_id!=="undefined") {
				
				// search by section_id	and draw on receive data		
					self.get_row_data({						
						section_id : options.section_id					
					})
					.then(function(response){
						console.log("/// response:", response);
						console.log("/// row:", response.result[0]);							

						const container	= document.getElementById('row_detail')
						// container. clean container div
						while (container.hasChildNodes()) {
							container.removeChild(container.lastChild);
						}
						
						const ar_rows	= response.result
						const type 		= ar_rows.find(item => item.id === 'type')
						const catalog 	= ar_rows.find(item => item.id === 'catalog')

						type.result[0].catalog = catalog.result[0]

						
						if (typeof type.result[0]!=="undefined") {
							 
							// parse data
							const row = page.parse_type_data(type.result[0])
							
							// render row nodes
							self.list_row_builder(row)
							.then(function(row_wrapper){
								container.appendChild(row_wrapper)

								// activate images lightbox
									const images_gallery_containers = row_wrapper.querySelectorAll('.gallery')
									// console.log("images_gallery_containers:",images_gallery_containers);
									if (images_gallery_containers) {
										for (let i = 0; i < images_gallery_containers.length; i++) {
											page.activate_images_gallery(images_gallery_containers[i])
										}
									}									
							})
						}
					})
			}
	
		// navigate across records group
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
	* Call public API for row data based on current type section_id
	*/
	get_row_data : function(options) {

		const self = this

		// options
				const section_id	= options.section_id
				const lang			= options.lang || page_globals.WEB_CURRENT_LANG_CODE


		// combined call
			const ar_calls = []			
			
		// TYPE CALL
				
			ar_calls.push({
				id		: "type",
				options	: {
					dedalo_get				: 'records',
					table					: "types",
					ar_fields				: ["*"],
					lang					: lang,
					sql_filter				: "section_id = " + parseInt(section_id),
					resolve_portal			: true,
					resolve_portals_custom	: {
						"bibliography_data"				: "bibliographic_references",
						// coins resolution
						"ref_coins_union"				: "coins",
						"coins.bibliography_data"		: "bibliographic_references",
						// "coins.images_obverse"		: "images",
						// findspots resolution
						"ref_coins_findspots_data"		: "findspots",
						"findspots.bibliography_data"	: "bibliographic_references",
						// hoard resolution
						"ref_coins_hoard_data"			: "hoards",
						"hoards.bibliography_data"		: "bibliographic_references"				
					},
					// group				: (group.length>0) ? group.join(",") : null,
					count					: false,
					// limit				: null,
					// offset				: 0,
					// order				: null,
					// process_result		: process_result
				}
			})

		// catalog call

			ar_calls.push({
				id		: "catalog",
				options	: {
					dedalo_get				: 'records',
					table					: "catalog",
					ar_fields				: ["section_id","term","term_data","term_table","term_section_tipo","parents"],
					lang					: lang,
					sql_filter				: "term_data like '%\"" + parseInt(section_id) + "\"%' AND term_table ='types'" ,
					// group				: (group.length>0) ? group.join(",") : null,
					resolve_portal			: true,
					resolve_portals_custom	: {
						"parents"				: "catalog"
					},
					count					: false,
					// limit				: null,
					// offset				: 0,
					// order				: null,
					// process_result		: process_result
				}
			})

				console.log("ar_calls:",ar_calls);

			
		// request
			const js_promise = data_manager.request({
				body : {
					dedalo_get	: 'combi',
					ar_calls	: ar_calls
				}
			})

		// OLD WAY (SERVER CALL)
			// // trigger vars
			// 	const trigger_url  = self.trigger_url
			// 	const trigger_vars = {
			// 		mode 	 	: "get_row_data",
			// 		section_id 	: section_id
			// 	}
		
			// // Http request directly in javascript to the API is possible too..
			// 	const js_promise = common.get_json_data(trigger_url, trigger_vars).then(function(response){
			// 		if(SHOW_DEBUG===true) {
			// 			console.log("--[type.get_row_data] get_json_data response:", response);
			// 		}

			// 		if (!response) {
			// 			// Error on load data from trigger
			// 			console.warn("[type.get_row_data] Error. Received response data is null");
			// 			return false

			// 		}else{
			// 			// Success
			// 			return response.result
			// 		}
			// 	})
		
		return js_promise
	},//end get_row_data



	/**
	* LIST_ROW_BUILDER
	* Build DOM nodes to insert into list pop-up
	*/
	list_row_builder : function(row) {
		
		const self = this

		return new Promise(function(resolve){		

			// parse type bibliography_data
				self.parse_publication(row.bibliography_data)

			// parse type coins.bibliography_data
				const coins_length = row.ref_coins_union.length
				for (let i = 0; i < coins_length; i++) {
					const item = row.ref_coins_union[i]
					self.parse_publication(item.bibliography_data)
				}
			
			// parse type findspots.bibliography_data			
				const findspots_length = row.ref_coins_findspots_data.length;
				for (let i = 0; i < findspots_length; i++) {
					const item = row.ref_coins_findspots_data[i]
					self.parse_publication(item.bibliography_data)
				}

			// parse type hoards.bibliography_data
				const hoards_length = row.ref_coins_hoard_data.length
				for (let i = 0; i < hoards_length; i++) {
					const item = row.ref_coins_hoard_data[i]
					self.parse_publication(item.bibliography_data)
				}

			// parse parse_ordered_coins creating _coins_group	
				self.parse_ordered_coins(row)
				

			// render row
				row_fields.caller	= self
				const row_node		= row_fields.draw_item(row)


			resolve(row_node)
		})
	},//end list_row_builder



	/**
	* PARSE_PUBLICATION
	* Modify the received data by recombining publication information
	* @return array parsed_data
	*/
	parse_publication : function(data) {
		return page.parse_publication(data)

		// const self = this

		// const parsed_data	= []
		// const separator		= " # ";
		// const data_length	= data.length
		// for (let i = 0; i < data_length; i++) {
			
		// 	const reference = data[i]

		// 	// add publications property to store all resolved references
		// 		reference._publications = []

		// 	const publications_data			= JSON.parse(reference.publications_data)
		// 	const publications_data_length	= publications_data.length
		// 	if (publications_data_length>0) {

		// 		const ref_publications_authors	= page.split_data(reference.ref_publications_authors, separator)
		// 		const ref_publications_date		= page.split_data(reference.ref_publications_date, separator)
		// 		const ref_publications_editor	= page.split_data(reference.ref_publications_editor, separator)
		// 		const ref_publications_magazine	= page.split_data(reference.ref_publications_magazine, separator)
		// 		const ref_publications_place	= page.split_data(reference.ref_publications_place, separator)
		// 		const ref_publications_title	= page.split_data(reference.ref_publications_title, separator)
		// 		const ref_publications_url		= page.split_data(reference.ref_publications_url, separator)
				
		// 		for (let j = 0; j < publications_data_length; j++) {
					
		// 			const section_id = publications_data[j]

		// 			const parsed_item = {
		// 				reference	: reference.section_id,
		// 				section_id	: section_id,
		// 				authors		: ref_publications_authors[j] || null,
		// 				date		: ref_publications_date[j] || null,
		// 				editor		: ref_publications_editor[j] || null,
		// 				magazine	: ref_publications_magazine[j] || null,
		// 				place		: ref_publications_place[j] || null,
		// 				title		: ref_publications_title[j] || null,
		// 				url			: ref_publications_url[j] || null,
		// 			}

		// 			reference._publications.push(parsed_item)
		// 			parsed_data.push(parsed_item)
		// 		}
		// 	}
			
		// }
		// // console.log("parsed_data:",parsed_data);

		// return parsed_data
	},//end parse_publication



	/**
	* PARSE_ordered_coins
	* Modify the received data by recombining coins information
	* @return array parsed_data
	*/
	parse_ordered_coins : function(row) {

		const self = this

		const parsed_data	= []
		const separator		= " | "

		const typology_data			= page.split_data(row.ref_coins_typology_data, separator) // format is '["1"] | ["2"]'
		const typology_data_length	= typology_data.length

		const typology	=  page.split_data(row.ref_coins_typology, separator)
		const ref_coins	=  page.split_data(row.ref_coins, separator)

		for (let i = 0; i < typology_data_length; i++) {
			
			const typology_id = JSON.parse(typology_data[i])[0] // format is ["1"]
			
			const parsed_item = {
				typology_id	: typology_id,
				typology	: typology[i] || null,
				coins		: JSON.parse(ref_coins[i]) || null,
				
			}

			parsed_data.push(parsed_item)
		}

		// assign to new property '_coins_group'
			row._coins_group = parsed_data
		
		
		return parsed_data
	},//end parse_ordered_coins



	/**
	* RENDER_MAP
	* Note: map_factory draw a base map on init. If no points to render are required,
	* render command is not necessary
	*/
	render_map : function(options) {
		
		const self = this

		const target		= options.target
		const map_data		= options.map_data || []
		const map_position	= options.map_position
		if (map_position) {
			map_position.zoom = 11 // force max zoom for dare
		}

		if (map_data.length<1) {
			return null;
		}
		
		self.map = self.map || new map_factory() // creates / get existing instance of map
		self.map.init({
			target				: target,
			map_position		: map_position,
			// data				: map_data,			
			// popup_builder	: self.map_popup_builder,
			source_maps			: [
				{
					name	: "dare",
					// url	: '//pelagios.org/tilesets/imperium/{z}/{x}/{y}.png',
					url		: '//dh.gu.se/tiles/imperium/{z}/{x}/{y}.png',
					options	: { maxZoom: 11 },
					default	: true
				},
				{
					name	: "arcgis",
					url		: '//server.arcgisonline.com/ArcGIS/' + 'rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
					options	: {}
				},
				{
					name	: "osm",
					url		: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
					options	: {}
				},
				// {
				// 	name	: "grey",
				// 	url 	: '//{s}.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYWxleGFkZXYiLCJhIjoiY2lrOHdvaTQzMDEwbHY5a3UxcDYxb25ydiJ9.h737F1gRyib-MFj6uAXs9A',
				// 	options	: {
				// 		maxZoom	: 20,
				// 		id		: 'alexadev.p2lbljap'
				// 	}
				// }
			]
		})

		const map_data_clean = self.map_data(map_data) // prepares data to use in map
		self.map.render({
			map_data : map_data_clean
		})

		
		return true
	},//end render_map



	/**
	* MAP_DATA
	* @return array data
	*/
	map_data : function(data) {
		
		const self = this

		console.log("--map_data data:",data);

		const data_clean = []
		for (let i = 0; i < data.length; i++) {
			
			const item = {
				lat		: data[i].data.lat,
				lon		: data[i].data.lon,
				data	: {
					section_id	: data[i].section_id,
					name		: data[i].name,
					place		: data[i].place,
					type 		: data[i].type,
					items 		: data[i].items,
					total_items	: data[i].total_items
				},
			}
			data_clean.push(item)
		}

		console.log("--map_data data_clean:",data_clean);

		return data_clean
	},//end map_data



	/**
	* DRAW_ROW
	*//*
	draw_row__OLD_use_row_fields_instead : function(options) {

		const row_object	= options.ar_rows[0]
		const container 	= options.target

		// fix row_object
			self.row_object = row_object

		// debug
			if(SHOW_DEBUG===true) {
				console.log("--Type row_object:",row_object);
			}		

		// container. clean container div
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

		// section_id (dedalo users only)
			if (dedalo_logged===true) {

				const link = common.create_dom_element({
					element_type 	: "a",
					class_name 		: "section_id go_to_dedalo",
					text_content 	: row_object.section_id,
					href 			: '/dedalo/lib/dedalo/main/?t=numisdata3&id=' + row_object.section_id,
					parent 			: line
				})
				link.setAttribute('target', '_blank');
			}

		// mint
			if (row_object.mint && row_object.mint.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.mint || "Mint",
					parent 			: line
				})

				const mint = row_object.mint
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: mint,
					parent 			: line
				})
			}

		// creators
			if (row_object.creators && row_object.creators.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.creators || "Creators",
					parent 			: line
				})

				const creators = common.clean_gaps(row_object.creators) // , splitter=" | ", joinner=", "				
				const creators_value = common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: creators,
					parent 			: line
				})

				if (row_object.creators_rol && row_object.creators_rol.length>0) {
					const creators_rol = " (" + common.clean_gaps(row_object.creators_rol) + ")" // , splitter=" | ", joinner=", "				
					common.create_dom_element({
						element_type 	: "span",
						class_name 		: "info_value",
						text_content 	: creators_rol,
						parent 			: creators_value
					})
				}
			}

		// date
			if (row_object.date && row_object.date.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.date || "Date",
					parent 			: line
				})

				const date = row_object.date
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: date,
					parent 			: line
				})
			}

		// number
			if (row_object.number && row_object.number.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.number || "Number",
					parent 			: line
				})

				const number = row_object.number
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: number,
					parent 			: line
				})
			}

		// material
			if (row_object.material && row_object.material.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.material || "Material",
					parent 			: line
				})

				const material = row_object.material
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: material,
					parent 			: line
				})
			}

		// denomination
			if (row_object.denomination && row_object.denomination.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.denomination || "Denomination",
					parent 			: line
				})

				const denomination = row_object.denomination
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: denomination,
					parent 			: line
				})
			}

		// averages_diameter
			if (row_object.averages_diameter && row_object.averages_diameter.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.averages_diameter || "Averages diameter",
					parent 			: line
				})

				const averages_diameter = row_object.averages_diameter
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: averages_diameter,
					parent 			: line
				})
			}

		// averages_weight
			if (row_object.averages_weight && row_object.averages_weight.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.averages_weight || "averages_weight",
					parent 			: line
				})

				const averages_weight = row_object.averages_weight
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: averages_weight,
					parent 			: line
				})
			}

		// image_obverse
			if (typeof row_object.coins[0]!=="undefined" && typeof row_object.coins[0].images_obverse[0]!=="undefined") {

				common.create_dom_element({
					element_type 	: "img",
					class_name 		: "image_obverse",
					src 			: row_object.coins[0].images_obverse[0].image,
					parent 			: line
				})
			}

		// design_obverse
			if (row_object.design_obverse && row_object.design_obverse.length>0) {

				common.create_dom_element({
					element_type	: "label",
					class_name		: "",
					inner_html		: tstring.design_obverse || "Design obverse",
					parent			: line
				})

				const design_obverse = common.clean_gaps(row_object.design_obverse) // , splitter=" | ", joinner=", "
				common.create_dom_element({
					element_type	: "span",
					class_name		: "info_value",
					inner_html		: design_obverse,
					parent			: line
				})
			}

		// legend_obverse
			if (row_object.legend_obverse && row_object.legend_obverse.length>0) {

				common.create_dom_element({
					element_type	: "label",
					class_name		: "",
					inner_html		: tstring.legend_obverse || "Legend obverse",
					parent			: line
				})

				const legend_obverse = common.clean_gaps(row_object.legend_obverse) // , splitter=" | ", joinner=", "
				common.create_dom_element({
					element_type	: "span",
					class_name		: "info_value",
					inner_html		: legend_obverse,
					parent			: line
				})
			}

		// simbol_obverse
			if (row_object.simbol_obverse && row_object.simbol_obverse.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					inner_html 	: tstring.simbol_obverse || "Simbol obverse",
					parent 			: line
				})

				const simbol_obverse = common.clean_gaps(row_object.simbol_obverse) // , splitter=" | ", joinner=", "
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					inner_html 	: simbol_obverse,
					parent 			: line
				})
			}

		// image_reverse
			if (typeof row_object.coins[0]!=="undefined" && typeof row_object.coins[0].images_obverse[0]!=="undefined") {

				common.create_dom_element({
					element_type	: "img",
					class_name		: "image_reverse",
					src				: row_object.coins[0].images_obverse[0].image,
					parent			: line
				})
			}

		// design_reverse
			if (row_object.design_reverse && row_object.design_reverse.length>0) {

				common.create_dom_element({
					element_type	: "label",
					class_name		: "",
					inner_html		: tstring.design_reverse || "Design reverse",
					parent			: line
				})

				const design_reverse = common.clean_gaps(row_object.design_reverse) // , splitter=" | ", joinner=", "
				common.create_dom_element({
					element_type	: "span",
					class_name		: "info_value",
					inner_html		: design_reverse,
					parent			: line
				})
			}

		// legend_reverse
			if (row_object.legend_reverse && row_object.legend_reverse.length>0) {

				common.create_dom_element({
					element_type	: "label",
					class_name		: "",
					inner_html		: tstring.legend_reverse || "Legend reverse",
					parent			: line
				})
				
				const legend_reverse = common.clean_gaps(row_object.legend_reverse) // , splitter=" | ", joinner=", "
				common.create_dom_element({
					element_type	: "span",
					class_name		: "info_value",
					inner_html		: legend_reverse,
					parent			: line
				})
			}

		// simbol_reverse
			if (row_object.simbol_reverse && row_object.simbol_reverse.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					inner_html		: tstring.simbol_reverse || "Simbol reverse",
					parent 			: line
				})

				const simbol_reverse = common.clean_gaps(row_object.simbol_reverse) // , splitter=" | ", joinner=", "
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					inner_html		: simbol_reverse,
					parent 			: line
				})
			}

		// equivalents
			if (row_object.equivalents && row_object.equivalents.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					inner_html		: tstring.equivalents || "Equivalents",
					parent 			: line
				})

				const equivalents = common.clean_gaps(row_object.equivalents) // , splitter=" | ", joinner=", "
				common.create_dom_element({
					element_type	: "span",
					class_name		: "info_value",
					inner_html		: equivalents,
					parent			: line
				})
			}

		// bibliography
			if (row_object.bibliography && row_object.bibliography.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					inner_html		: tstring.bibliography || "Bibliography",
					parent 			: line
				})

				const bibliography = common.clean_gaps(row_object.bibliography) // , splitter=" | ", joinner=", "				
				common.create_dom_element({
					element_type	: "span",
					class_name		: "info_value",
					inner_html		: bibliography,
					parent			: line
				})
			}


		// container final fragment add
			container.appendChild(fragment)


		return container
	},//end draw_row
	*/

	
}//end type
