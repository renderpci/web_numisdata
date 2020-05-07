<?php
/**
* TYPE
*
*/
class type {



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
			// mint_data	text NULL	Ceca - numisdata30
			// mint	text NULL	Ceca - numisdata30
			// number	text NULL	Número - numisdata27
			// catalogue_data	text NULL	Catálogo - numisdata309
			// catalogue	text NULL	Catálogo - numisdata309
			// creators_data	text NULL	Creadores - numisdata261
			// creators	text NULL	Creadores - numisdata261
			// date	text NULL	Fecha - numisdata35
			// material_data	text NULL	Material - numisdata32
			// material	text NULL	Material - numisdata32
			// denomination_data	text NULL	Denominación - numisdata34
			// denomination	text NULL	Denominación - numisdata34
			// averages_diameter	text NULL	Promedios - numisdata595
			// averages_weight	text NULL	Promedios - numisdata595
			// design_obverse_data	text NULL	Diseño anverso - numisdata39
			// design_obverse	text NULL	Diseño anverso - numisdata39
			// design_reversse_data	text NULL	Diseño reverso - numisdata70
			// design_reverse	text NULL	Diseño reverso - numisdata70
			// legend_obverse_data	text NULL	Leyenda anverso - numisdata40
			// legend_obverse	text NULL	Leyenda anverso - numisdata40
			// legend_reverse_data	text NULL	Leyenda reverso - numisdata71
			// legend_reverse	text NULL	Leyenda reverso - numisdata71
			// symbol_obverse_data	text NULL	Símbolo anverso - numisdata60
			// symbol_obverse	text NULL	Símbolo anverso - numisdata60
			// symbol_reverse_data	text NULL	Símbolo reverso - numisdata72
			// symbol_reverse	text NULL	Símbolo reverso - numisdata72
			// public_info	text NULL	Información pública - numisdata80
			// equivalents_data	text NULL	Términos equivalentes - numisdata36
			// equivalents	text NULL	Términos equivalentes - numisdata36
			// bibliography_data	text NULL	Bibliografía - numisdata75
			// bibliography	text NULL	Bibliografía - numisdata75
			// coins	text NULL	Monedas ordenadas - numisdata11
			// dd_relations	text NULL	Listado de relaciones - numisdata577
			// dd_tm	int(12) unsigned NULL	Última publicación usuario - dd1225
			
		// mints table search
			$ar_fields = ['*'];

			$portals_custom = [
				'coins' => 'coins',
				'coins.images_obverse' => 'images',
				'coins.images_reverse' => 'images'
			];

			$filter = 'section_id=' . (int)$section_id;		

			# Search
			$rows_options = new stdClass();
				$rows_options->dedalo_get 				= 'records';
				$rows_options->table  	 				= 'types';
				$rows_options->ar_fields  				= $ar_fields;
				$rows_options->lang  	 				= WEB_CURRENT_LANG_CODE;
				$rows_options->limit 					= 1;
				$rows_options->offset 					= 0;
				$rows_options->count 					= false;
				$rows_options->sql_filter 				= $filter;
				$rows_options->resolve_portals_custom 	= $portals_custom;

			$call = new stdClass();
				$call->id 		= 'type';
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
