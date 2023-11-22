/*global tstring, page_globals, common, page*/
/*eslint no-undef: "error"*/

"use strict";

/**
* COMMON DATA PARSERS
* prototypes page
*/



/**
* PARSE_TYPE_DATA
* @param object row | array rows
* @return object row | array rows
*/
page.parse_type_data = function(data) {

	const self = this

	// array case
		if (Array.isArray(data)) {
			const new_data = []
			for (let i = 0; i < data.length; i++) {
				new_data.push( self.parse_type_data(data[i]) )
			}
			return new_data
		}

	const row = data

	if (typeof row !== 'object') {
		console.log("parse_type_data row:",row);
		console.trace()
	}

	if (row.parsed) {
		return row
	}

	try {

		// images url
			row.ref_coins_image_obverse = typeof data.ref_coins_image_obverse!=="undefined"
				? common.local_to_remote_path(data.ref_coins_image_obverse)
				: page.default_image
			row.ref_coins_image_reverse = typeof data.ref_coins_image_reverse!=="undefined"
				? common.local_to_remote_path(data.ref_coins_image_reverse)
				: page.default_image

		// ref_coins_union (resolved portal case)
			if (row.ref_coins_union && Array.isArray(row.ref_coins_union)) {

				// parse portal resolved rows
				row.ref_coins_union = page.parse_coin_data(row.ref_coins_union)

			}else{

				row.ref_coins_union = row.ref_coins_union
					? JSON.parse(row.ref_coins_union)
					: null
			}

		// coin_references (resolved portal case)
			if (row.coin_references && Array.isArray(row.coin_references)) {

				// parse portal resolved rows
				row.coin_references = page.parse_coin_data(row.coin_references)

			}else{

				row.coin_references = row.coin_references
					? JSON.parse(row.coin_references)
					: null
			}

		row.uri = self.parse_iri_data(row.uri)

		// json encoded
		// row.dd_relations			= JSON.parse(row.dd_relations)
		// row.collection_data		= JSON.parse(row.collection_data)
		// row.image_obverse_data	= JSON.parse(row.image_obverse_data)
		// row.image_reverse_data	= JSON.parse(row.image_reverse_data)
		// row.type_data			= JSON.parse(row.type_data)

		// legend text includes svg url
			row.legend_obverse = row.legend_obverse
				? self.parse_legend_svg(row.legend_obverse)
				: null
			row.legend_reverse = row.legend_reverse
				? self.parse_legend_svg(row.legend_reverse)
				: null

			row.material = row.material
				? page.trim_char( page.remove_gaps(row.material, ' | '), '|')
				: null

			row.symbol_obverse = row.symbol_obverse
				? self.parse_legend_svg(row.symbol_obverse)
				: null
			row.symbol_reverse = row.symbol_reverse
				? self.parse_legend_svg(row.symbol_reverse)
				: null

			row.symbol_obverse_data = JSON.parse(row.symbol_obverse_data)
			row.symbol_reverse_data = JSON.parse(row.symbol_reverse_data)

		// permanent uri
			// row.permanent_uri = page_globals.__WEB_BASE_URL__ + page_globals.__WEB_ROOT_WEB__ + "/coin/" + row.section_id

		row.term_data = row.term_data
			? JSON.parse(row.term_data)
			: null

		row.term_section_tipo = row.term_section_tipo
			? JSON.parse(row.term_section_tipo)
			: null

		row.term_section_label = row.term_section_label
			? JSON.parse(row.term_section_label)
			: null


		row.parsed = true

	} catch (error) {
		console.error("ERROR CATCH " , error);
		console.warn("row:",row);
	}

	return row
}//end parse_type_data



/**
* PARSE_MINT_DATA
*/
page.parse_mint_data = function(data) {

	const self = this

	// array case
		if (Array.isArray(data)) {
			const new_data = []
			for (let i = 0; i < data.length; i++) {
				new_data.push( page.parse_mint_data(data[i]) )
			}
			return new_data
		}

	const row = data

	if (typeof row !== 'object') {
		console.log("parse_mint_data row:",row);
		console.trace()
	}

	if (!row || row.parsed) {
		return row
	}

	row.georef_geojson = row.georef_geojson
		? JSON.parse(row.georef_geojson)
		: null

	row.map = row.map
		? JSON.parse(row.map)
		: null

	row.place_data = row.place_data
		? JSON.parse(row.place_data)
		: null

	row.uri = self.parse_iri_data(row.uri)

	row.relations_coins = (row.relations_coins)
		? JSON.parse(row.relations_coins)
		: null


	row.relations_types = (row.relations_types)
		? JSON.parse(row.relations_types)
		: null


	return row
}//end parse_mint_data



