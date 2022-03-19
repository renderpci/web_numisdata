<?php

// users

	// css
		// page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/highlight/styles/default.css';
		// page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.css';
		// page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/vertical-timeline-master/assets/css/style.css';
		// page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/research/ui/swagger-ui.css';
		// page::$css_ar_url[] = 'https://fonts.googleapis.com/css?family=Open+Sans:400,700|Source+Code+Pro:300,600|Titillium+Web:400,600,700';
		// page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/nvd3/nv.d3.min.css';


	// js
		#page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.js';
		#page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/catalogo/js/catalogo'.JS_SUFFIX.'.js';
		// page::$js_ar_url[] = 'https://d3js.org/d3.v4.min.js';
		// page::$js_ar_url[] 		= 'https://d3js.org/d3.v7.min.js';
		// page::$js_ar_url[] = 'https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.2/d3.min.js';
		// page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/d3/d3.min.js';
		// page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/nvd3/nv.d3.min.js';


	// page basic vars
		$title 			= $this->get_element_from_template_map('title', $template_map->{$mode});
		$abstract  		= $this->get_element_from_template_map('abstract', $template_map->{$mode});
		$body  			= $this->get_element_from_template_map('body', $template_map->{$mode});
		$ar_image  		= $this->get_element_from_template_map('image', $template_map->{$mode});


	// body images fix url paths
		$body = str_replace('../../../media', __WEB_BASE_URL__ . '/dedalo/media', $body);

