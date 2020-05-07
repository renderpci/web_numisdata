<?php
/**
* hoard
*
*/
class hoard {



	/**
	* GET_ROW_DATA
	* @return object $response
	*/
	public static function get_row_data($section_id) {

		$ar_calls = [];

		// TABLE COLUMNS
			// id	int(12) Auto Increment	
			// section_id	int(12) unsigned NULL	Campo creado automáticamente para guardar section_id (sin correspondencia en estructura)
			// lang	varchar(8) NULL	Campo creado automáticamente para guardar el idioma (sin correspondencia en estructura)
			// name	text NULL	Nombre - numisdata211
			// place_data	text NULL	Lugar - numisdata293
			// place	text NULL	Lugar - numisdata293
			// map	text NULL	Mapa - numisdata213
			// public_info	text NULL	Información pública - numisdata140
			// link	text NULL	URL - numisdata215
			// bibliography_data	text NULL	Bibliografía - numisdata220
			// coins_data	text NULL	Monedas - numisdata322
			// dd_relations	text NULL	Listado de relaciones - numisdata579
			// dd_tm	int(12) unsigned NULL	Última publicación usuario - dd1225
			
		// mints table search
			$ar_fields = ['*'];

			$portals_custom = [
				'coins_data' => 'coins'
			];

			$filter = 'section_id=' . (int)$section_id;		

			# Search
			$rows_options = new stdClass();
				$rows_options->dedalo_get 				= 'records';
				$rows_options->table  	 				= 'hoards';
				$rows_options->ar_fields  				= $ar_fields;
				$rows_options->lang  	 				= WEB_CURRENT_LANG_CODE;
				$rows_options->limit 					= 1;
				$rows_options->offset 					= 0;
				$rows_options->count 					= false;
				$rows_options->sql_filter 				= $filter;
				$rows_options->resolve_portals_custom 	= $portals_custom;

			$call = new stdClass();
				$call->id 		= 'hoard';
				$call->options 	= $rows_options;
			$ar_calls[] = $call;

		// // types table search		
		// 	$types_rows_options = new stdClass();
		// 		$types_rows_options->dedalo_get 			= 'records';
		// 		$types_rows_options->table  	 			= 'types';
		// 		$types_rows_options->ar_fields  			= '*';
		// 		$types_rows_options->lang  	 				= WEB_CURRENT_LANG_CODE;
		// 		$types_rows_options->limit 					= 2000;
		// 		$types_rows_options->offset 				= 0;
		// 		$types_rows_options->count 					= false;
		// 		$types_rows_options->sql_filter 			= 'mint_data LIKE \'%"'.$section_id.'"%\'';	

		// 	$call = new stdClass();
		// 		$call->id 		= 'types';
		// 		$call->options 	= $types_rows_options;
		// 	$ar_calls[] = $call;			

		// call to api
			$options = new stdClass();
				$options->dedalo_get 	= 'combi';
				$options->ar_calls 		= $ar_calls;
			# Http request in php to the API
			$response = json_web_data::get_data($options);
				// dump($response, ' response ++ '.to_string());
		

		return $response;
	}//end get_row_data



}//end class
