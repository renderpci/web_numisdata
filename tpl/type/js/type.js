/*global get_label, page_globals, SHOW_DEBUG, DEDALO_CORE_URL*/
/*eslint no-undef: "error"*/


"use strict";



var type =  {



	trigger_url 	: page_globals.__WEB_TEMPLATE_WEB__ + "/type/trigger.type.php",
	search_options 	: {},



	/**
	* SET_UP
	* When the HTML page is loaded
	*/
	set_up : function(options) {

		const self = this

		// trigger render type with current options.section_id 
			if (typeof options.section_id!=="undefined") {
				
				// search by section_id			
					const search = self.get_row_data({
						section_id : options.section_id
					})
					
				// draw then
					search.then(function(response){
						
						// row draw
							const type = response.result.find( el => el.id==='type')					
							self.draw_row({
								target  : document.getElementById('row_detail'),
								ar_rows : type.result
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
					console.log("[type.get_row_data] get_json_data response:", response);
				}

				if (!response) {
					// Error on load data from trigger
					console.warn("[type.get_row_data] Error. Received response data is null");
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
				console.log("Type row_object:",row_object);
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


	
}//end type
