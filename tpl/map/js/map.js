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


	/**
	* SET_UP
	* When the HTML page is loaded
	* @param object options
	*/
	set_up : function(options) {

		const self = this

		// options
			self.form_container	= options.form_container
			self.rows_container	= options.rows_container
			self.map_container	= options.map_container

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
		
		const request_body = {
			dedalo_get	: 'records',
			db_name		: page_globals.WEB_DB,
			lang		: page_globals.WEB_CURRENT_LANG_CODE,
			table		: ['hoards','findspots'],
			ar_fields	: ['place','georef_geojson'],
			sql_filter	: null,
			limit		: 10,
			count		: false,
			offset		: 0,
			order		: null
		}
		data_manager.request({
			body : request_body
		})
		.then((response)=>{
			console.log("--- search_rows API response:", response);
		})


		return true
	},//end set_up
	

	
}//end coins
