/*global tstring, page_globals, SHOW_DEBUG, common, $, main_home, Tooltip */
/*eslint no-undef: "error"*/

"use strict";
/**
* PAGE JS
*
*
*/
var page = {


	/**
	* VARS
	*/
		trigger_url : page_globals.__WEB_ROOT_WEB__ + '/web/trigger.web.php',


		default_image : page_globals.__WEB_ROOT_WEB__ + '/tpl/assets/images/default.jpg',

		image_galleries : [],

		// maps common config
		maps_config : {
			// source maps. Used on catalog and item maps
			source_maps : [
				{
					name	: "DARE",
					// url	: '//pelagios.org/tilesets/imperium/{z}/{x}/{y}.png',
					url		: '//dh.gu.se/tiles/imperium/{z}/{x}/{y}.png',
					options	: {
						maxZoom: 11
					},
					default	: true
				},
				{
					name	: "OSM",
					url		: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
					options	: {
						maxZoom	: 19
					}
				},
				{
					name	: 'Map Tiles',
					// url	: 'https://api.maptiler.com/maps/basic/{z}/{x}/{y}@2x.png?key=udlBrEEE2SPm1In5dCNb', // 512 ...
					url		: 'https://api.maptiler.com/maps/basic/256/{z}/{x}/{y}@2x.png?key=udlBrEEE2SPm1In5dCNb', // 256 ok
					// url	: 'https://api.maptiler.com/maps/9512807c-ffd5-4ee0-9781-c354711d15e5/style.json?key=udlBrEEE2SPm1In5dCNb', // vector grey
					options	: {
						maxZoom	: 20
					},
					default	: false
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
					iconUrl			: page_globals.__WEB_TEMPLATE_WEB__ + "/assets/images/map/purple.png?3",
					shadowUrl		: page_globals.__WEB_TEMPLATE_WEB__ + "/assets/images/map/marker-shadow.png",
					iconSize		: [30, 30], // [47, 43], // size of the icon
					shadowSize		: [41, 41], // size of the shadow
					iconAnchor		: [10, 19], // point of the icon which will correspond to marker's location
					shadowAnchor	: [0, 20],  // the same for the shadow
					popupAnchor		: [12, -20], // point from which the popup should open relative to the iconAnchor
					path : { // polygons case style
						weight		: 3, // Stroke width in pixels
						opacity		: 1, // Stroke opacity
						color		: '#fe1500',  // Stroke color
						lineJoin	: 'bevel', // A string that defines shape to be used at the corners of the stroke.
						fill		: false,
						fillColor	: '#fe1500', // Fill color. Defaults to the value of the color option
						fillOpacity	: 0.7, // Fill opacity
						dashArray 	: '5'
						// className 	: 'map_stroke'
					}
				},
				findspot : {
					iconUrl			: page_globals.__WEB_TEMPLATE_WEB__ + "/assets/images/map/orange.png?3",
					shadowUrl		: page_globals.__WEB_TEMPLATE_WEB__ + "/assets/images/map/marker-shadow.png",
					iconSize		: [30, 30], // [47, 43], // size of the icon
					shadowSize		: [41, 41], // size of the shadow
					iconAnchor		: [10, 19], // point of the icon which will correspond to marker's location
					shadowAnchor	: [0, 20],  // the same for the shadow
					popupAnchor		: [12, -20], // point from which the popup should open relative to the iconAnchor
					path : { // polygons case style
						weight		: 3, // Stroke width in pixels
						opacity		: 1, // Stroke opacity
						color		: '#fdb314',  // Stroke color
						lineJoin	: 'bevel', // A string that defines shape to be used at the corners of the stroke.
						fill		: false,
						fillColor	: '#fdb314', // Fill color. Defaults to the value of the color option
						fillOpacity	: 0.7, // Fill opacity
						dashArray 	: '5'
						// className 	: 'map_stroke'
					}
				},
				hoard : {
					iconUrl			: page_globals.__WEB_TEMPLATE_WEB__ + "/assets/images/map/green.png?3",
					shadowUrl		: page_globals.__WEB_TEMPLATE_WEB__ + "/assets/images/map/marker-shadow.png",
					iconSize		: [30, 30], // [47, 43], // size of the icon
					shadowSize		: [41, 41], // size of the shadow
					iconAnchor		: [10, 19], // point of the icon which will correspond to marker's location
					shadowAnchor	: [0, 20],  // the same for the shadow
					popupAnchor		: [12, -20], // point from which the popup should open relative to the iconAnchor
					path : { // polygons case style
						weight		: 3, // Stroke width in pixels
						opacity		: 1, // Stroke opacity
						color		: '#fdb314',  // Stroke color
						lineJoin	: 'bevel', // A string that defines shape to be used at the corners of the stroke.
						fill		: false,
						fillColor	: '#fdb314', // Fill color. Defaults to the value of the color option
						fillOpacity	: 0.7, // Fill opacity
						dashArray 	: '5'
						// className 	: 'map_stroke'
					}
				}
			}
		},



	/**
	* SETUP
	*/
	setup : function() {

		const self = this


		// lang selector activate and hilite_lang
			self.hilite_lang(page_globals.WEB_CURRENT_LANG_CODE)

		// show footer (from opacity zero)
			const footer = document.getElementById('footer')
			if (footer) {
				setTimeout(function(){
					footer.classList.remove('hidded')
				},500)
			}

		// debug_info
			let showing_debug
			document.addEventListener("keydown", function(e){

				// toogle debug info
				if (e.ctrlKey===true && e.key==='d') {
					const all_debug_info = document.querySelectorAll('.debug_info')
					if (all_debug_info) {
						if (showing_debug===true) {
							for (let i = all_debug_info.length - 1; i >= 0; i--) {
								all_debug_info[i].classList.add("hide")
							}
							showing_debug = false
						}else{
							for (let i = all_debug_info.length - 1; i >= 0; i--) {
								all_debug_info[i].classList.remove("hide")
							}
							showing_debug = true
						}
					}
				}
			})


		return true
	},//end setup



	/**
	* HILITE_LANG
	*/
	hilite_lang : function(lang) {

		const page_lang_selector = document.getElementById("page_lang_selector")
		if (page_lang_selector) {

			// Lang selected
				const nodes = page_lang_selector.querySelectorAll("a")
				for (let i = 0; i < nodes.length; i++) {
					if ( nodes[i].href.indexOf(lang) !== -1 ) {
						nodes[i].classList.add("selected")
					}
				}

			// icon globe events
				const lang_globe = document.getElementById('lang_globe')
				lang_globe.addEventListener('click', function(){
					page_lang_selector.classList.toggle("hide")
				})
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
				// console.log("[page.load_more_items] response", response);

				if (response===null) {
					console.warn("[page.load_more_items] Error. Null response");
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
			actual_image.addEventListener("load", function(){
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
			// if(SHOW_DEBUG===true) {
				// console.log("scrollbar:", scrollbar);
			// }

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
				placement	: 'top'
	    	});
		});
	},//end activate_tooltips



	/**
	* BUILD_PAGINATOR_HTML
	* Builds html of paginator from page_nodes
	*/
	build_paginator_html : function(page_nodes_data, container) {

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
							// span
							common.create_dom_element({
								element_type	: "span",
								class_name		: class_name,
								text_content	: label,
								parent			: wrapper_ul
							})
					}else{
						// normal (link)
							common.create_dom_element({
								element_type	: "a",
								class_name		: class_name,
								text_content	: label,
								dataset			: {
									offset	: node.offset_value,
									active	: node.active
								},
								parent			: wrapper_ul
							})

							// link
								if (node.active===true) {
									// const params = {
									// 		offset 	: node.offset_value,
									// 		total 	: page_nodes_data.total
									// 	}

									// const method = typeof goto_url!=="undefined" ? goto_url : "paginator.goto_url"
									// a.addEventListener("click",function(e){

									// 	// exec function custom
									// 		const js_promise = new Promise(function(resolve) {

									// 			let response
									// 			if (typeof method==="function") {
									// 				response = method(params)
									// 			}else{
									// 				response = common.execute_function_by_name(method, window, params)
									// 			}

									// 			resolve(response)
									// 		});

									// 		js_promise.then(function(response){
									// 			// console.log("response typeof:",typeof response, "- response instanceof:",response instanceof Promise);
									// 		})

									// },false)
								}//end if (node.active===true)
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
				element_type	: "img",
				class_name		: "spinner_svg",
				src				: page_globals.__WEB_ROOT_WEB__ + "/tpl/assets/images/spinner.svg"
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

		return null
	},//end remote_image



	/**
	* PARSE_LEGEND_SVG
	* @return
	*/
	parse_legend_svg : function(value) {
		if (value.indexOf('http')!==-1) {
			return value
		}
		return value.replace(/\/dedalo\/media\/svg\//g, page_globals.__WEB_MEDIA_BASE_URL__ + "/dedalo/media/svg/")
	},//end parse_legend_svg



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
	* ACTIVATE_IMAGES_GALLERY
	* @seee https://github.com/ajlkn/jquery.poptrox
	* @return promise
	*/
	activate_images_gallery : function(images_gallery_container, clean) {

		const self = this
		// clean existing
			// if (clean===true) {
			// 	const old_poptrox_overlay = document.querySelectorAll('.poptrox-overlay')
			// 	if (old_poptrox_overlay) {
			// 		for (let i = old_poptrox_overlay.length - 1; i >= 0; i--) {
			// 			old_poptrox_overlay[i].remove()
			// 		}
			// 	}
			// }

		if (clean===true && self.image_galleries.length>0) {
			const currentGalleriesLength = self.image_galleries.length
			for (let i = 0; i < currentGalleriesLength; i++) {
				self.image_galleries[i].removeGallery()
				self.image_galleries.splice(i,1)
			}
		}

		// const newGallery = new image_gallery2({
		// 	galleryNode: images_gallery_container
		// })

		const newGallery = Object.create(image_gallery);
		newGallery.set_up ({
			galleryNode: images_gallery_container
		})

		self.image_galleries.push(newGallery)

		// return $(images_gallery_container).poptrox({
		// 	baseZIndex				: 20000,
		// 	fadeSpeed				: 1,
		// 	// onPopupClose: function() { $body.removeClass('modal-active'); },
		// 	// onPopupOpen: function() { $body.addClass('modal-active'); },
		// 	overlayOpacity			: 0.5,
		// 	popupCloserText			: '',
		// 	popupHeight				: "60%",
		// 	popupWidth				: "60%",
		// 	popupLoaderText			: '',
		// 	popupSpeed				: 1,
		// 	selector				: '.image_link',
		// 	usePopupCaption			: true,
		// 	usePopupCloser			: true,
		// 	usePopupDefaultStyling	: false,
		// 	usePopupForceClose		: true,
		// 	usePopupLoader			: true,
		// 	usePopupNav				: true,
		// 	windowMargin			: 50,
		// 	popupIsFixed			: true

		// })

	},//end activate_images_gallery



	/**
	* MAP_POPUP_BUILDER
	* Build DOM nodes to insert into map pop-up
	*/
	map_popup_builder : function(item) {

		const popup_wrapper = common.create_dom_element({
			element_type	: "div",
			class_name		: "popup_wrapper"
		})

		const group = item.group

		// order group
			const collator = new Intl.Collator('es',{ sensitivity: 'base', ignorePunctuation:true});
			group.sort( (a,b) => {return collator.compare(a.title , b.title)});

		const build_pop_item = function(group_data){

			// group_data vars
				const section_id	= group_data.section_id
				const title			= group_data.title || "Undefined title " + section_id
				const description	= group_data.description
				// const image_url	= group_data.identifying_images

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
				common.create_dom_element({
					element_type	: "div",
					class_name		: "text_title",
					inner_html		: title,
					parent			: popup_item
				})

			// tooltip descriptions
				if (description && description.length>0) {
					// page.add_tooltip({
					// 	element : text_title,
					// 	content : description
					// })
					// text_description
					common.create_dom_element({
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



	// load_hires. When thumb is loaded, this event is triggered
	load_hires : function load_hires() {

		this.removeEventListener("load", load_hires, false)

		const image = this
		const hires = this.hires
		setTimeout(function(){
			image.src = hires
		}, 100)
	},//end load_hires



	/**
	* SORT_ARRAY_BY_PROPERTY
	* Sorts an array by a given property
	*/
	sort_array_by_property : function(array, property) {

		const ar_ordered = array.sort(function (a, b) {
			 return a[property].localeCompare(b[property]);
		});

		return ar_ordered
	}, //end sort_array_by_property



	/**
	* FILTER_DROP_DOWN_LIST
	* Filters drop down list items to show a filtered list depending on the filtering string
	*/
	filter_drop_down_list : function(array, filter_string) {

		return array.filter(function(el) {
			const el_normalized = el.value.normalize('NFD').replace(/[\u0300-\u036f]/g, "")
			const filtered = (el.value.toLowerCase().indexOf(filter_string.toLowerCase()) > -1) || (el_normalized.toLowerCase().indexOf(filter_string.toLowerCase()) > -1)
			return filtered
		})
	},//end filter_drop_down_list



	/**
	* CREATE_EXPANDABLE_BLOCK
	* Create an expandable block when text length is over 500
	*/
	create_expandable_block : function(textBlock, nodeParent) {

		textBlock.classList.add("contracted-block");

		const textBlockSeparator = common.create_dom_element({
			element_type	: "div",
			class_name		: "text-block-separator",
			parent 			: nodeParent
		})

		const separatorArrow = common.create_dom_element({
			element_type	: "div",
			class_name		: "separator-arrow",
			parent 			: textBlockSeparator
		})

		textBlockSeparator.addEventListener("click",function(){
			if (textBlock.classList.contains("contracted-block")){
				textBlock.classList.remove ("contracted-block");
				separatorArrow.style.transform = "rotate(-90deg)";
			} else {
				textBlock.classList.add("contracted-block");
				separatorArrow.style.transform = "rotate(90deg)";
			}
		})

		return true
	},//end create_expandable_block


	/**
	* LOAD_MAIN_CATALOG
	* load the main catalog of the page
	*/
	load_main_catalog : function() {

		// request
			const body = {
				dedalo_get				: 'records',
				db_name					: page_globals.WEB_DB,
				table					: 'main_catalogs',
				lang					: page_globals.WEB_CURRENT_LANG_CODE,
				sql_filter				: 'catalog_name=\''+page_globals.OWN_CATALOG_ACRONYM+'\'',
				limit					: 1,
				resolve_portals_custom	: {
											"publication_data":"publications"
										},
				// group				: (group.length>0) ? group.join(",") : null,
				count					: false,
				// order				: order
			}
			const js_promise = data_manager.request({
				body : body
			})

		return js_promise
	}//end load_main_catalog



	/**
	* SEARCH_FRAGMENT_IN_TEXT
	* @return
	*/
		// search_fragment_in_text : function(q, value, limit) {

		// 	function search(q, text) {

		// 		if (q!=="") {
		// 			const re		= new RegExp(q,"gi"); // search for all instances
		// 			const newText	= text.replace(re, `<mark>${q}</mark>`);
		// 			return newText
		// 		}
		// 		return text
		// 	}

		// 	function truncate(text, limit, after) {
		// 		// Make sure an element and number of items to truncate is provided
		// 		if (!text || !limit) return;

		// 		// Get the inner content of the element
		// 		let content = text.trim();

		// 		// Convert the content into an array of words
		// 		// Remove any words above the limit
		// 		content = content.split(' ').slice(0, limit);

		// 		// Convert the array of words back into a string
		// 		// If there's content to add after it, add it
		// 		content = content.join(' ') + (after ? after : '');

		// 		return content
		// 	}

		// 	// String.prototype.trunc = function(n) {
		// 	//   if (this.length <= n) {
		// 	//     return this;
		// 	//   }
		// 	//   var truncated = this.substr(0, n);
		// 	//   if (this.charAt(n) === ' ') {
		// 	//     return truncated;
		// 	//   }
		// 	//   return truncated.substr(0, truncated.lastIndexOf(' '));
		// 	// }


		// 	// normalize breaks
		// 		value = value.replaceAll('<br />', '<br>');

		// 	// search q position
		// 		// const value_ci	= value.toLowerCase()
		// 		// const q_ci		= q.toLowerCase()
		// 		// const position	= value_ci.indexOf(q_ci)

		// 	// remove accents from text
		// 		const value_normalized	= value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
		// 		const q_normalized		= q.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
		// 		const position			= value_normalized.indexOf(q_normalized)

		// 	let text = ''
		// 	if (position!==-1) {
		// 		// trim text using position

		// 		let _in		= position - (limit/2)
		// 		let _out	= position + (limit/2) + q.length

		// 		const text_slice = value.slice(_in, _out)

		// 		const first_space	= text_slice.indexOf(' ')
		// 		const last_space	= text_slice.lastIndexOf(' ')

		// 		// cut text at first and last spaces
		// 		text = text_slice.slice(first_space, last_space)

		// 		// hilite the q word
		// 		// text = search(q, text)

		// 		const text_normalized	= text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
		// 		text = search(q_normalized, text)

		// 		text = ".. " + text.trim() + " .."

		// 	}else{
		// 		// trim text freely

		// 		// text = truncate(value, limit, null)
		// 		text = ''
		// 	}


		// 	return text
		// },//end search_fragment_in_text



}//end page