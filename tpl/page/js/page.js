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
		}
	},




	/**
	* SETUP
	*/
	setup : function() {
		
		var self = this
		
		// window.ready(function(){
			self.hilite_lang(page_globals.WEB_CURRENT_LANG_CODE)
		// })
		
		return true	
	},//end setup



	/**
	* HILITE_LANG
	*/
	hilite_lang : function(lang) {
		
		// Lang selected
			var page_lang_selector = document.getElementById("page_lang_selector")
			if (page_lang_selector) {
				var nodes = page_lang_selector.querySelectorAll("a")
				for (var i = 0; i < nodes.length; i++) {
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
		return value.replace(/\/dedalo\/media\/svg\//g, page_globals.__WEB_MEDIA_BASE_URL__ + "/dedalo/media/svg/")
	},//end parse_legend_svg



	/**
	* PARSE_CATALOG_DATA
	* @param object row | array rows
	* @return object row | array rows
	*/
	parse_catalog_data : function(data) {
		console.log("------------> parse_catalog_data data:",data);
		const self = this

		// array case
			if (Array.isArray(data)) {
				const new_data = []
				const data_length = data.length
				for (let i = 0; i < data_length; i++) {
					new_data.push( self.parse_catalog_data(data[i]) )
				}
				return new_data
			}

		const row = data

		// url
		row.ref_coins_image_obverse = common.local_to_remote_path(data.ref_coins_image_obverse)
		row.ref_coins_image_reverse = common.local_to_remote_path(data.ref_coins_image_reverse)

		row.ref_type_legend_obverse = row.ref_type_legend_obverse
			? self.parse_legend_svg(row.ref_type_legend_obverse)
			: null
		row.ref_type_legend_reverse = row.ref_type_legend_reverse
			? self.parse_legend_svg(row.ref_type_legend_reverse)
			: null

		return row
	},//end parse_catalog_data



	/**
	* PARSE_TYPE_DATA
	* @param object row | array rows
	* @return object row | array rows
	*/
	parse_type_data : function(data) {
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

		// permanent uri
		// row.permanent_uri = page_globals.__WEB_BASE_URL__ + page_globals.__WEB_ROOT_WEB__ + "/coin/" + row.section_id


		return row
	},//end parse_type_data



	/**
	* PARSE_COIN_DATA
	* @param object row | array rows
	* @return object row | array rows
	*/
	parse_coin_data : function(data) {
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
		row.ref_auction_date = self.parse_date(row.ref_auction_date)

		// find
		row.find_date = self.parse_date(row.find_date)

		row.uri = page_globals.__WEB_BASE_URL__ + page_globals.__WEB_ROOT_WEB__ + "/coin/" + row.section_id

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
	},//end parse_coin_data



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
	parse_publication : function(data) {

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
	},//end parse_publication



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
			popupLoaderText: '',
			popupSpeed: 1,
			popupWidth: 150,
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




}//end page


