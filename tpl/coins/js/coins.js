/*global tstring, page_globals, SHOW_DEBUG, common, page, coins*/
/*eslint no-undef: "error"*/

"use strict";



var coins =  {



	/**
	* VARS
	*/
		form		: null,
		pagination	: null,
		list		: null,



	/**
	* SET_UP
	* When the HTML page is loaded
	* @param object options
	*/
	set_up : function(options) {

		const self = this

		// options
			const form_container	= options.form_container
			const row_detail		= options.row_detail


		// form
			self.form		= new form_factory()
			const form_node	= self.render_form()
			form_container.appendChild(form_node)

		// pagination
			self.pagination = {
				total	: null,
				limit	: 10,
				offset	: 0
			}


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
		
		// section_id
			self.form.item_factory({
				id			: "section_id",
				name		: "section_id",
				label		: tstring.is || "ID",
				table		: 'coins',
				q_column	: "section_id",
				eq			: "=",
				eq_in		: "",
				eq_out		: "",
				parent		: form_row
			})

		// collection
			self.form.item_factory({
				id			: "collection",
				name		: "collection",
				label		: tstring.collection || "collection",
				table		: 'coins',
				q_column	: "collection",
				eq			: "LIKE",
				eq_in		: "%",
				eq_out		: "%",
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'coins'
					})
				}
			})

		// public_info
			self.form.item_factory({
				id			: "public_info",
				name		: "public_info",
				label		: tstring.public_info || "public_info",
				table		: 'coins',
				q_column	: "public_info",
				eq			: "LIKE",
				eq_in		: "%",
				eq_out		: "%",
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'coins'
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
				self.form_submit(form_node)
			})

		// operators
			// fragment.appendChild( forms.build_operators_node() )
			const operators_node = self.form.build_operators_node()
			fragment.appendChild( operators_node )
		
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
	* FORM_SUBMIT
	*/
	form_submit : function(form_node) {

		const self = this

		const div_result			= document.querySelector(".result")
		const container_rows_list	= div_result.querySelector("#rows_list")

		// loading start
			page.add_spinner(div_result)
			div_result.classList.add("loading")

		return new Promise(function(resolve){

			self.form.form_submit({
				form_node			: form_node,
				table				: 'coins',
				ar_fields			: ['*'],
				limit				: 10,
				count				: true,
				offset				: 0,
				order				: "section_id ASC",
				data_parser			: page.parse_coin_data
			})
			.then(function(data){
				// console.log("----------------------------- data:",data);

				// loading end
					(function(){
						page.remove_spinner(div_result)
						while (div_result.hasChildNodes()) {
							div_result.removeChild(div_result.lastChild);
						}
						div_result.classList.remove("loading")
					})()					
				
				// render
					self.list = self.list || new list_factory() // creates / get existing instance of list
					self.list.init({
						data			: data,
						fn_row_builder	: self.list_row_builder,
						pagination		: self.pagination,
						caller			: self
					})
					self.list.render_list()
					.then(function(list_node){
						if (list_node) {
							div_result.appendChild(list_node)
						}
						resolve(list_node)
					})
			})
		})
	},//end form_submit



	list_row_builder : function(data, caller){
			console.log("///////////// data:",data);

		const fragment = new DocumentFragment()

		// wrapper
			const wrapper = common.create_dom_element({
				element_type	: "div",
				class_name		: "wrapper",
				parent			: fragment
			})

		// image_obverse
			const image_obverse = common.create_dom_element({
				element_type	: "img",
				class_name		: "image",
				src				: data.image_obverse,
				parent			: wrapper
			})
			const image_reverse = common.create_dom_element({
				element_type	: "img",
				class_name		: "image",
				src				: data.image_reverse,
				parent			: wrapper
			})


		return fragment
	}//end list_row_builder



	
}//end coins
