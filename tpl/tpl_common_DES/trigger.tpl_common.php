<?php
/**
* TRIGGER
*/
# CONFIG
	$start_time=microtime(1);
	require(dirname(dirname(dirname(__FILE__))) . '/tpl/config/config.php');

	define('TEMPORAL_CHARS', '<i>.</i>');


# TRIGGER_MANAGER. Add trigger_manager to receive and parse requested data
	common::trigger_manager();



/**
* AUTOCOMPLETE
* @return object $response
*/
function autocomplete($json_data) {
	global $start_time;

	$response = new stdClass();
		$response->result 	= false;
		$response->msg 		= 'Error. Request failed ['.__FUNCTION__.']';

	# set vars
	$vars = array('q','q_name','q_table','limit','ar_query');
		foreach($vars as $name) {
			$$name = common::setVarData($name, $json_data);
			# DATA VERIFY
			if ($name==='limit' || $name==='q' || $name==='ar_query') continue; # Skip non mandatory
			if (empty($$name)) {
				$response->msg = 'Trigger Error: ('.__FUNCTION__.') Empty '.$name.' (is mandatory)';
				return $response;
			}
		}

	// limit
		if ($limit===false) {
			$limit = 30;
		}

	// table
		if (empty($q_table)) {
			$q_table = 'tipos';
		}
	
	// Filter
		$filter = '';
		switch ($q_name) {
			case 'leyenda':
				$filter  = "CONCAT_WS(' ', `leyenda_anverso`, `leyenda_reverso`) LIKE '%".trim($q)."%'";
				$filter .= " AND LENGTH(CONCAT_WS('', `leyenda_anverso`, `leyenda_reverso`))>3";
				break;
			case 'diseno':
				$filter = "CONCAT_WS(' ', `tipo_anverso`, `tipo_reverso`) LIKE '%".trim($q)."%'";
				$filter .= " AND LENGTH(CONCAT_WS('', `tipo_anverso`, `tipo_reverso`))>3";
				break;
			default:
				// empty q case select all not empty values
				if (empty($q)) {
					$filter = ' (`'.$q_name.'` IS NOT NULL AND `'.$q_name.'`<>\'\') ';
				}else{
					$filter = "`{$q_name}` LIKE '%".trim($q)."%'";
				}
				break;
		}

	// ar_query
		if (!empty($ar_query)) {
			foreach ($ar_query as $key => $current_query) {
				$field_name = $current_query->name;
				$field_q 	= $current_query->value;
				$filter .= " AND `{$field_name}` LIKE '".trim($field_q)."'";
			}
		}
		#dump($filter, ' filter ++ '.to_string());

	// ar_fields
		switch ($q_name) {
			case 'leyenda':
				$ar_fields = ['CONCAT_WS(\' \', `leyenda_anverso`, `leyenda_reverso`) AS leyenda', 'section_id'];
				break;
			case 'diseno':
				$ar_fields = ['CONCAT_WS(\' \', `tipo_anverso`, `tipo_reverso`) AS diseno','section_id'];
				break;
			default:
				$ar_fields = [$q_name,'section_id'];
				break;
		}

	// group
		$group = $q_name;
		
	// order
		$order = $q_name . ' ASC';
		
	# Search	
	# API Query
	$options = new stdClass();
		$options->dedalo_get 	= 'records';
		$options->table  	 	= $q_table;
		$options->ar_fields  	= $ar_fields;
		$options->lang  	 	= WEB_CURRENT_LANG_CODE;
		$options->limit 		= (int)$limit;
		$options->sql_filter 	= $filter;
		$options->group 		= $group;
		$options->order 		= $order;
	
	# Http request in php to the API
	$web_data = json_web_data::get_data($options);
		#dump($web_data, ' web_data ++ '.to_string($options));
		#dump($options, ' options ++ '.to_string());

	// Group by q_name
		$ar_group = [];
		foreach ($web_data->result as $key => $row) {
			if (isset($ar_group[$row->{$q_name}])) {
				# Add section_id
				$ar_group[$row->{$q_name}]->section_id[] = $row->section_id;
				
			}else{				
		
				// split					
					#if (strpos($row->{$q_name},',')!==false) {
					#	$ar_elements = explode(',', $row->{$q_name}); // One for each element
					#}else{
						$ar_elements = [$row->{$q_name}]; // Only one always
					#}
					

				foreach ($ar_elements as $key => $name) {
		
					#if (stripos($name, $q)===false) continue;

					#$name = trim( strip_tags($name) );
					#$name = trim( $name );
					//if (strpos($name, '[]')!==false || strlen($name)<2) {
					//	// skip
					//	continue;
					//}

					#$name = html_entity_decode($name);
					$name = $name . TEMPORAL_CHARS; // '<i>.</i>';

					$name = str_replace('/dedalo/media/', 'https://vidalvalle/dedalo/media/', $name);


					$element = new stdClass();
						#$element->{$q_name}  = $row->{$q_name};
						#$element->section_id = [$row->section_id];
						$element->label = $name;
						$element->value = [$row->section_id];

					# Insert as new
					$ar_group[$name] = $element;
				}
			}
		}
		#dump(array_values($ar_group), ' ar_group ++ '.to_string());

	$response->result 	= array_values($ar_group);
	$response->msg 		= 'Ok. Success ['.__FUNCTION__.']';

	# Debug
	if(SHOW_DEBUG===true) {
		$debug = new stdClass();
			$debug->exec_time	= exec_time_unit($start_time,'ms')." ms";
			foreach($vars as $name) {
				$debug->{$name} = $$name;
			}

		$response->debug = $debug;
	}

	return (object)$response;
}//end autocomplete



