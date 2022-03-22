/*global page_globals, common, DocumentFragment, map_factory, tstring, page, hoards */
/*eslint no-undef: "error"*/
/*jshint esversion: 6 */
"use strict";



var render_hoards = {



	ar_rows	: [],
	caller	: null,



	draw_item : function(row) {

		const fragment = new DocumentFragment()

		// wrapper
			const wrapper = common.create_dom_element({
				element_type	: "div",
				class_name		: "row_wrapper",
				parent			: fragment
			})


		if (row.name !== null && row.name.length>0){

			// map_wrapper
				const map_wrapper = common.create_dom_element({
					element_type 	: "div",
					class_name		: "map_wrapper hide_opacity",
					parent 			: wrapper
				})
				if (row.map) {
					// set node only when it is in DOM (to save browser resources)
						const observer = new IntersectionObserver(function(entries) {
							const entry = entries[1] || entries[0]
							if (entry.isIntersecting===true || entry.intersectionRatio > 0) {
								observer.disconnect();

								// create a full map
								const map_position	= row.map
								const container		= map_wrapper // document.getElementById("map_container")

								const map = new map_factory() // creates / get existing instance of map
								map.init({
									map_container		: map_wrapper,
									map_position		: map_position,
									popup_builder		: page.map_popup_builder,
									popup_options		: page.maps_config.popup_options,
									source_maps			: page.maps_config.source_maps,
									add_layer_control	: false // removes layer selector button
								})
								// draw points
									let map_data_clean
									if (row.georef_geojson) {
										// from geojson
										const popup_data = {
											section_id	: row.section_id,
											title		: row.name,
											description	: row.public_info.trim(),
											type		: row.table==='findspots'
												? 'findspot'
												: 'hoard'
										}
										map_data_clean = hoards.map_data_geojson(row.georef_geojson, popup_data)
									}else{
										// from single map point
										map_data_clean = hoards.map_data_point(row.map, row.name)
									}

								map.parse_data_to_map(map_data_clean, null)
								.then(function(){
									container.classList.remove("hide_opacity")
								})
							}
						}, { threshold: [0] });
						observer.observe(map_wrapper);
				}

			// info_wrap
				const info_wrap = common.create_dom_element({
					element_type 	: "div",
					class_name		: "info_wrap",
					parent 			: wrapper
				})


			// title_wrap
				const title_wrap = common.create_dom_element({
					element_type	: "div",
					class_name		: "title_wrap",
					parent			: info_wrap
				})

				// name
					const target_path = row.table==='findspots'
						? 'findspot'
						: 'hoard'
					const hoard_uri = page_globals.__WEB_ROOT_WEB__ + '/'+target_path+'/' + row.section_id
					// const hoard_uri_text	='<a class="icon_link" href="'+hoard_uri+'"></a>'
					const hoard_uri_text ='<span class="icon_link"></span>'
					common.create_dom_element ({
						element_type	: "a",
						href			: hoard_uri,
						inner_html		: row.name + hoard_uri_text,
						class_name		: 'name',
						target			: '_blank',
						parent			: title_wrap
					})

				// place
					const place = row.place || ''
					common.create_dom_element ({
						element_type	: 'div',
						class_name		: 'label',
						inner_html		: place,
						parent			: title_wrap
					})

			// info_text_wrap
				const info_text_wrap = common.create_dom_element({
					element_type 	: "div",
					class_name		: "info_text_wrap",
					parent 			: info_wrap
				})

				// total_coins
					if (row.coins && row.coins.length>0) {
						const n_coins = row.coins.length
						common.create_dom_element ({
							element_type	: 'span',
							class_name		: '',
							inner_html		: (tstring.total_coins || 'Total coins') + ': ' + n_coins,
							parent			: info_text_wrap
						})
					}

				// public_info
					// const public_info = row.public_info || ""
					// common.create_dom_element ({
					// 	element_type	: "span",
					// 	inner_html		: public_info,
					// 	class_name		: "",
					// 	parent			: info_text_wrap
					// })

				// link
					// const link = row.link || ''
					// common.create_dom_element ({
					// 	element_type	: 'a',
					// 	href			: link,
					// 	inner_html		: link,
					// 	class_name		: '',
					// 	target			: '_blank',
					// 	parent			: info_text_wrap
					// })
		}


		return fragment
	}//end draw_item



}//end coins_row_fields
