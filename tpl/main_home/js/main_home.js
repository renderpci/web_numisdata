/*global tstring, page_globals, Promise, common, form_factory, data_manager, psqo_factory */
/*eslint no-undef: "error"*/

"use strict";



var main_home =  {



	/**
	* VARS
	*/
		form			: null,
		// DOM items ready from page html
		image_wrapper	: null,
		form_container	: null,
		ar_images		: [],



	/**
	* SET_UP
	* When the HTML page is loaded
	* @param object options
	*/
	set_up : function(options) {

		const self = this

		// options
			self.image_wrapper	= options.image_wrapper
			self.form_container	= options.form_container
			self.ar_images		= options.ar_images || []


		// form
			self.form		= new form_factory()
			self.form_node	= self.render_form()
			self.form_container.appendChild(self.form_node)

		//render main image
			self.main_coin_image()

		return true
	},//end set_up



	/**
	* RENDER_FORM
	*/
	render_form : function() {

		const self = this

		const fragment = new DocumentFragment()

		const form_row = common.create_dom_element({
			element_type	: "div",
			class_name 		: "form-row fields",
			parent 			: fragment
		})

		// global_search
			self.form.item_factory({
				id			: "global_search",
				name		: "global_search",
				label		: tstring.global_search || "global_search",
				q_column	: "global_search",
				eq			: "MATCH",
				eq_in		: "",
				eq_out		: "",
				class_name	: 'global_search',
				parent		: form_row,
				callback	: function(form_item) {

					const mint_form = {
						id				: "mint",
						name			: "mint",
						class_name		: "mint_form",
						label			: tstring.mint || "mint",
						q_column		: "p_mint",
						value_wrapper	: ['["','"]'], // to obtain ["value"] in selected value only
						eq				: "LIKE",
						eq_in			: "%",
						eq_out			: "%",
						is_term			: true,
						node_input		: form_item.node_input,
						node_values		: form_item.node_values,
						q_selected		: form_item.q_selected,
						parent			: form_row
					}

					self.form.activate_autocomplete({
						form_item	: mint_form,
						table		: 'catalog'
					})

					const node_input = form_item.node_input

					const button_info = common.create_dom_element({
						element_type	: "div",
						class_name		: "search_operators_info",
						parent			: node_input.parentNode
					})

					let operators_info
					button_info.addEventListener('click', function(event) {
						event.stopPropagation()
						if (operators_info) {
							operators_info.remove()
							operators_info = null
							return
						}
						operators_info = self.form.full_text_search_operators_info()
						node_input.parentNode.appendChild(operators_info)
					})

					window.addEventListener('click', function(e){
						if (operators_info && !node_input.contains(e.target)){
							// Clicked outside the box
							operators_info.remove()
							operators_info = null
						}
					})
				}
			})

		// submit button
			const submit_group = common.create_dom_element({
				element_type	: "div",
				class_name 		: "form-group field button_submit",
				parent 			: fragment
			})
			const submit_button = common.create_dom_element({
				element_type	: "input",
				type 			: "submit",
				id 				: "submit",
				value 			: tstring.search || "Search",
				class_name 		: "btn btn-light btn-block primary",
				parent 			: submit_group
			})
			submit_button.addEventListener("click",function(e){
				e.preventDefault()
				self.form_submit()
			})

		// form
			const form_node = common.create_dom_element({
				element_type	: "form",
				id 				: "search_form",
				class_name 		: "form-inline"
			})
			form_node.appendChild(fragment)

		// search automatically when user click an autocomplete element
			document.addEventListener("click",function(){
				const container_values = document.querySelector(".container_values")
				if (container_values.querySelector(".line_value")){
					self.form_submit()
				}
			})

		return form_node
	},//end render_form



	/**
	* FORM_SUBMIT
	*/
	form_submit : function() {

		const self = this

		const form_node = self.form_node
		if (!form_node) {
			return new Promise(function(resolve){
				console.error("Error on submit. Invalid form_node.", form_node);
				resolve(false)
			})
		}

		return new Promise(function(resolve){

			const input_global_search = document.getElementById('global_search')
			if (input_global_search) {
				let value

				if (document.querySelector(".line_value")){
					value = document.querySelector(".value_label").innerHTML
				} else{
					value = input_global_search.value
					if (value.leng<2) {
						resolve(false)
					}
				}

				const psqo = {
					"$and" : [{
						id		: 'global_search',
						field	: 'global_search',
						q		: value, // Like '%${form_item.q}%'
						op		: '=' // default is 'LIKE'
					}]
				}
				// console.log("form_factory", psqo_factory);
				const safe_psqo		= psqo_factory.build_safe_psqo(psqo)
				const parse_psqo 	= psqo_factory.encode_psqo(safe_psqo)

				// search using value in url of catalog
				window.location.href = './catalog/?psqo='+ parse_psqo  //'./catalog/' + encodeURIComponent(value);

				resolve(true)
			}else{
				resolve(false)
			}
		})
	},//end form_submit



	/**
	* MAIN COIN IMAGE
	*/
	main_coin_image : function() {

		const self = this

		// DES OLD
			// const request_body = {
			// 	dedalo_get		: 'records',
			// 	db_name			: page_globals.WEB_DB,
			// 	lang			: page_globals.WEB_CURRENT_LANG_CODE,
			// 	table			: 'ts_web',
			// 	ar_fields		: ['*'],
			// 	sql_filter		: 'section_id=2',
			// 	limit			: 1,
			// 	count			: false,
			// 	offset			: 0
			// }
			// // request
			// 	return data_manager.request({
			// 		body : request_body
			// 	})
			// 	.then(function(api_response){
			// 		const img_arr = JSON.parse(api_response.result[0].imagen)
			// 		render_coin_image(img_arr)
			// 	})

		// spinner add
			const spinner = common.create_dom_element({
				element_type	: "div",
				class_name		: "spinner",
				parent			: self.image_wrapper
			})

		// render_coin
			function render_coin_image(img_arr){

				const rnd_number		= Math.floor(Math.random() * ((img_arr.length) - 0)) + 0;
				const coin_filename		= img_arr[rnd_number]
					? img_arr[rnd_number].url // "rsc29_rsc170_"+img_arr[rnd_number]+".jpg"
					: ''
				const coin_url			= coin_filename // Ex. '/dedalo/media/image/1.5MB/0/'+coin_filename
				const sql_filter		= "(ref_coins_image_reverse='"+coin_url+"' OR ref_coins_image_obverse='"+coin_url+"')"
				const request_body = {
					dedalo_get		: 'records',
					db_name			: page_globals.WEB_DB,
					lang			: page_globals.WEB_CURRENT_LANG_CODE,
					table			: 'types',
					ar_fields		: [
						'mint',
						'mint_number',
						'catalogue',
						'number',
						'denomination',
						'section_id'
					],
					sql_filter		: sql_filter,
					limit			: 1,
					count			: false,
					offset			: 0
				}
				// request
				return data_manager.request({
					body : request_body
				})
				.then(function(api_response){

					const item = api_response.result[0]

					// link and labels values
						const mint = (item && item.mint)
							? item.mint+' | '
							: ''

						const mint_number = (item && item.mint_number)
							? item.mint_number+'/'
							: ''

						const denomination = (item && item.denomination)
							? " | "+item.denomination
							: ''

						const catalogue = (item && item.catalogue)
							? item.catalogue
							: ''

						const number =  (item && item.number)
							? item.number
							: ''

						const item_text = mint + catalogue + " " + mint_number + number

						const type_url = (item && item.section_id)
							? page_globals.__WEB_ROOT_WEB__+"/type/" + item.section_id
							: "#"

					// image_wrapper DOM node
						const image_wrapper = self.image_wrapper
						// set href
						image_wrapper.href = type_url

					// coin_img
						const image_url = page_globals.__WEB_MEDIA_BASE_URL__ + coin_url
						const thumb_url = image_url.replace('/1.5MB/','/thumb/')
						const image_big = common.create_dom_element ({
							element_type	: "img",
							class_name		: "main-coin-image",
							src				: thumb_url,
							parent			: image_wrapper
						})
						const img_loader = document.createElement('img')
						img_loader.addEventListener("load", function(){
							image_big.src = image_url
							img_loader.remove()

							// coin text
								common.create_dom_element({
									element_type	: "p",
									class_name		: "img-text",
									text_content	: item_text + denomination,
									parent			: image_wrapper
								})
						})
						img_loader.src = image_url



					spinner.remove()
				})
			}
			render_coin_image(self.ar_images)

		return true
	}//end main_coin_image



}//end main_home
