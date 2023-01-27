/*global tstring, page_globals, Promise, data_manager, common, SHOW_DEBUG */
/*eslint no-undef: "error"*/

"use strict";



var tpl_common = {


	ar_restricted_tc : [],
	tcin_seconds  	 : 0,
	tcout_seconds 	 : null,
	margin_secs   	 : 0, // Margin for cut video (ar_restricted_tc)


	setup : function() {

		const self = this
		window.ready(function(){
			//self.fix_body_height()
			//$(".colorbox").colorbox({rel:'group1',width:"80%", height:"80%"});

			// activate_tooltips
			tpl_common.activate_tooltips()
		})
		//window.addEventListener("resize", self.fix_body_height, false)

		// Localize colorbox
		// jQuery.extend(jQuery.colorbox.settings, {
		//     current: (tstring["imagen"] || "Imagen") + " {current} "+ (tstring["de"] || "de") +" {total}",
		//     previous: tstring["anterior"] || "Anterior",
		//     next: tstring["siguiente"] || "Siguiente",
		//     close: tstring["cerrar"] || "Cerrar",
		//     xhrError: tstring["error_carga_contenido"] || "Error en la carga del contenido.",
		//     imgError: tstring["error_carga_imagen"] || "Error en la carga de la imagen."
		// });


		var isIE 	= (navigator.userAgent.indexOf("MSIE") != -1)
		var isiE11 	= /rv:11.0/i.test(navigator.userAgent)
		if (isIE || isiE11) {
			var warning_ms = tstring.incompatible_browser || "Warning: Internet explorer is not supported. Please use a modern browser like Chrome, Firefox, Safari, Opera, Edje.."
			alert(warning_ms)
			return false
		}
	},//end setup



	/**
	* LOAD_VIDEO_SEARCH_FREE
	* Needs:
	*	section_id (reel section_id of table audiovisual)
	* 	q (searched word to cut fragment)
	* @return promise
	*/
	load_video_search_free : function(button_obj) {

		const self = this

		// Get button data fron dataset
		const video_data  = JSON.parse(button_obj.dataset.video_data)

		const options = {
			trigger_vars : {
				mode  		: "load_video_search_free",
				lang 		: page_globals.WEB_CURRENT_LANG_CODE,
				section_id 	: video_data.av_section_id,
				q 			: video_data.q,
			},
			button_obj   : button_obj,
			terms 		 : video_data.terms
		}

		return self.load_video(options)
	},//end load_video_search_free



	/**
	* LOAD_VIDEO_SEARCH_THEMATIC
	* Needs:
	*	index locator (target indexation locator. Only are used properties section_id, and tag_id. Other locator properties are ignored)
	* @return promise
	*/
	load_video_search_thematic : function(button_obj) {

		const self = this

		// Get button data from dataset
		const index_locator   = JSON.parse(button_obj.dataset.locator)

		const options = {
			trigger_vars : {
				mode  			: "load_video_search_thematic",
				lang 			: page_globals.WEB_CURRENT_LANG_CODE,
				index_locator 	: index_locator,
				locator_key 	: button_obj.dataset.locator_key
			},
			term : decodeURIComponent(button_obj.dataset.term)
		}

		return self.load_video(options)
	},//end load_video_search_thematic



	/**
	* LOAD_VIDEO_INTERVIEW
	* @return promise
	*/
	load_video_interview : function(button_obj) {

		const self = this

		// Get button data from dataset
			const data = JSON.parse(button_obj.dataset.data)

		// ar_av_section_id
			let ar_av_section_id = data.av_section_id
			if (!Array.isArray(ar_av_section_id)) {
				ar_av_section_id = [ar_av_section_id]
			}
		// av_section_id_key
			const av_section_id_key= parseInt(data.av_section_id_key)

		// Select the correct av by key
			if (typeof(ar_av_section_id[av_section_id_key])==="undefined") {
				console.error("Error: av_section_id not found! ",ar_av_section_id, av_section_id_key)
				return false;
			}
			const av_section_id = ar_av_section_id[av_section_id_key]

		// load_video
			const options = {
				trigger_vars 	  : {
					mode  			: "load_video_interview",
					lang 			: page_globals.WEB_CURRENT_LANG_CODE,
					av_section_id 	: av_section_id
				},
				ar_av_section_id  : ar_av_section_id,
				av_section_id_key : av_section_id_key
			}

		return self.load_video(options)
	},//end load_video_interview



	/**
	* LOAD_VIDEO
	* @param DOM object button_obj
	*/
	load_video : function(options) {
		if(SHOW_DEBUG===true) {
			console.log("[tpl_common.load_video] options:",options)
		}

		const self = this

		// set base64 encoded options (binary to ASCII)
			tpl_common.load_video_options = window.btoa(JSON.stringify(options));

		// debug check decode properly
			// var decodedData = window.atob(tpl_common.load_video_options); // decode the string
			// console.log("decodedData:", JSON.parse(decodedData));

		const ar_av_section_id 	= options.ar_av_section_id
		const av_section_id_key = options.av_section_id_key
		const trigger_url  		= page_globals.__WEB_TEMPLATE_WEB__ + "/page/trigger.web.php"
		const trigger_vars 		= options.trigger_vars
		const mode 				= trigger_vars.mode
		const index_locator 	= trigger_vars.index_locator
		const term 				= options.term || null

		// video_wrapper. Create video wrapper to contain all elements
			//let video_wrapper
			//if (video_wrapper = document.getElementById("video_wrapper")) {
			//	video_wrapper.classList.add("loading")
			//	while (video_wrapper.hasChildNodes()) {
			//		video_wrapper.removeChild(video_wrapper.lastChild);
			//	}
			//}else{
			const video_wrapper = common.create_dom_element({
					element_type : "div",
					id 			 : "video_wrapper",
					class_name   : "video_wrapper loading"
				})
			//}

		// Dialog box (https://www.fancyapps.com/fancybox/3/docs/#api)
			const instance = $.fancybox.getInstance();
			if (instance) instance.close();
			$.fancybox.open({
				src  : video_wrapper,
				type : 'inline',
				opts : {
					afterShow : function( instance, current ) {
						// Activate
						//video_view.activate(video, options.play)
						//console.info( 'done!', instance, current );
					},
					animationDuration: 100,
					video : {
						autoStart : false
					}
				}
			});

		// Http request directly in javascript to the API is possible too..
		const js_promise = common.get_json_data(trigger_url, trigger_vars).then(function(response){
				if(SHOW_DEBUG===true) {
					console.log("[tpl_common.load_video] response:" , response);
				}

				if (!response) {
					// Error on load data from trigger
						console.warn("[tpl_common.load_video] Error. Received response data is null");

				}else{
					// Success
						let video_url
						let posterframe_url
						let fragm
						let abstract
						let full_data
						let full_reel
						let terms
						let term_text
						let subtitles_url
						let tcin_secs
						let tcout_secs
						let filmstrip
						let ar_restricted_fragments
						let av_section_id

						switch(mode) {

							case "load_video_search_thematic":
								// set vars
									video_url 				= response.result.video_url
									posterframe_url 		= response.full.result.image_url
									fragm 					= response.result.fragm
									abstract 				= response.full.result.abstract
									full_data 				= response.full.result
									full_reel 				= response.full
									terms 					= terms
									term_text 				= term
									tcin_secs 				= parseInt(response.result.tcin_secs)
									tcout_secs 				= parseInt(response.result.tcout_secs)
									ar_restricted_fragments = response.full.result.ar_restricted_fragments
									av_section_id 			= response.full.result.av_section_id
									subtitles_url 			= response.result.subtitles_url

								// filmstrip
									if (index_locator.length>1) {
										filmstrip = ui.video_player.build_filmstrip({
											mode 			: "indexations",
											posterframe_url	: posterframe_url,
											index_locator 	: index_locator,
											locator_key 	: trigger_vars.locator_key,
											term 			: term
										})
									}
								break;

							case "load_video_search_free":
								// set vars
									video_url 				= response.result[0].fragments[0].video_url
									posterframe_url 		= response.result[0].image_url
									fragm 					= response.result[0].fragments[0].fragm
									abstract 				= response.result[0].abstract
									full_data 				= response.result[0]
									full_reel 				= response.full_reel
									terms 					= response.result[0].fragments[0].terms
									subtitles_url 			= response.result[0].fragments[0].subtitles_url
									tcin_secs 				= parseInt(response.result[0].fragments[0].tcin_secs)
									tcout_secs  			= parseInt(response.result[0].fragments[0].tcout_secs)
									ar_restricted_fragments = response.result[0].ar_restricted_fragments
									av_section_id 			= response.full_reel.result.av_section_id

								break;

							case "load_video_interview":
								// set vars
									video_url 				= response.result.video
									posterframe_url 		= response.result.image_url
									fragm 					= response.result.fragments[0].fragm
									abstract 				= response.result.abstract
									full_data 				= response.result
									full_reel 				= false
									terms 					= response.result.terms || null
									subtitles_url 			= response.result.fragments[0].subtitles_url
									tcin_secs 				= 0
									tcout_secs  			= null
									ar_restricted_fragments = response.result.ar_restricted_fragments
									av_section_id 			= response.result.av_section_id

								// filmstrip
									if (ar_av_section_id && ar_av_section_id.length>1) {
										filmstrip = ui.video_player.build_filmstrip({
											mode 			  : "tapes",
											ar_av_section_id  : ar_av_section_id,
											av_section_id_key : av_section_id_key,
											posterframe_url	  : posterframe_url
										})
									}
								break;
						}

					// Convert local to remote url
						video_url 		= common.local_to_remote_path(video_url)
						posterframe_url = common.local_to_remote_path(posterframe_url)
						if(SHOW_DEBUG===true) {
							console.log("video_url:",video_url,"posterframe_url",posterframe_url)
						}

					// Create subtitles object
						const ar_subtitles = [
							{
								src 	: subtitles_url  + "&db_name=" + page_globals.WEB_DB,
								srclang : page_globals.WEB_CURRENT_LANG_CODE_ISO2,
								label 	: tstring[page_globals.WEB_CURRENT_LANG_CODE_ISO2],
								default : true
							}
						]

						// fix subtitles_url for button
							tpl_common.subtitles_url = subtitles_url + "&db_name=" + page_globals.WEB_DB
							tpl_common.video_url 	 = video_url

						//const ar_subtitles = []
						//page_globals.SUBTITLES_TRACKS.forEach(function(element) {
						//
						//	console.log("element:",element);
						//
						//	const track = {
						//		src 	: subtitles_url  + "&db_name=" + page_globals.WEB_DB + "&lang=" + element.lang2iso3,
						//		srclang : element.lang2iso2,
						//		label 	: element.label
						//	}
						//
						//	if (element.lang2iso2===page_globals.WEB_CURRENT_LANG_CODE_ISO2) {
						//		track.default = true
						//	}
						//
						//	ar_subtitles.push(track)
						//});
						//console.log("ar_subtitles:",ar_subtitles);

					// Build video html and insert into video_container div
						// video. Build player
							const video = video_view.build_video_html5({
								// video type. (array) default ["video/mp4"]
								type 	 : ["video/mp4"],
								// video src. (array)
								src  	 : [video_url],
								// id. dom element video id (string) default "video_player"
								id 		 : "video_player",
								// controls. video control property (boolean) default true
								controls : true,
								// play (boolean). play video on ready. default false
								play : false,
								// poster image. (string) url of posterframe image
								poster 	 : posterframe_url,
								// class css. video aditional css classes
								class 	 : "", // "video-js video_hidden",
								// preload (string) video element attribute preload
								preload  : "auto",
								// width (integer) video element attribute. default null
								width 	 : null,
								// height (integer) video element attribute. default null
								height 	 : null,
								// tcin_secs (integer). default null
								tcin_secs  : tcin_secs,
								// tcout_secs (integer). default null
								tcout_secs : tcout_secs,
								// ar_subtitles (array). array of objects with subtitles full info. default null
								ar_subtitles : ar_subtitles,
								// ar_restricted_fragments. (array) default null
								ar_restricted_fragments : ar_restricted_fragments.map((obj) => {
									if (obj) {
										return {	tcin_secs  : obj.tcin_secs,
													tcout_secs : obj.tcout_secs,
												}
									}
								})
							})

						// watermark
							const watermark = common.create_dom_element({
								element_type 	: "div",
								class_name 		: "watermark"
							})

						// top_info
							const top_info = ui.video_player.build_top_info({
								data : full_data
							})

						// footer_info
							const footer_info = ui.video_player.build_footer_info({
								mode 	  		: trigger_vars.mode,
								term_text 		: typeof(term_text)!=="undefined" ? term_text : null,
								terms 	  		: terms,
								av_section_id 	: av_section_id
							})

						// body_info
							const body_info = ui.video_player.build_body_info({
								mode 			: mode,
								abstract 		: abstract,
								transcription 	: fragm,
								terms 			: terms
							})

						// Append created elements to wrapper
							video_wrapper.appendChild(top_info)
							video_wrapper.appendChild(watermark)
							video_wrapper.appendChild(video)
							video_wrapper.appendChild(footer_info)
							video_wrapper.appendChild(body_info)
							if (filmstrip) {
								video_wrapper.appendChild(filmstrip)
							}

						// subtitles info. (Transcription and subtitles translated automatically.)
							const subtitles_info = common.create_dom_element({
								element_type 	: "div",
								id 				: "subtitles_info",
								class_name 		: "",
								text_content 	: tstring["subtitles_info"] || "(Transcription and subtitles translated automatically.)",
								parent 			: video_wrapper
							})
							// hide subtitles info on play
							video.addEventListener("play", function(){
								subtitles_info.remove();
							})


					// video_wrapper loading. At end, remove loading class from wrapper
					video_wrapper.classList.remove("loading")

					// activate abstract
						// const button_abstract = footer_info.querySelector(".button_abstract")
						// if (button_abstract) {
						// 	button_abstract.click()
						// }
				}

				return response
		})

		return js_promise
	},//end load_video



	/**
	* TOGGLE_ELEMENT
	*/
	toggle_element : function( button_obj, target_element, ar_to_hide ) {

		const ar_to_hide_length = ar_to_hide.length
		for (let i = ar_to_hide_length - 1; i >= 0; i--) {
			const current_element = ar_to_hide[i]
			if (current_element===target_element) {
				current_element.classList.toggle("hide")
			}else{
				current_element.classList.add("hide")
			}
		}

		return true
	},//end toggle_element



	/**
	* TOGGLE_SUMMARY
	*/
	toggle_summary : function(button_obj, hide_others) {

		const summary = button_obj.parentNode.querySelector(".summary")

		const js_promise = new Promise(function(resolve, reject) {

		  	if (hide_others===true) {
				var all_summaries = document.querySelectorAll(".summary.active")
				if (all_summaries) {
					for (var i = all_summaries.length - 1; i >= 0; i--) {
						if (summary!==all_summaries[i]) {
							all_summaries[i].style.display = "none"
							all_summaries[i].classList.remove("active")
						}
					}
				}

				resolve(true)
			}else{
				resolve(true)
			}
		})


		js_promise.then(function(){

			if (summary.style.display==="block") {
				// Hide
				summary.style.display = "none"
				summary.classList.remove("active")
				//button_obj.innerHTML = tstring.transcripcion || "Transcription"
			}else{
				// Show
				summary.style.display = "block"
				summary.classList.add("active")
				//button_obj.innerHTML = tstring.video || "Video"
			}

			return true
		})

		return js_promise
	},//end toggle_summary



	/**
	* DATE_TO_YEAR
	*/
	date_to_year : function(date) {

		var regex = /^[0-9]{4}/;
		var year  = regex.exec(date)

		return year
	},//end date_to_year



	fix_body_height : function() {

		let window_height  = window.innerHeight;
			//console.log(window_height);
		let content_height = document.getElementById("content").offsetHeight
			//console.log(content_height);
		let footer_height = document.getElementById("footer").offsetHeight
			//console.log(footer_height);

		if (window_height > (content_height + footer_height)) {
			//document.getElementById("content").style.height = (window_height - footer_height) + "px"
		}
	},//end fix_body_height



	replace_url : function(url, add_host) {

		return common.local_to_remote_path(url)
	},//end replace_url



	/**
	* TOOL TIPS
	*/
	activate_tooltips : function() {

		// clean tipsy_container
			const tipsy_containers = document.querySelectorAll(".tipsy")
			const tipsy_containers_length = tipsy_containers.length
			if (tipsy_containers_length>0) {
				for (let i = tipsy_containers_length - 1; i >= 0; i--) {
					const tipsy_container = tipsy_containers[i]
					tipsy_container.remove()
				}
			}

		$('.tooltip').tipsy({gravity: 'sw', html: true});
	},//end activate_tooltips



}//end free_search

tpl_common.setup();