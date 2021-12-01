"use strict";



var footer =  {
	
	set_up : function(options) {
		const self = this

		self.get_links_data({
			sql_filter : 'section_id='+32
		})
		.then(function(data){
			
			self.parse_links_data(data)
			.then(function(links_data){
				self.draw_footer_links (links_data)
			})

		})

	},

	get_links_data : function (options){
		const self = this

		return new Promise(function(resolve){

			// vars
				const sql_filter	= options.sql_filter
				const ar_fields		= ['*']

			const request_body = {
					dedalo_get		: 'records',
					db_name			: page_globals.WEB_DB,
					lang			: page_globals.WEB_CURRENT_LANG_CODE,
					table			: 'ts_web',
					ar_fields		: ar_fields,
					sql_filter		: sql_filter,
					limit			: 0,
					count			: false,
					offset			: 0
					/*resolve_portals_custom	: {
						type_data			: 'types'
					}*/
				}			
			
			// request
			return data_manager.request({
				body : request_body
			})
			.then(function(api_response){
				console.log("--> links data api_response:", api_response);
				resolve(api_response.result)
			})
		})		
	},

	parse_links_data : function (options) {
		const self = this

		let links_ids = ""
		const data_arr = JSON.parse(options[0].children)
		console.log(data_arr)
		for (let i=0;i<data_arr.length;i++){
			links_ids += i!=0 ? " OR " : ""
			links_ids += "section_id="+data_arr[i].section_id
		}

		return new Promise (function(resolve){
			return self.get_links_data({
					sql_filter : links_ids
				})
				.then (function(data){
					resolve(data)			
				})
		})
	},

	draw_footer_links : function (data){
		const self = this

		const links_data = data
		const footer_links_el = document.querySelector('#footer-links')

		const fragment = new DocumentFragment();

		const list = common.create_dom_element({
			element_type 	: "ul",
			class_name 		: "footer-links-ul",
			parent 			: fragment
		})

		for (let i=0;i<links_data.length;i++){

			const term = links_data[i].term
			const path = links_data[i].web_path

			const list_element = common.create_dom_element({
				element_type 	: "li",
				class_name 		: "footer-links-li",
				parent 			: list
		
			})

			common.create_dom_element({
				element_type 	: "a",
				class_name 		: "footer-links-a",
				text_content 	: term,
				href 			: page_globals.__WEB_ROOT_WEB__+"/"+path,
				parent 			: list_element
		
			})

		}
		footer_links_el.appendChild(fragment)

	}

}//end footer