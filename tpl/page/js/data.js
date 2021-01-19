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
	// console.log("------------> parse_type_data data:",data);

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

	// url
	row.ref_coins_image_obverse = common.local_to_remote_path(data.ref_coins_image_obverse)
	row.ref_coins_image_reverse = common.local_to_remote_path(data.ref_coins_image_reverse)

	// ref_coins_union
	if (row.ref_coins_union) {
		for (let j = 0; j < row.ref_coins_union.length; j++) {
			if (row.ref_coins_union[j].image_obverse) {
				row.ref_coins_union[j].image_obverse = common.local_to_remote_path(row.ref_coins_union[j].image_obverse)
			}
			if (row.ref_coins_union[j].image_reverse) {
				row.ref_coins_union[j].image_reverse = common.local_to_remote_path(row.ref_coins_union[j].image_reverse)
			}
		}
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
		? page.trim_char( page.remove_gaps(row.symbol_obverse, ' | '), '|')
		: null

	row.symbol_reverse = row.symbol_reverse
		? page.trim_char( page.remove_gaps(row.symbol_reverse, ' | '), '|')
		: null

	row.symbol_obverse_data = JSON.parse(row.symbol_obverse_data)
	row.symbol_reverse_data = JSON.parse(row.symbol_reverse_data)

	// permanent uri
	// row.permanent_uri = page_globals.__WEB_BASE_URL__ + page_globals.__WEB_ROOT_WEB__ + "/coin/" + row.section_id


	return row
}//end parse_type_data



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
				new_data.push( self.parse_coin_data(data[i]) )
			}
			return new_data
		}

	const row = data

	// url
	row.image_obverse = common.local_to_remote_path(data.image_obverse)
	row.image_reverse = common.local_to_remote_path(data.image_reverse)

	// type_data
	// if (row.type_data) {
	// 	row.type_data = self.parse_type_data(row.type_data)
	// }
	if (row.type_data && row.type_data.length>0) {
		row.type_data = self.parse_type_data(row.type_data)
	}

	row.type = row.type
		? page.remove_gaps(row.type, ' | ')
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
					name	: row.ref_auction[g],
					date	: typeof row.ref_auction_date[g]!=="undefined" ? self.parse_date(row.ref_auction_date[g]) : '',
					number	: typeof row.ref_auction_number[g]!=="undefined" ? row.ref_auction_number[g] : ''
				})
			}
		}


	// find
	row.find_date = self.parse_date(row.find_date)

	row.mib_uri = page_globals.__WEB_BASE_URL__ + page_globals.__WEB_ROOT_WEB__ + "/coin/" + row.section_id

	row.uri = self.parse_iri_data(row.uri)

	// bibliography
	row.bibliography = page.parse_publication(row.bibliography_data)


	// add
	row.mint	= typeof row.type_data[0]!=="undefined"
		? row.type_data[0].mint
		: null
	row.type_number	= typeof row.type_data[0]!=="undefined"
		? row.type_data[0].number
		: null
	// const value = common.clean_gaps((mint + " " + number), " | ", " | ")


	return row
}//end parse_coin_data



/**
* PARSE_CATALOG_DATA
* @param object row | array rows
* @return object row | array rows
*/
page.parse_catalog_data = function(data) {
	// console.log("------------> parse_catalog_data data:",data);
	const self = this

	if (!Array.isArray(data)) {
		data = [data]
	}

	const new_data = []
	const data_length = data.length
	for (let i = 0; i < data_length; i++) {

		// const row = JSON.parse( JSON.stringify(data[i]) )
		const row = data[i]

		// url
		row.ref_coins_image_obverse = common.local_to_remote_path(row.ref_coins_image_obverse)
		row.ref_coins_image_reverse = common.local_to_remote_path(row.ref_coins_image_reverse)

		// url thumbs
		row.ref_coins_image_obverse_thumb = row.ref_coins_image_obverse
			? row.ref_coins_image_obverse.replace('/1.5MB/', '/thumb/')
			: null
		row.ref_coins_image_reverse_thumb = row.ref_coins_image_reverse
			? row.ref_coins_image_reverse.replace('/1.5MB/', '/thumb/')
			: null

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

		row.term_data		= JSON.parse(row.term_data)
		row.term_section_id	= row.term_data ? row.term_data[0] : null
		row.children		= JSON.parse(row.children)
		row.parent			= JSON.parse(row.parent)

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


		new_data.push(row)
	}


	// add calculated measures values to types parents
		for (let i = 0; i < data_length; i++) {

			const row = new_data[i]

			if (row.term_table==='types' && row.children) {
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
		}

	// console.log("parse_catalog_data new_data:",new_data);

	return new_data
}//end parse_catalog_data



/**
* PARSE_PUBLICATION
* Modify the received data by recombining publication information
* @return array parsed_data
*/
page.parse_publication = function(data) {

	const parsed_data	= []
	const separator		= " # ";
	const data_length	= data.length
	for (let i = 0; i < data_length; i++) {

		const reference = data[i]

		// add publications property to store all resolved references
			reference._publications = []

		const publications_data			= JSON.parse(reference.publications_data)
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
					url			: ref_publications_url[j] || null,
				}

				reference._publications.push(parsed_item)
				parsed_data.push(parsed_item)
			}
		}

	}
	// console.log("parsed_data:",parsed_data);

	return parsed_data
}//end parse_publication
