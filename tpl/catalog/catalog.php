<?php

// bibio

	// css
		page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.css';
		

	// js
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.js';
		// page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/js/paginator'.JS_SUFFIX.'.js';
		// page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/js/forms'.JS_SUFFIX.'.js';
		// page::$js_ar_url[] = __WEB_ROOT_WEB__  . '/' . WEB_APP_DIR . '/factory/form_factory'.JS_SUFFIX.'.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/' . $cwd . '/js/catalog_row_fields.js';

		$global_search = "";
		$item_type = "";
		$label = "";
		$value = "";

		if (isset($_GET['item_type'])){
				$item_type = $_GET['item_type'];
				$label = $_GET['label'];
				$value = $_GET['value'];
		} else {
	
		// area name
			$area_name 	= $_GET['area_name'];
			$ar_parts 	= explode('/', $area_name);

				//dump($_GET, ' $_GET ++ '.to_string());
				// dump($ar_parts, ' ar_parts ++ '.to_string());
				
		// global_search (is inside get var 'area_name' as '/min/36')
			$global_search = !empty($ar_parts[1]) ? $ar_parts[1] : null;
			// dump($global_search);
		}

	// page basic vars
		$title 			= $this->get_element_from_template_map('title', $template_map->{$mode});
		$abstract  		= $this->get_element_from_template_map('abstract', $template_map->{$mode});
		$body  			= $this->get_element_from_template_map('body', $template_map->{$mode});
		$ar_image  		= $this->get_element_from_template_map('image', $template_map->{$mode});	

	// page_title fix
		$this->page_title = $this->row->term;