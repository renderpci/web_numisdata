<?php

// thesaurus


	// page basic vars
		$title 			= $this->get_element_from_template_map('title', $template_map->{$mode});
		$abstract  		= $this->get_element_from_template_map('abstract', $template_map->{$mode});
		$body  			= $this->get_element_from_template_map('body', $template_map->{$mode});
		$ar_image  		= $this->get_element_from_template_map('image', $template_map->{$mode});


	// body images fix url paths
		$body = str_replace('../../../media', __WEB_BASE_URL__ . '/dedalo/media', $body);


	// area name
		$area_name 	= $_GET['area_name'];
		$ar_parts 	= explode('/', $area_name);


	// term_id (is inside get var 'area_name' as '/thesaurus/technique1_92')
		$term_id = isset($ar_parts[1])
			? $ar_parts[1]
			: null;


	// thesaurus_options
		// Epigraphy : ts_northern_palaeohispanic,ts_south_palaeohispanic,ts_southern_palaeohispanic,ts_greek,ts_latin,ts_punic,ts_symbols,ts_countermarks
		// DES
			// 'ts_countermarks',
			// 'ts_greek',
			// 'ts_latin',
			// 'ts_northern_palaeohispanic',
			// 'ts_south_palaeohispanic',
			// 'ts_southern_palaeohispanic',
			// 'ts_punic',
			// ---------------
			// 'sccmk1_1',
			// 'scell1_1',
			// 'sclat1_1',
			// 'scxibo1_1',
			// 'sctxr1_1',
			// 'scxibm1_1',
			// 'scxpu1_1',

	// thesaurus_options
		// $thesaurus_options = (object)[
		// 	'table'	=> [
		// 		'ts_find_context',
		// 		'ts_culture',
		// 		'ts_iconography',
		// 		'ts_numismatic_group',
		// 		'ts_period',
		// 		'ts_territories',
		// 		'ts_theme',
		// 		'ts_semantic_relations'
		// 	],
		// 	'root_term'	=> [
		// 		'cont1_1',
		// 		'cult1_23',
		// 		'icon1_1',
		// 		'grup1_24',
		// 		'peri1_187',
		// 		'terr1_186',
		// 		'tema1_1',
		// 		'ds1_46'
		// 	],
		// 	'term_id' => $term_id // options request term_id add
		// ];


	// ar_fields
		$ar_fields = [
			'section_id',
			'term_id',
			'term',
			'children',
			'code',
			'dd_relations',
			'descriptor',
			'illustration',
			'indexation',
			'model',
			'norder',
			'parent',
			'related',
			'scope_note',
			'space',
			'time',
			'tld',
			'mib_bibliography'
			// 'relations'
		];


	// switch by area_name (in url)
		switch ($area_name) {

			case 'symbols':
				$thesaurus_options = (object)[
					'table'	=> [
						'ts_symbols'
					],
					'root_term'	=> [
						'scsym1_1'
					],
					'term_id' => $term_id, // options request term_id add
					'ar_fields' => $ar_fields
				];
				break;

			case 'iconography':
				$thesaurus_options = (object)[
					'table'	=> [
						'ts_iconography'
					],
					'root_term'	=> [
						'icon1_1'
					],
					'term_id' => $term_id, // options request term_id add
					'ar_fields' => $ar_fields
				];
				break;

			case 'countermarks':
				$thesaurus_options = (object)[
					'table'	=> [
						'ts_countermarks'
					],
					'root_term'	=> [
						'sccmk1_1'
					],
					'term_id' => $term_id, // options request term_id add
					'ar_fields' => $ar_fields
				];
				break;

			case 'mints_hierarchy':
			default:
				$thesaurus_options = (object)[
					'table'	=> [
						'catalog'
					],
					'root_term'	=> [
						// 'numisdata665_1151',
						// '1151',
						// '1675',
						// '1152',
						// '1153',
						// '1328',
						// '2856',
						// '3646',
						// '6524'
					],
					'term_id' => $term_id, // options request term_id add
					'ar_fields' => [
						'section_id',
						'term_id',
						'term',
						'children_term_id AS children',
						// 'code',
						// 'dd_relations',
						// 'descriptor',
						// 'illustration',
						// 'indexation',
						// 'model',
						'norder',
						'parent_term_id AS parent',
						'parents', // (!) mandatory to search parent later
						'term_table',
						'term_data',
						// 'related',
						// 'scope_note',
						// 'space',
						// 'time',
						// 'tld',
						// 'mib_bibliography'
						// 'relations'
					]
				];
				// dynamic root_term
					$options = new stdClass();
						$options->dedalo_get 	= 'records';
						$options->table  	 	= 'catalog';
						$options->ar_fields  	= ['term_id'];
						$options->lang  	 	= WEB_CURRENT_LANG_CODE;
						$options->limit 		= 0;
						$options->sql_filter 	= 'parent_term_id = \'["hierarchy1_262"]\'';
					# Http request in php to the API
					$web_data = json_web_data::get_data($options);
						// dump($web_data, ' web_data ++ '.to_string());
					$root_term = array_map(function($el){
						return $el->term_id;
					}, $web_data->result);
						// dump($root_term , '$root_term  ++ '.to_string());
					$thesaurus_options->root_term = $root_term;
				break;
		}