/**
* PARSE_HOARD_DATA
*	Parse hoards and founds data
* @param array rows
* @return array rows
*/
page.parse_hoard_data = function(data) {

	if (!Array.isArray(data)) {
		data = [data]
	}

	const parsed_data = []

	try {

		if(!data) {
			return data
		}

		for (let i = 0; i < data.length; i++) {

			const row = data[i]

			if (row.parsed===true) {
				parsed_data.push(row)
				continue;
			}

			row.map = row.map
				? JSON.parse(row.map)
				: null

			row.coins = row.coins
				? JSON.parse(row.coins)
				: null

			row.types = row.types
				? JSON.parse(row.types)
				: null

			row.georef_geojson = row.georef_geojson
				? JSON.parse(row.georef_geojson)
				: null


			row.parsed = true

			parsed_data.push(row)
		}//end for (let i = 0; i < data.length; i++)


	} catch (error) {
		console.error("ERROR CATCH " , error);
		console.warn("data:", data);
	}


	return parsed_data
};//end parse_hoard_data



/**
* PARSE_COIN_DATA
* @param object row | array rows
* @return object row | array rows
*/
page.parse_coin_data = function(data) {
	// console.log("------------> parse_coin_data data:",data);

	const self = this

	// array case
		if (Array.isArray(data)) {
			const new_data = []
			for (let i = 0; i < data.length; i++) {
				new_data.push( page.parse_coin_data(data[i]) )
			}
			return new_data
		}

	const row = data

	if (typeof row !== 'object') {
		console.log("parse_coin_data row:",row);
		console.trace()
	}

	if (!row || row.parsed) {
		return row
	}

	try {

		// url
			row.image_obverse		= row.image_obverse
				? common.local_to_remote_path(data.image_obverse)
				: page.default_image
			row.image_obverse_thumb	= row.image_obverse
				? row.image_obverse.replace('/1.5MB/','/thumb/')
				: page.default_image
			row.image_reverse		= row.image_reverse
				? common.local_to_remote_path(data.image_reverse)
				: page.default_image
			row.image_reverse_thumb	= row.image_reverse
				? row.image_reverse.replace('/1.5MB/','/thumb/')
				: page.default_image

		// type_data
		if (row.type_data && Array.isArray(row.type_data)) {

			// case resolved portal
			row.type_data = self.parse_type_data(row.type_data)

		}else{

			row.type_data = row.type_data
				? JSON.parse(row.type_data)
				: null

			row.type_section_id = row.type_data && typeof row.type_data[0]!=="undefined"
				? row.type_data[0]
				: null
		}

		const separator		= " | "

		// type
		row.type = row.type
			? page.split_data(row.type, separator)
			: null


		// mint data
		const mint_data		= row.mint_data
			? page.split_data(row.mint_data, separator) // format is '["1"] | ["2"]'
			: []

			const ar_mints_data = []
			for (let i = 0; i < mint_data.length; i++) {
				ar_mints_data.push(JSON.parse(mint_data[i]))
			}
			row.mint_data = ar_mints_data
				? ar_mints_data
				: null

		// mint number
		const mint_number = row.mint_number
			? page.split_data(row.mint_number, separator)
			: []

			const ar_mints_number = []
			for (let i = 0; i < mint_number.length; i++) {
				ar_mints_number.push(JSON.parse(mint_number[i]))
			}

			row.mint_number = ar_mints_number
				? ar_mints_number
				: null
		// mint
		const mints = row.mint
			? page.split_data(row.mint, separator)
			: []

			const ar_mints = []
			for (let i = 0; i < mints.length; i++) {
				if (mints[i]) {
					// console.log("mints[i]:",mints[i], row.section_id);
					const current_mints = (mints[i].indexOf('["')===0)
						? JSON.parse(mints[i])
						: mints[i]
					// const current_mints = JSON.parse(mints[i])
					if (current_mints) {
						ar_mints.push(current_mints)
					}
				}
			}

			row.mint = ar_mints
				? ar_mints
				: null


		// catalogue_type_mint
		row.catalogue_type_mint = row.catalogue_type_mint
			? row.catalogue_type_mint.indexOf('["')===0
				? JSON.parse(row.catalogue_type_mint)
				: row.catalogue_type_mint
			: null


		// legend text includes svg url
		row.legend_obverse = row.legend_obverse
			? self.parse_legend_svg(row.legend_obverse)
			: null
		row.legend_reverse = row.legend_reverse
			? self.parse_legend_svg(row.legend_reverse)
			: null

		// countermark text includes svg url
		row.countermark_obverse = row.countermark_obverse
			? self.parse_legend_svg(row.countermark_obverse)
			: null
		row.countermark_reverse = row.countermark_reverse
			? self.parse_legend_svg(row.countermark_reverse)
			: null

		// auction
			row.ref_auction = row.ref_auction
				? JSON.parse(row.ref_auction)
				: null
			row.ref_auction_date = row.ref_auction_date
				? JSON.parse(row.ref_auction_date)
				: null
			row.ref_auction_number = row.ref_auction_number
				? JSON.parse(row.ref_auction_number)
				: null

			row.ref_auction_group = null

			if (row.ref_auction && row.ref_auction.length>0) {
				row.ref_auction_group = []
				for (let g = 0; g < row.ref_auction.length; g++) {
					row.ref_auction_group.push({
						name	: row.ref_auction && typeof row.ref_auction[g]!=="undefined"
							? row.ref_auction[g]
							: '',
						date	: row.ref_auction_date && typeof row.ref_auction_date[g]!=="undefined"
							? self.parse_date(row.ref_auction_date[g])
							: '',
						number	: row.ref_auction_number && typeof row.ref_auction_number[g]!=="undefined"
							? row.ref_auction_number[g]
							: ''
					})
				}
			}

		// related_auction
			row.ref_related_coin_auction = row.ref_related_coin_auction
				? JSON.parse(row.ref_related_coin_auction)
				: null
			row.ref_related_coin_auction_date = row.ref_related_coin_auction_date
				? JSON.parse(row.ref_related_coin_auction_date)
				: null
			row.ref_related_coin_auction_number = row.ref_related_coin_auction_number
				? JSON.parse(row.ref_related_coin_auction_number)
				: null

			row.ref_related_coin_auction_group = null

			if (row.ref_related_coin_auction && row.ref_related_coin_auction.length>0) {
				row.ref_related_coin_auction_group = []
				for (let g = 0; g < row.ref_related_coin_auction.length; g++) {
					row.ref_related_coin_auction_group.push({
						name	: row.ref_related_coin_auction && typeof row.ref_related_coin_auction[g]!=="undefined"
							? row.ref_related_coin_auction[g]
							: '',
						date	: row.ref_related_coin_auction_date && typeof row.ref_related_coin_auction_date[g]!=="undefined"
							? self.parse_date(row.ref_related_coin_auction_date[g])
							: '',
						number	: row.ref_related_coin_auction_number && typeof row.ref_related_coin_auction_number[g]!=="undefined"
							? row.ref_related_coin_auction_number[g]
							: ''
					})
				}
			}


		// find
		row.find_date = self.parse_date(row.find_date)

		row.coin_uri = page_globals.__WEB_ROOT_WEB__ + "/coin/" + row.section_id

		row.uri = self.parse_iri_data(row.uri)


		// bibliography (portal resolved case)
			if (row.bibliography_data && Array.isArray(row.bibliography_data) ) {
				row.bibliography = page.parse_publication(row.bibliography_data)
			}

		row.parsed = true

	} catch (error) {
		console.error("ERROR CATCH " , error);
		console.warn("row:",row);
	}


	return row
}//end parse_coin_data



