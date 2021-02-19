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
		// map_global_data
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
			const source_maps = [
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

			self.map_factory_instance = self.map_factory_instance || new map_factory() // creates / get existing instance of map
			self.map_factory_instance.init({
				map_container	: self.map_container,
				map_position	: null,
				popup_builder	: page.map_popup_builder,
				popup_options	: page.maps_config.popup_options,
				source_maps		: source_maps
			})
		
		// map base data from map_global
			const request_body = {
				dedalo_get	: 'records',
				db_name		: page_globals.WEB_DB,
				lang		: page_globals.WEB_CURRENT_LANG_CODE,
				table		: 'map_global',
				ar_fields	: '*',
				sql_filter	: null,
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
					
					// fix map_global data
					self.map_global_data = page.parse_map_global_data(response.result)
					
					// initial map with all points without filters
					self.map_factory_instance.parse_data_to_map(self.map_global_data, 'caller_mode')
				}
			})

		// form
			self.form		= new form_factory()
			self.form_node	= self.render_form()
			self.form_container.appendChild(self.form_node)



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

		// public_info
			self.form.item_factory({
				id			: "public_info",
				name		: "public_info",
				label		: tstring.public_info || "public_info",
				q_column	: "public_info",
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

		// submit button
			const submit_group = common.create_dom_element({
				element_type	: "div",
				class_name 		: "form-group field button_submit",
				parent 			: fragment
			})
			const submit_button = common.create_dom_element({
				element_type	: "input",
				type 			: "submit",
				id 				: "submit",
				value 			: tstring.search || "Search",
				class_name 		: "btn btn-light btn-block primary",
				parent 			: submit_group
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
				class_name		: "form-inline"
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

		const rows_container = self.rows_container

		self.map_container.classList.add("loading")

		return

		// loading start
			if (!self.pagination.total) {
				page.add_spinner(rows_container)
			}else{
				rows_container.classList.add("loading")
			}

		return new Promise(function(resolve){

			const table		= 'coins'
			const ar_fields	= ['*']
			const limit		= self.pagination.limit
			const offset	= self.pagination.offset
			const count		= true			
			const order		= "section_id ASC"

			const sql_filter = self.form.form_to_sql_filter({
				form_node : form_node
			})

			data_manager.request({
				body : {
					dedalo_get		: 'records',
					table			: table,
					ar_fields		: ar_fields,
					sql_filter		: sql_filter,
					limit			: limit,
					count			: count,
					offset			: offset,
					order			: order,
					process_result	: null
				}
			})
			.then(function(api_response){
				console.log("--------------- api_response:",api_response);
				
				// parse data
					const data	= page.parse_coin_data(api_response.result)
					const total	= api_response.total

					self.pagination.total	= total
					self.pagination.offset	= offset

					if (!data) {
						rows_container.classList.remove("loading")
						resolve(null)
					}
				
				// loading end
					(function(){
						while (rows_container.hasChildNodes()) {
							rows_container.removeChild(rows_container.lastChild);
						}
						rows_container.classList.remove("loading")
					})()
				
				// render
					self.list = self.list || new list_factory() // creates / get existing instance of list
					self.list.init({
						data			: data,
						fn_row_builder	: self.list_row_builder,
						pagination		: self.pagination,
						caller			: self
					})
					self.list.render_list()
					.then(function(list_node){
						if (list_node) {
							rows_container.appendChild(list_node)
						}
						resolve(list_node)
					})
			})
		})
	},//end form_submit
	

	
}//end coins
