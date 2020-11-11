/*global tstring, page_globals, SHOW_DEBUG, item, common, page, forms, document, DocumentFragment, tstring, console, tree_factory, map_factory */
/*eslint no-undef: "error"*/
/*jshint esversion: 6 */
"use strict";


var hoard_row= {


	caller  : null,



	draw_hoard : function(row) {
		if(SHOW_DEBUG===true) {
			// console.log("-- draw_hoard row:",row)
		}

		const self = this

		const fragment = new DocumentFragment();
		if (!row) {
			return fragment
		}

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
					text_content 	: row.section_id,
					href 			: '/dedalo/lib/dedalo/main/?t=numisdata5&id=' + row.section_id,
					parent 			: line
				})
				link.setAttribute('target', '_blank');
			}

		// name
			if (row.name && row.name.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.name || "Name",
					parent 			: line
				})

				const name = row.name
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: name,
					parent 			: line
				})
			}

		// place
			if (row.place && row.place.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.place || "Place",
					parent 			: line
				})

				const place = row.place
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: place,
					parent 			: line
				})
			}

		// public_info
			if (row.public_info && row.public_info.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.public_info || "Public info",
					parent 			: line
				})

				const public_info = row.public_info
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: public_info,
					parent 			: line
				})
			}

		// link
			if (row.link && row.link.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.link || "Link",
					parent 			: line
				})

				const link = row.link
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value",
					text_content 	: link,
					parent 			: line
				})
			}

		// bibliography
			if (row.bibliography && row.bibliography.length>0) {

				common.create_dom_element({
					element_type 	: "label",
					class_name 		: "",
					text_content 	: tstring.bibliography || "Bibliography",
					parent 			: line
				})

				const bibliography = common.clean_gaps(row.bibliography) // , splitter=" | ", joinner=", "				
				common.create_dom_element({
					element_type	: "span",
					class_name		: "info_value",
					inner_html		: bibliography,
					parent			: line
				})
			}



		// row_wrapper
			const row_wrapper = common.create_dom_element({
				element_type	: "div",
				class_name		: "row_wrapper"
			})
			row_wrapper.appendChild(fragment)


		return row_wrapper
	},//end draw_hoard



}//end hoard_row