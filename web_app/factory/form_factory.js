/* global tstring, SHOW_DEBUG, common, page */
/*eslint no-undef: "error"*/
"use strict";



function form_factory() {

	// vars
	// form_items. Array of form objects including properties and nodes
	this.form_items	= []
	// form element DOM node
	this.node		= null
	// form operators_node
	this.operators_node = null



	/**
	* ITEM_FACTORY
	*/
	this.item_factory = function(options) {

		const self = this

		// form_item. create new instance of form_item
			const form_item = self.build_form_item(options)

		// node
			if(options.parent) {
				self.build_form_node(form_item, options.parent)
			}

		// callback
			if (typeof options.callback==="function") {
				options.callback(form_item)
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

		// console.log("options.eq_in:", typeof options.eq_in, options.name);
		// console.log("options.eq_out:", typeof options.eq_out, options.name);

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
			q_column_filter	: options.q_column_filter, // overwrite q_column as filter column name
			q_column_group	: options.q_column_group, // overwrite q_column as group column name (autocomplete)
			q_splittable	: options.q_splittable || false, // depending on its value the item content will be splitted or not on loading it (see qdp catalog)
			sql_filter		: options.sql_filter || null,
			// special double filters
			// q_table 		: options.q_table, // like 'mints'
			// q_table_name : 'term_table', // like 'term_table'
			// autocomplete options
			eq				: options.eq || "LIKE", // default internal comparator used in autocomplete
			eq_in			: typeof options.eq_in!=='undefined'  ? options.eq_in  : '', // used in autocomplete to define if term begins with .. o in the middle of..
			eq_out			: typeof options.eq_out!=='undefined' ? options.eq_out : '%', // used in autocomplete to define if term ends with .. o in the middle of..
			// category. thesurus terms and not terms
			is_term			: options.is_term || false, // terms use special json format as '["name"]' instead 'name'
			callback		: options.callback || false, // callback function
			list_format		: options.list_format || null, // TO DEPRECATE !!! USE activate_autocomplete parse_result (!)
			wrapper			: options.wrapper || null, // like YEAR to obtain YEAR(name)
			value_wrapper	: options.value_wrapper || null, // like ['["','"]'] to obtain ["value"] in selected value only
			value_split		: options.value_split || null, // like ' - ' to generate one item by beat in autocomplete
			// nodes (are set on build_form_node)
			node_input		: null,
			node_values		: null,
			// input type and fixed values (case 'select')
			input_type		: options.input_type,
			input_values	: options.input_values,
			// operator between values of the field
			group_op		: options.group_op || '$and'
		}

		// add node
			// forms.build_form_node(form_item, options.parent)


		return form_item
	}//end build_form_item



	/**
	* BUILD_FORM_NODE
	*/
	this.build_form_node = function(form_item, parent) {
		// console.log("form_item:",form_item);
		// grouper
			const group = common.create_dom_element({
				element_type	: 'div',
				class_name		: "form-group field " + (form_item.class_name || ''),
				title			: (form_item.is_term) ? (form_item.label + ' (is_term)') : form_item.label,
				parent			: parent
			})

		// input
			switch(form_item.input_type) {

				case 'range_slider':
					const range_slider_labels = common.create_dom_element({
						element_type	: 'div',
						class_name		: "range_slider_labels",
						parent			: group
					})
					const range_slider_value_in = common.create_dom_element({
						element_type	: 'input',
						type			: 'text',
						id				: form_item.id + "_in",
						class_name		: "form-control range_slider_value value_in",
						parent			: range_slider_labels
					})
					const node_label = common.create_dom_element({
						element_type	: 'span',
						class_name		: "form-control range_slider_label node_label",
						inner_html		: form_item.label,
						parent			: range_slider_labels
					})
					const range_slider_value_out = common.create_dom_element({
						element_type	: 'input',
						type			: 'text',
						id				: form_item.id + "_out",
						class_name		: "form-control range_slider_value value_out",
						parent			: range_slider_labels
					})
					const node_slider = common.create_dom_element({
						element_type	: 'div',
						id				: form_item.id,
						class_name		: "form-control " + (form_item.class_name ? (' '+form_item.class_name) : ''),
						// value			: form_item.q || '',
						parent			: group
					})
					// node_select.addEventListener("change", function(e){
					// 		console.log("e.target.value:",e.target.value);
					// 	if (e.target.value) {
					// 		form_item.q = e.target.value
					// 		console.log("form_item:",form_item);
					// 	}
					// })
					form_item.node_input = node_slider
					break;

				case 'select':
					const node_select = common.create_dom_element({
						element_type	: 'select',
						id				: form_item.id,
						class_name		: "form-control ui-autocomplete-select" + (form_item.class_name ? (' '+form_item.class_name) : ''),
						value			: form_item.q || '',
						parent			: group
					})
					for (let i = 0; i < form_item.input_values.length; i++) {
						form_item.input_values[i]
						common.create_dom_element({
							element_type	: 'option',
							value			: form_item.input_values[i].value,
							inner_html		: form_item.input_values[i].label,
							parent			: node_select
						})
					}
					node_select.addEventListener("change", function(e){
							console.log("e.target.value:",e.target.value);
						if (e.target.value) {
							form_item.q = e.target.value
							console.log("form_item:",form_item);
						}
					})
					form_item.node_input = node_select
					break;

				default:
					let label_node
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
						// asign value
						form_item.q = e.target.value
						// show label at top
						if (node_input.value.length>0) {
							label_node = label_node || common.create_dom_element({
								element_type	: 'span',
								class_name		: "form_input_label",
								inner_html		: form_item.label,
								parent			: group
							})
						}else if (label_node) {
							label_node.remove()
							label_node = null
						}
					})
					node_input.addEventListener("blur", function(e){
						if (label_node && node_input.value.length===0) {
							label_node.remove()
							label_node = null
						}
					})
					form_item.node_input = node_input
					break;
			}


		// values container (user selections)
			const node_values = common.create_dom_element({
				element_type	: 'div',
				// id			: form_item.name + '_values',
				class_name		: "container_values",
				parent			: group
			})
			form_item.node_values = node_values


		return true
	}//end build_form_node



	/**
	* BUILD_OPERATORS_NODE
	*/
	this.build_operators_node = function() {

		const self = this

		const group = common.create_dom_element({
			element_type	: "div",
			class_name		: "form-group field field_operators"
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
		radio1.setAttribute("value","$or")
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
		radio2.setAttribute("value","$and")
		radio2.setAttribute("checked","checked")
		const radio2_label = common.create_dom_element({
			element_type	: "label",
			text_content 	: tstring["and"] || "and",
			parent 			: group
		})
		radio2_label.setAttribute("for","operator_and")

		// fix node
			self.operators_node = group

		return group
	}//end build_operators_node




	/**
	* SET_OPERATOR_NODE_VALUE
	* Set a q value to a form item
	*/
	this.set_operator_node_value = function(operator_value) {

		const self = this

		const operator = (operator_value === '$and')
			? 'and'
			: (operator_value === '$or')
				? 'or'
				: null

		if(!operator){
			return false
		}

		const radio_button = self.operators_node.querySelector('#operator_'+operator)
		radio_button.setAttribute("checked","checked")

		return true
	}//end set_operator_node_value




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
				class_name		: "icon remove fal far fa-trash fa-trash-alt", //  fa-trash awesome font 4
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
				inner_html		: label,
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
	* SET_INPUT_VALUE
	* Set a q value to a form item
	*/
	this.set_input_value = function(form_item, value) {

		// add value
			form_item.node_input.value	= value
			form_item.q					= value

		return true
	}//end set_input_value


	/**
	* SET_FORM_ITEM
	* Set a imput node of the form with the value and config searc of the psqo item object
	*/
	this.set_form_item = function(psqo_item) {
		// console.log("set_form_item psqo_item:",psqo_item);

		const self = this

		const q_column = psqo_item.field

		// find form_items match q_column
			const form_item = (()=>{

				return self.form_items[psqo_item.id]

				// for(const key in self.form_items) {

				// 	const value = self.form_items[key]

				// 	if (value.q_column===q_column) {
				// 		return value
				// 	}
				// }

				// return false;
			})();
			if (!form_item) {
				console.error("Error on get form item", psqo_item, self.form_items);
				return false
			}

		// set properties
			form_item.op		= psqo_item.op || form_item.op
			form_item.eq_in		= psqo_item.eq_in || form_item.eq_in
			form_item.eq_out	= psqo_item.eq_out || form_item.eq_out

		// const clean_value = psqo_item.value.replace(^'\[")|(^'\%?)|(\%?'$)|("\]'$)
		// const clean_value = decodeURIComponent(psqo_item.q)
		const clean_value = psqo_item.q


		// add value
			if (psqo_item.q_type==='q_selected') {

				const label = clean_value
				self.add_selected_value(form_item, label, clean_value)

			}else{

				self.set_input_value(form_item, clean_value)
			}


		return form_item
	}//end set_form_item



	/**
	* BUILD_FILTER
	* Creates a complete sqo filter using form items values
	*/
	this.build_filter = function(options={}) {

		const self = this
		// console.log("self.operators_node:",self.operators_node);

		// options
			const form_items = options.form_items || self.form_items

		// global operator
			// const operators_node = self.operators_node
			// const operator_value = (operators_node)
			// 	? operators_node.querySelector('input[name="operators"]:checked').value
			// 	: '$and'

		const ar_query_elements = []
		for (let [id, form_item] of Object.entries(form_items)) {

			// const current_group = []

			const group_op = (form_item.is_term===true)
				? '$or'
				: form_item.group_op
					? form_item.group_op
					: '$and'

			// const group_op = operator_value || '$and'
			const group = {}
				  group[group_op] = []

			// q value or sql_filter
				if ( (form_item.q.length!==0 && form_item.q!=='*') || (form_item.sql_filter) ) {

					if (form_item.input_type==='range_slider' && (!form_item.sql_filter || form_item.sql_filter.length<2)) {
						continue;
					}

					const c_group_op = '$and'
					// const c_group_op = operator_value || '$and'
					const c_group = {}
						  c_group[c_group_op] = []

					// escape html strings containing single quotes inside.
					// Like 'leyend <img data="{'lat':'452.6'}">' to 'leyend <img data="{''lat'':''452.6''}">'
					const safe_value = (typeof form_item.q==='string' || form_item.q instanceof String)
						? form_item.q.replace(/(')/g, "''")
						: form_item.q // negative int numbers case like -375

					// q element
						const element = {
							id		: form_item.id,
							field	: form_item.q_column,
							value	: `'${form_item.eq_in}${safe_value}${form_item.eq_out}'`, // Like '%${form_item.q}%'
							op		: form_item.eq, // default is 'LIKE'
							q_type	: 'q',
							q		: form_item.q
						}

						// optionals
							if (form_item.sql_filter) {
								element.sql_filter = form_item.sql_filter
							}
							if (form_item.wrapper) {
								element.wrapper = form_item.wrapper
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
				if (form_item.q_selected.length!==0) {

					for (let j = 0; j < form_item.q_selected.length; j++) {

						const value = form_item.q_selected[j]
						// escape html strings containing single quotes inside.
						// Like 'leyend <img data="{'lat':'452.6'}">' to 'leyend <img data="{''lat'':''452.6''}">'
						const safe_value = (typeof value==='string' || value instanceof String)
							? value.replace(/(')/g, "''")
							: value

						// item_value
							const item_value = (form_item.value_wrapper && form_item.value_wrapper.length>1) // like [""]
								? form_item.value_wrapper[0] + safe_value + form_item.value_wrapper[1]
								: safe_value

						const c_group_op = '$and'
						// const c_group_op = operator_value || '$and'
						const c_group = {}
							  c_group[c_group_op] = []

						// elemet
						const element = {
							id		: form_item.id,
							field	: form_item.q_column,
							value	: (form_item.q_selected_eq==="LIKE") ? `'%${item_value}%'` : `'${item_value}'`,
							op		: form_item.q_selected_eq,
							q_type	: 'q_selected',
							q		: value
						}

						// optionals
							if (form_item.sql_filter) {
								element.sql_filter = form_item.sql_filter
							}
							if (form_item.wrapper) {
								element.wrapper = form_item.wrapper
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
				// console.log("self.form_items:",self.form_items);
				// console.log("ar_query_elements:",ar_query_elements);
			}

		// empty form case
			if (ar_query_elements.length<1) {
				console.warn("-> form_to_sql_filter empty elements selected:", ar_query_elements)
				return false;
			}

		// input_operators (optional)
			const input_operators = self.operators_node
				? self.operators_node.querySelector('input[name="operators"]')
				: null

		// operators_value
			const operators_value = input_operators
				? self.operators_node.querySelector('input[name="operators"]:checked').value
				: "$and";

		// filter object
			const filter = {}
				  filter[operators_value] = ar_query_elements


		return filter
	}//end build_filter



	/**
	* PARSE_SQL_FILTER
	* Convert filter object to plain sql code ready to send to database
	* @param object filter
	* @return string
	*/
	this.parse_sql_filter = function(filter, group){

		const self = this

		const sql_filter = (filter)
			? (function() {

				const op		= Object.keys(filter)[0]
				const ar_query	= filter[op]

				const ar_filter = []
				const ar_query_length = ar_query.length
				for (let i = 0; i < ar_query_length; i++) {

					const item = ar_query[i]

					const item_op = Object.keys(item)[0]
					if(item_op==="$and" || item_op==="$or") {

						// recursion
						const current_filter_line = "" + self.parse_sql_filter(item, group) + ""
						ar_filter.push(current_filter_line)
						continue;
					}

					// item_field
						const item_field = (item.wrapper && item.wrapper.length>0) // like YEAR(mycolumn_name)
							? item.wrapper + "(" + item.field + ")"
							: item.field

					let filter_line
					// if (item.op==='MATCH') {
					// 	filter_line = "MATCH (" + item.field + ") AGAINST ("+item.value+" IN BOOLEAN MODE)"
					// }else{
					// 	filter_line = (item.field.indexOf("AS")!==-1)
					// 		? "" +item.field+""  +" "+ item.op +" "+ item.value
					// 		: "`"+item.field+"`" +" "+ item.op +" "+ item.value
					// }
					if (item.sql_filter && item.sql_filter.length>0) {
						filter_line = item.sql_filter
					}else if (item.op==='MATCH') {
						filter_line = "MATCH (" + item_field + ") AGAINST ("+item.value+" IN BOOLEAN MODE)"
					}else{
						filter_line = (item_field.indexOf("AS")!==-1 || item_field.indexOf("CONCAT")!==-1 || (item.wrapper && item.wrapper.length>0))
							? "(" +item_field+""  +" "+ item.op +" "+ item.value + (" AND "+item_field+"!='')")
							: "(`"+item_field+"`" +" "+ item.op +" "+ item.value	+ (" AND `"+item_field+"`!='')")
					}

					ar_filter.push(filter_line)

					// group
						if (group && item.group) {
							group.push(item.group)
						}
				}

				const boolean_op = (op === '$and')
					? 'AND'
					: (op === '$or')
						? 'OR'
						: null

				return ar_filter.join(" "+boolean_op+" ")
			  })()
			: null
			// console.log("sql_filter:",sql_filter);

		return sql_filter
	}//end parse_sql_filter



	/**
	* PARSE_PSQO_TO_FORM
	* @return
	*/
	this.parse_psqo_to_form = function(psqo, recursion) {

		const self = this

		const global_key = Object.keys(psqo)[0]
		if(global_key==='$and' || global_key==='$or'){
			// set global oprators value
				if (!recursion) {
					// console.log("//----- SET global_key:",global_key);
					self.set_operator_node_value(global_key)
				}

			// recursion values
				for (let i = 0; i < psqo[global_key].length; i++) {
					self.parse_psqo_to_form(psqo[global_key][i], true)
				}
		}else{
			self.set_form_item(psqo)
		}


		return true
	};//end parse_psqo_to_form



	/**
	* FULL_TEXT_SEARCH_OPERATORS_INFO
	* @return
	*/
	this.full_text_search_operators_info = function() {

		const grid = common.create_dom_element({
			element_type	: "div",
			class_name		: "full_text_search_operators_info"
		})

		const pairs = [
			{
				op		: tstring.operator,
				info	: tstring.description
			},
			{
				op		: "+",
				info	: tstring.include_the_word || "Include, the word must be present."
			},
			{
				op		: "-",
				info	: tstring.exclude_the_word || "Exclude, the word must not be present."
			},
			{
				op		: ">",
				info	: tstring.increase_ranking || "Include, and increase ranking value."
			},
			{
				op		: "<",
				info	: tstring.decrease_ranking || "Include, and decrease the ranking value."
			},
			{
				op		: "()",
				info	: tstring.group_words || "Group words into subexpressions (allowing them to be included, excluded, ranked, and so forth as a group)."
			},
			{
				op		: "~",
				info	: tstring.negate_word || "Negate a word’s ranking value."
			},
			{
				op		: "*",
				info	: tstring.wildcard_at_end || "Wildcard at the end of the word."
			},
			{
				op		: "“”",
				info	: tstring.defines_phrase || "Defines a phrase (as opposed to a list of individual words, the entire phrase is matched for inclusion or exclusion)."
			}
		]

		for (let i = 0; i < pairs.length; i++) {

			common.create_dom_element({
				element_type	: "div",
				class_name		: "op",
				text_content	: pairs[i].op,
				parent			: grid
			})

			common.create_dom_element({
				element_type	: "div",
				class_name		: "info",
				text_content	: pairs[i].info,
				parent			: grid
			})
		}

		return grid
	}//end full_text_search_operators_info



	/**
	* ACTIVATE_AUTOCOMPLETE
	* Generic autocomplete activation with support for HTML (Scott González)
	* @param object options
	*/
	this.activate_autocomplete = function(options) {

		const self = this

		// options
			const form_item		= options.form_item;
			const limit			= options.limit || 30;
			const table			= options.table || form_item.table;
			const cross_filter	= options.cross_filter || true; // look the other form values to generate the sql filter (default true)
			const order			= options.order || 'name ASC'; // 'name' is the generic column alias
			const parse_result	= options.parse_result || function(ar_result, term) {
				return ar_result.map(function(item){
					item.label	= item.label.replace(/<br>/g," ")
					// temporal mib
						if (typeof page.parse_legend_svg==='function') {
							item.label	= page.parse_legend_svg(item.label)
						}
					return item
				})
			}; // (!) always terminate with ;

		/*
		 * jQuery UI Autocomplete HTML Extension
		 *
		 * Copyright 2010, Scott González (http://scottgonzalez.com)
		 * Dual licensed under the MIT or GPL Version 2 licenses.
		 *
		 * http://github.com/scottgonzalez/jquery-ui-extensions
		 */
		(function( $ ) {

			var proto = $.ui.autocomplete.prototype,
				initSource = proto._initSource;

			function filter( array, term ) {
				var matcher = new RegExp( $.ui.autocomplete.escapeRegex(term), "i" );
				return $.grep( array, function(value) {
					return matcher.test( $( "<div>" ).html( value.label || value.value || value ).text() );
				});
			}

			$.extend( proto, {
				_initSource: function() {
					if ( this.options.html && $.isArray(this.options.source) ) {
						this.source = function( request, response ) {
							response( filter( this.options.source, request.term ) );
						};
					} else {
						initSource.call( this );
					}
				},

				_renderItem: function( ul, item) {

					var final_label = item.label

					// remove empty values when separator is present
						var ar_parts 	= final_label.split(' | ')
						var ar_clean 	= []
						for (var i = 0; i < ar_parts.length; i++) {
							var current = ar_parts[i]
							if (current.length>1 && current!=='<i>.</i>') {
								ar_clean.push(current)
							}
						}
						final_label = ar_clean.join(' | ') // overwrite

					return $( "<li class=\"ui-menu-item\"></li>" )
						.data( "item.autocomplete", item )
						//.append( $( "<a></a>" )[ this.options.html ? "html" : "text" ]( item.label ) )
						.append( $( "<div class=\"ui-menu-item-wrapper\"></div>" )[ this.options.html ? "html" : "text" ]( final_label ) )
						.appendTo( ul );
				}
			});
		})( jQuery );


		const cache = {}
		$(form_item.node_input).autocomplete({
			delay		: 150,
			minLength	: 0,
			html		: true,
			source		: function( request, response ) {

				const term = request.term

				const field				= form_item.q_name // Like 'mint'
				const q_column			= form_item.q_column // Like 'term'
				const q_column_group	= form_item.q_column_group || q_column

				// filter build
					const op 	 = "$and"
					const filter = {}
						  filter[op] = []

					const value_parsed = (form_item.eq_in) + term + (form_item.eq_out)

					const safe_value = (typeof value_parsed==='string' || value_parsed instanceof String)
							? value_parsed.replace(/(')/g, "''")
							: value_parsed

					// main column search item
						filter[op].push({
							field	: form_item.q_column_filter || q_column,
							value	: `'${safe_value}'`,
							op		: form_item.eq, // 'LIKE',
							group	: q_column_group // q_column
						})

					// optional second column 'term_table' search item. Add column name filter
						// const q_table	= form_item.q_table
						// if (q_table!=="any") {
						// 	filter[op].push({
						// 		field	: "term_table",
						// 		value	: `'${q_table}'`,
						// 		op		: '='
						// 	})
						// }

					// cross filter. Add other selected values to the filter to create a interactive filter
						if (cross_filter) {
							const c_op		= "$and"
							const c_filter	= {}
								  c_filter[c_op] = []
							for (let [id, current_form_item] of Object.entries(self.form_items)) {
								if (current_form_item.id===form_item.id) continue; // skip self

								// q . Value from input
									if ((current_form_item.q.length!==0 && current_form_item.q!=='*') || current_form_item.sql_filter) {

										// q element
											const element = {
												field		: current_form_item.q_column,
												value		: `'%${current_form_item.q}%'`,
												op			: "LIKE", // fixed as 'LIKE'
												sql_filter	: current_form_item.sql_filter,
												wrapper		: current_form_item.wrapper
											}

											c_filter[c_op].push(element)
									}

								// q_selected. Values from user already selected values
									if (current_form_item.q_selected.length!==0) {

										for (let k = 0; k < current_form_item.q_selected.length; k++) {

											const value = current_form_item.q_selected[k]

											// escape html strings containing single quotes inside.
											// Like 'leyend <img data="{'lat':'452.6'}">' to 'leyend <img data="{''lat'':''452.6''}">'
											// const safe_value = value.replace(/(')/g, "''")
											const safe_value = (typeof value==='string' || value instanceof String)
												? value.replace(/(')/g, "''")
												: value

											// elemet
											const element = {
												field		: current_form_item.q_column,
												value		: (current_form_item.is_term===true) ? `'%"${safe_value}"%'` : `'${safe_value}'`,
												op			: (current_form_item.is_term===true) ? "LIKE" : "=",
												sql_filter	: current_form_item.sql_filter,
												wrapper		: current_form_item.wrapper
											}

											c_filter[c_op].push(element)
										}
									}
							}
							if (c_filter[c_op].length>0) {
								filter[op].push(c_filter)
							}
						}

					// cache . Use only when there are no cross filters
						if (filter[op].length===1) {
							if ( term in cache ) {
								if(SHOW_DEBUG===true) {
									// console.warn("Returning values from cache:", cache[term])
								}
								response( cache[ term ] );
								return;
							}
						}

					// sql_filter
						const sql_filter = self.parse_sql_filter(filter) // + ' AND `'+q_column+'` IS NOT NULL' // + ' AND `'+q_column+'`!=\'\''

					// table resolved
						const table_resolved = typeof table==="function" ? table() : table;

					// field
						const field_beats = q_column.split(' AS ')
						const plain_field = field_beats[0]

					// search
						data_manager.request({
							body : {
								dedalo_get	: 'records',
								table		: table_resolved,
								ar_fields	: [plain_field + " AS name"],
								sql_filter	: sql_filter,
								group		: plain_field, // q_column,
								limit		: limit,
								order		: order
							}
						})
						.then((api_response) => { // return results in standard format (label, value)
							// console.log("-->autocomplete api_response:", api_response);

							const ar_result	= []

							const result	= api_response.result
							const len		= api_response.result.length

							for (let i = 0; i < len; i++) {

								const item = api_response.result[i]

								if (!item.name || item.name.length<1) { continue; }

								// name. Could be as ["Arse"] | ["Arse"]
									let base_value = []
									if (item.name.indexOf("[\"")===0 && item.name.indexOf("] | [")!==-1) {
										// split and group
										const beats			= item.name.split(" | ")
										const parsed_beats	= beats.map(el => JSON.parse(el))

										let ar_final = []
										for (let k = 0; k < parsed_beats.length; k++) {
											ar_final.concat(parsed_beats[k])
										}
										// unify expected string format
										base_value = JSON.stringify(ar_final)

									}else{
										base_value = item.name
									}

								// const current_ar_value = (item.name.indexOf("[\"")===0)
								// 	? JSON.parse(item.name)
								// 	: [item.name]
								const current_ar_value = (base_value.indexOf("[\"")===0)
									? JSON.parse(base_value)
									: (Array.isArray(base_value) ? base_value : [base_value])

								for (let j = 0; j < current_ar_value.length; j++) {

									const item_name		= current_ar_value[j] // self.format_drop_down_list(q_column, current_ar_value[j])
									const item_value	= current_ar_value[j]
									// const item_name = item.name.replace(/[\["|"\]]/g, '')

									if (!item_name || item_name==='[]') continue;

									if (form_item.value_split) {

										const terms = item_name.split(form_item.value_split)
										for (let k = 0; k < terms.length; k++) {

											// split sub_filter when the item has other terms in the same row
											const term_name = terms[k].trim()
											// all term to lower case for compare it
											const term_name_lowercase = term_name.toLowerCase()
											const search_name_lowercase = request.term.toLowerCase()
											// it the search don't match with the current_term continue to other
											if(term_name_lowercase.indexOf(search_name_lowercase)===-1){
												continue
											}

											const found = ar_result.find(el => el.value===term_name)
											if (!found && term_name.length > 0) {
												ar_result.push({
													label : term_name,
													value : term_name
												})
											}
										}

									}else{

										const found = ar_result.find(el => el.value===item_name)
										if (!found && item_value.trim().length > 0) {
											ar_result.push({
												label : item_name, // item_name,
												value : item_value // item.name
											})
										}

									}//end if (form_item.value_split)
								}
							}

							// parse result
								const ar_result_final = parse_result(ar_result, term)

							// cache . Use only when there are no cross filters
								if (filter[op].length===1 && typeof table!=="function") {
									cache[ term ] = ar_result_final
								}

							// debug
								if(SHOW_DEBUG===true) {
									// console.log("--- autocomplete api_response:",api_response);
									// console.log("autocomplete ar_result_final:",ar_result_final);
								}

							response(ar_result_final)
						})
			},
			// When a option is selected in list
			select: function( event, ui ) {
				// prevent set selected value to autocomplete input
				event.preventDefault();

				self.add_selected_value(form_item, ui.item.label, ui.item.value)

				// reset input value
				this.value = ''

				return false;
			},
			// When a option is focus in list
			focus: function() {
				// prevent value inserted on focus
				return false;
			},
			close: function( event, ui ) {

			},
			change: function( event, ui ) {

			},
			response: function( event, ui ) {
				//console.log(ui);
			}
		})
		.on("keydown", function( event ) {
			//return false
			//console.log(event)
			if ( event.keyCode===$.ui.keyCode.ENTER  ) {
				// prevent set selected value to autocomplete input
				//event.preventDefault();
				//var term = $(this).val();
				$(this).autocomplete('close')
			}//end if ( event.keyCode===$.ui.keyCode.ENTER  )
		})// bind
		.focus(function() {
		    $(this).autocomplete('search', null)
		})
		// .blur(function() {
		//     //$(element).autocomplete('close');
		// })


		return true
	}//end activate_autocomplete



	/**
	* FORM_TO_SQL_FILTER (DEPRECATED!)
	* Builds a plain sql filter from the form nodes values
	*/
	this.form_to_sql_filter = function(options) {
		console.error("WARNING! form_to_sql_filter is DEPRECATED! Use build_filter instead!");

		const self = this

		// options
			const form_node = options.form_node

		// short vars
			const form_items = self.form_items


		const ar_query_elements = []
		for (let [id, form_item] of Object.entries(form_items)) {

			const current_group = []

			const group_op = "AND"
			const group = {}
				  group[group_op] = []

			// q value
				if (form_item.q.length!==0) {

					const c_group_op = 'AND'
					const c_group = {}
						  c_group[c_group_op] = []

					const safe_value = form_item.q.replace(/(')/g, "''")

					const value_parsed = (form_item.eq_in) + safe_value + (form_item.eq_out)

					// q element
						const element = {
							field	: form_item.q_column,
							value	: value_parsed, // `'${form_item.q}'`,
							op		: form_item.eq // default is 'LIKE'
						}

						c_group[c_group_op].push(element)

					// add basic group
						group[group_op].push(c_group)
				}

			// q_selected values
				if (form_item.q_selected.length!==0) {

					for (let j = 0; j < form_item.q_selected.length; j++) {

						// value
							const value = form_item.q_selected[j]

							// escape html strings containing single quotes inside.
							// Like 'leyend <img data="{'lat':'452.6'}">' to 'leyend <img data="{''lat'':''452.6''}">'
							const safe_value = value.replace(/(')/g, "''")

						const c_group_op = "AND"
						const c_group = {}
							  c_group[c_group_op] = []

						// elemet
						const element = {
							field	: form_item.q_column,
							value	: (form_item.is_term===true) ? `'%"${safe_value}"%'` : `'${safe_value}'`,
							op		: (form_item.is_term===true) ? "LIKE" : "="
						}
						c_group[c_group_op].push(element)

						group[group_op].push(c_group)
					}
				}

			if (group[group_op].length>0) {
				ar_query_elements.push(group)
			}
		}

		// debug
			if(SHOW_DEBUG===true) {
				// console.log("self.form_items:",self.form_items);
				// console.log("ar_query_elements:",ar_query_elements);
			}

		// empty form case
			if (ar_query_elements.length<1) {
				console.warn("-> form_to_sql_filter empty elements selected:", ar_query_elements)
				return null
			}

		// operators value
			const input_operators = form_node.querySelector('input[name="operators"]')
			const operators_value = input_operators
				? form_node.querySelector('input[name="operators"]:checked').value
				: "AND";

			const filter = {}
				  filter[operators_value] = ar_query_elements

		// debug
			if(SHOW_DEBUG===true) {
				// console.log("-> form_to_sql_filter filter:",filter)
			}

		// sql_filter
			const sql_filter = self.parse_sql_filter(filter)


		return sql_filter
	}//end form_to_sql_filter



}//end form_factory



var psqo_factory = {



	/**
	* BUILD_SAFE_PSQO
	* Check and validate psqo element
	*/
	build_safe_psqo : function(psqo){

		const self = this

		const global_key = Object.keys(psqo)[0]
		if(global_key==='$and' || global_key==='$or'){
			// recursion values
			for (let i = 0; i < psqo[global_key].length; i++) {
				psqo[global_key][i] = self.build_safe_psqo(psqo[global_key][i])
			}
		}else{
			return clean_psqo_item(psqo)
		}

		function clean_psqo_item(psqo_item){

			// des
				// const eq_in			= (psqo_item.eq_in && psqo_item.eq_in === '%') ? '%' : ''
				// const eq_out		= (psqo_item.eq_out && psqo_item.eq_out === '%') ? '%' : ''
				// const value			= psqo_item.value
				// const safe_value	= (typeof value==='string' || value instanceof String)
				// 	? value.replace(/(')/g, "''")
				// 	: value

			// mandatory properties
				const id		= psqo_item.id
				const field		= psqo_item.field // db column name like 'p_culture'
				const q			= psqo_item.q // search value original like 'arse'
				const q_type	= typeof psqo_item.q_type!=="undefined" // type of form value: q | q_selected
					? psqo_item.q_type
					: 'q'

			// const safe_q	= (typeof q==='string' || q instanceof String)
			// 	? encodeURIComponent(q)
			// 	: q

			const new_psqo_item = {
				id		: id,
				field	: field,
				q		: q,
				q_type	: q_type
			}

			// optionals
				if (psqo_item.op) {
					new_psqo_item.op = psqo_item.op
				}
				if (psqo_item.eq_in) {
					new_psqo_item.eq_in = psqo_item.eq_in
				}
				if (psqo_item.eq_out) {
					new_psqo_item.eq_out = psqo_item.eq_out
				}

			return new_psqo_item
		}

		return psqo
	},// build_safe_psqo



	/**
	* ENCODE_PSQO
	* @see https://pieroxy.net/blog/pages/lz-string/guide.html#inline_menu_3
	* Encode psqo object using base64 to allow use it in url context
	*/
	encode_psqo : function(psqo){

		// const encoded_psqo = window.btoa(JSON.stringify(psqo));
		const base = JSON.stringify(psqo);
		return LZString.compressToEncodedURIComponent(base);

		// return encoded_psqo
	},//end encode_psqo



	/**
	* DECODE_PSQO
	* Decode previously stringified and base64 encoded psqo object
	* @see https://pieroxy.net/blog/pages/lz-string/guide.html#inline_menu_3
	* @return object | null
	*/
	decode_psqo : function(psqo){

		const parsed_psqo = (()=>{
			try {
				// return JSON.parse(window.atob(psqo))

				const base = LZString.decompressFromEncodedURIComponent(psqo);
				return JSON.parse(base)

			}catch(error) {
				console.log("psqo:",psqo);
				console.warn("invalid psqo: ", error);
			}
			return null
		})()


		return parsed_psqo
	}//end decode_psqo



}//end psqo_factory