/**
* PARSE_CATALOG_DATA
* @param object row | array rows
* @return object row | array rows
*/
page.parse_catalog_data = function(data) {

	const self = this

	if (!data) {
		return []
	}

	if (!Array.isArray(data)) {
		data = [data]
	}

	const new_data = []

	try {

		const data_length = data.length
		for (let i = 0; i < data_length; i++) {
			// const row = JSON.parse( JSON.stringify(data[i]) )
			const row = data[i]

			if (row.parsed) {
				continue;
			}

			row.coins_data_union = row.coins_data_union
				? JSON.parse(row.coins_data_union)
				: null

			row.coin_references = row.coin_references
				? JSON.parse(row.coin_references)
				: null

			// url coins_image
				row.ref_coins_image_obverse = row.ref_coins_image_obverse
					? common.local_to_remote_path(row.ref_coins_image_obverse)
					: page.default_image
				row.ref_coins_image_reverse = row.ref_coins_image_reverse
					? common.local_to_remote_path(row.ref_coins_image_reverse)
					: page.default_image

			// url thumbs
				row.ref_coins_image_obverse_thumb = row.ref_coins_image_obverse
					? row.ref_coins_image_obverse.replace('/1.5MB/', '/thumb/')
					: page.default_image
				row.ref_coins_image_reverse_thumb = row.ref_coins_image_reverse
					? row.ref_coins_image_reverse.replace('/1.5MB/', '/thumb/')
					: page.default_image

			// legends
				row.ref_type_legend_obverse = row.ref_type_legend_obverse
					? self.parse_legend_svg(row.ref_type_legend_obverse)
					: null
				row.ref_type_legend_reverse = row.ref_type_legend_reverse
					? self.parse_legend_svg(row.ref_type_legend_reverse)
					: null
				// symbols
				row.ref_type_symbol_obverse = row.ref_type_symbol_obverse
					? self.parse_legend_svg(row.ref_type_symbol_obverse)
					: null
				row.ref_type_symbol_reverse = row.ref_type_symbol_reverse
					? self.parse_legend_svg(row.ref_type_symbol_reverse)
					: null
			
			if (IsJson(row.term_data)){
				row.term_data = JSON.parse(row.term_data)
			}

			function IsJson(argument) {
				try {
					JSON.parse(argument)
				} catch (e) {
					return false
				}
				return true
			}
			
			row.term_section_id	= row.term_data ? row.term_data[0] : null
			row.children		= row.children ? JSON.parse(row.children) : null
			row.parent			= row.parent
				? (
					Array.isArray(row.parent)
						? (function(parent_array){
							// portal resolved case
							return page.parse_catalog_data(parent_array)
						})(row.parent)
						: JSON.parse(row.parent)
				)
				: null
			row.ref_type_averages_diameter = row.ref_type_averages_diameter
				? parseFloat( row.ref_type_averages_diameter.replace(',', '.') )
				: null
			row.ref_type_total_diameter_items = row.ref_type_total_diameter_items
				? parseFloat( row.ref_type_total_diameter_items.replace(',', '.') )
				: null

			row.ref_type_averages_weight = row.ref_type_averages_weight
				? parseFloat( row.ref_type_averages_weight.replace(',', '.') )
				: null

			row.ref_type_total_weight_items = row.ref_type_total_weight_items
				? parseFloat( row.ref_type_total_weight_items.replace(',', '.') )
				: null

			row.ref_type_material = page.trim_char(row.ref_type_material, '|')

			// replace bad separators ' - ' to ' | '
			row.ref_type_design_obverse_iconography = row.ref_type_design_obverse_iconography
				? row.ref_type_design_obverse_iconography.replace(' - ',' | ')
				: null
			// replace bad separators ' - ' to ' | '
			row.ref_type_design_reverse_iconography = row.ref_type_design_reverse_iconography
				? row.ref_type_design_reverse_iconography.replace(' - ',' | ')
				: null

			//
			/*

				row.ref_coins_collection_data = row.ref_coins_collection_data
					? JSON.parse(row.ref_coins_collection_data)
					: null

				row.ref_coins_image_obverse_data = row.ref_coins_image_obverse_data
					? JSON.parse(row.ref_coins_image_obverse_data)
					: null

				row.ref_coins_image_reverse_data = row.ref_coins_image_reverse_data
					? JSON.parse(row.ref_coins_image_reverse_data)
					: null
			*/
				row.ref_type_denomination_data = row.ref_type_denomination_data
					? JSON.parse(row.ref_type_denomination_data)
					: null
			/*
				row.ref_type_design_obverse_data = row.ref_type_design_obverse_data
					? JSON.parse(row.ref_type_design_obverse_data)
					: null

				row.ref_type_design_reverse_data = row.ref_type_design_reverse_data
					? JSON.parse(row.ref_type_design_reverse_data)
					: null

			  //   row.ref_type_equivalents = row.ref_type_equivalents
					// ? JSON.parse(row.ref_type_equivalents)
					// : null

				row.ref_type_equivalents_data = row.ref_type_equivalents_data
					? JSON.parse(row.ref_type_equivalents_data)
					: null

				row.ref_type_legend_obverse = row.ref_type_legend_obverse
					? JSON.parse(row.ref_type_legend_obverse)
					: null

				row.ref_type_legend_obverse_data = row.ref_type_legend_obverse_data
					? JSON.parse(row.ref_type_legend_obverse_data)
					: null

				row.ref_type_legend_reverse_data = row.ref_type_legend_reverse_data
					? JSON.parse(row.ref_type_legend_reverse_data)
					: null

				row.ref_type_legend_transcription_obverse = row.ref_type_legend_transcription_obverse
					? JSON.parse(row.ref_type_legend_transcription_obverse)
					: null

				// row.ref_type_legend_transcription_reverse = row.ref_type_legend_transcription_reverse
				// 	? JSON.parse(row.ref_type_legend_transcription_reverse)
				// 	: null

				row.ref_type_material_data = row.ref_type_material_data
					? JSON.parse(row.ref_type_material_data)
					: null

				row.ref_type_people_data = row.ref_type_people_data
					? JSON.parse(row.ref_type_people_data)
					: null

				row.ref_type_people_role_data = row.ref_type_people_role_data
					? JSON.parse(row.ref_type_people_role_data)
					: null

				row.ref_type_symbol_obverse_data = row.ref_type_symbol_obverse_data
					? JSON.parse(row.ref_type_symbol_obverse_data)
					: null

				// row.coins_data = row.coins_data
				// 	? JSON.parse(row.coins_data)
				// 	: null

				row.p_creator = row.p_creator
					? JSON.parse(row.p_creator)
					: null
				*/
				//
	
			row.term_section_label = row.term_section_label
				? JSON.parse(row.term_section_label)
				: null

			row.term_section_tipo = row.term_section_tipo
				? JSON.parse(row.term_section_tipo)
				: null

			row.p_mint = row.p_mint
				? JSON.parse(row.p_mint)
				: null

			row.p_period = row.p_period
				? JSON.parse(row.p_period)
				: null

			row.p_territory = row.p_territory
				? JSON.parse(row.p_territory)
				: null
			
			row.parents = row.parents
				? (
					IsJson(row.parents)
						? JSON.parse(row.parents)
						: row.parents
				)
				: null
			
			row.parents_text = row.parents_text
				? JSON.parse(row.parents_text)
				: null

			row.p_culture = row.p_culture
				? JSON.parse(row.p_culture)
				: null

			// Aggregated (in an array) values for all coins in a type
			row.full_coins_reference_diameter_max = row.full_coins_reference_diameter_max
				? JSON.parse(row.full_coins_reference_diameter_max)
				: null
			row.full_coins_reference_diameter_min = row.full_coins_reference_diameter_min
				? JSON.parse(row.full_coins_reference_diameter_min)
				: null
			row.full_coins_reference_weight = row.full_coins_reference_weight
				? JSON.parse(row.full_coins_reference_weight)
				: null
			row.full_coins_reference_calculable = row.full_coins_reference_calculable
				? JSON.parse(row.full_coins_reference_calculable)
				: null
			row.full_coins_reference_axis = row.full_coins_reference_axis
				? JSON.parse(row.full_coins_reference_axis)
				: null
				
			new_data.push(row)
		}


		// add calculated measures values to types parents
			for (let i = 0; i < data_length; i++) {

				const row = new_data[i]

				if (!row.parsed && row.term_table==='types' && row.children) {
					const ar_mesures_diameter	= []
					const ar_mesures_weight		= []

					for (let i = 0; i < row.children.length; i++) {

						const current_child	= row.children[i]
						const child_row		= data.find(el => el.section_id==current_child)

						if(child_row && child_row.ref_type_averages_weight){
							// get the total items
							const weight_items = child_row.ref_type_total_weight_items
							//create a new array with all items - values
							const ar_current_mesures_weight = new Array(weight_items).fill(child_row.ref_type_averages_weight)
							// add the current child values to the total array
							ar_mesures_weight.push(...ar_current_mesures_weight)
						}
						if(child_row && child_row.ref_type_averages_diameter){
							const diameter_items = child_row.ref_type_total_diameter_items
							const ar_current_mesures_diameter = new Array(diameter_items).fill(child_row.ref_type_averages_diameter)
							ar_mesures_diameter.push(...ar_current_mesures_diameter)

						}
					}

					const media_weight		= ar_mesures_weight.reduce((a,b) => a + b, 0)  / ar_mesures_weight.length
					const media_diameter	= ar_mesures_diameter.reduce((a,b) => a + b, 0) / ar_mesures_diameter.length

					row.ref_type_averages_weight    = media_weight
					row.ref_type_averages_diameter	= media_diameter

					row.ref_type_total_weight_items		= ar_mesures_weight.length
					row.ref_type_total_diameter_items	= ar_mesures_diameter.length
				}

				row.parsed = true
			}

		// console.log("parse_catalog_data new_data:",new_data);

	} catch (error) {
		console.error("ERROR CATCH " , error);
		console.warn("new_data:",new_data);
	}
	// console.log("new_data:",new_data);


	return new_data
}//end parse_catalog_data



