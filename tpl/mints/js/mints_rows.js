"use strict";



var mints_rows = {


	ar_rows : [],
	caller  : null,
	last_type : null,



	draw_item : function(row) {

		const self = this
		
		const fragment = new DocumentFragment()

	// wrapper
		const wrapper = common.create_dom_element({
			element_type	: "div",
			class_name		: "mints_row_wrapper",
			parent			: fragment
		})

		const name = row.name
		const mint_id = row.section_id
		const mint_uri	= page_globals.__WEB_ROOT_WEB__ + "/mint/" + mint_id
		const mint_uri_text	= "<a class=\"icon_link\" href=\""+mint_uri+"\"></a> "

		common.create_dom_element({
			element_type	: "a",
			inner_html  	: row.name + mint_uri_text,
			class_name		: "name",
			href 			: mint_uri,
			target 			: "_blank",
			parent 			: wrapper
		})

		common.create_dom_element({
			element_type	: "div",
			inner_html  	: row.place,
			class_name		: "",
			parent 			: wrapper
		})

		return fragment
	}

	// row_object : null,



	// name : function() {

	// 	const row_object = this.row_object

	// 	// line
	// 	const line = common.create_dom_element({
	// 		element_type 	: "div",
	// 		class_name 		: "info_line name"
	// 	})

	// 	// section_id
	// 	if (dedalo_logged===true) {

	// 		const link = common.create_dom_element({
	// 			element_type 	: "a",
	// 			class_name 		: "section_id go_to_dedalo",
	// 			text_content 	: row_object.section_id,
	// 			href 			: '/dedalo/lib/dedalo/main/?t=numisdata6&id=' + row_object.section_id,
	// 			parent 			: line
	// 		})
	// 		link.setAttribute('target', '_blank');
	// 	}

	// 	// name
	// 	if (row_object.name && row_object.name.length>0) {

	// 		const name		= row_object.name
	// 		const link_mint	= common.create_dom_element({
	// 			element_type 	: "a",
	// 			class_name 		: "info_value",
	// 			text_content 	: name,
	// 			href 			: "./mint/" + row_object.section_id,
	// 			parent 			: line
	// 		})
	// 		link_mint.setAttribute('target', '_blank');

	// 	}else{

	// 		common.create_dom_element({
	// 			element_type 	: "div",
	// 			class_name 		: "info_value",
	// 			text_content 	: "Undefined name",
	// 			parent 			: line
	// 		})
	// 	}


	// 	return line
	// },//end name



	// place : function() {

	// 	const row_object = this.row_object

	// 	// line
	// 	const line = common.create_dom_element({
	// 		element_type 	: "div",
	// 		class_name 		: "info_line place"
	// 	})

	// 	// place
	// 	if (row_object.place && row_object.place.length>0) {

	// 		const place = row_object.place
	// 		common.create_dom_element({
	// 			element_type 	: "div",
	// 			class_name 		: "info_value",
	// 			text_content 	: place,
	// 			parent 			: line
	// 		})

	// 	}else{

	// 		// common.create_dom_element({
	// 		// 	element_type 	: "div",
	// 		// 	class_name 		: "info_value",
	// 		// 	text_content 	: "Undefined place",
	// 		// 	parent 			: line
	// 		// })
	// 	}


	// 	return line
	// },//end place



	// publication_date : function() {

	// 	const row_object = this.row_object

	// 	const line = common.create_dom_element({
	// 		element_type 	: "div",
	// 		class_name 		: "info_line publication_date hide"
	// 	})

	// 	if (row_object.publication_date) {

	// 		const ar_date 	= row_object.publication_date.split("-")
	// 		let final_date 	= parseInt(ar_date[0])

	// 		if( typeof(ar_date[1]!=="undefined") && parseInt(ar_date[1]) > 0 ) {
	// 			final_date = final_date + "-" + parseInt(ar_date[1])
	// 		}
	// 		if( typeof(ar_date[2]!=="undefined") && parseInt(ar_date[2]) > 0 ) {
	// 			final_date = final_date + "-" + parseInt(ar_date[2])
	// 		}

	// 		common.create_dom_element({
	// 			element_type 	: "div",
	// 			class_name 		: "info_value",
	// 			text_content 	: final_date,
	// 			parent 			: line
	// 		})

	// 		line.classList.remove("hide")
	// 	}

	// 	return line
	// },//end publication_date



	// row_title : function() {

	// 	const row_object = this.row_object
	// 	const typology 		= this.get_typology()

	// 	// pdf data
	// 	const pdf_uri 			= row_object.pdf || '[]'
	// 	const ar_pdf_uri 		= JSON.parse(pdf_uri)
	// 	const ar_pdf_uri_length = ar_pdf_uri.length


	// 	// line
	// 		const line = common.create_dom_element({
	// 			element_type 	: "div",
	// 			class_name 		: "info_line row_title"
	// 		})

	// 	// title
	// 		const title 		= row_object.title || ""
	// 		const title_style 	= typology==="book" ? " italic" : ""
	// 		common.create_dom_element({
	// 			element_type 	: "div",
	// 			class_name 		: "title" + title_style + (ar_pdf_uri_length>0 ? " blue" : ""),
	// 			text_content 	: title,
	// 			parent 			: line
	// 		})

	// 	// pdf_uri
	// 		for (let i = 0; i < ar_pdf_uri_length; i++) {

	// 			const pdf_item = ar_pdf_uri[i]

	// 			common.create_dom_element({
	// 				element_type 	: "div",
	// 				class_name 		: "pdf",
	// 				title 			: pdf_item.title,
	// 				// text_content : pdf_item.title,
	// 				// href 			: pdf_item.iri,
	// 				parent 			: line
	// 			}).addEventListener("click",(e) => {
	// 				window.open(pdf_item.iri, "PDF", "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes");
	// 			})
	// 		}


	// 	return line
	// },//end row_title



	// row_body : function() {

	// 	const row_object = this.row_object
	// 	const typology 		= this.get_typology()


	// 	// line
	// 		const line = common.create_dom_element({
	// 			element_type 	: "div",
	// 			class_name 		: "info_line row_body" + " " + typology
	// 		})


	// 	switch(typology){

	// 		case 'book': // book

	// 			// place
	// 				if (row_object.place) {
	// 					common.create_dom_element({
	// 						element_type 	: "div",
	// 						class_name 		: "info_value place grey",
	// 						text_content 	: row_object.place,
	// 						parent 			: line
	// 					})
	// 				}

	// 			// editor
	// 				if (row_object.editor) {
	// 					common.create_dom_element({
	// 						element_type 	: "div",
	// 						class_name 		: "info_value editor grey",
	// 						text_content 	: ": " + row_object.editor,
	// 						parent 			: line
	// 					})
	// 				}
	// 			break;

	// 		default: // article, etc.

	// 			// magazine
	// 				if (row_object.magazine) {
	// 					common.create_dom_element({
	// 						element_type 	: "div",
	// 						class_name 		: "info_value magazine grey italic",
	// 						text_content 	: row_object.magazine,
	// 						parent 			: line
	// 					})
	// 				}

	// 			// serie
	// 				if (row_object.serie) {
	// 					common.create_dom_element({
	// 						element_type 	: "div",
	// 						class_name 		: "info_value serie grey",
	// 						text_content 	: ": " + row_object.serie,
	// 						parent 			: line
	// 					})
	// 				}

	// 			// physical_description
	// 				if (row_object.physical_description) {

	// 					const text_content = (row_object.serie.length>0)
	// 						? ", "+row_object.physical_description
	// 						: row_object.physical_description

	// 					common.create_dom_element({
	// 						element_type 	: "div",
	// 						class_name 		: "info_value physical_description grey",
	// 						text_content 	: text_content,
	// 						parent 			: line
	// 					})
	// 				}

	// 			break;
	// 	}//end switch(typology_parsed)


	// 	return line
	// },//end row_body



	// row_url : function() {

	// 	const row_object = this.row_object

	// 	// line
	// 		const line = common.create_dom_element({
	// 			element_type 	: "div",
	// 			class_name 		: "info_line row_url"
	// 		})

	// 	// url_data
	// 		const url_data = row_object.url_data
	// 		if (url_data && url_data.length>0) {

	// 			const ar_url_data 		 = JSON.parse(url_data)
	// 			const ar_url_data_length = ar_url_data.length
	// 			for (let i = 0; i < ar_url_data_length; i++) {

	// 				const url_item = ar_url_data[i]

	// 				common.create_dom_element({
	// 					element_type 	: "a",
	// 					class_name 		: "url_data",
	// 					title 			: url_item.title,
	// 					text_content 	: url_item.title,
	// 					href 			: url_item.iri,
	// 					parent 			: line
	// 				})

	// 				if ( !(i%2) && i<ar_url_data_length && ar_url_data_length>1 ) {
	// 					common.create_dom_element({
	// 						element_type 	: "span",
	// 						class_name 		: "separator",
	// 						text_content 	: " | ",
	// 						parent 			: line
	// 					})
	// 				}
	// 			}
	// 		}

	// 	return line
	// },//end row_url



}//end mint_rows