/**
* SEARCH_ROWS
* @return object $response
*/
function search_rows($json_data) {
	global $start_time;

	$response = new stdClass();
		$response->result 	= false;
		$response->msg 		= 'Error. Request failed ['.__FUNCTION__.']';

	# set vars 
		$vars = array('ar_query','limit','offset','count','total','order','only_monedas_id');
			foreach($vars as $name) {
				$$name = common::setVarData($name, $json_data);
				# DATA VERIFY
				if ($name==='ar_query' || $name==='order' || $name==='offset' || $name==='count' || $name==='total' || $name==='only_monedas_id') continue; # Skip non mandatory
				if (empty($$name)) {
					$response->msg = 'Trigger Error: ('.__FUNCTION__.') Empty '.$name.' (is mandatory)';
					return $response;
				}
			}		

	// ar_query_safe
		if (!empty($ar_query)) {			
			$ar_query_safe = array_map(function($item){
				// remove temporal added chars
				$item->value = str_replace(TEMPORAL_CHARS, '', $item->value); // needed fot jquery autocomplete (grrrrr)
				// remove temporal changes on images url
				$item->value = str_replace('https://vidalvalle/dedalo/media/','/dedalo/media/', $item->value); // needed to show correct image url
				return $item;
			}, $ar_query);
		}else{
			$ar_query_safe = $ar_query;
		}		
		#dump($ar_query_safe, ' ar_query_safe ++ '.to_string());

	require(dirname(dirname(__FILE__)) .'/catalogo/class.catalogo.php');

	// search 
		$search_options = new stdClass();
			$search_options->ar_query 	= $ar_query_safe;
			$search_options->limit 		= $limit;
			$search_options->offset 	= $offset;
			$search_options->count 		= $count;
			$search_options->total 		= $total;
			$search_options->order 		= $order;
		
		$rows_data = catalogo::search_tipos($search_options);
	
	if ($only_monedas_id===true) {
		$ar_monedas = [];
		foreach ($rows_data->result as $c_value) {
			if (empty($c_value->monedas)) {
				continue;
			}
			$monedas = $c_value->monedas;
			foreach ($monedas as $c_moneda) {
				if (!in_array($c_moneda->section_id, $ar_monedas)) {
					$ar_monedas[] = $c_moneda->section_id;
				}
			}
		}
		#$ar_monedas = array_unique($ar_monedas);
		// override
		$rows_data->result = $ar_monedas;
	}

	$response->result 	= $rows_data;
	$response->msg 		= 'Ok. Success ['.__FUNCTION__.']';

	# Debug 
		if(SHOW_DEBUG===true) {
			$debug = new stdClass();
				$debug->exec_time	= exec_time_unit($start_time,'ms')." ms";
				foreach($vars as $name) {
					$debug->{$name} = $$name;
				}
			$response->debug = $debug;
		}

	return (object)$response;
}//end search_rows



/**
* SEARCH_MONEDA_BY_SECTION_ID
* @return object $response
*/
function search_moneda_by_section_id($json_data) {
	global $start_time;

	$response = new stdClass();
		$response->result 	= false;
		$response->msg 		= 'Error. Request failed ['.__FUNCTION__.']';

	# set vars
	$vars = array('section_id');
		foreach($vars as $name) {
			$$name = common::setVarData($name, $json_data);
			# DATA VERIFY
			#if ($name==='ar_query') continue; # Skip non mandatory
			if (empty($$name)) {
				$response->msg = 'Trigger Error: ('.__FUNCTION__.') Empty '.$name.' (is mandatory)';
				return $response;
			}
		}

	require(dirname(dirname(__FILE__)) .'/catalogo/class.catalogo.php');	

	$result = catalogo::search_moneda_by_section_id($section_id);
	

	$response->result 	= $result;
	$response->msg 		= 'Ok. Success ['.__FUNCTION__.']';

	# Debug
	if(SHOW_DEBUG===true) {
		$debug = new stdClass();
			$debug->exec_time	= exec_time_unit($start_time,'ms')." ms";
			foreach($vars as $name) {
				$debug->{$name} = $$name;
			}

		$response->debug = $debug;
	}

	return (object)$response;
}//end search_moneda_by_section_id



