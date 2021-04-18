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
			// const id_block = common.create_dom_element({
			// 	element_type	: "div",
			// 	class_name		: "group block_wrapper",
			// 	parent			: info_container
			// })
			// ID
				if (row.section_id && row.section_id.length>0) {
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels",
						text_content	: "ID",
						parent			: info_container
					})
					common.create_dom_element({
						element_type	: "span",
						class_name		: "rigth-values",
						inner_html		: row.section_id,
						parent			: info_container
					})
				}

		// COLLECTION - FORMER - NUMBER
			const label_collection = []
			const value_collection = []

			if (row.collection && row.collection.length>0) {
				label_collection.push(tstring.collection || "Collection")
				value_collection.push(row.collection)
			}

			if (row.former_collection && row.former_collection.length>0) {
				label_collection.push(tstring.former_collection || "Former collection")
				value_collection.push(row.former_collection)
			}

			if (row.number && row.number.length>0) {
				label_collection.push( tstring.number || "Number")
				value_collection.push(row.number)
			}

			const label_collection_node = common.create_dom_element({
				element_type	: "label",
				class_name		: "left-labels",
				text_content	: label_collection.join(' | '),
				parent			: info_container
			})

			const value_collection_node = common.create_dom_element({
				element_type	: "span",
				class_name		: "rigth-values",
				inner_html		: value_collection.join(' | '),
				parent			: info_container
			})

		//Auctions

			const label_auctions = []
			const value_auctions = []

			if (row.ref_auction_group && row.ref_auction_group.length>0) {

				for (let i=0;i<row.ref_auction_group.length;i++){
					if (row.ref_auction_group[i].name.length>0){
						label_auctions.push(tstring.auction || "Auction")
						value_auctions.push(row.ref_auction_group[i].name)

						if (row.ref_auction_group[i].number && row.ref_auction_group[i].number.length>0) {
							label_auctions.push(tstring.number || "Number")
							value_auctions.push(row.ref_auction_group[i].number)
						}
					}
				}
			}

			const label_auctions_node = common.create_dom_element({
				element_type	: "label",
				class_name		: "left-labels",
				text_content	: label_auctions.join(' | '),
				parent			: info_container
			})

			const value_auctions_node = common.create_dom_element({
				element_type	: "span",
				class_name		: "rigth-values",
				inner_html		: value_auctions.join(' | '),
				parent			: info_container
			})

		//equivalents auctions
			const value_equivalents = []

			if (row.ref_related_coin_auction_group && row.ref_related_coin_auction_group.length>0) {

				for (let i=0;i<row.ref_related_coin_auction_group.length;i++){
					const current_value_equivalents = []
					if (row.ref_related_coin_auction_group[i].name.length>0){
						current_value_equivalents.push('= '+row.ref_related_coin_auction_group[i].name)

						if (row.ref_related_coin_auction_group[i].number && row.ref_related_coin_auction_group[i].number.length>0) {
							current_value_equivalents.push(row.ref_related_coin_auction_group[i].number)

						}
					}
					value_equivalents.push(current_value_equivalents.join(' | '))
				}
			}
			const value_equivalents_node = common.create_dom_element({
				element_type	: "span",
				class_name		: "rigth-values",
				inner_html		: value_equivalents.join(' <br> '),
				parent			: info_container
			})

		// MINT + MINT NUMBER + TYPE
			//label
			const label_mint 		= tstring.mint || "Mint"
			const label_number 		= tstring.number_abv || "nº"
			const label_type_name 	= tstring.type || "Type"

			const label_type = label_type_name
								+ ': '+ label_mint.toLowerCase()
								+' + '+label_number.toLowerCase()
								+ ' ' +label_mint.toLowerCase()
								+ ' / ' +label_number.toLowerCase()
								+' ' +label_type_name.toLowerCase();
			//value
			const mint = (row.mint)
				? row.mint
				: ''

			const mint_number = (row.mint_number)
				? row.mint_number
				: ''

			const type_number = (row.mint_number)
				? row.type_data[0].number
				: ''

			const value_type = mint + ' ' + mint_number+'/'+type_number

			const label_type_node = common.create_dom_element({
				element_type	: "label",
				class_name		: "left-labels",
				inner_html		: label_type,
				parent			: info_container
			})

			const value_type_node = common.create_dom_element({
				element_type	: "span",
				class_name		: "rigth-values",
				inner_html		: value_type,
				parent			: info_container
			})




		// OBVERSE
			common.create_dom_element({
				element_type	: "label",
				class_name		: "left-labels",
				text_content	: tstring.obverse.toUpperCase() || "OBVERSE",
				parent			: info_container
			})

			// design_obverse
				const design_obverse = typeof row.type_data[0]!=="undefined"
					? row.type_data[0].design_obverse
					: null
				if (design_obverse && design_obverse.length>0) {
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels sub-label",
						text_content	: tstring.design || "design",
						parent			: info_container
					})

					const catalog_url = page_globals.__WEB_ROOT_WEB__+"/catalog/?item_type=design_obverse"+"&label="+design_obverse+"&value="+design_obverse;
					const prompt_label = common.create_dom_element({
						element_type	: "a",
						class_name		: "rigth-values",
						inner_html 		: design_obverse,
						href			: catalog_url,
						parent 			: info_container
					})
				}

		//
			// symbol_obverse
				const symbol_obverse = typeof row.type_data[0]!=="undefined"
					? row.type_data[0].symbol_obverse
					: null
				if (symbol_obverse && symbol_obverse.length>0) {
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels sub-label",
						text_content	: tstring.symbol || "symbol",
						parent			: info_container
					})

					const catalog_url = page_globals.__WEB_ROOT_WEB__+"/catalog/?item_type=symbol_obverse"+"&label="+symbol_obverse+"&value="+symbol_obverse;
					const prompt_label = common.create_dom_element({
						element_type	: "a",
						class_name		: "rigth-values",
						inner_html 		: symbol_obverse,
						href			: catalog_url,
						parent 			: info_container
					})
				}

			// legend_obverse
				const legend_obverse = typeof row.type_data[0]!=="undefined"
					? row.type_data[0].legend_obverse
					: null
				if (legend_obverse && legend_obverse.length>0) {
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels sub-label",
						text_content	: tstring.legend || "legend",
						parent			: info_container
					})
					const legend_node = page.render_legend({
						value : legend_obverse,
						style : 'median legend_obverse_box rigth-values'
					})
					info_container.appendChild(legend_node)
				}

			// countermark_obverse
				if (row.countermark_obverse && row.countermark_obverse.length>0) {
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels sub-label",
						text_content	: tstring.countermark || "countermark",
						parent			: info_container
					})
					const current_node = page.render_legend({
						value : row.countermark_obverse,
						style : 'median countermark_obverse_box rigth-values'
					})
					info_container.appendChild(current_node)
				}

		//REVERSE
			common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels",
						text_content	: tstring.reverse.toUpperCase() || "REVERSE",
						parent			: info_container
			})

		// design_reverse
				const design_reverse = typeof row.type_data[0]!=="undefined"
					? row.type_data[0].design_reverse
					: null
				if (design_reverse && design_reverse.length>0) {
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels sub-label",
						text_content	: tstring.design || "design",
						parent			: info_container
					})

					const catalog_url = page_globals.__WEB_ROOT_WEB__+"/catalog/?item_type=design_reverse"+"&label="+design_reverse+"&value="+design_reverse;
					const prompt_label = common.create_dom_element({
						element_type	: "a",
						class_name		: "rigth-values",
						inner_html 		: design_reverse,
						href			: catalog_url,
						parent 			: info_container
					})
				}

				// symbol_reverse
				const symbol_reverse = typeof row.type_data[0]!=="undefined"
					? row.type_data[0].symbol_reverse
					: null
				if (symbol_reverse && symbol_reverse.length>0) {
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels sub-label",
						text_content	: tstring.symbol || "symbol",
						parent			: info_container
					})
					common.create_dom_element({
						element_type	: "span",
						class_name		: "rigth-values",
						inner_html		: symbol_reverse,
						parent			: info_container
					})
				}

				// legend_reverse
				const legend_reverse = typeof row.type_data[0]!=="undefined"
					? row.type_data[0].legend_reverse
					: null
				if (legend_reverse && legend_reverse.length>0) {
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels sub-label",
						text_content	: tstring.legend || "legend",
						parent			: info_container
					})
					const legend_node = page.render_legend({
						value : legend_reverse,
						style : 'median legend_reverse_box rigth-values'
					})
					info_container.appendChild(legend_node)
				}

				// countermark_reverse
				if (row.countermark_reverse && row.countermark_reverse.length>0) {
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels sub-label",
						text_content	: tstring.countermark || "countermark",
						parent			: info_container
					})
					const current_node = page.render_legend({
						value : row.countermark_reverse,
						style : 'median countermark_reverse_box rigth-values'
					})
					info_container.appendChild(current_node)
				}

		// MEASURES

			// weight
				if (row.weight && row.weight.length>0) {
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels",
						text_content	: tstring.weight || "weight",
						parent			: info_container
					})
					common.create_dom_element({
						element_type	: "span",
						class_name		: "rigth-values",
						inner_html		: row.weight+" g",
						parent			: info_container
					})
				}
			// diameter
				if (row.diameter && row.diameter.length>0) {
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels",
						text_content	: tstring.diameter || "diameter",
						parent			: info_container
					})
					common.create_dom_element({
						element_type	: "span",
						class_name		: "rigth-values",
						inner_html		: row.diameter+" mm",
						parent			: info_container
					})
				}
			// dies
				if (row.dies && row.dies.length>0) {
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels",
						text_content	: tstring.dies || "dies",
						parent			: info_container
					})
					common.create_dom_element({
						element_type	: "span",
						class_name		: "rigth-values",
						inner_html		: row.dies,
						parent			: info_container
					})
				}
			// technique
				if (row.technique && row.technique.length>0) {
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels",
						text_content	: tstring.technique || "technique",
						parent			: info_container
					})
					common.create_dom_element({
						element_type	: "span",
						class_name		: "rigth-values",
						inner_html		: row.technique,
						parent			: info_container
					})
				}


		//FIND TYPE
			if (row.find_type && row.find_type.length>0) {
				common.create_dom_element({
					element_type	: "label",
					class_name		: "left-labels",
					text_content	: tstring.find_type || "find_type",
					parent			: info_container
				})
				common.create_dom_element({
					element_type	: "span",
					class_name		: "rigth-values",
					inner_html		: row.find_type,
					parent			: info_container
				})
			}

		// HOARD
				if (row.hoard && row.hoard.length>0) {
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels",
						text_content	: tstring.hoard || "hoard",
						parent			: info_container
					})
					common.create_dom_element({
						element_type	: "span",
						class_name		: "rigth-values",
						inner_html		: row.hoard,
						parent			: info_container
					})
				}

		// FINDS
			// findspot_place
				if (row.findspot_place && row.findspot_place.length>0) {
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels",
						text_content	: tstring.findspot_place || "findspot_place",
						parent			: info_container
					})
					common.create_dom_element({
						element_type	: "span",
						class_name		: "rigth-values",
						inner_html		: row.findspot_place,
						parent			: info_container
					})
				}
			// find_date
				if (row.find_date && row.find_date.length>0) {
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels",
						text_content	: tstring.find_date || "find_date",
						parent			: info_container
					})
					common.create_dom_element({
						element_type	: "span",
						class_name		: "rigth-values",
						inner_html		: row.find_date,
						parent			: info_container
					})
				}

		// PUBLIC INFO
				if (row.public_info && row.public_info.length>1 && row.public_info!=='<br data-mce-bogus="1">') {
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels",
						text_content	: tstring.public_info || "public_info",
						parent			: info_container
					})
					common.create_dom_element({
						element_type	: "span",
						class_name		: "rigth-values",
						inner_html		: row.public_info,
						parent			: info_container
					})
				}

		// URI
				const uri = row.mib_uri
				const uri_text	= '<a class="icon_link info_value" target="_blank" href="' +uri+ '"> MIB </a> '
				if (row.mib_uri && row.mib_uri.length>0) {
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels",
						text_content	: tstring.uri || "uri",
						parent			: info_container
					})
					common.create_dom_element({
						element_type	: "span",
						class_name		: "rigth-values",
						inner_html		: uri_text,
						parent			: info_container
					})
				}

			// other permanent uri
				if (row.uri && row.uri.length>0) {
					for (let i = 0; i < row.uri.length; i++) {

						const currentUri = row.uri[i]
						const currentUri_text	= '<a class="icon_link info_value" target="_blank" href="'+currentUri.value+'"> '+currentUri.label+'</a> '

						// common.create_dom_element({
						// 	element_type	: "label",
						// 	class_name		: "left-labels",
						// 	text_content	: (tstring.uri || "uri"),
						// 	parent			: info_container
						// })

						common.create_dom_element({
							element_type	: "span",
							class_name		: "rigth-values",
							inner_html		: currentUri_text,
							parent			: info_container
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

					// const group = common.create_dom_element({
					// 	element_type	: "div",
					// 	class_name		: "group block_wrapper",
					// 	parent			: info_container
					// })

					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels",
						text_content	: tstring.bibliography || "bibliography",
						parent			: info_container
					})

					const bibliography_group = common.create_dom_element({
						element_type	: "div",
						class_name		: "vertical-group",
						parent			: info_container
					})

					const ref_biblio		= row.bibliography_data
					const ref_biblio_length	= ref_biblio.length
					for (let i = 0; i < ref_biblio_length; i++) {

						// build full ref biblio node
						const biblio_row_node = biblio_row_fields.render_row_bibliography(ref_biblio[i])

						const biblio_row_wrapper = common.create_dom_element({
							element_type	: "div",
							class_name		: "rigth-values sub-vertical-group",
							parent			: bibliography_group
						})
						biblio_row_wrapper.appendChild(biblio_row_node)
					}
				}

		// row_wrapper
			const row_wrapper = common.create_dom_element({
				element_type	: "div",
				class_name		: "row_wrapper"
			})
			row_wrapper.appendChild(fragment)


		return row_wrapper
	},//end draw_coin


	//
	// default : function(name, value, label, fn) {
	//
	// 	const self = this
	//
	// 	// line
	// 		const line = common.create_dom_element({
	// 			element_type	: "div",
	// 			class_name		: "info_line " + name
	// 		})
	//
	// 	if (value && value.length>0) {
	//
	// 		// label
	// 			if (label) {
	// 				common.create_dom_element({
	// 					element_type 	: "label",
	// 					class_name 		: "",
	// 					text_content 	: label,
	// 					parent 			: line
	// 				})
	// 			}
	//
	// 		// value
	// 			const item_text = (typeof fn==="function")
	// 				? fn(value)
	// 				: page.remove_gaps(value, " | ")
	//
	// 			common.create_dom_element({
	// 				element_type	: "span",
	// 				class_name		: "info_value",
	// 				inner_html		: item_text.trim(),
	// 				parent			: line
	// 			})
	// 	}
	//
	// 	return line
	// },//end default
	//
	//
	//
	// image : function(item, name) {
	//
	// 	const self = this
	//
	// 	// line
	// 		const line = common.create_dom_element({
	// 			element_type	: "div",
	// 			class_name		: "info_line inline " + name
	// 		})
	//
	// 	if (item[name] && item[name].length>0) {
	//
	// 		common.create_dom_element({
	// 			element_type 	: "img",
	// 			class_name 		: "image " + name,
	// 			src 			: item[name],
	// 			parent 			: line
	// 		})
	// 	}
	//
	//
	// 	return line
	// },//end image
	//
	//
	//
	// identify_coin : function(item, name) {
	//
	// 	const self = this
	//
	// 	// line
	// 		const line = common.create_dom_element({
	// 			element_type	: "div",
	// 			class_name		: "info_line inline " + name
	// 		})
	//
	// 	const ar_str_coins = page.split_data(item.ref_coins, ' | ')
	//
	// 	const ar_coins = []
	// 	for (var i = 0; i < ar_str_coins.length; i++) {
	// 		ar_coins.push(JSON.parse(ar_str_coins[i]))
	// 	}
	// 	const identify_coin_id = ar_coins[0][0]
	// 	const identify_coin = item.ref_coins_union.find(item => item.section_id === identify_coin_id)
	//
	// 	if (identify_coin) {
	//
	// 		common.create_dom_element({
	// 			element_type 	: "span",
	// 			class_name 		: name,
	// 			text_content 	: identify_coin.ref_auction,
	// 			parent 			: line
	// 		})
	//
	// 		// final_date
	// 			const split_time 	= (identify_coin.ref_auction_date)
	// 				? identify_coin.ref_auction_date.split(' ')
	// 				: [""]
	// 			const split_date 	= split_time[0].split('-')
	// 			const correct_date 	= split_date.reverse()
	// 			const final_date 	= correct_date.join("-")
	//
	// 			if (final_date) {
	// 				common.create_dom_element({
	// 					element_type 	: "span",
	// 					class_name 		: name,
	// 					text_content 	: " | "+final_date,
	// 					parent 			: line
	// 				})
	// 			}
	//
	// 		// ref_auction_number
	// 			if(identify_coin.ref_auction_number){
	// 				common.create_dom_element({
	// 					element_type 	: "span",
	// 					class_name 		: name,
	// 					text_content 	: ", "+(tstring.n || "nº") +" "+ identify_coin.ref_auction_number,
	// 					parent 			: line
	// 				})
	// 			}
	//
	// 		// size_text. weight / dies / diameter
	// 			const ar_beats = []
	// 			if (identify_coin.weight && identify_coin.weight.length>0) {
	// 				ar_beats.push( identify_coin.weight + " g" )
	// 			}
	// 			if (identify_coin.dies && identify_coin.dies.length>0) {
	// 				ar_beats.push( identify_coin.dies + " h" )
	// 			}
	// 			if (identify_coin.diameter && identify_coin.diameter.length>0) {
	// 				ar_beats.push( identify_coin.diameter + " mm" )
	// 			}
	// 			const size_text = ar_beats.join("; ")
	//
	// 		common.create_dom_element({
	// 			element_type 	: "span",
	// 			class_name 		: name,
	// 			text_content 	: " ("+size_text+")",
	// 			parent 			: line
	// 		})
	// 	}
	//
	//
	// 	return line
	// },//end image



}//end coin_row
