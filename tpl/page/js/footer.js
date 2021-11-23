"use strict";



var footer =  {
	
	set_up : function(options) {
		const self = this

		const liks_data = self.get_links_data()
	},

	get_links_data : function (options){
		const self = this

		return new Promise(function(resolve){

			// vars
				const sql_filter	= 'section_id=26'
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
				resolve(api_response)
			})
		})		
	}

}//end footer