/*global tstring, page_globals, SHOW_DEBUG, row_fields, common, page*/
/*eslint no-undef: "error"*/

"use strict";



function form_factory() {

	// vars
	// form_items. Array of form objects including properties and nodes
	this.form_items	= []
	// form element DOM node
	this.node		= null



	/**
	* ITEM_FACTORY
	*/
	this.item_factory = function(options) {

		const self = this

		// form_item. create new instance of form_item
			const form_item = self.build_form_item(options)

		// node
			self.build_form_node(form_item, options.parent)
		
		// callback
			if (typeof options.callback==="function") {
				options.callback(form_item.node_input)
			}
		
		// store current instance
			self.form_items[options.id] = form_item


		return form_item
	}//end item_factory



	/**
	* BUILD_FORM_ITEM
	* Every form input has a js object representation
	*/
	this.build_form_item = function(options) {

		const form_item = {
			id				: options.name,	// Like 'mint'
			name			: options.name, // Like 'mint'
			label			: options.label, // Used to placeholder too
			class_name 		: options.class_name || null,
			// search elements
			q				: options.q || "", // user keyboard enters values
			q_selected		: [], // user picked values from autocomplete options
			q_selected_eq	: options.q_selected_eq || "=", // default internal comparator used in autocomplete	with user picked values
			q_column		: options.q_column, // like 'term'
			q_splittable	: options.q_splittable || false, // depending on its value the item content will be splitted or not on loading it
			// special double filters
			// q_table 		: options.q_table, // like 'mints'
			// q_table_name : 'term_table', // like 'term_table'
			// autocomplete options		
			eq				: "LIKE", // default internal comparator used in autocomplete		
			eq_in			: options.eq_in || '', // used in autocomplete to define if term begins with .. o in the middle of..
			eq_out			: options.eq_out || '%', // used in autocomplete to define if term ends with .. o in the middle of..
			// cathegory. thesurus terms and not terms
			is_term			: options.is_term || false, // terms use special json format as '["name"]' instead 'name'
			callback		: options.callback || false, // callback function
			// nodes (are set on build_form_node)
			node_input		: null,
			node_values		: null
		}

		// add node
			// forms.build_form_node(form_item, options.parent)


		return form_item
	}//end build_form_item



	/**
	* BUILD_FORM_NODE
	*/
	this.build_form_node = function(form_item, parent) {

		// grouper
			const group = common.create_dom_element({
				element_type	: 'div',
				class_name 		: "form-group field",
				parent 			: parent
			})

		// input
			const node_input = common.create_dom_element({
				element_type	: 'input',
				type			: 'text',
				id				: form_item.id,
				class_name		: "form-control ui-autocomplete-input" + (form_item.class_name ? (' '+form_item.class_name) : ''),
				placeholder		: form_item.label,
				value			: form_item.q || '',
				parent			: group
			})
			node_input.addEventListener("keyup", function(e){
				form_item.q = e.target.value
			})
			form_item.node_input = node_input

		// values container (user selections)
			const node_values = common.create_dom_element({
				element_type	: 'div',
				// id				: form_item.name + '_values',
				class_name 		: "container_values",
				parent 			: group
			})
			form_item.node_values = node_values


		return true
	}//end build_form_node	



	/**
	* BUILD_OPERATORS_NODE
	*/
	this.build_operators_node = function() {

		const group = common.create_dom_element({
			element_type	: "div",
			class_name 		: "form-group field field_operators"
		})
		
		const operator_label = common.create_dom_element({
			element_type	: "span",
			class_name 		: "radio operators",
			text_content 	: tstring["operator"] || "Operator",
			parent 			: group
		})
		// radio 1
		const radio1 = common.create_dom_element({
			element_type	: "input",
			type 			: "radio",
			id 				: "operator_or",
			parent 			: group
		})
		radio1.setAttribute("name","operators")
		radio1.setAttribute("value","OR")
		const radio1_label = common.create_dom_element({
			element_type	: "label",
			text_content 	: tstring["or"] || "or",
			parent 			: group
		})
		radio1_label.setAttribute("for","operator_or")
		// radio 2
		const radio2 = common.create_dom_element({
			element_type	: "input",
			type 			: "radio",
			id 				: "operator_and",
			name 			: "operators",
			parent 			: group
		})
		radio2.setAttribute("name","operators")
		radio2.setAttribute("value","AND")
		radio2.setAttribute("checked","checked")
		const radio2_label = common.create_dom_element({
			element_type	: "label",
			text_content 	: tstring["and"] || "and",
			parent 			: group
		})
		radio2_label.setAttribute("for","operator_and")


		return group
	}//end build_operators_node



	/**
	* ADD_SELECTED_VALUE
	*/
	this.add_selected_value = function(form_item, label, value) {
		
		const container = form_item.node_values

		// Check if already exists
			const inputs		= container.querySelectorAll(".input_values")
			const inputs_length	= inputs.length
			for (let i = inputs_length - 1; i >= 0; i--) {
				if (value===inputs[i].value) return false;
			}

		// Create new line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "line_value",
				parent			: container
			})

		// trash. 
			// awesome font 4 <i class="fal fa-trash-alt"></i>
			// awesome font 5 <i class="far fa-trash-alt"></i>
			const trash = common.create_dom_element({
				element_type	: "i",
				class_name		: "icon remove fal far fa-trash-alt", //  fa-trash awesome font 4
				parent			: line
			})
			trash.addEventListener("click",function(){

				// remove from form_item q_selected
				const index = form_item.q_selected.indexOf(value);
				if (index > -1) {
					// remove array element
					form_item.q_selected.splice(index, 1);
					
					// remove dom node
					this.parentNode.remove()

					// debug
					if(SHOW_DEBUG===true) {
						console.log("form_item.q_selected removed value:",value,form_item.q_selected);
					}
				}			
			})

		// label 
			const value_label = common.create_dom_element({
				element_type	: "span",
				class_name		: "value_label",
				text_content	: label,
				parent			: line
			})

		// input 
			const input = common.create_dom_element({
				element_type	: "input",
				class_name		: "input_values",
				parent			: line
			})
			input.value = value

		// add to form_item
			form_item.q_selected.push(value)

		// clean values
			form_item.node_input.value	= ""
			form_item.q					= ""


		return true
	}//end add_selected_value



	/**
	* BUILD_FILTER
	* Creates a complete sqo filter using form items values
	*/
	this.build_filter = function() {
		
		const self = this

		const form_items = self.form_items
	
		const ar_query_elements = []
		for (let [id, form_item] of Object.entries(form_items)) {
			
			const current_group = []

			const group_op = (form_item.is_term===true) ? "OR" : "AND"
			const group = {}
				  group[group_op] = []

			// q value
				if (form_item.q.length>0) {				

					const c_group_op = 'AND'
					const c_group = {}
						  c_group[c_group_op] = []

					// q element
						const element = {
							field	: form_item.q_column,
							value	: `'%${form_item.q}%'`,
							op		: form_item.eq // default is 'LIKE'
						}

						c_group[c_group_op].push(element)

					// q_table element
						// if (form_item.q_table && form_item.q_table!=="any") {

						// 	const element_table = {
						// 		field	: form_item.q_table_name,
						// 		value	: `'${form_item.q_table}'`,
						// 		op		: '='
						// 	}

						// 	c_group[c_group_op].push(element_table)
						// }

					// add basic group
						group[group_op].push(c_group)											
				}

			// q_selected values
				if (form_item.q_selected.length>0) {

					for (let j = 0; j < form_item.q_selected.length; j++) {
						
						const value = form_item.q_selected[j]

						const c_group_op = "AND"
						const c_group = {}
							  c_group[c_group_op] = []

						// elemet
						const element = {
							field	: form_item.q_column,
							value	: (form_item.q_selected_eq === "LIKE") ? `'%${value}%'` : `'${value}'`,
							op		: form_item.q_selected_eq
						}
						c_group[c_group_op].push(element)

						// q_table element
							// if (form_item.q_table && form_item.q_table!=="any") {

							// 	const element_table = {
							// 		field	: form_item.q_table_name,
							// 		value	: `'${form_item.q_table}'`,
							// 		op		: '='
							// 	}

							// 	c_group[c_group_op].push(element_table)
							// }
							
						group[group_op].push(c_group)
					}
				}

			if (group[group_op].length>0) {
				ar_query_elements.push(group)
			}			
		}

		// debug
			if(SHOW_DEBUG===true) {
				
			}

		// empty form case
			if (ar_query_elements.length<1) {
				// self.form.form_items.mint.node_input.focus()
				return false;
			}

		// operators value (optional)
			const operators_checked_node = self.node.querySelector('input[name="operators"]:checked')
			const operators_value = operators_checked_node ? operators_checked_node.value  : 'AND';
				// console.log("operators_value:",operators_value);
			
			const filter = {}
				  filter[operators_value] = ar_query_elements
		

		return filter
	}//end build_filter



}//end form_factory





