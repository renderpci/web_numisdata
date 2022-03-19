/*global page */
/*eslint no-undef: "error"*/
/*jshint esversion: 6 */



/**
* CONVERT_JSON_TO_CSV
* @param array rows
*/
page.convert_json_to_csv = function(rows) {
	//console.log("rows:",JSON.stringify(rows));

	let json = rows
	if(Array.isArray(json)===false) {
		json = [json]
	}

	if (json.length===0) {
		return false
	}

	const fields	= Object.keys(json[0])
	const replacer	= function(key, value) { return value === null ? '' : value }
	let csv			= json.map(function(row){
	  return fields.map(function(fieldName){

			const current_value	= row[fieldName]

			let value
			switch(typeof current_value) {
				case 'object' :
					value = JSON.stringify(current_value, replacer)
					if (value!=='""') {
						value = '"' + value.replace(/\"/g, '""') + '"'
					}
					break;
				case 'string' :
					value = '"' + current_value.replace(/\"/g, '""') + '"'
					break;
				default:
					value = '"' + current_value + '"'
					break;
			}
			// console.log("value:",value);


	    	return value
	  }).join(',')
	})

	// add header column
	csv.unshift(fields.map(function(fieldName){
		return '"' + fieldName + '"'
	}).join(','))

	// Create rows separated by \r\n
	csv = csv.join("\r\n")


	return csv
};//end convert_json_to_csv



/**
* EXPORT_PARSE_CATALOG_DATA
* @return array data
*/
page.export_parse_catalog_data = function(rows) {

	rows = page.parse_catalog_data(rows)

	// function sortObjectByKeys(o) {
	// 	return Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {});
	// }

	const data = []
	for (let i = rows.length - 1; i >= 0; i--) {

		// clone row
		const row = JSON.parse( JSON.stringify(rows[i]) )

		// clean row
		delete row.global_search
		delete row.dd_tm

		const clean_row = row; // sortObjectByKeys(row)


		// sorted object keys
		data.push(clean_row)
	}


	return data
};//end export_parse_catalog_data



/**
* EXPORT_PARSE_TYPE_DATA
* @return array rows
*/
page.export_parse_type_data = function(rows) {

	if(Array.isArray(rows)===false) {
		rows = [rows]
	}

	const data = []
	for (let i = rows.length - 1; i >= 0; i--) {

		// clone row
		const row = JSON.parse( JSON.stringify(rows[i]) )

		// clean row
		// delete row.global_search
		delete row.dd_tm
		delete row.dd_relations

		const clean_row = row; // sortObjectByKeys(row)


		// sorted object keys
		data.push(clean_row)
	}
	// console.warn("data:",data);


	return data
};//end export_parse_type_data



/**
* EXPORT_PARSE_COIN_DATA
* @return array rows
*/
page.export_parse_coin_data = function(rows) {

	if(Array.isArray(rows)===false) {
		rows = [rows]
	}

	const data = []
	for (let i = rows.length - 1; i >= 0; i--) {

		// clone row
		const row = JSON.parse( JSON.stringify(rows[i]) )

		// clean row
		// delete row.global_search
		delete row.dd_tm
		delete row.dd_relations

		const clean_row = row; // sortObjectByKeys(row)


		// sorted object keys
		data.push(clean_row)
	}
	// console.warn("data:",data);


	return data
};//end export_parse_coin_data




/**
* EXPORT_PARSE_MINT_DATA
* @return array rows
*/
page.export_parse_mint_data = function(rows) {

	if(Array.isArray(rows)===false) {
		rows = [rows]
	}

	const data = []
	for (let i = rows.length - 1; i >= 0; i--) {

		// clone row
		const row = JSON.parse( JSON.stringify(rows[i]) )

		// clean row
		// delete row.global_search
		// delete row.dd_tm
		// delete row.dd_relations

		const clean_row = row; // sortObjectByKeys(row)


		// sorted object keys
		data.push(clean_row)
	}
	// console.warn("data:",data);


	return data
};//end export_parse_mint_data



/**
* EXPORT_PARSE_MAP_DATA
* @return array rows
*/
page.export_parse_map_data = function(rows) {

	if(Array.isArray(rows)===false) {
		rows = [rows]
	}

	const data = []
	for (let i = rows.length - 1; i >= 0; i--) {

		// clone row
		const row = JSON.parse( JSON.stringify(rows[i]) )

		// clean row
		// delete row.global_search
		// delete row.dd_tm
		// delete row.dd_relations

		const clean_row = row; // sortObjectByKeys(row)

		// sorted object keys
		data.push(clean_row)
	}
	// console.warn("data:",data);


	return data
};//end export_parse_map_data




