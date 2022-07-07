/**
* WEB_TS_TERM
*
*
*
*/
var web_ts_term = new function() {


	this.url_trigger 		 = page_globals.__WEB_TEMPLATE_WEB__ + "/lib/web_ts_term/trigger.web_ts_term.php"
	this.ar_childrens_loaded = {}
	this.ar_index_loaded 	 = {}



	$( document ).ready(function() {
	
		var ar_childrens_loaded = JSON.parse(localStorage.getItem('ar_loaded_web_ts_term'));
		//console.log(ar_childrens_loaded);

		// Cuando exista la variable 'web_ts_term_to_open', es porque estamos buscando (thesaurus search)
		// y la hemos generado en 'web_ts_term_list.phtml'
		// console.log(web_ts_term_to_open);
		if (typeof web_ts_term_to_open !== 'undefined') {
			ar_childrens_loaded = web_ts_term_to_open
			//console.log( ar_childrens_loaded )
		}
		
		for (var prop in ar_childrens_loaded) {
			//console.log("obj." + prop + " = " + ar_childrens_loaded[prop]);

			if (ar_childrens_loaded[prop]=='loaded') {
				// Case value is 'loaded'
				var button_obj = document.querySelector('div.icon_show_childrens[data-term_id="'+prop+'"]')
					//console.log( prop );		
				if (button_obj) {
					web_ts_term.toggle_childrens(button_obj, false)
				}
			}else{
				// Case value is 'closed', remove from object
				//delete web_ts_term.ar_childrens_loaded[prop]
			}
		}

		web_ts_term.highlight_terms()
	});



	/**
	* TOGGLE_CHILDRENS
	* @param dom object button_obj
	*/
	this.toggle_childrens = function( button_obj, async ) {
	
		//var ar_highlight = window.ar_highlight ? JSON.parse(window.ar_highlight) : [];		
		//console.log(ar_highlight);

		//var trigger = page_globals.__WEB_TEMPLATE_WEB__ + "/lib/web_ts_term/trigger.web_ts_term.php"
		
		var tree_mode = typeof(window.tree_mode)!="undefined" ? window.tree_mode : false
			//console.log("tree_mode: ",tree_mode);
		
		var term_id  = button_obj.dataset.term_id
		var	mydata   = { 
					mode 			: 'toggle_childrens',
					term_id 		: button_obj.dataset.term_id,
					ar_childrens  	: JSON.parse(button_obj.dataset.ar_childrens),
					tree_mode 		: tree_mode
					}; //console.log("mydata",mydata,this.url_trigger);
	
		if (async!==false) { async = true };		

		// if visible is set remove it, otherwise add it
		button_obj.classList.toggle("arrow_dow");

		// childrens_wrapper
		var wrapper  = document.getElementById('childrens_wrapper_'+term_id)
		if (!wrapper) {return alert('Error')};

		if (wrapper.style.display=='none' && web_ts_term.ar_childrens_loaded[term_id]=='closed') {
			wrapper.style.display = 'block';		//console.log("Load is not necessary 1");	

			web_ts_term.ar_childrens_loaded[term_id] = 'loaded'
			localStorage.setItem('ar_loaded_web_ts_term', JSON.stringify(web_ts_term.ar_childrens_loaded))	
			return false;
		}

		if (wrapper.style.display==='block') {
			wrapper.style.display='none'

				// Delete element on close and update local storage
				//delete web_ts_term.ar_childrens_loaded[term_id]
				web_ts_term.ar_childrens_loaded[term_id] = 'closed'
				localStorage.setItem('ar_loaded_web_ts_term', JSON.stringify(web_ts_term.ar_childrens_loaded))	
			return false;
		}else{

		}

		/*
		if (web_ts_term.ar_childrens_loaded[term_id]) {
			wrapper.style.display = 'block';		console.log("Load is not necessary 2");		
			return false;
		}
		*/

		wrapper.classList.add("loading");
		wrapper.style.display = 'block';

		//var jsPromise = Promise.resolve(

			// AJAX CALL
			$.ajax({
				'url'	: this.url_trigger,
				'data'  : mydata,
				'type'	: "POST",
				'async' : async    
			})
			// DONE
			.done(function(data_response) {

				// If data_response contain 'error' show alert error with (data_response) else reload the page
				if(/Error/.test(data_response)) {
					// Alert error
					wrapper.innerHTML = "[toggle_childrens] Request failed: \n" + data_response;
					if(SHOW_DEBUG===true) {
						console.log(data_response);
					}					
				}else{
					
					wrapper.innerHTML = data_response

					// Add element on open and update local storage
					web_ts_term.ar_childrens_loaded[term_id] = 'loaded'//term_id				
					localStorage.setItem('ar_loaded_web_ts_term', JSON.stringify(web_ts_term.ar_childrens_loaded))
					//console.log(web_ts_term.ar_childrens_loaded);
					//console.log(JSON.stringify(web_ts_term.ar_childrens_loaded));
					
					// AR_HIGHLIGHT terms 
					//web_ts_term.highlight_terms()
					/*
					var len = ar_highlight.length
					if(len>0) {
						for (var i = len - 1; i >= 0; i--) {
							var current_term_id = ar_highlight[i]

							// WEB_TS_TERM
							if (document.getElementById('web_ts_term_'+current_term_id)) {								
								document.getElementById('web_ts_term_'+current_term_id).classList.add("highlight_term")
							}

							// WEB_INDEXATION_NODE
							// console.log(current_term_id);
							// console.log( document.getElementById('button_toggle_indexation_'+current_term_id) );
							if (document.getElementById('button_toggle_indexation_'+current_term_id)) {								
								web_ts_term.toggle_indexation( document.getElementById('button_toggle_indexation_'+current_term_id) )
							}
						}						
					}
					*/
					// activate_tooltips
						tpl_common.activate_tooltips()

				}
			})
			.fail( function(jqXHR, textStatus) {				
				console.log("Error: " + jqXHR.statusText+ " (" + textStatus + ")" );
				wrapper.innerHTML = "Sorry. Failed load"
			})
			.always(function() {
				wrapper.classList.remove("loading");
			})

		//)//end promise

		//return jsPromise;
	}//end toggle_childrens



	/**
	* HIGHLIGHT_TERMS
	* @return 
	*/
	this.highlight_terms = function() {
		var ar_highlight = window.ar_highlight ? JSON.parse(window.ar_highlight) : [];		
		//console.log(ar_highlight);

		var len = ar_highlight.length
		if(len>0) {
			for (var i = len - 1; i >= 0; i--) {
				var current_term_id = ar_highlight[i]

				// WEB_TS_TERM
				if (document.getElementById('web_ts_term_'+current_term_id)) {								
					document.getElementById('web_ts_term_'+current_term_id).classList.add("highlight_term")
				}

				// WEB_INDEXATION_NODE
				// console.log(current_term_id);
				// console.log( document.getElementById('button_toggle_indexation_'+current_term_id) );
				if (document.getElementById('button_toggle_indexation_'+current_term_id)) {								
					web_ts_term.toggle_indexation( document.getElementById('button_toggle_indexation_'+current_term_id) )
				}
			}
		}
	};//end highlight_terms




	/**
	* TOGGLE_INDEXATION
	* @param dom object button_obj
	*/
	this.toggle_indexation = function( button_obj ) {

		const term_id 		= button_obj.dataset.term_id
		const ar_legends 	= JSON.parse(button_obj.dataset.ar_legends)
		const ar_cmk 		= JSON.parse(button_obj.dataset.ar_cmk)
		
		const mydata  = {
				mode 		 	: 'toggle_indexation',
				term_id 		: term_id,
				ar_legends  	: ar_legends,
				ar_cmk  		: ar_cmk
			}; console.log(mydata);

		// index_wrapper
		var wrapper  = document.getElementById('index_wrapper_'+term_id)

		wrapper.classList.toggle("hidden");

		if (wrapper.classList.contains("hidden")) {
			wrapper.parentNode.classList.remove("open")		
			return false;
		}

		// if (web_ts_term.ar_index_loaded[term_id]) {
		// 	wrapper.style.display = 'table';
		// 	return false; //TEMPORAL DEACTIVATED !!!!!!!!!!!!!!!!!!!!!!!!!
		// }

		wrapper.classList.add("loading");
		wrapper.parentNode.classList.add("open")
		// wrapper.style.display = 'table';

		// AJAX CALL
		$.ajax({
			url     : this.url_trigger,
			data    : mydata,
			type    : "POST",     
		})
		// DONE
		.done(function(data_response) {
				// console.log("data_response:",data_response); return
			// parse result
				const ar_indexation_node = JSON.parse(data_response)
				if(ar_indexation_node.result === false) return

			// clean wrapper
				while (wrapper.hasChildNodes()) {
					wrapper.removeChild(wrapper.lastChild);
				}

			// create nodes
				// get the types
					const types 	= ar_indexation_node.result.find(item => item.id === 'type')
					const coins 	= ar_indexation_node.result.find(item => item.id === 'coins')
				
				//types
					const rows_types 		= (types) ? types.result : []
					const rows_types_len 	= rows_types.length
					for (var i = 0; i < rows_types_len; i++) {
					
						const item = rows_types[i]
						const title = []
						const type_id = page_globals.OWN_CATALOG_ACRONYM  + " " + item.section_id + "/"+ item.number
						
						title.push(type_id)
						if(item.denomination){
							title.push(item.denomination)
						}

						if(item.material){
							title.push(item.material)
						}			
						
						const ar_beats = []
						if (item.averages_weight && item.averages_weight.length>0) {
							const averages_weight = (item.total_weight_items)
								? item.averages_weight + " g" +" ("+ item.total_weight_items +")"
								: item.averages_weight + " g"

							ar_beats.push( averages_weight )
						}
		
						if (item.averages_diameter && item.averages_diameter.length>0) {

							const averages_diameter = (item.total_diameter_items)
								? item.averages_diameter + " mm" +" ("+ item.total_diameter_items +")"
								: item.averages_diameter + " mm"+

							ar_beats.push( averages_diameter)
						}
						const size_text = ar_beats.join("; ")

						title.push(size_text)	

						const type_text = title.join(" | ")

						//type_wrapper
							const type_wrapper = common.create_dom_element({
								element_type	: "span",
								class_name		: "type_wrapper",
								parent			: wrapper
							})

							type_wrapper.addEventListener('mouseup', function(){
								window.open('./type/'+item.section_id, '_blank');
							})


						// mint 
							const mint = common.create_dom_element({
								element_type	: "div",
								class_name		: "value_label type_mint",
								inner_html		: item.mint,
								parent			: type_wrapper
							})
						// type 
							const type = common.create_dom_element({
								element_type	: "div",
								class_name		: "value_label type",
								inner_html		: type_text,
								parent			: type_wrapper
							})

						//img_wrapper
							const img_wrapper = common.create_dom_element({
								element_type	: "span",
								class_name		: "img_wrapper",
								parent			: type_wrapper
							})


						// imag  obverse
							const img_obv = common.create_dom_element({
								element_type 	: "img",
								class_name 		: "image image_obverse",
								src				: page.remote_image(item.ref_coins_image_obverse),
								parent			: img_wrapper
							})
						// imag  reverse
							const img_rev = common.create_dom_element({
								element_type 	: "img",
								class_name 		: "image image_reverse",
								src				: page.remote_image(item.ref_coins_image_reverse),
								parent			: img_wrapper
							})
					}

				//coins
					const rows_coins 		= (coins) ? coins.result : []
					const rows_coins_len 	= rows_coins.length

					for (var i = 0; i < rows_coins_len; i++) {
					
						const item = rows_coins[i]

						//type_wrapper
							const type_wrapper = common.create_dom_element({
								element_type	: "span",
								class_name		: "type_wrapper",
								parent			: wrapper
							})

							type_wrapper.addEventListener('mouseup', function(){
								window.open('./coin/'+item.section_id, '_blank');
							})


						//img_wrapper
							const img_wrapper = common.create_dom_element({
								element_type	: "span",
								class_name		: "img_wrapper",
								parent			: type_wrapper
							})


						// imag  obverse
							const img_obv = common.create_dom_element({
								element_type 	: "img",
								class_name 		: "image image_obverse",
								src				: page.remote_image(item.image_obverse),
								parent			: img_wrapper
							})
						// imag  reverse
							const img_rev = common.create_dom_element({
								element_type 	: "img",
								class_name 		: "image image_reverse",
								src				: page.remote_image(item.image_reverse),
								parent			: img_wrapper
							})

						
						// collection 
							const mint = common.create_dom_element({
								element_type	: "div",
								class_name		: "value_label type_collection",
								inner_html		: item.collection,
								parent			: type_wrapper
							})

						// auction  Classical Numismatic Group | 18-05-2011, nº 87 (13.47 g; 6 h; 26 mm)


							// line
							const line = common.create_dom_element({
								element_type	: "div",
								class_name		: "info_line inline"
							})

							common.create_dom_element({
								element_type 	: "span",
								class_name 		: name,
								text_content 	: item.ref_auction,
								parent 			: line
							})


							const split_time 	= (item.ref_auction_date)
								? item.ref_auction_date.split(' ')
								: [""]
							const split_date 	= split_time[0].split('-')
							const correct_date 	= split_date.reverse()
							const final_date 	= correct_date.join("-")

							if (final_date) {
								common.create_dom_element({
									element_type 	: "span",
									class_name 		: name,
									text_content 	: " | "+final_date,
									parent 			: line
								})
							}

							if(item.ref_auction_number){
								common.create_dom_element({
									element_type 	: "span",
									class_name 		: name,
									text_content 	: ", "+(tstring.n || "nº") +" "+ item.ref_auction_number,
									parent 			: line
								})
							}

							const ar_beats = []
							if (item.weight && item.weight.length>0) {
								ar_beats.push( item.weight + " g" )
							}
							if (item.dies && item.dies.length>0) {
								ar_beats.push( item.dies + " h" )
							}
							if (item.diameter && item.diameter.length>0) {
								ar_beats.push( item.diameter + " mm" )
							}
							const size_text = ar_beats.join("; ")

						// size_text 
							common.create_dom_element({
								element_type 	: "span",
								class_name 		: name,
								text_content 	: " ("+size_text+")",
								parent 			: line
							})

							type_wrapper.appendChild(line)

						
					}

			// activate_tooltips
				tpl_common.activate_tooltips()

			// // If data_response contain 'error' show alert error with (data_response) else reload the page
			// if(/Error/.test(data_response)) {
			// 	// Alert error
			// 	wrapper.innerHTML = "[toggle_indexation] Request failed: \n" + data_response;
			// 	console.log(data_response);
			// }else{
			// 	
			// 	wrapper.innerHTML = data_response
			// 
 			// 	// Set as loaded
 			// 	web_ts_term.ar_index_loaded[term_id] = true
			// }
		})
		.fail( function(jqXHR, textStatus) {			
			console.log("Error: " + jqXHR.statusText+ " (" + textStatus + ")" );
			wrapper.innerHTML = "Sorry. Failed load"
		})
		.always(function() {
			wrapper.classList.remove("loading");
		})
	}//end toggle_indexation



	/*
	* RESET_TREE
	*/
	this.reset_tree = function() {

		localStorage.removeItem('ar_loaded_web_ts_term');		
	}



};//end web_ts_term