/**
* PARSE_PUBLICATION
* Modify the received data by recombining publication information
* @return array parsed_data
*/
page.parse_publication = function(data) {

	const parsed_data = []

	try {

		if(!data) {
			return data
		}

		const separator		= " # ";
		const data_length	= data.length
		for (let i = 0; i < data_length; i++) {

			const reference = data[i]

			if (reference.parsed) {
				continue;
			}

			// add publications property to store all resolved references
				reference._publications = []

			const publications_data			= reference.publications_data
				? JSON.parse(reference.publications_data)
				: []
			const publications_data_length	= publications_data.length
			if (publications_data_length>0) {

				const ref_publications_authors	= page.split_data(reference.ref_publications_authors, separator)
				const ref_publications_date		= page.split_data(reference.ref_publications_date, separator)
				const ref_publications_editor	= page.split_data(reference.ref_publications_editor, separator)
				const ref_publications_magazine	= page.split_data(reference.ref_publications_magazine, separator)
				const ref_publications_place	= page.split_data(reference.ref_publications_place, separator)
				const ref_publications_title	= page.split_data(reference.ref_publications_title, separator)
				const ref_publications_url		= page.split_data(reference.ref_publications_url, separator)

				for (let j = 0; j < publications_data_length; j++) {

					const section_id = publications_data[j]

					const parsed_item = {
						reference	: reference.section_id,
						section_id	: section_id,
						authors		: ref_publications_authors[j] || null,
						date		: ref_publications_date[j] || null,
						editor		: ref_publications_editor[j] || null,
						magazine	: ref_publications_magazine[j] || null,
						place		: ref_publications_place[j] || null,
						title		: ref_publications_title[j] || null,
						url			: ref_publications_url[j] || null
					}

					reference._publications.push(parsed_item)
					parsed_data.push(parsed_item)
				}
			}

			reference.parsed = true
		}
		// console.log("parsed_data:",parsed_data);

	} catch (error) {
		console.error("ERROR CATCH " , error);
		console.warn("data:", data);
	}

	return parsed_data
}//end parse_publication



