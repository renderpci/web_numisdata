<?php
/**
* CATALOG
*
*/
class catalog {


	// 
	// /**
	// * SEARCH_CATALOG
	// * @return array $ar_result
	// */
	// public static function search_catalog($request_options) {
	//
	// 	$options = new stdClass();
	// 		$options->ar_query 	= [];
	// 		$options->limit 	= 10;
	// 		// pagination
	// 		$options->offset 	= 0;
	// 		$options->count 	= true;
	// 		$options->operator 	= 'or';
	// 		$options->total 	= false;
	// 		$options->order 	= 'section_id ASC';
	// 		foreach ($request_options as $key => $value) {if (property_exists($options, $key)) $options->$key = $value;}
	//
	// 	// fields
	// 		// id	int(12) Auto Increment
	// 		// section_id	int(12) unsigned NULL	Campo creado automáticamente para guardar section_id (sin correspondencia en estructura)
	// 		// lang	varchar(8) NULL	Campo creado automáticamente para guardar el idioma (sin correspondencia en estructura)
	// 		// term	text NULL	Término - numisdata656
	// 		// term_data	text NULL	Término - numisdata656
	// 		// term_table	text NULL	Término - numisdata656
	// 		// term_section_tipo	varchar(1024) NULL	Término - numisdata656
	// 		// term_section_label	varchar(1024) NULL	Término - numisdata656
	// 		// parent	text NULL	Padre - numisdata658
	// 		// children	text NULL	Hijos - numisdata659
	// 		// coins_data	text NULL	Portal inverso tipo - numisdata679
	// 		// ref_type_material_data	text NULL	Término - numisdata656
	// 		// ref_type_material	text NULL	Término - numisdata656
	// 		// ref_type_denomination_data	text NULL	Término - numisdata656
	// 		// ref_type_denomination	text NULL	Término - numisdata656
	// 		// ref_type_averages_diameter	text NULL	Término - numisdata656
	// 		// ref_type_averages_weight	text NULL	Término - numisdata656
	// 		// ref_type_total_diameter_items	text NULL	Término - numisdata656
	// 		// ref_type_total_weight_items	text NULL	Término - numisdata656
	// 		// ref_type_design_obverse_data	text NULL	Término - numisdata656
	// 		// ref_type_design_obverse	text NULL	Término - numisdata656
	// 		// ref_type_design_reverse_data	text NULL	Término - numisdata656
	// 		// ref_type_design_reverse	text NULL	Término - numisdata656
	// 		// ref_type_legend_obverse_data	text NULL	Término - numisdata656
	// 		// ref_type_legend_obverse	text NULL	Término - numisdata656
	// 		// ref_type_legend_reverse_data	text NULL	Término - numisdata656
	// 		// ref_type_legend_reverse	text NULL	Término - numisdata656
	// 		// ref_type_symbol_obverse_data	text NULL	Término - numisdata656
	// 		// ref_type_symbol_obverse	text NULL	Término - numisdata656
	// 		// ref_type_symbol_reverse_data	text NULL	Término - numisdata656
	// 		// ref_type_symbol_reverse	text NULL	Término - numisdata656
	// 		// ref_type_equivalents_data	text NULL	Término - numisdata656
	// 		// ref_type_equivalents	text NULL	Término - numisdata656
	// 		// ref_coins_image_obverse_data	text NULL	Portal inverso tipo - numisdata679
	// 		// ref_coins_image_obverse	text NULL	Portal inverso tipo - numisdata679
	// 		// ref_coins_image_reverse_data	text NULL	Portal inverso tipo - numisdata679
	// 		// ref_coins_image_reverse	text NULL	Portal inverso tipo - numisdata679
	// 		// ref_coins_collection_data	text NULL	Portal inverso tipo - numisdata679
	// 		// ref_coins_collection	text NULL	Portal inverso tipo - numisdata679
	// 		// ref_coins_auction_data	text NULL	Portal inverso tipo - numisdata679
	// 		// ref_coins_auction	text NULL	Portal inverso tipo - numisdata679
	// 		// dd_tm	int(12) unsigned NULL	Última publicación usuario - dd1225
	//
	// 	#
	// 	# Filter
	// 	$filter = null;
	//
	// 	// base filter
	// 		// $filter_items = [];
	// 		// $filter_items[] = 'term_table=\'mints\'';
	// 		// $filter_items[] = 'parents LIKE \'%"2203"%\'';
	//
	// 		// $filter = implode(' OR ', $filter_items);
	//
	// 	// portal custom
	// 		// $portals_custom = [
	// 		// 	'parents' => 'catalog'
	// 		// ];
	//
	//
	// 	if ($options->ar_query) {
	//
	// 		// operator
	// 			$operator = ($options->operator==='AND')
	// 				? 'AND'
	// 				: 'OR';
	//
	// 		$ar_filter = [];
	// 		foreach ($options->ar_query as $key => $value_obj) {
	//
	// 			switch ($value_obj->name) {
	//
	// 				case 'section_id':
	// 					$ar_filter[] = '`'.$value_obj->name.'` = '.(int)$value_obj->value;
	// 					// detail info
	// 					// $portals_custom = [
	// 					// 	'bibliography_data' => 'bibliographic_references' // publications
	// 					// ];
	// 					break;
	//
	// 				default:
	// 					// scape
	// 					$value 		 = self::escape_value($value_obj->value);
	// 					$ar_filter[] = '`'.$value_obj->name."` LIKE '%".$value."%'";
	// 					break;
	// 			}
	// 		}
	// 		$filter = implode(' '.$operator.' ', $ar_filter);
	// 	}
	// 	if(SHOW_DEBUG===true) {
	// 		debug_log(__METHOD__." filter ".to_string($filter), 'DEBUG');
	// 	}
	//
	//
	// 	$ar_fields = ['*'];
	//
	// 	# Search
	// 	$rows_options = new stdClass();
	// 		$rows_options->dedalo_get 				= 'records';
	// 		$rows_options->table  	 				= 'coins';
	// 		$rows_options->ar_fields  				= $ar_fields;
	// 		$rows_options->lang  	 				= WEB_CURRENT_LANG_CODE;
	// 		$rows_options->limit 					= 1000;//(int)$options->limit;
	// 		$rows_options->offset 					= $options->offset;
	// 		$rows_options->count 					= empty($options->total) ? true : false; // $options->count;
	// 		// $rows_options->total 				= $options->total;
	// 		$rows_options->order 					= $options->order;
	// 		$rows_options->sql_filter 				= $filter;
	// 		// $rows_options->use_union  			= $use_union ?? false;
	// 		$rows_options->resolve_portals_custom 	= isset($portals_custom) ? $portals_custom : false;
	//
	// 	# Http request in php to the API
	// 	$web_data = json_web_data::get_data($rows_options);
	// 		#dump($web_data, ' web_data ++ '.to_string());
	//
	//
	// 	$ar_result = $web_data;
	//
	//
	// 	return $ar_result;
	// }//end search_catalog
	//
	//
	//
	// /**
	// * ESCAPE_VALUE
	// * @return
	// */
	// public static function escape_value($value) {
	//
	// 	$value = trim($value);
	//
	// 	// if (function_exists('mb_ereg_replace'))
	// 	// {
	// 	//     function mb_escape(string $string)
	// 	//     {
	// 	//         return mb_ereg_replace('[\x00\x0A\x0D\x1A\x22\x25\x27\x5C\x5F]', '\\\0', $string);
	// 	//     }
	// 	// } else {
	// 	//     function mb_escape(string $string)
	// 	//     {
	// 	//         return preg_replace('~[\x00\x0A\x0D\x1A\x22\x25\x27\x5C\x5F]~u', '\\\$0', $string);
	// 	//     }
	// 	// }
	// 	// #$value = mb_escape($value);
	//
	// 	$value = str_replace("'", "''", $value);
	//
	//
	// 	return $value;
	// }//end escape_value
	//
	//
	// /**
	// * GET_ROW_DATA
	// * @return
	// */
	// public static function get_row_data($section_id) {
	//
	// 	$ar_calls = [];
	//
	// 	// catalog table search
	// 		$ar_fields = ['*'];
	//
	// 		$portals_custom = [
	// 			// 'bibliography_data' => 'bibliographic_references', // publications
	// 			// 'bibliography_data.items_data' => 'publications'
	// 		];
	//
	// 		$filter = 'section_id=' . (int)$section_id;
	//
	// 		# Search
	// 		$rows_options = new stdClass();
	// 			$rows_options->dedalo_get 				= 'records';
	// 			$rows_options->table  	 				= 'catalog';
	// 			$rows_options->ar_fields  				= $ar_fields;
	// 			$rows_options->lang  	 				= WEB_CURRENT_LANG_CODE;
	// 			$rows_options->limit 					= 1;
	// 			$rows_options->offset 					= 0;
	// 			$rows_options->count 					= false;
	// 			$rows_options->sql_filter 				= $filter;
	// 			$rows_options->resolve_portals_custom 	= $portals_custom;
	//
	// 		$call = new stdClass();
	// 			$call->id 		= 'mint';
	// 			$call->options 	= $rows_options;
	// 		$ar_calls[] = $call;
	//
	// 	// // types table search
	// 	// 	$types_rows_options = new stdClass();
	// 	// 		$types_rows_options->dedalo_get 			= 'records';
	// 	// 		$types_rows_options->table  	 			= 'types';
	// 	// 		$types_rows_options->ar_fields  			= '*';
	// 	// 		$types_rows_options->lang  	 				= WEB_CURRENT_LANG_CODE;
	// 	// 		$types_rows_options->limit 					= 2000;
	// 	// 		$types_rows_options->offset 				= 0;
	// 	// 		$types_rows_options->count 					= false;
	// 	// 		$types_rows_options->sql_filter 			= 'mint_data LIKE \'%"'.$section_id.'"%\'';
	//
	// 	// 	$call = new stdClass();
	// 	// 		$call->id 		= 'types';
	// 	// 		$call->options 	= $types_rows_options;
	// 	// 	$ar_calls[] = $call;
	//
	// 	// call to api
	// 		$options = new stdClass();
	// 			$options->dedalo_get 	= 'combi';
	// 			$options->ar_calls 		= $ar_calls;
	// 		# Http request in php to the API
	// 		$response = json_web_data::get_data($options);
	// 			#dump($response, ' response ++ '.to_string());
	//
	//
	// 	return $response;
	// }//end get_row_data
	//


}//end class
