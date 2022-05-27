<?php

// map

	// css
		// page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.css';
		// Prepend this style to the beginning of 'page::$css_ar_url' array to decrease its prevalence
		// page::$css_ar_url[]  = __WEB_TEMPLATE_WEB__ . '/catalog/css/catalog.css';
		array_unshift(page::$css_ar_url,
			__WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/leaflet.css',
			__WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/markercluster/MarkerCluster.css',
			__WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/fullscreen/leaflet.fullscreen.css',
			__WEB_TEMPLATE_WEB__ . '/catalog/css/catalog.css'
			// __WEB_TEMPLATE_WEB__ . '/mint/css/mint.css'
		);

	// js
		// page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.js';
		// page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/js/paginator'.JS_SUFFIX.'.js';
		// page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/leaflet.js';
		// page::$js_ar_url[]	= __WEB_TEMPLATE_WEB__ . '/' . $cwd . '/js/coins_row'.JS_SUFFIX.'.js';
		page::$js_ar_url[]	= __WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/leaflet.js';
		page::$js_ar_url[]	= __WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/markercluster/leaflet.markercluster.js';
		// page::$js_ar_url[]  = __WEB_TEMPLATE_WEB__ . '/catalog/js/catalog.js';
		page::$js_ar_url[]  = __WEB_TEMPLATE_WEB__ . '/catalog/js/catalog_row_fields'.JS_SUFFIX.'.js';
		page::$js_ar_url[]  = __WEB_TEMPLATE_WEB__ . '/type/js/type_row_fields'.JS_SUFFIX.'.js';
		// page::$js_ar_url[]  = __WEB_TEMPLATE_WEB__ . '/mint/js/mint.js';


	// page basic vars
		$title 			= $this->get_element_from_template_map('title', $template_map->{$mode});
		$abstract  		= $this->get_element_from_template_map('abstract', $template_map->{$mode});
		$body  			= $this->get_element_from_template_map('body', $template_map->{$mode});
		$ar_image  		= $this->get_element_from_template_map('image', $template_map->{$mode});


	// page_title fix
		$this->page_title = $this->row->term;