// var forms = {


// 	/**
// 	* BUILD_FORM_ITEM
// 	* Every form input has a js object representation
// 	*/
// 	build_form_item : function(options) {

// 		const form_item = {
// 			id 				: options.name,	// Like 'mint'
// 			name 			: options.name, // Like 'mint'
// 			label 			: options.label, // Used to placeholder too
// 			// search elements
// 			q 				: "", // user keyboard enters values
// 			q_selected 		: [], // user picked values from autocomplete options
// 			q_column 		: options.q_column, // like 'term'
// 			// special double filters
// 			// q_table 		: options.q_table, // like 'mints'
// 			// q_table_name : 'term_table', // like 'term_table'
// 			// autocomplete options		
// 			eq 				: "LIKE", // default internal comparator used in autocomplete
// 			eq_in 			: options.eq_in || '', // used in autocomplete to define if term begins with .. o in the middle of..
// 			eq_out 			: options.eq_out || '%', // used in autocomplete to define if term ends with .. o in the middle of..
// 			// cathegory. thesurus terms and not terms
// 			is_term 		: options.is_term || false, // terms use special json format as '["name"]' instead 'name'
// 			// nodes (are set on build_form_node)
// 			node_input		: null,
// 			node_values		: null
// 		}

// 		// add node
// 			forms.build_form_node(form_item, options.parent)


