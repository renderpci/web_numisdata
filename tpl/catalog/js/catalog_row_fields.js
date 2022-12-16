/*global tstring, page_globals, common, page, DocumentFragment, tstring */
/*eslint no-undef: "error"*/
/*jshint esversion: 6 */
"use strict";



var catalog_row_fields = {



	ar_rows : [],
	caller  : null,



	draw_item : function(item) {

		const self 		 = this
		const term_table = item.term_table
		const fragment	 = new DocumentFragment()

		// load_hires. When thumb is loaded, this event is triggered
		function load_hires() {

			this.removeEventListener("load", load_hires, false)

			const image = this
			const hires = this.hires
			setTimeout(function(){
				image.src = hires
			}, 1600)
		}


		switch(term_table){

			case "types":
				if (item.children && item.children.length >0) {

					// term_line
						const term_line = common.create_dom_element({
							element_type	: "div",
							class_name		: "term_line",
							parent			: fragment
						})

					// type info
						self.node_factory(item, "term", term_line, "span", null)
						self.node_factory(item, "ref_type_material", term_line, null, null)
						self.node_factory(item, "ref_type_denomination", term_line, null, null)

					// weight and diameter sizes info
						self.node_factory(item, "ref_type_averages_weight", term_line, null, null)
						self.node_factory(item, "ref_type_total_weight_items", term_line, null, null)
						self.node_factory(item, "ref_type_averages_diameter", term_line, null, null)
						self.node_factory(item, "ref_type_total_diameter_items", term_line, null, null)

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
						element_type	: "div",
						class_name		: "type_container",
						parent			: fragment
					})

					const type_info = common.create_dom_element({
						element_type	: "div",
						class_name		: "type_info",
						parent			: type_container
					})


					// term
						self.node_factory(item, "term", type_info, "span", null)

					// conditionals
						const my_parent			= item.parent ? item.parent[0] : null
						const add_denomination	= item.add_denomination ? item.add_denomination : null
						const parent_element	= self.ar_rows.find(el => el.section_id==my_parent)
						if (add_denomination || (parent_element && parent_element.term_table!=="types")) {
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

						const legend_obverse = common.create_dom_element({
							  element_type 	: "div",
							  class_name 	: "legend_obverse",
							  parent 		: descriptions
						})
						// self.node_factory(item, "ref_type_legend_obverse", legend_obverse, null, null)
						if (item.ref_type_legend_obverse) {
							legend_obverse.appendChild(
								page.render_legend({
									value : item.ref_type_legend_obverse,
									style : 'small legend_obverse_box'
								})
							)
						}
						self.node_factory(item, "ref_type_legend_transcription_obverse", legend_obverse, null, null)

					// reverse
						self.node_factory(item, "ref_type_design_reverse", descriptions, null, null)
						self.node_factory(item, "ref_type_symbol_reverse", descriptions, null, null)

						const legend_reverse = common.create_dom_element({
							  element_type 	: "div",
							  class_name 	: "legend_reverse",
							  parent 		: descriptions
						})

						// self.node_factory(item, "ref_type_legend_reverse", legend_reverse, null, null)
						if (item.ref_type_legend_reverse) {
							legend_reverse.appendChild(
								page.render_legend({
									value : item.ref_type_legend_reverse,
									style : 'small legend_obverse_box'
								})
							)
						}
						self.node_factory(item, "ref_type_legend_transcription_reverse", legend_reverse, null, null)

					self.node_factory(item, "ref_type_equivalents", type_container, null, null)

					// images

						const mint_number = (item.ref_mint_number)
						? item.ref_mint_number+'/'
						: ''

						const ar		= item.term.split(", ")
						const c_name	= ar[0]

						// convert the diameter to float.
						const diameter = item.ref_type_averages_diameter
							? Math.round(item.ref_type_averages_diameter,0)
							: 15

						const coins_images_container = common.create_dom_element({
							element_type	: "div",
							class_name		: "coins_images_container",
							parent			: type_container
						})

						const coins_images = common.create_dom_element({
							element_type	: "div",
							class_name		: "coins_images",
							parent			: coins_images_container
						})
						coins_images.style.width = (diameter * 4 ) + 'mm'

						// img_obverse
							const image_link_obverse = common.create_dom_element({
								element_type	: "a",
								class_name		: "image_link",
								href			: item.ref_coins_image_obverse,
								parent			: coins_images
							})
							const img_obverse = common.create_dom_element({
								element_type	: "img",
								class_name		: "image_obverse",
								src				: item.ref_coins_image_obverse_thumb,
								title			: item.section_id,
								dataset			: {caption: page_globals.OWN_CATALOG_ACRONYM + " " + mint_number + c_name  },
								parent			: image_link_obverse
							})
							img_obverse.style.width = (diameter * 2 ) + 'mm'
							img_obverse.hires = item.ref_coins_image_obverse
							img_obverse.loading="lazy"
							img_obverse.addEventListener("load", load_hires, false)

						// img_reverse
							const image_link_reverse = common.create_dom_element({
								element_type	: "a",
								class_name		: "image_link",
								href			: item.ref_coins_image_reverse,
								parent			: coins_images
							})
							const img_reverse = common.create_dom_element({
								element_type	: "img",
								class_name		: "image_reverse",
								src				: item.ref_coins_image_reverse_thumb,
								title			: item.section_id,
								//dataset		: {caption: type_number},
								parent			: image_link_reverse
							})
							img_reverse.style.width = (diameter * 2 ) + 'mm'
							img_reverse.hires = item.ref_coins_image_reverse
							img_reverse.loading="lazy"
							img_reverse.addEventListener("load", load_hires, false)

						if (window.matchMedia) {
							window.matchMedia('print').addListener(function(mql) {
								 if (mql.matches) {
									coins_images.style.width	= (diameter * 2 ) + 'mm'
									img_obverse.style.width		= (diameter * 1 ) + 'mm'
									img_reverse.style.width		= (diameter * 1 ) + 'mm'
								}
								if (!mql.matches) {
									coins_images.style.width 	= (diameter * 4 ) + 'mm'
									img_obverse.style.width 	= (diameter * 2 ) + 'mm'
									img_reverse.style.width 	= (diameter * 2 ) + 'mm'
								}
							})
						}

					const collection_auction = common.create_dom_element({
						element_type	: "div",
						class_name		: "collection_auction",
						parent			: type_container
					})
					self.node_factory(item, "ref_coins_collection", collection_auction, null, null)
					self.node_factory(item, "ref_coins_auction", collection_auction, null, null)
				}
				break;


			case "mints":
				common.create_dom_element({
					element_type	: "div",
					class_name		: "mint",
					text_content	: item.term, // + " [" + term_table + "]",
					parent			: fragment
				})

				if (item.term_section_id) {
					const link = common.create_dom_element({
						element_type	: "a",
						class_name		: "link link_mint",
						href			: page_globals.__WEB_ROOT_WEB__ + '/mint/' + item.term_section_id,
						target			: '_blank',
						parent			: fragment
					})
				}
				break;

			default:
				common.create_dom_element({
					element_type	: "div",
					class_name		: term_table+'_value',
					text_content	: item.term, // + " [" + term_table + "]",
					parent			: fragment
				})
				break;
		}//end switch

		const node = common.create_dom_element({
			element_type	: "div",
			class_name		: "row_node "+term_table
		})
		node.appendChild(fragment)


		return node
	},//end draw_item



	/**
	* NODE_FACTORY
	* @return bool
	*/
	node_factory : function(item, name, parent, nodetype, class_name) {
	// item, "term", type_info, "span", null

		if (item[name]) { //  && item[name].length>0

			const current_node_type = nodetype || "span"
			const current_class_name= class_name || name

			let current_value
			switch(name){

				case "ref_type_total_weight_items":
				case "ref_type_total_diameter_items":
					current_value = '('+item[name]+')'
					break;

				case "ref_type_averages_weight":
					// const weight	= item[name].toFixed(2).replace(/\.?0+$/, "");
					// current_value	= weight.replace('.',',') + ' g'
					current_value = page.render_weight_value(item)
					break;

				case "ref_type_averages_diameter":
					// const diameter	= item[name].toFixed(2).replace(/\.?0+$/, "");
					// current_value	= diameter.replace('.',',') + ' mm'
					current_value = page.render_diameter_value(item)
					break;

				case "ref_type_equivalents":
					current_value = item[name].replace(/ \| /g,' ')
					current_value = current_value.replace(/<br>/g,' | ')
					break;

				case "term":
					// const mint_number = (item.ref_mint_number)
					// 	? item.ref_mint_number+'/'
					// 	: ''
					// if (item.term_section_id && !item.children) {

					// 	const ar		= item[name].split(", ")
					// 	const c_name	= ar[0]
					// 	const keyword	= (typeof ar[1]==="undefined")
					// 		? ''
					// 		: (function(){
					// 			const clean = []
					// 			for (let i = 1; i < ar.length; i++) {
					// 				clean.push(ar[i])
					// 			}
					// 			return '<span class="keyword">, ' + clean.join(", ").trim() + '</span>'
					// 		})()

					// 	const a_term = common.create_dom_element({
					// 		element_type	: "a",
					// 		class_name		: "a_term",
					// 		href			: page_globals.__WEB_ROOT_WEB__ + '/type/' + item.term_section_id,
					// 		target			: "_blank",
					// 		inner_html		: "MIB " + mint_number + c_name + keyword
					// 	})
					// 	current_value = a_term.outerHTML
					// }else{
					// 	current_value = "MIB " + mint_number + item[name]
					// }
					current_value = page.render_type_label(item)
					break;

				default:
					current_value = item[name]
			}


			const node = common.create_dom_element({
				element_type	: current_node_type,
				class_name		: current_class_name,
				inner_html		: current_value,
				parent			: parent
			})
			node.title = item.section_id


			return true
		}

		return false
	}//end node_factory



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



}//end catalog_row_fields
