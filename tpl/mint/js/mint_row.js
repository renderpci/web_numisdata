"use strict";



var mint_row = {



	draw_type_item : function(row) {

		const self = this
		
		// wrapper
			const wrapper = common.create_dom_element({
				element_type	: "div",
				class_name		: "item_wrapper" // + row.term_table
			})
			wrapper.section_id	= row.section_id
			wrapper.parent		= row.parent ? row.parent[0] : null
			wrapper.container	= null

		switch(row.term_table){

			case 'types':

				if (row.children && row.children.length>0) {
					// case type whith subtypes

					const type_number_value = page.render_type_label(row)

					// term_line
						const term_line = common.create_dom_element({
							element_type	: "div",
							class_name		: "term_line bold type_group",
							// inner_html	: row.term,
							inner_html		: type_number_value,
							parent			: wrapper
						})
					// container
						const current_container_type = common.create_dom_element({
							element_type	: "div",
							class_name		: "container padding_left",
							parent 			: wrapper
						})
						wrapper.container = current_container_type
				
				}else{
					// case final type

					const node = self.create_type_element(row, false)
					if (node) {
						wrapper.classList.add("unit")
						// const parent_container = wrapper.parentNode // .querySelector(":scope > .container")
							// console.log("parent_container:",parent_container);
						wrapper.appendChild(node)
					}
				}
				// const current_item_type = common.create_dom_element({
				// 	element_type	: "div",
				// 	// inner_html  	: row.term,
				// 	class_name		: "type_item " + row.term_table,
				// 	parent 			: wrapper
				// })
			
				break;

			default:
				const current_item_regular = common.create_dom_element({
					element_type	: "div",
					inner_html		: row.term,
					class_name		: "term_line " + row.term_table,
					title			: "term_table: "+ row.term_table+" \nterm_data: "+row.term_data+" \nsection_id: "+row.section_id,
					parent			: wrapper
				})

				if (row.children && row.children.length>0) {
					const current_container = common.create_dom_element({
						element_type	: "div",
						class_name		: "container padding_left",
						parent 			: wrapper
					})
					wrapper.container = current_container
				}
				break;
		}


		return wrapper
	},//end draw_type_item



	create_type_element : function(row, isSubtype){

		// const row_term = (row.term.indexOf(",") == -1)
		// 	? row.term
		// 	: row.term.slice(0,row.term.indexOf(","))

		// 		console.log("row:",row);
		// 		console.log("row_term:",row_term);

		// const mint_number = (row.ref_mint_number)
		// 	? row.ref_mint_number+'/'
		// 	: ''

		// let type_number = ""
		// let subType_number = ""
		// let SubTypeClass = ""
		// let type_href = ""
		// let subType_href = ""

		// const isFirstElement = false /// provisional

		// if (row.term_data != null){
		// 	const type_section_id = row.term_data // .replace(/[\["\]]/g, '')
		// 	type_href = page_globals.__WEB_ROOT_WEB__ + '/type/' + type_section_id
		// 	subType_href = type_href
		// } else {
		// 	isSubtype = true
		// }

		const type_number_value = page.render_type_label(row)

		//Type wrap
		const row_type = common.create_dom_element({
			element_type	: "div",
			class_name		: "type_wrap"
		})

		const number_wrap = common.create_dom_element({
			element_type	: "div",
			class_name		: "type_number",
			inner_html : type_number_value,
			parent 			: row_type
		})

		// common.create_dom_element({
		// 	element_type	: "a",
		// 	class_name		: "type_label",
		// 	inner_html  	: type_number_value,
		// 	href 			: type_href,
		// 	target			: '_blank',
		// 	parent 			: number_wrap
		// })

		// common.create_dom_element({
		// 	element_type	: "a",
		// 	inner_html 	    : subType_number,
		// 	class_name		: "subType_label "+SubTypeClass,
		// 	href 			: subType_href,
		// 	target			: '_blank',
		// 	parent 			: number_wrap
		// })

		// image
			const img_wrap = common.create_dom_element({
				element_type 	: "div",
				class_name 		: "types_img gallery",
				parent 			: row_type
			})

			const img_link_ob = common.create_dom_element({
				element_type	: "a",
				class_name		: "image_link",
				// href			: common.local_to_remote_path(row.ref_coins_image_obverse),
				href			: row.ref_coins_image_obverse,		
				parent			: img_wrap,
			})

			const img_obverse = common.create_dom_element({
				element_type	: "img",
				src				: row.ref_coins_image_obverse_thumb,
				parent			: img_link_ob
			})
			img_obverse.hires	= row.ref_coins_image_obverse
			img_obverse.loading	= "lazy"
			img_obverse.addEventListener("load", page.load_hires, false)

			const img_link_re = common.create_dom_element({
				element_type 	: "a",
				class_name		: "image_link",
				href 			: row.ref_coins_image_reverse,
				parent 			: img_wrap,
			})

			const img_reverse = common.create_dom_element({
				element_type	: "img",
				src 			: row.ref_coins_image_reverse_thumb,
				parent 			: img_link_re
			})
			img_reverse.hires	= row.ref_coins_image_reverse
			img_reverse.loading	= "lazy"
			img_reverse.addEventListener("load", page.load_hires, false)

		const info_wrap = common.create_dom_element({
			element_type 	: "div",
			class_name 		: "info_wrap",
			parent 			: row_type
		})
		
		const type_info = []
		if (row.ref_type_material && row.ref_type_material.length>0) {
			type_info.push(row.ref_type_material)
		}
		if (row.ref_type_denomination && row.ref_type_denomination.length>0) {
			type_info.push(row.ref_type_denomination)
		}
		if (row.ref_type_averages_weight) {
			type_info.push( page.render_weight_value(row) )
		}
		if (row.ref_type_averages_diameter) {
			type_info.push(	page.render_diameter_value(row) )
		}

		common.create_dom_element ({
			element_type 	: "p",
			class_name 		: "type_info",
			text_content 	: type_info.join(' | '),
			parent 			: info_wrap
		})

		// page.activate_images_gallery(img_wrap)

		return row_type
	}//end create_type_element




}//end mint_row