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
		table					: null,


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
			self.table					= options.table

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

		const self = this

		// options
			const section_id = options.section_id

		// short vars
			const ar_fields		= ['*']
			const sql_filter	= 'section_id=' + parseInt(section_id);
			const table = self.table==='findspots'
				? 'findspots'
				: 'hoards'

		// request
			return data_manager.request({
				body : {
					dedalo_get		: 'records',
					db_name			: page_globals.WEB_DB,
					lang			: page_globals.WEB_CURRENT_LANG_CODE,
					table			: table, // hoard | findspot
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

			spinner.remove()

			if (response) {

				// set node only when it is in DOM (to save browser resources)
				// const observer = new IntersectionObserver(function(entries) {
				// 	const entry = entries[1] || entries[0]
				// 	if (entry.isIntersecting===true || entry.intersectionRatio > 0) {
				// 		observer.disconnect();

					// render data
						const types_list_node = render_hoard.draw_types_list_node({
							response : response
						})
						rows_container.appendChild(types_list_node)

				// 	}
				// }, { threshold: [0] });
				// observer.observe(rows_container);

				// activate images lightbox
					setTimeout(function(){
						const images_gallery_containers = rows_container
						page.activate_images_gallery(images_gallery_containers, true)
					},600)
			}
		})



		return true
	},//end get_types_data



}//end hoard
