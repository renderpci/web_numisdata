"use strict";



var row_fields = {



	biblio_object : null,

	

	author : function() {

		const biblio_object = this.biblio_object	

		const line = common.create_dom_element({
			element_type 	: "div",
			class_name 		: "info_line author"
		})


		// section_id
		common.create_dom_element({
			element_type 	: "span",
			class_name 		: "section_id",
			text_content 	: biblio_object.section_id,
			parent 			: line
		})

		// autoria 
		if (biblio_object.autoria && biblio_object.autoria.length>0) {

			const autoria 		 = biblio_object.autoria_dato
			const autoria_length = autoria.length

			const ar_final_autoria = []
			for (var j = 0; j < autoria_length; j++) {
				const ar = []
				if (autoria[j].apellidos) ar.push(autoria[j].apellidos)
				if (autoria[j].nombre) ar.push(autoria[j].nombre)
				const autor_text = ar.join(", ")
				ar_final_autoria.push(autor_text)
			}
			const final_autoria = ar_final_autoria.join("; ")
			common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_value",
				text_content 	: final_autoria,
				parent 			: line
			})
			
			// line.classList.remove("hide")
		
		}else{

			common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_value",
				text_content 	: "Undefined",
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

		if (biblio_object.fecha_publicacion) {			

			const ar_fecha 		= biblio_object.fecha_publicacion.split("-")
			let fecha_final 	= parseInt(ar_fecha[0])

			if( typeof(ar_fecha[1]!=="undefined") && parseInt(ar_fecha[1]) > 0 ) {					
				fecha_final = fecha_final + "-" + parseInt(ar_fecha[1])
			}
			if( typeof(ar_fecha[2]!=="undefined") && parseInt(ar_fecha[2]) > 0 ) {
				fecha_final = fecha_final + "-" + parseInt(ar_fecha[2])
			}

			common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_value",
				text_content 	: fecha_final,
				parent 			: line
			})

			line.classList.remove("hide")
		}

		return line
	},//end publication_date



	row_body : function() {

		const biblio_object = this.biblio_object

		// line
			const line = common.create_dom_element({
				element_type 	: "div",
				class_name 		: "info_line row_body"
			})

		// title
			const titulo = biblio_object.titulo || ''
			common.create_dom_element({
				element_type 	: "div",
				class_name 		: "title",
				text_content 	: titulo,
				parent 			: line
			})

		// series_colecciones 
			if (biblio_object.series_colecciones || biblio_object.numero_serie) {
				const series_info = []
				if (biblio_object.series_colecciones) {
					 series_info.push(biblio_object.series_colecciones) 
				}
				if (biblio_object.numero_serie) {
					 series_info.push(biblio_object.numero_serie)
				}
				common.create_dom_element({
					element_type 	: "em",
					class_name 		: "series_colecciones",
					text_content 	: series_info.join(" "),
					parent 			: line
				})
			}

		// lugar_publicacion 
			if (biblio_object.lugar_publicacion) {
				common.create_dom_element({
					element_type 	: "div",
					class_name 		: "info_value",
					text_content 	: biblio_object.lugar_publicacion,
					parent 			: line
				})
			}


		// description_fisica 
			if (biblio_object.description_fisica) {
				common.create_dom_element({
					element_type 	: "div",
					class_name 		: "info_value",
					text_content 	: biblio_object.description_fisica,
					parent 			: line
				})
			}

		return line
	},//end row_body



}//end row_fields