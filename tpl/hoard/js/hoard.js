/*global tstring, page_globals, SHOW_DEBUG,  observer, render_hoard, map, common, dedalo_logged, data_manager,  biblio_row_fields,  page, console,  DocumentFragment  */
/*eslint no-undef: "error"*/
"use strict";



var hoard =  {


	/**
	* VARS
	*/
		section_id				: null,
		export_data_container	: null,
		row_detail_container	: null,
		search_options			: {},
		map						: null,


	/**
	* SET_UP
	* When the HTML page is loaded
	*/
	set_up : function(options) {

		const self = this

		// options
			self.export_data_container	= options.export_data_container
			self.row_detail_container	= options.row_detail_container
			self.section_id				= options.section_id

		// export_data_buttons added once
			// const export_data_buttons = page.render_export_data_buttons()
			// self.export_data_container.appendChild(export_data_buttons)
			// self.export_data_container.classList.add('hide')

		// suggestions_form_button
			// const contact_form_button = page.create_suggestions_button()
			// self.export_data_container.appendChild(contact_form_button)

		if (self.section_id) {

			// search by section_id
				self.get_row_data({
					section_id : options.section_id
				})
				.then(function(ar_rows){
					console.log("[set_up->get_row_data] ar_rows:",ar_rows);

					if (ar_rows && ar_rows.length>0) {

						// self row fix
							self.row = ar_rows[0]

						// row render
							const hoard_node = render_hoard.draw_hoard({
								row : self.row
							})
							const container = self.row_detail_container
							// container. clean container div
								while (container.hasChildNodes()) {
									container.removeChild(container.lastChild);
								}
							container.appendChild(hoard_node)

						// map draw. Init default map
							render_hoard.draw_map({
								map_data	: self.row.map,
								container	: document.getElementById("map_container"),
								self		: self
							})

						// types
							const rows_container = document.getElementById('rows_container')
							self.get_types_data(self.row, rows_container)

					}else{
						self.row_detail.innerHTML = 'Sorry. Empty result for section_id: ' + self.section_id
					}
				})
		}else{
			self.row_detail.innerHTML = 'Error. Invalid section_id'
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
	* @return promise
	*/
	get_row_data : async function(options) {

		// options
			const section_id = options.section_id

		// short vars
			const ar_fields		= ['*']
			const sql_filter	= 'section_id=' + parseInt(section_id);

		// request
			return data_manager.request({
				body : {
					dedalo_get		: 'records',
					db_name			: page_globals.WEB_DB,
					lang			: page_globals.WEB_CURRENT_LANG_CODE,
					table			: 'hoards',
					ar_fields		: ar_fields,
					sql_filter		: sql_filter,
					limit			: 1,
					count			: false,
					offset			: 0,
					resolve_portals_custom	: {
						coins_data			: 'coins',
						bibliography_data	: 'bibliographic_references'
					}
				}
			})
			.then(function(api_response){

				if (!api_response.result) {
					console.warn("Empty result:", api_response);
					return null
				}

				const ar_rows = page.parse_hoard_data(api_response.result)

				return ar_rows
			})
	},//end get_row_data



	/**
	* MAP_DATA
	* Parses map point to generate standard map item marker_icon and info
	* @return array data
	*/
	map_data : function(data) {

		const self = this

		const ar_data = Array.isArray(data)
			? data
			: [data]

		const data_clean = []
		for (let i = 0; i < ar_data.length; i++) {

			const item = {
				lat			: ar_data[i].lat,
				lon			: ar_data[i].lon,
				marker_icon	: page.maps_config.markers.hoard,
				data		: {
					section_id	: null,
					title		: self.row.name, // provisional
					description	: ' '
				}
			}
			data_clean.push(item)
		}

		return data_clean
	},//end map_data



	/**
	* GET_TYPES_DATA
	* @return
	*/
	get_types_data : function(row, rows_container) {
		// console.log("row:",row);

		// term_id
			const term_id = (row.table==='hoards')
				? 'numisdata5_'   + row.section_id // hoards
				: 'numisdata279_' + row.section_id // findspots

		// spinner
			const spinner = common.create_dom_element({
				element_type	: "div",
				class_name		: "spinner",
				parent			: rows_container
			})

		const selected_element = {
			term_id				: term_id //"numisdata5_94",
			// coins_total		: 5,
			// description		: "Monedas: 5",
			// name				: "Idanha-a-Velha",
			// ref_section_id	: 94,
			// ref_section_tipo	: "numisdata5",
			// section_id		: "numisdata5_94",
			// table			: "hoards",
			// title			: "<span class=\"note\">Tesoro</span> Idanha-a-Velha",
			// types_total		: 11
		}
		// console.log("selected_element:",selected_element);

		const global_data_item = {
			coins_list : row.coins, // ['92797', '92842', '92850', '92893', '138826'],
			types_list : row.types // ['1963', '4682', '15868', '1966', '4685', '15872', '1967', '4686', '15873', '2083', '4802']
		}

		map.load_map_selection_info(selected_element, global_data_item)
		.then(function(response) {
			// console.log("--> load_map_selection_info response:",response);
			if (response) {

				// set node only when it is in DOM (to save browser resources)
				// const observer = new IntersectionObserver(function(entries) {
				// 	const entry = entries[1] || entries[0]
				// 	if (entry.isIntersecting===true || entry.intersectionRatio > 0) {
				// 		observer.disconnect();

						// render data
						const types_list_node = map.render_types_list({
							global_data_item	: response.global_data_item,
							types_rows			: response.types_rows,
							coins_rows			: response.coins_rows,
							info				: response.info
						})
						rows_container.appendChild(types_list_node)

						spinner.remove()
				// 	}
				// }, { threshold: [0] });
				// observer.observe(rows_container);

				// activate images lightbox
					// setTimeout(function(){
					// 	const images_gallery_containers = rows_container
					// 	page.activate_images_gallery(images_gallery_containers, true)
					// },600)
			}else{
				spinner.remove()
			}
		})



		return true
	},//end get_types_data



	/**
	* DRAW_ROW
	* @return promise
	*/
		// draw_row : function(options) {

		// 	const self = this

		// 	// options
		// 		const row_object	= options.ar_rows[0]
		// 		const container 	= options.target

		// 	// check row_object
		// 	if (!row_object) {
		// 		console.warn("Warning! draw_row row_object no found in options");
		// 		return null;
		// 	}

		// 	// fix row_object
		// 		self.row_object = row_object

		// 	// debug
		// 		if(SHOW_DEBUG===true) {
		// 			// console.log("coin row_object:",row_object);
		// 		}

		// 	// container. clean container div
		// 		while (container.hasChildNodes()) {
		// 			container.removeChild(container.lastChild);
		// 		}

		// 	const fragment = new DocumentFragment();

		// 	// // draw row wrapper
		// 	// 	const hoard_row_wrapper = hoard_row.draw_hoard(row_object)
		// 	// 	fragment.appendChild(hoard_row_wrapper)

		// 	// // container final fragment add
		// 	// 	container.appendChild(fragment)

		// 	// line
		// 		const line = common.create_dom_element({
		// 			element_type 	: "div",
		// 			class_name 		: "",
		// 			parent 			: fragment
		// 		})

		// 	// section_id
		// 		if (dedalo_logged===true) {
		// 			const link = common.create_dom_element({
		// 				element_type	: "a",
		// 				class_name		: "section_id go_to_dedalo",
		// 				text_content	: row_object.section_id,
		// 				href			: '/dedalo/lib/dedalo/main/?t=numisdata6&id=' + row_object.section_id,
		// 				parent			: line
		// 			})
		// 			link.setAttribute('target', '_blank');
		// 		}

		// 	// name & place
		// 		if (row_object.name && row_object.name.length>0) {

		// 			// line
		// 				const lineTittleWrap = common.create_dom_element({
		// 					element_type	: "div",
		// 					class_name		: "line-tittle-wrap",
		// 					parent			: line
		// 				})

		// 			// name
		// 				common.create_dom_element({
		// 					element_type	: "div",
		// 					class_name		: "line-tittle golden-color",
		// 					text_content	: row_object.name,
		// 					parent			: lineTittleWrap
		// 				})

		// 			// place
		// 				if (row_object.place && row_object.place.length>0) {

		// 					const place = "| "+row_object.place;
		// 					common.create_dom_element({
		// 						element_type	: "div",
		// 						class_name		: "info_value",
		// 						text_content	: place,
		// 						parent			: lineTittleWrap
		// 					})
		// 				}
		// 		}//end if (row_object.name && row_object.name.length>0)

		// 	// total_coins
		// 		if (row_object.coins && row_object.coins.length>0) {
		// 			const n_coins = row_object.coins.length
		// 			common.create_dom_element ({
		// 				element_type	: 'div',
		// 				class_name		: 'info_text_block',
		// 				inner_html		: (tstring.total_coins || 'Total coins') + ': ' + n_coins,
		// 				parent			: fragment
		// 			})
		// 		}

		// 	// public_info
		// 		if (row_object.public_info) {
		// 			common.create_dom_element ({
		// 				element_type	: 'div',
		// 				class_name		: 'info_text_block',
		// 				inner_html		: row_object.public_info,
		// 				parent			: fragment
		// 			})
		// 		}

		// 	// bibliography_data
		// 		if (row_object.bibliography_data && row_object.bibliography_data.length>0) {
		// 			//create the graphical red line that divide blocks
		// 			const lineSeparator = common.create_dom_element({
		// 				element_type	: "div",
		// 				class_name		: "info_line separator",
		// 				parent			: fragment
		// 			})
		// 			//create the tittle block inside a red background
		// 			common.create_dom_element({
		// 				element_type	: "label",
		// 				class_name		: "big_label",
		// 				text_content	: tstring.bibliographic_references || "Bibliographic references",
		// 				parent			: lineSeparator
		// 			})

		// 			const bibliography_block = common.create_dom_element({
		// 				element_type	: "div",
		// 				class_name		: "info_text_block",
		// 				parent			: fragment
		// 			})

		// 			const ref_biblio		= row_object.bibliography_data
		// 			const ref_biblio_length	= ref_biblio.length
		// 			for (let i = 0; i < ref_biblio_length; i++) {

		// 				// build full ref biblio node
		// 				const biblio_row_node = biblio_row_fields.render_row_bibliography(ref_biblio[i])

		// 				const biblio_row_wrapper = common.create_dom_element({
		// 					element_type	: "div",
		// 					class_name		: "bibliographic_reference",
		// 					parent			: bibliography_block
		// 				})
		// 				biblio_row_wrapper.appendChild(biblio_row_node)
		// 			}

		// 			createExpandableBlock(bibliography_block, fragment);
		// 		}

		// 		// Create an expandable block when text length is over 500
		// 		function createExpandableBlock(textBlock, nodeParent) {

		// 			textBlock.classList.add("contracted-block");

		// 			const textBlockSeparator = common.create_dom_element({
		// 				element_type	: "div",
		// 				class_name		: "text-block-separator",
		// 				parent 			: nodeParent
		// 			})

		// 			const separatorArrow = common.create_dom_element({
		// 				element_type	: "div",
		// 				class_name		: "separator-arrow",
		// 				parent 			: textBlockSeparator
		// 			})

		// 			textBlockSeparator.addEventListener("click",function(){
		// 				if (textBlock.classList.contains("contracted-block")){
		// 					textBlock.classList.remove ("contracted-block");
		// 					separatorArrow.style.transform = "rotate(-90deg)";
		// 				} else {
		// 					textBlock.classList.add("contracted-block");
		// 					separatorArrow.style.transform = "rotate(90deg)";
		// 				}
		// 			})
		// 		}//end createExpandableBlock

		// 	// link
		// 		if (row_object.link) {
		// 			common.create_dom_element ({
		// 				element_type	: 'a',
		// 				class_name		: 'icon_link info_value',
		// 				inner_html		: row_object.link,
		// 				href			: row_object.link,
		// 				target			: '_blank',
		// 				parent			: fragment
		// 			})
		// 		}
		// 		console.log("row_object:",row_object);



		// 	// container final add
		// 		container.appendChild(fragment)


		// 	return fragment
		// },//end draw_row



	/**
	* DRAW_MAP
	*/
		// draw_map : function(options) {

		// 	const self = this

		// 	// options
		// 		const map_data = options.map_data

		// 	const map_position	= map_data
		// 	const container		= document.getElementById("map_container")

		// 	self.map = self.map || new map_factory() // creates / get existing instance of map
		// 	self.map.init({
		// 		map_container	: container,
		// 		map_position	: map_position,
		// 		popup_builder	: page.map_popup_builder,
		// 		popup_options	: page.maps_config.popup_options,
		// 		source_maps		: page.maps_config.source_maps
		// 	})
		// 	// draw points
		// 	const map_data_clean = self.map_data(map_data) // prepares data to used in map
		// 	self.map.parse_data_to_map(map_data_clean, null)
		// 	.then(function(){
		// 		container.classList.remove("hide_opacity")
		// 	})


		// 	return true
		// },//end draw_map



}//end type