/**
* PARSE_MAP_GLOBAL_DATA
* @param object row | array rows
* @return object row | array rows
*/
	// page.parse_map_global_data = function(ar_rows) {

	// 	const self = this

	// 	const ar_rows_length = ar_rows.length
	// 	for (let i = 0; i < ar_rows_length; i++) {

	// 		const row = ar_rows[i]

	// 		if (row.parsed) {
	// 			continue;
	// 		}

	// 		row.georef_geojson = row.georef_geojson
	// 			? JSON.parse(row.georef_geojson)
	// 			: null

	// 		row.coins_list = row.coins_list
	// 			? JSON.parse(row.coins_list)
	// 			: null

	// 		row.types_list = row.types_list
	// 			? JSON.parse(row.types_list)
	// 			: null

	// 		row.parsed = true
	// 	}


	// 	return ar_rows
	// }//end parse_map_global_data



/**
* parse_map_global_data
* @param object row | array rows
* @return object row | array rows
*/
page.parse_map_global_data = function(ar_rows) {

	const self = this

	try {

		const ar_rows_length = ar_rows.length
		for (let i = 0; i < ar_rows_length; i++) {

			const row = ar_rows[i]

			if (row.parsed) {
				continue;
			}

			row.georef_geojson = row.georef_geojson
				? JSON.parse(row.georef_geojson)
				: null

			row.coins_list = row.coins_list
				? JSON.parse(row.coins_list)
				: []

			row.types_list = row.types_list
				? JSON.parse(row.types_list)
				: []

			if ((row.georef_geojson && row.georef_geojson.length>0)  ) {

				const name = (function(table ) {
					let name
					switch(table){
						case 'mints'	: name = 'mint';		break;
						case 'hoards'	: name = 'hoard';		break;
						case 'findspots': name = 'findspot';	break;
					}
					return name
				})(row.table);

				const coins_list_total = row.coins_list ? row.coins_list.length : 0;
				const types_list_total = row.types_list ? row.types_list.length : 0;

				const title = '<span class="note">'+(tstring[name] || name)+'</span> ' + row.name
				// const description = (tstring.coins || 'Coins') + ': ' + coins_list_total +'<br>'+ (tstring.types || 'Types') + ': ' + types_list_total
				const description = (tstring.coins || 'Coins') + ': ' + coins_list_total

				const item_data = {
					section_id			: row.section_id,
					title				: title,
					coins_total			: coins_list_total,
					types_total			: types_list_total,
					description			: description,
					// usefull properties
					ref_section_id		: row.ref_section_id,
					ref_section_tipo	: row.ref_section_tipo,
					table				: row.table,
					name				: row.name,
					term_id				: row.section_id
				}

				const marker_icon = page.maps_config.markers[name];

				// nomalized item format to use it in leaflet and popup
				const item = {
					lat			: null,
					lon			: null,
					geojson		: row.georef_geojson,
					marker_icon	: marker_icon,
					data		: item_data
				}

				row.item = item
			}else{
				row.item = null
			}

			row.parsed = true
		}

	} catch (error) {
		console.error("ERROR CATCH " , error);
		console.warn("ar_rows:",ar_rows);
	}


	return ar_rows
}//end parse_map_global_data



