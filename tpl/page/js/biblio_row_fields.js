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
	},

	

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
		

		// authors 
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
			element_type 	: "div",
			class_name 		: "info_line publication_date hide"			
		})

		if (biblio_object.publication_date) {			

			const ar_date 	= biblio_object.publication_date.split("-")
			let final_date 	= parseInt(ar_date[0])

			if( typeof(ar_date[1]!=="undefined") && parseInt(ar_date[1]) > 0 ) {					
				final_date = final_date + "-" + parseInt(ar_date[1])
			}
			if( typeof(ar_date[2]!=="undefined") && parseInt(ar_date[2]) > 0 ) {
				final_date = final_date + "-" + parseInt(ar_date[2])
			}

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



	row_title : function() {

		const biblio_object = this.biblio_object
		const typology 		= this.get_typology()

		// pdf data
		const pdf_uri 			= biblio_object.pdf || '[]'
		const ar_pdf_uri 		= JSON.parse(pdf_uri)
		const ar_pdf_uri_length = ar_pdf_uri.length


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
				class_name 		: "title" + title_style + (ar_pdf_uri_length>0 ? " blue" : ""),
				text_content 	: title,
				parent 			: line
			})

		// pdf_uri				
			for (let i = 0; i < ar_pdf_uri_length; i++) {
				
				const pdf_item = ar_pdf_uri[i]
			
				common.create_dom_element({
					element_type 	: "div",
					class_name 		: "pdf",
					title 			: pdf_item.title,
					// text_content : pdf_item.title,
					// href 			: pdf_item.iri,
					parent 			: line
				}).addEventListener("click",(e) => {
					window.open(pdf_item.iri, "PDF", "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes");
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
				
				// place 
					if (biblio_object.place) {
						common.create_dom_element({
							element_type 	: "div",
							class_name 		: "info_value place grey",
							text_content 	: biblio_object.place,
							parent 			: line
						})
					}

				// editor 
					if (biblio_object.editor) {
						common.create_dom_element({
							element_type 	: "div",
							class_name 		: "info_value editor grey",
							text_content 	: ": " + biblio_object.editor,
							parent 			: line
						})
					}
				break;

			default: // article, etc.

				// magazine 
					if (biblio_object.magazine) {
						common.create_dom_element({
							element_type 	: "div",
							class_name 		: "info_value magazine grey italic",
							text_content 	: biblio_object.magazine,
							parent 			: line
						})
					}

				// serie 
					if (biblio_object.serie) {
						common.create_dom_element({
							element_type 	: "div",
							class_name 		: "info_value serie grey",
							text_content 	: ": " + biblio_object.serie,
							parent 			: line
						})
					}

				// volume 
					if (biblio_object.volume) {
						
						const text_content = (biblio_object.serie.length>0) 
							? ", "+biblio_object.volume
							: biblio_object.volume

						common.create_dom_element({
							element_type 	: "div",
							class_name 		: "info_value volume grey italic",
							text_content 	: text_content,
							parent 			: line
						})
					}
	
				// other_people_info : name and role other_people_name
					if (biblio_object.other_people_name && biblio_object.other_people_name.length>0) {
						
						const other_people_name = biblio_object.other_people_name.split(" | ");
						const other_people_role = biblio_object.other_people_role.split(" | ")
						for (let g = 0; g < other_people_name.length; g++) {
							
							const name = other_people_name[g]
							const role = typeof other_people_role[g]!=='undefined'
								? ' ('+other_people_role[g]+')' 
								: ''
							
							const text_content = (biblio_object.serie.length>0 || (biblio_object.volume && biblio_object.volume.length>0)) 
								? ", "+name + role
								: name + role

							common.create_dom_element({
								element_type 	: "div",
								class_name 		: "info_value other_people_name grey",
								text_content 	: text_content,
								parent 			: line
							})
						}
					}

				// physical_description 
					if (biblio_object.physical_description) {
						
						const text_content = (biblio_object.serie.length>0 || (biblio_object.volume && biblio_object.volume.length>0)) 
							? ", "+biblio_object.physical_description
							: biblio_object.physical_description

						common.create_dom_element({
							element_type 	: "div",
							class_name 		: "info_value physical_description grey",
							text_content 	: text_content,
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
				
					common.create_dom_element({
						element_type 	: "a",
						class_name 		: "url_data",
						title 			: url_item.title,
						text_content 	: url_item.title,
						href 			: url_item.iri,
						parent 			: line
					})

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

		const biblio_object = this.biblio_object
		
		// line
			const line = common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_line descriptors"
			})

			const descriptors_list = value.split(' - ')
			for (let i = 0; i < descriptors_list.length; i++) {
				
				const name = descriptors_list[i]
				// const url = page_globals.__WEB_ROOT_WEB__ + '/biblio/' + '?descriptors=' + name

				const link = common.create_dom_element({
					element_type 	: "a",
					class_name 		: "descriptors_link",				
					text_content 	: name,
					// href 			: url,
					parent 			: line
				})
				link.addEventListener("click", function(){
					self.caller.search_item('descriptors', name)
				})
			}
		

		return line
	},//end descriptors



}//end biblio_row_fields