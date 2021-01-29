/*global tstring, page_globals, SHOW_DEBUG, common, page*/
/*eslint no-undef: "error"*/

"use strict";



var coins =  {



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
			const form = self.render_form()
			form_container.appendChild(form)

		

		return true
	},//end set_up



	/**
	* RENDER_FORM
	*/
	render_form : function() {

		const self = this

		const fragment = new DocumentFragment()

		// form_factory instance
			self.form = self.form || new form_factory()
		
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
				// q_table 	: "mints",
				class_name	: 'global_search',
				parent		: form_row,
				callback	: function(node_input) {

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
		
		// mint
			self.form.item_factory({
				id			: "mint",
				name		: "mint",
				label		: tstring.mint || "mint",
				q_column	: "p_mint",
				eq			: "LIKE",
				eq_in		: "%",
				// q_table	: "mints",
				is_term		: true,
				parent		: form_row,
				callback	: function(node_input) {
					self.activate_autocomplete(node_input) // node_input is the form_item.node_input
				}
			})
		
		// period
			self.form.item_factory({
				id			: "period",
				name		: "period",
				label		: tstring.period || "period",
				q_column	: "p_period",
				eq_in		: "%",
				// q_table	: "ts_period",
				is_term		: true,
				parent		: form_row,
				callback	: function(node_input) {
					self.activate_autocomplete(node_input) // node_input is the form_item.node_input
				}
			})

		// culture
			self.form.item_factory({
				id			: "culture",
				name		: "culture",
				label		: tstring.culture || "culture",
				q_column	: "p_culture",
				eq_in		: "%",
				// q_table	: "ts_period",
				is_term		: true,
				parent		: form_row,
				callback	: function(node_input) {
					self.activate_autocomplete(node_input) // node_input is the form_item.node_input
				}
			})

		// creator
			self.form.item_factory({
				id			: "creator",
				name		: "creator",
				label		: tstring.creator || "creator",
				q_column	: "p_creator",
				eq_in		: "%",
				// q_table	: "ts_period",
				is_term		: true,
				parent		: form_row,
				callback	: function(node_input) {
					self.activate_autocomplete(node_input) // node_input is the form_item.node_input
				}
			})

		// design_obverse
			self.form.item_factory({
				id			: "design_obverse",
				name		: "design_obverse",
				label		: tstring.design_obverse || "design obverse",
				q_column	: "ref_type_design_obverse",
				eq_in		: "%",
				// q_table	: "ts_period",
				is_term		: false,
				parent		: form_row,
				callback	: function(node_input) {
					self.activate_autocomplete(node_input) // node_input is the form_item.node_input
				}
			})

		// design_reverse
			self.form.item_factory({
				id			: "design_reverse",
				name		: "design_reverse",
				label		: tstring.design_reverse || "design reverse",
				q_column	: "ref_type_design_reverse",
				eq_in		: "%",
				// q_table	: "ts_period",
				is_term		: false,
				parent		: form_row,
				callback	: function(node_input) {
					self.activate_autocomplete(node_input) // node_input is the form_item.node_input
				}
			})

		// symbol_obverse
			self.form.item_factory({
				id			: "symbol_obverse",
				name		: "symbol_obverse",
				label		: tstring.symbol_obverse || "symbol obverse",
				q_column	: "ref_type_symbol_obverse",
				eq_in		: "%",
				// q_table	: "ts_period",
				is_term		: false,
				parent		: form_row,
				callback	: function(node_input) {
					self.activate_autocomplete(node_input) // node_input is the form_item.node_input
				}
			})

		// symbol_reverse
			self.form.item_factory({
				id			: "symbol_reverse",
				name		: "symbol_reverse",
				label		: tstring.symbol_reverse || "symbol reverse",
				q_column	: "ref_type_symbol_reverse",
				eq_in		: "%",
				// q_table	: "ts_period",
				is_term		: false,
				parent		: form_row,
				callback	: function(node_input) {
					self.activate_autocomplete(node_input) // node_input is the form_item.node_input
				}
			})

		// legend_obverse
			self.form.item_factory({
				id 			: "legend_obverse",
				name 		: "legend_obverse",
				label		: tstring.legend_obverse || "legend obverse",
				q_column 	: "ref_type_legend_obverse",
				eq_in 		: "%",
				// q_table 	: "ts_period",
				is_term 	: false,
				parent		: form_row,
				callback	: function(node_input) {
					self.activate_autocomplete(node_input) // node_input is the form_item.node_input
				}
			})

		// legend_reverse
			self.form.item_factory({
				id 			: "legend_reverse",
				name 		: "legend_reverse",
				label		: tstring.legend_reverse || "legend reverse",
				q_column 	: "ref_type_legend_reverse",
				eq_in 		: "%",
				// q_table 	: "ts_period",
				is_term 	: false,
				parent		: form_row,
				callback	: function(node_input) {
					self.activate_autocomplete(node_input) // node_input is the form_item.node_input
				}
			})

		// territory
			self.form.item_factory({
				id 			: "territory",
				name 		: "territory",
				label		: tstring.territory || "territory",
				q_column 	: "p_territory",
				eq_in 		: "%",
				// q_table 	: "ts_period",
				is_term 	: true,
				parent		: form_row,
				callback	: function(node_input) {
					self.activate_autocomplete(node_input) // node_input is the form_item.node_input
				}
			})

		// group
			self.form.item_factory({
				id 			: "group",
				name 		: "group",
				label		: tstring.group || "group",
				q_column 	: "p_group",
				eq_in 		: "%",
				// q_table 	: "ts_period",
				is_term 	: true,
				parent		: form_row,
				callback	: function(node_input) {
					self.activate_autocomplete(node_input) // node_input is the form_item.node_input
				}
			})

		// material
			self.form.item_factory({
				id 			: "material",
				name 		: "material",
				q_column 	: "ref_type_material",
				q_table 	: "any",
				label		: tstring.material || "material",
				is_term 	: false,
				parent		: form_row,
				callback	: function(node_input) {
					self.activate_autocomplete(node_input) // node_input is the form_item.node_input
				}
			})

		// collection
			self.form.item_factory({
				id 			: "collection",
				name 		: "collection",
				q_column 	: "ref_coins_collection",
				q_table 	: "any",
				label		: tstring.collection || "collection",
				is_term 	: false,
				parent		: form_row,
				callback	: function(node_input) {
					self.activate_autocomplete(node_input) // node_input is the form_item.node_input
				}
			})

		// denomination
			self.form.item_factory({
				id 			: "denomination",
				name 		: "denomination",
				q_column 	: "ref_type_denomination",
				q_table 	: "any",
				label		: tstring.denomination || "denomination",
				is_term 	: false,
				parent		: form_row,
				callback	: function(node_input) {
					self.activate_autocomplete(node_input) // node_input is the form_item.node_input
				}
			})
		
		// number
			self.form.item_factory({
				id 			: "number",
				name 		: "number",
				q_column 	: "term",
				q_table 	: "types",
				label		: tstring.number || "number",
				is_term 	: false,
				parent		: form_row,
				callback	: function(node_input) {
					self.activate_autocomplete(node_input) // node_input is the form_item.node_input
				}
			})

		// company
			self.form.item_factory({
				id 			: "company",
				name 		: "company",
				q_column 	: "ref_coins_auction_company",
				q_table 	: "types",
				label		: tstring.company || "company",
				is_term 	: false,
				parent		: form_row,
				callback	: function(node_input) {
					self.activate_autocomplete(node_input) // node_input is the form_item.node_input
				}
			})

		// technique
			self.form.item_factory({
				id 			: "technique",
				name 		: "technique",
				q_column 	: "ref_type_technique",
				q_table 	: "types",
				label		: tstring.technique || "technique",
				is_term 	: false,
				parent		: form_row,
				callback	: function(node_input) {
					self.activate_autocomplete(node_input) // node_input is the form_item.node_input
				}
			})

		// equivalents
			self.form.item_factory({
				id			: "equivalents",
				name		: "equivalents",
				q_column	: "ref_type_equivalents",
				q_table		: "types",
				eq_in		: "%",
				eq_out		: "%",
				label		: tstring.equivalents || "equivalents",
				is_term		: false,
				parent		: form_row,
				callback	: function(node_input) {
					self.activate_autocomplete(node_input) // node_input is the form_item.node_input
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
				self.form_submit(form)
			})

		// operators
			// fragment.appendChild( forms.build_operators_node() )
			const operators_node = self.form.build_operators_node()
			fragment.appendChild( operators_node )
		
		// form
			const form = common.create_dom_element({
				element_type	: "form",
				id 				: "search_form",
				class_name 		: "form-inline"
			})			
			form.appendChild(fragment)



		return form
	},//end render_form










	
}//end coins