/**
* SEARCH_DISTINCT
* @return object $response
*/
function search_distinct($json_data) {
	global $start_time;

	$response = new stdClass();
		$response->result 	= false;
		$response->msg 		= 'Error. Request failed ['.__FUNCTION__.']';

	# set vars
	$vars = array('q','q_name','q_table','limit');
		foreach($vars as $name) {
			$$name = common::setVarData($name, $json_data);
			# DATA VERIFY
			if ($name==='limit') continue; # Skip non mandatory
			if (empty($$name)) {
				$response->msg = 'Trigger Error: ('.__FUNCTION__.') Empty '.$name.' (is mandatory)';
				return $response;
			}
		}

	if ($limit===false) {
		$limit = 25;
	}
	

	# Search	
	# API Query
	$options = new stdClass();
		$options->dedalo_get 	= 'records';
		$options->table  	 	= $q_table;
		$options->ar_fields  	= [$q_name,'section_id'];
		$options->lang  	 	= WEB_CURRENT_LANG_CODE;
		$options->limit 		= (int)$limit;
		$options->sql_fullselect= 'SELECT distinct `'.$q_name.'`, section_id FROM '.$q_table;
		$options->sql_filter 	= '(`'.$q_name.'` IS NOT NULL AND `'.$q_name.'` != \'\' AND `'.$q_name.'` LIKE \'%'.$q.'%\')';
	
	# Http request in php to the API
	$web_data = json_web_data::get_data($options);
		#dump($web_data, ' web_data ++ '.to_string());

	// Group by q_name
	$ar_group = [];
	foreach ($web_data->result as $key => $row) {
		if (isset($ar_group[$row->{$q_name}])) {
			# Add section_id
			$ar_group[$row->{$q_name}]->section_id[] = $row->section_id;
			
		}else{

			$element = new stdClass();
				#$element->{$q_name}  = $row->{$q_name};
				#$element->section_id = [$row->section_id];
				$element->label = $row->{$q_name};
				$element->value = [$row->section_id];

			# Insert as new
			$ar_group[$row->{$q_name}] = $element;
		}
	}
	#dump($ar_group, ' ar_group ++ '.to_string());

	$response->result 	= array_values($ar_group);
	$response->msg 		= 'Ok. Success ['.__FUNCTION__.']';

	# Debug
	if(SHOW_DEBUG===true) {
		$debug = new stdClass();
			$debug->exec_time	= exec_time_unit($start_time,'ms')." ms";
			foreach($vars as $name) {
				$debug->{$name} = $$name;
			}

		$response->debug = $debug;
	}

	return (object)$response;
}//end search_distinct







/**
* load_snippet
* @return object $response
*/
function load_snippet($json_data) {
	global $start_time;

	$response = new stdClass();
		$response->result 	= false;
		$response->msg 		= 'Error. Request failed ['.__FUNCTION__.']';

	# set vars
	$vars = array('snippet_name');
		foreach($vars as $name) {
			$$name = common::setVarData($name, $json_data);
			# DATA VERIFY
			#if ($name==='limit') continue; # Skip non mandatory
			if (empty($$name)) {
				$response->msg = 'Trigger Error: ('.__FUNCTION__.') Empty '.$name.' (is mandatory)';
				return $response;
			}
		}

	if (empty($snippet_name)) {
		return $response;
	}

	// DEFINED SNIPPETS
	switch ($snippet_name) {
		case 'catalogo_search_advanced':
			$snippet_path = __WEB_BASE_PATH__ . '/'. WEB_DISPATCH_DIR .'/tpl/' .  WEB_ENTITY . '/catalogo/html/catalogo_search_advanced.phtml';
			ob_start();
			require($snippet_path);
			$result = ob_get_clean();
			break;
		case 'catalogo_search':
			$snippet_path = __WEB_BASE_PATH__ . '/'. WEB_DISPATCH_DIR .'/tpl/' .  WEB_ENTITY . '/catalogo/html/catalogo_search.phtml';
			ob_start();
			require($snippet_path);
			$result = ob_get_clean();
			break;
		default:
			$response->result 	= false;
			$response->msg 		= 'Error. Request failed ['.__FUNCTION__.']. Undefined snippet '.$snippet_name;
			break;
	}

	$response->result 	= $result;
	$response->msg 		= 'Ok. Success ['.__FUNCTION__.']';

	# Debug
	if(SHOW_DEBUG===true) {
		$debug = new stdClass();
			$debug->exec_time	= exec_time_unit($start_time,'ms')." ms";
			foreach($vars as $name) {
				$debug->{$name} = $$name;
			}

		$response->debug = $debug;
	}

	return (object)$response;
}//end load_snippet


