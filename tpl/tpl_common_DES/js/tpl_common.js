"use strict";



var tpl_common = {


	export_data_json : [],
	export_data_csv  : [],


	t : {
		obverse_image 	 	: "Obverse image",
		reverse_image 	 	: "Reverse image",
		section_id 		 	: "ID",
		site 				: "Site",
		findspot 		 	: "Findspot",
		type_of_site 		: "Type of site",
		weight 			 	: "Weight",
		collection 		 	: "Collection",
		funds 			 	: "Funds",
		bibliographic_ref 	: "Bibliographic ref",
		info 				: "Info",
		catalogue 			: "Catalogue",
		catalogue_number 	: "Catalogue number",
		authority 			: "Authority",
		mint 				: "Mint",
		start_date 			: "Start date",
		end_date 			: "End date",
		obverse_legend 		: "Obverse legend",
		obverse_design 		: "Obverse design",
		obverse_symbol 		: "Obverse symbol",
		reverse_legend 		: "Reverse legend",
		reverse_design 		: "Reverse design",
		reverse_symbol 		: "Reverse symbol",
		denomination 		: "Denomination",
		chronology 			: "Chronology",
		material 			: "Material",
		material_links 		: "Material links",
		diameter 			: "Diameter",
		axis 				: "Axis",
		funds 				: "Funds",
		bibliography 		: "Bibliography",
		equivalents 		: "Equivalents",
		uri 				: "URI",
		site_geo_lat 		: "Site GEO lat",
		site_geo_lon 		: "Site GEO lon",
	},
	

	/**
	* SETUP
	*/
	setup : function() {

		const self = this
		
		// window.ready(function(){
		// 	self.fix_body_height()
		// 	//$(".colorbox").colorbox({rel:'group1',width:"80%", height:"80%"});
		// })
		// window.addEventListener("resize", self.fix_body_height, false)	
		
		// Activate tooltips for elements with dataset toggle = tooltip
		// $(function () {
		//   $('[data-toggle="tooltip"]').tooltip()
		// })

		// Activate images onclick gallery
		$('a.gallery').colorbox({
			rel 	 : 'gal',
			previous : " < ",
			next 	 : " > "
		});

		
		return true
	},//end setup



	/**
	* DRAW_ROWS
	*/
	draw_rows : function(options) {

		if(SHOW_DEBUG===true) {
			console.log("draw_rows - options:",options);
		}
		
		const self = this
	
		const container = document.getElementById(options.target)
		const ar_rows 	= options.ar_rows		
		
		// clean container div 
			while (container.hasChildNodes()) {
				container.removeChild(container.lastChild);
			}

		// reset vars 
			self.export_data_json = []
			self.export_data_csv  = []

		// total records info 
			var total_tipos 	= ar_rows.length
			var total_monedas 	= 0		
	
		// iterate ar_rows 
			const ar_rows_length = ar_rows.length
			for (var i = 0; i < ar_rows_length; i++) {
		
				// Build dom row
				//var row = self.build_row(ar_rows[i])
				// Add to container
				//target.appendChild(row)

				var tipo_object = ar_rows[i]

				// group container
					var group_container = common.create_dom_element({
							element_type 	: "div",
							parent 			: container,
							class_name 		: "group_container"
						})

				// tipo. Append row_tipo header to container
					tpl_common.draw_row_tipo(tipo_object, group_container)

				// monedas
					if (tipo_object.monedas) {
						// Monedas (fichero)
						var monedas_wrapper = common.create_dom_element({
							element_type 	: "div",
							parent 			: group_container,
							class_name 		: "monedas_wrapper"
						})
						var monedas_len = tipo_object.monedas.length
						for (var j = 0; j < monedas_len; j++) {

							var moneda_obj = tipo_object.monedas[j]

							// Add the self tipo data as property
							moneda_obj.tipo_object = tipo_object
							
							//var moneda_row = common.build_row(moneda_obj)
							//monedas_wrapper.appendChild(moneda_row)
							self.draw_row_moneda(moneda_obj, monedas_wrapper)

							total_monedas++
						}
					}

			}//end for (var i = 0; i < len; i++)

		// totals info 
			var tipos_text 	 = tstring.tipos   || "Tipos"
			var monedas_text = tstring.monedas || "Monedas"
			var total_info 	 = self.create_dom_element({
				element_type 	: "div",
				id   			: "total_records",
				//inner_html 		: tipos_text + ": " + total_tipos + " - " + monedas_text + ": " + total_monedas,
				//parent 			: container
			})

			// icon tipos
				var icon_tipos = self.create_dom_element({
					element_type 	: "i",
					class_name 		: "fa fas fa-eye",
					parent 			: total_info
				})
				icon_tipos.addEventListener("click",function(e){ self.toggle_tipos() })
				var text_tipos = self.create_dom_element({
					element_type 	: "span",
					inner_html 		: tipos_text + ": " + total_tipos + "",
					parent 			: total_info
				})
			
			// icon monedas	
				var icon_monedas  = self.create_dom_element({
					element_type 	: "i",
					class_name 		: "fa fas fa-eye",
					parent 			: total_info
				})
				icon_monedas.addEventListener("click",function(e){ self.toggle_monedas() })
				var text_monedas = self.create_dom_element({
					element_type 	: "span",
					inner_html 		: monedas_text + ": " + total_monedas,
					parent 			: total_info
				})

			// pagination clean
				const pagination = document.querySelector(".pagination")
				if (pagination) {
					// clean content
					while (pagination.hasChildNodes()) {
						pagination.removeChild(pagination.lastChild);
					}
				}

			// total records
				if (options.total) {



					// total_records info
					//	const total_records  = self.create_dom_element({
					//		element_type 	: "div",
					//		class_name 		: "total_records_info",
					//		inner_html 		: (tstring.total || "Total") +": "+ options.total,
					//		parent 			: total_info
					//	})
						

					// catalogo_rows_list
						const catalogo_rows_list = document.getElementById("catalogo_rows_list")
							  //catalogo_rows_list.prepend(total_info.cloneNode(true))
							  catalogo_rows_list.prepend(total_info)
						//$('#total_records').clone(true).prependTo('#catalogo_rows_list')

					// paginator 
						//const pagination = document.querySelector(".pagination")
						if (pagination) {
						//	// clean content
						//		while (pagination.hasChildNodes()) {
						//			pagination.removeChild(pagination.lastChild);
						//		}
							const page_nodes_data = paginator.build_page_nodes(options.total, options.limit, options.offset, 10)
							self.build_paginator_html(page_nodes_data, pagination, catalogo.search_rows) // goto_url

							// total_records info
								const total_records  = self.create_dom_element({
									element_type 	: "div",
									class_name 		: "total_records_info",
									inner_html 		: (tstring.total || "Total") +": "+ options.total + " " + tstring.tipos,
									parent 			: pagination
								})
							
							// pagination_footer 								
								const 	pagination_footer = document.querySelector(".pagination_footer")
										while (pagination_footer.hasChildNodes()) {
											pagination_footer.removeChild(pagination_footer.lastChild);
										}
								const 	pagination_clone  = pagination.cloneNode(true);
										pagination_footer.appendChild(pagination_clone)

								// event delegation 
									pagination_clone.addEventListener('click', self.paginator_click_event);
						}
				}			
				

		// download buttons 
			var clean_ar_rows  = []

			var ar_coins = self.export_data_json.filter(element => element.data_ref==="coin")
			var ar_types = self.export_data_json.filter(element => element.data_ref==="type")
			// Already properties defined in coins (avoid duplicate when merge with type properties)
			var exclue_add = [
				"data_ref",
				"type_id",
				"data_lang",
				"data_source_url",
				"data_source_org"
			]
			var ar_coins_length = ar_coins.length
			for (var i = 0; i < ar_coins_length; i++) {

				var row = ar_coins[i]
				
				if (row.types && row.types.length>0) {
					var type_id = row.types[0]
					var match_types = ar_types.filter(element => element.type_id===type_id)
					match_types.forEach(function(current_type) {
						for (var type_key in current_type) {
							if(exclue_add.indexOf(type_key) !== -1) continue;

							if (row.hasOwnProperty(type_key)) {
								if(SHOW_DEBUG===true) {
									console.log("Warning: type property is already used by coin (IGNORED!) ",type_key)
								}
								// Add type property to coin
								//row["Type " + type_key] = current_type[type_key]
							}else{
								// Add type property to coin
								row[type_key] = current_type[type_key]
							}
						}
					});
				}				
			}

			// download buttons wrapper
				var download_buttons_wrapper = common.create_dom_element({
					element_type : "div",
					class_name   : "download_buttons_wrapper",
					parent 		 : 	container
				})		
			
				// download json
					var button_download_json = self.build_download_data_link({
						obj_to_save : ar_coins,
						data_type 	: 'json',
						file_name 	: "numisdata_valencia_list"  + ".json"
					})
					download_buttons_wrapper.appendChild(button_download_json)
				
				// download csv
					var button_download_csv = self.build_download_data_link({
						obj_to_save : ar_coins,
						data_type 	: 'csv',
						file_name 	: "numisdata_valencia_list" + ".csv"
					})
					download_buttons_wrapper.appendChild(button_download_csv)


		// tooltips
			const links = container.querySelectorAll('.show_tooltip')
			self.activate_tooltips(links)


		return true
	},//end draw_rows



	/**
	* DRAW_ROW_MONEDA
	* Draw ONE moneda row
	* Build DOM objects from json data
	*/
	draw_row_moneda : function(moneda_obj, moneda_wrapper) {
		
		const self = this
		var t 	 = self.t

		var row_data_json = {
			"data_ref" : "coin",
			"types"    : JSON.parse(moneda_obj.tipos)
		}		

		var row_data = moneda_obj
		if(SHOW_DEBUG===true) {
			//console.log("row_data:",row_data);;
		}

		// ROW_DATA_JSON +
		row_data_json[t.section_id] = row_data.section_id || ''
	
		var row_container = self.create_dom_element({
			element_type 	: "div",
			class_name   	: "row_container",
			parent 			: moneda_wrapper
		})
		row_container.addEventListener("click",function(){
			//self.open_detail(this, row_data)
			window.open("mon/" + moneda_obj.section_id, '_blank')
		},false)		

		// imagen_anverso
			var imagen_anverso = self.create_dom_element({
				element_type 	: "div",
				class_name   	: "imagen_anverso",
				parent 			: row_container
				})
				var bg_image = typeof(row_data.imagen_anverso[0])!=="undefined" ? row_data.imagen_anverso[0].image : null
				if (bg_image) {
					var bg_image2 = self.build_thumb_url(bg_image)
					imagen_anverso.style.backgroundImage = "url("+bg_image2+")"
					// For data_json
					// bg_image = bg_image.replace('/dedalo/media/','/valencia/media/')
					var big_image_url = self.build_quality_image_url(bg_image, 'original')
				}
				// ROW_DATA_JSON +
				row_data_json[t.obverse_image] = big_image_url

		// imagen_reverso
			var imagen_reverso = self.create_dom_element({
				element_type 	: "div",
				class_name   	: "imagen_reverso",
				parent 			: row_container
				})
				var bg_image = typeof(row_data.imagen_reverso[0])!=="undefined" ? row_data.imagen_reverso[0].image : null
				if (bg_image) {
					//bg_image = bg_image.replace('/1.5MB/','/thumb/')
					var bg_image2 = self.build_thumb_url(bg_image)
					imagen_reverso.style.backgroundImage = "url("+bg_image2+")"
					// For data_json
					// bg_image = bg_image.replace('/dedalo/media/','/valencia/media/')
					var big_image_url = self.build_quality_image_url(bg_image, 'original')
				}
				// ROW_DATA_JSON +
				row_data_json[t.reverse_image] = big_image_url 

		// right_block
			var right_block = self.create_dom_element({ element_type : "div", class_name : "right_block", parent : row_container })

				// section_id
					/*
					if (row_data.section_id) {
						var section_id = self.create_dom_element({
							element_type 	: "div",
							class_name   	: "section_id",
							text_content 	: row_data.section_id,
							parent 			: right_block
						})				
					}
					*/

				// coleccion 
					if (row_data.coleccion) {
						let line = row_data.coleccion
						if (row_data.numero) {
							line += " | " + row_data.numero
						}
						var coleccion = self.create_dom_element({
							element_type 	: "div",
							class_name   	: "section_id",
							text_content 	: line,
							parent 			: right_block
						})
					}
					// ROW_DATA_JSON +
					row_data_json[t.collection] = row_data.coleccion || ''


				// hallazgo
				if (row_data.hallazgo) {
					var hallazgo = self.create_dom_element({
						element_type 	: "div",
						class_name   	: "hallazgo",
						text_content 	: row_data.hallazgo,
						parent 			: right_block
					})				
				}
				// ROW_DATA_JSON +
				row_data_json[t.site] = row_data.hallazgo || ''
		
				// peso
				if (row_data.peso) {					
					var peso_label = row_data.peso ? row_data.peso.replace('.', ',')  + " g" : ""
					var peso = self.create_dom_element({
						element_type 	: "div",
						class_name   	: "peso",
						text_content 	: peso_label,
						parent 			: right_block
					})				
				}
				// ROW_DATA_JSON +
				row_data_json[t.weight] = row_data.peso ? row_data.peso.replace('.', ',') : ""			

				// fondo 
					/*		
					if (row_data.fondo) {
						var fondo = self.create_dom_element({
							element_type 	: "div",
							class_name   	: "fondo",
							text_content 	: row_data.fondo,
							parent 			: right_block
						})
					}
					// ROW_DATA_JSON +
					row_data_json[t.funds] = row_data.fondo || ''
					*/

				// bibliografia			
					if (row_data.bibliografia) {
						var bibliografia = self.create_dom_element({
							element_type 	: "div",
							class_name   	: "bibliografia",
							text_content 	: row_data.bibliografia,
							parent 			: right_block
						})
					}
					// ROW_DATA_JSON +
					row_data_json[t.bibliographic_ref] = row_data.bibliografia || ''

				// info_publica
					if (row_data.info_publica) {
						var info_publica = self.create_dom_element({
							element_type 	: "div",
							class_name   	: "info_publica",
							inner_html 	 	: row_data.info_publica,
							parent 			: right_block
						})
					}
					// ROW_DATA_JSON +
					row_data_json[t.info] = row_data.info_publica || ''
		

		// Add to texport_data_json
		self.to_export_data_json(row_data_json)			


		return true
	},//end draw_row_moneda



	/**
	* DRAW_ROW_TIPO
	* Draw ONE tipo row
	* Build DOM objects from json data
	*/
	draw_row_tipo : function(tipo_object, tipo_container) {

		const self = this
		var t 	 = self.t
	
		var row_data_json = {
			"data_ref" 	: "type",
			"type_id" 	: tipo_object.section_id
		}

		var tipo_header_wrapper = common.create_dom_element({
			element_type 	: "div",
			class_name 		: "tipo_header_wrapper heading",
			parent 			: tipo_container
		})
	
		// Title (catalogo, autoridad, numero_catalogo)
			/*
			if (tipo_object.catalogo) {
				var t_catalogo 			= tipo_object.catalogo || ''
				
				var catalogo = common.create_dom_element({
					element_type 	: "h1",
					parent 			: tipo_header_wrapper,
					text_content 	: t_catalogo,
					class_name 		: "show_tooltip",
					data_set 		: {
						section_id  : tipo_object.section_id
					}
				})

				// console.log("tipo_object.catalogo_dato:",tipo_object.catalogo_dato);
				if (tipo_object.catalogo_dato && tipo_object.catalogo_dato.length>0) {
					var ar_title = []
					tipo_object.catalogo_dato.forEach(function(element){
						ar_title.push(element.publicacion)
					})
					if (ar_title.length>0) {
						catalogo.title = ar_title.join(", ")
						self.add_tool_tip(catalogo)
					}
				}
			}
			// ROW_DATA_JSON +
			row_data_json[t.catalogue] = tipo_object.catalogo || ''
			*/


		var info_string = ''

		// Numero catálogo
			/*
			var t_numero_catalogo 	= tipo_object.numero_catalogo || ''
			if (t_numero_catalogo.length>0) {
				info_string += " " + t_numero_catalogo
			}
			// ROW_DATA_JSON +
			row_data_json[t.catalogue_number] = tipo_object.numero_catalogo || ''
			*/
		
	
		// Autoridad 
			if (tipo_object.autoridad) {
				var autoridad_nombre = tipo_object.autoridad
					//autoridad_nombre = autoridad_nombre.replace('|', ' ')
					autoridad_nombre = autoridad_nombre.replace(',', ', ') // Add space between names separated with comma
					//autoridad_nombre = autoridad_nombre.replace(/^(.*) \|$/g, "");
				info_string += " " + autoridad_nombre
			}
			// ROW_DATA_JSON +
			row_data_json[t.authority] = (typeof autoridad_nombre!=="undefined") ? autoridad_nombre : ''

		
		// info_string
			if (tipo_object.autoridad) {
				var catalogo_num = common.create_dom_element({
					element_type 	: "h1",
					class_name 		: "catalogo_num",
					text_content 	: info_string,
					parent 			: tipo_header_wrapper
				})
			}


		// Ceca
			if (tipo_object.ceca_text) {
				var ceca_info = common.create_dom_element({
					element_type 	: "div",
					parent 			: tipo_header_wrapper,
					class_name 		: "ceca_info info_line"
				})
					//common.create_dom_element({
					//	element_type 	: "div",
					//	parent 			: ceca_info,
					//	class_name 		: "info_label",
					//	//text_content 	: tstring['ceca']
					//	text_content 	: " | " 
					//})
					var ceca_value = common.create_dom_element({
						element_type 	: "div",
						parent 			: ceca_info,
						class_name 		: "info_value",
						text_content 	: tipo_object.ceca_text 
					})
					if (tipo_object.ceca_links) {
						//var ar_uri = split(tipo_object.ceca_links)
						var ar_uri = tipo_object.ceca_links.split(" | ")	
						ar_uri.forEach(function(element){
							var a = self.create_dom_element({
								element_type 	: "a",
								class_name   	: "fa fas fa-external-link show_tooltip",
								parent 			: ceca_value
							})
							a.setAttribute("target","_blank")
							a.setAttribute("href",element)
							a.setAttribute("title", "Go to: " + element)
							self.add_tool_tip(a)
						})
					}
			}
			// ROW_DATA_JSON +
			row_data_json[t.mint] = tipo_object.ceca_text || ''


		// Denominacion
		if (tipo_object.denominacion) {
			var denominacion_info = common.create_dom_element({
				element_type 	: "div",
				parent 			: tipo_header_wrapper,
				class_name 		: "denominacion_info info_line"
			})
				common.create_dom_element({
					element_type 	: "div",
					parent 			: denominacion_info,
					class_name 		: "info_label",
					//text_content 	: tstring['denominacion']
					text_content 	: " | "
				})
				var denominacion_value = common.create_dom_element({
					element_type 	: "div",
					parent 			: denominacion_info,
					class_name 		: "info_value",
					text_content 	: tipo_object.denominacion
				})
				if (tipo_object.denominacion_iri) {
					var ar_uri = tipo_object.denominacion_iri.split(" | ")					
					ar_uri.forEach(function(element){
						var a = self.create_dom_element({
							element_type 	: "a",
							class_name   	: "fa fas fa-external-link show_tooltip",
							parent 			: denominacion_value
						})
						a.setAttribute("target","_blank")
						a.setAttribute("href",element)
						a.setAttribute("title", "Go to: " + element)						
						self.add_tool_tip(a)
					})
				}
		}
		// ROW_DATA_JSON +
		row_data_json[t.denomination] = tipo_object.denominacion || ''


		// Fecha
		if (tipo_object.fecha_inicio) {
			var fecha_info = common.create_dom_element({
				element_type 	: "div",
				parent 			: tipo_header_wrapper,
				class_name 		: "fecha_info info_line"
				})
				common.create_dom_element({
					element_type 	: "div",
					parent 			: fecha_info,
					class_name 		: "info_label",
					//text_content 	: tstring['fecha']
					text_content 	: " | "
				})
				var fecha = tipo_object.fecha_inicio
					if (tipo_object.fecha_fin) {
						fecha += ' -> ' + tipo_object.fecha_fin
					}
				common.create_dom_element({
					element_type 	: "div",
					parent 			: fecha_info,
					class_name 		: "info_value",
					text_content 	: fecha
				})
		}
		// ROW_DATA_JSON +
		row_data_json[t.start_date] = tipo_object.fecha_inicio || ''		
		row_data_json[t.end_date]   = tipo_object.fecha_fin || ''


		// INFO LINE
		var tipo_add_info = self.create_dom_element({ element_type : "div", class_name : "tipo_add_info", parent : tipo_container })
		
			// ANVERSO
				/*
				if (tipo_object && (tipo_object.leyenda_anverso || tipo_object.tipo_anverso || tipo_object.simbolo_anverso)) {
					var leyenda_anverso = self.create_dom_element({
							element_type 	: "span",
							class_name   	: "title_leyenda",
							text_content 	: tstring["anverso"]  +" ",
							parent 			: tipo_add_info
							})

					if (tipo_object.leyenda_anverso) {
						var leyenda_anverso = self.create_dom_element({
							element_type 	: "div",
							class_name   	: "leyenda_anverso",
							text_content 	: tstring["leyenda"]  +": "+ tipo_object.leyenda_anverso,
							parent 			: tipo_add_info
							})
					}
					if (tipo_object.tipo_anverso) {
						var tipo_anverso = self.create_dom_element({
							element_type 	: "div",
							class_name   	: "tipo_anverso",
							text_content 	: tstring["diseno"] +": "+tipo_object.tipo_anverso,
							parent 			: tipo_add_info
							})
					}
					if (tipo_object.simbolo_anverso) {
						var simbolo_anverso = self.create_dom_element({
							element_type 	: "div",
							class_name   	: "simbolo_anverso",
							text_content 	: tstring["simbolo"]  +": "+ tipo_object.simbolo_anverso,
							parent 			: tipo_add_info
							})
					}
				}
				// ROW_DATA_JSON +
				row_data_json[t.obverse_legend] = tipo_object.leyenda_anverso || ''
				row_data_json[t.obverse_design] = tipo_object.tipo_anverso || ''
				row_data_json[t.obverse_symbol] = tipo_object.simbolo_anverso || ''
				*/


			// REVERSO
				/*
				if (tipo_object && (tipo_object.leyenda_reverso || tipo_object.tipo_reverso || tipo_object.simbolo_reverso)) {
					var leyenda_anverso = self.create_dom_element({
							element_type 	: "span",
							class_name   	: "title_leyenda",
							text_content 	: tstring["reverso"]  +" ",
							parent 			: tipo_add_info
						})
					if (tipo_object.leyenda_reverso) {
						var leyenda_reverso = self.create_dom_element({
							element_type 	: "div",
							class_name   	: "leyenda_reverso",
							text_content 	: tstring["leyenda"] +": "+ tipo_object.leyenda_reverso,
							parent 			: tipo_add_info
						})
					}
					if (tipo_object.tipo_reverso) {
						var tipo_reverso = self.create_dom_element({
							element_type 	: "div",
							class_name   	: "tipo_reverso",
							text_content 	: tstring["diseno"]  +": "+ tipo_object.tipo_reverso,
							parent 			: tipo_add_info
						})
					}
					if (tipo_object.simbolo_reverso) {
						var simbolo_reverso = self.create_dom_element({
							element_type 	: "div",
							class_name   	: "simbolo_reverso",
							text_content 	: tstring["simbolo"]  +": "+ tipo_object.simbolo_reverso,
							parent 			: tipo_add_info
						})
					}
				}
				// ROW_DATA_JSON +
				row_data_json[t.reverse_legend] = tipo_object.leyenda_reverso || ''
				row_data_json[t.reverse_design] = tipo_object.tipo_reverso || ''
				row_data_json[t.reverse_symbol] = tipo_object.simbolo_reverso || ''
				*/


		// Add to export_data_json
		self.to_export_data_json(row_data_json)		


		return true
	},//end draw_row_tipo



	/**
	* BUILD_DETAIL
	* Build DOM objects from json data
	*/
	build_detail : function(row_data) {
		
		const self = this
		var t 	   = self.t

		if (!row_data.tipos || row_data.tipos.length<1) {
			console.warn("Invalid 'tipos' for current coin:", row_data);
			return false
		}

		var row_data_json = {			
			"data_ref" 			: "coin",
			"types"    			: JSON.parse(row_data.tipos)
		}

		var tipo_object = row_data.tipo_object

		var detail_container = self.create_dom_element({
			element_type 	: "div",
			class_name   	: "detail_container",
		})


		//LEFT
		var left_detail = self.create_dom_element({
			element_type 	: "div",
			class_name   	: "left_detail",
			parent 			: detail_container
			})

			var img_size = 320

			// imagen_anverso
				var imagen_anverso = self.create_dom_element({
					element_type 	: "div",
					class_name   	: "imagen_anverso gal",
					parent 			: left_detail
					})
					imagen_anverso.setAttribute('rel', 'gal');
					var bg_image  = typeof(row_data.imagen_anverso[0])!=="undefined" ? row_data.imagen_anverso[0].image : null							
					if (bg_image) {
						var thumb_url = self.build_thumb_url(bg_image,img_size,img_size)
						imagen_anverso.style.backgroundImage = "url("+thumb_url+")"
					}					

					var imagen_anverso_big = self.create_dom_element({
						element_type 	: "div",
						class_name   	: "imagen_anverso_big"
						})
						var big_image_url = self.build_quality_image_url(bg_image, 'original')
						imagen_anverso_big.style.backgroundImage = "url("+big_image_url+")"						
						
						// ROW_DATA_JSON +
						row_data_json[t.obverse_image] = big_image_url	

					var link = self.create_dom_element({
						element_type 	: "a",
						class_name   	: "fa fas fa-arrow-circle-down download_image",
						parent 			: imagen_anverso_big
						})
						link.setAttribute('download', 'numisdata_valencia-' + row_data.section_id + '-A.jpg');
						link.setAttribute('target', '_blank');
						link.setAttribute('href', big_image_url);

					imagen_anverso.addEventListener("click",function(e){					
						e.stopPropagation()
						// Build dialog with colorbox
						// see http://www.jacklmoore.com/colorbox/
						// Create before load data for performance perception	
						$.colorbox({
							html 		: imagen_anverso_big,
							transition 	: "none",
							speed 		: 300,
							rel 		: "gal"
						});
						//$.colorbox.resize()
					})

			// imagen_reverso
				var imagen_reverso = self.create_dom_element({
					element_type 	: "div",
					class_name   	: "imagen_reverso gal",
					parent 			: left_detail
					})
					imagen_reverso.setAttribute('rel', 'gal');
					var bg_image  = typeof(row_data.imagen_reverso[0])!=="undefined" ? row_data.imagen_reverso[0].image : null
					if (bg_image) {
						var thumb_url = self.build_thumb_url(bg_image,img_size,img_size)
						imagen_reverso.style.backgroundImage = "url("+thumb_url+")"
					}

					var imagen_reverso_big = self.create_dom_element({
						element_type 	: "div",
						class_name   	: "imagen_reverso_big"
						})
						var big_image_url = self.build_quality_image_url(bg_image, 'original')
						imagen_reverso_big.style.backgroundImage = "url("+big_image_url+")"						
						
						// ROW_DATA_JSON +
						row_data_json[t.reverse_image] = big_image_url

					var link = self.create_dom_element({
						element_type 	: "a",
						class_name   	: "fa fas fa-arrow-circle-down download_image",
						parent 			: imagen_reverso_big
						})
						link.setAttribute('download', 'numisdata_valencia-' + row_data.section_id + '-R.jpg');
						link.setAttribute('target', '_blank');
						link.setAttribute('href', big_image_url);

					imagen_reverso.addEventListener("click",function(e){
						e.stopPropagation()
						// Build dialog with colorbox
						// see http://www.jacklmoore.com/colorbox/
						// Create before load data for performance perception	
						$.colorbox({
							html 		: imagen_reverso_big,
							transition 	: "none",
							speed 		: 300,
							rel 		: "gal"							
						});
						//$.colorbox.resize()
					})

				// group images in colorbox switching each item
					imagen_anverso_big.addEventListener("click",function(e){
						e.stopPropagation()
						if (!e.target.classList.contains("imagen_anverso_big")) {
							return
						}
						imagen_reverso.click()
					})
					imagen_reverso_big.addEventListener("click",function(e){
						e.stopPropagation()
						if (!e.target.classList.contains("imagen_reverso_big")) {
							return
						}
						imagen_anverso.click()
					})

					
		// RIGHT
		var right_detail = self.create_dom_element({
			element_type 	: "div",
			class_name   	: "right_detail",
			parent 			: detail_container
			})
			
			// ID
				/*
				var line = self.create_dom_element({element_type : "div", class_name : "line", parent : right_detail})
					self.create_dom_element({
						element_type 	: "span",
						class_name   	: "label label_section_id",
						text_content 	: tstring["id"] || "ID",
						parent 			: line
					})
					self.create_dom_element({
						element_type 	: "div",
						class_name   	: "section_id",
						text_content 	: row_data.section_id,
						parent 			: line
					})
					// ROW_DATA_JSON +
					row_data_json[t.section_id] = row_data.section_id
				*/

			// coleccion			
				if (row_data.coleccion) {
					var line = self.create_dom_element({element_type : "div", class_name : "line", parent : right_detail})
					self.create_dom_element({
						element_type 	: "span",
						class_name   	: "label label2em",
						text_content 	: tstring.coleccion || "coleccion",
						parent 			: line
					})
					var line_coleccion = row_data.coleccion
					if (row_data.numero) {
						line_coleccion += " | " + row_data.numero
					}
					self.create_dom_element({
						element_type 	: "div",
						class_name   	: "section_id",
						inner_html 		: line_coleccion,
						parent 			: line
					})
				}
				// ROW_DATA_JSON +
				row_data_json[t.collection] = row_data.coleccion || ''
			
		
		var hallazgo_detail = self.create_dom_element({
			element_type 	: "div",
			class_name   	: "separator hallazgo_detail",
			parent 			: right_detail
			})
			
			// hallazgo 
				if (row_data.hallazgo) {
					var line = self.create_dom_element({element_type : "div", class_name : "line", parent : hallazgo_detail})			
					self.create_dom_element({
						element_type 	: "span",
						class_name   	: "label",
						text_content 	: tstring.yacimiento || "Yacimiento",
						parent 			: line
					})
					self.create_dom_element({
						element_type 	: "div",
						class_name   	: "hallazgo",
						text_content 	: row_data.hallazgo,
						parent 			: line
					})
				}
				// ROW_DATA_JSON +
				row_data_json[t.site] = row_data.hallazgo || ''

				// hallazgo dato for export data
				// console.log("row_data:",row_data);
				// ROW_DATA_JSON +
				var site_geo_lat = ''
				var site_geo_lon = ''
				if (typeof row_data.hallazgo_dato[0]!=="undefined") {
					site_geo_lat = self.extract_geo(row_data.hallazgo_dato[0], "lat")
					site_geo_lon = self.extract_geo(row_data.hallazgo_dato[0], "lon")
				}
				row_data_json[t.site_geo_lat] = site_geo_lat
				row_data_json[t.site_geo_lon] = site_geo_lon

			// tipo de hallazgo 
				if (typeof(row_data.hallazgo_dato[0])!=="undefined" && typeof(row_data.hallazgo_dato[0].tipologia)!=="undefined") {
					var line = self.create_dom_element({element_type : "div", class_name : "line", parent : hallazgo_detail})
					self.create_dom_element({
						element_type 	: "span",
						class_name   	: "label",
						text_content 	: tstring.tipo_de_yacimiento || "Tipo de yacimiento",
						parent 			: line
					})
					self.create_dom_element({
						element_type 	: "div",
						class_name   	: "tipo_de_hallazgo",
						text_content 	: row_data.hallazgo_dato[0].tipologia,
						parent 			: line
					})
				}
				// ROW_DATA_JSON +
				row_data_json[t.type_of_site] = typeof(row_data.hallazgo_dato[0])!=="undefined" && typeof(row_data.hallazgo_dato[0].tipologia)!=="undefined" ? row_data.hallazgo_dato[0].tipologia : ''


			// localización 
				if (typeof(row_data.hallazgo_dato[0])!=="undefined" && typeof(row_data.hallazgo_dato[0].municipio)!=="undefined") {
					var line = self.create_dom_element({element_type : "div", class_name : "line", parent : hallazgo_detail})			
					self.create_dom_element({
						element_type 	: "span",
						class_name   	: "label",
						text_content 	: tstring.localizacion || "Localización",
						parent 			: line
					})
					var hallazgo_localizacion = typeof(row_data.hallazgo_dato[0].municipio)!=="undefined" ? row_data.hallazgo_dato[0].municipio : ""
					self.create_dom_element({
						element_type 	: "div",
						class_name   	: "localizacion",
						text_content 	: hallazgo_localizacion,
						parent 			: line
					})
				}
				// ROW_DATA_JSON +
				row_data_json[t.findspot] = typeof(row_data.hallazgo_dato[0])!=="undefined" && typeof(row_data.hallazgo_dato[0].municipio)!=="undefined" ? row_data.hallazgo_dato[0].municipio : ''


			// ceca 
				var ceca_detail = self.create_dom_element({
					element_type 	: "div",
					class_name   	: "separator ceca_detail",
					parent 			: right_detail
					})
					// Ceca
					if (row_data.ceca) {
						var line = self.create_dom_element({element_type : "div", class_name : "line", parent : ceca_detail})
						self.create_dom_element({
							element_type 	: "span",
							class_name   	: "label",
							text_content 	: tstring.ceca || "Ceca",
							parent 			: line
						})
						var ceca = self.create_dom_element({
							element_type 	: "div",
							class_name   	: "ceca",
							text_content 	: self.remove_string_double_values(row_data.ceca,","),
							parent 			: line
						})
						if (row_data.tipo_object.ceca_links) {
							var ar_uri = row_data.tipo_object.ceca_links.split(" | ")
							ar_uri.forEach(function(element){
								var a = self.create_dom_element({
									element_type 	: "a",
									class_name   	: "fa fas fa-external-link show_tooltip",
									parent 			: ceca
								})
								a.setAttribute("target","_blank")
								a.setAttribute("href",element)
								a.setAttribute("title", "Go to: "+element)
								self.add_tool_tip(a)
							})
						}
					}
					// ROW_DATA_JSON +
					row_data_json[t.mint] = row_data.ceca || ''


			// cronologia 
				if (row_data.cronologia) {
					var line = self.create_dom_element({element_type : "div", class_name : "line", parent : ceca_detail})
					self.create_dom_element({
						element_type 	: "span",
						class_name   	: "label",
						text_content 	: tstring.cronologia || "Cronología",
						parent 			: line
					})
					var cronologia_title = split(row_data.cronologia)					
					//var cronologia_title = row_data.cronologia.split(" | ")
					self.create_dom_element({
						element_type 	: "div",
						class_name   	: "cronologia",
						text_content 	: cronologia_title[0],
						parent 			: line
					})
				}
				// ROW_DATA_JSON +
				// row_data_json[t.chronology] = typeof cronologia_title[0]!=="undefined" ? cronologia_title[0] : ''
				row_data_json[t.start_date] = tipo_object.fecha_inicio || ''
				row_data_json[t.end_date] 	= tipo_object.fecha_fin || ''
				

			// autoridad 
				if (row_data.tipo_object.autoridad) {
					var line = self.create_dom_element({element_type : "div", class_name : "line", parent : ceca_detail})				
					self.create_dom_element({
						element_type 	: "span",
						class_name   	: "label",
						text_content 	: tstring.autoridad || "Creador",
						parent 			: line
					})

					// autoridad_info_string
					var autoridad_info_string = ""
					/*
					if (row_data.tipo_object.autoridad_dato && row_data.tipo_object.autoridad_dato.length>0) {
						// La autoridad puede estar o no publicada.
						// Lo intentamos...
						var ar_autoridad_name = []
						row_data.tipo_object.autoridad_dato.forEach(function(element){
							//console.log("element:",element);
							
							var ar_parts = []
							if (element.nombre) {
								ar_parts.push(element.nombre)
							}
							if (element.apellidos) {
								ar_parts.push(element.apellidos)
							}

							var t_autoridad = ar_parts.join(" ")
							ar_autoridad_name.push(t_autoridad)
						})
						if (ar_autoridad_name.length>0) {
							autoridad_info_string += " " + ar_autoridad_name.join(", ")
						}
					}
					*/
					if (autoridad_info_string.length<1) {
						// Si la autoridad NO está publicada, cogemos el dato de la columna resuelta de tipo (autoridad)
						var nombre = row_data.tipo_object.autoridad
							nombre = nombre.replace(',', ', ') // Add space between names separated with comma

						autoridad_info_string = nombre

						// role
						//if (row_data.tipo_object.autoridad_rol && row_data.tipo_object.autoridad_rol.length>0) {
						//	autoridad_info_string += " - " + row_data.tipo_object.autoridad_rol
						//}
					}
					
					var autoridad = self.create_dom_element({
						element_type 	: "div",
						class_name   	: "autoridad",
						text_content 	: autoridad_info_string,
						parent 			: line
					})

					if (row_data.tipo_object.autoridad_dato && typeof(row_data.tipo_object.autoridad_dato[0])!=="undefined" && typeof(row_data.tipo_object.autoridad_dato[0].uri)!=="undefined" ) {
						var ar_uri = split(row_data.tipo_object.autoridad_dato[0].uri)
						ar_uri.forEach(function(element){
							var a = self.create_dom_element({
								element_type 	: "a",
								class_name   	: "fa fas fa-external-link show_tooltip",
								parent 			: autoridad
							})
							a.setAttribute("target","_blank")
							a.setAttribute("href",element)
							a.setAttribute("title", "Go to: "+element)
							self.add_tool_tip(a)
						})
					}

					// role
						if (row_data.tipo_object.autoridad_rol && row_data.tipo_object.autoridad_rol.length>0) {
							var line = self.create_dom_element({element_type : "div", class_name : "line", parent : ceca_detail})
							self.create_dom_element({
								element_type 	: "span",
								class_name   	: "label",
								text_content 	: tstring.rol || "Rol",
								parent 			: line
							})
							var role = self.create_dom_element({
								element_type 	: "div",
								class_name   	: "role",
								text_content 	: self.clean_data_string(row_data.tipo_object.autoridad_rol),
								parent 			: line
							})
						}
				}
				// ROW_DATA_JSON +
				row_data_json[t.authority] = typeof autoridad_info_string!=="undefined" ? autoridad_info_string : ''


			// denominacion 
				if (row_data.tipo_object.denominacion) {
					var line = self.create_dom_element({element_type : "div", class_name : "line", parent : ceca_detail})
					self.create_dom_element({
						element_type 	: "span",
						class_name   	: "label",
						text_content 	: tstring.denominacion || "Denominacion",
						parent 			: line
					})
					var denominacion = self.create_dom_element({
						element_type 	: "div",
						class_name   	: "denominacion",
						text_content 	: row_data.tipo_object.denominacion,
						parent 			: line
					})
					if (row_data.tipo_object.denominacion_iri) {
						//var ar_uri = split(row_data.tipo_object.denominacion_iri)
						var ar_uri = row_data.tipo_object.denominacion_iri.split(" | ")
						ar_uri.forEach(function(element){
							var a = self.create_dom_element({
								element_type 	: "a",
								class_name   	: "fa fas fa-external-link show_tooltip",
								parent 			: denominacion
							})
							a.setAttribute("target","_blank")
							a.setAttribute("href",element)
							a.setAttribute("title", "Go to: "+element)
							self.add_tool_tip(a)
						})
					}
				}
				// ROW_DATA_JSON +
				row_data_json[t.denomination] = row_data.tipo_object.denominacion || ''


			// material
				if (row_data.tipo_object.material) {
					var line = self.create_dom_element({element_type : "div", class_name : "line", parent : ceca_detail})
					self.create_dom_element({
						element_type 	: "span",
						class_name   	: "label",
						text_content 	: tstring.material || "Material",
						parent 			: line
					})					
					var material = self.create_dom_element({
						element_type 	: "div",
						class_name   	: "material",
						text_content 	: self.clean_data_string(row_data.tipo_object.material),
						parent 			: line
					})
					if (row_data.tipo_object.material_links) {
						//var ar_uri = split(row_data.tipo_object.material_links)
						var ar_uri = row_data.tipo_object.material_links.split(" | ")						
						ar_uri.forEach(function(element){
							var a = self.create_dom_element({
								element_type 	: "a",
								class_name   	: "fa fas fa-external-link show_tooltip",
								parent 			: material
							})
							a.setAttribute("target","_blank")
							a.setAttribute("href",element)
							a.setAttribute("title", "Go to: "+element)
							self.add_tool_tip(a)
						})
					}
				}
				// ROW_DATA_JSON +
				row_data_json[t.material] 	    = row_data.tipo_object.material || ''
				row_data_json[t.material_links] = row_data.tipo_object.material_links || ''


		var medida_detail = self.create_dom_element({
			element_type 	: "div",
			class_name   	: "separator medida_detail",
			parent 			: right_detail
			})
			// peso 
				if (row_data.peso) {
					var line = self.create_dom_element({element_type : "div", class_name : "line", parent : medida_detail})
					self.create_dom_element({
						element_type 	: "span",
						class_name   	: "label",
						text_content 	: tstring.peso || "Peso",
						parent 			: line
					})					
					self.create_dom_element({
						element_type 	: "div",
						class_name   	: "peso",
						text_content 	: row_data.peso ? row_data.peso.replace('.', ',')  + " g" : "",
						parent 			: line
					})
				}
				// ROW_DATA_JSON +
				row_data_json[t.weight] = row_data.peso ? row_data.peso.replace('.', ',') : ""


			// diametro 
				if (row_data.diametro) {
					var line = self.create_dom_element({element_type : "div", class_name : "line", parent : medida_detail})
					self.create_dom_element({
						element_type 	: "span",
						class_name   	: "label",
						text_content 	: tstring.diametro || "Diámetro",
						parent 			: line
					})					
					self.create_dom_element({
						element_type 	: "div",
						class_name   	: "diametro",
						text_content 	: row_data.diametro + " mm",
						parent 			: line
					})
				}
				// ROW_DATA_JSON +
				row_data_json[t.diameter] = row_data.diametro || ''


			// posicion_cunos 
				if (row_data.cuno && row_data.cuno.length>0) {
					var line = self.create_dom_element({element_type : "div", class_name : "line", parent : medida_detail})
					self.create_dom_element({
						element_type 	: "span",
						class_name   	: "label",
						text_content 	: tstring["posicion_cunos"] || "Posición de cuños",
						parent 			: line
					})					
					self.create_dom_element({
						element_type 	: "div",
						class_name   	: "posicion_cunos",
						text_content 	: row_data.cuno + " h",
						parent 			: line
					})
				}
				// ROW_DATA_JSON +
				row_data_json[t.axis] = row_data.cuno || ''

		
		var anverso_detail = self.create_dom_element({
			element_type 	: "div",
			class_name   	: "separator anverso_detail",
			parent 			: right_detail
			})

			var line = self.create_dom_element({element_type : "div", class_name : "line", parent : anverso_detail})
				self.create_dom_element({
					element_type 	: "span",
					class_name   	: "label anverso_label",
					text_content 	: (tstring.anverso || "ANVERSO"),
					parent 			: line
				})
			self.create_dom_element({
					element_type 	: "div",
					class_name   	: "leyenda_anverso",
					parent 			: line
				})
		

			// leyenda_anverso
				if (row_data.tipo_object.leyenda_anverso) {
					var line = self.create_dom_element({element_type : "div", class_name : "line", parent : anverso_detail})
					self.create_dom_element({
						element_type 	: "span",
						class_name   	: "label",
						text_content 	: (tstring.leyenda || "Leyenda"),
						parent 			: line
					})
					var value = self.replace_dedalo_paths(row_data.tipo_object.leyenda_anverso) +'<br>'+ (row_data.tipo_object.leyenda_anverso_transcripcion || '')			
					self.create_dom_element({
						element_type 	: "div",
						class_name   	: "leyenda_anverso",
						inner_html 		: value,
						parent 			: line
					})
				}
			// diseno_anverso
				if (row_data.tipo_object.tipo_anverso) {
					var line = self.create_dom_element({element_type : "div", class_name : "line", parent : anverso_detail})
					self.create_dom_element({
						element_type 	: "span",
						class_name   	: "label",
						text_content 	: (tstring.diseno || "Diseño"),
						parent 			: line
					})					
					self.create_dom_element({
						element_type 	: "div",
						class_name   	: "diseno_anverso",
						inner_html 		: row_data.tipo_object.tipo_anverso,
						parent 			: line
					})
				}
			// simbolo_anverso
				if (row_data.tipo_object.simbolo_anverso) {
					var line = self.create_dom_element({element_type : "div", class_name : "line", parent : anverso_detail})
					self.create_dom_element({
						element_type 	: "span",
						class_name   	: "label",
						text_content 	: (tstring.simbolo || "Símbolo"),
						parent 			: line
					})								
					self.create_dom_element({
						element_type 	: "div",
						class_name   	: "simbolo_anverso",
						inner_html 		: self.clean_data_string(row_data.tipo_object.simbolo_anverso),
						parent 			: line
					})
				}		
				// ROW_DATA_JSON +
				row_data_json[t.obverse_legend] = row_data.tipo_object.leyenda_anverso || ''
				row_data_json[t.obverse_design] = row_data.tipo_object.tipo_anverso || ''
				row_data_json[t.obverse_symbol] = row_data.tipo_object.simbolo_anverso || ''


			// leyenda_reverso
				if (row_data.tipo_object.leyenda_reverso || row_data.tipo_object.tipo_reverso || row_data.tipo_object.simbolo_reverso) {

					var reverso_detail = self.create_dom_element({
						element_type 	: "div",
						class_name   	: "separator reverso_detail",
						parent 			: right_detail
						})
					var line = self.create_dom_element({element_type : "div", class_name : "line", parent : reverso_detail})
						self.create_dom_element({
							element_type 	: "span",
							class_name   	: "label reverso_label",
							text_content 	: (tstring.reverso || "REVERSO"),
							parent 			: line
						})
						self.create_dom_element({
							element_type 	: "div",
							class_name   	: "leyenda_reverso",
							parent 			: line
						})
				}
			// leyenda_reverso
				if (row_data.tipo_object.leyenda_reverso) {
					var line = self.create_dom_element({element_type : "div", class_name : "line", parent : reverso_detail})
					self.create_dom_element({
						element_type 	: "span",
						class_name   	: "label",
						text_content 	: (tstring.leyenda || "Leyenda"),
						parent 			: line
					})
					var value = self.replace_dedalo_paths(row_data.tipo_object.leyenda_reverso) +'<br>'+ (row_data.tipo_object.leyenda_reverso_transcripcion || '')
					self.create_dom_element({
						element_type 	: "div",
						class_name   	: "leyenda_reverso",
						inner_html	 	: value,
						parent 			: line
					})
				}				
			// tipo_reverso
				if (row_data.tipo_object.tipo_reverso) {
					var line = self.create_dom_element({element_type : "div", class_name : "line", parent : reverso_detail})
					self.create_dom_element({
						element_type 	: "span",
						class_name   	: "label",
						text_content 	: (tstring.diseno || "Diseño"),
						parent 			: line
					})					
					self.create_dom_element({
						element_type 	: "div",
						class_name   	: "diseno_reverso",
						inner_html	 	: row_data.tipo_object.tipo_reverso,
						parent 			: line
					})
				}
			// simbolo_reverso
				if (row_data.tipo_object.simbolo_reverso) {
					var line = self.create_dom_element({element_type : "div", class_name : "line", parent : reverso_detail})
					self.create_dom_element({
						element_type 	: "span",
						class_name   	: "label",
						text_content 	: (tstring.simbolo || "Símbolo"),
						parent 			: line
					})									
					self.create_dom_element({
						element_type 	: "div",
						class_name   	: "simbolo_reverso",
						inner_html	 	: self.clean_data_string(row_data.tipo_object.simbolo_reverso),
						parent 			: line
					})
				}
				// ROW_DATA_JSON +
				row_data_json[t.reverse_legend] = row_data.tipo_object.leyenda_reverso || ''
				row_data_json[t.reverse_design] = row_data.tipo_object.tipo_reverso || ''
				row_data_json[t.reverse_symbol] = row_data.tipo_object.simbolo_reverso || ''

		
		var biblio_detail = self.create_dom_element({
			element_type 	: "div",
			class_name   	: "separator biblio_detail",
			parent 			: right_detail
			})

			// fondo
				if (row_data.fondo) {
					var line = self.create_dom_element({element_type : "div", class_name : "line", parent : biblio_detail})
					self.create_dom_element({
						element_type 	: "span",
						class_name   	: "label",
						text_content 	: tstring.fondo || "fondo",
						parent 			: line
					})
					self.create_dom_element({
						element_type 	: "div",
						class_name   	: "fondo",
						inner_html 		: row_data.fondo,
						parent 			: line
					})
				}
				// ROW_DATA_JSON +
				row_data_json[t.funds] = row_data.fondo || ''

			// bibliografia (referencias bibliográficas)
				var bibliografia_info_full = []
				if (row_data.bibliografia && row_data.bibliografia_ref) {				

					var bibliografia = split(row_data.bibliografia)				
					for (var bi = 0; bi < bibliografia.length; bi++) {
						
						var current = bibliografia[bi]

						var bibliografia_paginas  	= ''
						var bibliografia_ref 		= ''

						if (row_data.bibliografia_ref) {
							bibliografia_ref = split(row_data.bibliografia_ref)
							if (typeof bibliografia_ref[bi]!=="undefined") {
								bibliografia_ref = bibliografia_ref[bi]
							}
						}

						if (row_data.bibliografia_paginas) {
							bibliografia_paginas = split(row_data.bibliografia_paginas)
							if (typeof bibliografia_paginas[bi]!=="undefined") {
								bibliografia_paginas = bibliografia_paginas[bi]
							}
						}
						
						var line = self.create_dom_element({element_type : "div", class_name : "line", parent : biblio_detail})
						self.create_dom_element({
							element_type 	: "span",
							class_name   	: "label",
							text_content 	: tstring.bibliografia || "Bibliografía",
							parent 			: line
						})
						var bibliografia_info_text = current + " Ref: " + bibliografia_ref + " Pag. " + bibliografia_paginas
						bibliografia_info_full.push(bibliografia_info_text)
						self.create_dom_element({
							element_type 	: "div",
							class_name   	: "bibliografia",
							text_content 	: bibliografia_info_text,
							parent 			: line
						})
					}
				}
				// ROW_DATA_JSON +
				row_data_json[t.bibliographic_ref] = bibliografia_info_full.join(", ")

			// Publicaciones
				if (row_data.publicaciones) {					
					row_data.publicaciones.forEach(function(element){
						
						var line = self.create_dom_element({element_type : "div", class_name : "line", parent : biblio_detail})
							self.create_dom_element({
								element_type 	: "span",
								class_name   	: "label",
								text_content 	: tstring.bibliografia || "Bibliografía",
								parent 			: line
							})
							var bibliografia_title = element.autoria +" "+ element.titulo + " " + element.fecha_publicacion

							self.create_dom_element({
								element_type 	: "div",
								class_name   	: "publicaciones",
								text_content 	: bibliografia_title,
								parent 			: line
							})
					})		
				}
				// ROW_DATA_JSON +
				row_data_json[t.bibliography] = typeof bibliografia_title!=="undefined" ? bibliografia_title : ''

			// info publica
				if (row_data.info_publica && row_data.info_publica!=='<br data-mce-bogus="1">') {
					var line = self.create_dom_element({element_type : "div", class_name : "line", parent : biblio_detail})
					self.create_dom_element({
						element_type 	: "span",
						class_name   	: "label",
						text_content 	: tstring.notas || "Notas",
						parent 			: line
					})
					self.create_dom_element({
						element_type 	: "div",
						class_name   	: "notas",
						inner_html 		: row_data.info_publica,
						parent 			: line
					})
				}
				// ROW_DATA_JSON +
				row_data_json[t.info] = row_data.info_publica || ''

			// uri_detail
				var uri_detail = self.create_dom_element({
					element_type 	: "div",
					class_name   	: "separator uri_detail",
					parent 			: right_detail
					})
					
					// TIPO . Title (catalogo, autoridad, numero_catalogo)
					if (row_data.tipo_object.catalogo) {
						var line = self.create_dom_element({element_type : "div", class_name : "line", parent : uri_detail})
						self.create_dom_element({
							element_type 	: "span",
							class_name   	: "label",
							text_content 	: tstring.refeferencia_bibliografica || "Ref bibliografia",
							parent 			: line
						})
						var ar_catalogo_text = []
							ar_catalogo_text.push(row_data.tipo_object.catalogo)
							if (row_data.tipo_object.numero_catalogo) {
								ar_catalogo_text.push(row_data.tipo_object.numero_catalogo)
							}
							if (autoridad_info_string) {
								ar_catalogo_text.push(autoridad_info_string)
							}
							// var ar_additions = []
							// if (row_data.tipo_object.ceca_text) {
							// 	ar_additions.push(row_data.tipo_object.ceca_text)
							// }
							// if (row_data.tipo_object.denominacion) {
							// 	ar_additions.push(row_data.tipo_object.denominacion)
							// }
						var tipo_info = ar_catalogo_text.join(" ") // + " | " + ar_additions.join(" | ")
							tipo_info = self.clean_string(tipo_info)						
						var catalogo = self.create_dom_element({
							element_type 	: "div",
							class_name   	: "tipo show_tooltip",
							inner_html 		: tipo_info,
							parent 			: line
						})
						if (typeof row_data.tipo_object.catalogo_dato[0]!=="undefined" && row_data.tipo_object.catalogo_dato[0].publicacion.length>0) {							
							catalogo.setAttribute("title", self.clean_string(row_data.tipo_object.catalogo_dato[0].publicacion))							
							self.add_tool_tip(catalogo)
						}
						/*
						console.log("row_data.tipo_object.publicacion:",row_data.tipo_object.publicacion);
						if (row_data.tipo_object.publicacion && row_data.tipo_object.publicacion.length>0) {
							var ar_title = []
							row_data.tipo_object.publicacion.forEach(function(element){
								ar_title.push(element)
							})
							if (ar_title.length>0) {
								catalogo.title = ar_title.join(", ") 
								self.add_tool_tip(catalogo)
							}
						}
						*/
					}
					// ROW_DATA_JSON +
					row_data_json[t.catalogue] 		  = row_data.tipo_object.catalogo || ''
					row_data_json[t.catalogue_number] = row_data.tipo_object.numero_catalogo || ''

			// equivalentes
				//console.log("row_data.tipo_object:",row_data.tipo_object);
				//console.log("row_data.tipo_object.equivalentes_catalogo_dato:",row_data.tipo_object.equivalentes_catalogo_dato);

				if (row_data.tipo_object.equivalentes && row_data.tipo_object.equivalentes.length>0) {
					var line = self.create_dom_element({element_type : "div", class_name : "line", parent : uri_detail})
					self.create_dom_element({
						element_type 	: "span",
						class_name   	: "label",
						text_content 	: "", //tstring.equivalentes || "Equivalentes",
						parent 			: line
					})
					const equivalentes_div = self.create_dom_element({
						element_type 	: "div",
						class_name   	: "equivalentes",
						//inner_html  	: row_data.tipo_object.equivalentes,
						parent 			: line
					})

					// equivalentes build list
						const equivalentes_catalogo_dato = row_data.tipo_object.equivalentes_catalogo_dato
						const ar_equivalentes = row_data.tipo_object.equivalentes.split("<br>")
						
						let e = 0; ar_equivalentes.forEach( item => {
							
							const item_parts = item.split(' | ')
								console.log("item_parts:",item_parts,e);

							if (typeof equivalentes_catalogo_dato[e]!=="undefined" && item_parts[0]===equivalentes_catalogo_dato[e].catalogo) {
								//console.log("item ++ :",item, " **** ", equivalentes_catalogo_dato[e].publicacion);

								let ar_beats = item_parts.slice(0, 2)

								let span = self.create_dom_element({
									element_type 	: "div",
									class_name   	: "show_tooltip",
									//text_content 	: self.clean_string(item_parts),
									text_content 	: ar_beats.join(" | "),
									parent 			: equivalentes_div
								})
								if (equivalentes_catalogo_dato[e].publicacion.length>0) {
									span.setAttribute("title", self.clean_string(equivalentes_catalogo_dato[e].publicacion))
									self.add_tool_tip(span)
								}								
							}
							e++;
						})
						//console.log("ar_equivalentes:",ar_equivalentes);
				}
				// ROW_DATA_JSON +
				var equivalentes_value = row_data.tipo_object.equivalentes.replace(/<br>/g,", ")
				row_data_json[t.equivalents] = equivalentes_value

			// URI
				var line = self.create_dom_element({element_type : "div", class_name : "line uri_line", parent : uri_detail})
					self.create_dom_element({
						element_type 	: "span",
						class_name   	: "label",
						text_content 	: tstring.uri || "URI",
						parent 			: line
					})
					let div_uri = self.create_dom_element({
						element_type 	: "div",
						class_name   	: "uri",
						parent 			: line
					})
					var uri = "https://numisdata.org/vidalvalle/mon/" + row_data.section_id
					self.create_dom_element({
						element_type 	: "a",
						text_content 	: uri,
						href 			: uri,
						parent 			: div_uri
					})
					// ROW_DATA_JSON +
					row_data_json[t.uri] = uri || ''


		// Add to export_data_json
			self.to_export_data_json(row_data_json)
			if(SHOW_DEBUG===true) {
				//console.log("row_data_json:",row_data_json);
			}

		// tooltips
			const links = detail_container.querySelectorAll('.show_tooltip')
			self.activate_tooltips(links)


		return detail_container
	},//end build_detail



	/**
	* CLEAN_DATA_STRING
	* remove empty elements in data string from arrays like 'Pedro II | jaime | '
	*/
	clean_data_string : function( data_string, separator=" | " ) {

		var ar_data 		= data_string.split(separator)
		var ar_data_clean 	= []
		ar_data.forEach(function(item) {
		 	if (item.length>0) {
		 		ar_data_clean.push(item)
		 	}
		})

		var result = ar_data_clean.join(separator)

		return result
	},//end clean_data_string



	clean_string : function(text) {

		text = text.trim()

		if (text.slice(-1)==='|') {
			text = text.slice(0, -1);
		}

		return text
	},



	/**
	* EXTRACT_GEO
	*/
	extract_geo : function(row, type) {

		var geo_value = ''

		//console.log("row:",row);
		var ar_place = JSON.parse(row.lugar)
		// console.log("ar_place:",ar_place);
		if (typeof ar_place[0]!=="undefined" && typeof ar_place[0].layer_data[0]!=="undefined" && typeof ar_place[0].layer_data[0][type]!=="undefined") {
			geo_value = ar_place[0].layer_data[0][type]
		}

		return geo_value
	},//end extract_geo



	/**
	* OPEN_DETAIL
	*/
	open_detail : function(button_obj, row_data) {

		const self = this

		var detail_container = self.build_detail(row_data)
		//detail_container.appendChild( button_obj.cloneNode(true) )

		// Build dialog with colorbox
		// see http://www.jacklmoore.com/colorbox/
		// Create before load data for performance perception	
		$.colorbox({
			html: detail_container,
			transition : "none",
			speed : 300
		});

		//setTimeout(function(){
		//	$.colorbox.resize()
		//	console.log("detail_container:",detail_container);
		//},3000)
		
		return true
	},//end open_detail



	/**
	* BUILD_THUMB_URL
	*/
	build_thumb_url : function(image_path, width, height) {

		if (!image_path || image_path.length<1) {
			return false
		}

		var bg_image  = image_path

		const w = width  || 380
		const h = height || 360
			
		const file_name = '/image/' + bg_image.split('/image/').pop();		

		bg_image = bg_image.replace('/media_test/media_numisdata_valencia/dedalo/','/')
		bg_image = bg_image.replace('/media/dedalo/','/')
		bg_image = "https://vidalvalle.numisdata.org/dedalo/lib/dedalo/media_engine/img.php?m=free&w="+w+"&h="+h+"&SID=" + file_name
		//bg_image = "//vidalvalle.numisdata.org/dedalo/lib/dedalo/media_engine/img.php?m=free&SID=" + file_name
		
		return bg_image
	},//end build_thumb_url



	/**
	* BUILD_QUALITY_IMAGE_URL
	*/
	build_quality_image_url : function(image_path, quality, width, height) {

		if (!image_path || image_path.length<1) {
			return false
		}

		var bg_image = image_path
		
			bg_image = bg_image.replace('/media_test/media_numisdata_valencia/','/media/')
			bg_image = bg_image.replace('/dedalo/media/','/media/')

		// Replace default quality for original file
		if (quality!=="1.5MB") {
			bg_image = bg_image.replace('/1.5MB/','/'+quality+'/')
		}		

		var file_name = bg_image
	
		//bg_image = "//vidalvalle.numisdata.org" + file_name
		bg_image = "https://numisdata.org/vidalvalle" + file_name

		return bg_image
	},//end build_quality_image_url



	/**
	* REPLACE_DEDALO_PATHS
	* User for leyends svg paths
	*/
	replace_dedalo_paths : function(html) {

		html = html.replace(/\/dedalo\/media\//g, 'https://vidalvalle.numisdata.org/dedalo/media/')
		
		return html
	},//end replace_dedalo_paths



	/**
	* CREATE_DOM_ELEMENT
	* Builds single dom element
	*/
	create_dom_element : function(element_options) {

		var element_type			= element_options.element_type
		var parent					= element_options.parent
		var class_name				= element_options.class_name
		var style					= element_options.style
		var data_set				= element_options.data_set
			if (typeof data_set==="undefined" && typeof element_options.dataset!=="undefined") data_set = element_options.dataset
		var custom_function_events	= element_options.custom_function_events
		var title_label				= element_options.title_label
		var text_node				= element_options.text_node
		var text_content			= element_options.text_content
		var inner_html				= element_options.inner_html
		var href					= element_options.href
		var id 						= element_options.id
		var draggable				= element_options.draggable
		var value					= element_options.value
		var download				= element_options.download
		
		var element = document.createElement(element_type);
	
		// Add id property to element
		if(id){
			element.id = id;
		}

		// A element. Add href property to element
		if(element_type === 'a'){

			if(href){
				element.href =href;
			}else{
				element.href = 'javascript:;';
			}
		
		}
		
		// Class name. Add css classes property to element
		if(class_name){
			element.className = class_name
		}

		// Style. Add css style property to element
		if(style){
			for(key in style) {
				element.style[key] = style[key]
				//element.setAttribute("style", key +":"+ style[key]+";");
			}		
		}

		// Title . Add title attribute to element
		if(title_label){
			element.title = title_label
		}
	
		// Dataset Add dataset values to element		
		if(data_set){
			for (var key in data_set) {
				element.dataset[key] = data_set[key]
			}
		}

		// Value
		if(value){
			element.value = value
		}

		// Click event attached to element
		if(custom_function_events){
			const len = custom_function_events.length
			for (var i = 0; i < len; i++) {
				var function_name 		= custom_function_events[i].name
				var event_type			= custom_function_events[i].type
				var function_arguments	= custom_function_events[i].function_arguments					

				// Create event caller
				this.create_custom_events(element, event_type, function_name, function_arguments)
			}
		}//end if(custom_function_events){
		
		// Text content 
		if(text_node){
			//element.appendChild(document.createTextNode(TextNode));
			// Parse html text as object
			if (element_type==='span') {
				element.textContent = text_node
			}else{
				var el = document.createElement('span')
					el.innerHTML = " "+text_node // Note that prepend a space to span for avoid Chrome bug on selection
				element.appendChild(el)
			}			
		}else if(text_content) {
			element.textContent = text_content
		}else if(inner_html) {
			element.innerHTML = inner_html
		}


		// Append created element to parent
		if (parent) {
			parent.appendChild(element)
		}

		// Dragable
		if(draggable){
			element.draggable = draggable;
		}

		if (download) {
			element.setAttribute("download", download)
		}

		return element;
	},//end create_dom_element



	/**
	* REMOVE_STRING_DOUBLE_VALUES
	*/
	remove_string_double_values : function(value, separator) {

		if (value===null) {
			return null;
		}

		// Split string as array
		var ar_elements = value.split(separator)
		var ar_unique 	= []

		ar_elements.forEach(function(element) {			
			if (ar_unique.indexOf(element)===-1) {
				ar_unique.push(element)
			}
		})

		var final_string = ar_unique.join(separator)

		return final_string;
	},//end remove_string_double_values



	/**
	* TOGGLE_MONEDAS
	*/
	toggle_monedas : function() {

		$(".monedas_wrapper").toggle()

		return true
	},



	/**
	* TOGGLE_TIPOS
	*/
	toggle_tipos : function() {

		$(".tipo_header_wrapper, .tipo_add_info").toggle()

		return true
	},



	/**
	* LOAD_SNIPPET
	* Loads by httprequest a fragment of code (phtml)
	*/
	load_snippet : function(snippet_name, target_id) {

		const self = this

		var trigger_url  = page_globals.__WEB_TEMPLATE_WEB__ + "/common/trigger.common.php"
		var trigger_vars = {
			mode 	 	 : "load_snippet",
			snippet_name : snippet_name
		}
		

		// Http request directly in javascript to the API is possible too..
		var js_promise = common.get_json_data(trigger_url, trigger_vars).then(function(response){
				if(SHOW_DEBUG===true) {
					console.log("[common.load_snippet] response:" , response);
				}
				
				if (!response) {
					// Error on load data from trigger
					console.warn("[common.load_snippet] Error. Received response data is null");				
				}
	
				if (target_id) {
					var target_obj = document.getElementById(target_id)	
					if (target_obj) {
						target_obj.innerHTML = response.result
					}
				}			

				return response
		})

		return js_promise
	},//end load_snippet



	/**
	* BUILD_DOWNLOAD_DATA_LINK
	* 
	*/
	build_download_data_link : function(options) {

		const self = this

		// Options vars
		var obj_to_save = options.obj_to_save
		var data_type 	= options.data_type || 'json'
		var file_name 	= options.file_name || 'download_file'

		//var a = CircularJSON.stringify(obj_to_save, null, 2)
		//	console.log("a:",a);
		//return false

		// Label
		var label = file_name
		
		// Mime
		var mime_type = ''
		var data 	  = {}
		switch(data_type) {
			case 'csv':
				mime_type = 'text/csv'
				// Convert json obj to csv
				var csv = self.convert_json_to_csv(obj_to_save)
				// Blob data
				data = new Blob([csv], {
				    type: mime_type,
				    name: 'file.csv'
				});
				break;
			case 'json':	
			default:
				mime_type = 'application/json'
				// Blob data
				data = new Blob([JSON.stringify(obj_to_save, null, 2)], {
				    type: mime_type,
				    name: 'file.json'
				});
				break;
		}		
		
		// Build href from data
		var href = URL.createObjectURL(data)

		// link_obj
		var link_obj = self.create_dom_element({
			element_type : "a",
			class_name   : "download_data_link " + data_type + " button icon fa-download",
			href 		 : href,
			download 	 : file_name
		})

		// Icon
			// self.create_dom_element({
			// 	element_type : "i",
			// 	class_name   : "fa fas fa-download",
			// 	parent 		 : link_obj
			// })

		// Label
		self.create_dom_element({
			element_type : "span",
			text_node    : data_type,
			parent 		 : link_obj
		})

		// Beta
		// self.create_dom_element({
		// 	element_type : "i",
		// 	class_name   : "beta",
		// 	text_node    : "(beta)",
		// 	parent 		 : link_obj
		// })


		return link_obj
	},//end build_download_data_link



	/**
	* CONVERT_JSON_TO_CSV
	*/
	convert_json_to_csv : function(json_obj) {
		//console.log("json_obj:",JSON.stringify(json_obj)); return

		var json = json_obj
		if(Array.isArray(json)===false) {
			json = [json]
		}

		if (json.length===0) {
			return false
		}

		var csv_separator = ';'

		var fields 	 = Object.keys(json[0])
		var replacer = function(key, value) { return value === null ? '' : value } 
		var csv = json.map(function(row){
		  return fields.map(function(fieldName){
		  		
		  		var current_value = row[fieldName]	
		  		var valor 		  = JSON.stringify(current_value, replacer)		  		

		  		/*
					// Unify format. Remove quotes added ad begining and end by stringify
					valor = valor.replace(/(^\"|\"$)/g, '')
			  		
					// Replace json objects already stringified like \"value to "value
					valor = valor.replace(/(\\\")/g, '\"')

					// Clean json stringified vars
					//valor = valor.replace(/(\"\[)/g, '\[')
					//valor = valor.replace(/(\]\")/g, '\]')
					//valor = valor.replace(/(\"{)/g, '{')
					//valor = valor.replace(/(}\")/g, '}')					

					// Escape internal quotes (csv escape with double quotes like "" for ")
					valor = valor.replace(/(\")/g, '\"\"')

					// Add quotes to result in all values
					valor = '"' + valor + '"'
				*/
		   		//console.log("valor ["+fieldName+"]:",valor);
		    	return valor
		  }).join(csv_separator)
		})

		// add header column
		csv.unshift(fields.join(csv_separator))

		// Create rows separated by \r\n
		csv = csv.join('\r\n')

		if(SHOW_DEBUG===true) {
			// console.log(csv)
		}
		
		
		return csv
	},//end convert_json_to_csv



	/**
	* TO_EXPORT_DATA_JSON
	*/
	to_export_data_json : function(row_object) {
	
		const self = this

		var export_obj = {
			// Add common vars
			data_source_org : "Numisdata Vidal Valle",
			data_source_url : "https://numisdata.org/vidalvalle/",
			data_lang 	 	: page_globals.WEB_CURRENT_LANG_CODE,
		}

		// Add row_object vars later (order is important for csv)
		for(var key in row_object) {

			var value = row_object[key]

			// Special cases comma separated values
			//if (key==="Material links" || key==="Equivalents") {
			//	value = value.split(", ")
			//}

			export_obj[key] = value
		}		
		
		if(SHOW_DEBUG===true) {
			//console.log("export_obj:",export_obj);;
		}

		self.export_data_json.push(export_obj)

		return true
	},// end to_export_data_json



	/**
	* ADD_TOOL_TIP
	* @return bool
	*/
	add_tool_tip : function(item) {
		
		// $(item).tooltip()

		return true
	},//end add_tool_tip



	/**
	* BUILD_PAGINATOR_HTML
	* Builds html of paginator from page_nodes
	*/
	build_paginator_html : function(page_nodes_data, container, goto_url) {

		const self = this

		// wrapper ul
			const wrapper_ul  = container
				  wrapper_ul.dataset.total = page_nodes_data.total

		// iterate nodes
			const ar_nodes 		  = page_nodes_data.ar_nodes
			const ar_nodes_length = ar_nodes.length
			for (let i = 0; i < ar_nodes_length; i++) {
				
				const node 		= ar_nodes[i]
				let label 		= node.label
				let class_name 	= "page " + node.type + " " + node.id
				if (node.active===false) {
					class_name += " unactive"
				}

				// label blank cases 
					if (node.id==="previous" || node.id==="next" || node.id==="last" || node.id==="first" ) {
						label = ""
					}

				// switch node.type 
					//switch(node.type){
					//	case "navigator":
					//		class_name = node.type + ""
					//		break;
					//	case "page":
					//		class_name = node.type + ""
					//		break;
					//}

				// selected 
					if (node.selected===true) {
						class_name += " selected"
					}

				// create_dom_element based on node type 
					if (node.type==="extra") {
						// extra (span)
							class_name = node.type

							const span = common.create_dom_element({
								element_type 	: "span",
								class_name 		: class_name,
								text_content 	: label,
								parent 			: wrapper_ul
							})
					}else{
						// normal (link)
							const a = common.create_dom_element({
								element_type 	: "a",
								class_name 		: class_name,
								text_content 	: label,
								dataset 		: {
									offset : node.offset_value,
									active : node.active
								},
								parent 			: wrapper_ul
							})

							// link 
								if (node.active===true) {
									/*
									const params = {
											offset 	: node.offset_value,
											total 	: page_nodes_data.total
										}	
									
									const method = typeof goto_url!=="undefined" ? goto_url : "paginator.goto_url"
									a.addEventListener("click",function(e){
										
										// exec function custom
											const js_promise = new Promise(function(resolve) {
												
												let response
												if (typeof method==="function") {
													response = method(params)
												}else{
													response = common.execute_function_by_name(method, window, params)
												}
												
												resolve(response)																	
											});

											js_promise.then(function(response){
												// console.log("response typeof:",typeof response, "- response instanceof:",response instanceof Promise);
											})

									},false) */
								}
					}
			}//end for loop


		// event delegation
			wrapper_ul.addEventListener('click', self.paginator_click_event);
		

		return wrapper_ul
	},//end build_paginator_html



	/**
	* PAGINATOR_CLICK_EVENT
	* Add and manages click events of paginator links (event is delegated on wrap)
	*/
	paginator_click_event : function(e) {

		const element = e.target
		const active  = element.dataset.active

		if (active!=="true") {
			return false;
		}

		const total 	= element.parentNode.dataset.total 
		const offset 	= element.dataset.offset
		

		const search_form = document.getElementById("search_form")
		const js_promise  = catalogo.search(search_form, null, offset, total)


		// const options 	= {
		// 	offset 	: offset,
		// 	total 	: total
		// }
		//const js_promise = catalogo.search_rows(options)


		js_promise.then(function(response){

			// scroll window to top	of 	catalogo_rows_list	
				const catalogo_rows_list = document.querySelector(".result")
				catalogo_rows_list.scrollIntoView({behavior: "smooth", block: "start", inline: "start"})

		})

		//alert("paginator_click_event 1");
		//console.log("paginator_click_event e:", offset, total);

		return js_promise
	},//end paginator_click_event



	/**
	* ACTIVATE_TOOLTIPS
	*/
	activate_tooltips : function( elements ) {

		if(SHOW_DEBUG===true) {
			//console.log("elements:",elements);
		}

		$(elements).each(function() {
			new Tooltip($(this), {
	    		placement: 'top',
	    	});
		});		
	},



}//end tpl_common



tpl_common.setup();



function split( val ) {
  return val.split( /,\s*/ );
}
function extractLast( term ) {
  return split( term ).pop();
}


