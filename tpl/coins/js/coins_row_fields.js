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

			const data_cont = common.create_dom_element({
				element_type 	: "div",
				class_name		: "info_container",
				parent 			: wrapper
			})

			//mint
			if (row.mint_data[0] != null){

				common.create_dom_element({
					element_type	: "a",
					inner_html  	: row.mint_data[0].name,
					class_name		: "ceca_label",
					href 			: "",
					parent 			: data_cont
				})

			}

			//type
			common.create_dom_element({
				element_type	: "a",
				inner_html  	: "MIB "+ row.type,
				class_name		: "type_label",
				href 			: "",
				parent 			: data_cont
			})

			//ID
			
			common.create_dom_element({
				element_type	: "div",
				inner_html  	: "ID: "+row.section_id,
				class_name		: "ceca_label",
				parent 			: data_cont
			})

			// Collection | former | number

			if (row.collection != null && row.collection.length>0){

				var collectionInfo = row.collection

				if (row.former_collection != null && row.former_collection.length>0){
					collectionInfo += " | "+ row.former_collection
				}
				if (row.number != null && row.number.length>0){
					collectionInfo += " | "+ row.number
				}

				common.create_dom_element({
					element_type	: "div",
					inner_html  	: collectionInfo,
					class_name		: "",
					parent 			: data_cont
				})

			}

			if (row.ref_auction != null && row.ref_auction.length>0){

				var auctionInfo = row.ref_auction

				if (row.number != null && row.number.length>0){
					auctionInfo += " | "+ row.number
				}

				common.create_dom_element({
					element_type	: "div",
					inner_html  	: auctionInfo,
					class_name		: "",
					parent 			: data_cont
				})

			}

			const image_container = common.create_dom_element({
				element_type 	: "div",
				class_name		: "info_container",
				parent 			: wrapper
			})

		// image_obverse
			const image_obverse = common.create_dom_element({
				element_type	: "img",
				class_name		: "image",
				src				: row.image_obverse_thumb,
				loading			: 'lazy',
				parent			: image_container
			})
			image_obverse.hires = row.image_obverse
			image_obverse.addEventListener("load", page.load_hires)			
		
		// image_reverse
			const image_reverse = common.create_dom_element({
				element_type	: "img",
				class_name		: "image",
				src				: row.image_reverse_thumb,
				loading			: 'lazy',
				parent			: image_container
			})
			image_reverse.hires = row.image_reverse
			image_reverse.addEventListener("load", page.load_hires)

		return fragment
	}//end draw_item

		


}//end coins_row_fields
