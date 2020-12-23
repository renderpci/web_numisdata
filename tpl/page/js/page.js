/*global tstring, page_globals, SHOW_DEBUG, row_fields, common, page*/
/*eslint no-undef: "error"*/
"use strict";

/**
* PAGE JS
*
*
*/
var page = {

	

	trigger_url : page_globals.__WEB_ROOT_WEB__ + "/web/trigger.web.php",

	// maps common config
	maps_config : {
		// source maps. Used on catalog and item maps
		source_maps : [
			{
				name	: "DARE",
				// url	: '//pelagios.org/tilesets/imperium/{z}/{x}/{y}.png',
				url		: '//dh.gu.se/tiles/imperium/{z}/{x}/{y}.png',
				options	: { maxZoom: 11 },
				default	: true
			},
			{
				name	: "OSM",
				url		: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
				options	: {
					maxZoom	: 19,
				}
			},
			{
				name	: 'Map Tiles',
				// url	: 'https://api.maptiler.com/maps/basic/{z}/{x}/{y}@2x.png?key=udlBrEEE2SPm1In5dCNb', // 512 ...
				url		: 'https://api.maptiler.com/maps/basic/256/{z}/{x}/{y}@2x.png?key=udlBrEEE2SPm1In5dCNb', // 256 ok
				// url	: 'https://api.maptiler.com/maps/9512807c-ffd5-4ee0-9781-c354711d15e5/style.json?key=udlBrEEE2SPm1In5dCNb', // vector grey
				options	: {
					maxZoom	: 20,
				}
			},
			{
				name	: "ARCGIS",
				url		: '//server.arcgisonline.com/ArcGIS/' + 'rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
				options	: {}
			}
		],
		// popup otions
		popup_options	: {
			maxWidth	: 420,
			closeButton	: false,
			className	: 'map_popup'
		},
		// markers
		markers : {
			mint : {
				iconUrl			: page_globals.__WEB_TEMPLATE_WEB__ + "/assets/images/map/purple.png",
				shadowUrl		: page_globals.__WEB_TEMPLATE_WEB__ + "/assets/images/map/marker-shadow.png",
				iconSize		: [47, 43], // size of the icon
				shadowSize		: [41, 41], // size of the shadow
				iconAnchor		: [10, 19], // point of the icon which will correspond to marker's location
				shadowAnchor	: [0, 20],  // the same for the shadow
				popupAnchor		: [12, -20] // point from which the popup should open relative to the iconAnchor
			},
			findspot : {
				iconUrl			: page_globals.__WEB_TEMPLATE_WEB__ + "/assets/images/map/orange.png",
				shadowUrl		: page_globals.__WEB_TEMPLATE_WEB__ + "/assets/images/map/marker-shadow.png",
				iconSize		: [47, 43], // size of the icon
				shadowSize		: [41, 41], // size of the shadow
				iconAnchor		: [10, 19], // point of the icon which will correspond to marker's location
				shadowAnchor	: [0, 20],  // the same for the shadow
				popupAnchor		: [12, -20] // point from which the popup should open relative to the iconAnchor
			},
			hoard : {
				iconUrl			: page_globals.__WEB_TEMPLATE_WEB__ + "/assets/images/map/green.png",
				shadowUrl		: page_globals.__WEB_TEMPLATE_WEB__ + "/assets/images/map/marker-shadow.png",
				iconSize		: [47, 43], // size of the icon
				shadowSize		: [41, 41], // size of the shadow
				iconAnchor		: [10, 19], // point of the icon which will correspond to marker's location
				shadowAnchor	: [0, 20],  // the same for the shadow
				popupAnchor		: [12, -20] // point from which the popup should open relative to the iconAnchor
			}
		}
	},




	/**
	* SETUP
	*/
	setup : function() {

		var self = this

		// window.ready(function(){
			// self.hilite_lang(page_globals.WEB_CURRENT_LANG_CODE)
		// })

		window.ready(function(){
			// init lang selector
			// self.init_lang_selector()

			self.hilite_lang(page_globals.WEB_CURRENT_LANG_CODE)

			// show footer (from opacity zero)
			const footer = document.getElementById('footer')
			if (footer) {
				setTimeout(function(){
					footer.classList.remove('hidded')
				},500)
			}
		})

		return true
	},//end setup



	/**
	* HILITE_LANG
	*/
	hilite_lang : function(lang) {

		// Lang selected
			const page_lang_selector = document.getElementById("page_lang_selector")
			if (page_lang_selector) {
				const nodes = page_lang_selector.querySelectorAll("a")
				for (let i = 0; i < nodes.length; i++) {
					if ( nodes[i].href.indexOf(lang) !== -1 ) {
						nodes[i].classList.add("selected")
					}
				}
			}

		return true
	},//end hilite_lang



	/*
	* LOAD_MORE_ITEMS
	*/
	load_more_items : function(button_obj) {

		var template_map = JSON.parse(button_obj.dataset.template_map)

		var target_div = document.getElementById(button_obj.dataset.target)

		var spinner = document.createElement("div")
			spinner.classList.add("spinner_list")
			target_div.appendChild(spinner)

		var trigger_vars = {
			mode 		 : 'load_more_items',
			template_map : template_map
		}

		const js_promise = common.get_json_data(this.trigger_url, trigger_vars, true).then(function(response){
				console.log("[page.load_more_items] response", response);

				if (response===null) {
					console.log("[page.load_more_items] Error. Null response");
				}else{
					var list_rows = document.createElement("div")
						list_rows.innerHTML = response.html

					var ar_childrens = list_rows.children

					// Add loaded elements to the end of current container
					while(ar_childrens.length>0) {
						// Note that when appendChild is done, element is removed from array ar_childrens
						target_div.appendChild(ar_childrens[0])
					}

					// Update button template_map
					template_map.offset = template_map.offset + template_map.max_records
					button_obj.dataset.template_map = JSON.stringify(template_map)

					// Hide button on arrive to max
					if (template_map.offset >= template_map.total_records) {
						button_obj.style.display = "none"
					}
				}
				spinner.remove()
		})

		return js_promise
	},//end load_more_items



	/**
	* ADJUST_IMAGE_SIZE
	* Verticalize properties of vertical images (default is horizontal)
	*/
	adjust_image_size : function(image_obj) {

		image_obj.style.opacity = 0;
		var actual_image = document.createElement("img")
			actual_image.src = image_obj.style.backgroundImage.replace(/"/g,"").replace(/url\(|\)$/ig, "")
			actual_image.addEventListener("load", function(e){
				//console.log(e);
				var width  = this.width;
				var height  = this.height;
				//console.log(width, height);

				// Vertical case
				if (height>width) {
					image_obj.classList.add("vertical")

					// Adjust title and body text ?
				}
				image_obj.style.opacity = 1;
			}, false)

		return true
	},//end adjust_image_size



	/**
	* ADJUST_FOOTER_POSITION
	*/
	adjust_footer_position : function() {

		// scrollbar old way
			//const scrollbar = common.has_scrollbar()

		// scrollbar
			let scrollbar = false
			//const top_container = document.querySelector(".top_container")
			const top_container = document.getElementById("wrapper")
			if (top_container) {

				const top_container_height 	= top_container.offsetHeight
				const window_height 		= window.innerHeight

				// console.log("top_container_height:",top_container_height, "window_height",window_height);

				if (top_container_height>window_height) {
					scrollbar = true
				}
			}else{
				console.log("top_container not found !");
				return false
			}

		// debug
			if(SHOW_DEBUG===true) {
				console.log("scrollbar:",scrollbar);
			}

		// footer
			const footer = document.getElementById("footer")
			if (scrollbar===false) {
				footer.classList.add("fixed")
			}else{
				footer.classList.remove("fixed")
			}

		return scrollbar
	},//end adjust_footer_position



	/**
	* ACTIVATE_TOOLTIPS
	*/
	activate_tooltips : function( elements ) {

		if(SHOW_DEBUG===true) {
			// console.log("elements:",elements);
		}

		$(elements).each(function() {
			new Tooltip($(this), {
	    		placement: 'top',
	    	});
		});
	},//end activate_tooltips



	/**
	* BUILD_PAGINATOR_HTML
	* Builds html of paginator from page_nodes
	*/
	build_paginator_html : function(page_nodes_data, container, goto_url) {

		const self = this

		// wrapper ul
			const wrapper_ul  = container
				  wrapper_ul.dataset.total = page_nodes_data.total

		// iterate nodes
			const ar_nodes 		  = page_nodes_data.ar_nodes
			const ar_nodes_length = ar_nodes.length
			for (let i = 0; i < ar_nodes_length; i++) {

				const node 		= ar_nodes[i]
				let label 		= node.label
				let class_name 	= "page " + node.type + " " + node.id
				if (node.active===false) {
					class_name += " unactive"
				}

				// label blank cases
					if (node.id==="previous" || node.id==="next" || node.id==="last" || node.id==="first" ) {
						label = ""
					}

				// switch node.type
					//switch(node.type){
					//	case "navigator":
					//		class_name = node.type + ""
					//		break;
					//	case "page":
					//		class_name = node.type + ""
					//		break;
					//}

				// selected
					if (node.selected===true) {
						class_name += " selected"
					}

				// create_dom_element based on node type
					if (node.type==="extra") {
						// extra (span)
							class_name = node.type

							const span = common.create_dom_element({
								element_type 	: "span",
								class_name 		: class_name,
								text_content 	: label,
								parent 			: wrapper_ul
							})
					}else{
						// normal (link)
							const a = common.create_dom_element({
								element_type 	: "a",
								class_name 		: class_name,
								text_content 	: label,
								dataset 		: {
									offset : node.offset_value,
									active : node.active
								},
								parent 			: wrapper_ul
							})

							// link
								if (node.active===true) {
									/*
									const params = {
											offset 	: node.offset_value,
											total 	: page_nodes_data.total
										}

									const method = typeof goto_url!=="undefined" ? goto_url : "paginator.goto_url"
									a.addEventListener("click",function(e){

										// exec function custom
											const js_promise = new Promise(function(resolve) {

												let response
												if (typeof method==="function") {
													response = method(params)
												}else{
													response = common.execute_function_by_name(method, window, params)
												}

												resolve(response)
											});

											js_promise.then(function(response){
												// console.log("response typeof:",typeof response, "- response instanceof:",response instanceof Promise);
											})

									},false) */
								}
					}
			}//end for loop


		// event delegation
			wrapper_ul.addEventListener('click', self.paginator_click_event);


		return wrapper_ul
	},//end build_paginator_html



	/**
	* PAGINATOR_CLICK_EVENT
	* Add and manages click events of paginator links (event is delegated on wrap)
	*/
	paginator_click_event : function(e) {

		const self = this

		const element = e.target
		const active  = element.dataset.active

		if (active!=="true") {
			return false;
		}


		const total 	= parseInt(element.parentNode.dataset.total)
		const offset 	= element.dataset.offset


		const search_form = document.getElementById("search_form")
		const js_promise  = main_home.search(search_form, null, offset, total)


		// const options 	= {
		// 	offset 	: offset,
		// 	total 	: total
		// }
		//const js_promise = catalogo.search_rows(options)


		js_promise.then(function(response){

			// scroll window to top	of 	catalogo_rows_list
				//const catalogo_rows_list = document.querySelector(".result")
				const catalogo_rows_list = self.result_container
				//selft.scrollIntoView({behavior: "smooth", block: "start", inline: "start"})

		})

		//alert("paginator_click_event 1");
		//console.log("paginator_click_event e:", offset, total);

		return js_promise
	},//end paginator_click_event



	/**
	* ADD_SPINNER
	* @return
	*/
	add_spinner : function(target) {

		if(target) {
			const image = common.create_dom_element({
				element_type 	: "img",
				class_name 		: "spinner_svg",
				src 			: page_globals.__WEB_ROOT_WEB__ + "/tpl/assets/images/spinner.svg"
			})
			target.appendChild(image)
		}else{
			console.warn("[add_spinner] Error on get target ", target);
		}

		return true
	},//end add_spinner



	/**
	* remove_SPINNER
	* @return
	*/
	remove_spinner : function(target) {

		const spinner = target.querySelector(".spinner_svg")
		if (spinner) {
			spinner.remove()
			return true
		}

		return false
	},//end remove_spinner



	/**
	* REMOTE_IMAGE
	* @return bool
	*/
	remote_image : function(url) {

		if (url) {

			let remote_url = ''
			if (url.indexOf('v5/media_test')!==-1) {
				remote_url = url.replace(/\/v5\/media_test\/media_monedaiberica\//g, page_globals.__WEB_MEDIA_BASE_URL__ + "/dedalo/media/")
			}else{
				remote_url = url.replace(/\/dedalo\/media_test\/media_monedaiberica\//g, page_globals.__WEB_MEDIA_BASE_URL__ + "/dedalo/media/")
			}

			return remote_url
		}
		// /dedalo/media_test/media_monedaiberica

		return null
	},//end remote_image



	/**
	* PARSE_LEGEND_SVG
	* @return
	*/
	parse_legend_svg : function(value) {
		if (value.indexOf('http')!==-1) {
			return value // already parsed
		}

		value = value.replace(/\/dedalo\/media\/svg\//g, page_globals.__WEB_MEDIA_BASE_URL__ + "/dedalo/media/svg/")
		
		const final_value = page.remove_gaps( page.trim_char(value, '|'), ' | ' )

		return final_value
	},//end parse_legend_svg



	/**
	* PARSE_CATALOG_DATA
	* @param object row | array rows
	* @return object row | array rows
	*/
		// parse_catalog_data : function(data) {
		// 	// console.log("------------> parse_catalog_data data:",data);
		// 	const self = this

		// 	if (!Array.isArray(data)) {
		// 		data = [data]
		// 	}

		// 	const new_data = []
		// 	const data_length = data.length
		// 	for (let i = 0; i < data_length; i++) {

		// 		// const row = JSON.parse( JSON.stringify(data[i]) )
		// 		const row = data[i]

		// 		// url
		// 		row.ref_coins_image_obverse = common.local_to_remote_path(row.ref_coins_image_obverse)
		// 		row.ref_coins_image_reverse = common.local_to_remote_path(row.ref_coins_image_reverse)

		// 		// url thumbs
		// 		row.ref_coins_image_obverse_thumb = row.ref_coins_image_obverse
		// 			? row.ref_coins_image_obverse.replace('/1.5MB/', '/thumb/')
		// 			: null
		// 		row.ref_coins_image_reverse_thumb = row.ref_coins_image_reverse
		// 			? row.ref_coins_image_reverse.replace('/1.5MB/', '/thumb/')
		// 			: null

		// 		// legends
		// 		row.ref_type_legend_obverse = row.ref_type_legend_obverse
		// 			? self.parse_legend_svg(row.ref_type_legend_obverse)
		// 			: null
		// 		row.ref_type_legend_reverse = row.ref_type_legend_reverse
		// 			? self.parse_legend_svg(row.ref_type_legend_reverse)
		// 			: null
		// 		// symbols
		// 		row.ref_type_symbol_obverse = row.ref_type_symbol_obverse
		// 			? self.parse_legend_svg(row.ref_type_symbol_obverse)
		// 			: null
		// 		row.ref_type_symbol_reverse = row.ref_type_symbol_reverse
		// 			? self.parse_legend_svg(row.ref_type_symbol_reverse)
		// 			: null

		// 		row.term_data		= JSON.parse(row.term_data)
		// 		row.term_section_id	= row.term_data ? row.term_data[0] : null
		// 		row.children		= JSON.parse(row.children)
		// 		row.parent			= JSON.parse(row.parent)

		// 		row.ref_type_averages_diameter = row.ref_type_averages_diameter
		// 			? parseFloat( row.ref_type_averages_diameter.replace(',', '.') )
		// 			: null

		// 		row.ref_type_total_diameter_items = row.ref_type_total_diameter_items
		// 			? parseFloat( row.ref_type_total_diameter_items.replace(',', '.') )
		// 			: null

		// 		row.ref_type_averages_weight = row.ref_type_averages_weight
		// 			? parseFloat( row.ref_type_averages_weight.replace(',', '.') )
		// 			: null

		// 		row.ref_type_total_weight_items = row.ref_type_total_weight_items
		// 			? parseFloat( row.ref_type_total_weight_items.replace(',', '.') )
		// 			: null

		// 		row.ref_type_material = page.trim_char(row.ref_type_material, '|')


		// 		new_data.push(row)
		// 	}


		// 	// add calculated measures values to types parents
		// 		for (let i = 0; i < data_length; i++) {

		// 			const row = new_data[i]

		// 			if (row.term_table==='types' && row.children) {
		// 				const ar_mesures_diameter	= []
		// 				const ar_mesures_weight		= []

		// 				for (let i = 0; i < row.children.length; i++) {

		// 					const current_child	= row.children[i]
		// 					const child_row		= data.find(el => el.section_id==current_child)

		// 					if(child_row && child_row.ref_type_averages_weight){
		// 						// get the total items
		// 						const weight_items = child_row.ref_type_total_weight_items
		// 						//create a new array with all items - values
		// 						const ar_current_mesures_weight = new Array(weight_items).fill(child_row.ref_type_averages_weight)
		// 						// add the current child values to the total array
		// 						ar_mesures_weight.push(...ar_current_mesures_weight)
		// 					}
		// 					if(child_row && child_row.ref_type_averages_diameter){
		// 						const diameter_items = child_row.ref_type_total_diameter_items
		// 						const ar_current_mesures_diameter = new Array(diameter_items).fill(child_row.ref_type_averages_diameter)
		// 						ar_mesures_diameter.push(...ar_current_mesures_diameter)

		// 					}
		// 				}

		// 				const media_weight		= ar_mesures_weight.reduce((a,b) => a + b, 0)  / ar_mesures_weight.length
		// 				const media_diameter	= ar_mesures_diameter.reduce((a,b) => a + b, 0) / ar_mesures_diameter.length

		// 				row.ref_type_averages_weight    = media_weight
		// 				row.ref_type_averages_diameter	= media_diameter

		// 				row.ref_type_total_weight_items		= ar_mesures_weight.length
		// 				row.ref_type_total_diameter_items	= ar_mesures_diameter.length
		// 			}
		// 		}

		// 	// console.log("parse_catalog_data new_data:",new_data);

		// 	return new_data
		// },//end parse_catalog_data



	/**
	* PARSE_TYPE_DATA
	* @param object row | array rows
	* @return object row | array rows
	*/
		// parse_type_data : function(data) {
		// 	// console.log("------------> parse_type_data data:",data);

		// 	const self = this

		// 	// array case
		// 		if (Array.isArray(data)) {
		// 			const new_data = []
		// 			for (let i = 0; i < data.length; i++) {
		// 				new_data.push( self.parse_type_data(data[i]) )
		// 			}
		// 			return new_data
		// 		}

		// 	const row = data

		// 	// url
		// 	row.ref_coins_image_obverse = common.local_to_remote_path(data.ref_coins_image_obverse)
		// 	row.ref_coins_image_reverse = common.local_to_remote_path(data.ref_coins_image_reverse)

		// 	// ref_coins_union
		// 	if (row.ref_coins_union) {
		// 		for (let j = 0; j < row.ref_coins_union.length; j++) {
		// 			if (row.ref_coins_union[j].image_obverse) {
		// 				row.ref_coins_union[j].image_obverse = common.local_to_remote_path(row.ref_coins_union[j].image_obverse)
		// 			}
		// 			if (row.ref_coins_union[j].image_reverse) {
		// 				row.ref_coins_union[j].image_reverse = common.local_to_remote_path(row.ref_coins_union[j].image_reverse)
		// 			}
		// 		}
		// 	}

		// 	row.uri = self.parse_iri_data(row.uri)

		// 	// json encoded
		// 	// row.dd_relations			= JSON.parse(row.dd_relations)
		// 	// row.collection_data		= JSON.parse(row.collection_data)
		// 	// row.image_obverse_data	= JSON.parse(row.image_obverse_data)
		// 	// row.image_reverse_data	= JSON.parse(row.image_reverse_data)
		// 	// row.type_data			= JSON.parse(row.type_data)

		// 	// legend text includes svg url
		// 	row.legend_obverse = row.legend_obverse
		// 		? self.parse_legend_svg(row.legend_obverse)
		// 		: null
		// 	row.legend_reverse = row.legend_reverse
		// 		? self.parse_legend_svg(row.legend_reverse)
		// 		: null

		// 	row.material = row.material
		// 		? page.trim_char( page.remove_gaps(row.material, ' | '), '|')
		// 		: null

		// 	row.symbol_obverse = row.symbol_obverse
		// 		? page.trim_char( page.remove_gaps(row.symbol_obverse, ' | '), '|')
		// 		: null

		// 	row.symbol_reverse = row.symbol_reverse
		// 		? page.trim_char( page.remove_gaps(row.symbol_reverse, ' | '), '|')
		// 		: null

		// 	row.symbol_obverse_data = JSON.parse(row.symbol_obverse_data)
		// 	row.symbol_reverse_data = JSON.parse(row.symbol_reverse_data)

		// 	// permanent uri
		// 	// row.permanent_uri = page_globals.__WEB_BASE_URL__ + page_globals.__WEB_ROOT_WEB__ + "/coin/" + row.section_id


		// 	return row
		// },//end parse_type_data



	/**
	* PARSE_COIN_DATA
	* @param object row | array rows
	* @return object row | array rows
	*/
		// parse_coin_data : function(data) {
		// 	// console.log("------------> parse_coin_data data:",data);

		// 	const self = this

		// 	// array case
		// 		if (Array.isArray(data)) {
		// 			const new_data = []
		// 			for (let i = 0; i < data.length; i++) {
		// 				new_data.push( self.parse_coin_data(data[i]) )
		// 			}
		// 			return new_data
		// 		}

		// 	const row = data

		// 	// url
		// 	row.image_obverse = common.local_to_remote_path(data.image_obverse)
		// 	row.image_reverse = common.local_to_remote_path(data.image_reverse)

		// 	// type_data
		// 	// if (row.type_data) {
		// 	// 	row.type_data = self.parse_type_data(row.type_data)
		// 	// }
		// 	if (row.type_data && row.type_data.length>0) {
		// 		row.type_data = self.parse_type_data(row.type_data)
		// 	}

		// 	row.type = row.type
		// 		? page.remove_gaps(row.type, ' | ')
		// 		: null

		// 	// legend text includes svg url
		// 	row.legend_obverse = row.legend_obverse
		// 		? self.parse_legend_svg(row.legend_obverse)
		// 		: null
		// 	row.legend_reverse = row.legend_reverse
		// 		? self.parse_legend_svg(row.legend_reverse)
		// 		: null

		// 	// countermark text includes svg url
		// 	row.countermark_obverse = row.countermark_obverse
		// 		? self.parse_legend_svg(row.countermark_obverse)
		// 		: null
		// 	row.countermark_reverse = row.countermark_reverse
		// 		? self.parse_legend_svg(row.countermark_reverse)
		// 		: null

		// 	// auction
		// 	row.ref_auction_date = self.parse_date(row.ref_auction_date)

		// 	// find
		// 	row.find_date = self.parse_date(row.find_date)

		// 	row.mib_uri = page_globals.__WEB_BASE_URL__ + page_globals.__WEB_ROOT_WEB__ + "/coin/" + row.section_id

		// 	row.uri = self.parse_iri_data(row.uri)

		// 	// bibliography
		// 	row.bibliography = page.parse_publication(row.bibliography_data)


		// 	// add
		// 	row.mint	= typeof row.type_data[0]!=="undefined"
		// 		? row.type_data[0].mint
		// 		: null
		// 	row.type_number	= typeof row.type_data[0]!=="undefined"
		// 		? row.type_data[0].number
		// 		: null
		// 	// const value = common.clean_gaps((mint + " " + number), " | ", " | ")


		// 	return row
		// },//end parse_coin_data



	/**
	* PARSE_IRI_DATA
	* @return
	*/
	parse_iri_data : function(data) {

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
					console.error(error);
				}
			}
			items.push({
				label : source,
				value : url
			})
		}

		return items
	},//end parse_iri_data



	/**
	* REMOVE_GAPS
	* Removes empty values in multimple values string.
	* Like 'pepe | lepe' when 'pepe | lepe | '
	*/
	remove_gaps : function(value, separator) {
		const beats		= value.split(separator).filter(Boolean)
		const result	= beats.join(separator)

		return result
	},//end remove_gaps



	/**
	* TRIM_CHAR
	* Removes custom char at begining or end of string
	* Like '|pepe | lepe' when 'pepe|' to 'pepe | lepe' when 'pepe' for ('|')
	*/
	trim_char : function(string, charToRemove) {

		if (!string) {
			return string
		}

	    while(string.charAt(0)==charToRemove) {
	        string = string.substring(1);
	    }

	    while(string.charAt(string.length-1)==charToRemove) {
	        string = string.substring(0,string.length-1);
	    }

	    return string;
	},//end trim_char



	/**
	* SPLIT_DATA
	* Safe value split
	*/
	split_data : function(value, separator) {
		const result = value ? value.split(separator) : []
		return result;
	},//end split_data



	/**
	* IS_EMPTY
	* Check if value is empty
	*/
	is_empty : function(value) {

		return value && value.length>0
	},//end is_empty



	/**
	* PARSE_DATE
	* Converts date like '2001-00-00 00:00:00' -> '2001'
	*/
	parse_date : function(timestamp) {

		if (!timestamp || timestamp.length<4) {
			return null
		}

		const year 	= timestamp.substring(0, 4) // 2014-06-24
		const month 	= timestamp.substring(5, 7)
		const day 	= timestamp.substring(8, 10)

		// push in order when not empty
			const ar_parts = []
				if (day && day!='00') {
					ar_parts.push(day)
				}
				if (month && month!='00') {
					ar_parts.push(month)
				}
				if (year && year!='00') {
					ar_parts.push(year)
				}

		const date = ar_parts.join('-')


		return date
	},//end parse_date



	/**
	* PARSE_PUBLICATION
	* Modify the received data by recombining publication information
	* @return array parsed_data
	*/
		// parse_publication : function(data) {

		// 	const parsed_data	= []
		// 	const separator		= " # ";
		// 	const data_length	= data.length
		// 	for (let i = 0; i < data_length; i++) {

		// 		const reference = data[i]

		// 		// add publications property to store all resolved references
		// 			reference._publications = []

		// 		const publications_data			= JSON.parse(reference.publications_data)
		// 		const publications_data_length	= publications_data.length
		// 		if (publications_data_length>0) {

		// 			const ref_publications_authors	= page.split_data(reference.ref_publications_authors, separator)
		// 			const ref_publications_date		= page.split_data(reference.ref_publications_date, separator)
		// 			const ref_publications_editor	= page.split_data(reference.ref_publications_editor, separator)
		// 			const ref_publications_magazine	= page.split_data(reference.ref_publications_magazine, separator)
		// 			const ref_publications_place	= page.split_data(reference.ref_publications_place, separator)
		// 			const ref_publications_title	= page.split_data(reference.ref_publications_title, separator)
		// 			const ref_publications_url		= page.split_data(reference.ref_publications_url, separator)

		// 			for (let j = 0; j < publications_data_length; j++) {

		// 				const section_id = publications_data[j]

		// 				const parsed_item = {
		// 					reference	: reference.section_id,
		// 					section_id	: section_id,
		// 					authors		: ref_publications_authors[j] || null,
		// 					date		: ref_publications_date[j] || null,
		// 					editor		: ref_publications_editor[j] || null,
		// 					magazine	: ref_publications_magazine[j] || null,
		// 					place		: ref_publications_place[j] || null,
		// 					title		: ref_publications_title[j] || null,
		// 					url			: ref_publications_url[j] || null,
		// 				}

		// 				reference._publications.push(parsed_item)
		// 				parsed_data.push(parsed_item)
		// 			}
		// 		}

		// 	}
		// 	// console.log("parsed_data:",parsed_data);

		// 	return parsed_data
		// },//end parse_publication



	/**
	* ACTIVATE_IMAGES_GALLERY
	* @return promise
	*/
	activate_images_gallery : function(images_gallery_container, clean) {

		// clean existing
			if (clean===true) {
				const old_poptrox_overlay = document.querySelectorAll('.poptrox-overlay')
				if (old_poptrox_overlay) {
					for (let i = old_poptrox_overlay.length - 1; i >= 0; i--) {
						old_poptrox_overlay[i].remove()
					}
				}
			}


		return $(images_gallery_container).poptrox({
			baseZIndex: 20000,
			fadeSpeed: 1,
			// onPopupClose: function() { $body.removeClass('modal-active'); },
			// onPopupOpen: function() { $body.addClass('modal-active'); },
			overlayOpacity: 0.5,
			popupCloserText: '',
			popupHeight: 150,
			popupWidth: 150,
			popupLoaderText: '',
			popupSpeed: 1,
			selector: 'a.image_link',
			usePopupCaption: false,
			usePopupCloser: true,
			usePopupDefaultStyling: false,
			usePopupForceClose: true,
			usePopupLoader: true,
			usePopupNav: true,
			windowMargin: 50
		})
	},//end activate_images_gallery



	/**
	* MAP_POPUP_BUILDER
	* Build DOM nodes to insert into map pop-up
	*/
	map_popup_builder : function(item) {
		// console.log("-> map_popup_builder item:",item);

		const self = this

		const popup_wrapper = common.create_dom_element({
			element_type	: "div",
			class_name		: "popup_wrapper"
		})

		const group = item.group

		// order group
			const collator = new Intl.Collator('es',{ sensitivity: 'base', ignorePunctuation:true});
			group.sort( (a,b) => {return collator.compare(a.title , b.title)});

		const build_pop_item = function(group_data){

			const section_id	= group_data.section_id
			// const table			= group_data.table
			const title			= group_data.title || "Undefined title " + section_id
			const description	= group_data.description
			// const image_url		= group_data.identifying_images


			// popup_item
				const popup_item = common.create_dom_element({
					element_type	: "div",
					class_name		: "popup_item",
					parent			: popup_wrapper
				})

			// image
				// const image_wrapper = common.create_dom_element({
				// 	element_type	: "div",
				// 	class_name		: "image_wrapper",
				// 	parent			: popup_item
				// })
				// image_wrapper.addEventListener("click",function(e){
				// 	// event publish map_selected_marker
				// 	event_manager.publish('map_popup_selected_item', {
				// 		item		: image_wrapper,
				// 		section_id	: section_id,
				// 		table		: table,
				// 		title		: title
				// 	})
				// })
				// const item_image = common.create_dom_element({
				// 	element_type	: "img",
				// 	src				: image_url,
				// 	parent			: image_wrapper
				// })
				// // calculate bg color and load hi res image
				// page.build_image_with_background_color(image_url, image_wrapper)
				// .then(function(response){

				// 	const img			= response.img // dom node
				// 	const format		= response.format // vertical | horinzontal
				// 	const bg_color_rgb	= response.bg_color_rgb

				// 	// set item_wrapper format class vertical / horizontal
				// 	// popup_item.classList.add(format)

				// 	// set image node style to loaded (activate opacity transition)
				// 	item_image.classList.add('loaded')

				// 	// load high resolution image
				// 		// const image_url = row.identifying_images_combi && row.identifying_images_combi[0]
				// 		// 	? row.identifying_images_combi[0].url
				// 		// 	: __WEB_TEMPLATE_WEB__ + '/assets/images/default.jpg'

				// 		// item_image.src = image_url
				// })

			// text_title
				const text_title = common.create_dom_element({
					element_type	: "div",
					class_name		: "text_title",
					inner_html		: title,
					parent			: popup_item
				})

			// tooltip descriptions
				if (description && description.length>3) {
					// page.add_tooltip({
					// 	element : text_title,
					// 	content : description
					// })
					const text_description = common.create_dom_element({
						element_type	: "div",
						class_name		: "text_description",
						inner_html		: description,
						parent			: popup_item
					})
				}
		}

		const group_length	= group.length
		let limit			= 100

		function iterate(from, to) {
			for (let i = from; i < to; i++) {
				build_pop_item(group[i])
			}
			// Load more button
			if (to<(group_length-1)) {
				const more_node = common.create_dom_element({
					element_type	: "input",
					type			: 'button',
					value			: tstring['load_more'] || "Load more..",
					class_name		: "more_node btn btn-light btn-block primary",
					// inner_html	: tstring['load_more'] || "Load more..",
					parent			: popup_wrapper
				})
				more_node.addEventListener("click", function(){
					const _from	= this.offset + 1
					const _to	= ((_from + limit) < group_length) ? (_from + limit) : group_length
					iterate(_from, _to)

					this.remove()
				})
				more_node.offset = to
			}
		}

		// first elements from zero to limit
		const to = limit < group_length ? limit : group_length
		iterate(0, to)


		return popup_wrapper
	},//end map_popup_builder




}//end page
