"use strict";



var row_fields = {



	ar_rows : [],
	caller  : null,



	draw_item : function(item) {

		const self 		 = this
		const term_table = item.term_table
		const fragment	 = new DocumentFragment()


		switch(term_table){

			case "types":
				if (item.children) {
					
					// term

					const term_line = common.create_dom_element({
							  element_type 	: "div",
							  class_name 	: "term_line",
							  parent 		: fragment
						})		

						self.node_factory(item, "term", term_line, "span", null)
					
					self.node_factory(item, "ref_type_material", term_line, null, null)
					self.node_factory(item, "ref_type_denomination", term_line, null, null)

				}else{
					// i.e.
						// children: null
						// coins_data: "["63157","94087","54028","94085","94086","94088"]"
						// dd_tm: "1588922593"
						// lang: "lg-spa"
						// norder: "8"
						// parent: "["205"]"
						// parents: "["205","13","2203","1152"]"
						// ref_coins_auction: null
						// ref_coins_auction_data: null
						// ref_coins_collection: null
						// ref_coins_collection_data: null
						// ref_coins_image_obverse: "/dedalo/lib/dedalo/themes/default/0.jpg"
						// ref_coins_image_obverse_data: "["7335"]"
						// ref_coins_image_reverse: "/dedalo/lib/dedalo/themes/default/0.jpg"
						// ref_coins_image_reverse_data: "["7336"]"
						// ref_type_averages_diameter: "null"
						// ref_type_averages_weight: "null"
						// ref_type_denomination: null
						// ref_type_denomination_data: "["49"]"
						// ref_type_design_obverse: null
						// ref_type_design_obverse_data: "["142"]"
						// ref_type_design_reverse: null
						// ref_type_design_reverse_data: "["71"]"
						// ref_type_equivalents: "ACIP | 2021 | Arse-Saguntum | 1/4 de unidad<br>Ripollès & Llorens 2002 | 403-404 | Arse-Saguntum<br>CNH | 311/54 | Arse-Saguntum<br>ACIP | 2021 | Arse-Saguntum | 1/4 de unidad"
						// ref_type_equivalents_data: "["4740","15931","7813"]"
						// ref_type_legend_obverse: null
						// ref_type_legend_obverse_data: null
						// ref_type_legend_reverse: "M Q | M Q |"
						// ref_type_legend_reverse_data: "["278"]"
						// ref_type_material: "Bronce |"
						// ref_type_material_data: "["5"]"
						// ref_type_symbol_obverse: null
						// ref_type_symbol_obverse_data: null
						// ref_type_symbol_reverse: null
						// ref_type_symbol_reverse_data: "["1167","1157"]"
						// ref_type_total_diameter_items: "null"
						// ref_type_total_weight_items: "null"
						// section_id: "171"
						// table: "catalog"
						// term: "79b, "
						// term_data: "["2021"]"
						// term_section_label: "["Tipos"]"
						// term_section_tipo: "["numisdata3"]"
						// term_table: "types"

						const type_container = common.create_dom_element({
							  element_type 	: "div",
							  class_name 	: "type_container",
							  parent 		: fragment
						})	

						const type_info = common.create_dom_element({
							  element_type 	: "div",
							  class_name 	: "type_info",
							  parent 		: type_container
						})	


					// term
						self.node_factory(item, "term", type_info, "span", null)

					// conditionals
						const my_parent 	 = item.parent ? JSON.parse(item.parent)[0] : null
						const parent_element = self.ar_rows.find(el => el.section_id===my_parent)
						if (parent_element && parent_element.term_table!=="types") {							
							self.node_factory(item, "ref_type_material", type_info, null, null)
							self.node_factory(item, "ref_type_denomination", type_info, null, null)
						}

					// weight and diameter sizes info
						self.node_factory(item, "ref_type_averages_weight", type_info, null, null)
						self.node_factory(item, "ref_type_total_weight_items", type_info, null, null)
						self.node_factory(item, "ref_type_averages_diameter", type_info, null, null)
						self.node_factory(item, "ref_type_total_diameter_items", type_info, null, null)

					
					// obverse
						const descriptions = common.create_dom_element({
							  element_type 	: "div",
							  class_name 	: "descriptions",
							  parent 		: type_info
						})	
		
						self.node_factory(item, "ref_type_design_obverse", descriptions, null, null)
						self.node_factory(item, "ref_type_symbol_obverse", descriptions, null, null)
						if (!IS_PRODUCTION) {
							item.ref_type_legend_obverse = page.remote_image(item.ref_type_legend_obverse)
						}
						const legend_obverse = common.create_dom_element({
							  element_type 	: "div",
							  class_name 	: "legend_obverse",
							  parent 		: descriptions
						})			
						self.node_factory(item, "ref_type_legend_obverse", legend_obverse, null, null)
						self.node_factory(item, "ref_type_legend_transcription_obverse", legend_obverse, null, null)
							
					// reverse
								
						self.node_factory(item, "ref_type_design_reverse", descriptions, null, null)
						if (!IS_PRODUCTION) {
							item.ref_type_symbol_reverse = page.remote_image(item.ref_type_legend_reverse)
						}
						self.node_factory(item, "ref_type_symbol_reverse", descriptions, null, null)
						
						const legend_reverse = common.create_dom_element({
							  element_type 	: "div",
							  class_name 	: "legend_reverse",
							  parent 		: descriptions
						})
						if (!IS_PRODUCTION) {
							item.ref_type_legend_reverse = page.remote_image(item.ref_type_legend_reverse)
						}
						self.node_factory(item, "ref_type_legend_reverse", legend_reverse, null, null)
						self.node_factory(item, "ref_type_legend_transcription_reverse", legend_reverse, null, null)
					
					self.node_factory(item, "ref_type_equivalents", type_container, null, null)
					
					// images
						// convert the diameter to float.
						const diameter = item['ref_type_averages_diameter'] !==null
							? parseFloat(item['ref_type_averages_diameter'].replace(',', '.'))
							: 15


						const coins_images_container = common.create_dom_element({
							  element_type 	: "div",
							  class_name 	: "coins_images_container",
							  parent 		: type_container,
						})	

						const coins_images = common.create_dom_element({
							  element_type 	: "div",
							  class_name 	: "coins_images",
							  parent 		: coins_images_container,
						})			
						coins_images.style.width = (diameter * 4 ) + 'mm'
						const url_ref_coins_image_obverse = page.remote_image(item.ref_coins_image_obverse)
						const img_obverse = common.create_dom_element({
							  element_type 	: "img",
							  class_name 	: "image_obverse",
							  src 			: url_ref_coins_image_obverse,
							  parent 		: coins_images
						})
						img_obverse.style.width = (diameter * 2 ) + 'mm'
						const url_ref_coins_image_reverse = page.remote_image(item.ref_coins_image_reverse)
						const img_reverse =common.create_dom_element({
							  element_type 	: "img",
							  class_name 	: "image_reverse",
							  src 			: url_ref_coins_image_reverse,
							  parent 		: coins_images
						})
						img_reverse.style.width = (diameter * 2 ) + 'mm'

						 if (window.matchMedia) {
							window.matchMedia('print').addListener(function(mql) {
								 if (mql.matches) {
									coins_images.style.width 	= (diameter * 2 ) + 'mm'
									img_obverse.style.width 	= (diameter * 1 ) + 'mm'
									img_reverse.style.width 	= (diameter * 1 ) + 'mm'
								}
								 if (!mql.matches) {
								 	coins_images.style.width 	= (diameter * 4 ) + 'mm'
									img_obverse.style.width 	= (diameter * 2 ) + 'mm'
									img_reverse.style.width 	= (diameter * 2 ) + 'mm'
								 }
							})
						}

					const collection_auction = common.create_dom_element({
							  element_type 	: "div",
							  class_name 	: "collection_auction",
							  parent 		: type_container
						})		
					self.node_factory(item, "ref_coins_collection", collection_auction, null, null)
					self.node_factory(item, "ref_coins_auction", collection_auction, null, null)					
				}				
				break;		

			default:
				common.create_dom_element({
					  element_type 	: "div",
					  class_name 	: "term " + term_table,
					  text_content 	: item.term, // + " [" + term_table + "]",
					  parent 		: fragment
				})
				break;
		}//end switch

		const node = common.create_dom_element({
			element_type 	: "div",
			class_name 		: "row_node "+term_table,
		})
		node.appendChild(fragment)


		return node
	},//end draw_item



	/**
	* NODE_FACTORY
	* @return bool
	*/
	node_factory : function(item, name, parent, nodetype, class_name) {

		if (item[name] && item[name].length>0) {

			const current_node_type = nodetype || "span"
			const current_class_name= class_name || name

			let current_value
			switch(name){

				case "ref_type_total_weight_items":
				case "ref_type_total_diameter_items":
					current_value = '('+item[name]+')'

				break;

				case "ref_type_averages_weight":
					current_value = item[name]+'g'

				break;

				case "ref_type_averages_diameter":
					current_value = item[name]+'mm'

				break;


				case "ref_type_equivalents":
					current_value = item[name].replace(/<br>/g,' - ')
				break;


				default:
				current_value = item[name]

			}

			
			
			const node = common.create_dom_element({
				  element_type 	: current_node_type,
				  class_name 	: current_class_name,
				  inner_html 	: current_value,
				  parent 		: parent
			})

			return true
		}		

		return false
	},//end node_factory



	/**
	* FORM_NODE_FACTORY
	*/
		// form_node_factory : function(name, column, table, parent, placeholder, activate_autocomplete) {

		// 	const self = this

		// 	// grouper
		// 		const group = common.create_dom_element({
		// 			element_type	: 'div',
		// 			class_name 		: "form-group field",
		// 			parent 			: parent
		// 		})

		// 	// input
		// 		const input = common.create_dom_element({
		// 			element_type	: 'input',
		// 			type			: 'text',
		// 			id 				: name,
		// 			class_name		: "form-control ui-autocomplete-input",
		// 			placeholder 	: placeholder,
		// 			dataset 		: {
		// 				q_name	: name,
		// 				q_column: column,
		// 				q_table	: table,
		// 				eq		: "LIKE"
		// 			},
		// 			parent			: group
		// 		})

		// 	// autocomplete activate
		// 		if (activate_autocomplete===true) {
		// 			self.caller.activate_autocomplete(input)
		// 		}

		// 	// values container (user selections)
		// 		const values = common.create_dom_element({
		// 			element_type	: 'div',
		// 			id				: name + '_values',
		// 			class_name 		: "container_values",
		// 			parent 			: group
		// 		})


		// 	return input
		// },//end form_node_factory



	/**
	* BUILD_FORM_NODE
	*/
	build_form_node : function(form_item, parent) {

		// grouper
			const group = common.create_dom_element({
				element_type	: 'div',
				class_name 		: "form-group field",
				parent 			: parent
			})

		// input
			const node_input = common.create_dom_element({
				element_type	: 'input',
				type			: 'text',
				id 				: form_item.id,
				class_name		: "form-control ui-autocomplete-input",
				placeholder 	: form_item.label,				
				parent			: group
			})
			node_input.addEventListener("keyup", function(e){				
				form_item.q = e.target.value
			})
			form_item.node_input = node_input

		// values container (user selections)
			const node_values = common.create_dom_element({
				element_type	: 'div',
				// id				: form_item.name + '_values',
				class_name 		: "container_values",
				parent 			: group
			})
			form_item.node_values = node_values


		return true
	}//end build_form_node



}//end row_fields
