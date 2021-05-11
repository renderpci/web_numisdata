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
		let filter

	// unrestricted request to db
		function get_data() {

			const data_object = {
				info		: "WARNING! This is a draft version data. Please do not use it in production",
				source_org	: "MIB (Moneda Ibérica - Iberian Coin)",
				source_url	: "https://monedaiberica.org",
				lang		: page_globals.WEB_CURRENT_LANG_CODE,
				date		: common.get_today_date()
			}

			return new Promise(function(resolve){

				// result or request_body are invalid
					if (!request_body) {

						if (result) {
							setTimeout(function(){
								resolve(result)
							}, 1000)
							return
						}else{
							console.warn("Invalid result or request_body:", request_body);
							resolve(false)
							return
						}
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
					? export_data_parser(rows)
					: rows

				return data_object
			})
		}

	// event data_request_done is triggered when new search is done
		event_manager.subscribe('data_request_done', manage_data_request_done)
		function manage_data_request_done(options) {
			// console.warn("data_request_done options:",options);
			request_body		= options.request_body
			result				= options.result
			export_data_parser	= options.export_data_parser || null
			filter 				= options.filter
		}


	const fragment = new DocumentFragment()

	// button_share_search now only in catalog
		if(WEB_AREA === 'catalog'){
			const button_share_search_container = common.create_dom_element({
				element_type	: "div",
				class_name		: "export_container",
				parent			: fragment
			})
			const button_share_search = common.create_dom_element({
				element_type	: "input",
				type			: "button",
				value			: tstring.share_search || 'Share search',
				class_name		: "btn primary button_download share_search",
				parent			: button_share_search_container
			})
			button_share_search.addEventListener("click", function(){

				const button = this

				// minimize psqo
				const min_psqo = psqo_factory.build_safe_psqo(filter)

				// Shared wrapper
					const shared_wrapper = common.create_dom_element({
						element_type	: "div",
						class_name		: "shared_wrapper",
						parent			: document.body
					})
					shared_wrapper.addEventListener("click", function(e){
						shared_wrapper.remove()
					})
				// Shared container
					const shared_container = common.create_dom_element({
						element_type	: "div",
						class_name		: "shared_container",
						parent			: shared_wrapper
					})
					shared_container.addEventListener("click", function(e){
						e.stopPropagation()
					})
				// Shared JSON
					const shared_json = common.create_dom_element({
						element_type	: "div",
						class_name		: "shared_json",
						text_content	: JSON.stringify(min_psqo, null, 2),
						parent			: shared_container
					})
				// Shared URI encoded

					// encode psqo to safe use it in url
					const encoded_psqo	= psqo_factory.encode_psqo(min_psqo)
					const uri			= window.location.protocol + '//'+
										  window.location.host+
										  page_globals.__WEB_ROOT_WEB__+
										  '/' +WEB_AREA+
										  '/?psqo=' + encoded_psqo;

					// console.log("encoded_psqo", encoded_psqo);
					// console.log("uri", uri);

					const shared_uri_encoded = common.create_dom_element({
						element_type	: "div",
						class_name		: "shared_uri_encoded",
						parent			: shared_container
					})
					const uri_node = common.create_dom_element({
						element_type	: "span",
						text_content	: uri,
						title			: uri.length,
						parent			: shared_uri_encoded
					})
					const link = common.create_dom_element({
						element_type	: "a",
						href			: uri,
						inner_html		: tstring.search || 'Search',
						target			: '_blank',
						parent			: shared_uri_encoded
					})
			})
		}

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
					class_name		: "spinner small",
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
					class_name		: "spinner small",
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



/**
* RENDER_LEGEND
* Genericunified legend renderer
* @return promise : DOM node
*/
page.render_legend = function(options) {

	const self = this

	// options
		const value = options.value || ''
		const style = options.style || 'median'

	// convert text nodes into span nodes
		// const regex = / /g;
		// const parsed_node = document.createElement("div")
		// 	  parsed_node.innerHTML	= value

		// const textNodes = Array.from(parsed_node.childNodes).filter(node => node.nodeType===3 && node.textContent.trim().length > 0)
		// 		console.log("textNodes:",textNodes);

		// textNodes.forEach(node => {
		// 	// node.textContent = node.textContent.replace(regex, '&nbsp;')
		// 	const span = document.createElement('span');
		// 	node.after(span);
		// 	span.appendChild(node);
		// });
		// console.log("parsed_node:",parsed_node);

	const legend_node = common.create_dom_element({
		element_type	: "div",
		class_name		: "legend_box " + style,
		inner_html		: value.trim()
	})
	// while (parsed_node.hasChildNodes()) {
	// 	legend_node.appendChild(parsed_node.firstChild);
	// }


	return legend_node
};//end render_legend



/**
* RENDER_TYPE_LABEL
* @return
*/
page.render_type_label = function(row) {

	let current_value

	const mint_number = (row.ref_mint_number)
		? row.ref_mint_number+'/'
		: ''
	if (row.term_section_id && !row.children) {

		const ar		= row.term.split(", ")
		const c_name	= ar[0]
		const keyword	= (typeof ar[1]==="undefined")
			? ''
			: (function(){
				const clean = []
				for (let i = 1; i < ar.length; i++) {
					clean.push(ar[i])
				}
				return '<span class="keyword">, ' + clean.join(", ").trim() + '</span>'
			})()

		const a_term = common.create_dom_element({
			element_type	: "a",
			class_name		: "a_term",
			href			: page_globals.__WEB_ROOT_WEB__ + '/type/' + row.term_section_id,
			target			: "_blank",
			title			: "MIB " + mint_number + c_name + (ar.join(", ").trim()),
			inner_html		: "MIB " + mint_number + c_name + keyword
		})
		current_value = a_term.outerHTML
	}else{
		current_value = "MIB " + mint_number + row.term
	}

	return current_value
};//end render_type_label



/**
* RENDER_WEIGHT_VALUE
* @return
*/
page.render_weight_value = function(row) {
	const weight = row.ref_type_averages_weight.toFixed(2).replace(/\.?0+$/, "");
	return weight.replace('.',',') + ' g'
};//end render_weight_value



/**
* RENDER_DIAMETER_VALUE
* @return
*/
page.render_diameter_value = function(row) {
	const diameter = row.ref_type_averages_diameter.toFixed(2).replace(/\.?0+$/, "");
	return diameter.replace('.',',') + ' mm'
};//end render_diameter_value