// 		return form_item
// 	},//end build_form_item



// 	/**
// 	* BUILD_FORM_NODE
// 	*/
// 	build_form_node : function(form_item, parent) {

// 		// grouper
// 			const group = common.create_dom_element({
// 				element_type	: 'div',
// 				class_name 		: "form-group field",
// 				parent 			: parent
// 			})

// 		// input
// 			const node_input = common.create_dom_element({
// 				element_type	: 'input',
// 				type			: 'text',
// 				id 				: form_item.id,
// 				class_name		: "form-control ui-autocomplete-input",
// 				placeholder 	: form_item.label,				
// 				parent			: group
// 			})
// 			node_input.addEventListener("keyup", function(e){				
// 				form_item.q = e.target.value
// 			})
// 			form_item.node_input = node_input

// 		// values container (user selections)
// 			const node_values = common.create_dom_element({
// 				element_type	: 'div',
// 				// id				: form_item.name + '_values',
// 				class_name 		: "container_values",
// 				parent 			: group
// 			})
// 			form_item.node_values = node_values


// 		return true
// 	},//end build_form_node



// 	/**
// 	* BUILD_OPERATORS_NODE
// 	*/
// 	build_operators_node : function() {

// 		const group = common.create_dom_element({
// 			element_type	: "div",
// 			class_name 		: "form-group field"			
// 		})
// 		const operator_label = common.create_dom_element({
// 			element_type	: "span",
// 			class_name 		: "operators",
// 			text_content 	: tstring["operator"] || "Operator",
// 			parent 			: group
// 		})
// 		const radio1 = common.create_dom_element({
// 			element_type	: "input",
// 			type 			: "radio",
// 			id 				: "operator_or",
// 			parent 			: group
// 		})
// 		radio1.setAttribute("name","operators")
// 		radio1.setAttribute("value","OR")
// 		const radio1_label = common.create_dom_element({
// 			element_type	: "label",
// 			text_content 	: tstring["or"] || "or",
// 			parent 			: group
// 		})
// 		const radio2 = common.create_dom_element({
// 			element_type	: "input",
// 			type 			: "radio",
// 			id 				: "operator_and",
// 			name 			: "operators",
// 			parent 			: group
// 		})
// 		radio2.setAttribute("name","operators")
// 		radio2.setAttribute("value","AND")
// 		radio2.setAttribute("checked","checked")
// 		const radio2_label = common.create_dom_element({
// 			element_type	: "label",
// 			text_content 	: tstring["and"] || "and",
// 			parent 			: group
// 		})

// 		return group
// 	}//end build_operators_node
// }//end forms
