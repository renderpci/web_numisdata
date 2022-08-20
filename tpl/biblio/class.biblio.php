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
		$filter				= null;
		$q_transcription	= null;
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

						$q_transcription = $value_obj->value;
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

		// $ar_fields = [
		// 	'section_id',
		// 	'lang',
		// 	'title',
		// 	'authors',
		// 	'authors_data',
		// 	'authors_count',
		// 	'author_main',
		// 	'author_others',
		// 	'publication_date',
		// 	'typology',
		// 	'magazine',
		// 	'serie',
		// 	'physical_description',
		// 	'title_secondary',
		// 	'title_colective',
		// 	'authors_secondary',
		// 	'other_people',
		// 	'place',
		// 	'editor',
		// 	'url_data',
		// 	'pdf',
		// 	'pdf_uri',
		// 	'descriptors',
		// 	// 'volume',
		// 	'other_people_full_names',
		// 	'other_people_full_roles',
		// 	'transcription'
		// ];
		$ar_fields = ['*'];

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

		// fragments add
			if (!empty($web_data->result)) {
				foreach ($web_data->result as $key => $row) {

					$transcription = $row->transcription;

					if (!empty($q_transcription)) {

						$options = new stdClass();
							$options->texto			= $transcription;
							$options->busqueda		= $q_transcription;
							$options->nCaracteres	= 500;
							$options->n_occurrences	= 10; // Only first occurrence for now

						$ar_fragment_data = (array)self::build_fragment($options);
							// dump($ar_fragment_data, ' ar_fragment_data 2');

						$row->transcription = $ar_fragment_data;

					}else{

						$row->transcription = [];
					}
				}
			}


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


	# CREAR FRAGMENTO	/*
	# Crea fragmento con la palabra resaltada. V2
	# Devuelve array con el fragmento y los tesauros asociados a el :
	# $fragmentoPalabraArray['fragm']	y $fragmentoPalabraArray['tesauroArray']
	public static function build_fragment( stdClass $request_options ) {

		$options = new stdClass();
			$options->texto			= (string)'';
			$options->busqueda		= (string)'';
			$options->nCaracteres	= (int)256; // Default 256
			$options->n_occurrences	= (int)1; // Only first occurrence for now

			foreach ($request_options as $key => $value) {
				if (property_exists($options, $key)) {
					$options->$key = $value;
				}
			}
			#dump($options, ' options');

		$texto			= $options->texto;
		$busqueda		= $options->busqueda;
		$nCaracteres	= $options->nCaracteres;
		$n_occurrences	= $options->n_occurrences;

		$fragmentoPalabraArray 			= array();	#echo " $texto, $busqueda,$reelID,$modo,$nCaracteres<br>";
		$buscar_solo_primera_aparicion 	= false;

		# texto sin tocar (con los tc, indices y demás) Luego lo usaremos para sacar los indices y tesauros asociados
		$textoRaw = $texto;

		# Limpieza de texto (eliminar TC's, etc..) dejamos los indices
		#$texto = limpiezaFragmentoSearch($texto);
		$texto = self::delete_marks($texto);

		# clean $busqueda
		$busqueda 	= self::clean_search_string($busqueda);
			#dump($busqueda, ' busqueda');

		$palabraArray = (array)explode(' ',$busqueda); # Always is array ..
			#dump($palabraArray, ' palabraArray');

		foreach($palabraArray as $key => $palabra_current) {

			$palabra_current=trim($palabra_current);

			# Si es un literal
			$pre = substr($busqueda,0,1);
			$pos = substr($busqueda,-1);
			if( ($pre=='"' || $pre=='\'') && ($pos=='"' || $pos=='\'') ) {
				# eliminamos las comillas
				$palabra_current = substr($busqueda,1); 			# la inicial
				$palabra_current = substr($palabra_current,0,-1); 	# la final
			}

			# Si es un literal 2
			$pre = substr($palabra_current,0,1);
			$pos = substr($palabra_current,-1);
			if( ($pre=='"' || $pre=='\'') && ($pos=='"' || $pos=='\'') ) {
				$palabra_current = substr($palabra_current,1); 		# la inicial
				$palabra_current = substr($palabra_current,0,-1); 	# la final
				$palabra_current = '\b'.$palabra_current.'\b';		# add /b for create regex (\b = Any word boundary)
			}

			# La convertimos en un patrón insensible a los acentos
			$palabraPattern = self::palabra2pattern($palabra_current);
				#dump($palabraPattern, ' palabraPattern'.to_string());
			#mb_internal_encoding('UTF-8');

			# utf problem . Como PHP no gestiona bién el texto multbyte, lo convertimos a ISO8859-1 para trabajar y al final lo recodificamos como UTF-8
			$palabraPattern	= utf8_decode($palabraPattern);
			$texto			= utf8_decode($texto);

			# Localizamos todas las apariciones de la palabra  [NO MULTIBYTE SUPPORT!!!]
			$apariciones = preg_match_all($palabraPattern, $texto, $matches, PREG_OFFSET_CAPTURE);
				#dump($matches, ' matches'.to_string($palabraPattern));

			$i=0;
			if(is_array($matches[0])) foreach($matches[0] as $key => $ar_data) {

				if ($i>=$n_occurrences) {
				 	break;	// Limit number of events / occurrences
				 }

				$palabraPos = $ar_data[1];
					#dump($palabraPos, ' palabraPos');

				# Definimos la longitud del fragmento a mostrar
				$out	= $nCaracteres ;
				$in		= intval( $palabraPos - ($out/2) );   if( $in<0 ) $in = 0;

				#
				# PAGE NUMBER
				# Buscamos la etiqueta de página anterior a la coincidencia
					$subject 		= substr($texto, 0, $palabraPos);
					$previous_page 	= '[page-n-1]'; // Default page is 1 ([page-n-1])
					if(preg_match_all("/\[page-[a-z]-[0-9]{1,6}\]/", $subject, $matches)) {
					    $previous_page = $matches[0][count($matches[0])-1];
					}
					preg_match("/\[page-[a-z]-([0-9]{1,6})\]/", $previous_page, $output_array);
					$page_number = isset($output_array[1]) ? (int)$output_array[1] : 1 ; // Like 2 (default is 1)
					#dump($previous_page, ' previous_page from '.$subject);


				# ajuste no multibyte cut. Seleccionamos un fragmento previo para no trabajar con el texto completo, y damos un margen para hacer el corte final multibyte
				$ajusteNchar	= 10+50 ;
				$in				= intval($in  - $ajusteNchar);	if ($in <0 ) $in = 0;
				$out			= intval($out + $ajusteNchar);

				# fragmento preliminar NO multibyte cut
				$fragm = $texto;

				# Cortamos el text para crear el fragmento
				$fragm = '.. '. substr($fragm, $in, $out) .' ..';
				#$fragm 				= self::truncate_text(substr($fragm, $in, $out), $nCaracteres, $break=" ", $pad="...");

				# Resaltamos las coincidencias con negrita
				#$fragm 				= preg_replace($palabraPattern, '<h3>$1</h3>', $fragm);
				$count = 0;
				$fragm = preg_replace($palabraPattern, '<mark>$1</mark>', $fragm, 1, $count);  // Only first

					if ($count<1) {
						#dump($fragm, ' $fragm');
						#continue;	// Exclude not found pattern
					}
					#dump($fragm, ' fragm');

				# recodificamos como UTF-8 el fragmento
				$fragm = utf8_encode($fragm);


				# Preparamos el texto excluyendo etiquetas y limpiándolo
				$fragm = self::limpiezaFragmentoEnListados($fragm);


				# Encapsulamos en un array los resultados
				$fragment_obj = new stdClass();
					$fragment_obj->page_number	= $page_number;
					$fragment_obj->fragm		= $fragm;	//self::limpiezaFragmentoEnListados($fragm);


				#$fragmentoPalabraArray[$palabra_current]['fragm'][] = $fragm;
				$fragmentoPalabraArray[$palabra_current][] = $fragment_obj;

				$i++;
			}//end if(is_array($matches[0])) foreach($matches[0] as $key => $ar_data) {


		}#if(is_array($palabraArray)) foreach($palabraArray as $key => $palabra_current)

		return (array)$fragmentoPalabraArray;
	}//end fin build_fragment



	/**
	* DELETE_MARKS
	* @return string $text
	*/
	public static function delete_marks( $text ) {

		return trim($text);
	}//end delete_marks



	/**
	* LIMPIEZAFRAGMENTOENLISTADOS
	* @return string $fragmento
	*/
	public static function limpiezaFragmentoEnListados( $fragmento, $leght=null ) {

		# Remove page tag like '[page-n-3]'
		if(SHOW_DEBUG) {

		}else{

		}
		$fragmento = preg_replace("/\[page-[a-z]-[0-9]{1,6}\]/", "", $fragmento);

		#$fragmento = nl2br($fragmento);
		#$fragmento = strip_tags($fragmento,'<br>');

		# Replace double page break for single
		$fragmento = str_replace(array("  "), array(" "), $fragmento);
		$fragmento = str_replace(array("\n\n","\n \n","\n\t\n"), "\n", $fragmento);
		$fragmento = str_replace(array(".. <br>","<br>..",".. br />","..br />",".. />","../>",".. >","..>",".. /",".. r />",".. r>","<br ..","<br..","<b ..","<b..","<.."), "..", $fragmento);

		$fragmento = str_replace(array("\t","\n","<br />","<br><br>"), array("<br>"), $fragmento);
		#$fragmento = preg_replace("/\n\t\n/", "+", $fragmento);

		return $fragmento;
	}//end limpiezaFragmentoEnListados



	/**
	* CLEAN_SEARCH_STRING
	* @return string $search_string
	*/
	public static function clean_search_string( $search_string ) {
		$search_string = trim($search_string);

		$search_string = str_replace("'", '"', $search_string);	// Simple ' are not allowed

		return $search_string;
	}//end clean_search_string



	/**
	* PALABRA2PATTERN
	* @return string | false $result
	*/
	public static function palabra2pattern( $palabra ) {
		$result = false;

		$search	= array("/a|á|à|ä/i",
						"/e|é|è|ë/i",
						"/i|í|ì|ï/i",
						"/o|ó|ò|ö/i",
						"/u|ú|ù|ü/i",
						"/n|ñ/i"
						) ;
		$repace	= array("[a|á|Á|à|À|ä|Ä]",
						"[e|é|É|è|È|ë|Ë]",
						"[i|í|Í|ì|Ì|ï|Ï]",
						"[o|ó|Ó|ò|Ò|ö|Ö]",
						"[u|ú|Ú|ù|Ù|ü|Ü]",
						"[ñ|Ñ|n|N]"
						) ;

		$pattern = preg_replace($search, $repace, $palabra);

		if($pattern) $result = '/('. $pattern .')/i' ;

		return $result;
	}//end palabra2pattern




}//end class
