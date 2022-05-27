<?php

// generic

	// css
		// page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.css';

	// js
		// page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.js';
		// page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/catalogo/js/catalogo'.JS_SUFFIX.'.js';

	// area name
		$area_name	= $_GET['area_name'];
		$ar_parts	= explode('/', $area_name);

	// page basic vars
		$title		= $this->get_element_from_template_map('title', $template_map->{$mode});
		$abstract	= $this->get_element_from_template_map('abstract', $template_map->{$mode});
		$body		= $this->get_element_from_template_map('body', $template_map->{$mode});
		$ar_image	= $this->get_element_from_template_map('image', $template_map->{$mode});

	// body images fix url paths
		$body = str_replace('../../../media', __WEB_BASE_URL__ . '/dedalo/media', $body);
