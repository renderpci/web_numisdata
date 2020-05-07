<?php
/**
* COIN
*
*/
class coin {



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
			// type_data	text NULL	Tipo - numisdata161
			// type	text NULL	Tipo - numisdata161
			// weight	varchar(32) NULL	Peso - numisdata133
			// diameter	varchar(32) NULL	Diámetro - numisdata135
			// dies	varchar(32) NULL	Cuños - numisdata134
			// peculiarity_production	text NULL	Peculiaridad de producción - numisdata152
			// secondary_treatment	text NULL	Peculiaridad de producción - numisdata152
			// countermark_obverse	text NULL	Contramarca anverso - numisdata154
			// countermark_reverse	text NULL	Contramarca reverso - numisdata197
			// hoard_data	text NULL	Tesoro - numisdata148
			// hoard	text NULL	Tesoro - numisdata148
			// find_type	text NULL	Tipo de hallazgo - numisdata473
			// findspot	text NULL	Lugar de hallazgo - numisdata282
			// find_date	varchar(32) NULL	Fecha de hallazgo - numisdata491
			// collection_data	text NULL	Colección - numisdata159
			// collection	text NULL	Colección - numisdata159
			// former_collection_data	text NULL	Fondo - numisdata381
			// former_collection	text NULL	Fondo - numisdata381
			// number	varchar(32) NULL	Número - numisdata151
			// uri	text NULL	URI - numisdata275
			// auction_data	text NULL	Subasta - numisdata147
			// auction	text NULL	Subasta - numisdata147
			// public_info	text NULL	Información pública - numisdata150
			// bibliography_data	text NULL	Bibliografía - numisdata162
			// images_obverse	text NULL	Anverso - numisdata164
			// images_reverse	text NULL	Reverso - numisdata165
			// dd_relations	text NULL	Listado de relaciones - numisdata578
			// dd_tm	int(12) unsigned NULL	Última publicación usuario - dd1225
			
		// mints table search
			$ar_fields = ['*'];

			$portals_custom = [
				'type_data'			=> 'types',
				'images_obverse'	=> 'images',
				'images_reverse'	=> 'images'
			];

			$filter = 'section_id=' . (int)$section_id;		

			# Search
			$rows_options = new stdClass();
				$rows_options->dedalo_get 				= 'records';
				$rows_options->table  	 				= 'coins';
				$rows_options->ar_fields  				= $ar_fields;
				$rows_options->lang  	 				= WEB_CURRENT_LANG_CODE;
				$rows_options->limit 					= 1;
				$rows_options->offset 					= 0;
				$rows_options->count 					= false;
				$rows_options->sql_filter 				= $filter;
				$rows_options->resolve_portals_custom 	= $portals_custom;

			$call = new stdClass();
				$call->id 		= 'coin';
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
