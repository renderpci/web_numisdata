/*global tstring, page_globals, SHOW_DEBUG, row_fields, common, page*/
/*eslint no-undef: "error"*/

"use strict";

/**
* COMMON DATA RENDERS
* prototypes page
*/



/**
* RENDER_MAP_LEGEND
* Unified way to build  
*/
page.render_map_legend = function(){

	// map_legend
	const map_legend = common.create_dom_element({
		element_type	: "div",
		class_name		: "map_legend"
	})
	common.create_dom_element({
		element_type	: "div",
		class_name		: "legend_item",
		inner_html		: tstring.mint + '<img src="'+page.maps_config.markers.mint.iconUrl+'"/>',
		parent			: map_legend
	})
	common.create_dom_element({
		element_type	: "div",
		class_name		: "legend_item",
		inner_html		: tstring.hoard + '<img src="'+page.maps_config.markers.hoard.iconUrl+'"/>',
		parent			: map_legend
	})
	common.create_dom_element({
		element_type	: "div",
		class_name		: "legend_item",
		inner_html		: tstring.findspot + '<img src="'+page.maps_config.markers.findspot.iconUrl+'"/>',
		parent			: map_legend
	})


	return map_legend
}//end render_map_legend




/**
* RENDER_EXPORT_DATA_BUTTONS
* @return promise : DOM node
*/
page.render_export_data_buttons = function() {
	
	// vars filled on event publish options
		let request_body
		let result
		let export_data_parser

	// unrestricted request to db 
		function get_data() {

			const data_object = {
				source_org	: "MIB (Moneda Ibérica - Iberian Coin)",
				source_url	: "https://mib.numisdata.org",
				lang		: page_globals.WEB_CURRENT_LANG_CODE,
				date		: common.get_today_date()
			}

			return new Promise(function(resolve){

				// result or request_body are invalid
					if (!request_body) {
						console.warn("Invalid result or request_body:", request_body);
						return null
					}

				// if result is not limited, we can use directly
					// if (request_body.limit==0) {
					// 	// parsed rows
					// 	data_object.data = page.export_parse_catalog_data(rows)
					// 	resolve(data_object)
					// }

				// get new request without limit
					request_body.limit = 0
					request_body.resolve_portals_custom = null
					data_manager.request({
						body : request_body
					})
					.then(function(api_response){
						resolve(api_response.result)
					})
			})
			.then(function(rows){
				// console.log("----> render_export_data_buttons rows:",rows);

				// data_object.data. parsed rows is optional
				data_object.data = (export_data_parser && typeof export_data_parser==='function')
					? window[export_data_parser](rows)
					: rows

				return data_object
			})
		}
	
	// event data_request_done is triggered when new search is done
		event_manager.subscribe('data_request_done', manage_data_request_done)
		function manage_data_request_done(options) {			
			console.warn("data_request_done options:",options);
			request_body		= options.request_body
			result				= options.result
			export_data_parser	= options.export_data_parser || null
		}	
	

	const fragment = new DocumentFragment()

	// button_export_json
		const button_export_json_container = common.create_dom_element({
			element_type	: "div",
			class_name		: "export_container",
			parent			: fragment
		})
		const button_export_json = common.create_dom_element({
			element_type	: "input",
			type			: "button",
			value			: tstring.export_json || 'Export JSON',
			class_name		: "btn primary button_download json",
			parent			: button_export_json_container
		})
		button_export_json.addEventListener("click", function(){
			// console.log("request_body:",request_body);
			// console.log("result:",result);

			const button = this
			
			// spinner on
				button.classList.add("unactive")
				const spinner = common.create_dom_element({
					element_type	: "div",
					class_name		: "spinner",
					parent			: button_export_json_container
				})				
			
			get_data().then(function(data){
				// console.log("data:",data);				

				const file_name	= 'mib_export_data.json'
				
				// Blob data
					const blob_data = new Blob([JSON.stringify(data, null, 2)], {
						type	: 'application/json',
						name	: file_name
					});

				// create a temporal a node and trigger click
					const href		= URL.createObjectURL(blob_data)
					const link_obj	= common.create_dom_element({
						element_type	: "a",
						href			: href,
						download		: file_name
					})
					link_obj.click()

				// destroy temporal node
					link_obj.remove()

				// spinner of
					spinner.remove()
					button.classList.remove("unactive")
			})
		})
	
	// button_export_csv
		const button_export_csv_container = common.create_dom_element({
			element_type	: "div",
			class_name		: "export_container",
			parent			: fragment
		})
		const button_export_csv = common.create_dom_element({
			element_type	: "input",
			type			: "button",
			value			: tstring.export_csv || 'Export CSV',
			class_name		: "btn primary button_download csv",
			parent			: button_export_csv_container
		})
		button_export_csv.addEventListener("click", function(){

			const button = this
			
			// spinner on
				button.classList.add("unactive")
				const spinner = common.create_dom_element({
					element_type	: "div",
					class_name		: "spinner",
					parent			: button_export_csv_container
				})

			get_data().then(function(data){
				// console.log("data:",data);

				const file_name	= 'mib_export_data.csv'

				// Convert json obj to csv
					const csv = page.convert_json_to_csv(data.data)
				
				// Blob data
					const blob_data = new Blob([csv], {
						type	: 'text/csv',
						name	: file_name
					});

				// create a temporal a node and trigger click
					const href		= URL.createObjectURL(blob_data)
					const link_obj	= common.create_dom_element({
						element_type	: "a",
						href			: href,
						download		: file_name
					})
					link_obj.click()

				// destroy temporal node
					link_obj.remove()

				// spinner of
					spinner.remove()
					button.classList.remove("unactive")
			})
		})

	return fragment
};//end render_export_data_buttons
