<?php
/**
* TRIGGER
*/
# CONFIG
	$start_time=microtime(1);
	require(dirname(dirname(dirname(__FILE__))) . '/web_app/config/config.php');

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
	
	// Filter
		$filter = '';
		switch ($q_name) {
			case 'combined_field_cases':
				$filter  = "CONCAT_WS(' ', `leyenda_anverso`, `leyenda_reverso`) LIKE '%".trim($q)."%'";
				$filter .= " AND LENGTH(CONCAT_WS('', `leyenda_anverso`, `leyenda_reverso`))>3";
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
				if ($field_name==='limit') continue;
				$filter .= " AND `{$field_name}` LIKE '".trim($field_q)."'";
			}
		}
		#dump($filter, ' filter ++ '.to_string());

	// ar_fields
		switch ($q_name) {
			case 'combined_field_cases':
				$ar_fields = ['CONCAT_WS(\' \', `leyenda_anverso`, `leyenda_reverso`) AS leyenda', 'section_id'];
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
		$vars = array('ar_query','limit','offset','count','total','order');
			foreach($vars as $name) {
				$$name = common::setVarData($name, $json_data);
				# DATA VERIFY
				if ($name==='ar_query' || $name==='order' || $name==='offset' || $name==='count' || $name==='total') continue; # Skip non mandatory
				if (empty($$name)) {
					$response->msg = 'Trigger Error: ('.__FUNCTION__.') Empty '.$name.' (is mandatory)';
					return $response;
				}
			}
			
	require(dirname(dirname(__FILE__)) .'/page/class.cost_huma.php');

	// search 
		$search_options = new stdClass();
			$search_options->ar_query 	= $ar_query;
			$search_options->limit 		= $limit;
			$search_options->offset 	= $offset;
			$search_options->count 		= $count;
			$search_options->total 		= $total;
			$search_options->order 		= $order;
		
		$result = cost_huma::search_rows($search_options);
				

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
}//end search_rows



/**
* SEARCH_DETAIL
* @return object $response
*/
function search_detail($json_data) {
	global $start_time;

	$response = new stdClass();
		$response->result 	= false;
		$response->msg 		= 'Error. Request failed ['.__FUNCTION__.']';

	# set vars 
		$vars = array('section_id');
			foreach($vars as $name) {
				$$name = common::setVarData($name, $json_data);
				# DATA VERIFY
				if ($name==='ar_query') continue; # Skip non mandatory
				if (empty($$name)) {
					$response->msg = 'Trigger Error: ('.__FUNCTION__.') Empty '.$name.' (is mandatory)';
					return $response;
				}
			}
			
	require(dirname(dirname(__FILE__)) .'/page/class.cost_huma.php');

	// search 
		$search_options = new stdClass();
			$search_options->section_id = $section_id;
			
		
		$result = cost_huma::search_detail($search_options);
				

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
}//end search_detail


