<?php

// catalog

	// css
		// page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.css';


	// js
		// page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.js';
		// page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/js/paginator'.JS_SUFFIX.'.js';
		// page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/js/forms'.JS_SUFFIX.'.js';
		// page::$js_ar_url[] = __WEB_ROOT_WEB__  . '/' . WEB_APP_DIR . '/factory/form_factory'.JS_SUFFIX.'.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/' . $cwd . '/js/catalog_row_fields'.JS_SUFFIX.'.js';


	// psqo
		$psqo = $_GET['psqo'] ?? '';


	// area name
		$area_name 	= $_GET['area_name'];
		$ar_parts 	= explode('/', $area_name);


	// global_search (is inside get var 'area_name' as '/min/36')
		// $global_search = !empty($ar_parts[1]) ? $ar_parts[1] : null;
		// dump($global_search);


	// page basic vars
		$title 			= $this->get_element_from_template_map('title', $template_map->{$mode});
		$abstract  		= $this->get_element_from_template_map('abstract', $template_map->{$mode});
		$body  			= $this->get_element_from_template_map('body', $template_map->{$mode});
		$ar_image  		= $this->get_element_from_template_map('image', $template_map->{$mode});

	// page_title fix
		$this->page_title = $this->row->term;
