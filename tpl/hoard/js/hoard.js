"use strict";



var hoard =  {



	// trigger_url 	: page_globals.__WEB_TEMPLATE_WEB__ + "/hoard/trigger.hoard.php",
	search_options 	: {},

	map : null,


	/**
	* SET_UP
	* When the HTML page is loaded
	*/
	set_up : function(options) {

		const self = this

		const row_detail =  document.getElementById('row_detail')

		// trigger render hoard with current options.section_id 
			if (typeof options.section_id!=="undefined" && options.section_id>0) {
				
				// search by section_id			
					const search = self.get_row_data({
						section_id : options.section_id
					})
					.then(function(response){
						console.log("[set_up->get_row_data] response:",response);

						if (response.result && response.result.length>0) {

							// row draw
								self.draw_row({
									target  : row_detail,
									ar_rows : response.result
								})
								.then(function(){
									// map draw. Init default map
									const map_data = JSON.parse(response.result[0].map)
									self.draw_map({
										map_data : map_data
									})	
								})
						}else{
							row_detail.innerHTML = 'Sorry. Empty result for section_id: ' + options.section_id
						}
					})
			}else{
				row_detail.innerHTML = 'Error. Invalid section_id'
			}
	
		// navigate across records group
			// document.onkeyup = function(e) {
			// 	if (e.which == 37) { // arrow left <-
			// 		let button = document.getElementById("go_prev")
			// 		if (button) button.click()
			// 	}else if (e.which == 39) { // arrow right ->
			// 		let button = document.getElementById("go_next")
			// 		if (button) button.click()
			// 	}		
			// }

		return true
	},//end set_up



	/**
	* GET_ROW_DATA
	* @return promise
	*/
	get_row_data : function(options) {

		const self = this

		const section_id	= options.section_id
		const ar_fields		= ['*']
		const sql_filter	= 'section_id=' + parseInt(section_id);

		// request
		return data_manager.request({
			body : {
				dedalo_get		: 'records',
				db_name			: page_globals.WEB_DB,
				lang			: page_globals.WEB_CURRENT_LANG_CODE,
				table			: 'hoards',
				ar_fields		: ar_fields,
				sql_filter		: sql_filter,
				limit			: 1,
				count			: false,
				offset			: 0,
				resolve_portals_custom	: {
					coins_data : 'coins'
				}
			}
		})
	},//end get_row_data



	/**
	* DRAW_ROW
	* @return promise
	*/
	draw_row : function(options) {

		const self = this

		return new Promise(function(resolve){

			// options
				const row_object	= options.ar_rows[0]
				const container 	= options.target

				console.log("draw_row row_object:", row_object)

			// fix row_object
				self.row_object = row_object

			// debug
				if(SHOW_DEBUG===true) {
					console.log("coin row_object:",row_object);
				}

			// container. clean container div
				while (container.hasChildNodes()) {
					container.removeChild(container.lastChild);
				}

			const fragment = new DocumentFragment();	

			// draw row wrapper
				const hoard_row_wrapper = hoard_row.draw_hoard(row_object)				
				fragment.appendChild(hoard_row_wrapper)			

			// container final fragment add
				container.appendChild(fragment)


			resolve(container)
		})
	},//end draw_row



	/**
	* DRAW_MAP
	*/
	draw_map : function(options) {

		const self = this

		// options
			const map_data = options.map_data


		const map_position	= map_data
		const container		= document.getElementById("map_container")

		self.map = self.map || new map_factory() // creates / get existing instance of map
		self.map.init({
			map_container	: container,
			map_position	: map_position,
			popup_builder	: page.map_popup_builder,
			popup_options	: page.maps_config.popup_options,
			source_maps		: page.maps_config.source_maps
		})
		// draw points
		const map_data_clean = self.map_data(map_data) // prepares data to used in map
		self.map.parse_data_to_map(map_data_clean, null)
		.then(function(){
			container.classList.remove("hide_opacity")
		})
		

		return true
	},//end draw_map



	/**
	* MAP_DATA
	* @return array data
	*/
	map_data : function(data) {
		
		const self = this

		console.log("--map_data data:",data);

		const ar_data = Array.isArray(data)
			? data
			: [data]

		const data_clean = []
		for (let i = 0; i < ar_data.length; i++) {
			
			const item = {
				lat			: ar_data[i].lat,
				lon			: ar_data[i].lon,
				marker_icon	: page.maps_config.markers.hoard,
				data		: {
					section_id	: null,
					title		: '',
					description	: ''
				}
			}
			data_clean.push(item)
		}

		console.log("--map_data data_clean:",data_clean);

		return data_clean
	},//end map_data


	
}//end type
