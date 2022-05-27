/*global tstring, page_globals, Promise, data_manager, common */
/*eslint no-undef: "error"*/

"use strict";



var generic =  {



	row						: null,
	area_name				: null,
	export_data_container	: null,



	set_up : function(options) {

		const self = this

		// options
			self.area_name				= options.area_name
			self.export_data_container	= options.export_data_container
			self.row					= options.row


		// video data check
			self.get_video_data({
				area_name : self.area_name
			})
			.then(function(data){

				if (data.length>0 && data[0].audiovisual && data[0].audiovisual.length>0){
					const video_data = data[0].audiovisual
					for (let i=0;i<video_data.length;i++){
						self.create_video_element(video_data[i])
					}
				}
			})

		return true
	},//end set_up



	/**
	* GET_VIDEO_DATA
	*/
	get_video_data : function(options){

		const self = this

		// options
			const area_name = options.area_name

		return new Promise(function(resolve){

			// vars
				const sql_filter	= 'web_path=' + "'"+area_name+"'"
				const ar_fields		= ['*']

			const request_body = {
				dedalo_get	: 'records',
				db_name		: page_globals.WEB_DB,
				lang		: page_globals.WEB_CURRENT_LANG_CODE,
				table		: 'ts_web',
				ar_fields	: ar_fields,
				sql_filter	: sql_filter,
				limit		: 1,
				count		: false,
				offset		: 0,
				resolve_portals_custom	: {
					audiovisual	: 'audiovisual'
				}
			}

			// request
				return data_manager.request({
					body : request_body
				})
				.then(function(api_response){
					// console.log("--> video_data api_response:", api_response);

					resolve(api_response.result)
				})
		})
	},//end get_video_data



	/**
	* CREATE_VIDEO_ELEMENT
	*/
	create_video_element : function(data){

		const video_url = data.video
		const video_url_720 = video_url.replace('/404/','/720/')
		const url_arr = video_url.split('/')
		const filename = url_arr[url_arr.length-1]
		const video_thumbnail = filename.split('.')[0]+".jpg"
		const video_thumbnail_url = page_globals.__WEB_MEDIA_BASE_URL__+"/dedalo/media/av/posterframe/"+video_thumbnail
		const video_title = data.title
		const fragment = new DocumentFragment()

		const video_wrapper = common.create_dom_element({
			element_type	: "div",
			class_name		: "video-wrapper",
			parent 			: fragment
		})
		// video_title_el
		common.create_dom_element({
			element_type	: "h2",
			class_name		: "video-title",
			parent			: video_wrapper,
			inner_html		: video_title
		})

		const video_thumbnail_el = common.create_dom_element({
			element_type	: "div",
			class_name		: "video-thumb",
			parent			: video_wrapper
		})

		//define video styles
		video_thumbnail_el.style.background = "url("+page_globals.__WEB_TEMPLATE_WEB__+"/assets/images/video_thumb_overlay.png) no-repeat center ,url("+video_thumbnail_url+") no-repeat center"
		video_thumbnail_el.style.backgroundSize = "cover"

		video_thumbnail_el.addEventListener("mouseenter", function(){
			video_thumbnail_el.style.background = "url("+video_thumbnail_url+") no-repeat center"
			video_thumbnail_el.style.backgroundSize = "cover"
		})

		video_thumbnail_el.addEventListener("mouseleave", function(){
			video_thumbnail_el.style.background = "url("+page_globals.__WEB_TEMPLATE_WEB__+"/assets/images/video_thumb_overlay.png) no-repeat center ,url("+video_thumbnail_url+") no-repeat center"
			video_thumbnail_el.style.backgroundSize = "cover"
		})

		//Define click behavior
		video_thumbnail_el.addEventListener("click", function(){
			video_thumbnail_el.style.display = "none"

			let video_el = document.createRange().createContextualFragment('<video class="video-thumb" controls autoplay><source src="'+page_globals.__WEB_MEDIA_BASE_URL__+video_url_720+'" type="video/mp4"></video>')
			video_wrapper.appendChild(video_el)

		})

		const container = document.querySelector(".content")
		container.appendChild(fragment)

		return fragment
	}//end create_video_element




}//end generic