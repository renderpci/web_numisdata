"use strict";



var generic =  {

	area_name				: null,
	export_data_container	: null,

	set_up : function(options) {

		const self = this

		// options
			self.area_name				= options.area_name
			self.export_data_container	= options.export_data_container

		self.get_video_data({
			area_name : self.area_name
		})
		.then(function(data){
			console.log(data)
		})

		return true
	},//end set_up

	get_video_data : function(options){
		const self = this

		// options
			const area_name = options.area_name

		return new Promise(function(resolve){

			// vars
				const sql_filter	= 'web_path=' + "'"+area_name+"'"
				const ar_fields		= ['*']

			const request_body = {
					dedalo_get		: 'records',
					db_name			: page_globals.WEB_DB,
					lang			: page_globals.WEB_CURRENT_LANG_CODE,
					table			: 'ts_web',
					ar_fields		: ar_fields,
					sql_filter		: sql_filter,
					limit			: 1,
					count			: false,
					offset			: 0,
					resolve_portals_custom	: {
						audiovisual			: 'audiovisual'
					}
				}			
			
			// request
			return data_manager.request({
				body : request_body
			})
			.then(function(api_response){
				console.log("--> coins get_row_data api_response:", api_response);

				resolve(api_response.result)
			})
		})	

	}




}//end generic