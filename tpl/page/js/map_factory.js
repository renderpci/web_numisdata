/*global tstring, page_globals, SHOW_DEBUG, row_fields, common, page*/
/*eslint no-undef: "error"*/

"use strict";



function map_factory() {

	// vars
		// target. DOM element where map is placed
			this.target	= null
		
		// data. Database parsed rows data to create the map
			this.data = null

		// source_maps
			this.source_maps = {}

		// popup_builder
			this.popup_builder = null

		// default map vars set
			this.map				= null
			this.layer_control		= false
			this.loaded_document	= false
			this.icon_main			= null
			this.icon_finds			= null
			this.icon_uncertain		= null
			this.popupOptions		= null
			this.current_layer		= null
			this.current_group		= null
			this.option_selected	= null				

		// self.initied
			this.initied = false

		// initial_map_data. Default fallback positions
			this.initial_map_data	= {
				lat		: 40.65993615913156,
				lon		: -3.2304345278385687,
				zoom	: 6, // (6 for dare, 8 for osm)
				alt		: 0
			}

		// source_maps. Default fallback
			this.source_maps = [
				{
					name	: "osm",
					url		: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
					default	: true
				},
				{
					name	: "arcgis",
					url		: '//server.arcgisonline.com/ArcGIS/' + 'rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
				}
			]



	/**
	* INIT
	*/
	this.init = function(options) {

		const self = this

		// fix vars
			// target. DOM element where map is placed
			self.target = options.target
			// data. Preparsed data from rows. Contains items with properties 'lat', 'lon', and 'data' like [{lat: lat, lon: lon, data: []}]
			// self.data = options.data
			// map_position
			self.map_position = options.map_position
			// source_maps
			self.source_maps = options.source_maps || self.source_maps
			// popup_builder. Use custom options popup_builder function or fallback to default
			self.popup_builder = options.popup_builder || self.build_popup_content
			

		// reset map if already exists instance
			if (self.map) {
				self.map.off(); // clear All Event Listeners
				self.map.remove();	// remove map
			}	
		
		// map position	
			const map_position = self.map_position || self.initial_map_data

			const map_x 	= parseFloat(map_position.lat)
			const map_y 	= parseFloat(map_position.lon)
			const map_zoom 	= parseInt(map_position.zoom)
			const map_alt 	= parseInt(map_position.alt)
	
		// map_container
			const map_container	= self.target


		// reset map vars
			self.map				= null
			self.layer_control		= false
			self.loaded_document	= false
			self.icon_main			= null
			self.icon_finds			= null
			self.icon_uncertain		= null
			self.popupOptions		= null
			self.current_layer		= null
			self.current_group		= null
			self.option_selected	= null
				
		// layer. Add layer to map 
			let default_layer	= null
			const base_maps		= {} // layer selector
			for (let i = 0; i < self.source_maps.length; i++) {		

				const source_map	= self.source_maps[i]
				const layer			= new L.TileLayer(source_map.url, source_map.options)
				
				base_maps[source_map.name] = layer

				if (i===0 || source_map.default===true) {
					default_layer = layer
				}
			}
			
		// map
			self.map = new L.map(map_container, {layers: [default_layer], center: new L.LatLng(map_x, map_y), zoom: map_zoom});

		// layer selector			
			self.layer_control = L.control.layers(base_maps).addTo(self.map);
		
		// disable zoom handlers
			self.map.scrollWheelZoom.disable();

		// icons 
			self.icon_main = L.icon({
				// iconUrl: 	  page_globals.__WEB_TEMPLATE_WEB__ + "/assets/lib/leaflet/images/marker-icon.png",
				iconUrl: 	  page_globals.__WEB_TEMPLATE_WEB__ + "/assets/lib/leaflet/images/naranja.png",
				shadowUrl: 	  page_globals.__WEB_TEMPLATE_WEB__ + "/assets/lib/leaflet/images/marker-shadow.png",
				iconSize:     [47, 43], // size of the icon
				shadowSize:   [41, 41], // size of the shadow
				iconAnchor:   [10, 19], // point of the icon which will correspond to marker's location
				shadowAnchor: [0, 20],  // the same for the shadow
				popupAnchor:  [12, -20] // point from which the popup should open relative to the iconAnchor
			});

			self.icon_green = L.icon({
				//iconUrl: 	  page_globals.__WEB_TEMPLATE_WEB__ + "/assets/lib/leaflet/images/marker-icon.png",
				iconUrl: 	  page_globals.__WEB_TEMPLATE_WEB__ + "/assets/lib/leaflet/images/verde.png",
				shadowUrl: 	  page_globals.__WEB_TEMPLATE_WEB__ + "/assets/lib/leaflet/images/marker-shadow.png",
				iconSize:     [47, 43], // size of the icon
				shadowSize:   [41, 41], // size of the shadow
				iconAnchor:   [10, 19], // point of the icon which will correspond to marker's location
				shadowAnchor: [0, 20],  // the same for the shadow
				popupAnchor:  [12, -20] // point from which the popup should open relative to the iconAnchor
			});		

		// popupOptions
			self.popupOptions =	{
				maxWidth	: '758',
				closeButton	: true
			}

		self.initied = true


		return true
	}//end init



	/**
	* RENDER
	*/
	this.render = function(options) {
		
		const self = this

		const map_data = options.map_data

		// draw map
			self.parse_data_to_map(map_data)

		return true
	}//end render




	/**
	* PARSE_DATA_TO_MAP
	*/
	this.parse_data_to_map = function(data, caller_mode) {

		const self = this

		// reset. Reset all map layers
			if (self.current_group) {
				// Reset points
				self.current_group.clearLayers();
			}		
	
		// no data check cases
			if (!data || data.length<1) {
				// self.reset_map()
				return false
			}

		// Group data elements by place
		const group_data		= self.group_by_place(data)
		const group_data_length	= group_data.length

		const ar_markers = []
		for (let i = group_data_length - 1; i >= 0; i--) {

			const element = group_data[i]

			// des
				// var ar_places = JSON.parse(element.lugar)
				// // Iterate all
				// var ar_places_length = ar_places.length
				// for (var j = 0; j < ar_places_length; j++) {

				// 	var current_place = ar_places[j]
				// 	current_place.layer_data.forEach(function(layer_data) {
				// 		//console.log(layer_data);
				// 		//console.log("element.uncertain:",element.uncertain,layer_data);
				// 		if (layer_data!=="undefined" && layer_data.type==="Point") {

				// 			var lat	= layer_data.lat
				// 			var lon	= layer_data.lon
				// 			var current_tipo_section_id = element.tipo_section_id

				// 			var popup_content = self.build_popup_content(element);
		
				// 			if(caller_mode==="load_hallazgos" || caller_mode==="load_culturas" || caller_mode==="load_epocas"){
				// 				var marker_icon = self.icon_finds // green
				// 			}else{
				// 				var marker_icon = self.icon_main // Default
				// 			}
				
				// 			// Marker set popup and click event
				// 			var marker = L.marker([lat, lon], {icon: marker_icon}).bindPopup(popup_content)						
				// 				marker.on('click', function(e) {
				// 					self.show_tipos({
				// 						tipo_section_id : current_tipo_section_id,
				// 						order 			: null,
				// 						caller_mode 	: caller_mode
				// 					})
				// 				})
				// 			ar_markers.push(marker)
				// 		}
				// 	});//end current_place.layer_data.forEach(function(layer_data)
				// }

			const popup_content	= self.popup_builder(element)

			const marker_hoard = element.group.filter(item => item.type === 'hoard')
			// const marker_find = element.group.filter(item => item.type === 'findspot')
		
			const marker_icon	= marker_hoard.length > 0
				? self.icon_main
				: self.icon_green
			
			// marker. Set popup and click event
			const marker = L.marker([element.lat, element.lon], {icon: marker_icon}).bindPopup(popup_content)						
				  marker.on('click', function(e) {
					// event publish map_selected_marker
					event_manager.publish('map_selected_marker', {
						item	: element,
						event	: e
					})			
				})						
			ar_markers.push(marker)
		}
		//console.log("ar_markers:",ar_markers);	
		
		// group . Create a layer group and add to map
			self.current_group = L.layerGroup(ar_markers)
			self.current_group.addTo(self.map)

		// feature_group . Fit points positions on map and adjust the zoom
			if (ar_markers && ar_markers.length>0) {
				const feature_group = new L.featureGroup(ar_markers)
				if (feature_group) {
					self.map.fitBounds(feature_group.getBounds())
				}
			}	
		
	
		return true
	}//end parse_data_to_map



	/**
	* GROUP_BY_PLACE
	* Group results rows by property 'lugar' (place)
	*/	
	this.group_by_place = function(data) {
	
		const group_data = []

		const data_length = data.length
		for (let i = 0; i < data_length; i++) {
			
			const item				= data[i]
			const group_data_item	= group_data.find(el => el.lat===item.lat && el.lon===item.lon)
			
			if (group_data_item) {
				group_data_item.group.push(item.data)
			}else{
				const new_item = {
					lat		: item.lat,
					lon		: item.lon,
					group	: [item.data],
				}
				group_data.push(new_item)
			}
		}
			console.log("group_data:",group_data);

		return group_data
		// const ar_data = []

		// const elements_len = data.length
		// for (let i = elements_len - 1; i >= 0; i--) {

		// 	const element			= data[i]
		// 	const lugar				= element.lugar
		// 	const nombre			= element.nombre
		// 	const tipo_section_id	= element.tipo_section_id
	
		// 	delete element.nombre // Remove unused property

		// 	const group_obj = {
		// 			nombre 			: nombre,
		// 			tipo_section_id : tipo_section_id
		// 		}

		// 	const ar_filter = ar_data.filter(current_element => current_element.lugar === lugar);
		// 	if (ar_filter.length>0) {
				
		// 		// Add to group
		// 		ar_filter[0].group.push(group_obj)
		// 		// Merge same lugar tipo_section_id
		// 		ar_filter[0].tipo_section_id = ar_filter[0].tipo_section_id.concat(tipo_section_id)
			
		// 	}else{

		// 		element.group = []
		// 		element.group.push(group_obj)

		// 		ar_data.push(element)
		// 	}
		// }


		// return ar_data
	}//end group_by_place



	/**
	* BUILD_POPUP_CONTENT
	* Send calback option to overwrite current function
	*/
	this.build_popup_content = function(data) {

		console.log("(!) Using default build_popup_content function:", data);
		
		const self = this

		const ar_group = data.group

		const popup_wrapper = common.create_dom_element({
			element_type	: "div",
			class_name		: "popup_wrapper",
			inner_html		:  ar_group[0].name + " " + ar_group[0].total_items + "(" + ar_group[0].items + ")"
		})
		return popup_wrapper

		// const ar_group = data.group

		// // order ar_group
		// 	const collator = new Intl.Collator('es',{ sensitivity: 'base', ignorePunctuation:true});
		// 	ar_group.sort( (a,b) => {return collator.compare(a.nombre , b.nombre)});

		// const ar_group_length = ar_group.length
		// for (let i = 0; i < ar_group_length; i++) {
			
		// 	var nombre = ar_group[i].nombre
		// 		nombre = nombre.replace(',', ', ') // Add space between names separated with comma

		// 	var tipo_section_id = ar_group[i].tipo_section_id

		// 	var current_element_type = "a"
			
		// 	var title = common.create_dom_element({
		// 		element_type 	: current_element_type,
		// 		parent 			: popup_wrapper,
		// 		inner_html 		: nombre,
		// 		data_set 		: {
		// 			tipo_section_id : JSON.stringify(tipo_section_id),
		// 			nombre 			: nombre
		// 		}
		// 	})
		// 	title.addEventListener("click",function(e){				
		// 		var tipos = JSON.parse(e.target.dataset.tipo_section_id)
		// 		self.show_tipos({
		// 			tipo_section_id : tipos,
		// 			caller_mode 	: data.caller_mode
		// 		})
		// 	})
		// }
		

		// // Ceca label
		// if (data.type_label) {
		// 	var type = common.create_dom_element({
		// 		element_type 	: "div",
		// 		parent 			: popup_wrapper,
		// 		text_content 	: data.type_label
		// 	})
		// }		

		// return popup_wrapper
	}//end build_popup_content



	/**
	* RESET_MAP
	*/
	this.reset_map = function() {

		const self = this

		const map_data = self.initial_map_data
		
		//self.map.panTo(new L.LatLng(map_data.x, map_data.y))
		//self.map.setZoom(map_data.zoom)

		self.map.setView(new L.LatLng(map_data.lat, map_data.lon), map_data.zoom);

		return true
	}//end reset_map



}//end map_factory


