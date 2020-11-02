/*global tstring, page_globals, SHOW_DEBUG, row_fields, common, page*/
/*eslint no-undef: "error"*/

"use strict";


var forms = {


	/**
	* BUILD_FORM_ITEM
	* Every form input has a js object representation
	*/
	build_form_item : function(options) {

		const form_item = {
			id 				: options.name,	// Like 'mint'
			name 			: options.name, // Like 'mint'
			label 			: options.label, // Used to placeholder too
			// search elements
			q 				: "", // user keyboard enters values
			q_selected 		: [], // user picked values from autocomplete options
			q_column 		: options.q_column, // like 'term'
			// special double filters
			// q_table 		: options.q_table, // like 'mints'
			// q_table_name : 'term_table', // like 'term_table'
			// autocomplete options		
			eq 				: "LIKE", // default internal comparator used in autocomplete
			eq_in 			: options.eq_in || '', // used in autocomplete to define if term begins with .. o in the middle of..
			eq_out 			: options.eq_out || '%', // used in autocomplete to define if term ends with .. o in the middle of..
			// cathegory. thesurus terms and not terms
			is_term 		: options.is_term || false, // terms use special json format as '["name"]' instead 'name'
			// nodes (are set on build_form_node)
			node_input		: null,
			node_values		: null
		}


		return form_item
	},//end build_form_item



	/**
	* BUILD_FORM_NODE
	*/
	build_form_node : function(form_item, parent) {

		// grouper
			const group = common.create_dom_element({
				element_type	: 'div',
				class_name 		: "form-group field field_" + form_item.id,
				parent 			: parent
			})

		// input
			const node_input = common.create_dom_element({
				element_type	: 'input',
				type			: 'text',
				id 				: form_item.id,
				class_name		: "form-control ui-autocomplete-input",
				placeholder 	: form_item.label,
				parent			: group
			})
			// keyup event. User input using keyboard 
			node_input.addEventListener("keyup", function(e){
				form_item.q = e.target.value
			})
			// change event. See event_manager.fire_event to know how trigger this event
			node_input.addEventListener("change", function(e){
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
	},//end build_form_node



	/**
	* BUILD_OPERATORS_NODE
	*/
	build_operators_node : function() {

		const group = common.create_dom_element({
			element_type	: "div",
			class_name 		: "form-group field"			
		})
		const operator_label = common.create_dom_element({
			element_type	: "span",
			class_name 		: "operators",
			text_content 	: tstring["operator"] || "Operator",
			parent 			: group
		})
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

		return group
	}//end build_operators_node



}//end forms