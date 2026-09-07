/*global tstring, page_globals, SHOW_DEBUG, coin_row, event_manager, data_manager, Promise, page, common */
/*eslint no-undef: "error"*/

"use strict";



var coin = {


	section_id				: null,
	export_data_container	: null,
	row_detail				: null,


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
			self.row_detail				= options.row_detail

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
								const row = data[0] || null;

							// Check record exists
							if (!row) {
								const title = document.getElementById('title')
								if(title) title.textContent = 'Error'
								self.row_detail.textContent = 'This record does not exist: ' + self.section_id
								console.error('This record does not exist:', self.section_id);
								return
							}

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

									// related documentation record (the archive index card this coin
									// was catalogued from, if any) - non-blocking, doesn't hold up the
									// coin's own content above
										self.get_related_documentation(row).then(function(documentation_rows){
											self.render_related_documentation(target, documentation_rows)
										})
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
	},//end render_row



	/**
	* GET_RELATED_DOCUMENTATION
	* Coins carry a forward reference to the archive index card(s) they were
	* catalogued from in coins.related_heritage_data (a raw JSON array of
	* documentation term_ids) - resolve_portals_custom doesn't resolve this
	* relation (confirmed empty when tried), same as the reverse lookup on the
	* documentation side (see archive.js draw_related_coins), so this fetches
	* those documentation rows directly by term_id instead
	* @param object row . the coin row (related_heritage_data already present, ar_fields:['*'])
	* @return promise : array of documentation rows
	*/
	get_related_documentation : function(row) {

		let term_ids = []
		try { term_ids = JSON.parse(row.related_heritage_data || '[]') } catch(e) { /* malformed, no related documentation */ }

		if (!term_ids.length) {
			return Promise.resolve([])
		}

		const sql_filter = 'term_id IN (' + term_ids.map(function(term_id){ return "'" + term_id + "'" }).join(',') + ')'

		return data_manager.request({
			body : {
				dedalo_get	: 'records',
				db_name		: page_globals.WEB_DB,
				lang		: page_globals.WEB_CURRENT_LANG_CODE,
				table		: 'documentation',
				ar_fields	: ['term_id', 'title', 'name', 'identifying_images', 'collection', 'fund', 'typology', 'material', 'dating_start', 'dating_end', 'dating', 'description'],
				sql_filter	: sql_filter,
				limit		: term_ids.length
			}
		})
		.then(function(api_response){
			return api_response.result || []
		})
	},//end get_related_documentation



	/**
	* RENDER_RELATED_DOCUMENTATION
	* Archive index card(s) this coin was catalogued from - the reverse of what
	* the documentation page's own "Coins" section already shows. Same visual
	* idiom the type page already uses for this identical relation (a big_label
	* section header, then a square thumbnail beside a title + field list - see
	* type_row_fields.js's ref_documentation block), so a linked archive record
	* looks the same regardless of which detail page shows it. tstring.archive
	* is the same real, already-translated key that block uses (not a made-up
	* one), so this follows the page's language switch same as everything else.
	* Nothing rendered (no header, no empty box) when there isn't one
	* @param object container
	* @param array documentation_rows
	*/
	render_related_documentation : function(container, documentation_rows) {

		const self = this

		if (!documentation_rows || !documentation_rows.length) {
			return
		}

		common.create_dom_element({
			element_type	: "div",
			class_name		: "info_line separator",
			inner_html		: '<div class="big_label">' + (tstring.archive || 'Archive') + '</div>',
			parent			: container
		})

		documentation_rows.forEach(function(doc_row){

			const id			= doc_row.term_id.split('_').pop()
			const detail_url	= page_globals.__WEB_ROOT_WEB__ + '/documentation/' + id
			const doc_title		= doc_row.title || doc_row.name || ('ID ' + id)

			// one card, one link - the whole thing is clickable, rather than
			// separate image/title links (which also meant fighting the site's
			// default dotted-underline <a> styling on the title text)
				const card = common.create_dom_element({
					element_type	: "a",
					class_name		: "info_line inline ref_documentation",
					href			: detail_url,
					target			: "_blank",
					parent			: container
				})
				card.setAttribute('rel', 'noopener')

			if (doc_row.identifying_images && doc_row.identifying_images.length>0) {

				const first_image	= doc_row.identifying_images.split(' | ')[0]
				const full_url		= page_globals.__WEB_MEDIA_BASE_URL__ + first_image
				const thumb_url		= full_url.replace('/1.5MB/', '/thumb/')

				const image_wrapper = common.create_dom_element({
					element_type	: "div",
					class_name		: "ref_documentation_image_wrapper",
					parent			: card
				})

				const img = common.create_dom_element({
					element_type	: "img",
					class_name		: "image",
					src				: thumb_url,
					title			: doc_title,
					loading			: "lazy",
					parent			: image_wrapper
				})
				img.alt = doc_title
			}

			const ref_documentation_info = common.create_dom_element({
				element_type	: "div",
				class_name		: "ref_documentation_info",
				parent			: card
			})

			common.create_dom_element({
				element_type	: "div",
				class_name		: "info_value ref_documentation_title",
				text_content	: doc_title,
				parent			: ref_documentation_info
			})

			const dating = [doc_row.dating_start, doc_row.dating_end].filter(Boolean).join(' - ') || doc_row.dating

			self.ref_documentation_field(ref_documentation_info, tstring.collection || 'Collection', doc_row.collection)
			self.ref_documentation_field(ref_documentation_info, tstring.fund || 'Fund', doc_row.fund)
			self.ref_documentation_field(ref_documentation_info, tstring.typology || 'Typology', doc_row.typology)
			self.ref_documentation_field(ref_documentation_info, tstring.material || 'Material', doc_row.material)
			self.ref_documentation_field(ref_documentation_info, tstring.dating || 'Dating', dating)
			self.ref_documentation_field(ref_documentation_info, tstring.description || 'Description', doc_row.description)
		})
	},//end render_related_documentation



	/**
	* REF_DOCUMENTATION_FIELD
	* One "label: value" line for the linked documentation record - same
	* empty-skip and "|" stripping convention as archive.js's own add_field
	* and type_row_fields.js's identically-named/purposed helper
	* @param object container
	* @param string label
	* @param string value
	*/
	ref_documentation_field : function(container, label, value) {

		if (typeof value==='string') {
			value = value.replace(/^(\s*\|\s*)+/, '').replace(/(\s*\|\s*)+$/, '').trim()
		}

		if (!value || (typeof value==='string' && value.trim().length===0)) {
			return
		}

		common.create_dom_element({
			element_type	: "div",
			class_name		: "info_value ref_documentation_field",
			inner_html		: label + ': ' + value,
			parent			: container
		})
	}//end ref_documentation_field



}//end coin
