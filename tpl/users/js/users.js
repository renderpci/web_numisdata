/*global tstring, page_globals, SHOW_DEBUG, event_manager, data_manager, common, page */
/*eslint no-undef: "error"*/

"use strict";



var users =  {



	/**
	* VARS
	*/
		container : null,



	/**
	* SET_UP
	*/
	set_up : function(options) {
		if(SHOW_DEBUG===true) {
			// console.log("generic.set_up options:", options);
		}

		const self = this

		// options
			const row		= options.row
			const container	= options.main_container


		// spinner on
			const spinner = common.create_dom_element({
				element_type	: "div",
				class_name		: "spinner",
				parent			: container
			})

		// parse ts_web data
			const parsed_row = page.parse_ts_web(row)[0]

		// render
			self.render_row(parsed_row)
			.then(function(node){

				container.appendChild(node)

				// event publish template_render_end
					event_manager.publish('template_render_end', {
						item	: container
					})

				spinner.remove()
			})

		// users data request
			self.get_users_data()
			.then(function(parsed_data){
				const graph_nodes = self.render_users_data({
					parsed_data : parsed_data
				})
				container.appendChild(graph_nodes)
			})


		return true
	},//end set_up



	/**
	* GET_USERS_DATA
	* 	Exec a API request to obtain all users data
	* @return array users_data
	*/
	get_users_data : async function() {

		const response = await data_manager.request({
			body : {
				dedalo_get	: 'records',
				table		: 'activity', // users activity 'numisdata1096'
				ar_fields	: ['*'],
				lang		: page_globals.WEB_CURRENT_LANG_CODE,
				limit		: 0,
				count		: false
			}
		})

		// parse JSON string data
			const users_data = page.parse_activity_data(response.result)

		// debug
			if(SHOW_DEBUG===true) {
				// console.log("users_data:",users_data);
			}


		return users_data
	},//end get_users_data



	/**
	* RENDER_USERS_DATA
	* @return DOM node
	*/
	render_users_data : function(options) {

		const self = this

		// options
			const parsed_data = options.parsed_data

		const fragment = new DocumentFragment()

		// editor categories
			const editors_type = {
				bronze : {
					min : 1,
					max : 20000
				},
				silver : {
					min : 20001,
					max : 600000
				},
				gold : {
					min : 600001,
					max : null
				}
			}

		// between
			const value_between = function(value, a, b, inclusive) {
				const min	= Math.min(a, b)
				const max	= Math.max(a, b);

				return inclusive
					? value >= min && value <= max
					: value > min && value < max;
			}

		// summarize data
			const editors = {
				gold	: [],
				silver	: [],
				bronze	: []
			}
			const parsed_data_length = parsed_data.length
			for (let i = 0; i < parsed_data_length; i++) {

				const row	= parsed_data[i]

				const save_data = row.activity.what.find(el => el.key==='dd700')
				if (save_data && row.full_name) {

					const value = save_data.value

					let editor_type = null;
					switch (true) {
						case value>=editors_type.gold.min || row.section_id===1:
							editor_type = 'gold'
							break;
						case value_between(value, editors_type.silver.min, editors_type.silver.max, true):
							editor_type = 'silver'
							break;
						// case value_between(value, editors_type.bronze.min, editors_type.bronze.max, true):
						default:
							editor_type = 'bronze'
							break;
					}

					editors[editor_type].push({
						label	: row.full_name, // ex. string 'render'
						value	: value, // ex. int 1987
						type	: editor_type // ex string 'gold'
					})
				}
			}
			// console.log("editors:",editors);


			const draw_editors_list = function(list_raw) {

				// sort list alphabetically
					const list = list_raw.sort(function(a, b) {
						return a.label.localeCompare(b.label, undefined, {
							numeric		: true,
							sensitivity	: 'base'
						})
					});

				const fragment = new DocumentFragment()

				// iterate
					const editors_length = list.length
					for (let i = 0; i < editors_length; i++) {

						const item = list[i]
						// console.log("item:",item);

						common.create_dom_element({
							element_type	: "div",
							class_name		: "editor_name",
							inner_html		: item.label,
							parent			: fragment
						})
					}

				return fragment
			}


			for(const type in editors) {

				// block
					const block = common.create_dom_element({
						element_type	: 'div',
						class_name		: 'editors_block',
						parent			: fragment
					})

				// title
					common.create_dom_element({
						element_type	: 'h1',
						class_name		: 'title',
						inner_html		: tstring[type] || type,
						parent			: block
					})
				// editors list
					block.appendChild(
						draw_editors_list(editors[type])
					)
			}





		return fragment
	},//end render_users_data






	/**
	* RENDER_ROW
	* @return DOM object (document fragment)
	*/
	render_row : function(row) {

		const self = this

		return new Promise(function(resolve){

			const fragment = new DocumentFragment()

			// console.log("render_row row:",row);

			const title		= row.titulo
			const abstract	= row.entradilla
			const body		= row.cuerpo

			// title
				common.create_dom_element({
					element_type	: "h1",
					class_name		: "title",
					inner_html		: title,
					parent			: fragment
				})

			// abstract
				if (abstract && abstract.length>0) {
					common.create_dom_element({
						element_type	: "p",
						class_name		: "abstract",
						inner_html		: abstract,
						parent			: fragment
					})
				}

			// identify_image
				if (row.identify_image && row.identify_image.length>0) {

					const image_url			= row.identify_image
					const identify_image	= common.create_dom_element({
						element_type	: "img",
						class_name		: "identify_image",
						src				: image_url,
						parent			: fragment
					})
				}

			// body
				if (body && body.length>0) {
					common.create_dom_element({
						element_type	: "section",
						class_name		: "content",
						inner_html		: body,
						parent			: fragment
					})
				}


			resolve(fragment)
		})
	},//end render_row



}//end users


