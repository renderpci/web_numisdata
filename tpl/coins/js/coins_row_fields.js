/*global tstring, page_globals, SHOW_DEBUG, item, common, page, forms, document, DocumentFragment, tstring, console, tree_factory, map_factory */
/*eslint no-undef: "error"*/
/*jshint esversion: 6 */
"use strict";



var coins_row_fields = {



	ar_rows : [],
	caller  : null,



	draw_item : function(row) {

		const self = this
		
		const fragment = new DocumentFragment()
		
		// wrapper
			const wrapper = common.create_dom_element({
				element_type	: "div",
				class_name		: "wrapper",
				parent			: fragment
			})

		// image_obverse
			const image_obverse = common.create_dom_element({
				element_type	: "img",
				class_name		: "image",
				src				: row.image_obverse_thumb,
				loading			: 'lazy',
				parent			: wrapper
			})
			image_obverse.hires = row.image_obverse
			image_obverse.addEventListener("load", page.load_hires)			
		
		// image_reverse
			const image_reverse = common.create_dom_element({
				element_type	: "img",
				class_name		: "image",
				src				: row.image_reverse_thumb,
				loading			: 'lazy',
				parent			: wrapper
			})
			image_reverse.hires = row.image_reverse
			image_reverse.addEventListener("load", page.load_hires)


		return fragment
	}//end draw_item

		


}//end coins_row_fields
