<?php

// controller
	
	// inludes
		include(__WEB_TEMPLATE_PATH__ .'/lib/web_ts_term/class.web_ts_term.php');
		include(__WEB_TEMPLATE_PATH__ .'/lib/web_indexation_node/class.web_indexation_node.php');


	// Add libs
		// web_ts_term
			page::$js_ar_url[]  = __WEB_TEMPLATE_WEB__ . '/lib/web_ts_term/js/web_ts_term.js';
			page::$js_ar_url[]  = __WEB_TEMPLATE_WEB__ . '/lib/web_indexation_node/js/web_indexation_node.js';
		// glyphicons fonts ans css
			page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/fonts/glyphicons/glyphicons-halflings.css';

	
	// template vars
		$title 			= $this->get_element_from_template_map('title', $template_map->{$mode});
		$abstract  		= $this->get_element_from_template_map('abstract', $template_map->{$mode});
		$body  			= $this->get_element_from_template_map('body', $template_map->{$mode});
		$ar_image  		= $this->get_element_from_template_map('image', $template_map->{$mode});	
			#dump($ar_image, ' ar_image ++ '.to_string()); die();


	// numero de registros por página
		$nregpp = 1; 
		if(isset($_SESSION['nregpp'])) $nregpp = $_SESSION['nregpp'];
		if(isset($_REQUEST['nregpp'])) $nregpp = $_REQUEST['nregpp'];

	// page number
		$page_number = isset($_GET['page']) ? (int)$_GET['page'] : 1;


	// set request vars (id,lang,etc..) if need
		$vars = array('q');
		foreach($vars as $name) $$name = common::setVar($name);
		$q_raw = $q;

		switch (true) {

			case (!empty($q) && strlen($q)>=2):
				#
				# SEARCH		
				$options = new stdClass();
					$options->dedalo_get 	= 'thesaurus_search';
					$options->q 			= $q;
					$options->lang  	 	= WEB_CURRENT_LANG_CODE;
					$options->page_number 	= $page_number;
					$options->rows_per_page = (int)$nregpp;
					$options->tree_root 	= 'last_parent'; # first_parent | last_parent	
					
				$response = json_web_data::get_data($options);
					#dump($response, ' response ++ '.to_string()); die();

				$search_data  = $response->search_data;
				$ar_ts_terms  = $response->ar_ts_terms;
				$ar_highlight = $response->ar_highlight;

				# paginations usefull vars
				$viewed_records = count($search_data->result);
				$total_records  = isset($search_data->total) ? $search_data->total : $viewed_records;
				$page_number 	= $options->page_number;
				$rows_per_page 	= $options->rows_per_page;

				$rows_data_ejemplos = false;					
			
				$searching = true;
				break;			
			
			default:
				
				// filmstrip ejemplos de lo que puedes ver
					// $term_id = 'rt1_3';
					// $options = new stdClass();
					// 	$options->dedalo_get 	= 'thesaurus_indexation_node';
					// 	$options->term_id  		= $term_id;
					// 	$options->ar_locators  	= null;
					// 	$options->lang 		   	= WEB_CURRENT_LANG_CODE;
					// 	$options->image_type   	= 'posterframe'; # posterframe | identify_image
					// 	$options->table   		= 'restringidos'; // only used when ar_locators is empty
					// #$rows_data_ejemplos = json_web_data::get_data($options);
					// 	#dump($rows_data_ejemplos, ' rows_data_ejemplos ++ '.to_string()); die();
					// $ar_calls[] = [
					// 	'id' 		=> 'thesaurus_indexation_node',
					// 	'options' 	=> $options
					// ];
				
				// root level terms query
					$options = new stdClass();
						$options->dedalo_get 	= 'thesaurus_root_list';
						$options->table  	 	= ['ts_countermarks','ts_iconography'];
						$options->lang  	 	= WEB_CURRENT_LANG_CODE;
						#$options->parents 	 	= 'hierarchy1_1,hierarchy1_245,hierarchy1_270';
						$options->parents 	 	= ['sccmk1_1','icon1_1'];
					#$rows_data 	 = json_web_data::get_data($options);
					#$ar_ts_terms = $rows_data->result;
						#dump($ar_ts_terms, ' ar_ts_terms ++ '.to_string(WEB_CURRENT_LANG_CODE)); #die();
					$ar_calls[] = [
						'id' 		=> 'thesaurus_root_list',
						'options' 	=> $options
					];

				// // random term pick placeholder	
				// 	$options = new stdClass();
				// 		$options->dedalo_get 	= 'records';
				// 		$options->table  	 	= ['ts_countermarks','ts_iconography'];
				// 		$options->ar_fields 	= ['term'];
				// 		$options->lang  	 	= WEB_CURRENT_LANG_CODE;
				// 		$options->sql_filter 	= 'term != \'\' AND parent != \'sccmk1_1\'';
				// 		$options->limit  	 	= 1;
				// 		$options->order  	 	= 'RAND()';
				// 	#$rnd_rows_data 	 = json_web_data::get_data($options);
				// 		#dump($rnd_rows_data, ' rnd_rows_data ++ '.to_string());
				// 	$ar_calls[] = [
				// 		'id' 		=> 'random_term',
				// 		'options' 	=> $options
				// 	];				

				// combi
					$options = new stdClass();
						$options->dedalo_get 	= 'combi';
						$options->ar_calls 		= $ar_calls;
					# Http request in php to the API
					$response = json_web_data::get_data($options);
					// dump($response, ' response ++ '.to_string());

				// // ejemplos data
				// 	$rows_data_ejemplos = array_reduce($response->result, function($carry, $item){
				// 		if ($item->id==='thesaurus_indexation_node') {
				// 			return $item;
				// 		}
				// 		return $carry;
				// 	});

				// thesaurus_root_list data
					$ar_ts_terms = array_reduce($response->result, function($carry, $item){
						if ($item->id==='thesaurus_root_list') {
							return $item->result;
						}
						return $carry;
					});

						// dump($ar_ts_terms, ' ar_ts_terms ++ '.to_string());

				// // random_term data
				// 	$rnd_rows_data = array_reduce($response->result, function($carry, $item){
				// 		if ($item->id==='random_term') {
				// 			return $item;
				// 		}
				// 		return $carry;
				// 	});
				// 	$placeholder = '';					
				// 	if (isset($rnd_rows_data->result[0])) {
				// 		$placeholder = tstring('ejemplo') .' ' .$rnd_rows_data->result[0]->term;
				// 	}
				break;
		}//end switch true


	// custom functions
		$replace_media = function($url) {
			$url = str_replace('/dedalo4/media_test/mht', __WEB_MEDIA_BASE_URL__ . '/dedalo/media', $url);
			return $url;
		};

		$format_informant = function($row) {
			$informant_name = '';
			$total_informants = count($row->informant)-1;
			foreach ($row->informant as $av_key => $inf_column) {
				$informant_name .= $inf_column->name;
				$informant_name .= ' '.$inf_column->surname;
				if ($av_key<$total_informants) {
					$informant_name .= ', ';
				}
			}

			return $informant_name;
		};


