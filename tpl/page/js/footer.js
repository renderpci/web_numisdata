/*global common, page_globals */
/*eslint no-undef: "error"*/
"use strict";



var footer =  {



	footer_data : null,
	footer_root : null,
	footer_dynamic_wraper : null,



	set_up : function(options) {

		const self = this

		// options
			self.footer_root			= options.footer_root // object normally numisdata349_30 'Pie' row
			self.footer_data			= options.footer_data // array JSON data from menu (ts_web)
			self.footer_dynamic_wraper	= options.footer_dynamic_wraper // DOM node

		if (!self.footer_root || !self.footer_root.term_id) {
			return false
		}

		// render
			const footer_node = self.render_footer()
			if (footer_node) {
				self.footer_dynamic_wraper.appendChild(footer_node)
			}

			return true
	},//end set_up



	/**
	* RENDER_FOOTER
	*/
	render_footer : function() {

		const self = this

		// short vars
			const footer_data	= self.footer_data
			const root_term_id	= self.footer_root.term_id

		const fragment = new DocumentFragment();

		// root level
			const root_rows = footer_data.filter(el => el.parent===root_term_id)
			const root_rows_length = root_rows.length
			for (let i = 0; i < root_rows_length; i++) {

				const item = root_rows[i]

				const child_node = self.build_child_node(item)
				if (child_node) {

					// ul
						const ul = common.create_dom_element({
							element_type	: "ul",
							class_name		: "footer-links-ul",
							parent			: fragment
						})

					// li add
						ul.appendChild(child_node)
				}

			}//end for (let i = 0; i < root_rows_length; i++) {

		return fragment
	},//end render_footer



	/**
	* BUILD_CHILD_NODE
	*/
	build_child_node : function(row) {

		const self = this

		// short vars
			const image = row.images && row.images[0]
				? (row.images[0].indexOf('http')===0)
					? row.images[0]
					: page_globals.__WEB_BASE_URL__ + row.images[0]
				: null
			const url = (row.web_path.indexOf('http')===0)
				? row.web_path
				: page_globals.__WEB_MEDIA_BASE_URL__ + '/' + row.web_path
			const label		= row.label
			const children	= row.children
			const menu		= row.menu || 'no'
			const parent	= row.parent
			const web_path	= row.web_path


		const fragment = new DocumentFragment();

		// li
			const li = common.create_dom_element({
				element_type	: "li",
				class_name		: "footer-links-li",
				parent			: fragment
			})

		// content
			if (parent===self.footer_root.term_id) {

				// root level child case

				// label (root terms only)
					common.create_dom_element({
						element_type	: 'p',
						class_name		: 'footer-section-txt',
						inner_html		: label,
						parent			: li
					})

				if (!children) {
					// link duplicate root item to get a standard link
						const link = common.create_dom_element({
							element_type	: 'a',
							class_name		: 'footer-links-a',
							href			: url,
							title			: label,
							inner_html		: label,
							parent			: li
						})
						if (url.indexOf('http')===0) {
							link.rel	= 'noreferrer'
							link.target	= '_blank'
						}
				}
			}
			else{

				// non root level case

				// link / image
				if (image && menu!=='yes' && web_path.indexOf('http')!==-1) {

					// link
						const link = common.create_dom_element({
							element_type	: 'a',
							href			: url,
							title			: label,
							parent			: li
						})
						if (url.indexOf('http')===0) {
							link.rel	= 'noreferrer'
							link.target	= '_blank'
						}

					// image
						const image_src = image.replace('.jpg','.png')
						const image_node = common.create_dom_element({
							element_type	: 'img',
							class_name		: 'footer_image_item',
							src				: image_src,
							title			: label,
							parent			: link
						})
						image_node.loading = 'lazy'
				}else{

					// link
						const link = common.create_dom_element({
							element_type	: 'a',
							class_name		: 'footer-links-a',
							href			: url,
							title			: label,
							inner_html		: label,
							parent			: li
						})
						if (url.indexOf('http')===0) {
							link.rel	= 'noreferrer'
							link.target	= '_blank'
						}
				}
			}

		// with children case
			if (children) {
				const children_length = children.length
				for (let i = 0; i < children_length; i++) {

					const child_tipo	= children[i]
					const child			= self.footer_data.find(el => el.term_id===child_tipo)
					if (!child) {
						console.log("Ignore not found children:", row, child_tipo, children);
						continue;
					}

					const child_node = self.build_child_node(child)
					if (child_node) {

						// ul
							const ul = common.create_dom_element({
								element_type	: "ul",
								class_name		: "footer-links-ul",
								parent			: li
							})

						// li child
							ul.appendChild(child_node)
					}
				}
			}

		return fragment
	}//end build_child_node



}//end footer
