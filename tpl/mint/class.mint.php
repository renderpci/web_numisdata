<?php
/**
* MINTS
*
*/
class mints {



	/**
	* SEARCH_MINTS
	* @return array $ar_result
	*/
	public static function search_mints($request_options) {

		$options = new stdClass();
			$options->ar_query 	= [];
			$options->limit 	= 10;
			// pagination
			$options->offset 	= 0;
			$options->count 	= true;
			$options->operator 	= 'or';
			$options->total 	= false;
			$options->order 	= 'section_id ASC';
			foreach ($request_options as $key => $value) {if (property_exists($options, $key)) $options->$key = $value;}


		#
		# Filter
		$filter = null;
		if ($options->ar_query) {

			// operator
				$operator = ($options->operator==='AND')
					? 'AND'
					: 'OR';

			$ar_filter = [];
			foreach ($options->ar_query as $key => $value_obj) {

				switch ($value_obj->name) {

					case 'section_id':
						$ar_filter[] = '`'.$value_obj->name.'` = '.(int)$value_obj->value;
						break;

					default:
						// scape
						$value 		 = self::escape_value($value_obj->value);
						$ar_filter[] = '`'.$value_obj->name."` LIKE '%".$value."%'";
						break;
				}
			}
			$filter = implode(' '.$operator.' ', $ar_filter);
		}
		if(SHOW_DEBUG===true) {
			debug_log(__METHOD__." filter ".to_string($filter), 'DEBUG');
		}

		$ar_fields = [
			'section_id', // int(12) unsigned NULL	Campo creado automáticamente para guardar section_id (sin correspondencia en estructura)
			'lang', // 	varchar(8) NULL	Campo creado automáticamente para guardar el idioma (sin correspondencia en estructura)
			'name',	//	text NULL	Ceca - numisdata16
			'place_data',	//	text NULL	Localización - numisdata585
			'place',	//	text NULL	Localización - numisdata585
			'history',	//	text NULL	Historia - numisdata18
			'numismatic_comments',	//	text NULL	Comentario numismático - numisdata17
			'bibliography_data',	//	text NULL	Bibliografía - numisdata163
			'map' // text NULL	Mapa - numisdata264
		];

		$portals_custom = [
			'bibliography_data' => 'publications'
		];

		# Search
		$rows_options = new stdClass();
			$rows_options->dedalo_get 				= 'records';
			$rows_options->table  	 				= 'mints';
			$rows_options->ar_fields  				= $ar_fields;
			$rows_options->lang  	 				= WEB_CURRENT_LANG_CODE;
			$rows_options->limit 					= (int)$options->limit;
			$rows_options->offset 					= $options->offset;
			$rows_options->count 					= empty($options->total) ? true : false; // $options->count;
			// $rows_options->total 				= $options->total;
			$rows_options->order 					= $options->order;
			$rows_options->sql_filter 				= $filter;
			// $rows_options->use_union  			= $use_union ?? false;
			// $rows_options->resolve_portals_custom 	= $portals_custom;

		# Http request in php to the API
		$web_data = json_web_data::get_data($rows_options);
			// dump($web_data, ' web_data ++ '.to_string());


		$ar_result = $web_data;


		return $ar_result;
	}//end search_mints



	/**
	* ESCAPE_VALUE
	* @return
	*/
	public static function escape_value($value) {

		$value = trim($value);

		// if (function_exists('mb_ereg_replace'))
		// {
		//     function mb_escape(string $string)
		//     {
		//         return mb_ereg_replace('[\x00\x0A\x0D\x1A\x22\x25\x27\x5C\x5F]', '\\\0', $string);
		//     }
		// } else {
		//     function mb_escape(string $string)
		//     {
		//         return preg_replace('~[\x00\x0A\x0D\x1A\x22\x25\x27\x5C\x5F]~u', '\\\$0', $string);
		//     }
		// }
		// #$value = mb_escape($value);

		$value = str_replace("'", "''", $value);


		return $value;
	}//end escape_value



}//end class
