/*global tstring, page_globals, SHOW_DEBUG, common, page, $, type_row_fields_min, map_factory, Promise, data_manager, event_manager, form_factory, catalog_row_fields */
/*eslint no-undef: "error"*/

"use strict";



var map = {



	/**
	* VARS
	*/
		// DOM items ready from page html
		form_container			: null,
		rows_container			: null,
		map_container			: null,
		export_data_container	: null,

		map_factory_instance : null,

		// master_map_global_data. All records from table 'map_global'
		master_map_global_data : null,

		// current_map_global_data. Current filtered records from table 'map_global'
		current_map_global_data : null,

		// global_data (direct rows from ddbb)
		global_data : null,

		// map_global_data (ready for map parsed data)
		map_global_data : null,

		// form instance on form_factory
		form : null,

		forn_node : null,

		map_config : null,



	/**
	* SET_UP
	* When the HTML page is loaded
	* @param object options
	*/
	set_up : function(options) {
		if(SHOW_DEBUG===true) {
			// console.log("--> map set_up options:",options);
		}

		const self = this

		// options
			self.form_container			= options.form_container
			self.map_container			= options.map_container
			self.rows_container			= options.rows_container
			self.export_data_container	= options.export_data_container

		// export_data_buttons added once
			const export_data_buttons = page.render_export_data_buttons()
			self.export_data_container.appendChild(export_data_buttons)
			self.export_data_container.classList.add('hide')

		// map
			self.source_maps = [
				{
					name	: "DARE",
					// url	: '//pelagios.org/tilesets/imperium/{z}/{x}/{y}.png',
					url		: '//dh.gu.se/tiles/imperium/{z}/{x}/{y}.png',
					options	: {
						maxZoom: 11
					}
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
					default	: true
				},
				{
					name	: "ARCGIS",
					url		: '//server.arcgisonline.com/ArcGIS/' + 'rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
					options	: {}
				}
			]

			self.map_factory_instance = new map_factory() // creates / get existing instance of map
			self.map_factory_instance.init({
				map_container	: self.map_container,
				map_position	: null,
				popup_builder	: page.map_popup_builder,
				popup_options	: page.maps_config.popup_options,
				source_maps		: self.source_maps,
				legend			: page.render_map_legend
			})

		// map base data from map_global
			const request_body = {
				dedalo_get	: 'records',
				db_name		: page_globals.WEB_DB,
				lang		: page_globals.WEB_CURRENT_LANG_CODE,
				table		: 'map_global',
				ar_fields	: '*',
				sql_filter	: 'coins_list IS NOT NULL AND types_list IS NOT NULL AND georef_geojson IS NOT NULL',
				limit		: 0,
				count		: false,
				offset		: 0,
				order		: null
			}
			data_manager.request({
				body : request_body
			})
			.then((response)=>{
				// console.log("--- search_rows API response:", response);

				if (response.result) {

					// master_map_global_data. fix parsed var master_map_global_data to reuse later
						self.master_map_global_data = page.parse_map_global_data(response.result)

					// current_map_global_data
						self.current_map_global_data = self.master_map_global_data

					// clean empty geolocation items
						const map_points = self.current_map_global_data.filter(function(el){return el.item!==null}).map(function(el){
							return el.item
						})

					// initial map with all points without filters
						self.map_factory_instance.parse_data_to_map(map_points)
						.then(function(){
							self.map_container.classList.remove('hide_opacity')
						})
				}

				// event
				event_manager.publish('initial_map_loaded')
			})

		// form
			self.form		= new form_factory()
			const form_node	= self.render_form()
			self.form_container.appendChild(form_node)

		// set config (from local storage)
			self.set_config()

		// show search button
			const show_search_button = document.getElementById("search_icon")
			show_search_button.addEventListener("mousedown", function(){

				let new_showing_search
				if (self.map_config.showing_search===true) {
					form_node.classList.add("hide")
					new_showing_search = false
				}else{
					form_node.classList.remove("hide")
					new_showing_search = true
				}
				self.set_config({
					showing_search : new_showing_search
				})
			})
			if (self.map_config.showing_search===true) {
				form_node.classList.remove("hide")
			}else{
				form_node.classList.add("hide")
			}

		// events
			event_manager.subscribe('map_selected_marker', map_selected_marker)
			function map_selected_marker(options){
				// console.log("///-> map_selected_marker options:",options);

				// options
					const selected_element = typeof options.item.group[0]!=="undefined"
						? options.item.group[0]
						: null

				// check selected_element
					if (!selected_element) {
						return null
					}

				// clean container
					while (self.rows_container.hasChildNodes()) {
						self.rows_container.removeChild(self.rows_container.lastChild);
					}
					// page.add_spinner(self.rows_container)
					const spinner = common.create_dom_element({
						element_type	: "div",
						class_name		: "spinner",
						parent			: self.rows_container
					})

				// render related types list
					// resolved map_global_data
						const map_global_data = self.current_map_global_data.find(function(el){
							return el.section_id==selected_element.term_id
						})
					// load_map_selection_info
					self.load_map_selection_info(selected_element, map_global_data)
					.then(function(response){
						// console.log("--> load_map_selection_info response:",response);
						if (response) {
							const types_list_node = self.render_types_list({
								global_data_item	: response.global_data_item,
								types_rows			: response.types_rows,
								coins_rows			: response.coins_rows,
								info				: response.info
							})
							self.rows_container.appendChild(types_list_node)
							// page.remove_spinner(self.rows_container)
							spinner.remove()

							// activate images lightbox
								setTimeout(function(){
									const images_gallery_containers = self.rows_container
									page.activate_images_gallery(images_gallery_containers, true)
								},600)

						}else{
							// page.remove_spinner(self.rows_container)
							spinner.remove()
						}

						// scroll map at top
							self.map_container.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"})

						// show export buttons
							self.export_data_container.classList.remove('hide')
					})

				return true
			}//end map_selected_marker


		return true
	},//end set_up



	/**
	* SET_CONFIG
	* @param options object (optional)
	* @return
	*/
	set_config : function(options) {

		const self = this

		// cookie
		const map_config = localStorage.getItem('map_config');
		if (map_config) {
			// use existing one
			self.map_config = JSON.parse(map_config)
			// console.log("--> self.map_config 1 (already exists):", self.map_config);
		}else{
			// create a new one
			const map_config = {
				showing_search	: false
			}
			localStorage.setItem('map_config', JSON.stringify(map_config));
			self.map_config = map_config
			// console.log("--> self.map_config 2 (create new one):",self.map_config);
		}

		if (options) {
			for(const key in options) {
				self.map_config[key] = options[key]
			}
			localStorage.setItem('map_config', JSON.stringify(self.map_config));
		}
		// console.log("--> self.map_config [final]:", self.map_config);

		return self.map_config
	},//end set_config



	/**
	* RENDER_FORM
	*/
	render_form : function() {

		const self = this

		const fragment = new DocumentFragment()

		const form_row = common.create_dom_element({
			element_type	: "div",
			class_name		: "form-row fields",
			parent			: fragment
		})

		common.create_dom_element({
			element_type	: "div",
			class_name		: "golden-separator",
			parent			: form_row
		})

		// // section_id
		// 	self.form.item_factory({
		// 		id			: "section_id",
		// 		name		: "section_id",
		// 		label		: tstring.is || "ID",
		// 		q_column	: "section_id",
		// 		eq			: "=",
		// 		eq_in		: "",
		// 		eq_out		: "",
		// 		parent		: form_row
		// 	})

		// mint
			self.form.item_factory({
				id				: "mint",
				name			: "mint",
				label			: tstring.mint || "mint",
				q_column		: "mint",
				value_wrapper	: ['["','"]'], // to obtain ["value"] in selected value only
				eq				: "LIKE",
				eq_in			: "%",
				eq_out			: "%",
				is_term			: true,
				q_selected_eq	: "LIKE",
				parent			: form_row,
				callback		: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'coins'
					})
				}
			})

		// collection
			self.form.item_factory({
				id			: "collection",
				name		: "collection",
				label		: tstring.collection || "collection",
				q_column	: "collection",
				eq			: "LIKE",
				eq_in		: "%",
				eq_out		: "%",
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'coins'
					})
				}
			})

		// // ref_auction
		// 	self.form.item_factory({
		// 		id			: "ref_auction",
		// 		name		: "ref_auction",
		// 		label		: tstring.auction || "auction",
		// 		q_column	: "ref_auction",
		// 		eq			: "LIKE",
		// 		eq_in		: "%",
		// 		eq_out		: "%",
		// 		parent		: form_row,
		// 		callback	: function(form_item) {
		// 			self.form.activate_autocomplete({
		// 				form_item	: form_item,
		// 				table		: 'coins'
		// 			})
		// 		}
		// 	})



		// findspot
			self.form.item_factory({
				id			: "findspot",
				name		: "findspot",
				label		: tstring.findspot || "findspot",
				q_column	: "findspot",
				eq			: "LIKE",
				eq_in		: "%",
				eq_out		: "%",
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'coins'
					})
				}
			})

		// hoard
			self.form.item_factory({
				id			: "hoard",
				name		: "hoard",
				label		: tstring.hoard || "hoard",
				q_column	: "hoard",
				eq			: "LIKE",
				eq_in		: "%",
				eq_out		: "%",
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'coins'
					})
				}
			})

		// material
			self.form.item_factory({
				id			: "material",
				name		: "material",
				label		: tstring.material || "Material",
				q_column	: "material",
				eq			: "LIKE",
				eq_in		: "%",
				eq_out		: "%",
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'coins'
					})
				}
			})

		// denomination
			self.form.item_factory({
				id			: "denomination",
				name		: "denomination",
				label		: tstring.denomination || "Denomination",
				q_column	: "denomination",
				eq			: "LIKE",
				eq_in		: "%",
				eq_out		: "%",
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'coins'
					})
				}
			})

		// range slider date (range_slider)
			self.form.item_factory({
				id			: "range_slider",
				name		: "range_slider",
				input_type	: 'range_slider',
				label		: tstring.dating || "Dating",
				class_name	: 'range_slider',
				q_column	: "date_in,dating_end",
				// eq		: "LIKE",
				// eq_in	: "",
				// eq_out	: "%",
				// q_table	: "catalog",
				sql_filter	: null,
				parent		: form_row,
				callback	: function(form_item) {

					// const form_item				= this
					const node_input				= form_item.node_input
					const range_slider_value_in		= node_input.parentNode.querySelector('#range_slider_in')
					const range_slider_value_out	= node_input.parentNode.querySelector('#range_slider_out')

					function set_up_slider() {

						// compute range years
						self.get_range_years()
						.then(function(range_data){
							// console.log("range_data:",range_data);

							// destroy current slider instance if already exists
								if ($(node_input).slider("instance")) {
									$(node_input).slider("destroy")
								}

							// reset filter
								form_item.sql_filter = null

							// set inputs values from database
								range_slider_value_in.value	= range_data.min
								range_slider_value_in.addEventListener("change",function(e){
									const value = (e.target.value>=range_data.min)
										? e.target.value
										: range_data.min
									$(node_input).slider( "values", 0, value );
									e.target.value = value
								})
								range_slider_value_out.value = range_data.max
								range_slider_value_out.addEventListener("change",function(e){
									const value = (e.target.value<=range_data.max)
										? e.target.value
										: range_data.max
									$(node_input).slider( "values", 1, e.target.value );
									e.target.value = value
								})

							// active jquery slider
								$(node_input).slider({
									range	: true,
									min		: range_data.min,
									max		: range_data.max,
									step	: 1,
									values	: [ range_data.min, range_data.max ],
									slide	: function( event, ui ) {
										// update input values on user drag slide points
										range_slider_value_in.value	 = ui.values[0]
										range_slider_value_out.value = ui.values[1]
										// console.warn("-----> slide range form_item.sql_filter:",form_item.sql_filter);
									},
									change: function( event, ui ) {
										// update form_item sql_filter value on every slider change
										form_item.sql_filter = "(date_in >= " + ui.values[0] + " AND date_in <= "+ui.values[1]+")"; // AND (dating_end <= " + ui.values[1] + " OR dating_end IS NULL)
										form_item.q = ui.value
										// console.warn("-----> change range form_item.sql_filter:", form_item.sql_filter);
									}
								});
						})
					}

					// initial_map_loaded event (triggered on initial map data is ready)
					event_manager.subscribe('initial_map_loaded', set_up_slider)
				}
			})

		// submit button
			const submit_group = common.create_dom_element({
				element_type	: "div",
				class_name		: "form-group field button_submit",
				parent			: fragment
			})
			const submit_button = common.create_dom_element({
				element_type	: "input",
				type			: "submit",
				id				: "submit",
				value			: tstring.search || "Search",
				class_name		: "btn btn-light btn-block primary",
				parent			: submit_group
			})
			submit_button.addEventListener("click",function(e){
				e.preventDefault()
				self.form_submit()
			})

		// operators
			// fragment.appendChild( forms.build_operators_node() )
			const operators_node = self.form.build_operators_node()
			fragment.appendChild( operators_node )


		// form_node
			self.form.node = common.create_dom_element({
				element_type	: "form",
				id				: "search_form",
				class_name		: "form-inline form_factory"
			})
			self.form.node.appendChild(fragment)


		return self.form.node
	},//end render_form



	/**
	* FORM_SUBMIT
	*/
	form_submit : function() {

		const self = this

		const form_node = self.form.node
		if (!form_node) {
			return new Promise(function(resolve){
				console.error("Error on submit. Invalid form_node.", form_node);
				resolve(false)
			})
		}

		// clean container
			while (self.rows_container.hasChildNodes()) {
				self.rows_container.removeChild(self.rows_container.lastChild);
			}

		// loading start
			// if (!self.pagination.total) {
			// 	page.add_spinner(rows_container)
			// }else{
			// 	rows_container.classList.add("loading")
			// }
			self.map_container.classList.add("loading")

		return new Promise(function(resolve){

			const ar_fields = ['section_id','mint_data','hoard_data','findspot_data','type_data']

			// sql_filter
				const filter = self.form.build_filter()

				// parse_sql_filter
				const group			= []
				const parsed_filter	= self.form.parse_sql_filter(filter, group)
				const sql_filter	= parsed_filter
					? '(' + parsed_filter + ')'
					: null
				if(SHOW_DEBUG===true) {
					// console.log("-> coins form_submit filter:",filter);
					// console.log("-> coins form_submit sql_filter:",sql_filter);
				}
				// if (!sql_filter|| sql_filter.length<3) {
				// 	return new Promise(function(resolve){
				// 		// loading ends
				// 		rows_container.classList.remove("loading")
				// 		console.warn("Ignored submit. Invalid sql_filter.", sql_filter);
				// 		resolve(false)
				// 	})
				// }

			data_manager.request({
				body : {
					dedalo_get		: 'records',
					table			: 'coins',
					ar_fields		: ar_fields,
					sql_filter		: sql_filter + " AND type_data IS NOT NULL",
					limit			: 0,
					count			: false,
					offset			: 0,
					order			: 'section_id ASC',
					// group		: "type_data",
					process_result	: null
				}
			})
			.then(function(api_response){
				// console.log("--------------- form_submit api_response:", api_response);

				if (api_response.result) {

					self.current_map_global_data = self.distribute_coins(api_response.result)
						// console.log("self.current_map_global_data:",self.current_map_global_data);

					// fix
						// self.map_global_data = self.current_map_global_data
						// console.log("self.current_map_global_data:",self.current_map_global_data);

					// select geolocation items
						const map_points = self.current_map_global_data.map(function(el){
							return el.item
						})

					// render map again
						self.map_factory_instance.init({
							map_container	: self.map_container,
							map_position	: null,
							popup_builder	: page.map_popup_builder,
							popup_options	: page.maps_config.popup_options,
							source_maps		: self.source_maps,
							legend			: page.render_map_legend
						})
						self.map_factory_instance.parse_data_to_map(map_points, null)
				}

				// loading ends
					self.map_container.classList.remove("loading")

				resolve(true)
			})
		})
	},//end form_submit



	/**
	* DISTRIBUTE_coins
	* Re-built the map_global_data using given coins
	* @return
	*/
	distribute_coins : function(coin_rows) {

		const self = this

		if (!coin_rows) {
			return false
		}

		const new_map_global_data = []
		const master_map_global_data_len = self.master_map_global_data.length
		for (let i = 0; i < master_map_global_data_len; i++) {

			const map_row = self.master_map_global_data[i]

			let found_coins = []
			switch(map_row.table) {
				case 'mints':
					found_coins = coin_rows.filter(function(el){
						// return '["'+map_row.ref_section_id+'"]'==el.mint_data
						// allow array with more than one value too like ["65","66"]
						return el.mint_data && el.mint_data.indexOf('"'+map_row.ref_section_id+'"')!==-1
					})
					break;
				case 'hoards':
					found_coins = coin_rows.filter(function(el){
						return '["'+map_row.ref_section_id+'"]'==el.hoard_data
					})
					break;
				case 'findspots':
					found_coins = coin_rows.filter(function(el){
						return '["'+map_row.ref_section_id+'"]'==el.findspot_data
					})
					break;
			}

			if (found_coins.length<1) continue; // ignore

			// coins_list
				const coins_list = found_coins.map(function(el){
					return el.section_id
				})

			// get types
				const types_list = []
				for (let k = 0; k < found_coins.length; k++) {
					const type_data = found_coins[k].type_data
						? JSON.parse(found_coins[k].type_data)
						: null
					if ( type_data && types_list.indexOf(type_data[0])===-1 ) {
						types_list.push(type_data[0])
					}
				}
				// console.log("coins_list:", coins_list);
				// console.log("types_list:", types_list);

			// recreate row
				const new_row = JSON.parse( JSON.stringify(map_row) )
					  new_row.coins_list = coins_list
					  new_row.types_list = types_list

				const coins_list_total = new_row.coins_list ? new_row.coins_list.length : 0;
				const types_list_total = new_row.types_list ? new_row.types_list.length : 0;

				// item data update
					const description = (tstring.coins || 'Coins') + ': ' + coins_list_total +'<br>'+ (tstring.types || 'Types') + ': ' + types_list_total
					new_row.item.data.coins_total = coins_list_total
					new_row.item.data.types_total = types_list_total
					new_row.item.data.description = description

			// const new_row2 = page.parse_map_global_data([new_row])[0]

			// add cloned and updated row
				new_map_global_data.push(new_row)

		}
		// console.log("new_map_global_data:",new_map_global_data);

		return new_map_global_data
	},//end distribute_coins



	/**
	* LOAD_MAP_SELECTION_INFO
	* @param object item (database row)
	* @param object global_data_item
	* 	mint-findspot-hoard row data
	* @return promise
	*/
	load_map_selection_info : function(item, global_data_item) {

		// const self = this

		return new Promise(function(resolve){

			// mint-findspot-hoard row data
				if (!global_data_item || !global_data_item.types_list || global_data_item.types_list.length<1) {
					console.warn("Ignored invalid item. Not found item or item.types_list in global_data! ", item.name, item);
					resolve(false)
					return false;
				}
				const coins_list	= global_data_item.coins_list || []
				const types_list	= global_data_item.types_list || []

			const ar_calls = []

			// search types in catalog using types list
				const ar_type_id = types_list.map(function(item){
					return '\'["' + item + '"]\''
				})
				const sql_filter = 'term_table=\'types\' AND term_data IN(' + ar_type_id.join(",") + ') AND coin_references IS NOT NULL'

				const catalog_ar_fields = ['*']

				const catalog_request_options = {
					dedalo_get	: 'records',
					db_name		: page_globals.WEB_DB,
					lang		: page_globals.WEB_CURRENT_LANG_CODE,
					table		: 'catalog',
					ar_fields	: catalog_ar_fields,
					sql_filter	: sql_filter,
					limit		: 0,
					count		: false,
					offset		: 0,
					order		: "term ASC"
				}
				ar_calls.push({
					id		: 'catalog_request',
					options	: catalog_request_options
				})

			// search coins
				const coins_request_options = {
					dedalo_get	: 'records',
					db_name		: page_globals.WEB_DB,
					lang		: page_globals.WEB_CURRENT_LANG_CODE,
					table		: 'coins',
					ar_fields	: ['*'],
					sql_filter	: 'section_id IN(' + coins_list.join(",") + ')',
					limit		: 0,
					count		: false,
					offset		: 0,
					order		: null,
					resolve_portals_custom	: {
						"bibliography_data" : "bibliographic_references"
					}
				}
				ar_calls.push({
					id		: 'coins_request',
					options	: coins_request_options
				})

			// request
				data_manager.request({
					body : {
						dedalo_get	: 'combi',
						ar_calls	: ar_calls
					}
				})
				.then((api_response)=>{
					// console.log("-> load_map_selection_info api_response:", api_response);

					if (!api_response.result) {
						console.warn("-> load_map_selection_info api_response:", api_response);
						resolve(false)
						return false
					}

					const catalog_response = api_response.result.find(function(el){
						return el.id==='catalog_request'
					})
					const types_rows = page.parse_catalog_data(catalog_response.result)

					const coins_response = api_response.result.find(function(el){
						return el.id==='coins_request'
					})
					const coins_rows = page.parse_coin_data(coins_response.result)

					// verify
						// console.log("GLOBAL_MAP: coins_list:",coins_list);
						// console.log("COINS: coins_rows:",coins_rows );

					// send event data_request_done (used by buttons download)
						event_manager.publish('data_request_done', {
							request_body		: null,
							result				: {
								catalog	: types_rows,
								coins	: coins_rows,
								map_item : {
									coins_list : coins_list,
									types_list : types_list
								}
							},
							export_data_parser	: page.export_parse_map_data
						})

					resolve({
						global_data_item	: global_data_item,
						types_rows			: types_rows,
						coins_rows			: coins_rows,
						info				: {
							coins_list : coins_list,
							types_list : types_list
						}
					})
				})
		})
	},//end load_map_selection_info



	/**
	* RENDER_TYPES_LIST
	* @return DOM node
	*/
	render_types_list : function(options) {

		const global_data_item	= options.global_data_item
		const types_rows		= options.types_rows
		const coins_rows		= options.coins_rows
		// const info			= options.info

		const fragment = new DocumentFragment()

		const wrapper = common.create_dom_element({
			element_type	: "div",
			class_name		: "types_list_wrapper",
			parent			: fragment
		})

		let item_type

		// title line
			if (global_data_item.table) {
				const title_line = common.create_dom_element({
					element_type	: "div",
					class_name		: "line-tittle-wrap",
					parent			: wrapper
				})
				switch(global_data_item.table){
					case 'mints'	: item_type = 'mint';		break;
					case 'hoards'	: item_type = 'hoard';		break;
					case 'findspots': item_type = 'findspot';	break;
				}
				const title = '<span class="note">' + tstring[item_type] + ': </span>' + global_data_item.name
				common.create_dom_element({
					element_type	: "div",
					class_name		: "line-tittle golden-color",
					inner_html		: title,
					parent			: title_line
				})

				// separator horinzontal
					common.create_dom_element({
						element_type	: "div",
						class_name		: "golden-separator",
						parent			: fragment
					})
			}


		// types list
			if (types_rows && types_rows.length>0) {

				const types_wrap = common.create_dom_element({
					element_type	: "div",
					class_name		: "types_wrap",
					parent			: fragment
				})

				const cross_coins = function(coins_rows, coin_references) {
					// console.log("coins_rows:",coins_rows);
					// console.log("coin_references:",coin_references);

					const ar_found_coin_row = []
					for (let i = coin_references.length - 1; i >= 0; i--) {
						const coin_section_id = coin_references[i]
						const found_coin_row = coins_rows.find(function(el){
							return el.section_id==coin_section_id
						})
						if (found_coin_row) {
							ar_found_coin_row.push(found_coin_row)
						}
					}
					return ar_found_coin_row
				}

				let last_mint_label = null
				// sort types_rows by mint name to allow group by
				types_rows.sort((a, b) => (a.p_mint > b.p_mint) ? 1 : -1)

				// catalog_row_fields
					// for (let i = 0; i < types_rows.length; i++) {
					for (let i = types_rows.length - 1; i >= 0; i--) {

						const type_row = types_rows[i]

						// cross_coins
							const ar_found_coin_row = type_row.coin_references
								? cross_coins(coins_rows, type_row.coin_references)
								: []
							// console.log("ar_found_coin_row:",ar_found_coin_row, ar_found_coin_row.length);
							// console.log("type_row:",type_row);

						// mint grouper (only non already mints)
							if (item_type!=='mint') {

								const mint_label = type_row.p_mint && Array.isArray(type_row.p_mint)
									? type_row.p_mint.join(' - ')
									: null
								if (mint_label && mint_label!==last_mint_label) {
									// mint_line
									common.create_dom_element({
										element_type	: "div",
										class_name		: "mint_line line-tittle golden-color",
										inner_html		: mint_label,
										parent			: types_wrap
									})

									last_mint_label = mint_label
								}
							}

						// type node
							const type_row_node = catalog_row_fields.draw_item(type_row)
							types_wrap.appendChild(type_row_node)

						// debug info
							// if(SHOW_DEBUG===true) {
							// 	let t = ''
							// 	t +='-global_data_item types_list ('+info.types_list.length+'): ' + JSON.stringify(info.types_list, null, 2)
							// 	t +='<br>-global_data_item coins_list ('+info.coins_list.length+'): ' + JSON.stringify(info.coins_list, null, 2)
							// 	t +='<br>-Catalog '+type_row.section_id+' Type '+type_row.term_data+' coins: '+JSON.stringify(type_row.coin_references)
							// 	t +='<br>-'+tstring[item_type]+' '+global_data_item.ref_section_id+' coins_rows: '+JSON.stringify( coins_rows.map(function(el){return el.section_id}) )
							// 	t +='<br>-Cross coins ('+ar_found_coin_row.length+'): '+JSON.stringify( ar_found_coin_row.map(function(el){return el.section_id}) )

							// 	const debug_show = ar_found_coin_row.length>0 ? 'hide' : ''
							// 	common.create_dom_element({
							// 		element_type	: "div",
							// 		class_name		: "debug_info " + debug_show,
							// 		inner_html		: t,
							// 		parent			: type_row_node
							// 	})
							// }

						// coins nodes
							const ar_found_coin_row_length = ar_found_coin_row.length
							if (ar_found_coin_row_length>0) {

								const coins_wrap = common.create_dom_element({
									element_type	: "div",
									class_name		: "coins_wrap",
									parent			: types_wrap
								})

								// button show coins
									const button_show_coins = common.create_dom_element({
										element_type	: "div",
										class_name		: "button_show_coins",
										inner_html		: (tstring.coins || "Coins") + " (" + ar_found_coin_row_length +")",
										parent			: coins_wrap
									})
									button_show_coins.addEventListener("click", function(){
										coins_list.classList.toggle("hide")
										this.classList.toggle("opened")
									})

								// coins list
									const coins_list = common.create_dom_element({
										element_type	: "div",
										class_name		: "coins_list gallery",
										parent			: coins_wrap
									})

								// row nodes
									for (let k = 0; k < ar_found_coin_row.length; k++) {
										const coin_row	= ar_found_coin_row[k];
										const coin_node	= type_row_fields_min.type_row_fields.draw_coin(coin_row)
										coins_list.appendChild(coin_node)
									}
							}
					}

				// catalog draw_rows
					// catalog.draw_rows({
					// 	target	: types_wrap,
					// 	ar_rows	: types_rows
					// })

				// mint draw_types
					// mint.draw_types({
					// 	target	: types_wrap,
					// 	ar_rows	: {
					// 		children : types_rows
					// 	}
					// })
			}else{

				// debug info
					if(SHOW_DEBUG===true) {
						let t = 'found types '+ JSON.stringify(types_rows, null, 2)
						t +='<br>found coins '+ JSON.stringify(coins_rows.map(el=>el.section_id), null, 2)
						t += '<br>map_global <pre>' + JSON.stringify(global_data_item, null, 3) + '</pre>'
						common.create_dom_element({
							element_type	: "div",
							class_name		: "debug_info ",
							inner_html		: t,
							parent			: fragment
						})
					}
			}


		return fragment
	},//end render_types_list



	/**
	* GET_RANGE_YEARS
	* @return
	*/
	get_range_years : function() {

		return new Promise(function(resolve){

			const ar_fields = ['id','section_id','MIN(date_in + 0) AS min','MAX(date_in + 0) AS max']

			const request_body = {
				dedalo_get	: 'records',
				db_name		: page_globals.WEB_DB,
				lang		: page_globals.WEB_CURRENT_LANG_CODE,
				table		: 'coins',
				ar_fields	: ar_fields,
				limit		: 0,
				count		: false,
				offset		: 0,
				order		: 'id ASC'
			}
			data_manager.request({
				body : request_body
			})
			.then(function(api_response){
				// console.log("-> get_range_years api_response:",api_response);

				let min = 0
				let max = 0
				if (api_response.result) {
					for (let i = 0; i < api_response.result.length; i++) {
						const row = api_response.result[i]
						const current_min = parseInt(row.min)
						if (min===0 || current_min<min) {
							min = current_min
						}
						const current_max = parseInt(row.max)
						// if (current_max>min) {
							max = current_max
						// }
					}
				}

				const data = {
					min : min,
					max : max
				}

				resolve(data)
			})
		})
	}//end get_range_years



}//end coins


