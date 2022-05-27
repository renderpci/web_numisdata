/*global tstring, page_globals, SHOW_DEBUG, coin_row, event_manager, data_manager, Promise, page */
/*eslint no-undef: "error"*/

"use strict";



var coin = {


	section_id				: null,
	export_data_container	: null,


	/**
	* SET_UP
	* When the HTML page is loaded
	* @param object options
	*/
	set_up : function(options) {

		const self = this

		// options
			self.section_id				= options.section_id
			self.export_data_container	= options.export_data_container

		// export_data_buttons added once
			const export_data_buttons = page.render_export_data_buttons()
			self.export_data_container.appendChild(export_data_buttons)
			self.export_data_container.classList.add('hide')

			//suggestions_form_button
			const contact_form_button = page.create_suggestions_button()
			self.export_data_container.appendChild(contact_form_button)

		// trigger render coin with current options.section_id
			if (self.section_id || self.section_id<1) {

				// search by section_id
					self.get_row_data({
						section_id : self.section_id
					})
					.then(function(data){

						// draw row
						const target = document.getElementById('row_detail')
						if (target) {

							// row . Note data is an array of one row, already parsed
								const row = data[0];

							// render row nodes
								self.render_row({
									target	: target,
									row		: row
								})
								.then(function(){

									// activate images gallery light box
										const images_gallery_container = target.querySelector('.gallery')
										page.activate_images_gallery(images_gallery_container)

									// show export buttons
										self.export_data_container.classList.remove('hide')
								})
						}
					})
			}else{
				console.error("Invalid section_id: ", options);
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
	* Make a request to Dédalo public API to get current section_id record
	* parse the result
	* @return promise : array of rows (one expected)
	*/
	get_row_data : function(options) {

		const self = this

		// options
			const section_id = options.section_id

		return new Promise(function(resolve){

			// vars
				const sql_filter	= 'section_id=' + section_id
				const ar_fields		= ['*']

			const request_body = {
					dedalo_get		: 'records',
					db_name			: page_globals.WEB_DB,
					lang			: page_globals.WEB_CURRENT_LANG_CODE,
					table			: 'coins',
					ar_fields		: ar_fields,
					sql_filter		: sql_filter,
					limit			: 1,
					count			: false,
					offset			: 0,
					resolve_portals_custom	: {
						type_data			: 'types',
						bibliography_data	: 'bibliographic_references',
						image_obverse_data	: 'images'
						// images_obverse	: 'images_obverse',
						// images_reverse	: 'images_reverse'
					}
				}

			// request
			return data_manager.request({
				body : request_body
			})
			.then(function(api_response){
				// console.log("--> coins get_row_data api_response:", api_response);

				// parse server data
					const data = page.parse_coin_data(api_response.result)

				// send event data_request_done (used by download buttons)
					event_manager.publish('data_request_done', {
						request_body		: request_body,
						result				: data,
						export_data_parser	: page.export_parse_coin_data
					})

				resolve(data)
			})
		})
	},//end get_row_data



	/**
	* RENDER_ROW
	*/
	render_row : function(options) {

		const self = this

		// options
			const row		= options.row
			const container	= options.target

		// fix row
			self.row = row

		// debug
			if(SHOW_DEBUG===true) {
				// console.log("coin row:",row);
			}

		return new Promise(function(resolve){

			// container. clean container div
				while (container.hasChildNodes()) {
					container.removeChild(container.lastChild);
				}

			// draw row coin
				const coin_row_wrapper = coin_row.draw_coin(row)

			// container final fragment add
				container.appendChild(coin_row_wrapper)


			resolve(container)
		})
	}//end render_row



}//end coin
