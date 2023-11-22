/*global tstring, page_globals, page, SHOW_DEBUG, psqo_factory, biblio_row_fields, common, dedalo_logged */
/*eslint no-undef: "error"*/
"use strict";


import { COLOR_PALETTE, chart_wrapper } from "../../lib/charts/chart-wrapper";
import { minimal_boxvio_chart_wrapper } from "../../lib/charts/d3/boxvio/minimal-boxvio-chart-wrapper";
import { minimal_clock_chart_wrapper } from "../../lib/charts/d3/clock/minimal-clock-chart-wrapper";


export const type_row_fields = {


	// caller. Like 'type'
	caller : null,
	type : '',
	equivalents : '',

	// charts
	/** @type {chart_wrapper} */
	weight_chat_wrapper: null,
	/** @type {chart_wrapper} */
	diameter_chart_wrapper: null,
	/** @type {chart_wrapper} */
	axis_chart_wrapper: null,

	draw_item : function(item) {

		const self = this

		const fragment = new DocumentFragment()


		// dedalo_link
			if (dedalo_logged===true) {
				const dedalo_link_link = self.dedalo_link(item, 'numisdata3')
				fragment.appendChild(dedalo_link_link)
			}

		// Cite of record
			const golden_separator = document.querySelector('.golden-separator')
			const cite = common.create_dom_element({
				element_type	: "span",
				class_name		: "cite_this_record",
				text_content	: tstring.cite_this_record || 'cite this record',
				parent			: golden_separator
			})
			cite.addEventListener('click', async function(){
				const main_catalog_data = await page.load_main_catalog()
				const cite_data = main_catalog_data.result[0];
				const publication_data = cite_data.publication_data[0];

				cite_data.autors = {
					authorship_data		: item.authorship_data || null,
					authorship_names	: item.authorship_names || null,
					authorship_surnames	: item.authorship_surnames || null,
					authorship_roles	: item.authorship_roles || null,
				}
				cite_data.catalog = null
				cite_data.title = '<em>'+self.type+'</em>'
				cite_data.publication_data = publication_data
				cite_data.uri_location 	= window.location

				const cite_data_node = biblio_row_fields.render_cite_this(cite_data)


				const popUpContainer = common.create_dom_element({
					element_type	: "div",
					class_name		: "float-cite",
					parent 			: document.body
				})
				popUpContainer.addEventListener('mouseup',function() {

   					popUpContainer.classList.add('copy')
   					cite_data_node.classList.add('copy')

   					const selection = window.getSelection();
					//create a selection range
					const copy_range = document.createRange();
					//choose the element we want to select the text of
					copy_range.selectNodeContents(cite_data_node);
					//select the text inside the range
					selection.removeAllRanges();
       				selection.addRange( copy_range );

       				//copy the text to the clipboard
					document.execCommand("copy");

					//remove our selection range
					window.getSelection().removeAllRanges();
				})

				const title = common.create_dom_element({
					element_type	: "div",
					class_name		: "float-label",
					text_content	: tstring.cite_this_record || 'Cite this record',
					parent 			: popUpContainer
				})

				const close_buttom = common.create_dom_element({
					element_type	: "div",
					class_name		: "close-buttom",
					parent 			: popUpContainer
				})
				close_buttom.addEventListener("click",function(){
					// popUpContainer.remove()
				})
				document.body.addEventListener("click",function(event_cite){
					document.body.removeEventListener("click", function(event_cite){})
					popUpContainer.remove()
				})

				popUpContainer.appendChild(cite_data_node)

				const click_to_copy = common.create_dom_element({
					element_type	: "div",
					class_name		: "float-text_copy",
					text_content	: tstring.click_to_copy || 'Click to copy',
					parent 			: popUpContainer
				})

			})

		// catalog_hierarchy
			fragment.appendChild(
				self.catalog_hierarchy(item, "catalog_hierarchy")
			)

		// creators
			fragment.appendChild(
				self.creators(item, "creators")
			)

		// identify_coin_wrapper
			const identify_coin = common.create_dom_element({
				element_type	: "div",
				class_name		: "identify_coin_wrapper gallery",
				parent			: fragment
			})

		// ref_coins_image_obverse
			identify_coin.appendChild(
				self.image(item, "ref_coins_image_obverse")
			)

		// ref_coins_image_reverse
			identify_coin.appendChild(
				self.image(item, "ref_coins_image_reverse")
			)

			//embedded gallery reference node
			common.create_dom_element({
				element_type 	: "div",
				id 				: "embedded-gallery",
				parent 			: fragment
			})

		// identify_coin
			// fragment.appendChild(
			// 	self.identify_coin(item, "identify_coin")
			// )

		// id_line
			fragment.appendChild(
				self.id_line(item, "id_line")
			)

		// sides_wrapper
		const sides_wrapper = common.create_dom_element({
			element_type	: "div",
			class_name		: "sides_wrapper",
			parent			: fragment
		})

		// obverse_info_wrapper
		const obverse_wrapper = common.create_dom_element({
			element_type	: "div",
			class_name		: "obverse_wrapper",
			parent			: sides_wrapper
		})

		// design_obverse
			obverse_wrapper.appendChild(
				self.default(item, "design_obverse")
			)

		// symbol_obverse
			obverse_wrapper.appendChild(
				self.default(item, "symbol_obverse")
			)

		// legend_obverse
			// fragment.appendChild(
			// 	self.default(item, "legend_obverse", page.local_to_remote_path)
			// )
			if (item.legend_obverse) {
				obverse_wrapper.appendChild(
					page.render_legend({
						value : item.legend_obverse,
						style : 'median legend_obverse_box'
					})
				)
			}
			// else{
			// 	common.create_dom_element({
			// 		element_type	: "div",
			// 		parent			: sides_wrapper
			// 	})
			// }

		// legend_obverse_transcription
			obverse_wrapper.appendChild(
				self.default(item, "legend_obverse_transcription")
			)

		// reverse_info_wrapper
		const reverse_wrapper = common.create_dom_element({
			element_type	: "div",
			class_name		: "reverse_wrapper",
			parent			: sides_wrapper
		})

		// design_reverse
			reverse_wrapper.appendChild(
				self.default(item, "design_reverse")
			)

		// symbol_reverse
			reverse_wrapper.appendChild(
				self.default(item, "symbol_reverse")
			)

		// legend_reverse
			// fragment.appendChild(
			// 	self.default(item, "legend_reverse", page.local_to_remote_path)
			// )
			if (item.legend_reverse) {
				reverse_wrapper.appendChild(
					page.render_legend({
						value : item.legend_reverse,
						style : 'median legend_reverse_box'
					})
				)
			}

		// legend_reverse_transcription
			reverse_wrapper.appendChild(
				self.default(item, "legend_reverse_transcription")
			)

		// public_info
			fragment.appendChild(
				self.default(item, "public_info", page.local_to_remote_path)
			)

		// equivalents : "ACIP | 1567<br>CNH | 237/1"
			fragment.appendChild(
				self.default(item, "equivalents", function(value){
					const beats = page.split_data(value, "<br>")
					const ar_final = []
					for (let i = 0; i < beats.length; i++) {
						ar_final.push( beats[i].replace(/ \| /g, ' ') )
					}
					self.equivalents = ar_final.join(" | ")
					return self.equivalents
				})
			)
		// related_types : "MIB | 03a<br>MIB | 15b"
			if(item.related_types){
				const related_types 		= item.related_types
				const related_types_data 	= item.related_types_data

				const label		= tstring.related_types || "Related types"
				const beats 	= related_types_data.length
				const ar_final 	= []
				for (let i = 0; i < beats; i++) {
					const related_type = related_types_data[i]
					const related_mint = (related_type.mint)
						? related_type.mint
						: "..."
					const related_mint_number = (related_type.mint_number)
						? related_type.mint_number
						: '..'
					const related_type_number = (related_type.number)
						? related_type.number
						: '..'
					const related_label = related_mint +" "+related_mint_number+"/"+related_type_number

					const related_id 	= (related_type.section_id)
							? related_type.section_id
							: false
					const url		= page_globals.__WEB_ROOT_WEB__ + "/type/" + related_id

					const current_related_typo = (related_id)
						? "<a href=\"" + url + "\">" +  related_label + "</a>"
						: related_label
					ar_final.push( current_related_typo )
				}

				const related_types_node = common.create_dom_element({
					element_type	: "span",
					class_name		: "info_value related_types",
					inner_html 		: label +": "+ ar_final.join(" | "),
					parent 			: fragment
				})
			}



		// bibliography
			const ar_references = item.bibliography_data
				fragment.appendChild(
					self.draw_bibliographic_reference(ar_references)
				)

		// permanent uri
			fragment.appendChild(
				self.default(item, "section_id", function(value){
					const label		= tstring.permanent_uri || "Permanent URI"
					const url		= page_globals.__WEB_ROOT_WEB__ + "/type/" + value
					const full_url	= page_globals.__WEB_BASE_URL__ + url
					// return label + ": <a href=\"" + url + "\">" +  full_url + "</a>"
					return label + ": <span class=\"uri\">" +  full_url + "</span>"
				})
			)

		// other permanent uri
			if (item.uri && item.uri.length>0) {
				for (let i = 0; i < item.uri.length; i++) {

					const el = item.uri[i]

					fragment.appendChild(
						self.default(item, "section_id", function(value){
							const label	= tstring.uri || "URI"
							return label + " " + el.label + ": <span class=\"uri\"><a href=\""+el.value+"\" target=\"_blank\">" + el.value + "</a></span>"
						})
					)
				}
			}

		// catalog hierarchy
			// 	fragment.appendChild(
			// 		self.default(item, "section_id", function(value){
			// 			return "<em>Info about current type catalog hierarchy. Catalog section_id: " + item["catalogue_data"] + "</em>"
			// 		})
			// 	)

		// items (ejemplares) list
			if (item._coins_group && item._coins_group.length>0) {
				// exclude already showed items (identify images)
				const data = item._coins_group.filter(el => el.typology_id!="1")
				if (data.length>0) {
					// fragment.appendChild( self.label(item, "coins") )

					const coins_label = self.label(item, "coins")
					fragment.appendChild( coins_label )
					const coins_container = self.items_list(item, "items_list", data)

					coins_label.addEventListener("mouseup", (event) => {
						event.preventDefault()
						coins_container.classList.toggle("hide");
					})

					fragment.appendChild(coins_container)
					// fragment.appendChild(
					// 	self.items_list(item, "items_list", data)
					// )
				}
			}

		// Weight, diameter, and axis
			// console.log(item)
			let color = COLOR_PALETTE[0]
			if (item.denomination_data
				&& item.denomination_data.length
				&& item.denomination_data[0].color) {
				color = item.denomination_data[0].color
			}
			const catalog_data = item.catalog
			const calculable = catalog_data.full_coins_reference_calculable
				? catalog_data.full_coins_reference_calculable
				: []
			const diameter = catalog_data.full_coins_reference_diameter_max
				? catalog_data.full_coins_reference_diameter_max.filter((v, i) => v && calculable[i])
				: []
			const weight = catalog_data.full_coins_reference_weight.filter((v, i) => v && calculable[i])
				? catalog_data.full_coins_reference_weight
				: []
			const axis = catalog_data.full_coins_reference_axis
				? catalog_data.full_coins_reference_axis.filter((v) => v)
				: []
			const axis_counts = Array(12).fill(0)
			for (const hour of axis) {
				axis_counts[hour % 12]++
			}
			if (diameter.length || weight.length || axis.length) {
				const analytics_div_wrapper = common.create_dom_element({
					element_type	: 'div',
					id				: 'type_analytics'
				})
				fragment.appendChild(analytics_div_wrapper)

				if (weight.length) {
					const weight_wrapper = common.create_dom_element({
						element_type	: 'div',
						class_name		: 'type_analytics_component',
						parent			: analytics_div_wrapper
					})
					const separator = common.create_dom_element({
						element_type	: 'div',
						class_name		: 'info_line separator',
						parent			: weight_wrapper
					})
					common.create_dom_element({
						element_type	: 'div',
						class_name		: 'big_label',
						text_content	: tstring.weight || 'Weight',
						parent			: separator
					})
					const chart_wrapper = common.create_dom_element({
						element_type	: 'div',
						class_name		: 'chart_wrapper',
						parent			: weight_wrapper
					})
					self.weight_chat_wrapper = new minimal_boxvio_chart_wrapper(
						chart_wrapper,
						weight,
						{
							color				: color,
							whiskers_quantiles	: [10, 90],
						}
					)
					self.weight_chat_wrapper.render()
				}

				if (diameter.length) {
					const diameter_wrapper = common.create_dom_element({
						element_type	: 'div',
						class_name		: 'type_analytics_component',
						parent			: analytics_div_wrapper
					})
					const separator = common.create_dom_element({
						element_type	: 'div',
						class_name		: 'info_line separator',
						parent			: diameter_wrapper
					})
					common.create_dom_element({
						element_type	: 'div',
						class_name		: 'big_label',
						text_content	: tstring.diameter || 'Diameter',
						parent			: separator
					})
					const chart_wrapper = common.create_dom_element({
						element_type	: 'div',
						class_name		: 'chart_wrapper',
						parent			: diameter_wrapper
					})
					self.diameter_chart_wrapper = new minimal_boxvio_chart_wrapper(
						chart_wrapper,
						diameter,
						{
							color				: color,
							whiskers_quantiles	: [10, 90],
						}
					)
					self.diameter_chart_wrapper.render()
				}

				if (axis.length) {
					const axis_wrapper = common.create_dom_element({
						element_type	: 'div',
						class_name		: 'type_analytics_component',
						parent			: analytics_div_wrapper
					})
					const separator = common.create_dom_element({
						element_type	: 'div',
						class_name		: 'info_line separator',
						parent			: axis_wrapper
					})
					common.create_dom_element({
						element_type	: 'div',
						class_name		: 'big_label',
						text_content	: tstring.die_position || 'Die axis',
						parent			: separator
					})
					const chart_wrapper = common.create_dom_element({
						element_type	: 'div',
						class_name		: 'chart_wrapper',
						parent			: axis_wrapper
					})
					self.axis_chart_wrapper = new minimal_clock_chart_wrapper(
						chart_wrapper,
						axis_counts,
						{}
					)
					self.axis_chart_wrapper.render()
				}
			}

		// findspots - hoards_and_findspots - (hallazgos) list
			// if (item.ref_coins_findspots_data && item.ref_coins_findspots_data.length>0) {
			// 	fragment.appendChild( self.label(item, tstring.findspots) )
			// 	fragment.appendChild(
			// 		self.hoards_and_findspots(item, "findspots")
			// 	)
			// }

		// hoards - hoards_and_findspots - (tesoros) list
			// if (item.ref_coins_hoard_data && item.ref_coins_hoard_data.length>0) {
			// 	fragment.appendChild( self.label(item, tstring.hoards) )
			// 	fragment.appendChild(
			// 		self.hoards_and_findspots(item, "hoards")
			// 	)
			// }

		// mix hoards and findspots
			if ( (item.ref_coins_findspots_data && item.ref_coins_findspots_data.length>0) ||
				 (item.ref_coins_hoard_data && item.ref_coins_hoard_data.length>0)
				) {
				const label = tstring.findspots + "/" + tstring.hoards + "/" + tstring.mints
				fragment.appendChild( self.label(item, label) )
				fragment.appendChild(
					self.hoards_and_findspots(item, label)
				)
			}

		// row_wrapper
			const row_wrapper = common.create_dom_element({
				element_type	: "div",
				class_name		: "row_wrapper"
			})
			row_wrapper.appendChild(fragment)


		return row_wrapper
	},//end draw_item



	dedalo_link : function(item, section_tipo) {

		const dedalo_link = common.create_dom_element({
			element_type	: "a",
			class_name		: "section_id go_to_dedalo",
			inner_html		: item.section_id + " <small>(" + section_tipo +")</small>",
			href			: '/dedalo/lib/dedalo/main/?t=' + section_tipo + '&id=' + item.section_id
		})
		dedalo_link.setAttribute('target', '_blank');

		return dedalo_link
	},//end dedalo_link



	default : function(item, name, fn) {

		// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line " + name
			})

		if (item[name] && item[name].length>0) {

			// common.create_dom_element({
				// 	element_type 	: "label",
				// 	class_name 		: "",
				// 	text_content 	: tstring[name]|| name,
				// 	parent 			: line
				// })

			const searchTerms = ["design_obverse","design_reverse","symbol_reverse","symbol_obverse"];

			const item_text = (typeof fn==="function")
				? fn(item[name])
				: page.remove_gaps(item[name], " | ")

			if (searchTerms.includes(name)) {

				// common.create_dom_element({
				// 	element_type	: "a",
				// 	class_name		: "info_value",
				// 	inner_html		: item_text.trim(),
				// 	parent			: line
				// })

				const psqo = {
					"$and":[{
						id	: name,
						q	: item[name],
						op	: '='
					}]
				}
				const safe_psqo		= psqo_factory.build_safe_psqo(psqo)
				const parse_psqo	= psqo_factory.encode_psqo(safe_psqo)

				const catalog_url = page_globals.__WEB_ROOT_WEB__+"/catalog/?psqo="+ parse_psqo

				const prompt_label = common.create_dom_element({
					element_type	: "a",
					class_name		: "info_value underline-text",
					inner_html 		: item_text.trim(),
					href			: catalog_url,
					parent 			: line
				})

			} else {
				common.create_dom_element({
					element_type	: "span",
					class_name		: "info_value",
					inner_html		: item_text.trim(),
					parent			: line
				})
			}
		}


		return line
	},//end default



	label : function(item, name) {

		// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line separator " + name
			})

			common.create_dom_element({
				element_type 	: "div",
				class_name 		: "big_label",
				text_content 	: tstring[name]|| name,
				parent 			: line
			})


		return line
	},//end label



	catalog_hierarchy : function(item, name) {

		// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line inline " + name
			})

		const catalog = item.catalog

		if (catalog && Object.keys(catalog).length > 0 && catalog.constructor === Object ) {

			const parents = catalog.parents
			const parents_ordered = []

			for (let i = 0; i < parents.length; i++) {
				parents_ordered.push(parents[i])
				if(parents[i].term_table === 'mints') break;
			}

			for (let i = parents_ordered.length - 1; i >= 0; i--) {

				if (parents_ordered[i].term_table === 'mints') {
					// console.log("parents_ordered[i]", parents_ordered[i]);
					const mint_section_id = (parents_ordered[i].term_data)
						? JSON.parse(parents_ordered[i].term_data)[0]
						: ''

					const link = common.create_dom_element({
						element_type	: "a",
						class_name		: "breadcrumb link link_mint",
						href			: page_globals.__WEB_ROOT_WEB__ + '/mint/' + mint_section_id,
						target			: '_blank',
						text_content	: parents_ordered[i].term,
						parent			: line
					})
				}else{
					common.create_dom_element({
						element_type 	: "span",
						class_name 		: "breadcrumb " + parents_ordered[i].term_table,
						text_content	: parents_ordered[i].term,
						parent 			: line
					})
				}


				common.create_dom_element({
					element_type 	: "span",
					class_name 		: "breadcrumb_symbol",
					text_content	: " > ",
					parent 			: line
				})
			}

			const mint_number = (catalog.ref_mint_number)
				? catalog.ref_mint_number+'/'
				: ''

			common.create_dom_element({
				element_type 	: "span",
				class_name 		: "breadcrumb",
				text_content	: page_globals.OWN_CATALOG_ACRONYM + " " + mint_number + catalog.term,
				parent 			: line
			})
		}


		return line
	},//end catalog_hierarchy



	creators : function(item, name) {

		// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line " + name
			})


		if (item.creators_data && item.creators_data.length>0) {
			const data = JSON.parse(item.creators_data)

			const ar_names		= item.creators_names
				? item.creators_names.split(' | ')
				: []
			const ar_surnames	= item.creators_surnames
				? item.creators_surnames.split(' | ')
				: []
			const ar_roles		= item.creators_roles
				? item.creators_roles.split('|')
				: []

			const text_creators = []
			const data_length = data.length

			for (var i = 0; i < data_length; i++) {
				const name		= ar_names[i]
					? ar_names[i]
					: ''
				const surname	= ar_surnames[i]
					? ar_surnames[i]
					: ''
				const rol		= ar_roles[i]
					? '('+ ar_roles[i] + ')'
					: ''

				const creator_name = name + ' ' + surname
				const creator = creator_name.trim() + ' ' + rol

				text_creators.push(creator.trim())
			}

			common.create_dom_element({
				element_type 	: "span",
				class_name 		: "creators",
				text_content 	: text_creators.join(' | '),
				parent 			: line
			})

		}


		return line
	},//end creators



	image : function(item, name) {

		const self = this

		// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line inline " + name
			})

		if (item[name] && item[name].length>0) {

			const url = item[name]

			const image_link = common.create_dom_element({
				element_type	: "a",
				class_name		: "image_link",
				href			: url,
				parent			: line
			})

			common.create_dom_element({
				element_type	: "img",
				class_name		: "image",
				src				: url,
				title			: item.number,
				dataset			: {
					caption : self.type + ' | '+self.equivalents
				},
				parent			: image_link
			})
		}


		return line
	},//end image



	identify_coin : function(item, name) {

		// const self = this
		//
		// // line
		// 	const line = common.create_dom_element({
		// 		element_type	: "div",
		// 		class_name		: "info_line inline " + name
		// 	})
		//
		// const ar_str_coins = page.split_data(item.ref_coins, ' | ')
		//
		// const ar_coins = []
		// for (var i = 0; i < ar_str_coins.length; i++) {
		// 	ar_coins.push(JSON.parse(ar_str_coins[i]))
		// }
		// const identify_coin_id = ar_coins[0][0]
		// const identify_coin = item.ref_coins_union.find(item => item.section_id===identify_coin_id)

		// if (identify_coin) {

			// // uri
			// 	const uri		= page_globals.__WEB_ROOT_WEB__ + "/coin/" + identify_coin_id
			// 	const full_url	= page_globals.__WEB_BASE_URL__ + uri
			// 	const uri_text	= '<a class="icon_link info_value" target="_blank" href="' +uri+ '"> URI </a> '
			// 	common.create_dom_element({
			// 		element_type	: "span",
			// 		class_name		: "",
			// 		inner_html		: uri_text,
			// 		parent			: line
			// 	})
			//
			// // collection uri
			//
			// 	if (identify_coin.uri && identify_coin.uri.length>0) {
			// 		for (let i = 0; i < identify_coin.uri.length; i++) {
			//
			// 			const el = identify_coin.uri[i]
			// 			const label	= el.label || "URI"
			// 			const uri_text	= '<a class="icon_link info_value" href="' + el.value + '" target="_blank"> ' + el.label  + '</a>'
			//
			// 			common.create_dom_element({
			// 				element_type	: "span",
			// 				class_name		: "",
			// 				inner_html		: uri_text,
			// 				parent			: line
			// 			})
			//
			// 		}
			// 	}



			// // collection
			// 	if (identify_coin.collection.length>0){
			//
			// 		// line
			// 			const line_collection = common.create_dom_element({
			// 				element_type	: "span",
			// 				class_name		: "info_value",
			// 				parent			: line
			// 			})
			//
			// 			common.create_dom_element({
			// 				element_type	: "span",
			// 				class_name		: name + " golden-color",
			// 				inner_html		: identify_coin.collection,
			// 				parent			: line_collection
			// 			})
			// 		// number
			// 			if (identify_coin.number.length>0){
			//
			// 				common.create_dom_element({
			// 					element_type	: "span",
			// 					class_name		: name + " golden-color",
			// 					inner_html		: " "+ identify_coin.number,
			// 					parent			: line_collection
			// 				})
			// 			}
			// 	}


			// // auction
			// 	function draw_auction(data, parent, class_name, prepend) {
			//
			// 		if (data.name.length<1) return
			// 		// line
			// 			const line = common.create_dom_element({
			// 				element_type	: "span",
			// 				class_name		: "info_value",
			// 				parent			: parent
			// 			})
			// 		// name
			// 			if (data.name) {
			// 				common.create_dom_element({
			// 					element_type	: "span",
			// 					class_name		: class_name+ " golden-color",
			// 					inner_html		: prepend + data.name,
			// 					parent			: line
			// 				})
			// 			}
			// 		// ref_auction_date
			// 			if (data.date) {
			// 				common.create_dom_element({
			// 					element_type	: "span",
			// 					class_name		: class_name+" golden-color",
			// 					inner_html		: " | " + data.date,
			// 					parent			: line
			// 				})
			// 			}
			// 		// number
			// 			if (data.number) {
			// 				common.create_dom_element({
			// 					element_type	: "span",
			// 					class_name		: class_name+" golden-color",
			// 					inner_html		: " "+ data.number,
			// 					parent			: line
			// 				})
			// 			}
			//
			// 		return true
			// 	}
			//
			// 	if (identify_coin.ref_auction_group) {
			// 		for (let i = 0; i < identify_coin.ref_auction_group.length; i++) {
			// 			draw_auction(identify_coin.ref_auction_group[i], line, name, '')
			// 		}
			// 	}
			// 	if (identify_coin.ref_related_coin_auction_group) {
			// 		for (let i = 0; i < identify_coin.ref_related_coin_auction_group.length; i++) {
			//
			// 			draw_auction(identify_coin.ref_related_coin_auction_group[i], line, name, '= ')
			// 		}
			// 	}
			//
			// 	// public_info
			// 		if (identify_coin.public_info && identify_coin.public_info.length>0){
			// 			// const label = (tstring.public_info || "Public_info")+": ";
			//
			// 			common.create_dom_element({
			// 			element_type	: "div",
			// 			class_name		: "",
			// 			inner_html		: identify_coin.public_info,
			// 			parent			: line
			// 		})
			// 	}
				// // auction name
				// 	common.create_dom_element({
				// 		element_type 	: "span",
				// 		class_name 		: name,
				// 		text_content 	: identify_coin.ref_auction,
				// 		parent 			: line
				// 	})

				// // auction final_date
				// 	const split_time 	= (identify_coin.ref_auction_date)
				// 		? identify_coin.ref_auction_date.split(' ')
				// 		: [""]
				// 	const split_date 	= split_time[0].split('-')
				// 	const correct_date 	= split_date.reverse()
				// 	const final_date 	= correct_date.join("-")

				// 	if (final_date) {
				// 		common.create_dom_element({
				// 			element_type 	: "span",
				// 			class_name 		: name,
				// 			text_content 	: " | "+final_date,
				// 			parent 			: line
				// 		})
				// 	}

				// // auction ref_auction_number
				// 	if(identify_coin.ref_auction_number){
				// 		common.create_dom_element({
				// 			element_type 	: "span",
				// 			class_name 		: name,
				// 			text_content 	: ", "+(tstring.n || "nº") +" "+ identify_coin.ref_auction_number,
				// 			parent 			: line
				// 		})
				// 	}

			// size_text. weight / dies / diameter
			// 	const ar_beats = []
			// 	if (identify_coin.weight && identify_coin.weight.length>0) {
			// 		ar_beats.push( identify_coin.weight.replace('.', ',') + " g" )
			// 	}
			//
			// 	if (identify_coin.diameter && identify_coin.diameter.length>0) {
			// 		ar_beats.push( identify_coin.diameter.replace('.', ',') + " mm" )
			// 	}
			// 	if (identify_coin.dies && identify_coin.dies.length>0) {
			// 		ar_beats.push( identify_coin.dies + " h" )
			// 	}
			// 	const size_text = ar_beats.join("; ")
			//
			// common.create_dom_element({
			// 	element_type 	: "span",
			// 	class_name 		: name,
			// 	text_content 	: " ("+size_text+")",
			// 	parent 			: line
			// })
		// }


		// return line
	},//end identify_coin



	id_line : function(item, name) {

		const self = this

		// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line " + name
			})

		// ar_nodes
			const ar_nodes = []

		// catalogue
			name = "catalogue"
			if (item[name] && item[name].length>0) {

				// const catalogue_number = JSON.parse(item["catalogue_data"])[0]
				// const type_section_id = item["section_id"]

				const mint_number = (item.mint_number)
					? item.mint_number+'/'
					: ''

				const item_text = item[name] + " " +  mint_number + item["number"]

				self.type = item_text
				const node = common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value " + name,
					text_content 	: item_text
				})
				ar_nodes.push(node)
			}

		// denomination
			name = "denomination"
			if (item[name] && item[name].length>0) {

				const item_text = item[name]

				const node = common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value " + name,
					text_content 	: item_text
				})
				ar_nodes.push(node)

				// denomination_description
				self.create_float_prompt(item,node,"denomination_data")
			}

		// material
			name = "material"
			if (item[name] && item[name].length>0) {

				const beats		= page.split_data(item[name], ' | ')
				const item_text	= beats.filter(Boolean).join(", ")

				var material_node = common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value " + name,
					text_content 	: item_text
				})
				ar_nodes.push(material_node)
			}

		// material_uris
			self.create_float_prompt(item,material_node,"material_data")


		// averages
			name = "averages"
			if (item["averages_weight"] && item["averages_weight"].length>0) {

				const weight_text	= item["averages_weight"]
					? item["averages_weight"].replace('.', ',') + " g (" + item["total_weight_items"] + ")"
					: ''
				const diameter_text	= item["averages_diameter"]
					? '; '+item["averages_diameter"].replace('.', ',') + " mm (" + item["total_diameter_items"] + ")"
					: ''

				const node = common.create_dom_element({
					element_type 	: "span",
					class_name 		: "info_value " + name,
					text_content 	: weight_text + diameter_text
				})
				ar_nodes.push(node)
			}

		// nodes append
			const ar_nodes_length = ar_nodes.length
			for (let i = 0; i < ar_nodes_length; i++) {
				// separator
				if (i>0 && i<ar_nodes_length) {
					common.create_dom_element({
						element_type	: "span",
						class_name		: "info_value separator",
						text_content	: " | ",
						parent			: line
					})
				}
				// node
				line.appendChild(ar_nodes[i])
			}


		return line
	},//end id_line



	items_list : function(item, name, data) {

		const self = this

		// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line " + name
			})

		// function draw_coin(data, container) {

		// 	const wrapper = common.create_dom_element({
		// 		element_type	: "div",
		// 		class_name		: "sorted_coin",
		// 		parent			: container
		// 	})

		// 	// images
		// 		const images = common.create_dom_element({
		// 			element_type	: "div",
		// 			class_name		: "images_wrapper",
		// 			parent			: wrapper
		// 		})
		// 		const image_link_obverse = common.create_dom_element({
		// 			element_type	: "a",
		// 			class_name		: "image_link",
		// 			href			: data.image_obverse,
		// 			parent			: images
		// 		})
		// 		const image_obverse = common.create_dom_element({
		// 			element_type	: "img",
		// 			src				: data.image_obverse,
		// 			parent			: image_link_obverse
		// 		})
		// 		image_obverse.loading="lazy"
		// 		const image_link_reverse = common.create_dom_element({
		// 			element_type	: "a",
		// 			class_name		: "image_link",
		// 			href			: data.image_reverse,
		// 			parent			: images
		// 		})
		// 		const image_reverse = common.create_dom_element({
		// 			element_type	: "img",
		// 			src				: data.image_reverse,
		// 			parent			: image_link_reverse
		// 		})
		// 		image_reverse.loading="lazy"

		// 	// collection
		// 		if (data.collection.length>0){

		// 			const collection_label = (data.number && data.number.length>0)
		// 				? data.collection + " (" + data.number + ")"
		// 				: data.collection

		// 			common.create_dom_element({
		// 				element_type	: "div",
		// 				class_name		: "golden-color",
		// 				inner_html		: collection_label,
		// 				parent			: wrapper
		// 			})

		// 			if (data.former_collection.length>0){
		// 				common.create_dom_element({
		// 					element_type	: "div",
		// 					class_name		: "",
		// 					inner_html		: "("+data.former_collection+")",
		// 					parent			: wrapper
		// 				})
		// 			}
		// 		}

		// 	// size. weight / dies / diameter
		// 		const ar_beats = []
		// 		if (data.weight && data.weight.length>0) {
		// 			ar_beats.push( data.weight.replace('.', ',') + " g" )
		// 		}
		// 		if (data.diameter && data.diameter.length>0) {
		// 			ar_beats.push( data.diameter.replace('.', ',') + " mm" )
		// 		}
		// 		if (data.dies && data.dies.length>0) {
		// 			ar_beats.push( data.dies + " h" )
		// 		}
		// 		const size_text = ar_beats.join("; ")
		// 		common.create_dom_element({
		// 			element_type	: "div",
		// 			class_name		: "",
		// 			inner_html		: size_text,
		// 			parent			: wrapper
		// 		})

		// 	// findspots + hoard
		// 		const ar_find = []
		// 		let label = ""
		// 		if(data.hoard){
		// 			const hoard = (data.hoard_place)
		// 				? data.hoard + " ("+data.hoard_place+")"
		// 				: data.hoard
		// 			label = (tstring.hoard || "Hoard")+": "
		// 			ar_find.push( hoard )
		// 		}
		// 		if(data.findspot){
		// 			const findspot = (data.findspot_place)
		// 				? data.findspot + " ("+data.findspot_place+")"
		// 				: data.findspot
		// 			label = (tstring.fiindspot || "Findspot")+": "
		// 			ar_find.push( findspot )
		// 		}

		// 		const find_text = ar_find.join(" | ")
		// 		common.create_dom_element({
		// 			element_type	: "div",
		// 			class_name		: "",
		// 			inner_html		: label+find_text,
		// 			parent			: wrapper
		// 		})

		// 	// auction
		// 		function draw_auction(data, parent, class_name, prepend) {

		// 			if (data.name.length<1) return

		// 			// line
		// 				const line = common.create_dom_element({
		// 					element_type	: "div",
		// 					class_name		: "line_full",
		// 					parent			: parent
		// 				})
		// 			// name
		// 				if (data.name) {
		// 					common.create_dom_element({
		// 						element_type	: "span",
		// 						class_name		: class_name+" golden-color",
		// 						inner_html		: prepend + " " + data.name,
		// 						parent			: line
		// 					})
		// 				}
		// 			// ref_auction_date
		// 				if (data.date) {
		// 					common.create_dom_element({
		// 						element_type	: "span",
		// 						class_name		: class_name+" golden-color",
		// 						inner_html		: " " + data.date,
		// 						parent			: line
		// 					})
		// 				}
		// 			// number
		// 				if (data.number) {
		// 					common.create_dom_element({
		// 						element_type	: "span",
		// 						class_name		: class_name+" golden-color",
		// 						inner_html		: " "+(tstring.n || "nº") +" "+ data.number,
		// 						parent			: line
		// 					})
		// 				}

		// 			return true
		// 		}
		// 		if (data.ref_auction_group) {
		// 			for (let i = 0; i < data.ref_auction_group.length; i++) {
		// 				draw_auction(data.ref_auction_group[i], wrapper, "identify_coin", '')
		// 			}
		// 		}
		// 		if (data.ref_related_coin_auction_group) {
		// 			for (let i = 0; i < data.ref_related_coin_auction_group.length; i++) {
		// 				draw_auction(data.ref_related_coin_auction_group[i], wrapper, "identify_coin", '= ')
		// 			}
		// 		}

		// 	// public_info
		// 		if (data.public_info && data.public_info.length>0){

		// 			const label = (tstring.public_info || "Public_info") + ": "
		// 			common.create_dom_element({
		// 				element_type	: "div",
		// 				inner_html		: label + data.public_info,
		// 				parent			: wrapper
		// 			})
		// 		}

		// 	// biblio
		// 		const references_container = common.create_dom_element({
		// 			element_type	: "div",
		// 			class_name		: "references",
		// 			parent			: wrapper
		// 		})
		// 		const ar_references = data.bibliography_data
		// 		references_container.appendChild(
		// 			self.draw_bibliographic_reference(ar_references)
		// 		)

		// 	// uri
		// 		const uri		= page_globals.__WEB_ROOT_WEB__ + "/coin/" + data.section_id
		// 		const full_url	= page_globals.__WEB_BASE_URL__ + uri
		// 		const uri_text	= "<a class=\"icon_link\" href=\""+uri+"\"> URI </a>"
		// 		common.create_dom_element({
		// 			element_type	: "div",
		// 			class_name		: "uri-text",
		// 			inner_html		: uri_text,
		// 			parent			: wrapper
		// 		})

		// }//end draw_coin


		// coins group iterate
			const coins_group_length = data.length
			for (let i = 0; i < coins_group_length; i++) {

				const el			= data[i]
				const coinsLenght	= el.coins
					? el.coins.length
					: 0;

				if (coinsLenght<1) {
					continue; // ignore empty coins
				}

				if (el.typology_id==1) continue; // ignore identify images typology

				// typology label
				const typology_name	= el.typology
				common.create_dom_element({
					element_type 	: "div",
					class_name 		: "medium_label",
					text_content 	: typology_name+" ("+coinsLenght+")",
					parent 			: line
				})

				const typology_coins = common.create_dom_element({
					element_type	: "div",
					class_name		: "coins_list typology_coins gallery",
					parent			: line
				})

				const coins			= el.coins;
				const coins_length	= coins.length
				for (let j = 0; j < coins_length; j++) {
					const coin_section_id	= coins[j]

					const coin_data = item.ref_coins_union.find(element => element.section_id==coin_section_id)
					if (coin_data) {
						// draw_coin(coin_data, typology_coins)
						const coin_node = self.draw_coin(coin_data)
						typology_coins.appendChild(coin_node)
					}
				}
			}


		return line
	},//end items_list



	draw_coin : function(data) {

		const self = this

		// load_hires. When thumb is loaded, this event is triggered
		function load_hires() {

			this.removeEventListener("load", load_hires, false)

			const image = this
			const hires = this.hires
			setTimeout(function(){
				image.src = hires
			}, 1000)
		}

		const wrapper = common.create_dom_element({
			element_type	: "div",
			class_name		: "sorted_coin"
		})

		// images


			// obverse
			const images = common.create_dom_element({
				element_type	: "div",
				class_name		: "images_wrapper",
				parent			: wrapper
			})
			const image_link_obverse = common.create_dom_element({
				element_type	: "a",
				class_name		: "image_link",
				href			: data.image_obverse,
				parent			: images
			})
			const image_obverse = common.create_dom_element({
				element_type	: "img",
				src				: data.image_obverse_thumb,
				title 			: data.section_id,
				/*
				dataset 		: {
									caption: self.type +' | '+self.equivalents
								},
				*/
				loading			: "lazy",
				parent			: image_link_obverse
			})
			image_obverse.hires = data.image_obverse
			image_obverse.addEventListener("load", load_hires, false)
			// reverse
			const image_link_reverse = common.create_dom_element({
				element_type	: "a",
				class_name		: "image_link",
				href			: data.image_reverse,
				parent			: images
			})
			const image_reverse = common.create_dom_element({
				element_type	: "img",
				src				: data.image_reverse_thumb,
				title 			: data.section_id,
				/*
				dataset 		: {
									caption: self.type +' | '+self.equivalents
								},
				*/
				loading			: "lazy",
				parent			: image_link_reverse
			})
			image_reverse.hires = data.image_reverse
			image_reverse.addEventListener("load", load_hires, false)

		// collection
			if (data.collection && data.collection.length>0){

				const collection_former = (data.former_collection && data.former_collection.length>0)
					? data.collection + " ("+data.former_collection+")"
					: data.collection

				const collection_label = (data.number && data.number.length>0)
					? collection_former+ " "+ data.number
					: collection_former

				//put gallery attributes to img
				image_obverse.setAttribute("data-caption",collection_label)
				image_reverse.setAttribute("data-caption",collection_label)

				common.create_dom_element({
					element_type	: "div",
					class_name		: "golden-color",
					inner_html		: collection_label,
					parent			: wrapper
				})
			}

		// auction
			function draw_auction(data, parent, class_name, prepend) {

				if (data.name.length<1) return
				let auctionGalleryAttributes = ""

				// line
					const line = common.create_dom_element({
						element_type	: "div",
						class_name		: "line_full",
						parent			: parent
					})
				// name
					if (data.name) {
						auctionGalleryAttributes += prepend + " " + data.name
						common.create_dom_element({
							element_type	: "span",
							class_name		: class_name+" golden-color",
							inner_html		: prepend + " " + data.name,
							parent			: line
						})
					}
				// ref_auction_date
					if (data.date) {
						auctionGalleryAttributes += " " + data.date
						common.create_dom_element({
							element_type	: "span",
							class_name		: class_name+" golden-color",
							inner_html		: " " + data.date,
							parent			: line
						})
					}
				// number
					if (data.number) {
						auctionGalleryAttributes += ", "+ data.number
						common.create_dom_element({
							element_type	: "span",
							class_name		: class_name+" golden-color",
							inner_html		: ", "+ data.number,
							parent			: line
						})
					}

				// lot
					if (data.lot) {
						auctionGalleryAttributes += ", "+(tstring.lot || 'lot') +" "+ data.lot
						common.create_dom_element({
							element_type	: "span",
							class_name		: class_name+" golden-color",
							inner_html		: ", "+(tstring.lot || 'lot') +" "+ data.lot,
							parent			: line
						})
					}

					image_obverse.setAttribute("data-caption",auctionGalleryAttributes)
					image_reverse.setAttribute("data-caption",auctionGalleryAttributes)

				return true
			}


		//GET IMAGE PHOTOGRAPHER

			// (!) COMMENTED : UNFEASIBLE FOR MAP . REMOVED 14-03-2022 UNTIL RESOLVE IT IN A VIABLE WAY
				// const observer = new IntersectionObserver(async function(entries) {
				// 	const entry = entries[1] || entries[0]
				// 	if (entry.isIntersecting===true || entry.intersectionRatio > 0) {
				// 		observer.disconnect();

				// 		self.get_image_data({
				// 			section_id : JSON.parse(data.image_obverse_data)[0]
				// 		})
				// 		.then(function(result){
				// 			if (result[0] && result[0].photographer) {
				// 				const currentAttr = image_obverse.getAttribute("data-caption")
				// 				image_obverse.setAttribute("data-caption", currentAttr + '<spam> | </spam> <i class="fa fa-camera"></i> ' + result[0].photographer)
				// 				console.log("image_obverse:",image_obverse);
				// 			}
				// 		})
				// 	}
				// }, { threshold: [0] });
				// observer.observe(image_obverse);

			// direct from DDBB, column 'photographer'
				if (data.photographer) {
					const currentAttr = image_obverse.dataset.caption || ''
					image_obverse.setAttribute("data-caption", currentAttr + '<spam> | </spam> <i class="fa fa-camera"></i> ' + data.photographer)
				}

			/*
			self.get_image_data({
				section_id : JSON.parse(data.image_reverse_data)[0]
			})
			.then(function(result){
				const image_reverse_photographer = result.photographer
			})
			*/
			//END GET IMAGE PHOTOGRAPHER

			if (data.ref_auction_group) {
				for (let i = 0; i < data.ref_auction_group.length; i++) {
					data.ref_auction_group[i].lot = data.number
					draw_auction(data.ref_auction_group[i], wrapper, "identify_coin", '')
				}
			}

			if (data.ref_related_coin_auction_group) {
				for (let i = 0; i < data.ref_related_coin_auction_group.length; i++) {
					data.ref_related_coin_auction_group[i].lot = data.number
					draw_auction(data.ref_related_coin_auction_group[i], wrapper, "identify_coin", '= ')
				}
			}

		// size. weight / dies / diameter
			const ar_beats = []
			if (data.weight && data.weight.length>0) {
				ar_beats.push( data.weight.replace('.', ',') + " g" )
			}
			if (data.diameter && data.diameter.length>0) {
				ar_beats.push( data.diameter.replace('.', ',') + " mm" )
			}
			if (data.dies && data.dies.length>0) {
				ar_beats.push( data.dies + " h" )
			}
			const size_text = ar_beats.join("; ")
			common.create_dom_element({
				element_type	: "div",
				class_name		: "",
				inner_html		: size_text,
				parent			: wrapper
			})

		// findspots + hoard
			const ar_find = []
			let label = ""
			if(data.hoard){
				const hoard = (data.hoard_place)
					? data.hoard + " ("+data.hoard_place+")"
					: data.hoard
				label = (tstring.hoard || "Hoard")+": "
				ar_find.push( hoard )
			}
			if(data.findspot){
				const findspot = (data.findspot_place)
					? data.findspot + " ("+data.findspot_place+")"
					: data.findspot
				label = (tstring.findspot || "Findspot")+": "
				ar_find.push( findspot )
			}

			const find_text = ar_find.join(" | ")
			common.create_dom_element({
				element_type	: "div",
				class_name		: "",
				inner_html		: label+find_text,
				parent			: wrapper
			})

		// public_info
			if (data.public_info && data.public_info.length>0){

				// const label = (tstring.public_info || "Public_info") + ": "
				common.create_dom_element({
					element_type	: "div",
					inner_html		: data.public_info, //label + data.public_info,
					parent			: wrapper
				})
			}

		// technique
			if (data.technique && data.technique.length>0){

				const label = (tstring.technique || "Technique") + ": "
				common.create_dom_element({
					element_type	: "div",
					inner_html		: label + data.technique,
					parent			: wrapper
				})
			}

		// countermarks
			const countermarks = common.create_dom_element({
				element_type	: "div",
				class_name		: "countermarks_wrapper",
				parent			: wrapper
			})

		// countermark_obverse
			if (data.countermark_obverse && data.countermark_obverse.length>0){

				common.create_dom_element({
					element_type	: "span",
					class_name		: "countermark_obverse",
					inner_html		: data.countermark_obverse,
					parent			: countermarks
				})
			}
		// countermark_reverse
			if (data.countermark_reverse && data.countermark_reverse.length>0){

				common.create_dom_element({
					element_type	: "span",
					class_name		: "countermark_reverse",
					inner_html		: data.countermark_reverse,
					parent			: countermarks
				})
			}

		// biblio
			const references_container = common.create_dom_element({
				element_type	: "div",
				class_name		: "references",
				parent			: wrapper
			})


			const ar_references = data.bibliography_data
			if (ar_references && ar_references.length>0 && typeof ar_references[0]==='object') {
				const biblio_node = self.draw_bibliographic_reference(ar_references)
				if (biblio_node) references_container.appendChild(biblio_node)
			}

		// uri
			const uri		= page_globals.__WEB_ROOT_WEB__ + "/coin/" + data.section_id
			const full_url	= page_globals.__WEB_BASE_URL__ + uri
			const uri_text	= '<a class="icon_link" target="_blank" href="' +uri+ '"> '+page_globals.OWN_CATALOG_ACRONYM +' </a>'
			common.create_dom_element({
				element_type	: "span",
				class_name		: "uri-text",
				inner_html		: uri_text,
				parent			: wrapper
			})


		//collection uri
			if (data.uri && data.uri.length>0) {
				for (let i = 0; i < data.uri.length; i++) {

					const el = data.uri[i]
					const label	= el.label || "URI"
					const uri_text	= '<a class="icon_link info_value" href="' + el.value + '" target="_blank"> ' + el.label  + '</a>'

					common.create_dom_element({
						element_type	: "span",
						class_name		: "",
						inner_html		: uri_text,
						parent			: wrapper
					})

				}
			}


		return wrapper
	},//end draw_coin


	// DES
		// get_image_data : function(options) {
		// 	const self = this

		// 	const section_id = options.section_id

		// 	// vars
		// 		const sql_filter	= 'section_id=' + parseInt(section_id)
		// 		const ar_fields		= ['*']

		// 	return new Promise(function(resolve){

		// 		// request
		// 		const request_body = {
		// 			dedalo_get	: 'records',
		// 			table		: 'images',
		// 			ar_fields	: ar_fields,
		// 			lang		: page_globals.WEB_CURRENT_LANG_CODE,
		// 			sql_filter	: sql_filter,
		// 		}
		// 		data_manager.request({
		// 			body : request_body
		// 		})
		// 		.then(function(response){
		// 			// console.log("++++++++++++ request_body:",request_body);
		// 			 // console.log("get_image_data:",response);

		// 			resolve(response.result)
		// 		})
		// 	})
		// },

	draw_bibliographic_reference : function(data) {

		const bib_fragment = new DocumentFragment;

		const ref_biblio		= data
		const ref_biblio_length	= ref_biblio ? ref_biblio.length : 0
		for (let i = 0; i < ref_biblio_length; i++) {

			// build full ref biblio node
			const biblio_row_node = biblio_row_fields.render_row_bibliography(ref_biblio[i])

			const biblio_row_wrapper = common.create_dom_element({
				element_type	: "div",
				class_name		: "bibliographic_reference",
				parent			: bib_fragment
			})
			biblio_row_wrapper.appendChild(biblio_row_node)
		}

		return bib_fragment
	},//end draw_bibliographic_reference



	hoards_and_findspots : function(item, name) {
		if(SHOW_DEBUG===true) {
			// console.log("item.ref_coins_findspots_data:",item.ref_coins_findspots_data)
		}

		const self = this

		// line
			const line = common.create_dom_element({
				element_type	: "div",
				id				: "findspots",
				class_name		: "info_line " + name
			})
			// common.when_in_dom(line, function(){line.scrollIntoView(false);})

		// map_container
			const map_container = common.create_dom_element({
				element_type	: "div",
				class_name		: "map_container hide_opacity map",
				parent			: line
			})

		function draw_coin_inside(data, container) {
			// console.log("--draw_coin_inside data:",data);

			const wrapper = common.create_dom_element({
				element_type	: "div",
				class_name		: "find_coin",
				parent			: container
			})

			// images

				const images = common.create_dom_element({
					element_type	: "div",
					class_name		: "images_wrapper",
					parent			: wrapper
				})
				const image_link_obverse = common.create_dom_element({
					element_type	: "a",
					class_name		: "image_link",
					href			: data.image_obverse,
					parent			: images
				})
				const image_obverse = common.create_dom_element({
					element_type	: "img",
					src				: data.image_obverse,
					title 			: data.section_id,
					dataset 		: {
									caption: self.type +' | '+self.equivalents
								},
					parent			: image_link_obverse
				})
				image_obverse.loading="lazy"

				const image_link_reverse = common.create_dom_element({
					element_type	: "a",
					class_name		: "image_link",
					href			: data.image_reverse,
					parent			: images
				})
				const image_reverse = common.create_dom_element({
					element_type	: "img",
					src				: data.image_reverse,
					title 			: data.section_id,
					dataset 		: {
									caption: self.type +' | '+self.equivalents
								},
					parent			: image_link_reverse
				})
				image_reverse.loading="lazy"

			// info
				const info = common.create_dom_element({
					element_type	: "div",
					class_name		: "info_wrapper",
					parent			: wrapper
				})
				// collection
					common.create_dom_element({
						element_type	: "div",
						class_name		: "",
						inner_html		: data.collection,
						parent			: info
					})
				// size_text. weight / dies / diameter
					const ar_beats = []
					if (data.weight && data.weight.length>0) {
						ar_beats.push( data.weight.replace('.', ',') + " g" )
					}

					if (data.diameter && data.diameter.length>0) {
						ar_beats.push( data.diameter.replace('.', ',') + " mm" )
					}
					if (data.dies && data.dies.length>0) {
						ar_beats.push( data.dies + " h" )
					}
					const size_text = ar_beats.join("; ")
					common.create_dom_element({
						element_type	: "div",
						class_name		: "",
						inner_html		: size_text,
						parent			: info
					})
				// uri
					const uri		= page_globals.__WEB_ROOT_WEB__ + "/coin/" + data.section_id
					const full_uri	= page_globals.__WEB_BASE_URL__ + uri
					const uri_text	= '<a class="icon_link" target="_blank" href="' +uri+ '"> '+page_globals.OWN_CATALOG_ACRONYM +' </a>'
					common.create_dom_element({
						element_type	: "span",
						class_name		: "",
						inner_html		: uri_text,
						parent			: info
					})


				//collection uri
					if (data.uri && data.uri.length>0) {
						for (let i = 0; i < data.uri.length; i++) {

							const el = data.uri[i]
							const label	= el.label || "URI"
							const uri_text	= '<a class="icon_link info_value" href="' + el.value + '" target="_blank"> ' + el.label  + '</a>'

							common.create_dom_element({
								element_type	: "span",
								class_name		: "",
								inner_html		: uri_text,
								parent			: info
							})

						}
					}
				// hoard
					common.create_dom_element({
						element_type	: "div",
						class_name		: "",
						inner_html		: data.hoard,
						parent			: info
					})
				// biblio
					const references_container = common.create_dom_element({
						element_type	: "div",
						class_name		: "references",
						parent			: info
					})
					const ar_references = data.bibliography_data
						references_container.appendChild(
							self.draw_bibliographic_reference(ar_references)
						)

		}//end draw_coin_inside


		// map, global array with all map data and cache for resolve section_id
			const map_data				= []
			const findspots_solved		= []
			const hoards_solved			= []

		// hoards
			const hoards_data			= item.ref_coins_hoard_data
			const hoards_data_length	= hoards_data.length

			if (hoards_data_length) {
				const hoard_label = self.label(item, tstring.hoards)
				line.appendChild( hoard_label )
				const hoard_container = common.create_dom_element({
					element_type	: "div",
					class_name		: "hoard_container",
					parent			: line
				})
				hoard_label.addEventListener("mouseup", (event) => {
					event.preventDefault()
					hoard_container.classList.toggle("hide");
				})


				for (let i = 0; i < hoards_data_length; i++) {

					const hoard			= hoards_data[i]
					const coins			= JSON.parse(hoard.coins) || []
					const coins_length	= coins.length

					if (coins_length<1) {
						console.warn("! Skipped hoard without zero coins :", hoards_data);
						continue;
					}

					if (hoards_solved.find(section_id => section_id==hoard.section_id)) {
						continue;
					}

					const wrapper = common.create_dom_element({
						element_type	: "div",
						class_name		: "find_wrapper hoard",
						parent			: hoard_container
					})

					// title
						common.create_dom_element({
							element_type	: "span",
							inner_html		: " " + (hoard.name || "") + " (" + (hoard.place || "") + ") ",
							parent			: wrapper
						})
					// items (ejemplares)
						const items = common.create_dom_element({
							element_type	: "span",
							text_content	: " | ",
							parent			: wrapper
						})
					// draw coins inside
						const typology_coins = common.create_dom_element({
							element_type	: "div",
							class_name		: "find_coins hoard gallery",
							parent			: hoard_container
						})
						const ar_coins = []
						for (let j = 0; j < coins_length; j++) {
							const coin_section_id	= coins[j];
							const current_coin		= item.coin_references.find(el => el.section_id==coin_section_id)
								// console.log("item.coin_references:",item.coin_references);
								// console.log("current_coin:",current_coin, coin_section_id);
							if (current_coin) {
								draw_coin_inside(current_coin, typology_coins)
								ar_coins.push(coin_section_id)
							}
						}

						// replace text into the items
						items.innerHTML = items.innerHTML + ar_coins.length +" "+ (tstring.of || "of") +" "+ coins_length +" "+ (tstring.coins || "coins")


					// map data
						const hoard_data_map = JSON.parse(hoard.map)
						if (hoard_data_map) {
							map_data.push({
								section_id	: hoard.section_id,
								name		: hoard.name,
								place		: hoard.place,
								georef		: hoard.georef,
								data		: hoard_data_map,
								items		: ar_coins.length,
								total_items	: coins_length,
								type		: 'hoard',
								marker_icon	: page.maps_config.markers.hoard
							})
						}

					// store already solved
						hoards_solved.push(hoard.section_id)
				}// end for
			}// end if

		// findspots
			const findspots_data		= item.ref_coins_findspots_data;
			const findspots_data_length	= findspots_data.length

			if(findspots_data_length){
				const findspots_label = self.label(item, tstring.findspots)
				line.appendChild( findspots_label )


				const findspots_container = common.create_dom_element({
					element_type	: "div",
					class_name		: "findspots_container",
					parent			: line
				})

				findspots_label.addEventListener("mouseup", (event) => {
					event.preventDefault()
					findspots_container.classList.toggle("hide");
				})

				for (let i = 0; i < findspots_data_length; i++) {

					const findspot		= findspots_data[i]
					const coins			= JSON.parse(findspot.coins) || []
					const coins_length	= coins.length

					if (coins_length<1) {
						console.warn("! Skipped findspot without zero coins :", findspots_data);
						continue;
					}

					if (findspots_solved.find(section_id => section_id==findspot.section_id)) {
						continue;
					}

					// findspot wrapper
						const wrapper = common.create_dom_element({
							element_type	: "div",
							class_name		: "find_wrapper findspot",
							parent			: findspots_container
						})

					// title
						common.create_dom_element({
							element_type	: "span",
							inner_html		: " " + (findspot.name || "") + " (" + (findspot.place || "") + ") ",
							parent			: wrapper
						})
					// link (falta hacer tpl 'findspots')
						// common.create_dom_element({
						// 	element_type	: "a",
						// 	class_name		: "icon_link_after",
						// 	inner_html		: " " + (findspot.name || "") + " (" + (findspot.place || "") + ") ",
						// 	target			: '_blank',
						// 	href			: '../hoard/' + findspot.section_id,
						// 	parent			: wrapper
						// })
					// items (ejemplares)
						const items = common.create_dom_element({
							element_type	: "span",
							text_content	: " | ",
							parent			: wrapper
						})
					// draw coin inside
						const typology_coins = common.create_dom_element({
							element_type	: "div",
							class_name		: "find_coins findspot gallery",
							parent			: findspots_container
						})

						const ar_coins = []
						for (let j = 0; j < coins_length; j++) {
							const coin_section_id	= coins[j];
							const current_coin		= item.coin_references.find(el => el.section_id==coin_section_id)
								// console.log("item.coin_references:",item.coin_references);
								// console.log("current_coin:",current_coin, coin_section_id);
							if (current_coin) {
								draw_coin_inside(current_coin, typology_coins)
								ar_coins.push(coin_section_id)
							}
						}

						// map data
						const findspot_data_map = JSON.parse(findspot.map)
						if (findspot_data_map) {
							map_data.push({
								section_id	: findspot.section_id,
								name		: findspot.name,
								place		: findspot.place,
								georef		: findspot.georef,
								data		: findspot_data_map,
								items 		: ar_coins.length,
								total_items : coins_length,
								type 		: 'findspot',
								marker_icon	: page.maps_config.markers.findspot
							})
						}

					// replace text into the items
						items.innerHTML = items.innerHTML + ar_coins.length +" "+ (tstring.of || "of") +" "+ coins_length +" "+ (tstring.coins || "coins")

					// store already solved
						findspots_solved.push(findspot.section_id)
				}
			}//end findspots

		// mints
			const mint_data			= item.mint_data || []
			const mint_data_length	= mint_data.length
			if(mint_data_length>0){

				for (let i = 0; i < mint_data_length; i++) {

					const mint			= mint_data[i]
					const coins			= JSON.parse(mint.relations_coins) || []
					const coins_length	= coins.length

					// cross all mint coins with curertn type coin_references
						const ar_coins = []
						for (let j = 0; j < coins_length; j++) {
							const coin_section_id	= coins[j];
							const current_coin		= item.coin_references.find(el => el.section_id==coin_section_id)
							if (current_coin) {
								ar_coins.push(coin_section_id)
							}
						}

					// map data
					const mint_data_map = JSON.parse(mint.map)
					if (mint_data_map) {
						map_data.push({
							section_id	: mint.section_id,
							name		: mint.name,
							place		: mint.place,
							georef		: mint.georef,
							data		: mint_data_map,
							items 		: ar_coins.length,
							total_items : coins_length,
							type 		: 'mint',
							marker_icon	: page.maps_config.markers.mint
						})
					}
				}
			}//end mints_data



		// draw map
			if (map_data.length>0) {
				common.when_in_dom(map_container, draw_map)
				function draw_map() {
					self.caller.draw_map({
						container		: map_container,
						map_position	: null, // use default position
						map_data		: map_data
					})
				}
			}else{
				map_container.remove()
			}


		return line
	},//end findspots



	mint : function(item) {

		// line
		const line = common.create_dom_element({
			element_type	: "div",
			class_name		: "info_line mint"
		})

		if (item.mint && item.mint.length>0) {

			common.create_dom_element({
				element_type 	: "label",
				class_name 		: "",
				text_content 	: tstring.mint || "Mint",
				parent 			: line
			})

			const mint_text = row_object.mint
			common.create_dom_element({
				element_type 	: "span",
				class_name 		: "info_value",
				text_content 	: mint_text,
				parent 			: line
			})
		}


		return line
	},//end mint



	authors_alt : function(item) {

		// line
		const line = common.create_dom_element({
			element_type	: "div",
			class_name		: "info_line authors_alt"
		})

		if (item.authors_alt && item.authors_alt.length>0) {

			const authors_alt		= item.authors_alt || ""
			const final_authors_alt = " (" + authors_alt + "). "

			// DOM node
				common.create_dom_element({
					element_type 	: "div",
					class_name 		: "info_value authors_alt",
					text_content 	: final_authors_alt,
					parent 			: line
				})
		}


		return line
	},//end authors_alt



	publication_date : function(item) {

		const line = common.create_dom_element({
			element_type 	: "div",
			class_name 		: "info_line publication_date"
		})

		if (item.publication_date) {

			const ar_date 	= item.publication_date.split("-")
			let final_date 	= parseInt(ar_date[0])

			if( typeof(ar_date[1]!=="undefined") && parseInt(ar_date[1]) > 0 ) {
				final_date = final_date + "-" + parseInt(ar_date[1])
			}
			if( typeof(ar_date[2]!=="undefined") && parseInt(ar_date[2]) > 0 ) {
				final_date = final_date + "-" + parseInt(ar_date[2])
			}

			final_date = " (" + final_date + "). "

			common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_value",
				text_content 	: final_date,
				parent 			: line
			})

			line.classList.remove("hide")
		}

		return line
	},//end publication_date



	title : function(item) {

		const typology = this.get_typology(item)

		// title
			const title			= item.title || ""
			const title_style	= (typology=='1' || typology=='20' || typology=='28' || typology=='30'|| typology=='32')
				? " italic"
				: ""

		// pdf data
			// const pdf_uri			= item.pdf || '[]'
			// const ar_pdf_uri		= JSON.parse(pdf_uri)
			// const ar_pdf_uri_length	= ar_pdf_uri.length

		// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line title"
			})

		// title
			const title_final = " " + title + ". "
			common.create_dom_element({
				element_type	: "div",
				class_name		: "" + title_style,
				text_content	: title_final,
				parent			: line
			})

		// pdf_uri
			// for (let i = 0; i < ar_pdf_uri_length; i++) {

			// 	const pdf_item = ar_pdf_uri[i]

			// 	common.create_dom_element({
			// 		element_type	: "div",
			// 		class_name		: "pdf",
			// 		title			: pdf_item.title,
			// 		// text_content	: pdf_item.title,
			// 		// href			: pdf_item.iri,
			// 		parent			: line
			// 	}).addEventListener("click",(e) => {
			// 		window.open(pdf_item.iri, "PDF", "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes");
			// 	})
			// }


		return line
	},//end title



	editor : function(item) {

		// line
		const line = common.create_dom_element({
			element_type	: "div",
			class_name		: "info_line editor"
		})

		// editor
		if (item.editor && item.editor.length>0) {

			const en = tstring.en || "En"
			const editor = " " + en + " " + item.editor + ", "

			common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_value",
				text_content 	: editor,
				parent 			: line
			})
		}


		return line
	},//end editor



	title_secondary : function(item) {

		// const typology = this.get_typology(item)

		// title_secondary
			const title_secondary = item.title_secondary || ""

		// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line row_title"
			})

		// title_secondary
			if (title_secondary.length>0) {
				const title_secondary_final = " " + title_secondary + " "
				common.create_dom_element({
					element_type	: "div",
					class_name		: "title_secondary italic",
					text_content	: title_secondary_final,
					parent			: line
				})
			}


		return line
	},//end title_secondary



	magazine : function(item) {

		// line
		const line = common.create_dom_element({
			element_type	: "div",
			class_name		: "info_line magazine"
		})

		// magazine
		if (item.magazine && item.magazine.length>0) {

			const magazine_final = " " + item.magazine + ", "
			common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_value italic",
				text_content 	: magazine_final,
				parent 			: line
			})
		}


		return line
	},//end magazine



	serie : function(item) {

		// line
		const line = common.create_dom_element({
			element_type	: "div",
			class_name		: "info_line serie"
		})

		// serie
		if (item.serie && item.serie.length>0) {

			const serie_text = (!item.copy || item.copy.length<1)
				? " " + item.serie + ", "
				: " " + item.serie + ""

			common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_value italic",
				text_content 	: serie_text,
				parent 			: line
			})
		}


		return line
	},//end serie



	copy : function(item) {

		// line
		const line = common.create_dom_element({
			element_type	: "div",
			class_name		: "info_line copy"
		})

		// copy
		if (item.copy && item.copy.length>0) {

			const copy = " (" + item.copy + "), "

			common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_value",
				text_content 	: copy,
				parent 			: line
			})
		}


		return line
	},//end copy



	physical_description : function(item) {

		// line
		const line = common.create_dom_element({
			element_type	: "div",
			class_name		: "info_line physical_description"
		})

		// physical_description
		if (item.physical_description && item.physical_description.length>0) {

			const physical_description = " " + item.physical_description + ". "

			common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_value",
				text_content 	: physical_description,
				parent 			: line
			})
		}


		return line
	},//end physical_description



	editorial : function(item) {

		const self = this

		// line
		const line = common.create_dom_element({
			element_type	: "div",
			class_name		: "info_line editorial"
		})

		// editorial
		if (item.editorial && item.editorial.length>0) {

			const editorial = " " + item.editorial + ". "

			common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_value",
				text_content 	: editorial,
				parent 			: line
			})
		}


		return line
	},//end editorial



	url : function(item) {

		// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line url"
			})

		// url_data
			const url_data = item.url_data
			if (url_data && url_data.length>0) {

				const ar_url_data 		 = JSON.parse(url_data)
				const ar_url_data_length = ar_url_data.length
				for (let i = 0; i < ar_url_data_length; i++) {

					const url_item = ar_url_data[i]

					const title = (url_item.title && url_item.title.length>1)
						? url_item.title
						: url_item.iri

					const link = common.create_dom_element({
						element_type	: "a",
						class_name		: "url_data",
						title			: title,
						text_content	: title,
						href			: url_item.iri,
						parent			: line
					})
					link.setAttribute('target', '_blank');

					if ( !(i%2) && i<ar_url_data_length && ar_url_data_length>1 ) {
						common.create_dom_element({
							element_type	: "span",
							class_name		: "separator",
							text_content	: " | ",
							parent			: line
						})
					}
				}
			}


		return line
	},//end url



	place : function(item) {

		// line
		const line = common.create_dom_element({
			element_type	: "div",
			class_name		: "info_line place"
		})

		// place
		if (item.place && item.place.length>0) {

			common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_value",
				text_content 	: item.place,
				parent 			: line
			})
		}


		return line
	},//end place



	descriptors : function(item) {

		// line
		const line = common.create_dom_element({
			element_type	: "div",
			class_name		: "info_line descriptors"
		})

		// descriptors
		if (item.descriptors && item.descriptors.length>0) {

			common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_value",
				text_content 	: item.descriptors,
				parent 			: line
			})
		}


		return line
	},//end descriptors



	typology_name : function(item) {

		// line
		const line = common.create_dom_element({
			element_type	: "div",
			class_name		: "info_line typology_name"
		})

		// typology_name
		if (item.typology_name && item.typology_name.length>0) {

			common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_value",
				text_content 	: item.typology_name,
				parent 			: line
			})
		}


		return line
	},//end typology_name



	//CREATE A FLOAT PROMPT WHIT DESCRIPTION AND RELATED LINKS
	// params:
	// 	item: OBJECT item info
	// 	parentNode: HTML node that will have the onclick event
	// 	data_ref: STRING type of the item in DB ex: material_data
	create_float_prompt : function (item, parentNode, data_ref){

		if (item[data_ref] && item[data_ref].length>0) {

			parentNode.classList.add("active-pointer");
			parentNode.classList.add("underline-text");

			const main_node = document.getElementById("main");

			const float_prompt = common.create_dom_element({
				element_type	: "div",
				class_name		: "float-prompt hide",
				parent 			: main_node
			})

			const url_label = (data_ref==="material_data")
				? item.material
				: item[data_ref][0].term;

			const psqo = [{
				"$and" : [{
					field	: item[data_ref][0].table,
					value	: url_label, // Like '%${form_item.q}%'
					op		: '=' // default is 'LIKE'
				}]
			}]
			// console.log("form_factory", psqo_factory);
			const parse_psqo = psqo_factory.encode_psqo(psqo)
			const catalog_url = page_globals.__WEB_ROOT_WEB__+"/catalog/?psqo="+ parse_psqo

			const prompt_label = common.create_dom_element({
				element_type	: "a",
				class_name		: "prompt-label underline-text",
				inner_html 		: item[data_ref][0].term,
				href			: catalog_url,
				parent 			: float_prompt
			})

			const close_buttom = common.create_dom_element({
				element_type	: "div",
				class_name		: "close-buttom",
				parent 			: float_prompt
			})

			if (item[data_ref][0].definition) {
				const item_description = common.create_dom_element({
					element_type	: "p",
					class_name		: "prompt-description",
					inner_html		: item[data_ref][0].definition,
					parent 			: float_prompt
				})
			}

			if (item[data_ref][0].iri.length>0){
				const uris	= page.split_data(item[data_ref][0].iri, ' | ')
				for (let i=0; i<uris.length;i++){

					const eachUrl = common.create_dom_element({
						element_type	: "a",
						class_name		: "image_link underline-text",
						target			: "_blank",
						href			: uris[i],
						inner_html		: uris[i],
						parent			: float_prompt
					})
				}
			}

			parentNode.addEventListener("click",function(e){

				const float_prompts_list = document.getElementsByClassName("float-prompt");
				for (let i=0;i<float_prompts_list.length;i++){
					if (!float_prompts_list[i].classList.contains("hide")){
						float_prompts_list[i].classList.add("hide")
					}
				}

				float_prompt.style.left = e.clientX+'px';
				float_prompt.style.top = e.clientY+'px';
				float_prompt.classList.remove("hide");
			})

			close_buttom.addEventListener("click",function(){
				float_prompt.classList.add("hide");
			})
		}
	}//end create_float_prompt



}//end type_row_fields
