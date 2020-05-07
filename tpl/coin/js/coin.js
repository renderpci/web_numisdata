"use strict";



var coin =  {



	trigger_url 	: page_globals.__WEB_TEMPLATE_WEB__ + "/coin/trigger.coin.php",
	search_options 	: {},



	/**
	* SET_UP
	* When the HTML page is loaded
	*/
	set_up : function(options) {

		const self = this

		// trigger render coin with current options.section_id 
			if (typeof options.section_id!=="undefined") {
				
				// search by section_id			
					const search = self.get_row_data({
						section_id : options.section_id
					})
					
				// draw then
					search.then(function(response){
						
						// row draw
							const coin = response.result.find( el => el.id==='coin')					
							self.draw_row({
								target  : document.getElementById('row_detail'),
								ar_rows : coin.result
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
					console.log("[coin.get_row_data] get_json_data response:", response);
				}

				if (!response) {
					// Error on load data from trigger
					console.warn("[coin.get_row_data] Error. Received response data is null");
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
				console.log("coin row_object:",row_object);
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
					href 			: '/dedalo/lib/dedalo/main/?t=numisdata4&id=' + row_object.section_id,
					parent 			: line
				})
				link.setAttribute('target', '_blank');
			}

		// image_obverse
			if (typeof row_object.images_obverse[0]!=="undefined") {

				common.create_dom_element({
					element_type 	: "img",
					class_name 		: "image_obverse",
					src 			: row_object.images_obverse[0].image,
					parent 			: line
				})
			}

		// image_reverse
			if (typeof row_object.images_obverse[0]!=="undefined") {

				common.create_dom_element({
					element_type 	: "img",
					class_name 		: "image_reverse",
					src 			: row_object.images_obverse[0].image,
					parent 			: line
				})
			}

		// section_id
			if (row_object.section_id) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.id || "ID",
					parent 			: line
				})

				const id = row_object.section_id
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: id,
					parent 			: line
				})
			}

		// type
			if (row_object.type) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.type || "Type",
					parent 			: line
				})

				const mint		= typeof row_object.type_data[0]!=="undefined"
					? row_object.type_data[0].mint
					: null
				const number	= (mint) 
					? mint + " " + row_object.type
					: row_object.type
				const value = common.clean_gaps(number, " | ", " | ") // , splitter=" | ", joinner=", "
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: value,
					parent 			: line
				})
			}

		// weight
			if (row_object.weight && row_object.weight.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.weight || "Weight",
					parent 			: line
				})

				const weight = row_object.weight
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: weight,
					parent 			: line
				})
			}

		// diameter
			if (row_object.diameter && row_object.diameter.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.diameter || "Diameter",
					parent 			: line
				})

				const diameter = row_object.diameter
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: diameter,
					parent 			: line
				})
			}

		// dies
			if (row_object.dies && row_object.dies.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.dies || "Dies",
					parent 			: line
				})

				const dies = row_object.dies
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: dies,
					parent 			: line
				})
			}

		// peculiarity_production
			if (row_object.peculiarity_production && row_object.peculiarity_production.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.peculiarity_production || "Peculiarity production",
					parent 			: line
				})

				const peculiarity_production = row_object.peculiarity_production
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: peculiarity_production,
					parent 			: line
				})
			}

		// secondary_treatment
			if (row_object.secondary_treatment && row_object.secondary_treatment.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.secondary_treatment || "Secondary treatment",
					parent 			: line
				})

				const secondary_treatment = row_object.secondary_treatment
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: secondary_treatment,
					parent 			: line
				})
			}

		// countermark_obverse
			if (row_object.countermark_obverse && row_object.countermark_obverse.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.countermark_obverse || "Countermark obverse",
					parent 			: line
				})

				const countermark_obverse = row_object.countermark_obverse
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: countermark_obverse,
					parent 			: line
				})
			}

		// countermark_reverse
			if (row_object.countermark_reverse && row_object.countermark_reverse.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.countermark_reverse || "Countermark reverse",
					parent 			: line
				})

				const countermark_reverse = row_object.countermark_reverse
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: countermark_reverse,
					parent 			: line
				})
			}

		// hoard
			if (row_object.hoard && row_object.hoard.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.hoard || "Hoard",
					parent 			: line
				})

				const hoard = row_object.hoard
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: hoard,
					parent 			: line
				})
			}

		// find_type
			if (row_object.find_type && row_object.find_type.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.find_type || "Find type",
					parent 			: line
				})

				const find_type = row_object.find_type
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: find_type,
					parent 			: line
				})
			}
		
		// findspot
			if (row_object.findspot && row_object.findspot.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.findspot || "Findspot",
					parent 			: line
				})

				const findspot = row_object.findspot
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: findspot,
					parent 			: line
				})
			}

		// find_date
			if (row_object.find_date && row_object.find_date.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.find_date || "Find date",
					parent 			: line
				})

				const find_date = row_object.find_date
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: find_date,
					parent 			: line
				})
			}

		// collection
			if (row_object.collection && row_object.collection.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.collection || "Collection",
					parent 			: line
				})

				const collection = row_object.collection
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: collection,
					parent 			: line
				})
			}

		// former_collection
			if (row_object.former_collection && row_object.former_collection.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.former_collection || "Former collection",
					parent 			: line
				})

				const former_collection = row_object.former_collection
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: former_collection,
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

		// uri
			if (row_object.uri && row_object.uri.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.uri || "URI",
					parent 			: line
				})

				const uri = row_object.uri
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: uri,
					parent 			: line
				})
			}

		// auction
			if (row_object.auction && row_object.auction.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.auction || "Auction",
					parent 			: line
				})

				const auction = row_object.auction
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: auction,
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


	
}//end coin
