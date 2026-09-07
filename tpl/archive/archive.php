<?php declare(strict_types=1);

// archive

	// page basic vars (from template_map "archive" record, mode 'detail')
		$title 		= $this->get_element_from_template_map('title', $template_map->{$mode});
		$abstract	= $this->get_element_from_template_map('abstract', $template_map->{$mode});
		$body		= $this->get_element_from_template_map('body', $template_map->{$mode});

	// section_id . optional record detail, like '/documentation/143'
		$area_name	= $_GET['area_name'];
		$ar_parts	= explode('/', $area_name);
		$url_id		= $ar_parts[1] ?? '';
		$section_id	= $url_id!==''
			? (int) preg_replace('/\D/', '', $url_id)
			: null;
