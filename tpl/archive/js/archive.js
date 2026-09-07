/*global SHOW_DEBUG, data_manager, common, page, page_globals, dedalo_logged, tstring, event_manager, list_factory, form_factory, Promise */
/*eslint no-undef: "error"*/

"use strict";



var archive = {


	rows_container		: null,
	form_container		: null,
	section_id			: null,
	list				: null,
	form				: null,
	filters_panel		: null,
	filters_toggle		: null,
	filters_open		: false,
	current_sql_filter	: null,
	view_mode			: 'list',
	grid_button			: null,
	list_button			: null,

	// lightbox state
	lightbox_overlay	: null,
	lightbox_img		: null,
	lightbox_counter	: null,
	lightbox_images		: [],
	lightbox_index		: 0,
	lightbox_scale		: 1,
	lightbox_pan		: { x: 0, y: 0 },

	pagination : {
		total	: null,
		limit	: 20,
		offset	: 0,
		n_nodes	: 8
	},


	/**
	* SET_UP
	* When the HTML page is loaded
	* @param object options
	*/
	set_up : function(options) {

		const self = this

		self.rows_container	= options.rows_container
		self.form_container	= options.form_container
		self.section_id		= options.section_id || null

		if (self.section_id) {
			// detail mode. e.g. '/archive/143'
			self.load_detail()
		}else{
			// list mode. e.g. '/archive'

			const form_node = self.render_form()
			self.form_container.appendChild(form_node)

			// results toolbar (view toggle), sits above the results, outside the
			// pagination reload cycle so it isn't rebuilt on every page change
				const toolbar = self.render_toolbar()
				self.rows_container.parentNode.insertBefore(toolbar, self.rows_container)
				self.set_view_mode(self.view_mode)

			self.load_list()

			// paginate event, fired by the shared paginator (same mechanism as tpl/coins)
			event_manager.subscribe('paginate', function(offset){
				self.pagination.offset = offset
				self.load_list()
			})
		}

		return true
	},//end set_up



	/**
	* RENDER_FORM
	* Compact search bar (title) + collapsible advanced filters panel.
	* Same underlying form_factory / sql filter mechanism as tpl/coins,
	* different UI: a toolbar instead of a stacked form.
	*/
	render_form : function() {

		const self = this

		self.form = new form_factory()

		const fragment = new DocumentFragment()

		// top row . title search, same "form-row fields" layout used by tpl/coins
			const top_row = common.create_dom_element({
				element_type	: "div",
				class_name		: "form-row fields",
				parent			: fragment
			})

			self.form.item_factory({
				id			: "title",
				name		: "title",
				label		: tstring.search_archive || "Search by title...",
				q_column	: "title",
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

		// filters_panel . collapsed by default, same field layout as the top row
			const filters_panel = common.create_dom_element({
				element_type	: "div",
				class_name		: "form-row fields hide",
				parent			: fragment
			})
			self.filters_panel = filters_panel

			// term (autocomplete) fields, resolved against the "archive" table itself
				const term_fields = [
					{ id: "typology",   label: tstring.typology   || "Typology"   },
					{ id: "material",   label: tstring.material   || "Material"   },
					{ id: "technique",  label: tstring.technique  || "Technique"  },
					{ id: "collection", label: tstring.collection || "Collection" },
					{ id: "fund",       label: tstring.fund       || "Fund"       }
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

			// plain text fields
				const text_fields = [
					{ id: "municipality", label: tstring.municipality || "Municipality" },
					{ id: "curator",      label: tstring.curator      || "Curator"      }
				]
				text_fields.forEach(function(field){
					self.form.item_factory({
						id			: field.id,
						name		: field.id,
						label		: field.label,
						q_column	: field.id,
						eq			: "LIKE",
						eq_in		: "%",
						eq_out		: "%",
						is_term		: false,
						parent		: filters_panel
					})
				})

			const clear_button = common.create_dom_element({
				element_type	: "input",
				type			: "button",
				value			: tstring.clear_filters || "Clear filters",
				parent			: filters_panel
			})
			clear_button.addEventListener("click", function(){
				self.clear_filters()
			})

		// buttons row . same "form-group field button_submit" wrapper + <input type> pattern used by tpl/coins
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
				id				: "archive_search_form",
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
			class_name		: "archive_toolbar"
		})

		const view_toggle = common.create_dom_element({
			element_type	: "div",
			class_name		: "archive_view_toggle",
			parent			: toolbar
		})

		self.list_button = common.create_dom_element({
			element_type	: "button",
			type			: "button",
			class_name		: "archive_view_btn",
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
			class_name		: "archive_view_btn",
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
	* CLEAR_FILTERS
	* Reset every field and reload the unfiltered list
	*/
	clear_filters : function() {

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

		self.form_submit()
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

		self.load_list()
	},//end form_submit



	/**
	* LOAD_LIST
	* Fetch current pagination page and render it using list_factory
	* (same paginated list UX used by tpl/coins)
	*/
	load_list : function() {

		const self = this
		const rows_container = self.rows_container

		// loading start
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

			// clean container
				while (rows_container.hasChildNodes()) {
					rows_container.removeChild(rows_container.lastChild);
				}
				rows_container.classList.remove('loading')

			if (!response.rows.length) {
				rows_container.textContent = tstring.no_results || 'No records found.'
				return
			}

			// render (list_factory handles top/bottom pagination + totals, same as coins)
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

		return archive.draw_item(row)
	},//end list_row_builder



	/**
	* LOAD_DETAIL
	* Fetch single record by section_id and render it
	*/
	load_detail : function() {

		const self = this

		page.add_spinner(self.rows_container)

		self.get_rows({
			limit		: 1,
			offset		: 0,
			sql_filter	: 'section_id=' + self.section_id
		})
		.then(function(response){
			self.render_detail(response.rows[0] || null)
		})
	},//end load_detail



	/**
	* GET_ROWS
	* Make a request to Dédalo public API to get "archive" table records
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
			count		:	 true
		}

		return data_manager.request({
			body : request_body
		})
		.then(function(api_response){

			if (SHOW_DEBUG===true) {
				console.log("-> archive api_response:", api_response);
			}

			return {
				rows	: api_response.result || [],
				total	: api_response.total || 0
			}
		})
	},//end get_rows



	/**
	* DRAW_ITEM
	* Build one archive record card, linked to its detail page
	* @param object row
	* @return HTMLElement
	*/
	draw_item : function(row) {

		const item_wrapper = common.create_dom_element({
			element_type	: "div",
			class_name		: "archive_item"
		})

		const detail_url = page_globals.__WEB_ROOT_WEB__ + '/documentation/' + row.section_id

		// card_link . whole card is clickable, opens detail in a new tab
			const card_link = common.create_dom_element({
				element_type	: "a",
				class_name		: "row_wrapper",
				href			: detail_url,
				target			: "_blank",
				parent			: item_wrapper
			})
			card_link.setAttribute('rel', 'noopener')

		// thumbnail
			if (row.identifying_images && row.identifying_images.length>0) {

				const image_wrapper = common.create_dom_element({
					element_type	: "div",
					class_name		: "image_wrapper",
					parent			: card_link
				})

				const first_image	= row.identifying_images.split(' | ')[0]
				const full_url		= page_globals.__WEB_MEDIA_BASE_URL__ + first_image
				// lighter rendition for cards, same '/1.5MB/' -> '/thumb/' swap used by tpl/coins
				const thumb_url		= full_url.replace('/1.5MB/', '/thumb/')

				common.create_dom_element({
					element_type	: "img",
					class_name		: "image thumb",
					src				: thumb_url,
					title			: row.title || '',
					loading			: 'lazy',
					parent			: image_wrapper
				})
			}

		// info_container
			const info_container = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_container",
				parent			: card_link
			})

		// title
			common.create_dom_element({
				element_type	: "div",
				class_name		: "archive_title",
				text_content	: row.title || ('ID ' + row.section_id),
				parent			: info_container
			})

		// simple label / value fields
			archive.draw_fields(info_container, row)

		// dedalo edit link (sibling of the card link, avoids nested <a>)
			if (dedalo_logged===true) {
				const link = common.create_dom_element({
					element_type	: "a",
					class_name		: "go_to_dedalo",
					text_content	: '#' + row.section_id,
					href			: '/dedalo/core/page/?tipo=' + row.section_tipo + '&id=' + row.section_id,
					parent			: item_wrapper
				})
				link.setAttribute('target', '_blank');
			}

		return item_wrapper
	},//end draw_item



	/**
	* RENDER_DETAIL
	* Full single-record view
	*/
	render_detail : function(row) {

		const container = this.rows_container

		while (container.hasChildNodes()) {
			container.removeChild(container.lastChild);
		}

		if (!row) {
			common.create_dom_element({
				element_type	: "p",
				text_content	: tstring.no_results || 'This record does not exist.',
				parent			: container
			})
			return
		}

		const row_wrapper = common.create_dom_element({
			element_type	: "div",
			class_name		: "row_wrapper detail",
			parent			: container
		})

		// images. show all identifying images, not just the first
		// click any image to open the zoomable lightbox
			if (row.identifying_images && row.identifying_images.length>0) {

				const self = this
				const image_paths = row.identifying_images.split(' | ')

				const gallery = common.create_dom_element({
					element_type	: "div",
					class_name		: "image_wrapper gallery",
					parent			: row_wrapper
				})

				image_paths.forEach(function(image_path, index){
					const img = common.create_dom_element({
						element_type	: "img",
						class_name		: "image thumb zoomable",
						src				: page_globals.__WEB_MEDIA_BASE_URL__ + image_path,
						title			: row.title || '',
						parent			: gallery
					})
					img.addEventListener('click', function(){
						self.open_lightbox(image_paths, index)
					})
				})
			}

		const info_container = common.create_dom_element({
			element_type	: "div",
			class_name		: "info_container",
			parent			: row_wrapper
		})

		common.create_dom_element({
			element_type	: "div",
			class_name		: "archive_title",
			text_content	: row.title || ('ID ' + row.section_id),
			parent			: info_container
		})

		if (dedalo_logged===true) {
			const link = common.create_dom_element({
				element_type	: "a",
				class_name		: "go_to_dedalo",
				text_content	: (tstring.edit || 'Edit') + ' #' + row.section_id,
				href			: '/dedalo/core/page/?tipo=' + row.section_tipo + '&id=' + row.section_id,
				parent			: info_container
			})
			link.setAttribute('target', '_blank');
		}

		this.draw_fields(info_container, row)

		// extra detail-only fields
			this.add_field(info_container, tstring.recovery_mode || 'Recovery mode', row.recovery_mode)
			this.add_field(info_container, tstring.recovery_place || 'Recovery place', row.recovery_place)
			this.add_field(info_container, tstring.recovery_date || 'Recovery date', row.recovery_date)
			this.add_field(info_container, tstring.source || 'Source', [row.source_name, row.source_surname].filter(Boolean).join(' '))
			this.add_field(info_container, tstring.author || 'Author', row.author)
			this.add_field(info_container, tstring.manufacturer || 'Manufacturer', row.manufacturer)
			this.add_field(info_container, tstring.inscriptions || 'Inscriptions', row.inscriptions)
	},//end render_detail



	/**
	* DRAW_FIELDS
	* Shared label / value fields for both card and detail views
	*/
	draw_fields : function(info_container, row) {

		this.add_field(info_container, tstring.typology || 'Typology', row.typology)
		this.add_field(info_container, tstring.material || 'Material', row.material)
		this.add_field(info_container, tstring.technique || 'Technique', row.technique)
		this.add_field(info_container, tstring.collection || 'Collection', row.collection)
		this.add_field(info_container, tstring.fund || 'Fund', row.fund)

		const dating = [row.dating_start, row.dating_end].filter(Boolean).join(' - ') || row.dating
		this.add_field(info_container, tstring.dating || 'Dating', dating)

		this.add_field(info_container, tstring.municipality || 'Municipality', row.municipality)
		this.add_field(info_container, tstring.curator || 'Curator', row.curator)
		this.add_field(info_container, tstring.description || 'Description', row.description)
	},//end draw_fields



	/**
	* ADD_FIELD
	* Append a label/value pair to a container, skipping empty values
	*/
	add_field : function(container, label, value) {

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
	* OPEN_LIGHTBOX
	* Full screen, zoomable / pannable image viewer
	* @param array images. relative paths, as returned by identifying_images
	* @param number start_index
	*/
	open_lightbox : function(images, start_index) {

		const self = this

		self.lightbox_images	= images
		self.lightbox_index	= start_index
		self.lightbox_scale		= 1
		self.lightbox_pan		= { x: 0, y: 0 }

		const overlay = common.create_dom_element({
			element_type	: "div",
			class_name		: "archive_lightbox"
		})
		self.lightbox_overlay = overlay

		if (images.length>1) {

			const prev_button = common.create_dom_element({
				element_type	: "button",
				type			: "button",
				class_name		: "archive_lightbox_nav prev",
				inner_html		: '<i class="fa fa-chevron-left"></i>',
				parent			: overlay
			})
			prev_button.addEventListener('click', function(e){
				e.stopPropagation()
				self.lightbox_step(-1)
			})

			const next_button = common.create_dom_element({
				element_type	: "button",
				type			: "button",
				class_name		: "archive_lightbox_nav next",
				inner_html		: '<i class="fa fa-chevron-right"></i>',
				parent			: overlay
			})
			next_button.addEventListener('click', function(e){
				e.stopPropagation()
				self.lightbox_step(1)
			})
		}

		const stage = common.create_dom_element({
			element_type	: "div",
			class_name		: "archive_lightbox_stage",
			parent			: overlay
		})

		self.lightbox_img = common.create_dom_element({
			element_type	: "img",
			class_name		: "archive_lightbox_img",
			parent			: stage
		})

		self.lightbox_counter = common.create_dom_element({
			element_type	: "div",
			class_name		: "archive_lightbox_counter",
			parent			: overlay
		})

		self.update_lightbox()

		// zoom (wheel)
			stage.addEventListener('wheel', function(e){
				e.preventDefault()
				self.lightbox_zoom_by(e.deltaY<0 ? 0.4 : -0.4)
			}, { passive: false })

		// zoom (double click)
			stage.addEventListener('dblclick', function(){
				self.lightbox_scale	= (self.lightbox_scale>1) ? 1 : 2.5
				self.lightbox_pan		= { x: 0, y: 0 }
				self.apply_lightbox_transform()
			})

		// pan (drag, only while zoomed in)
			let dragging	= false
			let drag_start	= { x: 0, y: 0 }
			let pan_start	= { x: 0, y: 0 }

			self.lightbox_img.addEventListener('mousedown', function(e){
				if (self.lightbox_scale<=1) return
				dragging	= true
				drag_start	= { x: e.clientX, y: e.clientY }
				pan_start	= { x: self.lightbox_pan.x, y: self.lightbox_pan.y }
				self.lightbox_img.classList.add('dragging')
			})
			self._lightbox_mousemove = function(e){
				if (!dragging) return
				self.lightbox_pan = {
					x : pan_start.x + (e.clientX - drag_start.x),
					y : pan_start.y + (e.clientY - drag_start.y)
				}
				self.apply_lightbox_transform()
			}
			self._lightbox_mouseup = function(){
				dragging = false
				if (self.lightbox_img) {
					self.lightbox_img.classList.remove('dragging')
				}
			}
			window.addEventListener('mousemove', self._lightbox_mousemove)
			window.addEventListener('mouseup', self._lightbox_mouseup)

		// close on backdrop click
			overlay.addEventListener('click', function(e){
				if (e.target===overlay || e.target===stage) {
					self.close_lightbox()
				}
			})

		// keyboard
			self._lightbox_keydown = function(e){
				if (e.key==='Escape') {
					self.close_lightbox()
				}else if (e.key==='ArrowLeft') {
					self.lightbox_step(-1)
				}else if (e.key==='ArrowRight') {
					self.lightbox_step(1)
				}
			}
			document.addEventListener('keydown', self._lightbox_keydown)

		document.body.appendChild(overlay)
		document.body.classList.add('archive_lightbox_open')
	},//end open_lightbox



	/**
	* UPDATE_LIGHTBOX
	* Refresh image src / counter for the current lightbox_index
	*/
	update_lightbox : function() {

		const self = this

		const image_path = self.lightbox_images[self.lightbox_index]

		self.lightbox_img.src = page_globals.__WEB_MEDIA_BASE_URL__ + image_path
		self.lightbox_counter.textContent = (self.lightbox_index+1) + ' / ' + self.lightbox_images.length

		self.apply_lightbox_transform()
	},//end update_lightbox



	/**
	* LIGHTBOX_STEP
	* @param number direction. -1 | 1
	*/
	lightbox_step : function(direction) {

		const self = this

		const length = self.lightbox_images.length
		self.lightbox_index = (self.lightbox_index + direction + length) % length

		self.lightbox_scale	= 1
		self.lightbox_pan		= { x: 0, y: 0 }

		self.update_lightbox()
	},//end lightbox_step



	/**
	* LIGHTBOX_ZOOM_BY
	* @param number delta
	*/
	lightbox_zoom_by : function(delta) {

		const self = this

		self.lightbox_scale = Math.min(5, Math.max(1, self.lightbox_scale + delta))

		if (self.lightbox_scale===1) {
			self.lightbox_pan = { x: 0, y: 0 }
		}

		self.apply_lightbox_transform()
	},//end lightbox_zoom_by



	/**
	* APPLY_LIGHTBOX_TRANSFORM
	*/
	apply_lightbox_transform : function() {

		const self = this

		self.lightbox_img.style.transform = 'translate(' + self.lightbox_pan.x + 'px,' + self.lightbox_pan.y + 'px) scale(' + self.lightbox_scale + ')'
		self.lightbox_img.classList.toggle('zoomed', self.lightbox_scale>1)
	},//end apply_lightbox_transform



	/**
	* CLOSE_LIGHTBOX
	*/
	close_lightbox : function() {

		const self = this

		if (self.lightbox_overlay) {
			self.lightbox_overlay.remove()
			self.lightbox_overlay = null
		}

		document.body.classList.remove('archive_lightbox_open')

		document.removeEventListener('keydown', self._lightbox_keydown)
		window.removeEventListener('mousemove', self._lightbox_mousemove)
		window.removeEventListener('mouseup', self._lightbox_mouseup)
	}//end close_lightbox


}//end archive
