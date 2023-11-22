/*global tstring, page_globals, SHOW_DEBUG, dedalo_logged, common, page, biblio_row_fields, DocumentFragment, tstring */
/*eslint no-undef: "error"*/
/*jshint esversion: 6 */
"use strict";



var coin_row = {



	caller  : null,



	draw_coin : function(row) {
		if(SHOW_DEBUG===true) {
			// console.log("-- draw_coin row:",row)
		}

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

		// Cite of record
			const golden_separator = document.querySelector('.golden-separator')
			const cite = common.create_dom_element({
				element_type	: "span",
				class_name		: "cite_this_record",
				text_content	: tstring.cite_this_record || 'cite this record',
				parent			: golden_separator
			})
			cite.addEventListener('click', async function(){
				const main_catalog_data = await page.load_main_catalog()
				const cite_data = main_catalog_data.result[0];
				const publication_data = cite_data.publication_data[0];
				cite_data.autors = {
					authorship_data		: row.authorship_data || null,
					authorship_names	: row.authorship_names || null,
					authorship_surnames	: row.authorship_surnames || null,
					authorship_roles	: row.authorship_roles || null,
				}
				cite_data.catalog = null
				cite_data.title = '<em>'+ page_globals.OWN_CATALOG_ACRONYM +' '+row.section_id + '</em>'
				cite_data.publication_data = publication_data
				cite_data.uri_location 	= window.location

				const cite_data_node = biblio_row_fields.render_cite_this(cite_data)

				const popUpContainer = common.create_dom_element({
					element_type	: "div",
					class_name		: "float-cite",
					parent 			: document.body
				})
				popUpContainer.addEventListener('mouseup',function() {

   					popUpContainer.classList.add('copy')
   					cite_data_node.classList.add('copy')

   					const selection = window.getSelection();
					//create a selection range
					const copy_range = document.createRange();
					//choose the element we want to select the text of
					copy_range.selectNodeContents(cite_data_node);
					//select the text inside the range
					selection.removeAllRanges();
       				selection.addRange( copy_range );

       				//copy the text to the clipboard
					document.execCommand("copy");

					//remove our selection range
					window.getSelection().removeAllRanges();
				})

				const title = common.create_dom_element({
					element_type	: "div",
					class_name		: "float-label",
					text_content	: tstring.cite_this_record || 'Cite this record',
					parent 			: popUpContainer
				})

				const close_buttom = common.create_dom_element({
					element_type	: "div",
					class_name		: "close-buttom",
					parent 			: popUpContainer
				})
				close_buttom.addEventListener("click",function(){
					// popUpContainer.remove()
				})
				document.body.addEventListener("click",function(event_cite){
					document.body.removeEventListener("click", function(event_cite){})
					popUpContainer.remove()
				})

				popUpContainer.appendChild(cite_data_node)

				const click_to_copy = common.create_dom_element({
					element_type	: "div",
					class_name		: "float-text_copy",
					text_content	: tstring.click_to_copy || 'Click to copy',
					parent 			: popUpContainer
				})
			})

		// identify_images
			const identify_images = common.create_dom_element({
				element_type	: "div",
				class_name		: "identify_images_wrapper gallery coins-sides-wrapper",
				parent 			: fragment
			})
			// image_obverse
				let coin_number = tstring.number || "Number"
				coin_number += " "+row.number

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
						title			: coin_number,
						src				: row.image_obverse,
						parent			: image_link
					})

					//GALLERY IMAGE CAPTIONS
					if (row.collection && row.collection.length>0){
						const collection_former = (row.former_collection && row.former_collection.length>0)
							? row.collection + " ("+row.former_collection+")"
							: row.collection

						const collection_label = (row.number && row.number.length>0)
							? collection_former+ " "+ row.number
							: collection_former

						//put gallery attributes to img
						image_obverse.setAttribute("data-caption",collection_label)
					}

					if (row.ref_auction_group){

						for (let i = 0; i < row.ref_auction_group.length; i++) {
							const auction = row.ref_auction_group[i]
							let auctionGalleryAttributes = ""
						// name
							if (auction.name) {
								auctionGalleryAttributes += auction.name
							}
						// ref_auction_date
							if (auction.date) {
								auctionGalleryAttributes += " " + auction.date
							}
						// number
							if (auction.number) {
								auctionGalleryAttributes += ", "+ auction.number
							}

						// lot
							if (row.number) {
								auctionGalleryAttributes += ", "+(tstring.lot || 'lot') +" "+ row.number
							}

							image_obverse.setAttribute("data-caption",auctionGalleryAttributes)
						}
					}

					if(row.image_obverse_data[0] && row.image_obverse_data[0].photographer){
						const currentAttr = image_obverse.getAttribute("data-caption")
						image_obverse.setAttribute("data-caption", currentAttr + '<spam> | </spam> <i class="fa fa-camera"></i> ' + row.image_obverse_data[0].photographer)
					}
					//END IMAGE GALLERY CAPTIONS
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
						title			: coin_number,
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
				if (row.section_id && row.section_id>0) {
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

		// collection - former - number
			const label_collection = []
			const value_collection = []

			if (row.collection && row.collection.length>0) {
				label_collection.push(tstring.collection || "Collection")
				value_collection.push(row.collection)
			}

			if (row.former_collection && row.former_collection.length>0) {
				// label_collection.push(tstring.former_collection || "Former collection")
				value_collection.push('('+row.former_collection+')')
			}

			if (value_collection.length > 0 && row.number && row.number.length>0) {
				// label_collection.push(tstring.number || "Number")
				value_collection.push(row.number)
			}

			const label_collection_node = common.create_dom_element({
				element_type	: "label",
				class_name		: "left-labels",
				text_content	: label_collection.join(''),
				parent			: info_container
			})

			const value_collection_node = common.create_dom_element({
				element_type	: "span",
				class_name		: "rigth-values",
				inner_html		: value_collection.join(' '),
				parent			: info_container
			})

		// auctions
			// const value_auctions = []
			// if (row.ref_auction_group && row.ref_auction_group.length>0) {
			// 	for (let i=0;i<row.ref_auction_group.length;i++){
			// 		if (row.ref_auction_group[i].name.length>0){
			// 			label_auctions.push(tstring.auction || "Auction")
			// 			value_auctions.push(row.ref_auction_group[i].name)
			// 			if (row.ref_auction_group[i].number && row.ref_auction_group[i].number.length>0) {
			// 				label_auctions.push(tstring.number || "Number")
			// 				value_auctions.push(row.ref_auction_group[i].number)
			// 			}
			// 		}
			// 	}
			//	}
			if (row.ref_auction_group){
				const label_auctions = []

				label_auctions.push(tstring.auction || "Auction")
				// label_auctions.push(tstring.date || "Date")
				// label_auctions.push(tstring.number || "Number")

				const label_auctions_node = common.create_dom_element({
					element_type	: "label",
					class_name		: "left-labels",
					text_content	: label_auctions.join(' | '),
					parent			: info_container
				})

				for (let i = 0; i < row.ref_auction_group.length; i++) {
					const auction = row.ref_auction_group[i]

					const auction_label = []
					if (auction.name){
						auction_label.push(auction.name)
						auction_label.push(" ")
					}

					if (auction.date){
						auction_label.push(auction.date)
						auction_label.push(", ")
					}

					if (auction.number){
						auction_label.push(auction.number || row.number)
						auction_label.push(", ")
					}

					if (row.number){
						auction_label.push(tstring.lot || "Lot")
						auction_label.push(" "+row.number)
					}

					common.create_dom_element({
						element_type	: "span",
						class_name		: "rigth-values",
						inner_html  	: auction_label.join(''),
						parent 			: info_container
					})
				}
			}//end if (row.ref_auction_group)


			// if (row.number && row.number.length>0) {
			// 	label_collection.push( tstring.number || "Number")
			// 	value_collection.push(r)
			// }

			// const value_auctions_node = common.create_dom_element({
			// 	element_type	: "span",
			// 	class_name		: "rigth-values",
			// 	inner_html		: value_auctions.join(' | '),
			// 	parent			: info_container
			// })

		// equivalents auctions
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

		// mint + mint number + type
			// label
			// const label_mint		= tstring.mint || "Mint"
			// const label_number	= tstring.number_abv || "nº"
			const label_type_name 	= tstring.type || "Type"

			const label_type = label_type_name
								// + ': '+ label_mint.toLowerCase()
								// +' + '+label_number.toLowerCase()
								// + ' ' +label_mint.toLowerCase()
								// + ' / ' +label_number.toLowerCase()
								// +' ' +label_type_name.toLowerCase();
			const type_section = row.type_data.find(item => item.catalogue === page_globals.OWN_CATALOG_ACRONYM)
				? row.type_data.find(item => item.catalogue === page_globals.OWN_CATALOG_ACRONYM)
				: row.type_data[0]

			// creators
			const creators_data = typeof type_section!=="undefined"
				? type_section.creators_data
				: null
			if (creators_data && creators_data.length>0) {

				const data = JSON.parse(creators_data)

				const ar_names		= type_section.creators_names
					? type_section.creators_names.split(' | ')
					: []
				const ar_surnames	= type_section.creators_surnames
					? type_section.creators_surnames.split(' | ')
					: []
				const ar_roles		= type_section.creators_roles
					? type_section.creators_roles.split('|')
					: []

				const text_creators = []
				const data_length = data.length

				for (var i = 0; i < data_length; i++) {
					const name		= ar_names[i]
						? ar_names[i]
						: ''
					const surname	= ar_surnames[i]
						? ar_surnames[i]
						: ''
					const rol		= ar_roles[i]
						? '('+ ar_roles[i] + ')'
						: ''

					const creator_name = name + ' ' + surname
					const creator = creator_name.trim() + ' ' + rol

					text_creators.push(creator.trim())
				}

				common.create_dom_element({
					element_type	: "label",
					class_name		: "left-labels",
					text_content	: tstring.authorities || "Authorities",
					parent			: info_container
				})

				const prompt_label = common.create_dom_element({
					element_type	: "span",
					class_name		: "rigth-values",
					inner_html		: text_creators,
					parent 			: info_container
				})
			}

			// value
			const mint = (type_section.mint)
				? type_section.mint
				: ''

			const mint_number = (type_section.mint_number)
				? type_section.mint_number
				: ''

			const type_number = (type_section.number)
				? type_section.number
				: ''

			const value_type = mint
				? mint + ' ' +type_section.catalogue +' '+ mint_number+'/'+type_number
				: +type_section.catalogue +' '+ type_number

			const type_uri	= page_globals.__WEB_ROOT_WEB__ + "/type/" + type_section.section_id
			const type_uri_text	= "<a class=\"icon_link\" href=\""+type_uri+"\"></a> "

			const label_type_node = common.create_dom_element({
				element_type	: "label",
				class_name		: "left-labels",
				inner_html		: label_type,
				parent			: info_container
			})

			const value_type_node = common.create_dom_element({
				element_type	: "a",
				class_name		: "rigth-values type_label",
				inner_html		: value_type +' '+type_uri_text,
				href 			: type_uri,
				target 			: "_blank",
				parent			: info_container
			})

			for (let i = 0; i < row.catalogue_type_mint.length; i++) {
				const catalogue = row.catalogue_type_mint[i]
				if(catalogue === page_globals.OWN_CATALOG_ACRONYM ) continue;

				const value_type_node = common.create_dom_element({
					element_type	: "span",
					class_name		: "rigth-values equivalents",
					inner_html		: catalogue+' '+row.type[i],
					parent			: info_container
				})
			}

		// obverse
			common.create_dom_element({
				element_type	: "label",
				class_name		: "left-labels",
				text_content	: tstring.obverse.toUpperCase() || "OBVERSE",
				parent			: info_container
			})

			// design_obverse
				const design_obverse = typeof type_section!=="undefined"
					? type_section.design_obverse
					: null
				if (design_obverse && design_obverse.length>0) {
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels sub-label",
						text_content	: tstring.design || "design",
						parent			: info_container
					})
					const catalog_url	= page_globals.__WEB_ROOT_WEB__+"/catalog/?item_type=design_obverse"+"&label="+design_obverse+"&value="+design_obverse;
					const prompt_label	= common.create_dom_element({
						element_type	: "a",
						class_name		: "rigth-values",
						inner_html 		: design_obverse,
						href			: catalog_url,
						parent 			: info_container
					})
				}

			// symbol_obverse
				const symbol_obverse = typeof type_section!=="undefined"
					? type_section.symbol_obverse
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
				const legend_obverse = typeof type_section!=="undefined"
					? type_section.legend_obverse
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

			// legend_obverse transcription
				const legend_obverse_transcription = typeof type_section!=="undefined"
					? type_section.legend_obverse_transcription
					: null
				if (legend_obverse_transcription && legend_obverse_transcription.length>0) {
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels sub-label",
						text_content	: tstring.transcription || "Transcription",
						parent			: info_container
					})

					const prompt_label = common.create_dom_element({
						element_type	: "span",
						class_name		: "rigth-values",
						inner_html		: legend_obverse_transcription,
						parent 			: info_container
					})
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

		// reverse
			common.create_dom_element({
				element_type	: "label",
				class_name		: "left-labels",
				text_content	: tstring.reverse.toUpperCase() || "REVERSE",
				parent			: info_container
			})

			// design_reverse
				const design_reverse = typeof type_section!=="undefined"
					? type_section.design_reverse
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
				const symbol_reverse = typeof type_section!=="undefined"
					? type_section.symbol_reverse
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
				const legend_reverse = typeof type_section!=="undefined"
					? type_section.legend_reverse
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

			// legend_reverse_transcription
				const legend_reverse_transcription = typeof type_section!=="undefined"
					? type_section.legend_reverse_transcription
					: null
				if (legend_reverse_transcription && legend_reverse_transcription.length>0) {
					common.create_dom_element({
						element_type	: "label",
						class_name		: "left-labels sub-label",
						text_content	: tstring.transcription || "Transcription",
						parent			: info_container
					})
					const prompt_label = common.create_dom_element({
						element_type	: "span",
						class_name		: "rigth-values",
						inner_html		: legend_reverse_transcription,
						parent 			: info_container
					})
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

		// measures

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

		// find type
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

		// hoard
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

		// finds
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

		// public info
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

		// uri
			const uri = row.coin_uri
			const uri_text	= '<a class="icon_link info_value" target="_blank" href="' +uri+ '"> '+ page_globals.OWN_CATALOG_ACRONYM +' </a> '
			if (row.coin_uri && row.coin_uri.length>0) {
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

						const currentUri		= row.uri[i]
						const currentUri_text	= '<a class="icon_link info_value" target="_blank" href="'+ currentUri.value+'"> '+currentUri.label +'</a> '

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

		// bibliography -- desactivada. por revisar el formato !!! ---
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
