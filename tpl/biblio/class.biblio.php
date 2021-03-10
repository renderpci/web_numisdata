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
			$options->ar_query	= [];
			$options->limit		= 20;
			// pagination
			$options->offset	= 0;
			$options->count		= true;
			$options->operator	= 'or';
			$options->total		= false;
			$options->order		= 'section_id ASC';
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

					case 'publication_date':
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
								$ar_filter[] = '`publication_date` = \''.sprintf("%04d", $year).'-'.sprintf("%02d", $month).'-'.sprintf("%02d", $day).'\'';
							}else if(!empty($month)) {
								$ar_filter[] = '(YEAR(publication_date) = \''.$year.'\' AND MONTH(publication_date) = \''.$month.'\')';
							}else{
								$ar_filter[] = 'YEAR(publication_date) = \''.$year.'\'';
							}
						}
						#debug_log(__METHOD__." year:$year, month:$month, day:$day ".to_string(), 'DEBUG');
						break;

					case 'section_id':
						$ar_filter[] = '`'.$value_obj->name.'` = '.(int)$value_obj->value;
						break;

					case 'transcription':
						$ar_filter[] = 'MATCH (`transcription`) AGAINST (\''.$value_obj->value.'\')';
						break;

					// case 'authors999':
					// 	$delimiter  = ' | ';
					// 	$ar_authors = explode($delimiter, $value_obj->value);
					// 	$ar_filter_authors = [];
					// 	foreach ($ar_authors as $a_value) {
					// 		$a_value 	 = self::escape_value($a_value);
					// 		$ar_filter_authors[] = '`'.$value_obj->name."` LIKE '%".$a_value."%'";
					// 	}
					// 	$ar_filter[] = '('. implode(' OR ', $ar_filter_authors).')';
					// 	break;

					default:
						// scape
						$value 		 = self::escape_value($value_obj->value);
						$ar_filter[] = '`'.$value_obj->name."` LIKE '%".$value."%'";

						// if ($value_obj->name==='authors' && strpos($value_obj->value, ' | ')===false) {
						// 	$use_union = true;
						// }
						break;
				}
			}
			$filter = implode(' '.$operator.' ', $ar_filter);
		}
		if(SHOW_DEBUG===true) {
			debug_log(__METHOD__." filter ".to_string($filter), 'DEBUG');
		}

		$ar_fields = [
			'section_id',
			'lang',
			'title',
			'authors',
			'authors_data',
			'authors_count',
			'author_main',
			'author_others',
			'publication_date',
			'typology',
			'magazine',
			'serie',
			'physical_description',
			'title_secondary',
			'authors_secondary',
			'other_people',
			'place',
			'editor',
			'url_data',
			'pdf',
			'pdf_uri',
			'descriptors',
			// 'volume',
			'other_people_name',
			'other_people_role',
			'transcription'
		];

		$portals_custom = [
			'authors_data' => 'other_people'
		];

		# Search
		$rows_options = new stdClass();
			$rows_options->dedalo_get				= 'bibliography_rows'; //	'records';
			$rows_options->table					= 'publications';
			$rows_options->ar_fields				= $ar_fields;
			$rows_options->lang						= WEB_CURRENT_LANG_CODE;
			$rows_options->limit					= (int)$options->limit;
			$rows_options->offset					= $options->offset;
			$rows_options->count					= empty($options->total) ? true : false; // $options->count;
			#$rows_options->total					= $options->total;
			$rows_options->order					= $options->order;
			$rows_options->sql_filter				= $filter;
			$rows_options->use_union				= $use_union ?? false;
			$rows_options->resolve_portals_custom	= $portals_custom;

		# Http request in php to the API
		$web_data = json_web_data::get_data($rows_options);
			// dump($web_data, ' web_data ++ '.to_string());


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
