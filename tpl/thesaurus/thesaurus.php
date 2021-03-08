<?php

// catalog

	
	// css
		page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.css';
		

	// js
		page::$js_ar_url[]		= __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.js';
		// page::$js_ar_url[]		= __WEB_TEMPLATE_WEB__ . '/assets/lib/color-thief/background-color-thief-min.js';
		// page::$js_ar_url[]	= __WEB_TEMPLATE_WEB__ . '/assets/lib/color-thief/color-thief.min.js';
		// page::$js_ar_url[]		= __WEB_TEMPLATE_WEB__ . '/' . $cwd . '/js/row_fields'.JS_SUFFIX.'.js';
	

	// page basic vars
		$title		= $this->get_element_from_template_map('title', $template_map->{$mode});
		$abstract	= $this->get_element_from_template_map('abstract', $template_map->{$mode});
		$body		= $this->get_element_from_template_map('body', $template_map->{$mode});
		$ar_image	= $this->get_element_from_template_map('image', $template_map->{$mode});



	// page_title fix
		$this->page_title = $this->row->term;


	// area name
		$area_name 	= $_GET['area_name'];
		$ar_parts 	= explode('/', $area_name);


	// term_id (is inside get var 'area_name' as '/thesaurus/technique1_92')
		$term_id = isset($ar_parts[1])
			? $ar_parts[1] 
			: null;


	// thesaurus_options
		// material and technique 
			// $thesaurus_options = (object)[
			// 	'table'		=> ['ts_material','ts_technique'],
			// 	'root_term'	=> ['material1_1','technique1_1']
			// ];
		// thematic
			// $thesaurus_options = (object)[
			// 	'table'		=> ['ts_thematic'],
			// 	'root_term'	=> ['ts1_1','ts1_68']
			// ];
		// onomastic
			// $thesaurus_options = (object)[
			// 	'table'		=> ['ts_onomastic'],
			// 	'root_term'	=> ['on1_10','on1_8','on1_15']
			// ];
		
		// thesaurus_options
			$thesaurus_options = (object)[
				'table'		=> ['ts_material','ts_technique','ts_thematic','ts_onomastic','ts_chronological'],
				'root_term'	=> ['material1_1','technique1_1','ts1_68','on1_160','dc1_1'],
				'term_id'	=> $term_id // options request term_id add
			];


		