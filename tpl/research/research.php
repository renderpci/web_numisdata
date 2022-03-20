<?php

// mon

	// css
		page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/highlight/styles/default.css';
		page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.css';
		// page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/vertical-timeline-master/assets/css/style.css';

		page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/research/ui/swagger-ui.css';
		page::$css_ar_url[] = 'https://fonts.googleapis.com/css?family=Open+Sans:400,700|Source+Code+Pro:300,600|Titillium+Web:400,600,700&display=swap';



	// js
		#page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.js';
		#page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/catalogo/js/catalogo'.JS_SUFFIX.'.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/research/ui/swagger-ui-bundle.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/research/ui/swagger-ui-standalone-preset.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/highlight/highlight.pack.js';



	// page basic vars
		$title 			= $this->get_element_from_template_map('title', $template_map->{$mode});
		$abstract  		= $this->get_element_from_template_map('abstract', $template_map->{$mode});
		$body  			= $this->get_element_from_template_map('body', $template_map->{$mode});
		$ar_image  		= $this->get_element_from_template_map('image', $template_map->{$mode});


	// body images fix url paths
		$body = str_replace('../../../media', __WEB_BASE_URL__ . '/dedalo/media', $body);

			// dump($ar_image, ' ar_image ++ '.to_string());
			// dump($this->row, ' this->row ++ '.to_string());
			// dump($this, ' this ++ '.to_string());
			// dump($template_map, ' template_map ++ '.to_string());

			// dump($_SERVER['HTTP_HOST'], '$_SERVER[HTTP_HOST] ++ '.to_string());

	$check_https = function() {
		if ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || $_SERVER['SERVER_PORT'] == 443) {
			return true;
		}
		return false;
	};
	$protocol  = true===$check_https() ? 'https' : 'http';

	// full url of json file to load (used to validate the json file from swagger site)
		$source_file_url = $protocol .'://'. $_SERVER['HTTP_HOST'] . __WEB_TEMPLATE_WEB__ . '/research/ui/json/json.php';
		// $source_file_url = __WEB_TEMPLATE_WEB__ . '/research/ui/json/json.php';