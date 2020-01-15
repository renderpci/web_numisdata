<?php
/**
* TRIGGER
*/
# CONFIG
	$start_time=microtime(1);
	require(dirname(dirname(__FILE__)) . '/config/config.php');	
	
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
		
	// class biblio include
		require(dirname(dirname(__FILE__)) .'/biblio/class.biblio.php');

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

	// search
		$search_options = new stdClass();
			$search_options->ar_query 	= $ar_query;
			$search_options->limit 		= $limit;
			// pagination
			$search_options->offset 	= $offset;
			$search_options->count 		= $count;
			#$search_options->total 	= $total;
			$search_options->order 		= $order;
			$search_options->operator 	= $operator;

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
		$vars = array('q','q_name','q_table','limit');
		foreach($vars as $name) {
			$$name = common::setVarData($name, $json_data);
			# DATA VERIFY
			if ($name==='q' || $name==='limit') continue; # Skip non mandatory
			if (empty($$name)) {
				$response->msg = 'Trigger Error: ('.__FUNCTION__.') Empty '.$name.' (is mandatory)';
				return $response;
			}
		}

	// limit defaults
		if ($limit===false) $limit = 25;

	// Search API Query
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


