/*global tstring, biblio_row_fields, hoards, map_factory, common, page, dedalo_logged, DocumentFragment, tstring */
/*eslint no-undef: "error"*/
/*jshint esversion: 6 */
"use strict";


var render_hoard = {


	caller  : null,


	/**
	* DRAW_HOARD
	* Render main row data (tile, body, bibliography, et.)
	*/
	draw_hoard : function(options) {

		// options
			const row = options.row

		// check row
			if (!row) {
				console.warn("Warning! draw_row row no found in options");
				return fragment;
			}

		const fragment = new DocumentFragment();

		// line
			const line = common.create_dom_element({
				element_type	: "div",
				parent			: fragment
			})

		// section_id
			if (dedalo_logged===true) {
				const link = common.create_dom_element({
					element_type	: "a",
					class_name		: "section_id go_to_dedalo",
					text_content	: row.section_id,
					href			: '/dedalo/lib/dedalo/main/?t=numisdata5&id=' + row.section_id,
					parent			: line
				})
				link.setAttribute('target', '_blank');
			}

		// name & place
			if (row.name && row.name.length>0) {

				// line
					const lineTittleWrap = common.create_dom_element({
						element_type	: "div",
						class_name		: "line-tittle-wrap",
						parent			: line
					})

				// name
					common.create_dom_element({
						element_type	: "div",
						class_name		: "line-tittle golden-color",
						text_content	: row.name,
						parent			: lineTittleWrap
					})

				// place
					if (row.place && row.place.length>0) {

						const place = "| "+row.place;
						common.create_dom_element({
							element_type	: "div",
							class_name		: "info_value",
							text_content	: place,
							parent			: lineTittleWrap
						})
					}
			}//end if (row.name && row.name.length>0)

		// total_coins
			if (row.coins && row.coins.length>0) {
				const n_coins = row.coins.length
				common.create_dom_element ({
					element_type	: 'div',
					class_name		: 'info_text_block',
					inner_html		: (tstring.total_coins || 'Total coins') + ': ' + n_coins,
					parent			: fragment
				})
			}

		// public_info
			if (row.public_info) {
				common.create_dom_element ({
					element_type	: 'div',
					class_name		: 'info_text_block',
					inner_html		: row.public_info,
					parent			: fragment
				})
			}

		// bibliography_data
			if (row.bibliography_data && row.bibliography_data.length>0) {
				//create the graphical red line that divide blocks
				const lineSeparator = common.create_dom_element({
					element_type	: "div",
					class_name		: "info_line separator",
					parent			: fragment
				})
				//create the tittle block inside a red background
				common.create_dom_element({
					element_type	: "label",
					class_name		: "big_label",
					text_content	: tstring.bibliographic_references || "Bibliographic references",
					parent			: lineSeparator
				})

				const bibliography_block = common.create_dom_element({
					element_type	: "div",
					class_name		: "info_text_block",
					parent			: fragment
				})

				const ref_biblio		= row.bibliography_data
				const ref_biblio_length	= ref_biblio.length
				for (let i = 0; i < ref_biblio_length; i++) {

					// build full ref biblio node
					const biblio_row_node = biblio_row_fields.render_row_bibliography(ref_biblio[i])

					const biblio_row_wrapper = common.create_dom_element({
						element_type	: "div",
						class_name		: "bibliographic_reference",
						parent			: bibliography_block
					})
					biblio_row_wrapper.appendChild(biblio_row_node)
				}

				page.create_expandable_block(bibliography_block, fragment);
			}

		// link
			if (row.link) {
				common.create_dom_element ({
					element_type	: 'a',
					class_name		: 'icon_link info_value',
					inner_html		: row.link,
					href			: row.link,
					target			: '_blank',
					parent			: fragment
				})
			}


		return fragment
	},//end draw_hoard



	/**
	* DRAW_MAP
	*/
	draw_map : function(options) {

		// options
			const map_data	= options.map_data
			const container	= options.container
			const self		= options.self // caller

		// short vars
			const map_position	= map_data
			const row			= self.row

		self.map = self.map || new map_factory() // creates / get existing instance of map
		self.map.init({
			map_container	: container,
			map_position	: map_position,
			popup_builder	: page.map_popup_builder,
			popup_options	: page.maps_config.popup_options,
			source_maps		: page.maps_config.source_maps,
			legend			: page.render_map_legend
		})
		// draw points
		// const map_data_clean = self.map_data(map_data) // prepares data to used in map
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
		self.map.parse_data_to_map(map_data_clean, null)
		.then(function(){
			container.classList.remove("hide_opacity")
		})


		return true
	},//end draw_map



	/**
	* DRAW_TYPES_LIST_NODE
	*/
	draw_types_list_node : function(options) {

		// options
			const response = options.response // API response

		// render data
			const types_list_node = map.render_types_list({
				global_data_item	: response.global_data_item,
				types_rows			: response.types_rows,
				coins_rows			: response.coins_rows,
				info				: response.info
			})


		return types_list_node
	},//end draw_types_list_node



	/**
	* DRAW_HOARD_OLD
	*/
		// draw_hoard_OLD : function(row) {


		// 	const fragment = new DocumentFragment();
		// 	if (!row) {
		// 		return fragment
		// 	}

		// 	// line
		// 		const line = common.create_dom_element({
		// 			element_type	: "div",
		// 			class_name		: "",
		// 			parent			: fragment
		// 		})


		// 	// section_id (dedalo users only)
		// 		if (dedalo_logged===true) {

		// 			const link = common.create_dom_element({
		// 				element_type	: "a",
		// 				class_name		: "section_id go_to_dedalo",
		// 				inner_html		: row.section_id,
		// 				href			: '/dedalo/lib/dedalo/main/?t=numisdata5&id=' + row.section_id,
		// 				parent			: line
		// 			})
		// 			link.setAttribute('target', '_blank');
		// 		}

		// 	// name
		// 		if (row.name && row.name.length>0) {

		// 			common.create_dom_element({
		// 				element_type	: "label",
		// 				class_name		: "",
		// 				inner_html		: tstring.name || "Name",
		// 				parent			: line
		// 			})

		// 			const name = row.name
		// 			common.create_dom_element({
		// 				element_type	: "span",
		// 				class_name		: "info_value",
		// 				inner_html		: name,
		// 				parent			: line
		// 			})
		// 		}

		// 	// place
		// 		if (row.place && row.place.length>0) {

		// 			common.create_dom_element({
		// 				element_type 	: "label",
		// 				class_name 		: "",
		// 				inner_html 	: tstring.place || "Place",
		// 				parent 			: line
		// 			})

		// 			const place = row.place
		// 			common.create_dom_element({
		// 				element_type	: "span",
		// 				class_name		: "info_value",
		// 				inner_html		: place,
		// 				parent			: line
		// 			})
		// 		}

		// 	// public_info
		// 		if (row.public_info && row.public_info.length>0) {

		// 			common.create_dom_element({
		// 				element_type	: "label",
		// 				inner_html		: tstring.public_info || "Public info",
		// 				parent			: line
		// 			})

		// 			const public_info = row.public_info
		// 			common.create_dom_element({
		// 				element_type	: "span",
		// 				class_name		: "info_value",
		// 				inner_html		: public_info,
		// 				parent			: line
		// 			})
		// 		}

		// 	// link
		// 		if (row.link && row.link.length>0) {

		// 			common.create_dom_element({
		// 				element_type	: "label",
		// 				inner_html		: tstring.link || "Link",
		// 				parent			: line
		// 			})

		// 			const link = row.link
		// 			common.create_dom_element({
		// 				element_type	: "span",
		// 				class_name		: "info_value",
		// 				inner_html		: link,
		// 				parent			: line
		// 			})
		// 		}

		// 	// bibliography
		// 		if (row.bibliography && row.bibliography.length>0) {

		// 			common.create_dom_element({
		// 				element_type	: "label",
		// 				class_name		: "",
		// 				inner_html		: tstring.bibliografia || "Bibliography",
		// 				parent			: line
		// 			})

		// 			const bibliography = common.clean_gaps(row.bibliography) // , splitter=" | ", joinner=", "
		// 			common.create_dom_element({
		// 				element_type	: "span",
		// 				class_name		: "info_value",
		// 				inner_html		: bibliography,
		// 				parent			: line
		// 			})
		// 		}



		// 	// row_wrapper
		// 		const row_wrapper = common.create_dom_element({
		// 			element_type	: "div",
		// 			class_name		: "row_wrapper"
		// 		})
		// 		row_wrapper.appendChild(fragment)


		// 	return row_wrapper
		// },//end draw_hoard



}//end render_hoard