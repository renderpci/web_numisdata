"use strict";



var mint =  {



	/**
	* SET_UP
	*/
	set_up : function(options) {

		const self = this

		if (typeof options.section_id!=="undefined") {
			
			mint.render_mint(options.section_id)			
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
	* RENDER_MINT
	*/
	render_mint : function(section_id) {

		const self = this

		// search by section_id			
			const search = self.get_row_data({
				section_id : section_id
			})
			
		// draw
			search.then(function(response){
					console.log("response:",response);
				
				// mint draw
					const mint = response.result.find( el => el.id==='mint')					
					self.draw_row({
						target  : document.getElementById('row_detail'),
						ar_rows : mint.result
					})

				// map draw. Init default map
					self.init_map({
						map_data : JSON.parse(mint.result[0].map)
					})	

				// types draw
					const types = response.result.find( el => el.id==='types')
					self.draw_types({
						target  : document.getElementById('types'),
						ar_rows : types.result
					})
				
			})

		return true
	},//end render_mint



	/**
	* GET_ROW_DATA
	* 
	*/
	get_row_data : function(options) {

		const self = this

		const section_id = options.section_id

		const trigger_url  = mints.trigger_url
		const trigger_vars = {
			mode 	 	: "get_row_data",
			section_id 	: section_id
		}
	
		// Http request directly in javascript to the API is possible too..
		const js_promise = common.get_json_data(trigger_url, trigger_vars).then(function(response){
				if(SHOW_DEBUG===true) {
					console.log("[mints.get_row_data] get_json_data response:", response);
				}

				if (!response) {
					// Error on load data from trigger
					console.warn("[mints.get_row_data] Error. Received response data is null");
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
					element_type 	: "div",
					class_name 		: "info_value",
					text_content 	: place,
					parent 			: line
				})
			}

		// history
			if (row_object.history && row_object.history.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.history || "History",
					parent 			: line
				})

				const history = row_object.history
				common.create_dom_element({
					element_type	: "div",
					class_name		: "info_value",
					inner_html		: history,
					parent			: line
				})
			}

		// numismatic_comments
			if (row_object.numismatic_comments && row_object.numismatic_comments.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.numismatic_comments || "Numismatic comments",
					parent 			: line
				})

				const numismatic_comments = row_object.numismatic_comments
				common.create_dom_element({
					element_type 	: "div",
					class_name 		: "info_value",
					text_content 	: numismatic_comments,
					parent 			: line
				})
			}

		// bibliography_data
			if (row_object.bibliography_data && row_object.bibliography_data.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.bibliographic_references || "Bibliographic references",
					parent 			: line
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
								element_type 	: "label",
								class_name 		: "",
								text_content 	: tstring.description || "Description",
								parent 			: line
							})
							
							common.create_dom_element({
								element_type 	: "div",
								class_name 		: "info_value",
								inner_html 		: description,
								parent 			: line
							})
						}

					// info
						const items = common.clean_gaps(bibliographic_reference.items, " | ", ", ")
						if (items.length>0) {
							common.create_dom_element({
								element_type 	: "label",
								class_name 		: "",
								text_content 	: tstring.info || "Info",
								parent 			: line
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
								class_name 		: "",
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
				}				
			}


		// container final add
		container.appendChild(fragment)


		return container
	},//end draw_row



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
				class_name 		: "",
				text_content 	: tstring.types || "Types",
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
						element_type 	: "a",
						class_name 		: "section_id go_to_dedalo",
						text_content 	: row_object.section_id,
						href 			: '/dedalo/lib/dedalo/main/?t=numisdata3&id=' + row_object.section_id,
						parent 			: row_line
					})
					link.setAttribute('target', '_blank');
				}
			

			// name
				const name = common.create_dom_element({
					element_type 	: "span",
					class_name 		: "",
					text_content 	: row_object.catalogue + " " +row_object.number,
					parent 			: row_line
				})

			// material
				const material = common.clean_gaps(row_object.material, " | ", ", ")
				if (material.length>0) {
					const material_info = common.create_dom_element({
						element_type 	: "span",
						class_name 		: "",
						text_content 	: " ("+material+")",
						parent 			: row_line
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
	* INIT_MAP
	*/
	init_map : function(options) {

		const self = this

		// init page common map
			page.init_map({
				map_data : options.map_data,
				div_container_id : "map_container"
			})
		

		return true
	},//end init_map
	


	
}//end mints
