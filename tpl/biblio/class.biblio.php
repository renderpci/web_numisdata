<?php 
/**
* BIBLIO
*
*/
class biblio {



	/**
	* SEARCH_BIBLIO
	* @return array $ar_result
	*/
	public static function search_biblio($request_options) {
		
		$options = new stdClass();
			$options->ar_query 	= [];
			$options->limit 	= 10;
			// pagination
			$options->offset 	= 0;
			$options->count 	= true;
			$options->operator 	= 'or';
			#$options->total 	= false;
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
					
					case 'fecha_publicacion':
						preg_match("/^([0-9]{4})([-\/]([0-9]{1,2}))?([-\/]([0-9]{1,2}))?$/", $value_obj->value, $output_array);
						$year  	= isset($output_array[1]) ? $output_array[1] : false;
						$month 	= false;
						$day 	= false;

						if (isset($output_array[3]) && isset($output_array[5])) {
							$month = $output_array[3];
							$day   = $output_array[5];							
						}else if (isset($output_array[3]) && !isset($output_array[5])) {
							$month = $output_array[3];
						}						
						if (empty($year)) {							
							debug_log(__METHOD__." Invalid date. Ignored! ".to_string($value_obj->value), 'DEBUG');
							break;
						}else{
							if (!empty($month) && !empty($day)) {
								$ar_filter[] = '`fecha_publicacion` = \''.sprintf("%04d", $year).'-'.sprintf("%02d", $month).'-'.sprintf("%02d", $day).'\'';
							}else if(!empty($month)) {
								$ar_filter[] = '(YEAR(fecha_publicacion) = \''.$year.'\' AND MONTH(fecha_publicacion) = \''.$month.'\')';
							}else{
								$ar_filter[] = 'YEAR(fecha_publicacion) = \''.$year.'\'';
							}
						}
						#debug_log(__METHOD__." year:$year, month:$month, day:$day ".to_string(), 'DEBUG');
						break;

					case 'section_id':
						$ar_filter[] = '`'.$value_obj->name.'` = '.(int)$value_obj->value;
						break;

					default:
						// scape
						$value = self::escape_value($value_obj->value);
						$ar_filter[] = '`'.$value_obj->name."` LIKE '%".$value."%'";
						#$ar_filter[] = '`'.$value_obj->name."` = '".$value_obj->value."'";											
						break;
				}			
			}
			$filter = implode(' '.$operator.' ', $ar_filter);
		}
		if(SHOW_DEBUG===true) {
			debug_log(__METHOD__." filter ".to_string($filter), 'DEBUG');;
		}		

		# Search		
		$tipos_options = new stdClass();
			$tipos_options->dedalo_get 	= 'records';
			$tipos_options->table  	 	= 'publicaciones';
			$tipos_options->lang  	 	= WEB_CURRENT_LANG_CODE;
			$tipos_options->limit 		= (int)$options->limit;
			$tipos_options->offset 		= $options->offset;
			$tipos_options->count 		= true; // $options->count;
			#$tipos_options->total 		= $options->total;
			$tipos_options->order 		= $options->order;
			$tipos_options->sql_filter 	= $filter;
			$tipos_options->resolve_portals_custom = [
				'autoria_dato' => 'personas'	
			];
			# dump($tipos_options, ' tipos_options ++ '.to_string());
		
		# Http request in php to the API
		$web_data = json_web_data::get_data($tipos_options);
			#dump($web_data, ' web_data ++ '.to_string());


		$ar_result = $web_data;


		return $ar_result;
	}//end search_biblio



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
