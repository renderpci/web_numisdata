/*global tstring, page_globals, SHOW_DEBUG, item, common, page, forms, document, DocumentFragment, tstring, console, tree_factory, map_factory */
/*eslint no-undef: "error"*/
/*jshint esversion: 6 */
"use strict";



var hoards_row_fields = {

	ar_rows : [],
	caller  : null,


	draw_item : function(row) {

		const self = this
		
		const fragment = new DocumentFragment()

		// wrapper
			const wrapper = common.create_dom_element({
				element_type	: "div",
				class_name		: "row_wrapper",
				parent			: fragment
			})

			if (row.name !== null && row.name.length>0){

				//title_wrap
				const title_wrap = common.create_dom_element({
					element_type 	: "div",
					class_name		: "title_wrap",
					parent 			: wrapper
				})

				const hoard_uri	= page_globals.__WEB_ROOT_WEB__ + "/type/" + row.section_id
				const hoard_uri_text	= "<a class=\"icon_link\" href=\""+hoard_uri+"\"></a> "

				//name
				common.create_dom_element ({
					element_type	: "a",
					href 			: hoard_uri,
					inner_html  	: row.name + hoard_uri_text,
					class_name		: "name",
					target 			: "_blank",
					parent 			: title_wrap
				})

				const place = row.place 
				? " | " + row.place
				: ""

				//place
				common.create_dom_element ({
					element_type	: "span",
					inner_html  	: place,
					class_name		: "label",
					parent 			: title_wrap
				})

				//info_wrap
				const info_wrap = common.create_dom_element({
					element_type 	: "div",
					class_name		: "info_container",
					parent 			: wrapper
				})

				const map_wrap = common.create_dom_element({
					element_type 	: "div",
					class_name		: "map_wrapper",
					parent 			: info_wrap
				})

				const text_wrap = common.create_dom_element({
					element_type 	: "div",
					class_name		: "info_text_wrap",
					parent 			: info_wrap
				})

				//public_info
				const public_info = row.public_info || ""
				common.create_dom_element ({
					element_type	: "span",
					inner_html  	: public_info,
					class_name		: "",
					parent 			: text_wrap
				})

				//link
				const link = row.link || ""
				common.create_dom_element ({
					element_type	: "a",
					href 		  	: link,
					inner_html 		: link,
					class_name		: "",
					target 			: "_blank",
					parent 			: text_wrap
				})

				




			}

		return fragment
	}//end draw_item

		


}//end coins_row_fields
