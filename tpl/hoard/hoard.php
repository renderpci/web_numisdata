<?php

// hoard

	// css
		// page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.css';
		array_unshift(page::$css_ar_url,
			__WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/leaflet.css',
			__WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/markercluster/MarkerCluster.css',
			__WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/fullscreen/leaflet.fullscreen.css',
			__WEB_TEMPLATE_WEB__ . '/catalog/css/catalog.css',
			__WEB_TEMPLATE_WEB__ . '/map/css/map.css',
		);


	// js
		// page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.js';
		// page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/js/paginator'.JS_SUFFIX.'.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/leaflet.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/markercluster/leaflet.markercluster.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/fullscreen/Leaflet.fullscreen.min.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/map/js/map'.JS_SUFFIX.'.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/catalog/js/catalog_row_fields'.JS_SUFFIX.'.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/type/js/type_row_fields'.JS_SUFFIX.'.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/hoards/js/hoards'.JS_SUFFIX.'.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/' . $cwd . '/js/render_hoard'.JS_SUFFIX.'.js';


	// page basic vars
		$title		= $this->get_element_from_template_map('title', $template_map->{$mode});
		$abstract	= $this->get_element_from_template_map('abstract', $template_map->{$mode});
		$body		= $this->get_element_from_template_map('body', $template_map->{$mode});
		$ar_image	= $this->get_element_from_template_map('image', $template_map->{$mode});


	// area name
		$area_name	= $_GET['area_name'];
		$ar_parts	= explode('/', $area_name);

		$table = $ar_parts[0]==='findspot'
			? 'findspots'
			: 'hoards';

	// section_id (is inside get var 'area_name' as '/min/36')
		$section_id = isset($ar_parts[1]) ? (int)$ar_parts[1] : null;

