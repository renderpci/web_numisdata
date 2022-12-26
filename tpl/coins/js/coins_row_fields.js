/*global tstring, page_globals, SHOW_DEBUG, item, common, page, forms, document, DocumentFragment, tstring, console, tree_factory, map_factory */
/*eslint no-undef: "error"*/
/*jshint esversion: 6 */
"use strict";



var coins_row_fields = {



	ar_rows 	: [],
	caller  	: null,
	last_type 	: null,



	draw_item : function(row) {

		const self = this

		const fragment = new DocumentFragment()

			//type
			const current_type 	= JSON.stringify(row.type_data)
			const print_type  = current_type === self.last_type
				? false
				: true

			if (row.type_data != null && print_type){

				// type_wrapper
				const type_wrapper = common.create_dom_element({
					element_type	: "div",
					class_name		: "type_wrapper",
					parent			: fragment
				})


				for (let i = 0; i < row.type_data.length; i++) {

					// type_row
					const type_row = common.create_dom_element({
						element_type	: "div",
						class_name		: "type_row",
						parent			: type_wrapper
					})


					const current_type_data 	= row.type_data[i]
					const current_type_number 	= row.type[i]
					const current_catalogue		= row.catalogue_type_mint[i]



					if(current_catalogue === page_globals.OWN_CATALOG_ACRONYM ){

						const ar_mint_number	= row.mint_number[i]
						 	? row.mint_number[i]
						 	: []

						const mint_number = ar_mint_number.join(' | ')

						const current_numismatic_number = mint_number+"/"+current_type_number

						const mint_line = common.create_dom_element({
							element_type	: "div",
							class_name		: "mint",
							parent 			: type_row
						})

						const mint_data	= row.mint_data[i]
							 ?	row.mint_data[i]
							 : 	[]
						//mints mames
						const mint	= row.mint[i]
							 ?	row.mint[i]
							 : 	[]

						// const mint_label = tstring.mint || "mint"

						// common.create_dom_element({
						// 	element_type	: "span",
						// 	inner_html  	: mint_label +': ',
						// 	class_name		: "mint_label",
						// 	parent 			: mint_line
						// })

						for (let i = 0; i < mint_data.length; i++) {
							const current_mint_id 	= mint_data[i]
							const mint_name 		= mint[i]

							const mint_uri			= page_globals.__WEB_ROOT_WEB__ + "/mint/" + current_mint_id
							const mint_uri_text		= "<a class=\"icon_link\" href=\""+mint_uri+"\"></a> "

							common.create_dom_element({
								element_type	: "a",
								inner_html  	: mint_name + mint_uri_text,
								class_name		: "mint_label",
								href 			: mint_uri,
								target 			: "_blank",
								parent 			: mint_line
							})

						}//end for mints

						const type_uri	= page_globals.__WEB_ROOT_WEB__ + "/type/" + current_type_data
						const type_uri_text	= "<a class=\"icon_link\" href=\""+type_uri+"\"></a> "

						common.create_dom_element({
							element_type	: "a",
							inner_html  	: current_catalogue +" "+ current_numismatic_number + type_uri_text,
							class_name		: "type_label",
							href 			: type_uri,
							target 			: "_blank",
							parent 			: type_row
						})

					}else{

						common.create_dom_element({
							element_type	: "div",
							inner_html  	: current_catalogue+" "+ current_type_number,
							class_name		: "type_label",
							parent 			: type_row
						})
					}//end if mib catalog


				}// end for
			} // en if




			// if (row.type != null){

			// 	const type = row.type
			// 	const type_id = JSON.parse(row.type_data[0])

			// 	const type_uri	= page_globals.__WEB_ROOT_WEB__ + "/type/" + type_id
			// 	const type_uri_text	= "<a class=\"icon_link\" href=\""+type_uri+"\"></a> "

			// 	var mint_number = ""

			// 	if (row.mint_number != null){
			// 		mint_number = row.mint_number+"/"
			// 	}

			// 	if (self.last_type == null){
			// 		common.create_dom_element({
			// 			element_type	: "a",
			// 			inner_html  	: "MIB "+ mint_number + type + type_uri_text,
			// 			class_name		: "type_label",
			// 			href 			: type_uri,
			// 			target 			: "_blank",
			// 			parent 			: type_wrapper
			// 		})
			// 	} else if (self.last_type !== type) {
			// 		common.create_dom_element({
			// 			element_type	: "a",
			// 			inner_html  	: "MIB "+ mint_number + type + type_uri_text,
			// 			class_name		: "type_label",
			// 			href 			: type_uri,
			// 			target 			: "_blank",
			// 			parent 			: type_wrapper
			// 		})
			// 	}

			// } else {
			// 	var type = "No type"
			// 	var type_uri = ""
			// 	var type_uri_text = ""

			// 	common.create_dom_element({
			// 		element_type	: "a",
			// 		inner_html  	: "MIB "+ type + type_uri_text,
			// 		class_name		: "noType_label",
			// 		href 			: type_uri,
			// 		parent 			: data_cont
			// 	})
			// }

			// //mint
			// const mint_line = common.create_dom_element({
			// 	element_type	: "div",
			// 	class_name		: "info_line",
			// 	parent 			: data_cont
			// })

			// var mint = "No mint"
			// var mint_uri = ""
			// var mint_uri_text = ""

			// if (row.mint_data[0] != null){
			// 	const mint_label = tstring.mint || "mint"
			// 	mint = mint_label + ": " +row.mint_data[0].name

			// 	const mint_id = row.mint_data[0].section_id
			// 	mint_uri	= page_globals.__WEB_ROOT_WEB__ + "/mint/" + mint_id[0]
			// 	mint_uri_text	= "<a class=\"icon_link\" href=\""+type_uri+"\"></a> "

			// }

			// common.create_dom_element({
			// 	element_type	: "a",
			// 	inner_html  	: mint + mint_uri_text,
			// 	class_name		: "ceca_label",
			// 	href 			: mint_uri,
			// 	target 			: "_blank",
			// 	parent 			: mint_line
			// })


		// wrapper
			const wrapper = common.create_dom_element({
				element_type	: "div",
				class_name		: "row_wrapper",
				parent			: fragment
			})

		//INFO BLOCK

			const data_cont = common.create_dom_element({
				element_type 	: "div",
				class_name		: "info_container",
				parent 			: wrapper
			})

		//ID
			const uri		= page_globals.__WEB_ROOT_WEB__ + "/coin/" + row.section_id
			const full_url	= page_globals.__WEB_BASE_URL__ + uri
			// const uri_text	= "<a class=\"\" target='_blank' href=\""+uri+"\">  </a> "



			// const coind_id = common.create_dom_element({
			// 	element_type	: "span",
			// 	class_name		: "mint_label",
			// 	parent 			: data_cont
			// })

			// // uri_text
			// const uri_text = common.create_dom_element({
			// 	element_type 	: "span",
			// 	class_name		: "icon_link",
			// 	href 			: uri,
			// 	parent 			: coind_id,
			// })

			common.create_dom_element({
				element_type	: "a",
				inner_html  	: "ID: "+row.section_id,
				class_name		: "mint_label icon_link_after",
				href 			: uri,
				target 			: "_blank",
				parent 			: data_cont
			})



			// Collection | former | number

			if (row.collection != null && row.collection.length>0){

				const collection_label = tstring.collection || "Collection"
				let collectionInfo = collection_label + ": " + row.collection

				if (row.former_collection && row.former_collection != null && row.former_collection.length>0){
					collectionInfo += " | "+ row.former_collection
				}
				if (row.number && row.number != null && row.number.length>0){
					collectionInfo += " | "+ row.number
				}

				common.create_dom_element({
					element_type	: "div",
					inner_html  	: collectionInfo,
					class_name		: "",
					parent 			: data_cont
				})

			}

			// Auctions
			if (row.ref_auction_group){

				for (let i = 0; i < row.ref_auction_group.length; i++) {
					const auction = row.ref_auction_group[i]

					const auction_label = []
					if (auction.name) auction_label.push(auction.name)

					if (auction.date) auction_label.push(auction.date)

					if (auction.number) auction_label.push(auction.number)

					common.create_dom_element({
						element_type	: "div",
						inner_html  	: auction_label.join(' | '),
						class_name		: "",
						parent 			: data_cont
					})
				}
			}

			//countermarks

			const contuermarks_wrapper = common.create_dom_element({
				element_type	: "div",
				class_name		: "",
				parent 			: data_cont
			})

			//countermark obverse

			if (row.countermark_obverse) {

				contuermarks_wrapper.appendChild(
					page.render_legend({
						value : row.countermark_obverse,
						style : 'median legend_reverse_box'
					})
				)

				// const item_text = common.local_to_remote_path(row.countermark_obverse)

				// common.create_dom_element({
				// 	element_type	: "span",
				// 	class_name		: "info_value",
				// 	inner_html		: item_text.trim(),
				// 	parent			: contuermarks_wrapper
				// })
			}

			//countermark reverse
			if (row.countermark_reverse) {

				contuermarks_wrapper.appendChild(
					page.render_legend({
						value : row.countermark_reverse,
						style : 'median legend_reverse_box'
					})
				)

				// const item_text = common.local_to_remote_path(row.countermark_reverse)

				// common.create_dom_element({
				// 	element_type	: "span",
				// 	class_name		: "info_value",
				// 	inner_html		: item_text.trim(),
				// 	parent			: contuermarks_wrapper
				// })
			}

			//find type
			if (row.find_type && row.find_type.length>0){

				const find_label = tstring.find_type || "Find type"

				common.create_dom_element({
					element_type	: "div",
					class_name		: "info_value find_type",
					inner_html		: find_label + ": " +row.find_type,
					parent			: data_cont
				})
			}

			//hoard
			var hoard_line = ""

			if (row.hoard && row.hoard.length>0){
				hoard_line = row.hoard
			}

			//findspot place
			if (row.findspot_place && row.findspot_place.length>0){
				hoard_line === ""
					? hoard_line = row.findspot_place
					: hoard_line += " | "+row.findspot_place
			}

			//findspot date
			if (row.find_date && row.find_date.length>0){
				hoard_line === ""
					? hoard_line = row.find_date
					: hoard_line += " | "+row.find_date
			}

			const hoard = common.create_dom_element({
				element_type	: "span",
				class_name		: "info_value hoard",
				inner_html		: hoard_line,
				parent			: data_cont
			})

			// //URI
			// const uri		= page_globals.__WEB_ROOT_WEB__ + "/coin/" + row.section_id
			// const full_url	= page_globals.__WEB_BASE_URL__ + uri
			// const uri_text	= "<a class=\"icon_link\" target='_blank' href=\""+uri+"\">  URI </a> "

			// common.create_dom_element({
			// 	element_type	: "div",
			// 	class_name		: "",
			// 	inner_html		: uri_text,
			// 	parent			: data_cont
			// })



		//IMAGE BLOCK
			let mib_type_label = ""
			// if (mint_number){
			// 	mib_type_label = "MIB " + mint_number + row.type
			// }

			const image_container = common.create_dom_element({
				element_type 	: "div",
				class_name		: "img_container",
				parent 			: wrapper
			})

			// image_obverse
			const img_link_ob = common.create_dom_element({
				element_type 	: "a",
				class_name		: "image_link",
				href 			: common.local_to_remote_path(row.image_obverse),
				parent 			: image_container,
			})

			const image_obverse = common.create_dom_element({
				element_type	: "img",
				class_name		: "image",
				src				: row.image_obverse_thumb,
				title 			: row.section_id,
				dataset 		: {caption: mib_type_label},
				loading			: 'lazy',
				parent			: img_link_ob
			})
			image_obverse.hires = row.image_obverse
			image_obverse.addEventListener("load", page.load_hires)

		// image_reverse

			const img_link_re = common.create_dom_element({
				element_type 	: "a",
				class_name		: "image_link",
				href 			: common.local_to_remote_path(row.image_reverse),
				parent 			: image_container,
			})

			const image_reverse = common.create_dom_element({
				element_type	: "img",
				class_name		: "image",
				src				: row.image_reverse_thumb,
				title 			: row.section_id,
				dataset 		: {caption: mib_type_label},
				loading			: 'lazy',
				parent			: img_link_re
			})

			image_reverse.hires = row.image_reverse
			image_reverse.addEventListener("load", page.load_hires)


			//IMAGE GALLERY CAPTIONS
			if (row.collection && row.collection.length>0){
				const collection_former = (row.former_collection && row.former_collection.length>0)
					? row.collection + " ("+row.former_collection+")"
					: row.collection

				const collection_label = (row.number && row.number.length>0)
					? collection_former+ " "+ row.number
					: collection_former

				//put gallery attributes to img
				image_obverse.setAttribute("data-caption",collection_label)
				image_reverse.setAttribute("data-caption",collection_label)
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
					image_reverse.setAttribute("data-caption",auctionGalleryAttributes)
				}
			}

			if(row.image_obverse_data[0] && row.image_obverse_data[0].photographer){
				const currentAttr = image_obverse.getAttribute("data-caption")
				image_obverse.setAttribute("data-caption", currentAttr + '<spam> | </spam> <i class="fa fa-camera"></i> ' + row.image_obverse_data[0].photographer)
			}
			//END IMAGE GALLERY CAPTIONS

			page.activate_images_gallery(image_container)


		self.last_type = JSON.stringify(row.type_data)

		return fragment
	}//end draw_item




}//end coins_row_fields
