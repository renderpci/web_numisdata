<?php
include( dirname(dirname(dirname(dirname(__FILE__)))) .'/tpl/config/config.php');
include(dirname(dirname(__FILE__)) .'/web_ts_term/class.web_ts_term.php');
#include(dirname(dirname(__FILE__)) .'/web_indexation_node/class.web_indexation_node.php');

# set vars
$vars = array('mode');
	foreach($vars as $name)	$$name = common::setVar($name);	



if ($mode==='toggle_childrens') {
	
	$vars = array('term_id','ar_childrens','tree_mode');
		foreach($vars as $name)	$$name = common::setVar($name);

		if(!$term_id || !$ar_childrens) return 'Error: few vars';
			

	$html='';
	if (!empty($ar_childrens)) {
	
		# Load childrens data from server api as json
		$options = new stdClass();
			$options->dedalo_get 	= 'thesaurus_term';
			$options->ar_term_id 	= $ar_childrens;
			$options->lang  	 	= WEB_CURRENT_LANG_CODE;
		$ar_ts_terms = json_web_data::get_data($options);
		
		switch ($tree_mode) {
			case 'search_combined':
			case 'search_cumulative':
				$node_html_mode = 'combined';
				break;
			default:
				$node_html_mode = 'list';
				break;
		}

		foreach ((array)$ar_ts_terms->result as $current_term_obj) {

			# Ignore empty terms
			#if (empty($current_term_obj->indexation) && empty($current_term_obj->ar_childrens)) {
			#	continue;
			#}

			$web_ts_term = new web_ts_term($current_term_obj);

			$html .= $web_ts_term->get_html( $node_html_mode );
		}
	}//end if ($ar_childrens = json_decode($ar_childrens)) 


	echo $html;
	exit();
}//end toggle_childrens



if ($mode==='toggle_indexation') {

	$vars = array('term_id','ar_legends','ar_cmk');
		foreach($vars as $name)	$$name = common::setVar($name);

	$ar_api_calls = [];
	if (!empty($ar_legends)) {
		#dump($ar_indexation, ' ar_indexation ++ '.to_string());

		$legends_filter = [];
		foreach ($ar_legends as $section_id) {
			$legends_filter[] = "`legend_obverse_data` like '%\"".$section_id. "\"%' OR `legend_reverse_data` like '%\"".$section_id. "\"%'";
		};

		$sql_filter = implode(' OR ', $legends_filter);

		# Load indexation data from server api as json
		$options = new stdClass();
			$options->dedalo_get 	= 'records';
			$options->table 		= 'types';
			$options->sql_filter 	= $sql_filter;
			$options->lang  	 	= WEB_CURRENT_LANG_CODE;

		$api_call = new stdClass();
			$api_call->id 		= 'type';
			$api_call->options 	= $options;

		$ar_api_calls[] = $api_call;
		// $ar_legends_data = json_web_data::get_data($options);
			// dump($ar_legends_data, ' ar_legends_data ++ '.to_string()); die();

		// echo json_encode($ar_legends_data); exit();
	}//end if ($ar_indexation = json_decode($ar_indexation))


	if (!empty($ar_cmk)) {

		$sql_filter = implode(',', $ar_cmk);

		# Load indexation data from server api as json
		$options = new stdClass();
			$options->dedalo_get 	= 'records';
			$options->table 		= 'coins';
			$options->section_id 	= $sql_filter;
			$options->lang  	 	= WEB_CURRENT_LANG_CODE;

		$api_call = new stdClass();
			$api_call->id 		= 'coins';
			$api_call->options 	= $options;

		$ar_api_calls[] = $api_call;

			// dump($api_call, ' api_call ++ '.to_string()); die();
		
	}//end if ($ar_indexation = json_decode($ar_indexation))

	if(!empty($ar_api_calls)){

		$options = new stdClass();
			$options->dedalo_get 	= 'combi';
			$options->ar_calls 		= $ar_api_calls;

		$result_data = json_web_data::get_data($options);
		echo json_encode($result_data); exit();
	}else{
		$response = new stdClass();
			$response->result 	= false;
			$response->msg 		= 'Error. Request failed ['.__FUNCTION__.']';	
		echo json_encode($response);
	}

	#exit();
}//end toggle_indexation
