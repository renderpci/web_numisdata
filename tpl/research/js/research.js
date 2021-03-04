"use strict";



var research =  {



	/**
	* VARS
	*/
		container : null,
		swagger_ui_container : null,

		



	/**
	* SET_UP
	*/
	set_up : function(options) {
		if(SHOW_DEBUG===true) {
			console.log("generic.set_up options:", options);
		}

		const self = this

		// options
			const row					= options.row
			const container				= options.main_container
			const swagger_ui_container	= options.swagger_ui_container
			const source_file_url		= options.source_file_url

		// spinner on
			const spinner = common.create_dom_element({
				element_type	: "div",
				class_name		: "spinner",
				parent			: container
			})			
		
		// parse data
			const parsed_row = page.parse_ts_web(row)[0]		

		// render
			self.render_row(parsed_row)
			.then(function(node){

				container.appendChild(node)

				// event publish template_render_end
					event_manager.publish('template_render_end', {
						item	: container
					})

				// swagger ui
					self.render_api_docu_ui({
						source_file_url : source_file_url
					})

				spinner.remove()
				swagger_ui_container.classList.remove("hide")
			})

		
		return true
	},//end set_up



	/**
	* RENDER_API_DOCU_UI
	* @return 
	*/
	render_api_docu_ui : function(options) {

		const source_file_url = options.source_file_url		
		
		// Build a system
			const ui = SwaggerUIBundle({
				url		: source_file_url, // test json file url (use absolute url here !)
				dom_id	: '#swagger-ui',
				presets	: [
					SwaggerUIBundle.presets.apis,
					SwaggerUIStandalonePreset
				],
				plugins	: [
					SwaggerUIBundle.plugins.DownloadUrl
				],
				layout	: "StandaloneLayout"
			})

			window.ui = ui
		
		return ui
	},//end render_api_docu_ui



	/**
	* RENDER_ROW
	* @return DOM object (document fragment)
	*/
	render_row : function(row) {

		const self = this
		
		return new Promise(function(resolve){

			const fragment = new DocumentFragment()

			// console.log("render_row row:",row);
		
			// title
				const title = common.create_dom_element({
					element_type	: "h1",
					class_name		: "title",
					inner_html		: row.titulo,
					parent			: fragment
				})			
			
			// abstract
				if (row.entradilla && row.entradilla.length>0) {
					const abstract = common.create_dom_element({
						element_type	: "p",
						class_name		: "abstract",
						inner_html		: row.entradilla,
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
			
			
			// dedalo link
				const dedalo_link	= common.create_dom_element({
					element_type	: "input",
					type			: "button",
					class_name		: "entrada_dedalo btn btn-light btn-block primary",					
					value			: tstring.entry_to_catalog || 'Entry to the cataloging system',
					parent			: fragment
				})
				dedalo_link.addEventListener("click", function(){
					const new_window = window.open('/dedalo/', 'Dédalo', []);
					new_window.focus()
				})


			// body
				if (row.cuerpo && row.cuerpo.length>0) {
					const body = common.create_dom_element({
						element_type	: "section",
						class_name		: "content",
						inner_html		: row.cuerpo,
						parent			: fragment
					})

					hljs.initHighlightingOnLoad();
				}
	
			// Dédalo publication API interactive docu (Swagger)
				// const doc_ui_iframe = common.create_dom_element({
				// 	element_type	: "iframe",
				// 	class_name		: "doc_ui_iframe",					
				// 	parent			: fragment
				// })
				// doc_ui_iframe.addEventListener("load", function(e){
				// 		console.log("loaded:",this);
				// })


			resolve(fragment)
		})
	},//end render_row



}//end research


