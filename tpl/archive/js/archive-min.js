/*global SHOW_DEBUG, data_manager, common, page, page_globals, dedalo_logged, tstring, event_manager, list_factory, form_factory, biblio_row_fields, Promise */
/*eslint no-undef: "error"*/

"use strict";



var documentation = {


	// root of the hierarchy, same convention as WEB_MENU_PARENT in config.php
	ROOT_TERM_ID		: 'tch300_1',

	rows_container		: null,
	form_container		: null,
	browse_container	: null,
	search_status		: null,
	search_status_info	: null,
	toolbar				: null,
	section_id			: null,
	mode				: 'browse',
	list				: null,
	form				: null,
	filters_panel		: null,
	filters_toggle		: null,
	filters_open		: false,
	current_sql_filter	: null,
	view_mode			: 'list',
	grid_button			: null,
	list_button			: null,

	// term_id -> promise of a fully resolved sibling row, see prefetch_sibling
	sibling_prefetch_cache	: null,

	// parent term_id -> promise of that group's full sibling list, see draw_sibling_nav
	sibling_list_cache		: null,

	// parent term_id -> promise of that group's resolved ancestor chain, see render_detail
	ancestors_cache			: null,

	pagination : {
		total	: null,
		limit	: 20,
		offset	: 0,
		n_nodes	: 8
	},


	/**
	* SET_UP
	* @param object options
	*/
	set_up : function(options) {

		const self = this

		self.rows_container		= options.rows_container
		self.form_container		= options.form_container
		self.browse_container	= options.browse_container
		self.section_id			= options.section_id || null

		if (self.section_id) {
			self.load_detail()

			// back/forward after a client-side jump - re-fetch fresh
				window.addEventListener('popstate', function(){
					const match = window.location.pathname.match(/\/documentation\/(\d+)/)
					if (match) {
						self.section_id = match[1]
						self.load_detail()
					}
				})
		}else{

			const form_node = self.render_form()
			self.form_container.appendChild(form_node)

			// search status + toolbar, hidden together until searching
				self.search_status = common.create_dom_element({
					element_type	: "div",
					class_name		: "documentation_search_status hide"
				})
				self.rows_container.parentNode.insertBefore(self.search_status, self.rows_container)

				self.search_status_info = common.create_dom_element({
					element_type	: "div",
					class_name		: "documentation_search_status_info",
					parent			: self.search_status
				})

				self.toolbar = self.render_toolbar()
				self.search_status.appendChild(self.toolbar)
				self.set_view_mode(self.view_mode)

			self.render_browse()

			event_manager.subscribe('paginate', function(offset){
				self.pagination.offset = offset
				self.load_list()
			})
		}

		return true
	},//end set_up



	/**
	* RENDER_FORM
	* Search bar (title) + collapsible advanced filters panel
	*/
	render_form : function() {

		const self = this

		self.form = new form_factory()

		const fragment = new DocumentFragment()

		// title
			const top_row = common.create_dom_element({
				element_type	: "div",
				class_name		: "form-row fields",
				parent			: fragment
			})

			self.form.item_factory({
				id			: "title",
				name		: "title",
				label		: tstring.search_documentation || "Search by title...",
				// title+name, not title alone - see resolve_title
				q_column	: "CONCAT_WS(' ', title, name)",
				eq			: "LIKE",
				eq_in		: "%",
				eq_out		: "%",
				is_term		: false,
				class_name	: "global_search",
				parent		: top_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'documentation'
					})
				}
			})

		// filters_panel
			const filters_panel = common.create_dom_element({
				element_type	: "div",
				class_name		: "form-row fields hide",
				parent			: fragment
			})
			self.filters_panel = filters_panel

			// term fields . same order as draw_fields shows them on the detail page
				const term_fields = [
					{ id: "collection", label: tstring.collection || "Collection" },
					{ id: "fund",       label: tstring.fund       || "Fund"       },
					{ id: "typology",   label: tstring.typology   || "Typology"   },
					{ id: "material",   label: tstring.material   || "Material"   },
					{ id: "name",       label: tstring.name       || "Name"       }
				]
				term_fields.forEach(function(field){
					self.form.item_factory({
						id			: field.id,
						name		: field.id,
						label		: field.label,
						q_column	: field.id,
						eq			: "LIKE",
						eq_in		: "%",
						eq_out		: "%",
						is_term		: true,
						parent		: filters_panel,
						callback	: function(form_item) {
							self.form.activate_autocomplete({
								form_item	: form_item,
								table		: 'documentation'
							})
						}
					})
				})

			// description - plain free-text LIKE, no autocomplete (prose field, not a controlled vocabulary)
				self.form.item_factory({
					id			: "description",
					name		: "description",
					label		: tstring.description || "Description",
					q_column	: "description",
					eq			: "LIKE",
					eq_in		: "%",
					eq_out		: "%",
					is_term		: false,
					parent		: filters_panel
				})

		// buttons row . Filtros/Borrar filtros/Buscar together, same convention as catalog.js
			const buttons_row = common.create_dom_element({
				element_type	: "div",
				class_name		: "form-group field button_submit",
				parent			: fragment
			})

			self.filters_toggle = common.create_dom_element({
				element_type	: "input",
				type			: "button",
				value			: tstring.filters || "Filters",
				parent			: buttons_row
			})
			self.filters_toggle.addEventListener("click", function(){
				self.toggle_filters()
			})

			const clear_button = common.create_dom_element({
				element_type	: "input",
				type			: "button",
				value			: tstring.clear_filters || "Clear filters",
				parent			: buttons_row
			})
			clear_button.addEventListener("click", function(){
				self.clear_filters()
			})

			common.create_dom_element({
				element_type	: "input",
				type			: "submit",
				class_name		: "primary",
				value			: tstring.search || "Search",
				parent			: buttons_row
			})

		// form node
			self.form.node = common.create_dom_element({
				element_type	: "form",
				id				: "documentation_search_form",
				class_name		: "form-inline"
			})
			self.form.node.appendChild(fragment)

			self.form.node.addEventListener("submit", function(e){
				e.preventDefault()
				self.form_submit()
			})

		return self.form.node
	},//end render_form



	/**
	* RENDER_TOOLBAR
	* Grid / list view switch, sits above the results
	*/
	render_toolbar : function() {

		const self = this

		const toolbar = common.create_dom_element({
			element_type	: "div",
			class_name		: "documentation_toolbar"
		})

		const view_toggle = common.create_dom_element({
			element_type	: "div",
			class_name		: "documentation_view_toggle",
			parent			: toolbar
		})

		self.list_button = common.create_dom_element({
			element_type	: "button",
			type			: "button",
			class_name		: "documentation_view_btn",
			inner_html		: '<i class="fa fa-list"></i>',
			title			: tstring.list_view || "List view",
			parent			: view_toggle
		})
		self.list_button.addEventListener("click", function(){
			self.set_view_mode('list')
		})

		self.grid_button = common.create_dom_element({
			element_type	: "button",
			type			: "button",
			class_name		: "documentation_view_btn",
			inner_html		: '<i class="fa fa-th-large"></i>',
			title			: tstring.grid_view || "Grid view",
			parent			: view_toggle
		})
		self.grid_button.addEventListener("click", function(){
			self.set_view_mode('grid')
		})

		return toolbar
	},//end render_toolbar



	/**
	* SET_VIEW_MODE
	* @param string mode 'grid' | 'list'
	*/
	set_view_mode : function(mode) {

		const self = this

		self.view_mode = mode

		self.rows_container.classList.toggle('view_grid', mode==='grid')
		self.rows_container.classList.toggle('view_list', mode==='list')

		self.grid_button.classList.toggle('active', mode==='grid')
		self.list_button.classList.toggle('active', mode==='list')
	},//end set_view_mode



	/**
	* TOGGLE_FILTERS
	*/
	toggle_filters : function() {

		const self = this

		self.filters_open = !self.filters_open
		self.filters_panel.classList.toggle('hide', !self.filters_open)
		self.filters_toggle.value = self.filters_open
			? (tstring.hide_filters || "Hide filters")
			: (tstring.filters || "Filters")
	},//end toggle_filters



	/**
	* RESET_FORM_FIELDS
	* Clear every field's value without triggering a search
	*/
	reset_form_fields : function() {

		const self = this

		for (let [id, form_item] of Object.entries(self.form.form_items)) {
			form_item.q			= ""
			form_item.q_selected	= []
			if (form_item.node_input) {
				form_item.node_input.value = ""
			}
			if (form_item.node_values) {
				while (form_item.node_values.hasChildNodes()) {
					form_item.node_values.removeChild(form_item.node_values.lastChild)
				}
			}
		}
	},//end reset_form_fields



	/**
	* CLEAR_FILTERS
	* An empty form means "not searching" - go back to browsing
	*/
	clear_filters : function() {

		this.exit_search_mode()
	},//end clear_filters



	/**
	* FORM_SUBMIT
	*/
	form_submit : function() {

		const self = this

		const filter = self.form.build_filter()

		self.current_sql_filter = filter
			? '(' + self.form.parse_sql_filter(filter) + ')'
			: null

		self.pagination.offset	= 0
		self.pagination.total	= null

		self.enter_search_mode()
		self.load_list()
	},//end form_submit



	/**
	* ENTER_SEARCH_MODE
	*/
	enter_search_mode : function() {

		const self = this

		if (self.mode==='search') {
			return
		}

		self.mode = 'search'
		self.browse_container.classList.add('hide')
		self.search_status.classList.remove('hide')
	},//end enter_search_mode



	/**
	* EXIT_SEARCH_MODE
	*/
	exit_search_mode : function() {

		const self = this

		self.mode = 'browse'
		self.reset_form_fields()
		self.current_sql_filter	= null
		self.pagination.offset		= 0
		self.pagination.total		= null

		self.browse_container.classList.remove('hide')
		self.search_status.classList.add('hide')

		while (self.rows_container.hasChildNodes()) {
			self.rows_container.removeChild(self.rows_container.lastChild)
		}
	},//end exit_search_mode



	/**
	* UPDATE_SEARCH_STATUS
	* @param number total
	*/
	update_search_status : function(total) {

		const self = this

		while (self.search_status_info.hasChildNodes()) {
			self.search_status_info.removeChild(self.search_status_info.lastChild)
		}

		common.create_dom_element({
			element_type	: "span",
			class_name		: "documentation_search_status_text",
			text_content	: (tstring.search_results || 'Search results') + ' (' + total + ')',
			parent			: self.search_status_info
		})

		const back_button = common.create_dom_element({
			element_type	: "button",
			type			: "button",
			class_name		: "documentation_back_to_browse",
			inner_html		: '<i class="fa fa-angle-left"></i> ' + (tstring.browse_documentation || 'Browse documentation'),
			parent			: self.search_status_info
		})
		back_button.addEventListener('click', function(){
			self.exit_search_mode()
		})
	},//end update_search_status



	/**
	* LOAD_LIST
	* Fetch current pagination page and render it using list_factory
	*/
	load_list : function() {

		const self = this
		const rows_container = self.rows_container

		if (!self.pagination.total) {
			page.add_spinner(rows_container)
		}else{
			rows_container.classList.add('loading')
		}

		self.get_rows({
			limit		: self.pagination.limit,
			offset		: self.pagination.offset,
			sql_filter	: self.current_sql_filter
		})
		.then(function(response){

			self.pagination.total = response.total
			self.update_search_status(response.total)

			while (rows_container.hasChildNodes()) {
				rows_container.removeChild(rows_container.lastChild);
			}
			rows_container.classList.remove('loading')

			if (response.error) {
				common.create_dom_element({
					element_type	: "p",
					class_name		: "documentation_empty_state documentation_error_state",
					inner_html		: '<i class="fa fa-exclamation-triangle"></i> ' + (tstring.load_error || 'Something went wrong loading these records. Please try again.'),
					parent			: rows_container
				})
				return
			}

			if (!response.rows.length) {
				common.create_dom_element({
					element_type	: "p",
					class_name		: "documentation_empty_state",
					inner_html		: '<i class="fa fa-search"></i> ' + (tstring.no_results || 'No records found.'),
					parent			: rows_container
				})
				return
			}

			self.list = self.list || new list_factory()
			self.list.init({
				data			: response.rows,
				fn_row_builder	: self.list_row_builder,
				pagination		: self.pagination,
				caller			: self
			})
			self.list.render_list()
			.then(function(list_node){
				if (list_node) {
					rows_container.appendChild(list_node)
				}
			})
		})
	},//end load_list



	/**
	* LIST_ROW_BUILDER
	* Callback used by list_factory to build each row node
	* @param object row
	* @return HTMLElement
	*/
	list_row_builder : function(row){

		return documentation.draw_item(row, { variant: 'search' })
	},//end list_row_builder



	/**
	* RENDER_BROWSE
	* Default landing state for '/documentation': the root's direct children
	* (funds) as large editorial cards
	*/
	render_browse : function() {

		const self = this

		page.add_spinner(self.browse_container)

		self.fetch_children(self.ROOT_TERM_ID).then(function(children){

			while (self.browse_container.hasChildNodes()) {
				self.browse_container.removeChild(self.browse_container.lastChild)
			}

			if (!children.length) {
				return
			}

			common.create_dom_element({
				element_type	: "h2",
				class_name		: "documentation_browse_heading",
				text_content	: tstring.explore_the_documentation || 'Explore the documentation',
				parent			: self.browse_container
			})

			const grid = common.create_dom_element({
				element_type	: "div",
				class_name		: "documentation_fund_grid",
				parent			: self.browse_container
			})

			children.forEach(function(fund_row){
				grid.appendChild( self.draw_item(fund_row, { variant: 'fund' }) )
			})
		})
	},//end render_browse



	/**
	* ANNOTATE_CHILD_COUNT
	* Async item-count fill-in for a card. Zero-count target_el stays in place
	* (opacity:0) rather than removed, so every card reserves the same slot
	* @param string term_id
	* @param object target_el
	*/
	annotate_child_count : function(term_id, target_el) {

		data_manager.request({
			body : {
				dedalo_get	: 'records',
				table		: 'documentation',
				ar_fields	: ['term_id'],
				sql_filter	: 'parent_data LIKE \'%"' + term_id + '"%\'',
				limit		: 1,
				count		: true
			}
		})
		.then(function(api_response){

			const total = api_response.total || 0
			if (total>0) {
				target_el.innerHTML = '<i class="fa fa-cubes"></i> ' + total + ' ' + (tstring.items || 'Items')
				target_el.classList.add('is_ready')
			}
		})
	},//end annotate_child_count



	/**
	* LOAD_DETAIL
	* 'documentation' has no section_id column - term_id ('tch300_' + id) is the real key
	*/
	load_detail : function() {

		const self = this

		page.add_spinner(self.rows_container)

		self.get_rows({
			limit		: 1,
			offset		: 0,
			sql_filter	: "term_id='tch300_" + self.section_id + "'"
		})
		.then(function(response){
			self.render_detail(response.rows[0] || null, response.error)
		})
	},//end load_detail



	/**
	* GET_ROWS
	* Fetch "documentation" table records. parent_data isn't in
	* resolve_portals_custom (self-referential resolution comes back empty) -
	* ancestors are walked manually instead, see resolve_ancestors
	* @return promise : {rows, total}
	*/
	get_rows : function(options) {

		const request_body = {
			dedalo_get	: 'records',
			table		: 'documentation',
			ar_fields	: ['*'],
			sql_filter	: options.sql_filter || null,
			limit		: options.limit,
			offset		: options.offset,
			count		:	 true,
			resolve_portals_custom : {
				own_bibliography_data		: 'bibliographic_references',
				related_bibliography_data	: 'bibliographic_references',
				publications_data			: 'publications',
				identifying_images_data	: 'images',
				// images can also be split into this second field - see render_detail
				images_data					: 'images'
			}
		}

		return data_manager.request({
			body : request_body
		})
		.then(function(api_response){

			if (SHOW_DEBUG===true) {
				console.log("-> documentation api_response:", api_response);
			}

			// result:false means a genuine failure (data_manager never rejects) - distinct from a legitimate empty []
			if (api_response.result===false) {
				return {
					rows	: [],
					total	: 0,
					error	: true
				}
			}

			return {
				rows	: api_response.result || [],
				total	: api_response.total || 0,
				error	: false
			}
		})
	},//end get_rows



	/**
	* DRAW_ITEM
	* Build one documentation record card, linked to its detail page
	* @param object row
	* @param object options
	* @param string options.variant. 'fund' (browse view, with an async item
	*        count), 'child' (a record's own contents grid, opens in the same
	*        tab) or 'search' (default - result card)
	* @param string options.parent_title. 'child' only - see resolve_title
	* @return HTMLElement
	*/
	draw_item : function(row, options) {

		const variant = (options && options.variant) || 'search'

		const id = row.term_id.split('_').pop()

		const item_wrapper = common.create_dom_element({
			element_type	: "div",
			class_name		: "documentation_item"
				+ (variant==='fund' ? ' documentation_item_fund' : '')
				+ (variant==='child' ? ' documentation_item_child' : '')
		})

		const detail_url = page_globals.__WEB_ROOT_WEB__ + '/documentation/' + id

		// 'child' cards navigate same-tab, others open a new tab
			const card_link = common.create_dom_element({
				element_type	: "a",
				class_name		: "row_wrapper",
				href			: detail_url,
				target			: variant==='child' ? null : "_blank",
				parent			: item_wrapper
			})
			if (variant!=='child') {
				card_link.setAttribute('rel', 'noopener')
			}

		// thumbnail, or a placeholder instead of an empty gap
			const image_wrapper = common.create_dom_element({
				element_type	: "div",
				class_name		: "image_wrapper",
				parent			: card_link
			})

			if (row.identifying_images && row.identifying_images.length>0) {

				const first_image	= row.identifying_images.split(' | ')[0]
				const full_url		= page_globals.__WEB_MEDIA_BASE_URL__ + first_image
				const thumb_url		= full_url.replace('/1.5MB/', '/thumb/')

				const thumb_img = common.create_dom_element({
					element_type	: "img",
					class_name		: "image thumb",
					src				: thumb_url,
					title			: row.title || '',
					loading			: 'lazy',
					parent			: image_wrapper
				})
				thumb_img.alt = row.title || ''
				thumb_img.addEventListener('load', function(){
					thumb_img.classList.add('is_loaded')
				})

				const dating = [row.dating_start, row.dating_end].filter(Boolean).join(' - ') || row.dating
				if (dating) {
					common.create_dom_element({
						element_type	: "span",
						class_name		: "documentation_card_dating",
						text_content	: dating,
						parent			: image_wrapper
					})
				}
			}else{
				common.create_dom_element({
					element_type	: "i",
					class_name		: "fa fa-archive documentation_image_placeholder",
					parent			: image_wrapper
				})
			}

		const info_container = common.create_dom_element({
			element_type	: "div",
			class_name		: "info_container",
			parent			: card_link
		})

		const tag = variant==='fund' ? (tstring.fund || 'Fund') : (row.typology || row.name)

		// 'child' cards show the tag above the title, compact. Always reserves the
		// slot (see .documentation_card_tag.is_empty) so card heights stay uniform
			if (variant==='child') {
				const tag_el = common.create_dom_element({
					element_type	: "span",
					class_name		: "documentation_card_tag",
					text_content	: tag || '',
					parent			: info_container
				})
				if (!tag) {
					tag_el.classList.add('is_empty')
				}
			}

		// title . see resolve_title
			const display_title = this.resolve_title(row, options && options.parent_title) || ('ID ' + id)
			common.create_dom_element({
				element_type	: "div",
				class_name		: "documentation_title",
				text_content	: display_title,
				parent			: info_container
			})

		if (variant==='fund') {

			common.create_dom_element({
				element_type	: "span",
				class_name		: "documentation_card_tag",
				text_content	: tag,
				parent			: info_container
			})

			const count_el = common.create_dom_element({
				element_type	: "span",
				class_name		: "documentation_item_count",
				parent			: info_container
			})
			this.annotate_child_count(row.term_id, count_el)

		}else{

			if (variant!=='child' && tag) {
				common.create_dom_element({
					element_type	: "span",
					class_name		: "documentation_card_tag",
					text_content	: tag,
					parent			: info_container
				})
			}

			// 'child' cards can have their own children too - same count badge as 'fund' cards
				if (variant==='child') {
					const count_el = common.create_dom_element({
						element_type	: "span",
						class_name		: "documentation_item_count",
						parent			: info_container
					})
					this.annotate_child_count(row.term_id, count_el)
				}
		}

		if (dedalo_logged===true) {
			const link = common.create_dom_element({
				element_type	: "a",
				class_name		: "go_to_dedalo",
				text_content	: '#' + id,
				href			: '/dedalo/core/page/?tipo=' + row.section_tipo + '&id=' + id,
				parent			: item_wrapper
			})
			link.setAttribute('target', '_blank');
		}

		return item_wrapper
	},//end draw_item



	/**
	* RESOLVE_TITLE
	* Falls back to 'name' when a record just inherited its parent's title verbatim
	* @param object row
	* @param string|null parent_title
	* @return string|null
	*/
	resolve_title : function(row, parent_title) {

		const title	= (row.title || '').trim()
		const parent	= (parent_title || '').trim()

		if (title && title.toLowerCase()!==parent.toLowerCase()) {
			return title
		}

		return row.name || null
	},//end resolve_title



	/**
	* RENDER_DETAIL
	* Full single-record view
	*/
	render_detail : function(row, has_error) {

		const container = this.rows_container

		while (container.hasChildNodes()) {
			container.removeChild(container.lastChild);
		}

		if (has_error) {
			common.create_dom_element({
				element_type	: "p",
				class_name		: "documentation_empty_state documentation_error_state",
				inner_html		: '<i class="fa fa-exclamation-triangle"></i> ' + (tstring.load_error || 'Something went wrong loading this record. Please try again.'),
				parent			: container
			})
			return
		}

		if (!row) {
			common.create_dom_element({
				element_type	: "p",
				class_name		: "documentation_empty_state",
				inner_html		: '<i class="fa fa-archive"></i> ' + (tstring.no_results || 'This record does not exist.'),
				parent			: container
			})
			return
		}

		const id = row.term_id.split('_').pop()

		const row_wrapper = common.create_dom_element({
			element_type	: "div",
			class_name		: "row_wrapper detail",
			parent			: container
		})

		// nav placeholder . filled in below once resolve_ancestors resolves
			const nav = common.create_dom_element({
				element_type	: "div",
				class_name		: "documentation_detail_nav",
				parent			: row_wrapper
			})

		// sibling nav placeholder . filled in below once fetch_children resolves
			const sibling_nav = common.create_dom_element({
				element_type	: "div",
				class_name		: "documentation_sibling_nav",
				parent			: row_wrapper
			})

		// title . the record's own title verbatim, not resolve_title's fallback - shown above the gallery
			common.create_dom_element({
				element_type	: "div",
				class_name		: "documentation_title",
				text_content	: (row.title || '').trim() || row.name || ('ID ' + id),
				parent			: row_wrapper
			})

		// images . a record's images can be split across two separate fields
		// (identifying_images_data plus images_data - confirmed live: a record
		// with 1 "identifying" image plus 2 more only in images_data). Kept as
		// two distinct groups instead of one merged gallery: identifying_images_data
		// is the "hero" set (usually just 1, occasionally more - shown big,
		// side by side rather than each stacked full-width so multiple hero
		// shots don't force a long scroll before the actual field data),
		// images_data is supporting material (shown as a compact thumbnail
		// strip below). If a record only has images_data (no identifying
		// image at all), that set is promoted to the hero slot instead so the
		// page never opens with nothing but tiny thumbnails.
			const self = this
			const lightbox_images = []

			const identifying_data	= row.identifying_images_data || []
			const secondary_data	= row.images_data || []
			const hero_data			= identifying_data.length>0 ? identifying_data : secondary_data
			const thumbnail_data	= identifying_data.length>0 ? secondary_data : []

			if (hero_data.length>0) {

				const gallery = common.create_dom_element({
					element_type	: "div",
					class_name		: "image_wrapper gallery",
					parent			: row_wrapper
				})

				hero_data.forEach(function(image_row){

					const figure = common.create_dom_element({
						element_type	: "figure",
						class_name		: "gallery_figure",
						parent			: gallery
					})

					const caption_text = [image_row.title, image_row.photographer].filter(Boolean).join(' — ')

					const image_el = common.create_dom_element({
						element_type	: "img",
						class_name		: "image gallery_image",
						src				: page_globals.__WEB_MEDIA_BASE_URL__ + image_row.image,
						title			: image_row.title || row.title || '',
						parent			: figure
					})
					image_el.alt = caption_text || row.title || ''
					image_el.addEventListener('load', function(){
						image_el.classList.add('is_loaded')
					})

					const lightbox_index = lightbox_images.length
					lightbox_images.push(Object.assign({ caption: caption_text }, self.resolve_lightbox_urls(image_row.image)))
					image_el.addEventListener('click', function(){
						self.open_lightbox(lightbox_images, lightbox_index)
					})
				})

				if (thumbnail_data.length>0) {

					const secondary = common.create_dom_element({
						element_type	: "div",
						class_name		: "gallery_secondary",
						parent			: row_wrapper
					})

					common.create_dom_element({
						element_type	: "span",
						class_name		: "gallery_secondary_label",
						text_content	: (tstring.more_images || 'More images') + ' (' + thumbnail_data.length + ')',
						parent			: secondary
					})

					const secondary_grid = common.create_dom_element({
						element_type	: "div",
						class_name		: "gallery_secondary_grid",
						parent			: secondary
					})

					thumbnail_data.forEach(function(image_row){

						const caption_text = [image_row.title, image_row.photographer].filter(Boolean).join(' — ')

						const thumb_el = common.create_dom_element({
							element_type	: "img",
							class_name		: "gallery_secondary_image",
							src				: page_globals.__WEB_MEDIA_BASE_URL__ + image_row.image,
							title			: image_row.title || row.title || '',
							parent			: secondary_grid
						})
						thumb_el.alt = caption_text || row.title || ''
						thumb_el.addEventListener('load', function(){
							thumb_el.classList.add('is_loaded')
						})

						const lightbox_index = lightbox_images.length
						lightbox_images.push(Object.assign({ caption: caption_text }, self.resolve_lightbox_urls(image_row.image)))
						thumb_el.addEventListener('click', function(){
							self.open_lightbox(lightbox_images, lightbox_index)
						})
					})

					// past 7 extra images, collapse to just the first row and offer a
					// "view all" toggle - same max-height expand/collapse choreography
					// as draw_description's reading control below, reusing its already
					// site-wide-button-proof .documentation_description_toggle style directly
					// rather than rebuilding it
					if (thumbnail_data.length>7) {

						const fade = common.create_dom_element({
							element_type	: "div",
							class_name		: "gallery_secondary_fade",
							parent			: secondary_grid
						})

						const toggle = common.create_dom_element({
							element_type	: "button",
							type			: "button",
							class_name		: "documentation_description_toggle gallery_secondary_toggle",
							text_content	: (tstring.view_all_images || 'View all images') + ' (' + thumbnail_data.length + ')',
							parent			: secondary
						})
						toggle.setAttribute('aria-expanded', 'false')

						requestAnimationFrame(function(){

							// row height measured from the real rendered layout (where the
							// second row's items first drop to a lower offsetTop), not a
							// fixed guess - correct regardless of viewport width/thumbnail size
							const items		= secondary_grid.children
							const first_top	= items[0].offsetTop
							let row_height	= secondary_grid.scrollHeight

							for (let i=1; i<items.length; i++) {
								if (items[i].offsetTop>first_top) {
									row_height = items[i].offsetTop - first_top
									break
								}
							}

							if (secondary_grid.scrollHeight <= row_height+1) {
								// everything already fits on one row at this width
								fade.remove()
								toggle.remove()
								return
							}

							secondary_grid.style.maxHeight = row_height + 'px'

							let expanded = false

							toggle.addEventListener('click', function(){

								expanded = !expanded

								if (expanded) {
									secondary_grid.style.maxHeight = secondary_grid.scrollHeight + 'px'
									secondary_grid.classList.add('is_expanded')
									toggle.textContent	= tstring.show_less || 'Show less'
									toggle.setAttribute('aria-expanded', 'true')
								}else{
									// pin to the current full height first (no visual jump),
									// force layout, then drop to the collapsed row height on
									// the next frame so that step is what actually animates
									secondary_grid.style.maxHeight = secondary_grid.scrollHeight + 'px'
									secondary_grid.getBoundingClientRect()
									requestAnimationFrame(function(){
										secondary_grid.classList.remove('is_expanded')
										secondary_grid.style.maxHeight = row_height + 'px'
									})
									toggle.textContent	= (tstring.view_all_images || 'View all images') + ' (' + thumbnail_data.length + ')'
									toggle.setAttribute('aria-expanded', 'false')
								}
							})

							secondary_grid.addEventListener('transitionend', function(e){
								if (e.propertyName==='max-height' && expanded) {
									secondary_grid.style.maxHeight = 'none'
								}
							})
						})
					}
				}

			}else if (row.identifying_images && row.identifying_images.length>0) {

				// fallback, used if the images portal resolves empty
					const image_paths = row.identifying_images.split(' | ')

					const gallery = common.create_dom_element({
						element_type	: "div",
						class_name		: "image_wrapper gallery",
						parent			: row_wrapper
					})

					image_paths.forEach(function(image_path){

						const image_el = common.create_dom_element({
							element_type	: "img",
							class_name		: "image gallery_image",
							src				: page_globals.__WEB_MEDIA_BASE_URL__ + image_path,
							title			: row.title || '',
							parent			: gallery
						})
						image_el.alt = row.title || ''
						image_el.addEventListener('load', function(){
							image_el.classList.add('is_loaded')
						})

						const lightbox_index = lightbox_images.length
						lightbox_images.push(Object.assign({ caption: row.title || '' }, self.resolve_lightbox_urls(image_path)))
						image_el.addEventListener('click', function(){
							self.open_lightbox(lightbox_images, lightbox_index)
						})
					})
			}

		const info_container = common.create_dom_element({
			element_type	: "div",
			class_name		: "info_container",
			parent			: row_wrapper
		})

		if (dedalo_logged===true) {
			const link = common.create_dom_element({
				element_type	: "a",
				class_name		: "go_to_dedalo",
				text_content	: (tstring.edit || 'Edit') + ' #' + id,
				href			: '/dedalo/core/page/?tipo=' + row.section_tipo + '&id=' + id,
				parent			: info_container
			})
			link.setAttribute('target', '_blank');
		}

		this.draw_fields(info_container, row)

		this.add_field(info_container, tstring.recovery_mode || 'Recovery mode', row.recovery_mode)
		this.add_field(info_container, tstring.recovery_place || 'Recovery place', row.recovery_place)
		this.add_field(info_container, tstring.recovery_date || 'Recovery date', row.recovery_date)
		this.add_field(info_container, tstring.source || 'Source', [row.source_name, row.source_surname].filter(Boolean).join(' '))
		this.add_field(info_container, tstring.author || 'Author', row.author)
		this.add_field(info_container, tstring.manufacturer || 'Manufacturer', row.manufacturer)
		this.add_long_field(info_container, tstring.inscriptions || 'Inscriptions', row.inscriptions)

		this.draw_bibliography(info_container, tstring.own_bibliography || 'Own bibliography', row.own_bibliography_data)
		this.draw_bibliography(info_container, tstring.related_bibliography || 'Related bibliography', row.related_bibliography_data)

		this.draw_publications(info_container, row.publications_data)

		this.draw_description(row_wrapper, row)
		this.draw_documents(row_wrapper, row)

		this.draw_contents(row_wrapper, row)
		this.draw_related_items(row_wrapper, row)
		this.draw_related_coins(row_wrapper, row)
		this.draw_sibling_nav(sibling_nav, row)

		// back link + breadcrumb, once the ancestor chain resolves. Cached by
		// immediate parent term_id (same key draw_sibling_nav's own
		// sibling_list_cache uses) - every sibling in a group shares the exact
		// same ancestor chain, so without this, an otherwise-instant Previous/Next
		// step would still leave the breadcrumb empty for a moment on every single
		// click, popping in afterwards and shifting the gallery/fields below it
			const parent_term_id = self.resolve_parent_term_id(row)

			self.ancestors_cache = self.ancestors_cache || {}
			if (parent_term_id) {
				self.ancestors_cache[parent_term_id] = self.ancestors_cache[parent_term_id] || self.resolve_ancestors(row.parent_data)
			}

			const ancestors_promise = parent_term_id ? self.ancestors_cache[parent_term_id] : self.resolve_ancestors(row.parent_data)

			ancestors_promise.then(function(ancestors){
				self.draw_breadcrumb(nav, ancestors)
			})
	},//end render_detail



	/**
	* RESOLVE_PARENT_TERM_ID
	* This row's own immediate parent term_id, parsed from its raw parent_data -
	* the same value fetch_children/resolve_ancestors/draw_sibling_nav all key
	* off, so it's pulled out once here rather than re-parsed in each of them
	* @param object row
	* @return string|null
	*/
	resolve_parent_term_id : function(row) {

		let parent_ids = []
		try { parent_ids = JSON.parse(row.parent_data || '[]') } catch(e) { /* malformed */ }

		return parent_ids[0] || null
	},//end resolve_parent_term_id



	/**
	* DRAW_SIBLING_NAV
	* First/previous/next/last among this record's siblings (same immediate
	* parent), plus a "go to number" jump - lets someone flip through a set of
	* index cards without going back to the Contenido grid each time. Reuses
	* fetch_children against the parent's own term_id, same set and order the
	* parent page's own Contenido grid shows, so position numbers line up with
	* the ordinal shown there. Previous/Next are prefetched (see prefetch_sibling)
	* so the common case - stepping one at a time - renders instantly instead of
	* waiting on a fresh request each click; First/Last/jump stay plain
	* navigations since prefetching every possible target isn't worth it.
	* The sibling list itself is cached by parent term_id (see sibling_list_cache)
	* - stepping through the same group would otherwise re-fetch and briefly
	* empty this whole bar on every click, which reads as a flicker/jump since
	* the gallery directly below it shifts up and back down with it
	* @param object container
	* @param object row
	*/
	draw_sibling_nav : function(container, row) {

		const self = this

		const parent_term_id = self.resolve_parent_term_id(row)
		if (!parent_term_id) {
			return
		}

		self.sibling_list_cache = self.sibling_list_cache || {}
		self.sibling_list_cache[parent_term_id] = self.sibling_list_cache[parent_term_id] || self.fetch_children(parent_term_id)

		self.sibling_list_cache[parent_term_id].then(function(siblings){

			if (!siblings || siblings.length<2) {
				return
			}

			const index = siblings.findIndex(function(sibling_row){
				return sibling_row.term_id===row.term_id
			})
			if (index===-1) {
				return
			}

			const first_row	= siblings[0]
			const prev_row		= index>0 ? siblings[index-1] : null
			const next_row		= (index<siblings.length-1) ? siblings[index+1] : null
			const last_row		= siblings[siblings.length-1]
			const detail_url_prefix = page_globals.__WEB_ROOT_WEB__ + '/documentation/'

			function sibling_url(sibling_row) {
				return detail_url_prefix + sibling_row.term_id.split('_').pop()
			}

			// icon-only first/last - secondary actions, kept out of the way of
			// the primary previous/next pair
				function draw_edge_link(class_name, icon_class, label, target_row) {
					const active = target_row && target_row.term_id!==row.term_id
					const el = common.create_dom_element({
						element_type	: active ? "a" : "span",
						class_name		: "documentation_sibling_link " + class_name + (active ? "" : " is_disabled"),
						href			: active ? sibling_url(target_row) : null,
						inner_html		: '<i class="fa ' + icon_class + '"></i>',
						parent			: container
					})
					el.setAttribute('aria-label', label)
					return el
				}

			draw_edge_link('documentation_sibling_first', 'fa-angle-double-left', tstring.first || 'First', first_row)

			// previous - prefetched, click hijacked to render from cache once ready
				if (prev_row) {
					self.prefetch_sibling(prev_row.term_id)
					const prev_link = common.create_dom_element({
						element_type	: "a",
						class_name		: "documentation_sibling_link documentation_sibling_prev",
						href			: sibling_url(prev_row),
						inner_html		: '<i class="fa fa-chevron-left"></i> ' + (tstring.prev || 'Previous'),
						parent			: container
					})
					self.bind_instant_nav(prev_link, prev_row.term_id)
				}else{
					common.create_dom_element({
						element_type	: "span",
						class_name		: "documentation_sibling_link documentation_sibling_prev is_disabled",
						inner_html		: '<i class="fa fa-chevron-left"></i> ' + (tstring.prev || 'Previous'),
						parent			: container
					})
				}

			// position . "N / total", N editable to jump straight to that item
				const position = common.create_dom_element({
					element_type	: "span",
					class_name		: "documentation_sibling_position",
					parent			: container
				})

				const jump_input = common.create_dom_element({
					element_type	: "input",
					type			: "number",
					class_name		: "documentation_sibling_jump",
					value			: String(index+1),
					parent			: position
				})
				jump_input.setAttribute('min', '1')
				jump_input.setAttribute('max', String(siblings.length))
				jump_input.setAttribute('aria-label', tstring.go_to_item || 'Go to item number')

				common.create_dom_element({
					element_type	: "span",
					text_content	: '/ ' + siblings.length,
					parent			: position
				})

				function jump_to_typed_value() {
					let target = parseInt(jump_input.value, 10)
					if (!target || target<1) { target = 1 }
					if (target>siblings.length) { target = siblings.length }

					const target_row = siblings[target-1]
					if (target_row && target_row.term_id!==row.term_id) {
						window.location.href = sibling_url(target_row)
					}
				}
				jump_input.addEventListener('keydown', function(e){
					if (e.key==='Enter') {
						e.preventDefault()
						jump_to_typed_value()
					}
				})
				jump_input.addEventListener('change', jump_to_typed_value)

			// next - prefetched, same instant-render treatment as previous
				if (next_row) {
					self.prefetch_sibling(next_row.term_id)
					const next_link = common.create_dom_element({
						element_type	: "a",
						class_name		: "documentation_sibling_link documentation_sibling_next",
						href			: sibling_url(next_row),
						inner_html		: (tstring.next || 'Next') + ' <i class="fa fa-chevron-right"></i>',
						parent			: container
					})
					self.bind_instant_nav(next_link, next_row.term_id)
				}else{
					common.create_dom_element({
						element_type	: "span",
						class_name		: "documentation_sibling_link documentation_sibling_next is_disabled",
						inner_html		: (tstring.next || 'Next') + ' <i class="fa fa-chevron-right"></i>',
						parent			: container
					})
				}

			draw_edge_link('documentation_sibling_last', 'fa-angle-double-right', tstring.last || 'Last', last_row)
		})
	},//end draw_sibling_nav



	/**
	* PREFETCH_SIBLING
	* Fetches a sibling's fully resolved row (same shape load_detail produces -
	* bibliography/images portals included) ahead of a click, so Previous/Next
	* can render instantly instead of waiting on a fresh request. Cached by
	* promise rather than resolved value, so a click landing mid-flight reuses
	* the in-flight request instead of firing a duplicate one
	* @param string term_id
	*/
	prefetch_sibling : function(term_id) {

		const self = this

		self.sibling_prefetch_cache = self.sibling_prefetch_cache || {}

		if (!term_id || self.sibling_prefetch_cache[term_id]) {
			return
		}

		self.sibling_prefetch_cache[term_id] = self.get_rows({
			limit		: 1,
			offset		: 0,
			sql_filter	: "term_id='" + term_id + "'"
		}).then(function(response){
			return (!response.error && response.rows[0]) || null
		})
	},//end prefetch_sibling



	/**
	* BIND_INSTANT_NAV
	* Hijacks a plain click on a sibling link to render from the prefetched
	* row instead of a full navigation, once it's ready. Modified clicks
	* (middle-click, ctrl/cmd/shift/alt+click) are left alone so "open in a
	* new tab" etc. still works normally
	* @param HTMLElement link
	* @param string term_id
	*/
	bind_instant_nav : function(link, term_id) {

		const self = this

		link.addEventListener('click', function(e){

			if (e.button!==0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
				return
			}
			e.preventDefault()

			self.prefetch_sibling(term_id)
			self.sibling_prefetch_cache[term_id].then(function(cached_row){
				if (cached_row) {
					self.go_to_row(cached_row)
				}else{
					window.location.href = link.href
				}
			})
		})
	},//end bind_instant_nav



	/**
	* GO_TO_ROW
	* Client-side transition to an already-fetched sibling row - no network
	* round-trip. Updates the URL (so reload/copy-link/back-button all still
	* work, see the popstate handler in set_up), then re-renders in place,
	* immediately and without touching scroll position - whatever part of the
	* record someone was reading stays exactly where it was. No fade here
	* (unlike load_list's pagination, which keeps its own .loading dip) -
	* nav/sibling-nav are cached (see ancestors_cache/sibling_list_cache) so
	* they update within the same paint instead of needing one to hide behind
	* @param object row
	*/
	go_to_row : function(row) {

		const self = this
		const id = row.term_id.split('_').pop()

		history.pushState({ term_id: row.term_id }, '', page_globals.__WEB_ROOT_WEB__ + '/documentation/' + id)
		self.section_id = id
		self.render_detail(row)
	},//end go_to_row



	/**
	* DRAW_FIELDS
	* Full label / value field list, detail view only. Title itself is the page's
	* own heading (see render_detail), so the field list starts right after it -
	* ID, collection, fund, typology, material, then description (the rest of the
	* record's own fields, then the remaining recovery/source/etc. fields render_detail
	* appends after this)
	* @param object info_container
	* @param object row
	*/
	draw_fields : function(info_container, row) {

		// ID . the record's own numeric section_id, same value the URL uses -
		// "ID" itself isn't translated anywhere in this app (coin_row.js uses
		// the same literal label), so no tstring lookup here either
			this.add_field(info_container, "ID", row.term_id.split('_').pop())

		this.add_field(info_container, tstring.collection || 'Collection', row.collection)
		this.add_field(info_container, tstring.fund || 'Fund', row.fund)
		this.add_field(info_container, tstring.typology || 'Typology', row.typology)
		this.add_field(info_container, tstring.material || 'Material', row.material)

		this.add_field(info_container, tstring.name || 'Name of the property', row.name)
		this.add_field(info_container, tstring.technique || 'Technique', row.technique)

		const dating = [row.dating_start, row.dating_end].filter(Boolean).join(' - ') || row.dating
		this.add_field(info_container, tstring.dating || 'Dating', dating)

		this.add_field(info_container, tstring.municipality || 'Municipality', row.municipality)
		this.add_field(info_container, tstring.curator || 'Curator', row.curator)
	},//end draw_fields



	/**
	* ADD_FIELD
	* Append a label/value pair to a container, skipping empty values
	*/
	add_field : function(container, label, value) {

		// strip Dédalo's leading/trailing "|" join artifact on multi-value term fields
			if (typeof value==='string') {
				value = value.replace(/^(\s*\|\s*)+/, '').replace(/(\s*\|\s*)+$/, '').trim()
			}

		if (!value || (typeof value==='string' && value.trim().length===0)) {
			return
		}

		common.create_dom_element({
			element_type	: "label",
			class_name		: "left-labels",
			text_content	: label,
			parent			: container
		})

		common.create_dom_element({
			element_type	: "span",
			class_name		: "rigth-values",
			inner_html		: value,
			parent			: container
		})
	},//end add_field



	/**
	* ADD_LONG_FIELD
	* Same empty-skip behavior as add_field, but for prose (description,
	* inscriptions) - a full-width block with the label read as a small
	* heading above, instead of squeezed into the label/value grid row
	* @param object container
	* @param string label
	* @param string value
	*/
	add_long_field : function(container, label, value) {

		if (typeof value==='string') {
			value = value.replace(/^(\s*\|\s*)+/, '').replace(/(\s*\|\s*)+$/, '').trim()
		}

		if (!value || (typeof value==='string' && value.trim().length===0)) {
			return
		}

		const field = common.create_dom_element({
			element_type	: "div",
			class_name		: "long_field",
			parent			: container
		})

		common.create_dom_element({
			element_type	: "span",
			class_name		: "long_field_label",
			text_content	: label,
			parent			: field
		})

		common.create_dom_element({
			element_type	: "p",
			class_name		: "long_field_value",
			inner_html		: value,
			parent			: field
		})
	},//end add_long_field



	/**
	* DRAW_BIBLIOGRAPHY
	* Render a resolved bibliographic_references portal, reusing the same
	* shared helper tpl/coin, tpl/mint, tpl/hoard and tpl/type use
	* @param object container
	* @param string label
	* @param array|null ar_biblio
	*/
	draw_bibliography : function(container, label, ar_biblio) {

		if (!ar_biblio || !ar_biblio.length) {
			return
		}

		common.create_dom_element({
			element_type	: "label",
			class_name		: "left-labels",
			text_content	: label,
			parent			: container
		})

		const bibliography_group = common.create_dom_element({
			element_type	: "div",
			class_name		: "vertical-group",
			parent			: container
		})

		for (let i = 0; i < ar_biblio.length; i++) {

			const biblio_row_node = biblio_row_fields.render_row_bibliography(ar_biblio[i])

			const biblio_row_wrapper = common.create_dom_element({
				element_type	: "div",
				class_name		: "rigth-values sub-vertical-group",
				parent			: bibliography_group
			})
			biblio_row_wrapper.appendChild(biblio_row_node)
		}
	},//end draw_bibliography



	/**
	* DRAW_PUBLICATIONS
	* Render a resolved 'publications' portal (different row shape than
	* bibliographic_references, so it gets a plain label/value line)
	* @param object container
	* @param array|null ar_publications
	*/
	draw_publications : function(container, ar_publications) {

		if (!ar_publications || !ar_publications.length) {
			return
		}

		common.create_dom_element({
			element_type	: "label",
			class_name		: "left-labels",
			text_content	: tstring.publications || 'Publications',
			parent			: container
		})

		const publications_group = common.create_dom_element({
			element_type	: "div",
			class_name		: "vertical-group",
			parent			: container
		})

		for (let i = 0; i < ar_publications.length; i++) {

			const publication	= ar_publications[i]
			const date			= publication.publication_date ? ' (' + publication.publication_date.split('-')[0] + ')' : ''
			const authors		= publication.authors ? publication.authors + '. ' : ''

			common.create_dom_element({
				element_type	: "div",
				class_name		: "rigth-values sub-vertical-group",
				inner_html		: authors + (publication.title || '') + date,
				parent			: publications_group
			})
		}
	},//end draw_publications



	/**
	* DRAW_DESCRIPTION
	* Render a record's description as its own archival-paper block (see
	* .documentation_description_paper in archive.css) instead of a plain
	* add_long_field line - warm parchment tone, serif type, drop cap, and a
	* collapse/expand reading control once the text is long enough to need one.
	* The full text is always in the DOM (never truncated); collapsing is
	* purely visual via max-height, so nothing is lost to search/copy/SEO.
	* @param object row_wrapper
	* @param object row
	*/
	draw_description : function(row_wrapper, row) {

		let value = row.description
		if (typeof value==='string') {
			value = value.trim()
		}
		if (!value) {
			return
		}

		const section = common.create_dom_element({
			element_type	: "div",
			class_name		: "documentation_description_section",
			parent			: row_wrapper
		})

		common.create_dom_element({
			element_type	: "span",
			class_name		: "documentation_description_label",
			text_content	: tstring.description || 'Description',
			parent			: section
		})

		const paper = common.create_dom_element({
			element_type	: "div",
			class_name		: "documentation_description_paper",
			parent			: section
		})

		common.create_dom_element({
			element_type	: "p",
			class_name		: "documentation_description_text",
			inner_html		: value,
			parent			: paper
		})

		common.create_dom_element({
			element_type	: "div",
			class_name		: "documentation_description_fade",
			parent			: paper
		})

		const toggle = common.create_dom_element({
			element_type	: "button",
			type			: "button",
			class_name		: "documentation_description_toggle",
			text_content	: tstring.read_full_description || 'Read full description',
			parent			: section
		})
		toggle.setAttribute('aria-expanded', 'false')

		// only the reader controls know the paper's real rendered height, so
		// this decides - after layout, next frame - whether the text even
		// needs collapsing at all; short descriptions just render in full
		// with no toggle/fade clutter
		requestAnimationFrame(function(){

			const overflowing = paper.scrollHeight > paper.clientHeight + 1

			if (!overflowing) {
				paper.classList.add('is_expanded')
				toggle.remove()
				return
			}

			let expanded = false

			toggle.addEventListener('click', function(){

				expanded = !expanded

				if (expanded) {
					paper.style.maxHeight = paper.scrollHeight + 'px'
					paper.classList.add('is_expanded')
					toggle.textContent	= tstring.show_less || 'Show less'
					toggle.setAttribute('aria-expanded', 'true')
				}else{
					// pin to the current full height first (no visual jump),
					// force layout, then drop to the collapsed CSS max-height
					// on the next frame so that step is what actually animates
					paper.style.maxHeight = paper.scrollHeight + 'px'
					paper.getBoundingClientRect()
					requestAnimationFrame(function(){
						paper.classList.remove('is_expanded')
						paper.style.maxHeight = ''
					})
					toggle.textContent	= tstring.read_full_description || 'Read full description'
					toggle.setAttribute('aria-expanded', 'false')
				}
			})

			// once fully open, let the page reflow naturally past this block
			// (responsive text reflow, window resize) instead of staying
			// capped at the scrollHeight snapshot taken at expand-time
			paper.addEventListener('transitionend', function(e){
				if (e.propertyName==='max-height' && expanded) {
					paper.style.maxHeight = 'none'
				}
			})
		})
	},//end draw_description



	/**
	* DRAW_DOCUMENTS
	* Render a record's own attached PDFs (row.documents - a raw JSON array of
	* file paths, parallel to row.documents_titles for their labels - not a
	* resolved portal, same as the 'items' field draw_related_items handles).
	* Its own section (like draw_contents/draw_related_items below), not a
	* field squeezed into the info_container label/value grid - that grid's
	* align-items:baseline was aligning the label against the card's text
	* baseline instead of its top edge, making the two drift apart as soon as
	* a title wrapped to more than one line
	* @param object row_wrapper
	* @param object row
	*/
	draw_documents : function(row_wrapper, row) {

		let paths	= []
		let titles	= []
		try { paths	= JSON.parse(row.documents || '[]') } catch(e) { /* malformed, no documents */ }
		try { titles	= JSON.parse(row.documents_titles || '[]') } catch(e) { /* malformed, fall back to filenames below */ }

		if (!paths.length) {
			return
		}

		const section = common.create_dom_element({
			element_type	: "div",
			class_name		: "documentation_documents_section",
			parent			: row_wrapper
		})

		common.create_dom_element({
			element_type	: "span",
			class_name		: "documentation_documents_label",
			text_content	: tstring.documents || 'Documents',
			parent			: section
		})

		const list = common.create_dom_element({
			element_type	: "div",
			class_name		: "documentation_documents_list",
			parent			: section
		})

		paths.forEach(function(path, i){

			const doc_title	= titles[i] || path.split('/').pop()

			const card = common.create_dom_element({
				element_type	: "a",
				class_name		: "documentation_document",
				href			: page_globals.__WEB_MEDIA_BASE_URL__ + path,
				target			: "_blank",
				title			: (tstring.download || 'Download') + ': ' + doc_title,
				parent			: list
			})
			card.setAttribute('rel', 'noopener')

			common.create_dom_element({
				element_type	: "i",
				class_name		: "fa fa-file-pdf-o documentation_document_icon",
				parent			: card
			})

			common.create_dom_element({
				element_type	: "span",
				class_name		: "documentation_document_title",
				text_content	: doc_title,
				parent			: card
			})
		})
	},//end draw_documents



	/**
	* RESOLVE_ANCESTORS
	* Walks the ancestor chain by hand (get_rows can't resolve parent_data
	* server-side - see get_rows): fetch the immediate parent's own row,
	* then repeat using its parent_data, until there isn't one left
	* @param string|null parent_data . the starting row's own raw parent_data
	* @return promise : array of {term_id, title, name}, root-to-immediate-parent
	*/
	resolve_ancestors : function(parent_data) {

		const self = this

		function step(raw_parent_data) {

			let parent_ids = []
			try { parent_ids = JSON.parse(raw_parent_data || '[]') } catch(e){ /* malformed, treat as root */ }

			if (!parent_ids.length) {
				return Promise.resolve([])
			}

			// ROOT_TERM_ID is itself a real 'documentation' row (title "Archivo"), but it's
			// a structural anchor, not a navigable ancestor - stop here so a fund's back link
			// (and top-of-chain breadcrumb) points at the browse landing, not at ROOT's own
			// (filter-less) detail page
				if (parent_ids[0]===self.ROOT_TERM_ID) {
					return Promise.resolve([])
				}

			return self.get_rows({
				limit		: 1,
				offset		: 0,
				sql_filter	: "term_id='" + parent_ids[0] + "'"
			})
			.then(function(response){

				const parent_row = response.rows[0]
				if (!parent_row) {
					return []
				}

				// resolve everything above this parent first, so its own title
				// can be checked against ITS parent (see resolve_title)
					return step(parent_row.parent_data).then(function(higher_ancestors){

						const grandparent = higher_ancestors[higher_ancestors.length-1]

						higher_ancestors.push({
							term_id	: parent_row.term_id,
							title	: self.resolve_title(parent_row, grandparent && grandparent.title) || parent_row.title,
							name	: parent_row.name
						})
						return higher_ancestors
					})
			})
		}

		return step(parent_data)
	},//end resolve_ancestors



	/**
	* DRAW_BREADCRUMB
	* Render the record's ancestor chain, already resolved root-to-immediate-
	* parent by resolve_ancestors. Stops at the immediate parent - the current
	* record's own title isn't repeated here, it's already the big heading
	* right under the images
	* @param object nav
	* @param array ancestors
	*/
	draw_breadcrumb : function(nav, ancestors) {

		if (!ancestors.length) {
			return
		}

		const breadcrumb = common.create_dom_element({
			element_type	: "nav",
			class_name		: "documentation_breadcrumb",
			parent			: nav
		})

		common.create_dom_element({
			element_type	: "i",
			class_name		: "fa fa-archive documentation_breadcrumb_icon",
			parent			: breadcrumb
		})

		ancestors.forEach(function(ancestor, index){

			const ancestor_id = ancestor.term_id.split('_').pop()

			common.create_dom_element({
				element_type	: "a",
				class_name		: "documentation_breadcrumb_link",
				text_content	: ancestor.title,
				href			: page_globals.__WEB_ROOT_WEB__ + '/documentation/' + ancestor_id,
				parent			: breadcrumb
			})

			if (index<ancestors.length-1) {
				common.create_dom_element({
					element_type	: "i",
					class_name		: "fa fa-angle-right documentation_breadcrumb_separator",
					parent			: breadcrumb
				})
			}
		})
	},//end draw_breadcrumb



	/**
	* FETCH_CHILDREN
	* Records whose parent_data points back at term_id - the only way to
	* find a record's "children". limit:500 covers the largest group found
	* in the live data so far (298). Sorted by numeric id after fetching - the
	* API doesn't guarantee row order matches term_id order (confirmed live:
	* two siblings came back with the higher id before the lower one), and
	* draw_sibling_nav/draw_contents both depend on this being a stable,
	* logical sequence for position numbers and Previous/Next to make sense
	* @param string term_id
	* @return promise : array of rows
	*/
	fetch_children : function(term_id) {

		return data_manager.request({
			body : {
				dedalo_get	: 'records',
				table		: 'documentation',
				ar_fields	: ['*'],
				sql_filter	: 'parent_data LIKE \'%"' + term_id + '"%\'',
				limit		: 500
			}
		})
		.then(function(api_response){

			const rows = api_response.result || []

			rows.sort(function(a, b){
				return parseInt(a.term_id.split('_').pop(), 10) - parseInt(b.term_id.split('_').pop(), 10)
			})

			return rows
		})
	},//end fetch_children



	/**
	* DRAW_CONTENTS
	* This record's direct children as a plain grid of cards, each linking
	* to that child's own page (which has its own contents grid in turn).
	* Past a handful of children, a live search box also filters the grid
	* @param object row_wrapper
	* @param object row
	*/
	draw_contents : function(row_wrapper, row) {

		const self = this

		self.fetch_children(row.term_id).then(function(children){

			if (!children.length) {
				return
			}

			const section = common.create_dom_element({
				element_type	: "div",
				class_name		: "documentation_contents_section",
				parent			: row_wrapper
			})

			common.create_dom_element({
				element_type	: "h3",
				class_name		: "documentation_contents_title",
				inner_html		: '<i class="fa fa-folder-open"></i> ' + (tstring.contents || 'Contents') + ' (' + children.length + ')',
				parent			: section
			})

			let filter_input = null
			if (children.length>12) {
				filter_input = common.create_dom_element({
					element_type	: "input",
					type			: "text",
					class_name		: "documentation_contents_filter",
					placeholder		: tstring.search_contents || 'Search within these items...',
					parent			: section
				})
			}

			const grid = common.create_dom_element({
				element_type	: "div",
				class_name		: "documentation_contents_grid",
				parent			: section
			})

			const empty_state = common.create_dom_element({
				element_type	: "p",
				class_name		: "documentation_empty_state hide",
				inner_html		: '<i class="fa fa-search"></i> ' + (tstring.no_results || 'No records found.'),
				parent			: section
			})

			const entries = children.map(function(child_row){

				const display_title	= self.resolve_title(child_row, row.title) || ''
				const search_text		= [display_title, child_row.name, child_row.typology].filter(Boolean).join(' ').toLowerCase()

				const card = self.draw_item(child_row, {
					variant			: 'child',
					parent_title	: row.title
				})
				grid.appendChild(card)

				return { card: card, search_text: search_text }
			})

			if (filter_input) {
				filter_input.addEventListener('input', function(){

					const query		= filter_input.value.trim().toLowerCase()
					let visible_count	= 0

					entries.forEach(function(entry){
						const match = !query || entry.search_text.indexOf(query)>-1
						entry.card.classList.toggle('hide', !match)
						if (match) {
							visible_count++
						}
					})

					empty_state.classList.toggle('hide', visible_count>0)
				})
			}
		})
	},//end draw_contents



	/**
	* FETCH_RELATED_ITEMS
	* Resolves a record's own 'items' field - a raw array of OTHER
	* documentation records' section_ids (confirmed live: a "Ficha moneda"
	* card and its accompanying "Fotografía" scans all cross-reference each
	* other's section_ids this way, despite all being plain siblings under
	* the same parent - parent_data/fetch_children has no idea they're
	* related to each other specifically, only that they share a parent).
	* Not a real portal field (resolve_portals_custom errors on it), so this
	* fetches the actual rows itself, same approach as fetch_related_coins
	* @param array items_ids : numeric section_ids
	* @return promise : array of rows
	*/
	fetch_related_items : function(items_ids) {

		// section_ids only, never raw user/API strings - this goes straight
		// into a SQL IN(...) list below with no quoting
			const safe_ids = (items_ids || [])
				.map(function(id){ return parseInt(id, 10) })
				.filter(function(id){ return Number.isFinite(id) })

		if (!safe_ids.length) {
			return Promise.resolve([])
		}

		return data_manager.request({
			body : {
				dedalo_get	: 'records',
				table		: 'documentation',
				ar_fields	: ['*'],
				sql_filter	: 'section_id IN (' + safe_ids.join(',') + ')',
				limit		: 500
			}
		})
		.then(function(api_response){
			return api_response.result || []
		})
	},//end fetch_related_items



	/**
	* DRAW_RELATED_ITEMS
	* This record's cross-referenced siblings (see fetch_related_items) - full
	* cards, same draw_item('child') component draw_contents uses below, just
	* under its own quieter muted label instead of draw_contents' bold heading
	* @param object row_wrapper
	* @param object row
	*/
	draw_related_items : function(row_wrapper, row) {

		const self = this

		let items_ids = []
		try { items_ids = JSON.parse(row.items || '[]') } catch(e) { /* malformed, no items */ }

		self.fetch_related_items(items_ids).then(function(items){

			if (!items.length) {
				return
			}

			const section = common.create_dom_element({
				element_type	: "div",
				class_name		: "documentation_related_items_section",
				parent			: row_wrapper
			})

			common.create_dom_element({
				element_type	: "span",
				class_name		: "documentation_related_items_label",
				text_content	: (tstring.related_items || 'Related items') + ' (' + items.length + ')',
				parent			: section
			})

			const grid = common.create_dom_element({
				element_type	: "div",
				class_name		: "documentation_contents_grid",
				parent			: section
			})

			items.forEach(function(item_row){
				grid.appendChild( self.draw_item(item_row, { variant: 'child', parent_title: row.title }) )
			})
		})
	},//end draw_related_items



	/**
	* FETCH_RELATED_COINS
	* Coins whose related_heritage_data points back at this record's term_id -
	* the reverse of fetch_children's LIKE-filter approach, against 'coins' instead
	* of 'documentation'
	* @param string term_id
	* @return promise : array of rows
	*/
	fetch_related_coins : function(term_id) {

		return data_manager.request({
			body : {
				dedalo_get	: 'records',
				table		: 'coins',
				ar_fields	: ['section_id', 'mint_name', 'type', 'number', 'collection', 'image_obverse', 'image_reverse'],
				sql_filter	: 'related_heritage_data LIKE \'%"' + term_id + '"%\'',
				limit		: 100
			}
		})
		.then(function(api_response){
			return api_response.result || []
		})
	},//end fetch_related_coins



	/**
	* DRAW_RELATED_COIN_ITEM
	* One card in the related-coins grid: obverse/reverse thumbnails + a mint/type
	* label, linking out (new tab, same convention as the fund/search cards in
	* draw_item) to that coin's own page
	* @param object coin
	* @return HTMLElement
	*/
	draw_related_coin_item : function(coin) {

		const card = common.create_dom_element({
			element_type	: "a",
			class_name		: "related_coin_item row_wrapper",
			href			: page_globals.__WEB_ROOT_WEB__ + '/coin/' + coin.section_id,
			target			: "_blank"
		})
		card.setAttribute('rel', 'noopener')

		const images = common.create_dom_element({
			element_type	: "div",
			class_name		: "related_coin_images",
			parent			: card
		})

		if (coin.image_obverse) {
			const obverse_img = common.create_dom_element({
				element_type	: "img",
				class_name		: "image",
				src				: page_globals.__WEB_MEDIA_BASE_URL__ + coin.image_obverse,
				loading			: "lazy",
				parent			: images
			})
			obverse_img.alt = [coin.mint_name, tstring.obverse || 'Obverse'].filter(Boolean).join(' — ')
		}
		if (coin.image_reverse) {
			const reverse_img = common.create_dom_element({
				element_type	: "img",
				class_name		: "image",
				src				: page_globals.__WEB_MEDIA_BASE_URL__ + coin.image_reverse,
				loading			: "lazy",
				parent			: images
			})
			reverse_img.alt = [coin.mint_name, tstring.reverse || 'Reverse'].filter(Boolean).join(' — ')
		}

		const info = common.create_dom_element({
			element_type	: "div",
			class_name		: "related_coin_info",
			parent			: card
		})

		if (coin.mint_name) {
			common.create_dom_element({
				element_type	: "span",
				class_name		: "related_coin_mint",
				text_content	: coin.mint_name,
				parent			: info
			})
		}

		const secondary = [coin.type, coin.number].filter(Boolean).join(' | ')
		if (secondary) {
			common.create_dom_element({
				element_type	: "span",
				class_name		: "related_coin_secondary",
				text_content	: secondary,
				parent			: info
			})
		}

		return card
	},//end draw_related_coin_item



	/**
	* DRAW_RELATED_COINS
	* Coins that reference this documentation record (via related_heritage_data) -
	* same section shape as draw_contents: a heading with the count, then a card grid
	* @param object row_wrapper
	* @param object row
	*/
	draw_related_coins : function(row_wrapper, row) {

		const self = this

		self.fetch_related_coins(row.term_id).then(function(coins){

			if (!coins.length) {
				return
			}

			const section = common.create_dom_element({
				element_type	: "div",
				class_name		: "documentation_related_coins_section",
				parent			: row_wrapper
			})

			common.create_dom_element({
				element_type	: "h3",
				class_name		: "documentation_contents_title",
				inner_html		: '<i class="fa fa-money"></i> ' + (tstring.coins || 'Coins') + ' (' + coins.length + ')',
				parent			: section
			})

			const grid = common.create_dom_element({
				element_type	: "div",
				class_name		: "documentation_related_coins_grid",
				parent			: section
			})

			coins.forEach(function(coin){
				grid.appendChild( self.draw_related_coin_item(coin) )
			})
		})
	},//end draw_related_coins



	/**
	* RESOLVE_LIGHTBOX_URLS
	* Thumbnails/hero images stay on the 1.5MB variant, but the lightbox (full
	* view) tries "modified" first, then "original", then back to the same
	* 1.5MB variant already known to exist - see open_lightbox's load_image
	* for the actual fallback chain
	* @param string raw_image_path : e.g. /dedalo/media/image/1.5MB/464000/x.jpg
	* @return object {src, fallback_src, last_resort_src}
	*/
	resolve_lightbox_urls : function(raw_image_path) {

		const full_url = page_globals.__WEB_MEDIA_BASE_URL__ + raw_image_path

		return {
			src				: full_url.replace('/1.5MB/', '/modified/'),
			fallback_src	: full_url.replace('/1.5MB/', '/original/'),
			last_resort_src	: full_url
		}
	},//end resolve_lightbox_urls



	/**
	* OPEN_LIGHTBOX
	* Full-screen zoom/pan image viewer for the detail page gallery. Wheel or
	* pinch to zoom (centered on the cursor/pinch midpoint), drag to pan once
	* zoomed in, double-click/double-tap to toggle zoom, arrow keys or on-screen
	* buttons to move between images, Escape or a click on the backdrop to close.
	* No third-party lightbox exists anywhere in this app to reuse (jquery.poptrox
	* is bundled but fully disconnected - never enqueued, its activation code is
	* commented out - and the custom image_gallery module it was replaced by is
	* hardcoded to obverse/reverse coin pairs), so this is purpose-built
	* @param array images : [{src, caption}]
	* @param number start_index
	*/
	open_lightbox : function(images, start_index) {

		if (!images || !images.length) {
			return
		}

		const MIN_SCALE = 1
		const MAX_SCALE = 4

		const state = {
			index				: start_index || 0,
			scale				: 1,
			x					: 0,
			y					: 0,
			dragging			: false,
			drag_start_x		: 0,
			drag_start_y		: 0,
			start_x				: 0,
			start_y				: 0,
			pointers			: new Map(),
			pinch_start_distance	: 0,
			pinch_start_scale	: 1
		}

		const previous_overflow = document.body.style.overflow
		document.body.style.overflow = 'hidden'

		// restore focus to whatever opened the lightbox (a gallery image) once closed
			const previously_focused_element = document.activeElement

		const overlay = common.create_dom_element({
			element_type	: "div",
			class_name		: "documentation_lightbox"
		})
		overlay.setAttribute('role', 'dialog')
		overlay.setAttribute('aria-modal', 'true')
		overlay.tabIndex = -1

		const stage = common.create_dom_element({
			element_type	: "div",
			class_name		: "documentation_lightbox_stage",
			parent			: overlay
		})

		const img = common.create_dom_element({
			element_type	: "img",
			class_name		: "documentation_lightbox_image",
			parent			: stage
		})

		// the placeholder (see load_image) now covers the old spinner's job for the
		// normal case, so it starts hidden - kept in the DOM rather than removed
		// entirely in case a future path still needs a blocking loading state
		const spinner = common.create_dom_element({
			element_type	: "div",
			class_name		: "documentation_lightbox_spinner hide",
			parent			: stage
		})

		const caption = common.create_dom_element({
			element_type	: "div",
			class_name		: "documentation_lightbox_caption",
			parent			: overlay
		})

		let prev_button = null
		let next_button = null
		if (images.length>1) {
			prev_button = common.create_dom_element({
				element_type	: "button",
				type			: "button",
				class_name		: "documentation_lightbox_nav documentation_lightbox_prev",
				inner_html		: '<i class="fa fa-chevron-left"></i>',
				parent			: overlay
			})
			prev_button.setAttribute('aria-label', tstring.prev || 'Previous')

			next_button = common.create_dom_element({
				element_type	: "button",
				type			: "button",
				class_name		: "documentation_lightbox_nav documentation_lightbox_next",
				inner_html		: '<i class="fa fa-chevron-right"></i>',
				parent			: overlay
			})
			next_button.setAttribute('aria-label', tstring.next || 'Next')
		}

		// apply_transform . reflects state.x/y/scale onto the image. Transitions
		// are only enabled for discrete jumps (wheel step, double-click, nav) -
		// live drag/pinch apply instantly so the image tracks the pointer 1:1
			function apply_transform(animate) {
				img.style.transition = animate ? 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)' : 'none'
				img.style.transform  = 'translate(' + state.x + 'px, ' + state.y + 'px) scale(' + state.scale + ')'
				img.style.cursor     = state.scale>1 ? (state.dragging ? 'grabbing' : 'grab') : 'zoom-in'
			}

		// clamp_pan . keeps panning proportional to how far zoomed in the image
		// is, regardless of whether the scaled image has actually overflowed the
		// viewport yet - comparing against the viewport instead (as opposed to the
		// image's own unscaled footprint) would leave panning dead at any zoom
		// level where object-fit:contain still happens to fit inside it
			function clamp_pan() {
				const rect = img.getBoundingClientRect()

				const max_x = rect.width  * (1 - 1/state.scale) / 2
				const max_y = rect.height * (1 - 1/state.scale) / 2

				state.x = Math.min(max_x, Math.max(-max_x, state.x))
				state.y = Math.min(max_y, Math.max(-max_y, state.y))
			}

		// set_scale . zoom around a given viewport point (page coordinates),
		// clamped to [MIN_SCALE, MAX_SCALE], keeping that point visually fixed
			function set_scale(new_scale, origin_x, origin_y) {

				const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, new_scale))
				if (clamped===state.scale) {
					return
				}

				const stage_rect	= stage.getBoundingClientRect()
				const cx			= (typeof origin_x==='number') ? (origin_x - stage_rect.left - stage_rect.width/2)  : 0
				const cy			= (typeof origin_y==='number') ? (origin_y - stage_rect.top  - stage_rect.height/2) : 0

				const ratio = clamped / state.scale
				state.x = cx - (cx - state.x) * ratio
				state.y = cy - (cy - state.y) * ratio
				state.scale = clamped

				if (state.scale===MIN_SCALE) {
					state.x = 0
					state.y = 0
				}

				clamp_pan()
				apply_transform(true)
			}

		// load_image . swaps src/caption for the current index, resets zoom/pan.
		// Shows last_resort_src (the 1.5MB variant, already cached from the
		// gallery/thumbnail this was clicked from) immediately as a placeholder,
		// instead of a blank spinner wait, while load_full_resolution fetches
		// the real target in the background and swaps it in once ready
			function load_image() {

				const current = images[state.index]

				state.scale	= 1
				state.x		= 0
				state.y		= 0

				img.classList.remove('is_loaded')
				apply_transform(false)

				img.src	= current.last_resort_src || current.src
				img.alt	= current.caption || ''

				load_full_resolution(current, state.index)

				caption.textContent = current.caption || ''
				caption.classList.toggle('hide', !current.caption)

				if (prev_button) {
					prev_button.classList.toggle('hide', state.index<=0)
					next_button.classList.toggle('hide', state.index>=images.length-1)
				}
			}

		// load_full_resolution . fetches the sharp "modified" variant (falling
		// back to "original") off-DOM, so the visible placeholder never blanks
		// out mid-download, then swaps it into img once it has fully arrived.
		// for_index guards against a stale, slow-to-arrive swap landing after
		// the user has already stepped to a different image
			function load_full_resolution(current, for_index) {

				if (current.src===current.last_resort_src) {
					return // already showing the only variant there is
				}

				const preload = new Image()

				preload.addEventListener('load', function(){
					if (state.index===for_index) {
						img.src = preload.src
					}
				})

				preload.addEventListener('error', function(){
					if (state.index===for_index && preload.src===current.src && current.fallback_src) {
						preload.src = current.fallback_src
					}
					// fallback also failing (or none to try) just leaves the placeholder shown
				})

				preload.src = current.src
			}

			// position_nav_buttons . prev/next sit just outside the image's own
			// rendered edges instead of pinned to the far viewport corners, so they
			// stay close to the photograph regardless of its size. Recomputed per
			// image (aspect ratio varies) and on resize
				function position_nav_buttons() {

					if (!prev_button) {
						return
					}

					const rect			= img.getBoundingClientRect()
					const gap			= 24
					const min_margin	= 20

					prev_button.style.left		= Math.max(min_margin, rect.left - prev_button.offsetWidth - gap) + 'px'
					prev_button.style.right	= 'auto'
					next_button.style.right	= Math.max(min_margin, window.innerWidth - next_button.offsetWidth - rect.right - gap) + 'px'
					next_button.style.left		= 'auto'
				}

			img.addEventListener('load', function(){
				spinner.classList.add('hide')
				img.classList.add('is_loaded')
				position_nav_buttons()
			})

			window.addEventListener('resize', position_nav_buttons)

		function go_to(new_index) {
			if (new_index<0 || new_index>images.length-1) {
				return
			}
			state.index = new_index
			load_image()
		}

		function close() {
			overlay.classList.remove('is_open')
			document.removeEventListener('keydown', on_keydown)
			window.removeEventListener('resize', position_nav_buttons)
			document.body.style.overflow = previous_overflow
			if (previously_focused_element && typeof previously_focused_element.focus==='function') {
				previously_focused_element.focus()
			}
			setTimeout(function(){
				overlay.remove()
			}, 250)
		}

		// trap_focus . Tab/Shift+Tab cycle only through the lightbox's own visible
		// controls (prev/next - hidden at the ends of the image list), instead of
		// escaping into the page underneath
			function trap_focus(e) {
				const focusable = [prev_button, next_button].filter(function(el){
					return el && !el.classList.contains('hide')
				})

				if (!focusable.length) {
					e.preventDefault()
					overlay.focus()
					return
				}

				const first = focusable[0]
				const last  = focusable[focusable.length-1]

				if (e.shiftKey && document.activeElement===first) {
					e.preventDefault()
					last.focus()
				}else if (!e.shiftKey && document.activeElement===last) {
					e.preventDefault()
					first.focus()
				}else if (focusable.indexOf(document.activeElement)===-1) {
					e.preventDefault()
					first.focus()
				}
			}

		// wheel zoom, centered on the cursor
			stage.addEventListener('wheel', function(e){
				e.preventDefault()
				const delta = e.deltaY>0 ? -0.35 : 0.35
				set_scale(state.scale + delta, e.clientX, e.clientY)
			}, { passive: false })

		// double-click / double-tap . toggle between fit and a fixed zoom level
			stage.addEventListener('dblclick', function(e){
				e.preventDefault()
				if (state.scale>1) {
					set_scale(1, e.clientX, e.clientY)
				}else{
					set_scale(2.5, e.clientX, e.clientY)
				}
			})

		// pointer drag (mouse/touch/pen, unified via the Pointer Events API) +
		// two-finger pinch zoom, tracked through the same pointer map
			stage.addEventListener('pointerdown', function(e){
				state.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

				if (state.pointers.size===2) {

					const pts = Array.from(state.pointers.values())
					state.pinch_start_distance	= Math.hypot(pts[0].x-pts[1].x, pts[0].y-pts[1].y)
					state.pinch_start_scale	= state.scale
					state.dragging = false

				}else if (state.scale>1) {

					state.dragging		= true
					state.drag_start_x	= e.clientX
					state.drag_start_y	= e.clientY
					state.start_x		= state.x
					state.start_y		= state.y
					stage.setPointerCapture(e.pointerId)
				}
			})

			stage.addEventListener('pointermove', function(e){

				if (!state.pointers.has(e.pointerId)) {
					return
				}
				state.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

				if (state.pointers.size===2) {

					const pts		= Array.from(state.pointers.values())
					const distance	= Math.hypot(pts[0].x-pts[1].x, pts[0].y-pts[1].y)
					const mid_x		= (pts[0].x+pts[1].x)/2
					const mid_y		= (pts[0].y+pts[1].y)/2

					if (state.pinch_start_distance>0) {
						set_scale(state.pinch_start_scale * (distance / state.pinch_start_distance), mid_x, mid_y)
					}

				}else if (state.dragging) {

					state.x = state.start_x + (e.clientX - state.drag_start_x)
					state.y = state.start_y + (e.clientY - state.drag_start_y)
					clamp_pan()
					apply_transform(false)
				}
			})

			function end_pointer(e) {
				state.pointers.delete(e.pointerId)
				if (state.pointers.size<2) {
					state.pinch_start_distance = 0
				}
				if (state.pointers.size===0) {
					state.dragging = false
					apply_transform(false)
				}
			}
			stage.addEventListener('pointerup', end_pointer)
			stage.addEventListener('pointercancel', end_pointer)
			stage.addEventListener('pointerleave', end_pointer)

		// clicking the dimmed backdrop (not the image) closes, but only while
		// not zoomed in - avoids an accidental close mid-pan
			stage.addEventListener('click', function(e){
				if (e.target===stage && state.scale<=1) {
					close()
				}
			})

		if (prev_button) {
			prev_button.addEventListener('click', function(){ go_to(state.index-1) })
			next_button.addEventListener('click', function(){ go_to(state.index+1) })
		}

		function on_keydown(e) {
			if (e.key==='Escape') {
				close()
			}else if (e.key==='ArrowLeft') {
				go_to(state.index-1)
			}else if (e.key==='ArrowRight') {
				go_to(state.index+1)
			}else if (e.key==='+' || e.key==='=') {
				set_scale(state.scale + 0.5)
			}else if (e.key==='-') {
				set_scale(state.scale - 0.5)
			}else if (e.key==='0') {
				set_scale(1)
			}else if (e.key==='Tab') {
				trap_focus(e)
			}
		}
		document.addEventListener('keydown', on_keydown)

		document.body.appendChild(overlay)
		load_image()

		// move focus into the dialog - prev/next when available (start_index
		// determines which are visible), otherwise the dialog surface itself
			const initial_focus_target = (prev_button && !prev_button.classList.contains('hide'))
				? prev_button
				: ((next_button && !next_button.classList.contains('hide')) ? next_button : overlay)
			initial_focus_target.focus()

		// double rAF so the initial (pre-.is_open) styles are committed by the
		// browser before the class flips, guaranteeing the fade/scale-in transition
		// actually runs instead of snapping straight to the open state
			requestAnimationFrame(function(){
				requestAnimationFrame(function(){
					overlay.classList.add('is_open')
					// position_nav_buttons (see above) may have already run against
					// the image's pre-entrance, still-scaling-in rect if 'load' fired
					// early (likely, since the thumbnail is already cached) - reposition
					// once more after the stage's own entrance transition settles
						setTimeout(position_nav_buttons, 360)
				})
			})
	}//end open_lightbox


}//end documentation