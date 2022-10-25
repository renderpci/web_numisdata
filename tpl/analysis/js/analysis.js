/*global tstring, page_globals, Promise, data_manager, common */
/*eslint no-undef: "error"*/

"use strict";



var analysis =  {



	area_name				: null,
	export_data_container	: null,
	row						: null,



	set_up : function(options) {

		const self = this

		// options
			self.area_name				= options.area_name
			self.export_data_container	= options.export_data_container
			self.row					= options.row


		return true
	},//end set_up



}//end analysis