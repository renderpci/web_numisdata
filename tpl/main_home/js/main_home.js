/*global tstring, page_globals, SHOW_DEBUG, common, page, coins*/
/*eslint no-undef: "error"*/

"use strict";



var main_home =  {



	/**
	* VARS
	*/
		form			: null,
		// DOM items ready from page html
		form_container	: null,



	/**
	* SET_UP
	* When the HTML page is loaded
	* @param object options
	*/
	set_up : function(options) {

		const self = this

		// options
			self.form_container	= options.form_container


		// form
			self.form		= new form_factory()
			self.form_node	= self.render_form()
			self.form_container.appendChild(self.form_node)

		//mint search form
			self.mint_search_form		= new form_factory()
			self.mint_form_node	= self.render_mint_form()
			self.form_container.appendChild(self.mint_form_node)

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
			const global_search = self.form.item_factory({
				id 			: "global_search",
				name 		: "global_search",
				label		: tstring.global_search || "global_search",
				q_column 	: "global_search",
				eq 			: "MATCH",
				eq_in 		: "",
				eq_out 		: "",
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
						node_input  	: form_item.node_input,
						node_values		: form_item.node_values,
						q_selected 		: form_item.q_selected,
						parent			: form_row
					}

					console.log(mint_form)
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


		return form_node
	},//end render_form


	/**
	* RENDER MINT SEARCH FORM
	*/
	render_mint_form : function() {

		const self = this

		const fragment = new DocumentFragment()

		const form_row = common.create_dom_element({
			element_type	: "div",
			class_name 		: "form-row fields",
			parent 			: fragment
		})

		//mint search
		self.form.item_factory({
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
			parent			: form_row,
			callback		: function(form_item) {
				console.log(form_item)
				self.form.activate_autocomplete({
					form_item	: form_item,
					table		: 'catalog'
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
				id 				: "mint_submit",
				value 			: tstring.search || "Search",
				class_name 		: "btn btn-light btn-block primary",
				parent 			: submit_group
			})
			submit_button.addEventListener("click",function(e){
				e.preventDefault()
				self.mint_form_submit()
			})

			// form
			const form_node = common.create_dom_element({
				element_type	: "form",
				id 				: "mint_search_form",
				class_name 		: "form-inline"
			})
			form_node.appendChild(fragment)


		return form_node

	},



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

				const value = input_global_search.value
				if (value.leng<2) {
					resolve(false)
				}

				const psqo = {
					"$and":[{
							id 			: 'global_search',
							field		: 'global_search',
							q			: value, // Like '%${form_item.q}%'
							op			: '=', // default is 'LIKE'
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
	* MINT_FORM_SUBMIT
	*/
	mint_form_submit : function() {

		const self = this

		const mint_form_node = self.mint_form_node
		if (!mint_form_node) {
			return new Promise(function(resolve){
				console.error("Error on submit. Invalid form_node.", mint_form_node);
				resolve(false)
			})
		}

		return new Promise(function(resolve){

			const input_mint_search = document.querySelector('.value_label')
			if (input_mint_search) {

				const value = input_mint_search.innerHTML
				console.log("search value:"+value)
				if (value.leng<2) {
					resolve(false)
				}

				const psqo = {
					"$and":[{
							id 			: 'mint',
							field		: 'mint_form',
							q			: value, // Like '%${form_item.q}%'
							op			: '=', // default is 'LIKE'
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



}//end main_home
