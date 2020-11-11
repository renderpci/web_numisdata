/*global get_label, page_globals, SHOW_DEBUG, DEDALO_CORE_URL*/
/*eslint no-undef: "error"*/
"use strict";



var row_fields = {


	// caller. Like 'type'
	caller : null,



	draw_item : function(item) {

		const self = this

		const fragment = new DocumentFragment()


		// dedalo_link
			if (dedalo_logged===true) {
				const dedalo_link_link = self.dedalo_link(item, 'numisdata3')
				fragment.appendChild(dedalo_link_link)
			}

		// catalog_hierarchy
			fragment.appendChild(
				self.catalog_hierarchy(item, "catalog_hierarchy")
			)


		const identify_coin = common.create_dom_element({
			element_type	: "div",
			class_name		: "identify_coin_wrapper gallery",
			parent 			: fragment
		})

		// ref_coins_image_obverse
			identify_coin.appendChild(
				self.image(item, "ref_coins_image_obverse")
			)

		// ref_coins_image_reverse
			identify_coin.appendChild(
				self.image(item, "ref_coins_image_reverse")
			)

		// identify_coin
			fragment.appendChild(
				self.identify_coin(item, "identify_coin")
			)

		// id_line
			fragment.appendChild(
				self.id_line(item, "id_line")
			)

		// design_obverse
			fragment.appendChild(
				self.default(item, "design_obverse")
			)

		// symbol_obverse
			fragment.appendChild(
				self.default(item, "symbol_obverse")
			)

		// legend_obverse
			fragment.appendChild(
				self.default(item, "legend_obverse", page.local_to_remote_path)
			)	
		
		// design_reverse
			fragment.appendChild(
				self.default(item, "design_reverse")
			)

		// symbol_reverse
			fragment.appendChild(
				self.default(item, "symbol_reverse")
			)

		// legend_reverse
			fragment.appendChild(
				self.default(item, "legend_reverse", page.local_to_remote_path)
			)

		// equivalents : "ACIP | 1567<br>CNH | 237/1"
			fragment.appendChild(
				self.default(item, "equivalents", function(value){
					const beats = page.split_data(value, "<br>")
					const ar_final = []
					for (let i = 0; i < beats.length; i++) {
						ar_final.push( beats[i].replace(/ \| /g, ' ') )
					}
					return ar_final.join(" | ")
				})
			)

		// permanent_uri
			fragment.appendChild(
				self.default(item, "section_id", function(value){
					const label		= tstring.permanent_uri || "Permanent URI"
					const url		= page_globals.__WEB_ROOT_WEB__ + "/type/" + value 
					const full_url	= page_globals.__WEB_BASE_URL__ + url
					return label + ": <a href=\"" + url + "\">" +  full_url + "</a>"
				})
			)

		// // catalog hierarchy
		// 	fragment.appendChild(
		// 		self.default(item, "section_id", function(value){					
		// 			return "<em>Info about current type catalog hierarchy. Catalog section_id: " + item["catalogue_data"] + "</em>"
		// 		})
		// 	)

		// public_info
			fragment.appendChild(
				self.default(item, "public_info", page.local_to_remote_path)
			)

		// label items (ejemplares)
			fragment.appendChild(
				self.label(item, "items")
			)

		// items (ejemplares) list
			fragment.appendChild(
				self.items_list(item, "items_list")
			)

		// label findspot (hallazgos)
			fragment.appendChild(
				self.label(item, "findspot")
			)

		// findspots (hallazgos) list
			fragment.appendChild(
				self.findspots(item, "findspots")
			)


		// row_wrapper
			const row_wrapper = common.create_dom_element({
				element_type	: "div",
				class_name		: "row_wrapper"
			})
			row_wrapper.appendChild(fragment)


		return row_wrapper
	},//end draw_item



	dedalo_link : function(item, section_tipo) {

		const self = this
		
		const dedalo_link = common.create_dom_element({
			element_type	: "a",
			class_name		: "section_id go_to_dedalo",
			inner_html		: item.section_id + " <small>(" + section_tipo +")</small>",
			href			: '/dedalo/lib/dedalo/main/?t=' + section_tipo + '&id=' + item.section_id			
		})
		dedalo_link.setAttribute('target', '_blank');

		return dedalo_link
	},//end dedalo_link


	
	default : function(item, name, fn) {

		const self = this

		// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line " + name
			})

		if (item[name] && item[name].length>0) {
	
			// common.create_dom_element({
				// 	element_type 	: "label",
				// 	class_name 		: "",
				// 	text_content 	: tstring[name]|| name,
				// 	parent 			: line
				// })

			
			const item_text = (typeof fn==="function")
				? fn(item[name])
				: page.remove_gaps(item[name], " | ")

			common.create_dom_element({
				element_type	: "span",
				class_name		: "info_value",
				inner_html		: item_text.trim(),
				parent			: line
			})	
		}		


		return line
	},//end default



	label : function(item, name) {

		const self = this

		// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line " + name
			})		
	
			common.create_dom_element({
				element_type 	: "div",
				class_name 		: "big_label",
				text_content 	: tstring[name]|| name,
				parent 			: line
			})		


		return line
	},//end label



	catalog_hierarchy : function(item, name) {

		const self = this

		// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line inline " + name
			})

		const catalog = item.catalog

		if (catalog && Object.keys(catalog).length > 0 && catalog.constructor === Object ) {

			const parents = catalog.parents
			const parents_ordered = []

			for (let i = 0; i < parents.length; i++) {
				parents_ordered.push(parents[i])
				if(parents[i].term_table === 'mints') break;
			}

			for (let i = parents_ordered.length - 1; i >= 0; i--) {
				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "breadcrumb " + parents_ordered[i].term_table,
					text_content	: parents_ordered[i].term,
					parent 			: line
				})

				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "breadcrumb_symbol",
					text_content	: " > ",
					parent 			: line
				})
			}

			common.create_dom_element({
				element_type 	: "span",
				class_name 		: "breadcrumb",
				text_content	: catalog.term,
				parent 			: line
			})
		}		


		return line
	},//end catalog_hierarchy


	image : function(item, name) {

		const self = this

		// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line inline " + name
			})

		if (item[name] && item[name].length>0) {

			const url = item[name]

			const image_link = common.create_dom_element({
				element_type	: "a",
				class_name		: "image_link",
				href			: url,
				parent			: line
			})
	
			common.create_dom_element({
				element_type 	: "img",
				class_name 		: "image",
				src 			: url,
				parent 			: image_link
			})
		}


		return line
	},//end image



	identify_coin : function(item, name) {

		const self = this

		// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line inline " + name
			})

		const ar_str_coins = page.split_data(item.ref_coins, ' | ')

		const ar_coins = []
		for (var i = 0; i < ar_str_coins.length; i++) {
			ar_coins.push(JSON.parse(ar_str_coins[i]))
		}
		const identify_coin_id = ar_coins[0][0]
		const identify_coin = item.ref_coins_union.find(item => item.section_id === identify_coin_id)

		if (identify_coin) {
	
			common.create_dom_element({
				element_type 	: "span",
				class_name 		: name,
				text_content 	: identify_coin.ref_auction,
				parent 			: line
			})

			// final_date
				const split_time 	= (identify_coin.ref_auction_date)
					? identify_coin.ref_auction_date.split(' ')
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

			// ref_auction_number
				if(identify_coin.ref_auction_number){
					common.create_dom_element({
						element_type 	: "span",
						class_name 		: name,
						text_content 	: ", "+(tstring.n || "nº") +" "+ identify_coin.ref_auction_number,
						parent 			: line
					})
				}

			// size_text. weight / dies / diameter				
				const ar_beats = []
				if (identify_coin.weight && identify_coin.weight.length>0) {
					ar_beats.push( identify_coin.weight + " g" )
				}
				if (identify_coin.dies && identify_coin.dies.length>0) {
					ar_beats.push( identify_coin.dies + " h" )
				}
				if (identify_coin.diameter && identify_coin.diameter.length>0) {
					ar_beats.push( identify_coin.diameter + " mm" )
				}
				const size_text = ar_beats.join("; ")

			common.create_dom_element({
				element_type 	: "span",
				class_name 		: name,
				text_content 	: " ("+size_text+")",
				parent 			: line
			})
		}		


		return line
	},//end image



	id_line : function(item, name) {

		const self = this

		// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line " + name
			})

		// ar_nodes
			const ar_nodes = []

		// catalogue
			name = "catalogue"
			if (item[name] && item[name].length>0) {

				// const catalogue_number = JSON.parse(item["catalogue_data"])[0]
				const type_section_id = item["section_id"]
		
				const item_text = item[name] + " " + type_section_id + "/" + item["number"]

				const node = common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value " + name,
					text_content 	: item_text
				})	
				ar_nodes.push(node)
			}

		// denomination
			name = "denomination"
			if (item[name] && item[name].length>0) {
				
				const item_text = item[name]

				const node = common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value " + name,
					text_content 	: item_text
				})	
				ar_nodes.push(node)
			}

		// material
			name = "material"
			if (item[name] && item[name].length>0) {
		
				const beats		= page.split_data(item[name], ' | ')
				const item_text	= beats.filter(Boolean).join(", ")
				
				const node = common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value " + name,
					text_content 	: item_text
				})	
				ar_nodes.push(node)
			}

		// averages
			name = "averages"
			if (item["averages_weight"] && item["averages_weight"].length>0) {
				
				const weight_text	= item["averages_weight"] + " g (" + item["total_weight_items"] + ");"				
				const diameter_text	= item["averages_diameter"] + " mm (" + item["total_diameter_items"] + ")"

				const node = common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value " + name,
					text_content 	: weight_text + " " + diameter_text
				})	
				ar_nodes.push(node)
			}		

		// nodes append
			const ar_nodes_length = ar_nodes.length
			for (let i = 0; i < ar_nodes_length; i++) {
				// separator
				if (i>0 && i<ar_nodes_length) {
					const node = common.create_dom_element({
						element_type	: "span",
						class_name		: "info_value separator",
						text_content	: " | ",
						parent			: line
					})
				}
				// node
				line.appendChild(ar_nodes[i])			
			}


		return line
	},//end id_line



	items_list : function(item, name) {

		const self = this

		// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line " + name
			})
			

		function draw_coin(data, container) {

			const wrapper = common.create_dom_element({
				element_type	: "div",
				class_name		: "sorted_coin",
				parent			: container
			})
		
			// images
				const images = common.create_dom_element({
					element_type	: "div",
					class_name		: "images_wrapper",
					parent			: wrapper
				})
				const image_link_obverse = common.create_dom_element({
					element_type	: "a",
					class_name		: "image_link",
					href			: data.image_obverse,
					parent			: images
				})
				common.create_dom_element({
					element_type	: "img",
					src				: data.image_obverse,
					parent			: image_link_obverse
				})
				const image_link_reverse = common.create_dom_element({
					element_type	: "a",
					class_name		: "image_link",
					href			: data.image_reverse,
					parent			: images
				})
				common.create_dom_element({
					element_type	: "img",
					src				: data.image_reverse,
					parent			: image_link_reverse
				})
			// collection
				common.create_dom_element({
					element_type	: "div",
					class_name		: "",
					inner_html		: data.collection,
					parent			: wrapper
				})
			// size_text. weight / dies / diameter				
				const ar_beats = []
				if (data.weight && data.weight.length>0) {
					ar_beats.push( data.weight + " g" )
				}
				if (data.dies && data.dies.length>0) {
					ar_beats.push( data.dies + " h" )
				}
				if (data.diameter && data.diameter.length>0) {
					ar_beats.push( data.diameter + " mm" )
				}
				const size_text = ar_beats.join("; ")
				common.create_dom_element({
					element_type	: "div",
					class_name		: "",
					inner_html		: size_text,
					parent			: wrapper
				})
			// uri
				const uri		= page_globals.__WEB_ROOT_WEB__ + "/coin/" + data.section_id
				const full_url	= page_globals.__WEB_BASE_URL__ + uri
				const uri_text	= "URI: <a href=\""+uri+"\">" + full_url + "</a>"
				common.create_dom_element({
					element_type	: "div",
					class_name		: "",
					inner_html		: uri_text,
					parent			: wrapper
				})

			// findspots + hoard
				const ar_find = []
				if(data.hoard){
					const hoard = (data.hoard_place) 
						? data.hoard + " ("+data.hoard_place+")" 
						: data.hoard

					ar_find.push( hoard )					
				}
				if(data.findspot){

					const findspot = (data.findspot_place) 
						? data.findspot + " ("+data.findspot_place+")" 
						: data.findspot

					ar_find.push( findspot )
				}

				const find_text = ar_find.join(" | ")

				common.create_dom_element({
					element_type	: "div",
					class_name		: "",
					inner_html		: find_text,
					parent			: wrapper
				})

			// biblio
				const references_container = common.create_dom_element({
					element_type	: "div",
					class_name		: "references",					
					parent			: wrapper
				})
				const references = data.bibliography_data
				for (let r = 0; r < references.length; r++) {
					self.draw_bibliographic_reference(references[r], references_container)	
				}				

		}//end draw_coin


		// coins group iterate
			const coins_group_length = item._coins_group.length
			for (let i = 0; i < coins_group_length; i++) {
				
				const el = item._coins_group[i]
				
				if (el.typology_id==1) continue; // ignore identify images typology

				// typology label
				const typology_name	= el.typology
				common.create_dom_element({
					element_type 	: "div",
					class_name 		: "medium_label",
					text_content 	: typology_name,
					parent 			: line
				})

				const typology_coins = common.create_dom_element({
					element_type	: "div",
					class_name		: "typology_coins",
					parent			: line
				})

				const coins			= el.coins;
				const coins_length	= coins.length
				for (let j = 0; j < coins_length; j++) {
					const coin_section_id	= coins[j]
					const coin_data			= item.ref_coins_union.find(element => element.section_id==coin_section_id)
					if (coin_data) {
						draw_coin(coin_data, typology_coins)
					}					
				}
			}


		return line
	},//end items_list



	draw_bibliographic_reference : function(data, container) {

		const publication_data			= data._publications
		const publication_data_length	= publication_data.length
		for (let i = 0; i < publication_data_length; i++) {
			
			const item = publication_data[i]
		
			const wrapper = common.create_dom_element({
				element_type	: "div",
				class_name		: "bibliographic_reference",
				parent			: container
			})

			// title
				common.create_dom_element({
					element_type	: "span",
					inner_html		: " " + (item.title || "") + " ",
					parent			: wrapper
				})
			// authors
				common.create_dom_element({
					element_type	: "span",
					inner_html		: " " + (item.authors || "") + " ",
					parent			: wrapper
				})
			// date
				common.create_dom_element({
					element_type	: "span",
					inner_html		: " " + (item.date || "") + " ",
					parent			: wrapper
				})
			// palce
				common.create_dom_element({
					element_type	: "span",
					inner_html		: " " + (item.place || "") + " ",
					parent			: wrapper
				})
		}
		

		return wrapper
	},//end draw_bibliographic_reference



	findspots : function(item, name) {

		const self = this

		console.log("item.ref_coins_findspots_data:",item.ref_coins_findspots_data);

		// line
			const line = common.create_dom_element({
				element_type	: "div",
				id				: "findspots",
				class_name		: "info_line " + name
			})
			// common.when_in_dom(line, function(){line.scrollIntoView(false);})

		// map_container
			const map_container = common.create_dom_element({
				element_type	: "div",
				class_name		: "map_container",
				parent			: line
			})

		function draw_coin(data, container) {

			// console.log("--draw_coin data:",data);

			const wrapper = common.create_dom_element({
				element_type	: "div",
				class_name		: "find_coin",
				parent			: container
			})
		
			// images
				const images = common.create_dom_element({
					element_type	: "div",
					class_name		: "images_wrapper",
					parent			: wrapper
				})
				const image_link_obverse = common.create_dom_element({
					element_type	: "a",
					class_name		: "image_link",
					href			: data.image_obverse,
					parent			: images
				})
				common.create_dom_element({
					element_type	: "img",					
					src				: data.image_obverse,
					parent			: image_link_obverse
				})
				const image_link_reverse = common.create_dom_element({
					element_type	: "a",
					class_name		: "image_link",
					href			: data.image_reverse,
					parent			: images
				})
				common.create_dom_element({
					element_type	: "img",
					src				: data.image_reverse,
					parent			: image_link_reverse
				})

			// info
				const info = common.create_dom_element({
					element_type	: "div",
					class_name		: "info_wrapper",
					parent			: wrapper
				})
				// collection
					common.create_dom_element({
						element_type	: "div",
						class_name		: "",
						inner_html		: data.collection,
						parent			: info
					})
				// size_text. weight / dies / diameter
					const ar_beats = []
					if (data.weight && data.weight.length>0) {
						ar_beats.push( data.weight + " g" )
					}
					if (data.dies && data.dies.length>0) {
						ar_beats.push( data.dies + " h" )
					}
					if (data.diameter && data.diameter.length>0) {
						ar_beats.push( data.diameter + " mm" )
					}
					const size_text = ar_beats.join("; ")
					common.create_dom_element({
						element_type	: "div",
						class_name		: "",
						inner_html		: size_text,
						parent			: info
					})
				// uri
					const uri		= page_globals.__WEB_ROOT_WEB__ + "/coin/" + data.section_id
					const full_uri	= page_globals.__WEB_BASE_URL__ + uri
					const uri_text	= "URI: <a href=\""+uri+"\">" + full_uri + "</a>"
					common.create_dom_element({
						element_type	: "div",
						class_name		: "",
						inner_html		: uri_text,
						parent			: info
					})
				// hoard
					common.create_dom_element({
						element_type	: "div",
						class_name		: "",
						inner_html		: data.hoard,
						parent			: info
					})
				// biblio
					const references_container = common.create_dom_element({
						element_type	: "div",
						class_name		: "references",					
						parent			: info
					})
					const references = data.bibliography_data
					for (let r = 0; r < references.length; r++) {
						self.draw_bibliographic_reference(references[r], references_container)	
					}
		}//end draw_coin
			

		// map, global array with all map data and cache for resolve section_id

			const map_data				= []
			const findspots_solved		= []
			const hoards_solved			= []

		// findspots
			const findspots_data		= item.ref_coins_findspots_data
			const findspots_data_length	= findspots_data.length

			for (let i = 0; i < findspots_data_length; i++) {
				
				const findspot		= findspots_data[i]
				const coins			= JSON.parse(findspot.coins) || []
				const coins_length	= coins.length

				if (coins_length<1) {
					console.warn("! Skipped findspot without zero coins :", findspots_data);
					continue;
				}

				if (findspots_solved.find(section_id => section_id===findspot.section_id)) {
					continue;
				}
				
				
				const wrapper = common.create_dom_element({
					element_type	: "div",
					class_name		: "find_wrapper findspot",
					parent			: line
				})

				// title
					common.create_dom_element({
						element_type	: "div",
						inner_html		: " " + (findspot.name || "") + " (" + (findspot.place || "") + ") ",
						parent			: wrapper
					})
				// items (ejemplares)
					const items = common.create_dom_element({
						element_type	: "div",
						text_content	: " " + coins_length + " " + (tstring.items || "items") + " ",
						parent			: wrapper
					})
				// draw_coins
					const typology_coins = common.create_dom_element({
						element_type	: "div",
						class_name		: "find_coins findspot gallery",
						parent			: line
					})

					const ar_coins = []
					for (let j = 0; j < coins_length; j++) {
						const coin_section_id	= coins[j]
						const current_coin		= item.ref_coins_union.find(el => el.section_id==coin_section_id)
							// console.log("item.ref_coins_union:",item.ref_coins_union);
							// console.log("current_coin:",current_coin, coin_section_id);
						if (current_coin) {
							draw_coin(current_coin, typology_coins)
							ar_coins.push(coin_section_id)
						}
					}

					// map data
					const findspot_data_map = JSON.parse(findspot.map)
					if (findspot_data_map) {
						map_data.push({
							section_id	: findspot.section_id,
							name		: findspot.name,
							place		: findspot.place,
							georef		: findspot.georef,
							data		: findspot_data_map,
							items 		: ar_coins.length,
							total_items : coins_length,
							type 		: 'findspot'
						})
					}		

				// replace text into the items
					items.innerHTML = items.innerHTML + '('+ar_coins.length+')'

				// store already solved
					findspots_solved.push(findspot.section_id)
			}


		// hoards
			const hoards_data			= item.ref_coins_hoard_data
			const hoards_data_length	= hoards_data.length

			for (let i = 0; i < hoards_data_length; i++) {
				
				const hoard			= hoards_data[i]
				const coins			= JSON.parse(hoard.coins) || []
				const coins_length	= coins.length

				if (coins_length<1) {
					console.warn("! Skipped hoard without zero coins :", hoards_data);
					continue;
				}

				if (hoards_solved.find(section_id => section_id===hoard.section_id)) {
					continue;
				}
				
				const wrapper = common.create_dom_element({
					element_type	: "div",
					class_name		: "find_wrapper hoard",
					parent			: line
				})

				// title
					common.create_dom_element({
						element_type	: "div",
						inner_html		: " " + (hoard.name || "") + " (" + (hoard.place || "") + ") ",
						parent			: wrapper
					})
				// items (ejemplares)
					const items = common.create_dom_element({
						element_type	: "div",
						text_content	: " " + coins_length + " " + (tstring.items || "items") + " ",
						parent			: wrapper
					})
				// draw_coins
					const typology_coins = common.create_dom_element({
						element_type	: "div",
						class_name		: "find_coins hoard",
						parent			: line
					})
					const ar_coins = []
					for (let j = 0; j < coins_length; j++) {
						const coin_section_id	= coins[j]
						const current_coin		= item.ref_coins_union.find(el => el.section_id==coin_section_id)
							// console.log("item.ref_coins_union:",item.ref_coins_union);
							// console.log("current_coin:",current_coin, coin_section_id);
						if (current_coin) {
							draw_coin(current_coin, typology_coins)
							ar_coins.push(coin_section_id)
						}
					}

					// replace text into the items
					items.innerHTML = items.innerHTML + '('+ar_coins.length+')'


				// map data
					const hoard_data_map = JSON.parse(hoard.map)
					if (hoard_data_map) {
						map_data.push({
							section_id	: hoard.section_id,
							name		: hoard.name,
							place		: hoard.place,
							georef		: hoard.georef,
							data		: hoard_data_map,
							items 		: ar_coins.length,
							total_items : coins_length,
							type 		: 'hoard'
						})
					}			


				// store already solved
					hoards_solved.push(hoard.section_id)
			}		
		
		// draw map
			console.log("// map_data:",map_data);
			if (map_data.length>0) {
				common.when_in_dom(map_container, draw_map)
				function draw_map() {
					self.caller.draw_map({
						container		: map_container,
						map_position	: null, // use default position
						map_data		: map_data
					})
				}
			}else{
				map_container.remove()
			}
			


		return line
	},//end findspots



	mint : function(item) {

		const self = this

		// line
		const line = common.create_dom_element({
			element_type	: "div",
			class_name		: "info_line mint"
		})

		if (item.mint && item.mint.length>0) {
	
			common.create_dom_element({
				element_type 	: "label",
				class_name 		: "",
				text_content 	: tstring.mint || "Mint",
				parent 			: line
			})

			const mint_text = row_object.mint
			common.create_dom_element({
				element_type 	: "span",
				class_name 		: "info_value",
				text_content 	: mint_text,
				parent 			: line
			})	
		}		


		return line
	},//end mint



	authors_alt : function(item) {

		const self = this

		// line
		const line = common.create_dom_element({
			element_type	: "div",
			class_name		: "info_line authors_alt"
		})

		if (item.authors_alt && item.authors_alt.length>0) {
	
			const authors_alt		= item.authors_alt || ""
			const final_authors_alt = " (" + authors_alt + "). "
			
			// DOM node
				common.create_dom_element({
					element_type 	: "div",
					class_name 		: "info_value authors_alt",
					text_content 	: final_authors_alt,
					parent 			: line
				})
		}		


		return line
	},//end authors_alt



	publication_date : function(item) {

		const line = common.create_dom_element({
			element_type 	: "div",
			class_name 		: "info_line publication_date"			
		})

		if (item.publication_date) {			

			const ar_date 	= item.publication_date.split("-")
			let final_date 	= parseInt(ar_date[0])

			if( typeof(ar_date[1]!=="undefined") && parseInt(ar_date[1]) > 0 ) {					
				final_date = final_date + "-" + parseInt(ar_date[1])
			}
			if( typeof(ar_date[2]!=="undefined") && parseInt(ar_date[2]) > 0 ) {
				final_date = final_date + "-" + parseInt(ar_date[2])
			}

			final_date = " (" + final_date + "). "

			common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_value",
				text_content 	: final_date,
				parent 			: line
			})

			line.classList.remove("hide")
		}

		return line
	},//end publication_date



	title : function(item) {

		const typology = this.get_typology(item)
		
		// title 
			const title			= item.title || ""
			const title_style	= (typology=='1' || typology=='20' || typology=='28' || typology=='30'|| typology=='32')
				? " italic"
				: ""

		// pdf data
			// const pdf_uri			= item.pdf || '[]'
			// const ar_pdf_uri		= JSON.parse(pdf_uri)
			// const ar_pdf_uri_length	= ar_pdf_uri.length

		// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line title"
			})

		// title
			const title_final = " " + title + ". "
			common.create_dom_element({
				element_type	: "div",
				class_name		: "" + title_style,
				text_content	: title_final,
				parent			: line
			})

		// pdf_uri
			// for (let i = 0; i < ar_pdf_uri_length; i++) {
				
			// 	const pdf_item = ar_pdf_uri[i]
			
			// 	common.create_dom_element({
			// 		element_type	: "div",
			// 		class_name		: "pdf",
			// 		title			: pdf_item.title,
			// 		// text_content	: pdf_item.title,
			// 		// href			: pdf_item.iri,
			// 		parent			: line
			// 	}).addEventListener("click",(e) => {
			// 		window.open(pdf_item.iri, "PDF", "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes");
			// 	})
			// }
			

		return line
	},//end title



	editor : function(item) {

		const self = this

		// line
		const line = common.create_dom_element({
			element_type	: "div",
			class_name		: "info_line editor"
		})		

		// editor 
		if (item.editor && item.editor.length>0) {	

			const en = tstring.en || "En"
			const editor = " " + en + " " + item.editor + ", "

			common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_value",
				text_content 	: editor,
				parent 			: line
			})
		}


		return line
	},//end editor



	title_secondary : function(item) {

		const typology = this.get_typology(item)
		
		// title_secondary 
			const title_secondary = item.title_secondary || ""
		
		// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line row_title"
			})

		// title_secondary
			if (title_secondary.length>0) {
				const title_secondary_final = " " + title_secondary + " "
				common.create_dom_element({
					element_type	: "div",
					class_name		: "title_secondary italic",
					text_content	: title_secondary_final,
					parent			: line
				})
			}			


		return line
	},//end title_secondary



	magazine : function(item) {

		const self = this

		// line
		const line = common.create_dom_element({
			element_type	: "div",
			class_name		: "info_line magazine"
		})		

		// magazine 
		if (item.magazine && item.magazine.length>0) {		

			const magazine_final = " " + item.magazine + ", "
			common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_value italic",
				text_content 	: magazine_final,
				parent 			: line
			})
		}


		return line
	},//end magazine



	serie : function(item) {

		const self = this

		// line
		const line = common.create_dom_element({
			element_type	: "div",
			class_name		: "info_line serie"
		})		

		// serie 
		if (item.serie && item.serie.length>0) {

			const serie_text = (!item.copy || item.copy.length<1)
				? " " + item.serie + ", "
				: " " + item.serie + ""
	
			common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_value italic",
				text_content 	: serie_text,
				parent 			: line
			})
		}


		return line
	},//end serie



	copy : function(item) {

		const self = this

		// line
		const line = common.create_dom_element({
			element_type	: "div",
			class_name		: "info_line copy"
		})		

		// copy 
		if (item.copy && item.copy.length>0) {

			const copy = " (" + item.copy + "), "

			common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_value",
				text_content 	: copy,
				parent 			: line
			})
		}


		return line
	},//end copy



	physical_description : function(item) {

		const self = this

		// line
		const line = common.create_dom_element({
			element_type	: "div",
			class_name		: "info_line physical_description"
		})		

		// physical_description 
		if (item.physical_description && item.physical_description.length>0) {

			const physical_description = " " + item.physical_description + ". "

			common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_value",
				text_content 	: physical_description,
				parent 			: line
			})
		}


		return line
	},//end physical_description



	editorial : function(item) {

		const self = this

		// line
		const line = common.create_dom_element({
			element_type	: "div",
			class_name		: "info_line editorial"
		})		

		// editorial 
		if (item.editorial && item.editorial.length>0) {

			const editorial = " " + item.editorial + ". "

			common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_value",
				text_content 	: editorial,
				parent 			: line
			})
		}


		return line
	},//end editorial



	url : function(item) {

		// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line url"
			})

		// url_data
			const url_data = item.url_data
			if (url_data && url_data.length>0) {

				const ar_url_data 		 = JSON.parse(url_data)
				const ar_url_data_length = ar_url_data.length		
				for (let i = 0; i < ar_url_data_length; i++) {
					
					const url_item = ar_url_data[i]

					const title = (url_item.title && url_item.title.length>1)
						? url_item.title
						: url_item.iri
				
					const link = common.create_dom_element({
						element_type	: "a",
						class_name		: "url_data",
						title			: title,
						text_content	: title,
						href			: url_item.iri,						
						parent			: line
					})
					link.setAttribute('target', '_blank');

					if ( !(i%2) && i<ar_url_data_length && ar_url_data_length>1 ) {
						common.create_dom_element({	
							element_type	: "span",
							class_name		: "separator",
							text_content	: " | ",
							parent			: line
						})
					}
				}
			}


		return line
	},//end url



	place : function(item) {

		const self = this

		// line
		const line = common.create_dom_element({
			element_type	: "div",
			class_name		: "info_line place"
		})		

		// place 
		if (item.place && item.place.length>0) {		

			common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_value",
				text_content 	: item.place,
				parent 			: line
			})
		}


		return line
	},//end place



	descriptors : function(item) {

		const self = this

		// line
		const line = common.create_dom_element({
			element_type	: "div",
			class_name		: "info_line descriptors"
		})		

		// descriptors 
		if (item.descriptors && item.descriptors.length>0) {

			common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_value",
				text_content 	: item.descriptors,
				parent 			: line
			})
		}


		return line
	},//end descriptors



	typology_name : function(item) {

		const self = this

		// line
		const line = common.create_dom_element({
			element_type	: "div",
			class_name		: "info_line typology_name"
		})		

		// typology_name 
		if (item.typology_name && item.typology_name.length>0) {

			common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_value",
				text_content 	: item.typology_name,
				parent 			: line
			})
		}


		return line
	},//end typology_name



	// /**
	// * SPLIT_DATA
	// * Safe value split
	// */
	// split_data : function(value, separator) {
	// 	const result = value ? value.split(separator) : []
	// 	return result;
	// },//end split_data



	// /**
	// * REMOVE_GAPS
	// * Removes empty values in multimple values string. 
	// * Like 'pepe | lepe' when 'pepe | lepe | '
	// */
	// remove_gaps : function(value, separator) {
	// 	const beats		= value.split(separator).filter(Boolean)
	// 	const result	= beats.join(separator)
		
	// 	return result
	// },//end remove_gaps



	// local_to_remote_paths : function(value) {
	// 	return value.replace(/\/dedalo\/media_test\/media_monedaiberica/g, page_globals.__WEB_MEDIA_BASE_URL__ + '/dedalo/media')
	// },//end local_to_remote_paths



}//end row_fields