<?php
/**
* TRIGGER
*/
# CONFIG
	$start_time=microtime(1);
	require(dirname(dirname(__FILE__)) . '/config/config.php');
	require_once(dirname(dirname(__FILE__)) .'/type/class.type.php');

	define('TEMPORAL_CHARS', '<i>.</i>');

# TRIGGER_MANAGER. Add trigger_manager to receive and parse requested data
	common::trigger_manager();



/**
* GET_ROW_DATA
* @return object $response
*/
function get_row_data($json_data) {
	global $start_time;

	$response = new stdClass();
		$response->result 	= false;
		$response->msg 		= 'Error. Request failed ['.__FUNCTION__.']';

	// set vars
		$vars = array('section_id');
		foreach($vars as $name) {
			$$name = common::setVarData($name, $json_data);
			# DATA VERIFY
			if (empty($$name)) {
				$response->msg = 'Trigger Error: ('.__FUNCTION__.') Empty '.$name.' (is mandatory)';
				return $response;
			}
		}

	// search.  exec search method
		$result = type::get_row_data($section_id);
		

	// response ok
		$response->result 	= $result;
		$response->msg 		= 'Ok. Success ['.__FUNCTION__.']';


	// debug
		if(SHOW_DEBUG===true) {
			$debug = new stdClass();
				$debug->function_name 	= 'trigger.type get_row_data';
				$debug->exec_time		= exec_time_unit($start_time,'ms')." ms";
				foreach($vars as $name) {
					$debug->{$name} = $$name;
				}

			$response->debug = $debug;
		}
	

	return (object)$response;
}//end get_row_data
