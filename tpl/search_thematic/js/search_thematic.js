"use strict";



var search_thematic = {



	setup : function(options) {
		if(SHOW_DEBUG===true) {
			console.log("Activated search_thematic");
		}

		window.ready(function(){
			// Focus search input
			var input_search = document.getElementById("input_search")
				input_search.focus();

		})
		
		
		if (options.rows_data_ejemplos) {
			const rows_data_ejemplos = options.rows_data_ejemplos.result
			this.draw_ejemplos({
				rows_data_ejemplos : rows_data_ejemplos
			})
		}
		
	},//end setup



	draw_ejemplos : function(options) {
	
		const ejemplos_container = document.getElementById("ejemplos_container")

		const js_promise = new Promise(function(resolve) {

			const ejemplos_items = document.getElementById("ejemplos_items")
			// clean ejemplos_items
				while (ejemplos_items.hasChildNodes()) {
					ejemplos_items.removeChild(ejemplos_items.lastChild);
				}
					
			const rows_data_ejemplos 		= options.rows_data_ejemplos
			const rows_data_ejemplos_length = rows_data_ejemplos.length
			for (var i = 0; i < rows_data_ejemplos.length; i++) {
				
				const item = rows_data_ejemplos[i]

				const node_id 			= item.node_id
				const term_id 	  		= item.term_id
				const term 	  			= "" // item.term
				const locator_json 		= [item.locator]
				const locator_key  		= 0
				const total_locators 	= item.group_locators.length
				const image_url 		= item.image_url

				const indexation_item = ui.thematic.build_indexation_item({
					node_id			: node_id,
					term_id 		: term_id,
					term 			: term,
					locator_json 	: locator_json,
					locator_key  	: locator_key,
					total_locators 	: total_locators,
					image_url 	 	: image_url					
				})

				ejemplos_items.appendChild(indexation_item)		
			}

			resolve(true)
		})
		.then(function(response){
	
			ejemplos_container.classList.remove("hide")

			// activate_tooltips
				tpl_common.activate_tooltips()
		})
	},//end draw_ejemplos



	go_to_term : function(button_obj, term_label) {
		//console.log("button_obj:",term_label);

		var url = "search_thematic/?q=" + term_label

		window.location.href = url
	},//end go_to_term



	/**
	* RESET_TREE
	*/
	reset_tree : function( button_obj ) {
		
		//ts_term.reset_tree()
		var url = document.location.origin + document.location.pathname
		document.location.href = url;		
	},//end reset_tree



}//end search_thematic