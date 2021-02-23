/*global tstring, page_globals, SHOW_DEBUG, common, page, map*/
/*eslint no-undef: "error"*/

"use strict";



var map =  {



	/**
	* VARS
	*/
		// DOM items ready from page html
		form_container	: null,
		rows_container	: null,
		map_container	: null,

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



	/**
	* SET_UP
	* When the HTML page is loaded
	* @param object options
	*/
	set_up : function(options) {
		console.log("--> map set_up options:",options);

		const self = this

		// options
			self.form_container	= options.form_container			
			self.map_container	= options.map_container
			self.rows_container	= options.rows_container

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
				sql_filter	: 'coins_list IS NOT NULL && types_list IS NOT NULL',
				limit		: 0,
				count		: false,
				offset		: 0,
				order		: null
			}
			data_manager.request({
				body : request_body
			})
			.then((response)=>{
				console.log("--- search_rows API response:", response);

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
			})

		// form
			self.form		= new form_factory()
			self.form_node	= self.render_form()
			self.form_container.appendChild(self.form_node)

		// show search button
			const show_search_button = document.getElementById("search_icon")
			show_search_button.addEventListener("mousedown", function(){
				self.form_node.classList.toggle("hide")
			})

		// events
			event_manager.subscribe('map_selected_marker', map_selected_marker)
			function map_selected_marker(options){
				console.log("///-> map_selected_marker options:",options);

				const selected_element = typeof options.item.group[0]!=="undefined"
					? options.item.group[0]
					: null
				if (selected_element) {
					
					// clean container
						while (self.rows_container.hasChildNodes()) {
							self.rows_container.removeChild(self.rows_container.lastChild);
						}
						page.add_spinner(self.rows_container)
					
					// render related types list
						self.load_map_selection_info(selected_element)
						.then(function(response){
							console.log("--> load_map_selection_info response:",response);
							if (response) {
								const types_list_node = self.render_types_list({
									global_data_item	: response.global_data_item,
									types_rows			: response.types_rows
								})
								self.rows_container.appendChild(types_list_node)
								page.remove_spinner(self.rows_container)
							}else{
								page.remove_spinner(self.rows_container)
							}
						})
				}
			}

		return true
	},//end set_up



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
		
		// section_id
			self.form.item_factory({
				id			: "section_id",
				name		: "section_id",
				label		: tstring.is || "ID",
				q_column	: "section_id",
				eq			: "=",
				eq_in		: "",
				eq_out		: "",
				parent		: form_row
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

		// ref_auction
			self.form.item_factory({
				id			: "ref_auction",
				name		: "ref_auction",
				label		: tstring.auction || "auction",
				q_column	: "ref_auction",
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

		// mint
			self.form.item_factory({
				id			: "mint",
				name		: "mint",
				label		: tstring.mint || "mint",
				q_column	: "mint",
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
		
		// form
			const form_node = common.create_dom_element({
				element_type	: "form",
				id				: "search_form",
				class_name		: "form-inline hide"
			})
			form_node.appendChild(fragment)


		return form_node
	},//end render_form



	/**
	* FORM_SUBMIT
	*/
	form_submit : function() {

		const self = this
		
		const form_node = self.form_node
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

			const ar_fields		= ['section_id','mint_data','hoard_data','findspot_data','type_data']
			const sql_filter	= self.form.form_to_sql_filter({
				form_node : form_node
			})

			data_manager.request({
				body : {
					dedalo_get		: 'records',
					table			: 'coins',
					ar_fields		: ar_fields,
					sql_filter		: sql_filter + " AND type_data IS NOT NULL",
					limit			: 0,
					count			: false,
					offset			: 0,
					order			: null,
					// group		: "type_data",
					process_result	: null
				}
			})
			.then(function(api_response){
				console.log("--------------- form_submit api_response:",api_response); 

				self.current_map_global_data = self.distribute_coins(api_response.result)
					console.log("self.current_map_global_data:",self.current_map_global_data);

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

				// loading ends
					self.map_container.classList.remove("loading")
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
		
		const new_map_global_data = []
		const master_map_global_data_len = self.master_map_global_data.length
		for (let i = 0; i < master_map_global_data_len; i++) {

			const map_row = self.master_map_global_data[i]
			
			let found_coins = []
			switch(map_row.table) {
				case 'mints':
					found_coins = coin_rows.filter(function(el){
						return '["'+map_row.ref_section_id+'"]'===el.mint_data
					})
					break;
				case 'hoards':
					found_coins = coin_rows.filter(function(el){
						return '["'+map_row.ref_section_id+'"]'===el.hoard_data
					})
					break;
				case 'findspots':
					found_coins = coin_rows.filter(function(el){
						return '["'+map_row.ref_section_id+'"]'===el.findspot_data
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

				// item data update
					const description = (tstring.coins || 'Coins') + ' ' + new_row.coins_list.length +'<br>'+ (tstring.types || 'Types') + ' ' + new_row.types_list.length
					new_row.item.data.coins_total = coins_list.length
					new_row.item.data.types_total = types_list.length
					new_row.item.data.description = description

			// add cloned and updated row
				new_map_global_data.push(new_row)
			
		}
		// console.log("new_map_global_data:",new_map_global_data);

		return new_map_global_data
	},//end distribute_coins



	/**
	* LOAD_MAP_SELECTION_INFO
	* @return 
	*/
	load_map_selection_info : function(item) {

		const self = this

		return new Promise(function(resolve){				

			// mint-findspot-hoard row data
				const global_data_item = self.current_map_global_data.find(function(el){
					return el.section_id===item.term_id
				})
				if (!global_data_item || !global_data_item.types_list || global_data_item.types_list.length<1) {
					console.warn("Ignored invalid item. Not found item or item.types_list in global_data! ", item.name, item);					
					resolve(false)
					return false;
				}
				const coins_list	= global_data_item.coins_list
				const types_list	= global_data_item.types_list

			// search types in catalog using types list
				const ar_type_id = types_list.map(function(item){
					return '\'["' + item + '"]\''
				})
				const sql_filter = 'term_table=\'types\' AND term_data IN(' + ar_type_id.join(",") + ')'

				const catalog_ar_fields = ['*']
				
				const request_body = {
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
				data_manager.request({
					body : request_body
				})
				.then((api_response)=>{				
					console.log("-> load_map_selection_info api_response:",api_response);

					const types_rows = page.parse_catalog_data(api_response.result)
						// console.log("types_rows:",types_rows);

					resolve({
						global_data_item	: global_data_item,
						types_rows			: types_rows
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

		const fragment = new DocumentFragment()

		const wrapper = common.create_dom_element({
			element_type	: "div",
			class_name		: "types_list_wrapper",
			parent			: fragment
		})

		// title line
			const title_line = common.create_dom_element({
				element_type	: "div",
				class_name		: "line-tittle-wrap",
				parent			: wrapper
			})
			let item_type
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

		// types list
		if (types_rows && types_rows.length>0) {

			const types_wrap = common.create_dom_element({
				element_type	: "div",
				class_name		: "types_wrap",
				parent			: fragment
			})

			// catalog_row_fields
				for (let i = 0; i < types_rows.length; i++) {
					const row_node = catalog_row_fields.draw_item(types_rows[i])
					types_wrap.appendChild(row_node)
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
		}

		return fragment
	},//end render_types_list
	

	
}//end coins
