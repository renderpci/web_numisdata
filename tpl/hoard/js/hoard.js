"use strict";



var hoard =  {



	trigger_url 	: page_globals.__WEB_TEMPLATE_WEB__ + "/hoard/trigger.hoard.php",
	search_options 	: {},



	/**
	* SET_UP
	* When the HTML page is loaded
	*/
	set_up : function(options) {

		const self = this

		// trigger render hoard with current options.section_id 
			if (typeof options.section_id!=="undefined") {
				
				// search by section_id			
					const search = self.get_row_data({
						section_id : options.section_id
					})
					
				// draw then
					search.then(function(response){
						
						// row draw
							const hoard = response.result.find( el => el.id==='hoard')					
							self.draw_row({
								target  : document.getElementById('row_detail'),
								ar_rows : hoard.result
							})

						// map draw. Init default map
							self.init_map({
								map_data : JSON.parse(hoard.result[0].map)
							})	
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
	* 
	*/
	get_row_data : function(options) {

		const self = this

		const section_id = options.section_id

		// trigger vars
			const trigger_url  = self.trigger_url
			const trigger_vars = {
				mode 	 	: "get_row_data",
				section_id 	: section_id
			}
	
		// Http request directly in javascript to the API is possible too..
		const js_promise = common.get_json_data(trigger_url, trigger_vars).then(function(response){
				if(SHOW_DEBUG===true) {
					console.log("[hoard.get_row_data] get_json_data response:", response);
				}

				if (!response) {
					// Error on load data from trigger
					console.warn("[hoard.get_row_data] Error. Received response data is null");
					return false

				}else{
					// Success
					return response.result
				}
		})

		return js_promise
	},//end get_row_data



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
				console.log("hoard row_object:",row_object);
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
					href 			: '/dedalo/lib/dedalo/main/?t=numisdata5&id=' + row_object.section_id,
					parent 			: line
				})
				link.setAttribute('target', '_blank');
			}

		// name
			if (row_object.name && row_object.name.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.name || "Name",
					parent 			: line
				})

				const name = row_object.name
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: name,
					parent 			: line
				})
			}

		// place
			if (row_object.place && row_object.place.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.place || "Place",
					parent 			: line
				})

				const place = row_object.place
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: place,
					parent 			: line
				})
			}

		// public_info
			if (row_object.public_info && row_object.public_info.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.public_info || "Public info",
					parent 			: line
				})

				const public_info = row_object.public_info
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: public_info,
					parent 			: line
				})
			}

		// link
			if (row_object.link && row_object.link.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.link || "Link",
					parent 			: line
				})

				const link = row_object.link
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: link,
					parent 			: line
				})
			}

		// bibliography
			if (row_object.bibliography && row_object.bibliography.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.bibliography || "Bibliography",
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



	/**
	* INIT_MAP
	*/
	init_map : function(options) {

		const self = this

		// init page common map
			page.init_map({
				map_data			: options.map_data,
				div_container_id	: "map_container"
			})
		

		return true
	},//end init_map


	
}//end type
