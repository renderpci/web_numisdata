"use strict";



var row_fields = {



	ar_rows : [],



	draw_item : function(item) {

		const self 		 = this
		const term_table = item.term_table
		const fragment	 = new DocumentFragment()


		switch(term_table){

			case "types":
				if (item.children) {
					
					// term
						self.node_factory(item, "term", fragment, "h2", null)
					
					self.node_factory(item, "ref_type_material", fragment, null, null)
					self.node_factory(item, "ref_type_denomination", fragment, null, null)

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

					// term
						self.node_factory(item, "term", fragment, "h2", null)

					// conditionals
						const my_parent 	 = item.parent ? JSON.parse(item.parent)[0] : null
						const parent_element = self.ar_rows.find(el => el.section_id===my_parent)
						if (parent_element && parent_element.term_table!=="types") {							
							self.node_factory(item, "ref_type_material", fragment, null, null)
							self.node_factory(item, "ref_type_denomination", fragment, null, null)
						}

					// weight and diameter sizes info
						self.node_factory(item, "ref_type_averages_weight", fragment, null, null)
						self.node_factory(item, "ref_type_total_weight_items", fragment, null, null)
						self.node_factory(item, "ref_type_averages_diameter", fragment, null, null)
						self.node_factory(item, "ref_type_total_diameter_items", fragment, null, null)

					
					// obverse					
						self.node_factory(item, "ref_type_design_obverse", fragment, null, null)
						self.node_factory(item, "ref_type_symbol_obverse", fragment, null, null)
						if (!IS_PRODUCTION) {
							item.ref_type_legend_obverse = page.remote_image(item.ref_type_legend_obverse)
						}				
						self.node_factory(item, "ref_type_legend_obverse", fragment, null, null)
					
					// reverse					
						self.node_factory(item, "ref_type_design_reverse", fragment, null, null)
						self.node_factory(item, "ref_type_symbol_reverse", fragment, null, null)
						if (!IS_PRODUCTION) {
							item.ref_type_legend_reverse = page.remote_image(item.ref_type_legend_reverse)
						}						
						self.node_factory(item, "ref_type_legend_reverse", fragment, null, null)
					
					self.node_factory(item, "ref_type_equivalents", fragment, null, null)
					
					// images
						const url_ref_coins_image_obverse = page.remote_image(item.ref_coins_image_obverse)
						common.create_dom_element({
							  element_type 	: "image",
							  class_name 	: "image_obverse",
							  url 			: url_ref_coins_image_obverse,
							  parent 		: fragment
						})
						const url_ref_coins_image_reverse = page.remote_image(item.ref_coins_image_reverse)
						common.create_dom_element({
							  element_type 	: "image",
							  class_name 	: "image_reverse",
							  url 			: url_ref_coins_image_reverse,
							  parent 		: fragment
						})

					self.node_factory(item, "ref_coins_collection", fragment, null, null)
					self.node_factory(item, "ref_coins_auction", fragment, null, null)					
				}				
				break;		

			default:
				common.create_dom_element({
					  element_type 	: "div",
					  class_name 	: "term " + term_table,
					  text_content 	: item.term + " [" + term_table + "]",
					  parent 		: fragment
				})
				break;
		}//end switch

		const node = common.create_dom_element({
			element_type 	: "div",
			class_name 		: "node "+term_table,
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
			const current_value 	= item[name]

			const node = common.create_dom_element({
				  element_type 	: current_node_type,
				  class_name 	: current_class_name,
				  inner_html 	: current_value,
				  parent 		: parent
			})

			return true
		}		

		return false
	}//end node_factory



}//end row_fields
