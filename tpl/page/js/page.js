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
	}//end adjust_footer_position



	/**
	* ACTIVATE_TOOLTIPS
	*/
	activate_tooltips : function( elements ) {

		if(SHOW_DEBUG===true) {
			//console.log("elements:",elements);
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



}//end page

page.setup()