/**
* PARSE_IRI_DATA
* @return
*/
page.parse_iri_data = function(data) {

	const items = []

	if (!data || data.length<1) {
		return items
	}

	const values = data.split(" | ")
	for (let i = 0; i < values.length; i++) {

		const val	= values[i]
		const parts	= val.split(", ")
		if (parts.length>1 && typeof parts[1]==="undefined") {
			continue;
		}

		const url	= (parts.length===1) ? parts[0] : parts[1]
		let source	= (parts.length===1) ? '' : parts[0]
		if (source.length<1) {
			try {
				const _url = new URL(url)
				source = _url.hostname
			}catch (error) {
				console.log("url:",url);
				console.warn(error);
			}
		}
		items.push({
			label : source,
			value : url
		})
	}

	return items
}//end parse_iri_data



/**
* PARSE_TS_WEB
* @return
*/
page.parse_ts_web = function(rows) {

	if (!Array.isArray(rows)) {
		rows = [rows]
	}

	for (let i = 0; i < rows.length; i++) {

		const row = rows[i]

		if (row.parsed===true) continue;

		// fix link paths to aboslute paths
			row.cuerpo = row.cuerpo
				? row.cuerpo.replaceAll('../../../media', page_globals.__WEB_MEDIA_BASE_URL__ + '/dedalo/media')
				: null

			row.entradilla = row.entradilla
				? row.entradilla.replaceAll('../../../media', page_globals.__WEB_MEDIA_BASE_URL__ + '/dedalo/media')
				: null

		row.parsed = true
	}


	return rows
};//end parse_ts_web



