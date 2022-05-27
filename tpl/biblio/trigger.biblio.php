<?php
/**
* TRIGGER
*/
# CONFIG
	$start_time=microtime(1);
	require(dirname(dirname(__FILE__)) . '/config/config.php');
	require_once(dirname(dirname(__FILE__)) .'/biblio/class.biblio.php');

	define('TEMPORAL_CHARS', '<i>.</i>');

# TRIGGER_MANAGER. Add trigger_manager to receive and parse requested data
	common::trigger_manager();



/**
* SEARCH_ROWS
* @return object $response
*/
function search_rows($json_data) {
	global $start_time;

	$response = new stdClass();
		$response->result 	= false;
		$response->msg 		= 'Error. Request failed ['.__FUNCTION__.']';

	// set vars
		$vars = array('ar_query','limit','offset','count','order','operator'); // ,'offset','total'
		foreach($vars as $name) {
			$$name = common::setVarData($name, $json_data);
			# DATA VERIFY
			if ($name==='ar_query' || $name==='order' || $name==='offset' || $name==='count' || $name==='total' || 'operator') continue; # Skip non mandatory
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
				// $item->value = str_replace('https://mib.numisdata.org/dedalo/media/','/dedalo/media/', $item->value); // needed to show correct image url
				return $item;
			}, $ar_query);
		}else{
			$ar_query_safe = $ar_query;
		}
		// dump($ar_query_safe, ' ar_query_safe ++ '.to_string());

		$boolean_operator = ($operator==='$and')
			? 'AND'
			: (($operator==='$or')
				? 'OR'
				: null);
	// search
		$search_options = new stdClass();
			$search_options->ar_query 	= $ar_query;
			$search_options->limit 		= $limit;
			// pagination
			$search_options->offset 	= $offset;
			$search_options->count 		= $count;
			#$search_options->total 	= $total;
			$search_options->order 		= $order;
			$search_options->operator 	= $boolean_operator;

		// exec search method
			$result = biblio::search_biblio($search_options);


	// response ok
		$response->result 	= $result;
		$response->msg 		= 'Ok. Success ['.__FUNCTION__.']';


	// debug
		if(SHOW_DEBUG===true) {
			$debug = new stdClass();
				$debug->function_name 	= 'trigger.biblio search_rows';
				$debug->exec_time		= exec_time_unit($start_time,'ms')." ms";
				foreach($vars as $name) {
					$debug->{$name} = $$name;
				}

			$response->debug = $debug;
		}


	return (object)$response;
}//end search_rows



/**
* SEARCH_DISTINCT
* Used by form field autocomplete
* @return object $response
*/
function search_distinct($json_data) {
	global $start_time;

	$response = new stdClass();
		$response->result 	= false;
		$response->msg 		= 'Error. Request failed ['.__FUNCTION__.']';

	// set vars
		$vars = array('q','q_name','q_search','q_table','limit','dd_relations');
		foreach($vars as $name) {
			$$name = common::setVarData($name, $json_data);
			# DATA VERIFY
			if ($name==='q' || $name==='limit' || $name==='dd_relations') continue; # Skip non mandatory
			if (empty($$name)) {
				$response->msg = 'Trigger Error: ('.__FUNCTION__.') Empty '.$name.' (is mandatory)';
				return $response;
			}
		}

	// limit defaults
		if ($limit===false) $limit = 25;

	// q
		$q = biblio::escape_value($q);


	// safe_q_name_select
		$safe_q_name_select = (stripos($q_name, ' AS ')!==false)
			? $q_name
			: '`'.$q_name.'`'; // default

	// safe_q_name
		if(stripos($q_name, ' AS ')!==false) {
			$ar_parts = explode(' AS ', $q_name);
			#$safe_q_name = $ar_parts[0];
			$column_name = $ar_parts[1];
		}else{
			#$safe_q_name = $safe_q_name_select; // default
			$column_name = $q_name;
		}

	// Search API Query
		$options = new stdClass();
			$options->dedalo_get 	= 'records';
			$options->table  	 	= $q_table;
			$options->ar_fields  	= [$q_name,'section_id'];
			$options->lang  	 	= WEB_CURRENT_LANG_CODE;
			$options->limit 		= (int)$limit;
			$options->sql_fullselect= 'SELECT distinct '.$safe_q_name_select.', section_id FROM '.$q_table;
			$options->sql_filter 	= ''.$q_search.' IS NOT NULL '.PHP_EOL.'AND '.$q_search.'!=\'\' '.PHP_EOL.'AND '.$q_search.' LIKE \'%'.$q.'%\'';

			// additional filter using dd_relations column
			if (!empty($dd_relations)) {
				$options->sql_filter .= PHP_EOL.'AND dd_relations LIKE \'%"'.$dd_relations.'"%\'';
			}

		# Http request in php to the API
		$web_data = json_web_data::get_data($options);
			#dump($web_data, ' web_data ++ '.to_string());

	// Group by column_name
		$ar_group = [];
		if ($web_data->result) {
			foreach ($web_data->result as $key => $row) {
				if (isset($ar_group[$row->{$column_name}])) {
					# Add section_id
					$ar_group[$row->{$column_name}]->section_id[] = $row->section_id;

				}else{

					$element = new stdClass();
						#$element->{$column_name}  = $row->{$column_name};
						#$element->section_id = [$row->section_id];
						$element->label = $row->{$column_name};
						$element->value = [$row->section_id];

					# Insert as new
					$ar_group[$row->{$column_name}] = $element;
				}
			}
		}
		#dump($ar_group, ' ar_group ++ '.to_string());

	// sort by label
		function cmp($a, $b) {
			if ($a->label == $b->label) {
				return 0;
			}
			return ($a->label < $b->label) ? -1 : 1;
		}
		usort($ar_group, 'cmp');
		// usort($ar_group, function($a, $b) {return strcmp($a->label, $b->label);});



	// response ok
		$response->result 	= array_values($ar_group);
		$response->msg 		= 'Ok. Success ['.__FUNCTION__.']';

	// debug
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
