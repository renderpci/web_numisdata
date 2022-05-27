<?php
// Version. Important!
	$version = "1.0.7"; // 14-07-2020


// area_name check get var
	if (!isset($_GET['area_name'])) {
		exit("Sorry, bad url requested. Please, review your rewrite config");
	}



// lang check in url path
	preg_match('/(\/([a-z]{2}))?$/', $_GET['area_name'], $ar_output);
	if (!empty($ar_output[2])) {
		$lang_from_path = $ar_output[2];
		if (!isset($_GET['lang'])) {
			$_GET['lang'] = $lang_from_path; // Force get
		}
	}



// include config file
	$site_safe_path = dirname(dirname(dirname($_SERVER["SCRIPT_FILENAME"]))) . '/tpl/config/config.php';
	include($site_safe_path);



// area_name . web_path
	$area_name = trim($_GET['area_name'],'/');
	// if (common::validate_area_name($area_name)===false) {
	// 	http_response_code(404);
	// 	die("Ops.. Invalid area!");
	// }
	$ar_parts 	= explode('/', $area_name);
	$ar_len 	= count($ar_parts);

	switch (true) {
		case $ar_len===3:
			if (isset($lang_from_path)) {
				$area_table 	 = WEB_MENU_TABLE;
				$area_name 		 = $ar_parts[0];
				$area_section_id = $ar_parts[1];
			}else{
				$area_name 		 = $ar_parts[0];
				$area_table 	 = $ar_parts[1];
				$area_section_id = $ar_parts[2];
			}
			break;
		case $ar_len===2:
				$area_name		 = $ar_parts[0];
				$area_table 	 = WEB_MENU_TABLE;
			break;
		default:
				$area_name		 = end($ar_parts);
				$area_table 	 = WEB_MENU_TABLE;
			break;
	}



// map area name
	if ( defined('WEB_PATH_MAP') && isset(WEB_PATH_MAP[$area_name]) ) {
		$area_name = WEB_PATH_MAP[$area_name]; // Overwrite
	}



// session save area name
	#$_SESSION['area_name'] = $area_name;
	#error_log($area_name);



// page. Init page class (load basic data to generate current page, including data_combi)
	$page = new page();
		$page->area_name  		= $area_name;
		$page->area_table 		= $area_table;
		$page->area_section_id 	= $area_section_id ?? null;
		$page->lang_from_path 	= $lang_from_path ?? null;

	$page->init();



// template
	$template_found = false;
	switch (WEB_TEMPLATE_MAP_DEFAULT_SOURCE) {
		case 'file':
			# JSON FILE. Try using json file template map
			$template_map = array_reduce($page->template_map, function($carry, $item) use($area_name){
				return ($item->template===$area_name) ? $item : $carry;
			});
			if (!empty($template_map)) {

				# Ok. Term (area_name) located in file. Resolving template
				$template_found 	= true;

				$term_id 		 	= null;
				$page->menu_parent 	= null;

				$mode 		  	 	= 'detail';
			}
			$page->row = false;
			break;
		case 'db':
		default:

			// menu_all records (from ts_web)
				// $term_data = array_reduce($page->data_combi, function($carry, $item) use($area_name){
				// 	if ($item->id==='menu_all') {
				// 		return array_reduce($item->result, function($carry2, $item2) use($area_name){
				// 			return ($item2->web_path===$area_name || $item2->term_id===$area_name) ? $item2 : $carry2;
				// 		});
				// 	}
				// 	return $carry;
				// });
				$menu_all = array_find($page->data_combi, function($el){
					return $el->id==='menu_all';
				});
				$term_data = array_find($menu_all->result, function($el) use($area_name){
					return ($el->web_path===$area_name || $el->term_id===$area_name);
				});

			if (!empty($term_data)) {

				// template_found Ok. Term (area_name) located in DDBB. Resolving template
					$template_found = true;

				// set page vars
					$mode 				= 'detail';
					$term_id 		 	= $term_data->term_id;
					$page->term_id 		= $term_id;
					$page->menu_parent 	= (empty($term_data->children) || $term_data->children==='[]')
						? $term_data->parent
						: $term_id;

				// set page row
					if (isset($area_section_id) && isset($area_table) && !isset($lang_from_path)) {

						// single row from portal. Resolve current detail portal record
						// When url path is like 'web_jaciments/jornadas/actividades/140', we solve the target record
						// using last elements (actividades/140) as template name / record section_id

						// data from previous data_combi call
							$term_data_portal = array_reduce($page->data_combi, function($carry, $item){
								return ($item->id==='record_detail') ? $item : $carry;
							});

						// add page row (a record from target table like 'actividades')
							$page->row = $term_data_portal->result===false ? false : reset($term_data_portal->result);

						// asign page template manually
							$template_name = $page->set_template_from_table($area_table, $area_name);
					}else{

						// default case

						// add page row (a record from ts_web)
							$page->row = $term_data;

					}//end if (isset($area_table) && isset($area_section_id))

				// template. Filter and selects first result
					$template_name	= $page->row->template_name;
					$template_map	= array_find($page->template_map, function($el) use($template_name){
						return $el->id===$template_name;
					});
			}
			break;
	}//end switch (WEB_TEMPLATE_MAP_DEFAULT_SOURCE)



// error. Not valid template found case
	if ($template_found===false) {
		# Error. Term with this web_path not found in DDBB
		$term_id 		 	= null;
		$page->menu_parent 	= null;
		$mode 		  	 	= 'detail';
		$template_map 	 	= false;

		http_response_code(404);
	}



// html. Render full page html
	$options = new stdClass();
		$options->template_map 	= $template_map;
		$options->mode 			= $mode;

	echo $page->render_page_html( $options );


