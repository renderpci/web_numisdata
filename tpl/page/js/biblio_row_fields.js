/*global tstring, page_globals, SHOW_DEBUG, dedalo_logged, common, DocumentFragment, common */
/*eslint no-undef: "error"*/
/*jshint esversion: 6 */

"use strict";



var biblio_row_fields = {



	biblio_object : null,
	caller : null,



	get_typology : function() {

		const base = this.biblio_object.typology || '[]'

		const typology_parsed = JSON.parse(base)

		const typology_number = (typeof typology_parsed[0]!=="undefined")
			? typology_parsed[0]
			: 0

		const typology_label = (typology_number=="1")
			? "book"
			: "article"

		return typology_label
	},//end get_typology



	author : function() {

		const biblio_object = this.biblio_object

		// line
		const line = common.create_dom_element({
			element_type 	: "div",
			class_name 		: "info_line author"
		})

		// section_id
		if (dedalo_logged===true) {

			const link = common.create_dom_element({
				element_type 	: "a",
				class_name 		: "section_id go_to_dedalo",
				text_content 	: biblio_object.section_id + " " + this.get_typology(),
				href 			: '/dedalo/lib/dedalo/main/?t=rsc205&id=' + biblio_object.section_id,
				parent 			: line
			})
			link.setAttribute('target', '_blank');
		}

		if (biblio_object.authors && biblio_object.authors.length>0) {

			const authors_data 			= biblio_object.authors_data
			const authors_data_length 	= authors_data.length

			const ar_final_authors = []
			for (var j = 0; j < authors_data_length; j++) {
				const ar = []
				if (authors_data[j].surname) ar.push(authors_data[j].surname)
				if (authors_data[j].name) ar.push(authors_data[j].name)
				const autor_text = ar.join(", ")
				ar_final_authors.push(autor_text)
			}
			const final_authors = ar_final_authors.join("; ")
			common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_value",
				text_content 	: final_authors,
				parent 			: line
			})
		}else{

			common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_value",
				text_content 	: "Undefined author",
				parent 			: line
			})
		}


		return line
	},//end author



	publication_date : function() {

		const biblio_object = this.biblio_object

		const line = common.create_dom_element({
			element_type	: "div"
		})

		let final_date = ''
		if (biblio_object.publication_date && biblio_object.publication_date.length>0) {

			const ar_date = biblio_object.publication_date.split("-")

			final_date = typeof(ar_date[0])!=="undefined"
				? parseInt(ar_date[0])
				: ''
				// final_date = final_date //+ "-" + parseInt(ar_date[1])

			if( typeof(ar_date[2]!=="undefined") && parseInt(ar_date[2]) > 0 ) {
				final_date = final_date + "-" + parseInt(ar_date[2])
			}
		}

		common.create_dom_element({
			element_type 	: "div",
			class_name 		: "info_value",
			text_content 	: final_date,
			parent 			: line
		})

		line.classList.remove("hide")


		return line
	},//end publication_date



	row_title : function() {

		const biblio_object = this.biblio_object
		const typology 		= this.get_typology()

		// pdf data
			// unified pdf_uri_items objects (from component pdf -internal- or component iri -external-)
			const pdf_uri_items = []
			if (biblio_object.pdf) {
				// add formatted object
				pdf_uri_items.push({
					title	: 'Download pdf',
					iri		: (page_globals.__WEB_MEDIA_BASE_URL__ + biblio_object.pdf)
				})
			}else if(biblio_object.pdf_uri) {
				const ar_uri = JSON.parse(biblio_object.pdf_uri)
				pdf_uri_items.push(...ar_uri)
			}
			const pdf_uri_items_length = pdf_uri_items.length

		// line
			const line = common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_line row_title"
			})

		// title
			const title 		= biblio_object.title || ""
			const title_style 	= typology==="book" ? " italic" : ""
			common.create_dom_element({
				element_type 	: "div",
				class_name 		: "title" + title_style + (pdf_uri_items_length>0 ? " blue" : ""),
				text_content 	: title,
				parent 			: line
			})

		// link pdf
			for (let i = 0; i < pdf_uri_items_length; i++) {

				const pdf_item	= pdf_uri_items[i]
				const title		= pdf_item.title
				const iri		= pdf_item.iri

				const pdf_link	= common.create_dom_element({
					element_type	: "div",
					class_name		: "pdf",
					title			: title,
					// text_content	: pdf_item.title,
					// href			: pdf_item.iri,
					parent			: line
				})

				pdf_link.addEventListener("click",(e) => {
					window.open(iri, "PDF", "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes");
				})
			}

		return line
	},//end row_title



	row_body : function() {

		const biblio_object = this.biblio_object
		const typology 		= this.get_typology()

		// line
			const line = common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_line row_body" + " " + typology
			})

		switch(typology){

			case 'book': // book

				// other_people_info : name and role other_people_full_names
					if (biblio_object.other_people_full_names && biblio_object.other_people_full_names.length>0) {
						const other_people_full_names = biblio_object.other_people_full_names.split(" | ");
						const other_people_full_roles = biblio_object.other_people_full_roles.split(" | ")

						const particle_in = tstring.in || 'In'

						common.create_dom_element({
								element_type 	: "span",
								class_name 		: "info_value other_people_full_names grey",
								text_content 	: particle_in,
								parent 			: line
							})

						const other_people_length = other_people_full_names.length
						for (let g = 0; g < other_people_length; g++) {

							const name = other_people_full_names[g]

							const text_content = (g!==0)
								? ", "+name
								: " "+name

							common.create_dom_element({
								element_type 	: "span",
								class_name 		: "info_value other_people_full_names grey",
								text_content 	: text_content,
								parent 			: line
							})
						}

						const role = typeof other_people_full_roles[0]!=='undefined'
							? ' ('+other_people_full_roles[0].toLowerCase()+'.): '
							: ' '

						common.create_dom_element({
								element_type 	: "span",
								class_name 		: "info_value other_people_full_names grey",
								text_content 	: role,
								parent 			: line
							})
					}


					// // editor
					// if (biblio_object.editor) {
					// 	common.create_dom_element({
					// 		element_type 	: "div",
					// 		class_name 		: "info_value editor grey",
					// 		text_content 	: ": " + biblio_object.editor,
					// 		parent 			: line
					// 	})
					// }
					// title_colective
						//
						// if (biblio_object.title_colective) {
						//
						// 	const title_colective = (biblio_object.title_colective)
						// 		? biblio_object.title_colective
						// 		: ""
						//
						// 	common.create_dom_element({
						// 		element_type 	: "div",
						// 		class_name 		: "info_value volume grey italic",
						// 		text_content 	: title_colective,
						// 		parent 			: line
						// 	})
						// }
					// title_secondary
						if (biblio_object.title_secondary) {

							const title_secondary = (biblio_object.title_secondary)
								? biblio_object.title_secondary
								: ""

							common.create_dom_element({
								element_type 	: "div",
								class_name 		: "info_value volume grey italic",
								text_content 	: title_secondary,
								parent 			: line
							})
						}


						if (biblio_object.place) {

							const separator = (biblio_object.title_secondary)
								? ", "
								: ""

							common.create_dom_element({
								element_type 	: "div",
								class_name 		: "info_value place grey",
								text_content 	: separator+biblio_object.place,
								parent 			: line
							})
						}

				break;

			default: // article, etc.

				// other_people_info : name and role other_people_full_names
					if (biblio_object.other_people_full_names && biblio_object.other_people_full_names.length>0) {
						const other_people_full_names = biblio_object.other_people_full_names.split(" | ");
						const other_people_full_roles = biblio_object.other_people_full_roles.split(" | ")

						const particle_in = tstring.in || 'In'

						common.create_dom_element({
								element_type 	: "span",
								class_name 		: "info_value other_people_full_names grey",
								text_content 	: particle_in,
								parent 			: line
							})

						const other_people_length = other_people_full_names.length
						for (let g = 0; g < other_people_length; g++) {

							const name = other_people_full_names[g]

							const text_content = (g!==0)
								? ", "+name
								: " "+name

							common.create_dom_element({
								element_type 	: "span",
								class_name 		: "info_value other_people_full_names grey",
								text_content 	: text_content,
								parent 			: line
							})
						}

						const role = typeof other_people_full_roles[0]!=='undefined'
							? ' ('+other_people_full_roles[0].toLowerCase()+'.): '
							: ' '

						common.create_dom_element({
								element_type 	: "span",
								class_name 		: "info_value other_people_full_names grey",
								text_content 	: role,
								parent 			: line
							})
					}

					// // title_colective
					// 	if (biblio_object.title_colective) {
					//
					// 		const title_colective = (biblio_object.title_colective)
					// 			? biblio_object.title_colective
					// 			: ""
					//
					// 		common.create_dom_element({
					// 			element_type 	: "div",
					// 			class_name 		: "info_value volume grey italic",
					// 			text_content 	: title_colective,
					// 			parent 			: line
					// 		})
					// 	}
					// title_secondary
						if (biblio_object.title_secondary) {

							const title_secondary = (biblio_object.title_secondary)
								? biblio_object.title_secondary
								: ""

							const magazine_separator = (biblio_object.magazine)
								? ", "
								: ""

							common.create_dom_element({
								element_type 	: "span",
								class_name 		: "info_value volume grey italic",
								text_content 	: title_secondary+magazine_separator,
								parent 			: line
							})

						}

				// // other_people_info : name and role other_people_full_names
				// 	if (biblio_object.other_people_full_names && biblio_object.other_people_full_names.length>0) {
				// 		const other_people_full_names = biblio_object.other_people_full_names.split(" | ");
				// 		const other_people_full_roles = biblio_object.other_people_full_roles.split(" | ")
				// 		for (let g = 0; g < other_people_full_names.length; g++) {
				//
				// 			const name = other_people_full_names[g]
				// 			const role = typeof other_people_full_roles[g]!=='undefined'
				// 				? ' ('+other_people_full_roles[g]+')'
				// 				: ''
				//
				// 			const text_content = (biblio_object.serie.length>0 || (biblio_object.volume && biblio_object.volume.length>0))
				// 				? ", "+name + role
				// 				: name + role
				//
				// 			common.create_dom_element({
				// 				element_type 	: "div",
				// 				class_name 		: "info_value other_people_full_names grey",
				// 				text_content 	: text_content,
				// 				parent 			: line
				// 			})
				// 		}
				// 	}

				// magazine


				if (biblio_object.magazine) {
					common.create_dom_element({
						element_type 	: "span",
						class_name 		: "info_value magazine grey italic",
						text_content 	: biblio_object.magazine,
						parent 			: line
					})
				}

			// serie
				if (biblio_object.serie) {
					const separator = (line.children.length > 0)
					? ' '
					: ''

					common.create_dom_element({
						element_type 	: "span",
						class_name 		: "info_value serie grey",
						inner_html 		: separator + biblio_object.serie,
						parent 			: line
					})
				}

				if (biblio_object.place) {
					const separator = (line.children.length > 0)
					? ", "
					: ""

					common.create_dom_element({
						element_type 	: "span",
						class_name 		: "info_value place grey",
						text_content 	: separator + biblio_object.place,
						parent 			: line
					})
				}

				// physical_description

				if (biblio_object.physical_description) {
					const separator = (line.children.length > 0)
					? ", "
					: ""

					common.create_dom_element({
						element_type 	: "span",
						class_name 		: "info_value physical_description grey",
						text_content 	: separator + biblio_object.physical_description,
						parent 			: line
					})
				}


				break;
		}//end switch(typology_parsed)


		return line
	},//end row_body



	row_url : function() {

		const biblio_object = this.biblio_object

		// line
			const line = common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_line row_url"
			})

		// url_data
			const url_data = biblio_object.url_data
			if (url_data && url_data.length>0) {

				const ar_url_data 		 = JSON.parse(url_data)
				const ar_url_data_length = ar_url_data.length
				for (let i = 0; i < ar_url_data_length; i++) {

					const url_item = ar_url_data[i]

					const link =common.create_dom_element({
						element_type 	: "a",
						class_name 		: "url_data",
						title 			: url_item.title,
						text_content 	: url_item.title,
						href 			: url_item.iri,
						parent 			: line
					})
					link.target = '_blank'

					if ( !(i%2) && i<ar_url_data_length && ar_url_data_length>1 ) {
						common.create_dom_element({
							element_type 	: "span",
							class_name 		: "separator",
							text_content 	: " | ",
							parent 			: line
						})
					}
				}
			}

		return line
	},//end row_url



	descriptors : function(value) {

		const self = this

		// line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_line descriptors"
			})

			const descriptors_list = value.split(' - ')
			for (let i = 0; i < descriptors_list.length; i++) {

				const name = descriptors_list[i]
				// const url = page_globals.__WEB_ROOT_WEB__ + '/biblio/' + '?descriptors=' + name

				const link = common.create_dom_element({
					element_type	: "a",
					class_name		: "descriptors_link",
					text_content	: name,
					// href			: url,
					parent			: line
				})
				link.addEventListener("click", function(){
					self.caller.search_item('descriptors', name)
				})
			}


		return line
	},//end descriptors



	transcription : function(value){

		const fragment = new DocumentFragment()

		for(let word in value) {

			const items = value[word]
			for (let i = 0; i < items.length; i++) {

				const page_number	= items[i].page_number
				const fragm			= items[i].fragm

				const occurrence = common.create_dom_element({
					element_type	: "div",
					class_name		: "occurrence",
					parent			: fragment
				})
				// page_number_node
				common.create_dom_element({
					element_type	: "div",
					class_name		: "page_number",
					inner_html		: (tstring.page || 'Page') + ' ' + page_number,
					parent			: occurrence
				})
				// fragm_node
				common.create_dom_element({
					element_type	: "div",
					class_name		: "item_transcription",
					inner_html		: fragm,
					parent			: occurrence
				})
			}
		}

		// const text = page.search_fragment_in_text(q, value, 510)

		const transcription_node = common.create_dom_element({
			element_type	: "div",
			class_name		: "info_value transcription"
		})
		transcription_node.appendChild(fragment)


		return transcription_node
	},//end transcription



	render_row_bibliography : function(row){

		// let biblio_object = this.biblio_object
		let biblio_object = row

		// pages: "59"
		// publications_data: "[\"16022\"]"
		// ref_publications_authors: "Martínez Chico David"
		// ref_publications_date: "2016"
		// ref_publications_editor: null
		// ref_publications_magazine: "Gaceta Numismática"
		// ref_publications_place: null
		// ref_publications_title: "Sextante inédito para la ceca sevillana de Lastigi"
		// ref_publications_url: null
		// reference: "1"
		// section_id: "25604"
		// sheet: ""

		const publication_url = biblio_object.ref_publications_url

		//check in url if has a Zenon reference for parsing
		if (publication_url != null && publication_url.includes("/Record/")){
			biblio_object = parse_zenon_bibliography(biblio_object);
		}

		// line
			const line = common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_line row_title"
			})

		// authors
			const authors = (biblio_object.ref_publications_authors)
				? biblio_object.ref_publications_authors.replace(/ \| /g,'; ')
				: ""

			common.create_dom_element({
				element_type	: "span",
				inner_html		: authors,
				parent			: line
			})

		// date
			const date = (biblio_object.ref_publications_date)
				? " ("+biblio_object.ref_publications_date + "): "
				: ""
			common.create_dom_element({
				element_type	: "span",
				inner_html		: date,
				parent			: line
			})


		// title if book italics 1, 4, if not regular
		// ref_publications_typology

			const title = (biblio_object.ref_publications_title)
				? biblio_object.ref_publications_title + ". "
				: ""
			const format_title = (biblio_object.ref_publications_typology === "[\"1\"]" || biblio_object.ref_publications_typology === "[\"4\"]")
				? "<em>" + title + "</em>"
				: title

			common.create_dom_element({
				element_type	: "span",
				inner_html		: format_title,
				parent			: line
			})

		// magazine in italics
			const magazine = (biblio_object.ref_publications_magazine)
				? "<em>"+biblio_object.ref_publications_magazine + " </em>"
				: ""
			common.create_dom_element({
				element_type	: "span",
				inner_html		: magazine,
				parent			: line
			})


		// magazine number ref_publications_magazine_number	regular
			const magazine_number = (biblio_object.ref_publications_magazine_number)
				? " " +biblio_object.ref_publications_magazine_number
				: ""
			common.create_dom_element({
				element_type	: "span",
				inner_html		: magazine_number,
				parent			: line
			})


		// other_people_info : name and role other_people_full_names
			if (biblio_object.ref_publications_other_people_full_names && biblio_object.ref_publications_other_people_full_names.length>0) {
				const other_people_full_names = biblio_object.ref_publications_other_people_full_names.split(" | ");
				const other_people_full_roles = biblio_object.ref_publications_other_people_full_roles.split(" | ")

				const particle_in = tstring.in || 'In'

				common.create_dom_element({
						element_type 	: "span",
						text_content 	: particle_in,
						parent 			: line
					})

				const other_people_length = other_people_full_names.length
				for (let g = 0; g < other_people_length; g++) {

					const name = other_people_full_names[g]

					const text_content = (g!==0)
						? ", "+name
						: " "+name

					common.create_dom_element({
						element_type 	: "span",
						text_content 	: text_content,
						parent 			: line
					})
				}

				const role = typeof other_people_full_roles[0]!=='undefined'
					? ' ('+other_people_full_roles[0].toLowerCase()+'.): '
					: ' '

				common.create_dom_element({
						element_type 	: "span",
						text_content 	: role,
						parent 			: line
					})
			}



		// title colective ref_publications_title_colective	cursiva
			const title_colective_previous = (biblio_object.ref_publications_title_colective)
				? '<em>' +biblio_object.ref_publications_title_colective + '</em>'
				: null
			const title_colective = ( title_colective_previous && biblio_object.ref_publications_place)
				? title_colective_previous +', '
				: title_colective_previous

			common.create_dom_element({
				element_type	: "span",
				inner_html		: title_colective,
				parent			: line
			})

		// // title colective alt ref_publications_title_colective_alt	cursiva
		// 	const title_colective_alt_previous = (biblio_object.ref_publications_title_colective_alt)
		// 		? ' <em>' +biblio_object.ref_publications_title_colective_alt + '</em>'
		// 		: null
		// 	const title_colective_alt = ( title_colective_alt_previous && biblio_object.ref_publications_place)
		// 		? title_colective_alt_previous +', '
		// 		: title_colective_alt_previous
		//
		// 	common.create_dom_element({
		// 		element_type	: "span",
		// 		inner_html		: title_colective_alt,
		// 		parent			: line
		// 	})

		// place
			const place = (biblio_object.ref_publications_place)
				? " " +biblio_object.ref_publications_place
				: ""
			common.create_dom_element({
				element_type	: "span",
				inner_html		: place,
				parent			: line
			})

		// pages
			const pages = (biblio_object.pages)
				? ", p. " +biblio_object.pages
				: ""
			common.create_dom_element({
				element_type	: "span",
				inner_html		: pages,
				parent			: line
			})

		// sheet
			const sheet = (biblio_object.sheet)
				? ", "+ biblio_object.sheet
				: ""
			common.create_dom_element({
				element_type	: "span",
				inner_html		: sheet,
				parent			: line
			})

		// reference
			const reference = (biblio_object.reference)
				? ", n. " +biblio_object.reference
				: ""
			common.create_dom_element({
				element_type	: "span",
				inner_html		: reference,
				parent			: line
			})

		// final point
			common.create_dom_element({
				element_type	: "span",
				inner_html		: '.',
				parent			: line
				})

		// URI
			const url_title = (biblio_object.ref_publications_url)
				?  biblio_object.ref_publications_url.split(", ")[0]
				: ''

			const url = (biblio_object.ref_publications_url)
				? biblio_object.ref_publications_url.split(", ")[1]
				: ''

			const link = (url)
				? " | <a href=\"" + url +"\">"+url_title+" </a> "
				: ""
			common.create_dom_element({
				element_type	: "span",
				inner_html		: link,
				parent			: line
			})

		//parse bibliography data with Zenon references for extract only the first one
		function parse_zenon_bibliography(data){
			const biblio_data			= data
			// const biblio_data_length	= biblio_data.length;

			for (const property in biblio_data){
				if (typeof biblio_data[property] !== 'string') continue

				if (biblio_data[property] != null && biblio_data[property].includes(" # ")){
					biblio_data[property] = biblio_data[property].split(" # ")[0]

					//erase Zenon word of url string
					// if (property === "ref_publications_url") {
					// 	biblio_data[property] = biblio_data[property].split(", ")[1]
					// }
				}
			}

			return biblio_data;
		}

		return line
	},//end render_row_bibliography



	render_cite_this : function(cite_data){

		// catalog_name: "MIB"
		// definition: ""
		// lang: "lg-spa"
		// publication_data :{
		// 	editor: "Universitat de València - Museu de Prehistòria de València"
		// other_people_data: "[\"229\"]"
		// other_people_full_names: "Pere Pau Ripollès Alegre | Manuel Gozalbes Fernández de Palencia"
		// other_people_full_roles: "ed"
		// other_people_name: "[\"Pere Pau\",\"Manuel\"]"
		// other_people_role: "[\"ed\"]"
		// other_people_surname: "[\"Ripollès Alegre\",\"Gozalbes Fernández de Palencia\"]"
		// 	publication_date: "2022-00-00 00:00:00"
		// 	table: "publications"
		// 	title: "Moneda Ibérica"
		// 	typology_name: "Página web"
		// 	url_data: "[{\"iri\":\"monedaiberica.org\",\"title\":\"MIB\"}]"
		// }
		// uri: "[{\"iri\":\"http://nomisma.org/id/mib\",\"title\":\"nomisma\"}]"
		// autors : {
		// 	authorship_data: "[\"1\",\"2\"]"
		// 	authorship_names: "Pablo | Pere Pau"
		// 	authorship_roles: "Introducción | Ordenación emisiones"
		// 	authorship_surnames: "Cerdà Insa | Ripollès Alegre"
		// }

		// line
			const line = common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_line cite_this"
			})

		// authors
			if(cite_data.autors.authorship_names && cite_data.autors.authorship_surnames){
				const authors_name		= cite_data.autors.authorship_names.split(' | ')
				const authors_surname	= cite_data.autors.authorship_surnames.split(' | ')

				const authors = []
				const authors_len = authors_surname.length

				for (let i = 0; i < authors_len; i++) {
					const current_full_surname	= authors_surname[i]
					const current_full_name	= authors_name[i]

					const ar_current_name = []
					current_full_name.split(' ')
						.map(word => word.charAt(0) != ''
							? ar_current_name.push(word.charAt(0))
							: '');
					const current_name = ar_current_name.join('.') +'.'

					const ar_surname = current_full_surname.split(' ')
					const surname = (ar_surname.length > 1)
								? ar_surname.slice(0, 1)
								: ar_surname

					const current_surname = surname.join(' ')
					const author = current_surname+', '+current_name
					authors.push(author)
				}
				const authors_string = authors.join('; ')

				common.create_dom_element({
					element_type	: "span",
					inner_html		: authors_string,
					parent			: line
				})


			// date
				const ar_date_full = cite_data.publication_data.publication_date.split("-")

				const date_year = typeof(ar_date_full[0])!=="undefined"
					? parseInt(ar_date_full[0])
					: null
				const date = (date_year)
					? " ("+ date_year + "): "
					: ""
				common.create_dom_element({
					element_type	: "span",
					inner_html		: date,
					parent			: line
				})
			}// end if authors


		// Catalog & title
			const ar_title = []

			if(cite_data.catalog){
				ar_title.push("<em>" + cite_data.catalog + "</em>")
			}

			if(cite_data.title){
				ar_title.push(cite_data.title)
			}
			const title_string = ar_title.join(' ')

			if(ar_title.length>0){
				common.create_dom_element({
					element_type	: "span",
					inner_html		: title_string +', ',
					parent			: line
				})
			}


		// editors
		// // other_people_info : name and role other_people_full_names
			if (cite_data.publication_data.other_people_data && cite_data.publication_data.other_people_data.length>0) {

				const particle_in = tstring.in || 'in'

				common.create_dom_element({
					element_type 	: "span",
					text_content 	: particle_in.toLowerCase()+' ',
					parent 			: line
				})

				const ar_data = cite_data.publication_data.other_people_data.split(" | ")
				const ar_other_people_name = cite_data.publication_data.other_people_name.split(" | ");
				const ar_other_people_surname = cite_data.publication_data.other_people_surname.split(" | ");
				const ar_other_people_role = cite_data.publication_data.other_people_role.split(" | ")

				const ar_data_len = ar_data.length
				for (let i = 0; i < ar_data_len; i++) {
					const fragment = new DocumentFragment()

					const ar_current_data = JSON.parse(ar_data[i])
					const ar_current_names = JSON.parse(ar_other_people_name[i])
					const ar_current_surnames = JSON.parse(ar_other_people_surname[i])
					const ar_current_role = JSON.parse(ar_other_people_role[i])

					const authors =[]
					const ar_current_data_len = ar_current_names.length
					for (let i = 0; i < ar_current_data_len; i++) {

						const current_full_surname	= ar_current_surnames[i]
						const current_full_name	= ar_current_names[i]

						const ar_current_name = []
						current_full_name.split(' ')
							.map(word => word.charAt(0) != ''
								? ar_current_name.push(word.charAt(0))
								: '');
						const current_name = ar_current_name.join('.') +'.'

						const ar_surname = current_full_surname.split(' ')

						const surname = (ar_surname.length > 1)
							? ar_surname.slice(0, 1)
							: ar_surname

						const current_surname = surname.join(' ')
						const author = current_name +' '+current_surname
						authors.push(author)
					}
					const other_people_names_string = authors.join(', ')
					const other_people_role_string = ar_current_role.join('')

					common.create_dom_element({
						element_type 	: "span",
						text_content 	: other_people_names_string,
						parent 			: fragment
					})
					const role = other_people_role_string.length > 0
						? ' ('+other_people_role_string.toLowerCase()+'.), '
						: ', '
					common.create_dom_element({
						element_type 	: "span",
						text_content 	: role,
						parent 			: fragment
					})
					line.appendChild(fragment)
				}
			}

		//title
			const title = (cite_data.publication_data.title)
				? cite_data.publication_data.title +' ('+page_globals.OWN_CATALOG_ACRONYM+'), '
				: ' ('+page_globals.OWN_CATALOG_ACRONYM+'), '
			common.create_dom_element({
				element_type	: "em",
				inner_html		: title,
				parent			: line
			})


		// place
			const place = (cite_data.publication_data.place)
				? cite_data.publication_data.place + ', '
				: ''
			common.create_dom_element({
				element_type	: "span",
				inner_html		: place,
				parent			: line
			})

		// uri_location
			const uri = cite_data.uri_location
			const link = common.create_dom_element({
				element_type	: "a",
				class_name		: "section_id",
				text_content	: uri +' ',
				href			: uri,
				parent			: line
			})
			link.setAttribute('target', '_blank');

		// accessed
			const today	= new Date()
			// const year	= today.getFullYear()
			// const month	= today.getMonth()
			// const day	= today.getUTCDate()

			const browser_lang = window.navigator.language
	console.log("tstring:",tstring);
			const string_date	= new Intl.DateTimeFormat(browser_lang).format(today)
			const accessed = common.create_dom_element({
				element_type	: "span",
				inner_html		: '[' + tstring.accessed +' '+ string_date+']',
				parent			: line
			})

		return line
	}

}//end biblio_row_fields
