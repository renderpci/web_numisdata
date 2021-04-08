/*global tstring, page_globals, SHOW_DEBUG, item, common, page, forms, document, DocumentFragment, tstring, console, tree_factory, map_factory */
/*eslint no-undef: "error"*/
/*jshint esversion: 6 */
"use strict";



var coin_row = {



	caller  : null,



	draw_coin : function(row) {
		if(SHOW_DEBUG===true) {
			console.log("-- draw_coin row:",row)
		}

		const self = this

		const fragment = new DocumentFragment();
		if (!row) {
			return fragment
		}

		// section_id (dedalo users only)
			if (dedalo_logged===true) {

				const link = common.create_dom_element({
					element_type 	: "a",
					class_name 		: "section_id go_to_dedalo",
					text_content 	: row.section_id,
					href 			: '/dedalo/lib/dedalo/main/?t=numisdata4&id=' + row.section_id,
					parent 			: fragment
				})
				link.setAttribute('target', '_blank');
			}

		// identify_images
			const identify_images = common.create_dom_element({
				element_type	: "div",
				class_name		: "identify_images_wrapper gallery",
				parent 			: fragment
			})
			// image_obverse
				if (row.image_obverse && row.image_obverse.length>0) {

					const image_link = common.create_dom_element({
						element_type	: "a",
						class_name		: "image_link",
						href			: row.image_obverse,
						parent			: identify_images
					})

					const image_obverse = common.create_dom_element({
						element_type	: "img",
						class_name		: "image image_obverse",
						src				: row.image_obverse,
						parent			: image_link
					})
				}
			// image_reverse
				if (row.image_reverse && row.image_reverse.length>0) {

					const image_link = common.create_dom_element({
						element_type	: "a",
						class_name		: "image_link",
						href			: row.image_reverse,
						parent			: identify_images
					})

					const image_reverse = common.create_dom_element({
						element_type	: "img",
						class_name		: "image image_reverse",
						src				: row.image_reverse,
						parent			: image_link
					})
				}

		// info_container
			const info_container = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_container",
				parent 			: fragment
			})

		// id_block
			const id_block = common.create_dom_element({
				element_type	: "div",
				class_name		: "group block_wrapper",
				parent			: info_container
			})
			// ID
				if (row.section_id && row.section_id.length>0) {
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels",
						text_content	: "ID ",
						parent			: id_block
					})
					common.create_dom_element({
						element_type	: "span",
						class_name		: "rigth-values",
						inner_html		: row.section_id,
						parent			: id_block
					})
				}
		
		// COLLECTION - FORMER - NUMBER
			const first_block = common.create_dom_element({
				element_type	: "div",
				class_name		: "group block_wrapper",
				parent			: info_container
			})

			let infoLabels = ""
			let infoValues = ""

			if (row.collection && row.collection.length>0) {
				infoLabels = tstring.collection || "Collection"
				infoValues += row.collection 
			}

			if (row.former_collection && row.former_collection.length>0) {
				if (infoLabels != ""){
					infoLabels += " | "
					infoValues += " | "
				}

				infoLabels += tstring.former_collection || "Former collection"
				infoValues += row.former_collection	
			}

			if (row.number && row.number.length>0) {
				if (infoLabels != ""){
					infoLabels += " | "
					infoValues += " | "
				}
				infoLabels += tstring.number || "Number"
				infoValues += row.number
			}

			common.create_dom_element({
				element_type	: "label",
				class_name		: "left-labels",
				text_content	: infoLabels,
				parent			: first_block
			})

			common.create_dom_element({
				element_type	: "span",
				class_name		: "rigth-values",
				inner_html		: infoValues,
				parent			: first_block
			})
			
			// // collection

			// 	if (row.collection && row.collection.length>0) {
			// 		const group = common.create_dom_element({
			// 			element_type	: "div",
			// 			class_name		: "group collection",
			// 			parent			: first_block
			// 		})
			// 		common.create_dom_element({
			// 			element_type	: "label",
			// 			text_content	: tstring.collection || "Collection",
			// 			parent			: group
			// 		})
			// 		common.create_dom_element({
			// 			element_type	: "span",
			// 			class_name		: "value",
			// 			inner_html		: row.collection,
			// 			parent			: group
			// 		})
			// 	}
			// // former_collection
			// 	if (row.former_collection && row.former_collection.length>0) {
			// 		const group = common.create_dom_element({
			// 			element_type	: "div",
			// 			class_name		: "group former_collection",
			// 			parent			: first_block
			// 		})
			// 		common.create_dom_element({
			// 			element_type	: "label",
			// 			text_content	: tstring.former_collection || "Former collection",
			// 			parent			: group
			// 		})
			// 		common.create_dom_element({
			// 			element_type	: "span",
			// 			class_name		: "value",
			// 			inner_html		: row.former_collection,
			// 			parent			: group
			// 		})
			// 	}
			// // number
			// 	if (row.number && row.number.length>0) {
			// 		const group = common.create_dom_element({
			// 			element_type	: "div",
			// 			class_name		: "group number",
			// 			parent			: first_block
			// 		})
			// 		common.create_dom_element({
			// 			element_type	: "label",
			// 			text_content	: tstring.number || "Number",
			// 			parent			: group
			// 		})
			// 		common.create_dom_element({
			// 			element_type	: "span",
			// 			class_name		: "value",
			// 			inner_html		: row.number,
			// 			parent			: group
			// 		})
			// 	}


		//AUCTION
				if (row.ref_auction && row.ref_auction.length>0) {
					let auctionLabels =  tstring.auction || "Auction"
					let auctionValues = row.ref_auction
				

					if (row.ref_auction_number && row.ref_auction_number.length>0) {
						auctionLabels += " | " + tstring.number || "Number"
						auctionValues += " | " + row.ref_auction_number
					}

					const block_wrapper = common.create_dom_element({
						element_type	: "div",
						class_name		: "group block_wrapper",
						parent			: info_container
					})
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels",
						text_content	: auctionLabels,
						parent			: block_wrapper
					})
					common.create_dom_element({
						element_type	: "span",
						class_name		: "rigth-values",
						inner_html		: auctionValues,
						parent			: block_wrapper
					})

				}

			// 	if (row.ref_auction && row.ref_auction.length>0) {
			// 		const block_wrapper = common.create_dom_element({
			// 			element_type	: "div",
			// 			class_name		: "group block_wrapper",
			// 			parent			: info_container
			// 		})
			// 		common.create_dom_element({
			// 			element_type	: "label",
			// 			class_name		: "left-labels",
			// 			text_content	: tstring.auction || "Auction",
			// 			parent			: block_wrapper
			// 		})
			// 		common.create_dom_element({
			// 			element_type	: "span",
			// 			class_name		: "rigth-values",
			// 			inner_html		: row.ref_auction,
			// 			parent			: block_wrapper
			// 		})
			// 	}

			// // ref_auction_number
			// 	if (row.ref_auction_number && row.ref_auction_number.length>0) {
			// 		const block_wrapper = common.create_dom_element({
			// 			element_type	: "div",
			// 			class_name		: "group block_wrapper",
			// 			parent			: info_container
			// 		})
			// 		common.create_dom_element({
			// 			element_type	: "label",
			// 			class_name		: "left-labels",
			// 			text_content	: tstring.auction_number || "Number",
			// 			parent			: block_wrapper
			// 		})
			// 		common.create_dom_element({
			// 			element_type	: "span",
			// 			class_name		: "value",
			// 			class_name		: "rigth-values",
			// 			inner_html		: row.ref_auction_number,
			// 			parent			: block_wrapper
			// 		})
			// 	}

		// MINT + MINT NUMBER + TYPE

			let typeLabels = ""
			let typeValues = ""

			if (row.mint && row.mint.length>0){
				typeLabels = tstring.mint || "Mint"
				typeValues = row.mint
			}

			if (row.mint_number && row.mint_number>0){
				if (typeLabels != ""){
					typeLabels += " | "
					typeValues += " | "
				}
				typeLabels += tstring.number || "Number"
				typeValues += row.mint_number
			}

			if (row.type && row.type.length>0) {
				if (typeLabels != ""){
					typeLabels += " | "
					typeValues += " | "
				}
				typeLabels += tstring.type || "Type"

				// const mint		= typeof row.type_data[0]!=="undefined"
				// 	? row.type_data[0].mint
				// 	: null
				// const mint_number = typeof row.type_data[0]!=="undefined"
				// 	? row.type_data[0].mint_number
				// 	: null
				const type_number = typeof row.type_data[0]!=="undefined"
					? row.type_data[0].number
					: null

				//const typeValue = common.clean_gaps((mint + " " + mint_number + " / " + type_number), " | ", " | ") 
				typeValues += type_number
			}

			if (row.type && row.type.length>0) {
				const group = common.create_dom_element({
					element_type	: "div",
					class_name		: "group block_wrapper",
					parent			: info_container
				})
				common.create_dom_element({
					element_type	: "label",
					class_name		: "left-labels",
					text_content	: typeLabels,
					parent			: group
				})
				
				common.create_dom_element({
					element_type	: "span",
					class_name		: "rigth-values",
					inner_html		: typeValues,
					parent			: group
				})
			}	

		//DESIGN GROUP
			const design_group = common.create_dom_element({
				element_type	: "div",
				class_name		: "design-group",
				parent			: info_container
			})

		// OBVERSE

			const group_design_obverse = common.create_dom_element({
				element_type	: "div",
				class_name		: "group block_wrapper",
				parent			: design_group
			})

			common.create_dom_element({
				element_type	: "label",
				class_name		: "left-labels section-label",
				text_content	: tstring.obverse || "Obverse",
				parent			: group_design_obverse
			})

			// design_obverse
				const design_obverse = typeof row.type_data[0]!=="undefined"
					? row.type_data[0].design_obverse
					: null
				if (design_obverse && design_obverse.length>0) {
					const group_design_obverse = common.create_dom_element({
						element_type	: "div",
						class_name		: "group block_wrapper",
						parent			: design_group
					})				
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels",
						text_content	: tstring.design_obverse || "design_obverse",
						parent			: group_design_obverse
					})

					const catalog_url = page_globals.__WEB_ROOT_WEB__+"/catalog/?item_type=design_obverse"+"&label="+design_obverse+"&value="+design_obverse;
					const prompt_label = common.create_dom_element({
						element_type	: "a",
						class_name		: "rigth-values",
						inner_html 		: design_obverse,
						href			: catalog_url,
						parent 			: group_design_obverse
					})
				}

		// 
			// symbol_obverse
				const symbol_obverse = typeof row.type_data[0]!=="undefined"
					? row.type_data[0].symbol_obverse
					: null
				if (symbol_obverse && symbol_obverse.length>0) {
					const group_symbol_obverse = common.create_dom_element({
						element_type	: "div",
						class_name		: "group block_wrapper",
						parent			: design_group
					})				
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels",
						text_content	: tstring.symbol_obverse || "symbol_obverse",
						parent			: group_symbol_obverse
					})	

					const catalog_url = page_globals.__WEB_ROOT_WEB__+"/catalog/?item_type=symbol_obverse"+"&label="+symbol_obverse+"&value="+symbol_obverse;
					const prompt_label = common.create_dom_element({
						element_type	: "a",
						class_name		: "rigth-values",
						inner_html 		: symbol_obverse,
						href			: catalog_url,
						parent 			: group_symbol_obverse
					})					
				}

			// legend_obverse
				const legend_obverse = typeof row.type_data[0]!=="undefined"
					? row.type_data[0].legend_obverse
					: null
				if (legend_obverse && legend_obverse.length>0) {
					const group_legend_obverse = common.create_dom_element({
						element_type	: "div",
						class_name		: "group block_wrapper",
						parent			: design_group
					})				
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels",
						text_content	: tstring.legend_obverse || "legend_obverse",
						parent			: group_legend_obverse
					})
					const legend_node = page.render_legend({
						value : legend_obverse,
						style : 'median legend_obverse_box rigth-values'
					})
					group_legend_obverse.appendChild(legend_node)
				}

			// countermark_obverse
				if (row.countermark_obverse && row.countermark_obverse.length>0) {
					const group = common.create_dom_element({
						element_type	: "div",
						class_name		: "group block_wrapper",
						parent			: design_group
					})
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels",
						text_content	: tstring.countermark_obverse || "countermark_obverse",
						parent			: group
					})
					const current_node = page.render_legend({
						value : row.countermark_obverse,
						style : 'median countermark_obverse_box rigth-values'
					})
					group.appendChild(current_node)
				}
			
		//REVERSE

			const group_design_reverse = common.create_dom_element({
						element_type	: "div",
						class_name		: "group block_wrapper",
						parent			: design_group
			})

			common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels section-label",
						text_content	: tstring.reverse || "Reverse",
						parent			: group_design_reverse
			})

		// design_reverse
				const design_reverse = typeof row.type_data[0]!=="undefined"
					? row.type_data[0].design_reverse
					: null
				if (design_reverse && design_reverse.length>0) {
					const group_design_reverse = common.create_dom_element({
						element_type	: "div",
						class_name		: "group block_wrapper",
						parent			: design_group
					})				
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels",
						text_content	: tstring.design_reverse || "design_reverse",
						parent			: group_design_reverse
					})					 
					
					const catalog_url = page_globals.__WEB_ROOT_WEB__+"/catalog/?item_type=design_reverse"+"&label="+design_reverse+"&value="+design_reverse;
					const prompt_label = common.create_dom_element({
						element_type	: "a",
						class_name		: "rigth-values",
						inner_html 		: design_reverse,
						href			: catalog_url,
						parent 			: group_design_reverse
					})

					// common.create_dom_element({
					// 	element_type	: "span",
					// 	class_name		: "value",
					// 	inner_html		: design_reverse,
					// 	parent			: group_design_reverse
					// })
				}

				// symbol_reverse
				const symbol_reverse = typeof row.type_data[0]!=="undefined"
					? row.type_data[0].symbol_reverse
					: null
				if (symbol_reverse && symbol_reverse.length>0) {
					const group_symbol_reverse = common.create_dom_element({
						element_type	: "div",
						class_name		: "group block_wrapper",
						parent			: design_group
					})				
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels",
						text_content	: tstring.symbol_reverse || "symbol_reverse",
						parent			: group_symbol_reverse
					})					 
					common.create_dom_element({
						element_type	: "span",
						class_name		: "rigth-values",
						inner_html		: symbol_reverse,
						parent			: group_symbol_reverse
					})
				}

				// legend_reverse
				const legend_reverse = typeof row.type_data[0]!=="undefined"
					? row.type_data[0].legend_reverse
					: null
				if (legend_reverse && legend_reverse.length>0) {
					const group_legend_reverse = common.create_dom_element({
						element_type	: "div",
						class_name		: "group block_wrapper",
						parent			: design_group
					})				
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels",
						text_content	: tstring.legend_reverse || "legend_reverse",
						parent			: group_legend_reverse
					})
					const legend_node = page.render_legend({
						value : legend_reverse,
						style : 'median legend_reverse_box rigth-values'
					})
					group_legend_reverse.appendChild(legend_node)
				}

				// countermark_reverse
				if (row.countermark_reverse && row.countermark_reverse.length>0) {
					const group = common.create_dom_element({
						element_type	: "div",
						class_name		: "group block_wrapper",
						parent			: fifth_block
					})
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels",
						text_content	: tstring.countermark_reverse || "countermark_reverse",
						parent			: group
					})
					const current_node = page.render_legend({
						value : row.countermark_reverse,
						style : 'median countermark_reverse_box rigth-values'
					})
					group.appendChild(current_node)
				}

			//If no design info remove desing wrapper
			if (design_group.getElementsByClassName("rigth-values").length==0){
				design_group.remove();
			}

		// MEASURES

			common.create_dom_element({
						element_type	: "div",
						class_name		: "group block_wrapper",
						parent			: info_container
			})

			// weight
				if (row.weight && row.weight.length>0) {
					const group = common.create_dom_element({
						element_type	: "div",
						class_name		: "group block_wrapper",
						parent			: info_container
					})
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels",
						text_content	: tstring.weight || "weight",
						parent			: group
					})
					common.create_dom_element({
						element_type	: "span",
						class_name		: "rigth-values",
						inner_html		: row.weight+" g",
						parent			: group
					})
				}
			// diameter
				if (row.diameter && row.diameter.length>0) {
					const group = common.create_dom_element({
						element_type	: "div",
						class_name		: "group block_wrapper",
						parent			: info_container
					})
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels",
						text_content	: tstring.diameter || "diameter",
						parent			: group
					})
					common.create_dom_element({
						element_type	: "span",
						class_name		: "rigth-values",
						inner_html		: row.diameter+" mm",
						parent			: group
					})
				}
			// dies
				if (row.dies && row.dies.length>0) {
					const group = common.create_dom_element({
						element_type	: "div",
						class_name		: "group block_wrapper",
						parent			: info_container
					})
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels",
						text_content	: tstring.dies || "dies",
						parent			: group
					})
					common.create_dom_element({
						element_type	: "span",
						class_name		: "rigth-values",
						inner_html		: row.dies,
						parent			: group
					})
				}
			// technique
				if (row.technique && row.technique.length>0) {
					const group = common.create_dom_element({
						element_type	: "div",
						class_name		: "group block_wrapper",
						parent			: info_container
					})
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels",
						text_content	: tstring.technique || "technique",
						parent			: group
					})
					common.create_dom_element({
						element_type	: "span",
						class_name		: "rigth-values",
						inner_html		: row.technique,
						parent			: group
					})
				}


		//FIND TYPE
			if (row.find_type && row.find_type.length>0) {
				const group = common.create_dom_element({
					element_type	: "div",
					class_name		: "group block_wrapper",
					parent			: info_container
				})
				common.create_dom_element({
					element_type	: "label",
					class_name		: "left-labels",
					text_content	: tstring.find_type || "find_type",
					parent			: group
				})
				common.create_dom_element({
					element_type	: "span",
					class_name		: "rigth-values",
					inner_html		: row.find_type,
					parent			: group
				})
			}	

		// HOARD
				if (row.hoard && row.hoard.length>0) {
					const group = common.create_dom_element({
						element_type	: "div",
						class_name		: "group block_wrapper",
						parent			: info_container
					})
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels",
						text_content	: tstring.hoard || "hoard",
						parent			: group
					})
					common.create_dom_element({
						element_type	: "span",
						class_name		: "rigth-values",
						inner_html		: row.hoard,
						parent			: group
					})
				}

		// FINDS	
			// findspot_place
				if (row.findspot_place && row.findspot_place.length>0) {
					const group = common.create_dom_element({
						element_type	: "div",
						class_name		: "group block_wrapper",
						parent			: info_container
					})
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels",
						text_content	: tstring.findspot_place || "findspot_place",
						parent			: group
					})
					common.create_dom_element({
						element_type	: "span",
						class_name		: "rigth-values",
						inner_html		: row.findspot_place,
						parent			: group
					})
				}
			// find_date
				if (row.find_date && row.find_date.length>0) {
					const group = common.create_dom_element({
						element_type	: "div",
						class_name		: "group block_wrapper",
						parent			: info_container
					})
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels",
						text_content	: tstring.find_date || "find_date",
						parent			: group
					})
					common.create_dom_element({
						element_type	: "span",
						class_name		: "rigth-values",
						inner_html		: row.find_date,
						parent			: group
					})
				}

		// PUBLIC INFO
				if (row.public_info && row.public_info.length>1 && row.public_info!=='<br data-mce-bogus="1">') {
					const group = common.create_dom_element({
						element_type	: "div",
						class_name		: "group block_wrapper",
						parent			: info_container
					})
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels",
						text_content	: tstring.public_info || "public_info",
						parent			: group
					})
					common.create_dom_element({
						element_type	: "span",
						class_name		: "rigth-values",
						inner_html		: row.public_info,
						parent			: group
					})
				}

		// URI
				const uri = row.mib_uri
				const uri_text	= '<a class="icon_link info_value" target="_blank" href="' +uri+ '"> </a> '
				if (row.mib_uri && row.mib_uri.length>0) {
					const group = common.create_dom_element({
						element_type	: "div",
						class_name		: "group block_wrapper",
						parent			: info_container
					})
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels",
						text_content	: tstring.uri || "uri",
						parent			: group
					})
					common.create_dom_element({
						element_type	: "span",
						class_name		: "rigth-values",
						inner_html		: uri_text,
						parent			: group
					})
				}

			// other permanent uri
				if (row.uri && row.uri.length>0) {					
					for (let i = 0; i < row.uri.length; i++) {

						const currentUri = row.uri[i]
						const currentUri_text	= '<a class="icon_link info_value" target="_blank" href="' +currentUri+ '"> </a> '

						//const el = row.uri[i]
					
						const group = common.create_dom_element({
							element_type	: "div",
							class_name		: "group block_wrapper",
							parent			: info_container
						})

						common.create_dom_element({
							element_type	: "label",
							class_name		: "left-labels",
							text_content	: (tstring.uri || "uri") + " " + el.label,
							parent			: group
						})

						common.create_dom_element({
							element_type	: "span",
							class_name		: "rigth-values",
							inner_html		: currentUri_text,
							parent			: group
						})
						// common.create_dom_element({
						// 	element_type	: "a",
						// 	href			: el.value,
						// 	target			: "_blank",
						// 	class_name		: "rigth-values",
						// 	inner_html		: el.value,
						// 	parent			: group
						// })
					}					
				}

		// BIBLIOGRAPHY -- DESACTIVADA. POR REVISAR EL FORMATO !!! --- 
				if (row.bibliography_data && row.bibliography_data.length>0) {

					const group = common.create_dom_element({
						element_type	: "div",
						class_name		: "group block_wrapper",
						parent			: info_container
					})

					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels",
						text_content	: tstring.bibliography || "bibliography",
						parent			: group
					})				

					const ref_biblio		= row.bibliography_data
					const ref_biblio_length	= ref_biblio.length
					for (let i = 0; i < ref_biblio_length; i++) {

						// build full ref biblio node
						const biblio_row_node = biblio_row_fields.render_row_bibliography(ref_biblio[i])

						const biblio_row_wrapper = common.create_dom_element({
							element_type	: "div",
							class_name		: "rigth-values",
							parent			: group
						})
						biblio_row_wrapper.appendChild(biblio_row_node)
					}

					// for (let b = 0; b < row.bibliography.length; b++) {
						
					// 	const el = row.bibliography[b]

					// 	const ar = []
					// 	if (el.authors) ar.push(el.authors)
					// 	if (el.date) ar.push(el.date)
					// 	if (el.place) ar.push(el.place)
					// 	if (el.title) ar.push(el.title)
					// 	const text = ar.join('<br>').trim()

					// 	const group = common.create_dom_element({
					// 		element_type	: "div",
					// 		class_name		: "group bibliography",
					// 		parent			: tenth_block
					// 	})
					// 	// common.create_dom_element({
					// 	// 	element_type	: "label",
					// 	// 	text_content	: tstring.bibliography || "bibliography",
					// 	// 	parent			: group
					// 	// })
					// 	common.create_dom_element({
					// 		element_type	: "span",
					// 		class_name		: "value",
					// 		inner_html		: text,
					// 		parent			: group
					// 	})
					// }
				}



		// type
			// fragment.appendChild(
			// 	self.default("type", item.type, 'type', function(){
			// 		const mint		= typeof item.type_data[0]!=="undefined"
			// 			? item.type_data[0].mint
			// 			: null
			// 		const number	= (mint) 
			// 			? mint + " " + item.type
			// 			: item.type
			// 		const value = common.clean_gaps(number, " | ", " | ") // , splitter=" | ", joinner=", "
			// 		return value
			// 	})
			// )


		// row_wrapper
			const row_wrapper = common.create_dom_element({
				element_type	: "div",
				class_name		: "row_wrapper"
			})
			row_wrapper.appendChild(fragment)


		return row_wrapper
	},//end draw_coin



	default : function(name, value, label, fn) {

		const self = this

		// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line " + name
			})

		if (value && value.length>0) {
			
			// label
				if (label) {
					common.create_dom_element({
						element_type 	: "label",
						class_name 		: "",
						text_content 	: label,
						parent 			: line
					})
				}			
			
			// value
				const item_text = (typeof fn==="function")
					? fn(value)
					: page.remove_gaps(value, " | ")

				common.create_dom_element({
					element_type	: "span",
					class_name		: "info_value",
					inner_html		: item_text.trim(),
					parent			: line
				})	
		}

		return line
	},//end default



	image : function(item, name) {

		const self = this

		// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line inline " + name
			})

		if (item[name] && item[name].length>0) {
	
			common.create_dom_element({
				element_type 	: "img",
				class_name 		: "image " + name,
				src 			: item[name],
				parent 			: line
			})
		}


		return line
	},//end image



	identify_coin : function(item, name) {

		const self = this

		// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line inline " + name
			})

		const ar_str_coins = page.split_data(item.ref_coins, ' | ')

		const ar_coins = []
		for (var i = 0; i < ar_str_coins.length; i++) {
			ar_coins.push(JSON.parse(ar_str_coins[i]))
		}
		const identify_coin_id = ar_coins[0][0]
		const identify_coin = item.ref_coins_union.find(item => item.section_id === identify_coin_id)

		if (identify_coin) {
	
			common.create_dom_element({
				element_type 	: "span",
				class_name 		: name,
				text_content 	: identify_coin.ref_auction,
				parent 			: line
			})

			// final_date
				const split_time 	= (identify_coin.ref_auction_date)
					? identify_coin.ref_auction_date.split(' ')
					: [""]
				const split_date 	= split_time[0].split('-')
				const correct_date 	= split_date.reverse()
				const final_date 	= correct_date.join("-")

				if (final_date) {
					common.create_dom_element({
						element_type 	: "span",
						class_name 		: name,
						text_content 	: " | "+final_date,
						parent 			: line
					})
				}

			// ref_auction_number
				if(identify_coin.ref_auction_number){
					common.create_dom_element({
						element_type 	: "span",
						class_name 		: name,
						text_content 	: ", "+(tstring.n || "nº") +" "+ identify_coin.ref_auction_number,
						parent 			: line
					})
				}

			// size_text. weight / dies / diameter				
				const ar_beats = []
				if (identify_coin.weight && identify_coin.weight.length>0) {
					ar_beats.push( identify_coin.weight + " g" )
				}
				if (identify_coin.dies && identify_coin.dies.length>0) {
					ar_beats.push( identify_coin.dies + " h" )
				}
				if (identify_coin.diameter && identify_coin.diameter.length>0) {
					ar_beats.push( identify_coin.diameter + " mm" )
				}
				const size_text = ar_beats.join("; ")

			common.create_dom_element({
				element_type 	: "span",
				class_name 		: name,
				text_content 	: " ("+size_text+")",
				parent 			: line
			})
		}		


		return line
	},//end image



}//end coin_row