/**
* PARSE_TREE_DATA
* Parse rows data to use in tree_factory (thesaurus tables)
* Table ts_thematic, ts_technique, ts_onomastic, ts_material
*/
page.parse_tree_data = function(ar_rows, hilite_terms) {

	const data = []

	// sample
		// children: "[{"type":"dd48","section_id":"2","section_tipo":"technique1","from_component_tipo":"hierarchy49"},{"type":"dd48","section_id":"3","section_tipo":"technique1","from_component_tipo":"hierarchy49"}]"
		// code: "1191026"
		// dd_relations: null
		// descriptor: "yes"
		// illustration: null
		// indexation: null
		// model: null
		// norder: "0"
		// parent: "["hierarchy1_273"]"
		// related: ""
		// scope_note: "En el presente Tesauro el empleo del término es más restrictivo, ya que se aplica a los procedimientos técnicos empleados en la elaboración de bienes culturales."
		// section_id: "1"
		// space: "{"alt":16,"lat":"39.462571","lon":"-0.376295","zoom":12}"
		// table: "ts_technique,ts_material"
		// term: "Técnica"
		// term_id: "technique1_1"
		// time: null
		// tld: "technique1"

	const ar_parse = ['parent','children','space','mib_bibliography','term_data'] //
	function decode_field(field) {
		if (field) {
			return JSON.parse(field)
		}
		return null;
	}
	function parse_item(item){
		for (let i = ar_parse.length - 1; i >= 0; i--) {
			const name = ar_parse[i]
			item[name] = decode_field(item[name])
		}

		return item
	}

	const ar_rows_length = ar_rows.length
	for (let i = 0; i < ar_rows_length; i++) {

		// parse json encoded strings
			const item = parse_item(ar_rows[i])

		// resolve relations images url
			// if (item.relations && item.relations.length>0) {
			// 	for (let j = item.relations.length - 1; j >= 0; j--) {

			// 		item.relations[j].image_url = item.relations[j].image
			// 			? common.get_media_engine_url(item.relations[j].image, 'image')
			// 			: __WEB_TEMPLATE_WEB__ + '/assets/images/default.jpg'

			// 		item.relations[j].thumb_url = item.relations[j].image
			// 			? common.get_media_engine_url(item.relations[j].image, 'image', 'thumb')
			// 			: __WEB_TEMPLATE_WEB__ + '/assets/images/default.jpg'

			// 		item.relations[j].path = page.section_tipo_to_template(item.relations[j].section_tipo)
			// 	}
			// }

		// children unification format. Object to term_id.
		// From locator like '[{section_tipo:oh1,section_id:1}]' to 'oh1_1'
			if (item.children) {
				const current_ar_children = []
				const children_length = item.children.length
				for (let k = 0; k < children_length; k++) {
					const current_child		= item.children[k]
					const unfified_format	= typeof current_child==='object'
						? current_child.section_tipo + '_' +  current_child.section_id
						: current_child

					// check safe children (existing)
						const found = ar_rows.find(el => el.term_id===unfified_format)
						if (!found) {
							// console.log("Skip unsafe children:", unfified_format);
							continue;
						}

					current_ar_children.push(unfified_format)
				}
				item.children = current_ar_children
			}

		data.push(item)
	}

	const term_id_to_remove = []

	// update_children_data recursive
		// function update_children_data(data, row){

		// 	if ( ((!row.children || row.children.length===0) ) // && (!row.mib_bibliography || row.mib_bibliography.length===0)
		// 		|| row.descriptor!=='yes') {

		// 		if (!row.parent) {
		// 			console.warn("parent not found for row:",row );
		// 			return true
		// 		}

		// 		const parent_term_id	= row.parent[0];
		// 		const parent_row		= data.find(item => item.term_id===parent_term_id)
		// 		if (parent_row && parent_row.children && parent_row.children.length>0) {

		// 			const child_key = parent_row.children.findIndex(el => el.section_tipo===row.tld && el.section_id===row.section_id)
		// 			// console.log("child_key:",child_key, row.term_id, row);
		// 			if (child_key!==-1) {

		// 				const term = row.term

		// 				// ND cases. Before remove, add ND term to parent
		// 					if (row.descriptor==='no') {
		// 						if (parent_row.nd) {
		// 							parent_row.nd.push(term)
		// 							parent_row.nd_term_id.push(row.term_id) // useful for search
		// 						}else{
		// 							parent_row.nd = [term]
		// 							parent_row.nd_term_id = [row.term_id]
		// 						}
		// 						// console.log("parent_row.nd:", parent_row.nd, parent_row.term_id, row.term_id);
		// 					}

		// 				// remove me as child
		// 				parent_row.children.splice(child_key, 1)

		// 				// recursion with parent
		// 				update_children_data(data, parent_row)
		// 			}
		// 		}
		// 		// set to remove
		// 		term_id_to_remove.push(row.term_id)
		// 	}

		// 	return true
		// }

	// remove unused terms
		const data_length = ar_rows_length
		// for (let i = 0; i < data_length; i++) {
		for (let i = data_length - 1; i >= 0; i--) {

			const row = data[i]

			// skip root terms
				// if(root_term) {
				// 	if ( root_term.includes( row.term_id+'' ) ) {
				// 		// console.log("row.term_id:",row.term_id, root_term);
				// 		// console.log("/////////////////////////////////////////// row:",row);
				// 		row.parent = ['hierarchy1_262']
				// 	}
				// }

			const parent_term_id = (row.parent && row.parent[0]) ? row.parent[0] : false
			if (!parent_term_id) {
				console.warn("Ignored undefined parent_term_id:", row.term_id, row);
				// set to remove
				term_id_to_remove.push(row.term_id)
				continue
			}

			// update children data
			// update_children_data(data, row)
		}
		if (term_id_to_remove.length>0) {
			console.warn("term_id_to_remove:",term_id_to_remove);
		}


	// remove unused terms
		const data_clean = data.filter(el => term_id_to_remove.indexOf(el.term_id)===-1);

	// open hilite parent terms (recursive)
		for (let i = 0; i < data_clean.length; i++) {
			const row = data_clean[i]

			// hilite_terms (ussually one term from user request url like /thesaurus/technique1_1)
				if (hilite_terms && (hilite_terms.indexOf(row.term_id)!==-1 || (row.nd_term_id && hilite_terms.indexOf(row.nd_term_id)!==-1)) ) {
					row.hilite = true
				}
				if (hilite_terms) {
					if (hilite_terms.indexOf(row.term_id)!==-1) {
						// direct
						row.hilite = true
					}else if(row.nd_term_id) {
						// using nd
						for (let i = 0; i < row.nd_term_id.length; i++) {
							if (hilite_terms.indexOf(row.nd_term_id[i])!==-1) {
								row.hilite = true
								break;
							}
						}
					}
				}

			if (row.hilite===true) {
				set_status_as_opened(data_clean, row)
			}
		}
		function set_status_as_opened(data_clean, row) {
			const parent_term_id	= row.parent[0]
			const parent_row		= data_clean.find(item => item.term_id==parent_term_id)
			if (parent_row) {
				parent_row.status = "opened"
				set_status_as_opened(data_clean, parent_row)
			}
		}


	return data_clean
}//end parse_tree_data



