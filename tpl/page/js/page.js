"use strict";
/**
* PAGE JS
*
*
*/
var page = {



	trigger_url : page_globals.__WEB_ROOT_WEB__ + "/web/trigger.web.php",



	/**
	* SETUP
	*/
	setup : function() {
		
		var self = this
		
		window.ready(function(){
			self.hilite_lang(page_globals.WEB_CURRENT_LANG_CODE)
		})
		
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
	* INIT_MAP
	*/
	init_map : function(options) {

		const self = this

		// short vars
			const map_data			= options.map_data	
			const div_container_id	= options.div_container_id // "map_container"
				console.log("div_container_id:",div_container_id);

		// default vars set
			self.map = null
			self.layer_control = false
			self.loaded_document = false
			self.icon_main = null
			self.icon_finds= null
			self.icon_uncertain = null
			self.popupOptions = null
			self.current_layer = null
			self.current_group = null
			self.initial_map_data = {
				x 		: 40.1,
				y 		: 9,
			 	zoom 	: 8, // (13 for dare, 8 for osm)
			 	alt 	: 16
			}
			self.option_selected = null

		
		

		// MAP_DATA : defaults Define main map element default data			
			const map_x 	= map_data.lat
			const map_y 	= map_data.lon
			const map_zoom 	= map_data.zoom
		
				
		// layer. Add layer to map 
			//var dare 		= new L.TileLayer('http://dare.ht.lu.se/tiles/imperium/{z}/{x}/{y}.png');
			const dare 		= new L.TileLayer('http://pelagios.org/tilesets/imperium/{z}/{x}/{y}.png',{ maxZoom: 11 });		
			const arcgis 	= new L.tileLayer('//server.arcgisonline.com/ArcGIS/' + 'rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');
			const osm 		= new L.TileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
			
		// map
			// self.map = new L.map(div_container_id, {layers: [osm], center: new L.LatLng(map_data.x, map_data.y), zoom: map_data.zoom});
			self.map = new L.map(div_container_id, {layers: [osm], center: new L.LatLng(map_x, map_y), zoom: map_zoom});

		// layer selector
			const base_maps = {
				dare 	: dare,
				arcgis 	: arcgis,
				osm 	: osm
			}
			// if(self.layer_control===false || self.loaded_document===true) {
				self.layer_control = L.control.layers(base_maps).addTo(self.map);
			// }

		// disable zoom handlers
			self.map.scrollWheelZoom.disable();

		// icons 
			self.icon_main = L.icon({
			    //iconUrl: 	  __WEB_TEMPLATE_WEB__ + "/assets/lib/leaflet/images/marker-icon.png",
			    iconUrl: 	  __WEB_TEMPLATE_WEB__ + "/assets/lib/leaflet/images/naranja.png",
			    shadowUrl: 	  __WEB_TEMPLATE_WEB__ + "/assets/lib/leaflet/images/marker-shadow.png",
			    iconSize:     [47, 43], // size of the icon
			    shadowSize:   [41, 41], // size of the shadow
			    iconAnchor:   [10, 19], // point of the icon which will correspond to marker's location
			    shadowAnchor: [0, 20],  // the same for the shadow
			    popupAnchor:  [12, -20] // point from which the popup should open relative to the iconAnchor
			});

			self.icon_finds = L.icon({
			    //iconUrl: 	  __WEB_TEMPLATE_WEB__ + "/assets/lib/leaflet/images/marker-icon.png",
			    iconUrl: 	  __WEB_TEMPLATE_WEB__ + "/assets/lib/leaflet/images/verde.png",
			    shadowUrl: 	  __WEB_TEMPLATE_WEB__ + "/assets/lib/leaflet/images/marker-shadow.png",
			    iconSize:     [47, 43], // size of the icon
			    shadowSize:   [41, 41], // size of the shadow
			    iconAnchor:   [10, 19], // point of the icon which will correspond to marker's location
			    shadowAnchor: [0, 20],  // the same for the shadow
			    popupAnchor:  [12, -20] // point from which the popup should open relative to the iconAnchor
			});

			self.icon_uncertain = L.icon({
			    iconUrl: 	  __WEB_TEMPLATE_WEB__ + "/assets/lib/leaflet/images/marker-uncertainty.png",
			    //shadowUrl:  __WEB_TEMPLATE_WEB__ + "/assets/lib/leaflet/images/marker-shadow.png",
			    iconSize:     [50, 50], // size of the icon
			    //shadowSize:   [41, 41], // size of the shadow
			    iconAnchor:   [25, 25], // point of the icon which will correspond to marker's location
			    //shadowAnchor: [0, 20],  // the same for the shadow
			    popupAnchor:  [12, -20] // point from which the popup should open relative to the iconAnchor
			});

		// popupOptions
			self.popupOptions =	{
				maxWidth	: '758',
				closeButton	: true
			}

		return true
	},//end init_map



	/**
	* REQUEST
	* Make a fetch request to server api
	* @param object options
	* @return promise api_response
	*/
	request : async function(options) {

			console.log("request options:",options);

		const url 			= options.url || page_globals.JSON_TRIGGER_URL
		const method 		= options.method || 'POST' // *GET, POST, PUT, DELETE, etc.
		const mode 			= options.mode || 'cors' // no-cors, cors, *same-origin
		const cache 			= options.cache || 'no-cache' // *default, no-cache, reload, force-cache, only-if-cached
		const credentials 	= options.credentials || 'same-origin' // include, *same-origin, omit
		const headers 		= options.headers || {'Content-Type': 'application/json'}// 'Content-Type': 'application/x-www-form-urlencoded'
		const redirect 		= options.redirect || 'follow' // manual, *follow, error
		const referrer 		= options.referrer || 'no-referrer' // no-referrer, *client
		const body 			= options.body // body data type must match "Content-Type" header

		// code defaults
			if (!body.code) {
				body.code = '654asdiKrhdTetQksl?uoQaW2'
			}
		// lang defaults
			if (!body.lang) {
				body.lang = page_globals.WEB_CURRENT_LANG_CODE
			}			

		const handle_errors = function(response) {
			if (!response.ok) {
				console.warn("-> handle_errors response:",response);
				throw Error(response.statusText);
			}
			return response;
		}

	 	const api_response = fetch(
	 		url,
	 		{
				method		: method,
				mode		: mode,
				cache		: cache,
				credentials	: credentials,
				headers		: headers,
				redirect	: redirect,
				referrer	: referrer,
				body		: JSON.stringify(body)
			})
			.then(handle_errors)
			.then(response => {
				// console.log("-> json response 1 ok:",response.body);
				const json_parsed = response.json().then((result)=>{
					//console.log("-> json result 2:",result);
					return result
				})
				return json_parsed
			})// parses JSON response into native Javascript objects
			.catch(error => {
				console.error("!!!!! [page data_manager.request] ERROR:", error)
				return {
					result 	: false,
					msg 	: error.message,
					error 	: error
				}
			});

		return api_response
	},//end request



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
			const remote_url = url.replace(/\/dedalo\/media_test\/media_monedaiberica\//g, page_globals.__WEB_MEDIA_BASE_URL__ + "/dedalo/media/")
			return remote_url
		}
		// /dedalo/media_test/media_monedaiberica		

		return null
	}//end remote_image



}//end page