/**
* PARSE_ACTIVITY_DATA
*	Parse users activity data
* @param array rows
* @return array rows
*/
page.parse_activity_data = function(data) {

	if (!Array.isArray(data)) {
		data = [data]
	}

	const parsed_data = []

	try {

		if(!data) {
			return data
		}

		for (let i = 0; i < data.length; i++) {

			const row = data[i]

			if (row.parsed===true) {
				parsed_data.push(row)
				continue;
			}

			row.activity = row.activity
				? JSON.parse(row.activity)
				: null

			row.parsed = true

			parsed_data.push(row)
		}//end for (let i = 0; i < data.length; i++)


	} catch (error) {
		console.error("ERROR CATCH " , error);
		console.warn("data:", data);
	}


	return parsed_data
};//end parse_activity_data



/**
* GET_ALL_ID_UNLIMITED
* @return promise - array
*/
	// page.get_all_id_unlimited = function(body) {

	// 	const ar_id_promise = (limit===0 && offset===0)
	// 		? Promise.resolve( data.map(el => el.section_id) ) // use existing
	// 		: (()=>{
	// 			// create a unlimited search
	// 			const new_body		= Object.assign({}, body)
	// 			new_body.limit		= 0
	// 			new_body.offset		= 0
	// 			new_body.count		= false
	// 			new_body.ar_fields	= ['section_id']

	// 			return data_manager.request({
	// 				body : new_body
	// 			})
	// 			.then(function(response){
	// 				const ar_id = response.result
	// 					? response.result.map(el => el.section_id)
	// 					: null
	// 				return(ar_id)
	// 			})
	// 		  })()
	// 	ar_id_promise.then(function(ar_id){
	// 			console.log("********** ar_id:",ar_id);
	// 	})
	// }//end get_all_id_unlimited


