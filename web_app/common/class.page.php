<?php
/**
* PAGE
* Html page object. Render all pages
*
*/
class page extends stdClass {


	# Version. Important!
	static $version = "1.0.11"; // 06-01-2021

	# css_ar_url : css files to include on render page
	static $css_ar_url = array();

	# JS_AR_URL : js files to include on render page
	static $js_ar_url = array();

	# TEMPLATE_AR_PATH : Templates to include on render page
	static $template_ar_path = array();

	# area_name
	public $area_name = false;

	# area_table
	public $area_table = false;

	# area_section_id
	public $area_section_id;

	# menu_parent
	public $menu_parent = false;

	# row
	public $row = false;

	# main_menu_data
	public $main_menu_data = false;

	# breadcrumb
	public $breadcrumb = false;

	# template_map
	public $template_map = false;

	# page_title
	public $page_title = false;

	# web_fields_map
	static $web_fields_map;

	# status . like 'initied'
	public $status = null;

	# data_combi
	public $data_combi;

	# lang_from_path
	public $lang_from_path;

	# global_page
	public $global_page;

	# term_id
	public $term_id;

	# footer_html
	public $footer_html;

	# menu_tree_html
	public $menu_tree_html;

	# footer_data
	public $footer_data;

	# footer_root
	public $footer_root;

	/**
	* __CONSTRUCT
	* @param object $reference_page
	*	Used to avoid reload know setup data in portal resolutions, etc.
	* @return bool true
	*/
	public function __construct( $reference_page=false ) {

		// web_fields_map set from config
			self::$web_fields_map = json_decode(WEB_FIELDS_MAP);

		// default title
			$this->page_title = 'Untitled';

		// init
			if ($reference_page!==false) {
				// use reference page to get already calculated data. inject data
					$this->data_combi 	= $reference_page->data_combi;
					$this->template_map = (array)$this->get_template_map();

				$this->status = 'initied';
			}

		return true;
	}//end __construct()



	/**
	* INIT
	* @return bool true
	*/
	public function init() {

		if ($this->status==='initied') {
			return false;
		}

		// load page data combi	(templates, menu all)
			$this->get_page_data_combi();

		// set template_map file
			$this->template_map = (array)$this->get_template_map();

		return true;
	}//end init



	/**
	* GET_PAGE_DATA_COMBI
	* @return array $this->data_combi
	*/
	public function get_page_data_combi() {

		$ar_calls = [];

		// templates all
			$options = new stdClass();
				$options->dedalo_get 	= 'records';
				$options->table 		= 'template_map';
				$options->ar_fields 	= array('data','name');
				$options->lang 			= WEB_CURRENT_LANG_CODE;

			$call = new stdClass();
				$call->id 		= 'templates_all';
				$call->options 	= $options;

			$ar_calls[] = $call;

		// menu all
			if (defined('MENU_ALL_OPTIONS')) {
				$options = (object)MENU_ALL_OPTIONS;
			}else{
				$options = new stdClass();
					$options->dedalo_get	= 'records';
					$options->table			= WEB_MENU_TABLE;
					$options->ar_fields		= array_values(get_object_vars(self::$web_fields_map));
					$options->lang			= WEB_CURRENT_LANG_CODE;
					$options->order			= 'norder ASC';
					$options->resolve_portals_custom = (object)[
						'imagen' => 'images'
					];
			}

			$call = new stdClass();
				$call->id 		= 'menu_all';
				$call->options 	= $options;

			$ar_calls[] = $call;

		// record detail. table and section_id is received. We are in a portal link
			if (isset($this->area_section_id) && isset($this->area_table) && !isset($this->lang_from_path)) {

				// http request in php to API
					$options = new stdClass();
						$options->dedalo_get 		= 'records';
						$options->lang 				= WEB_CURRENT_LANG_CODE;
						$options->table 			= $this->area_table;
						$options->ar_fields 		= array('*'); // all fields
						$options->sql_filter 		= "section_id = {$this->area_section_id}";
						$options->limit 			= 1;

					$call = new stdClass();
						$call->id 		= 'record_detail';
						$call->options 	= $options;

					$ar_calls[] = $call;
			}

		// call to api
			$options = new stdClass();
				$options->dedalo_get 	= 'combi';
				$options->ar_calls 		= $ar_calls;
			# Http request in php to the API
			$response = json_web_data::get_data($options);
				// dump($response->result, ' response ++ '.to_string());

		// filter page by config WEB_MENU_PARENT
			# $ar_terms = [];
			# foreach ($response->result[1]->result as $key => $item) {
			# 	// check if current is children on any already added term
			# 	$in_array_ar_terms = array_filter($ar_terms, function($e) use($item){return $e->term_id===$item->parent;});
			# 	if ($item->term_id===WEB_MENU_PARENT || $item->parent===WEB_MENU_PARENT || count($in_array_ar_terms)>0) {
			# 		$ar_terms[] = $item;
			# 	}
			# }
			# $response->result[1]->result = $ar_terms; // overwrite with filtered records


		// fix
			$this->data_combi = $response->result;

		// check combi data
			if (!isset($this->data_combi[0]) || !isset($this->data_combi[0]->result) || !isset($this->data_combi[1]->result)) {
				return false;
			}

		// fix global_page info
			// menu_items
			$menu_items = $this->data_combi[1]->result;
			$global_page = array_find($menu_items, function($item){
				return ($item->term_id===WEB_MENU_PARENT);
			});
			if (!is_object($global_page)) {
				$this->data_combi	= [];
				$this->global_page	= null;
				return $this->data_combi;
			}
			// template_items
			$template_items = $this->data_combi[0]->result;
			$global_template = array_find($template_items, function($item) use($global_page) {
				return ($item->name===$global_page->template_name);
			});
			// set
			$global_page->template	= is_object($global_template) && !empty($global_template->data)
				? json_decode($global_template->data)
				: null;
			$this->global_page		= $global_page;


		return $this->data_combi;
	}//end get_page_data_combi



	/**
	* GET_TEMPLATE_MAP
	# @param string $source
	*	Source from load json data
	* @return array $template_map
	*/
	public function get_template_map( $source=WEB_TEMPLATE_MAP_DEFAULT_SOURCE ) {
		$template_map = array();

		switch ($source) {
			case 'file':
				// Load template_map file
				if (WEB_TEMPLATE_MAP) {
					#$template_map_file  = file_get_contents(WEB_TEMPLATE_MAP);
					#$template_map 		= (array)json_decode($template_map_file);
					foreach (glob(WEB_TEMPLATE_MAP."/*.json") as $file_name) {
						if ($current_template = json_decode(file_get_contents($file_name))) {
							# Contert always to array allow use múltiple maps in a one file/record
							$ar_current_template = is_array($current_template) ? $current_template : array($current_template);
							foreach ($ar_current_template as $element) {
								$template_map[] = $element;
							}
						}
					}
				}
				break;

			case 'db':
			default:
				if (empty($this->data_combi)) {
					exit("Error. Empty page data_combi. API connection seems broken.");
				}

				$data = array_reduce($this->data_combi, function($carry, $item){
					return ($item->id==='templates_all') ? $item : $carry;
				});
				if($data->result!==false) foreach ($data->result as $key => $value) {
					$current_template 	= json_decode($value->data);
					# Convert always to array allow use múltiple maps in a one file/record
					$ar_current_template = is_array($current_template) ? $current_template : array($current_template);
					foreach ($ar_current_template as $element) {
						$template_map[] = $element;
					}
				}
				break;
		}
		#dump($template_map, ' template_map ++ '.to_string());

		return $template_map;
	}//end get_template_map



	/**
	* RENDER_PAGE_HTML
	* Render page
	* @return string $html
	*/
	public function render_page_html( $request_options) {

		$options = new stdClass();
			$options->mode  		= 'detail'; // Default 'detail'
			$options->template_map 	= null;
			#$options->footer_html  = null;
			foreach ($request_options as $key => $value) {if (property_exists($options, $key)) $options->$key = $value;}


		$template_map 	= $options->template_map;
		$mode 			= $options->mode;
		#$page_title 	= $this->get_page_title();

		#$css_links 		= $this->get_header_links('css');
		#$js_links 		= $this->get_header_links('js', ['js_async' => 'defer']);

		ob_start();
		#include ( __WEB_BASE_PATH__ .'/'. WEB_DISPATCH_DIR . '/tpl/'. WEB_ENTITY . '/page/html/page.phtml');
		include ( __WEB_TEMPLATE_PATH__ . '/page/html/page.phtml');
		$html = ob_get_clean();

		return $html;
	}//end render_page_html



	/**
	* SANITIZE_HTML
	* @return string $html
	*/
	public function sanitize_html( $html ) {

		return $html;
	}//end sanitize_html



	/**
	* GET_HEADER_LINKS
	* @return string $html
	*/
	public function get_header_links($type, $options=[]) {

		$html = '';
		switch ($type) {
			case 'css':

				# CSS main. Prepend main page css to the beginning of the array
				#array_unshift(page::$css_ar_url, __WEB_ROOT_WEB__ . '/page/css/page.css');

				# Remove duplicates
				page::$css_ar_url = array_unique(page::$css_ar_url);
				foreach (page::$css_ar_url as $url) {
					$html .= self::build_css_tag($url) .PHP_EOL;
				}
				break;

			case 'js':

				# JS main. Prepend main page js to the beginning of the array
				#array_unshift(page::$js_ar_url, __WEB_ROOT_WEB__ . '/common/js/common.js', __WEB_ROOT_WEB__ . '/page/js/page.js.php');

				// Remove duplicates
					page::$js_ar_url = array_unique(page::$js_ar_url);
				// js options
					$media = isset($options['js_media']) ? $options['js_media'] : null;
					$async = isset($options['js_async']) ? $options['js_async'] : null;
				foreach (page::$js_ar_url as $url) {
					$html .= self::build_js_tag($url, $media, $async) .PHP_EOL;
				}
				break;
		}


		return $html;
	}//end get_header_links



	/**
	* BUILD_CSS_TAG
	* @return string $tag
	*/
	static function build_css_tag($url, $media=null) {

		if (defined('USE_CDN') && USE_CDN!==false) {
			$url = USE_CDN . $url;
		}

		# Add version
		$url = $url.'?'.WEB_VERSION;


		$media_attr='';
		if (!is_null($media)) {
			$media_attr = ' media="'.$media.'"';  // Like screen
		}

		$tag = '<link href="'.$url.'" rel="stylesheet"'.$media_attr.'>';

		return $tag;
	}//edn build_css_tag



	/**
	* BUILD_JS_TAG
	* @return string $tag
	*/
	static function build_js_tag($url, $media=null, $async=null) {

		if (defined('USE_CDN') && USE_CDN!==false) {
			$url = USE_CDN . $url;
		}

		// Add version to avoid cache
			$url = $url.'?'.WEB_VERSION;

		// javascript files builded in php use lang cache param
			if ( strpos($url, '.php')!==false ) {
				$url .= '_' . WEB_CURRENT_LANG_CODE;
			}

		// async_tag (defer, async)
			$async_tag = $async!==null
				? (' '.$async)
				: '';

		$tag = '<script'.$async_tag.' src="'.$url.'"></script>';

		return $tag;
	}//edn build_js_tag



	/**
	* GET_PAGE_TITLE
	* @return string $title
	*/
	public function get_page_title($title=null) {

		if (!is_null($title)) {
			$page_title = $title;
		}else {
			$page_title = $this->page_title . ' | ' . WEB_ENTITY_LABEL;
		}

		return $page_title;
	}//end get_page_title



	/**
	* SET_PAGE_TITLE
	* @return bool true
	*/
	public function set_page_title($title) {

		$this->page_title = $title;

		return true;
	}//end set_page_title



	/**
	* GET_MENU_data
	* @return
	*/
	public function get_menu_data( $parent ) {

		#if ($this->row===false) {
		#	return false;
		#}
		#$parent = $this->row->term_id;

		# Search childrens
		$ar_fields = array(
			self::$web_fields_map->term_id,
			self::$web_fields_map->term,
			self::$web_fields_map->web_path,
			self::$web_fields_map->title,
			self::$web_fields_map->parent
		);


		# Sometimes parent is term_id. Unify search format here
		$parent_search = strpos($parent, '["')===false ? '["'.$parent.'"]' : $parent;

		$options = new stdClass();
			$options->dedalo_get 	= 'records';
			$options->lang 			= WEB_CURRENT_LANG_CODE;
			$options->table 		= WEB_MENU_TABLE;
			$options->ar_fields 	= $ar_fields;
			#$options->sql_filter 	= "parent = '[\"{$parent}\"]'"; // ["mupreva2564_1"]
			$options->sql_filter 	= "`parent` = '{$parent_search}'"; // ["mupreva2564_1"]
			$options->order 		= 'norder ASC';

		# Http request in php to the API
		$data = json_web_data::get_data($options);
			#dump($data, ' data ++ '.to_string($options));

		$main_menu_data = (array)$data->result;
		#$main_menu_data = reset($main_menu_data);
			#dump($main_menu_data, ' main_menu_data ++ '.to_string());

		$this->main_menu_data = $main_menu_data;

		$this->menu_tree = self::get_menu_tree();
		#$this->menu_tree = self::get_menu_tree_plain($parent);
			#dump($this->menu_tree, ' $this->menu_tree ++ '.to_string());
			#dump($main_menu_data, ' main_menu_data ++ '.to_string());

		return $main_menu_data;
	}//end get_menu_data



	/**
	* GET_MENU_TREE
	* @return
	*/
	public static function get_menu_tree( $term_id=WEB_MENU_PARENT ) {

		#static $ar_data;

		# Search childrens
		$ar_fields = array(
			self::$web_fields_map->term_id,
			self::$web_fields_map->term,
			self::$web_fields_map->web_path,
			self::$web_fields_map->title,
			#self::$web_fields_map->parent,
			self::$web_fields_map->childrens
		);

		# Sometimes parent is term_id. Unify search format here
		$term_id_search = $term_id;

		$options = new stdClass();
			$options->dedalo_get 	= 'records';
			$options->lang 			= WEB_CURRENT_LANG_CODE;
			$options->table 		= WEB_MENU_TABLE;
			$options->ar_fields 	= $ar_fields;
			#$options->sql_filter 	= "parent = '[\"{$parent}\"]'"; // ["mupreva2564_1"]
			$options->sql_filter 	= "term_id = '{$term_id_search}'"; // ["mupreva2564_1"]

		# Http request in php to the API
		$data = json_web_data::get_data($options);
			#dump($data, ' data ++ '.to_string($options));

		#$ar_data = (array)$data->result;

		$ar_data = $data->result;
		#dump($ar_data, ' ar_data ++ '.to_string());

		foreach ((array)$data->result as $key => $value) {

			$childrens = json_decode($value->childrens);
			if (!empty($childrens)) {
				if (!isset($ar_data[$key]->childrens_resolved)) $ar_data[$key]->childrens_resolved = array();
				foreach ((array)$childrens as $locator) {
					$current_term_id = $locator->section_tipo .'_'. $locator->section_id;
					#dump($current_term_id, ' current_term_id ++ '.to_string());
					$ar_data[$key]->childrens_resolved = array_merge($ar_data[$key]->childrens_resolved, self::get_menu_tree( $current_term_id) );
				}
				// Clean final array
				unset($ar_data[$key]->childrens);
			}
		}
		#dump($ar_data, ' ar_data ++ '.to_string());

		return $ar_data;
	}//end get_menu_tree



	/**
	* GET_MENU_TREE_PLAIN
	* @return array  $ar_data
	*/
	public function get_menu_tree_plain( $term_id=WEB_MENU_PARENT, $exclude=[] ) {

		#// ar_fields. Search fields
		#	$ar_fields = array(
		#		self::$web_fields_map->term_id,
		#		self::$web_fields_map->term,
		#		self::$web_fields_map->web_path,
		#		self::$web_fields_map->title,
		#		self::$web_fields_map->parent,
		#		self::$web_fields_map->childrens
		#	);
		#
		#// search
		#	$options = new stdClass();
		#		$options->dedalo_get 	= 'menu_tree_plain';
		#		$options->table 		= WEB_MENU_TABLE;
		#		$options->lang 			= WEB_CURRENT_LANG_CODE;
		#		$options->fields 		= $ar_fields;
		#		$options->term_id 		= $term_id;
		#
		#	# Http request in php to the API
		#	$data = json_web_data::get_data($options);
		#		#dump($data, ' data ++ '.to_string());

		$data = array_reduce($this->data_combi, function($carry, $item){
			return ($item->id==='menu_all') ? $item : $carry;
		});

		if (empty($exclude)) {
			$ar_data = $data->result;
		}else{
			$ar_data = [];
			foreach ($data->result as $key => $value) {
				if (!in_array($value->section_id, $exclude)) {
					$ar_data[] = $value;
				}
			}
		}

		// empty web_path fix. Use term_id as fallback when empty web_path
			foreach ($ar_data as $item) {
				if (empty($item->web_path)) {
					$item->web_path = $item->term_id;
				}

				// parse json data
					if (!empty($item->children) && is_string($item->children)) {
						$item->children = json_decode($item->children);
					}
			}

		return $ar_data;

		/* OLD
			// term_id_search. Sometimes parent is term_id. Unify search format here
				$term_id_search = $term_id;

			// search
				$options = new stdClass();
					$options->dedalo_get 	= 'records';
					$options->lang 			= WEB_CURRENT_LANG_CODE;
					$options->table 		= WEB_MENU_TABLE;
					$options->ar_fields 	= $ar_fields;
					#$options->sql_filter 	= "term_id = '{$term_id_search}'"; // ["mupreva2564_1"]
					$options->sql_filter 	= "parent = '{$term_id}'"; // ["mupreva2564_1"]
					$options->order 		= '`norder` ASC';
				# Http request in php to the API
				$data = json_web_data::get_data($options);
					#dump($data, ' data ++ '.to_string());

			$ar_data = $data->result;
				#dump($ar_data, ' ar_data ++ '.to_string($term_id));


			foreach ((array)$data->result as $key => $value) {

				$childrens = json_decode($value->childrens);

				if (!empty($childrens)) {
					# # if (!isset($ar_data[$key]->childrens_resolved)) $ar_data[$key]->childrens_resolved = array();
					# foreach ((array)$childrens as $locator) {
					# 	$current_term_id = $locator->section_tipo .'_'. $locator->section_id;
					# 	#dump($current_term_id, ' current_term_id ++ '.to_string());
					# 	#$ar_data[$key]->childrens_resolved = array_merge($ar_data[$key]->childrens_resolved, self::get_menu_tree_plain( $current_term_id) );
					# 	$ar_data = array_merge($ar_data, self::get_menu_tree_plain($current_term_id));
					# }
					# // Clean final array
					# #unset($ar_data[$key]->childrens);

					$ar_data = array_merge($ar_data, self::get_menu_tree_plain($value->term_id));
				}
			}
			#dump($ar_data, ' ar_data ++ '.to_string());

			return $ar_data;
			*/
	}//end get_menu_tree_plain



	/**
	* RENDER_MENU_TREE_PLAIN
	*/
	public static function render_menu_tree_plain($term_id, $menu_tree, $li_drawer, $ul_drawer, $children_column_name='childrens') {
		#dump($menu_tree, ' menu_tree ++ '.to_string());

		$html = '';

			// filter menu tree for parent $term_id (and include root parent when is $term_id)
				$items = array_filter($menu_tree,function($item) use($term_id) {
					return ($item->parent===$term_id); //  || ($term_id===WEB_MENU_PARENT && $item->term_id===WEB_MENU_PARENT)
				});

			// sort by norder asc
				usort($items, function($a, $b){
					if ((int)$a->norder > (int)$b->norder) {
						return 1;
					}
					return 0;
				});

			// iterate items from filter
				foreach ($items as $menu_element) {

					$current_term_id = $menu_element->term_id;

					// menu active check
						if (property_exists($menu_element, 'menu') && $menu_element->menu==='no') {
							continue;
						}

					if (  !empty($menu_element->{$children_column_name})
						&& $current_term_id!==WEB_MENU_PARENT
						&& (true===page::have_menu_children($menu_element->{$children_column_name}, $menu_tree))
					) {
						// recursion
						$embed_html = self::render_menu_tree_plain($current_term_id, $menu_tree, $li_drawer, $ul_drawer, $children_column_name);
					}else{
						$embed_html = '';
					}

					$html .= $li_drawer($menu_element, $embed_html);
				}

		// wrap
			$html = $ul_drawer($term_id, $html);

		return $html;
	}//end render_menu_tree_plain



	/**
	* HAVE_MENU_CHILDREN
	* @return bool
	*/
	public static function have_menu_children($children_data, $menu_tree_rows) {

		$found_child_with_active_menu = false;

		$ar_term_id = !empty($children_data) && is_string($children_data)
			? json_decode($children_data)
			: $children_data;

		foreach ($ar_term_id as $term_id) {

			if (is_object($term_id)) {
				// as locator (legacy)
				$section_id	= (int)$term_id->section_id;

			}else{
				// as term_id
				$ar			= explode('_', $term_id);
				$section_id	= (int)$ar[1];
			}

			$item = array_find($menu_tree_rows, function($el) use($section_id){
				return (int)$el->section_id===(int)$section_id;
			});
			if ($item && $item->menu==='yes') {
				$found_child_with_active_menu = true;
				break;
			}
		}

		return $found_child_with_active_menu;
	}//end have_menu_children



	/**
	* GET_TEMPLATE_NAME
	* @return string $template_name
	*/
	public static function get_template_name($web_path) {

		$template_name = null;

		// Modelo name
		switch ($web_path) {
			case null:
				$template_name = 'error';
				break;
			case 'main_home':
				$template_name = 'main_home';
				break;
			default:
				$template_name = 'site_home';
				break;
		}
		if(SHOW_DEBUG===true) {
			#dump($template_name, ' template_name ++ '.to_string());
		}


		return $template_name;
	}//end get_template_name



	/**
	* GET_BREADCRUMB
	* @return
	*/
	public function get_breadcrumb() {

		if (!isset($this->row->term_id)) {
			return false;
		}

		$term_id = $this->row->term_id;

		$ar_fields = array(
			self::$web_fields_map->term_id,
			self::$web_fields_map->term,
			self::$web_fields_map->web_path,
			self::$web_fields_map->title,
			self::$web_fields_map->parent
			#self::$web_fields_map->childrens
		);

		$options = new stdClass();
			$options->dedalo_get 	= 'thesaurus_parents';
			$options->term_id 		= $term_id;
			$options->recursive 	= true;
			$options->lang 			= WEB_CURRENT_LANG_CODE;
			$options->ar_fields		= $ar_fields;
			#$options->ar_fields = array('*');

		# Http request in php to the API
		$data = json_web_data::get_data($options);
			#dump($data, ' data ++ '.to_string($options));

		$breadcrumb = array_reverse($data->result);


		$object = new stdClass();
		foreach ($options->ar_fields as $key => $name) {
			$object->{$name} = $this->row->{$name};
		}

		# Add self
		$breadcrumb[] = $object;
		if(SHOW_DEBUG===true) {
			#dump($options->ar_fields, ' options->ar_fields ++ '.to_string($this->row));;
		}


		return $breadcrumb;
	}//end get_breadcrumb



	/**
	* RESOLVE_COLUMN_VALUE
	* Modify the received object adding the resolved property 'value' to each column element
	* @return bool
	*/
	public function resolve_column_value($column_obj, $row=false) {

		if (property_exists($row, $column_obj->colname)) {

			# Postprocess some complex elements
			switch ($column_obj->type) {
				case 'image':
					# Image value (url)
					$column_obj->value = $this->get_image_value($column_obj, $row);
					break;
				case 'video':
				case 'audio':
					# video value (url)
					$column_obj->value = $this->get_video_value($column_obj, $row);
					break;
				case 'reference':
					# reference value (array)
					$column_obj->value = $this->get_reference_value($column_obj, $row);
					break;
				case 'portal':
					# Template html resolved
					$column_obj->value = $this->get_portal_value($column_obj, $row);
					break;
				case 'childrens':
					# Template html resolved
					$column_obj->value = $this->get_childrens_value($column_obj, $row);
					break;
				default:
					# Direct value (literal row value)
					$column_obj->value = $this->get_default_value($column_obj, $row);
			}

		}else{
			$column_obj->value = false;
		}


		return true;
	}//end resolve_column_value



	/**
	* GET_DEFAULT_VALUE
	* @return
	*/
	public function get_default_value($column_obj, $row) {

		$value = $row->{$column_obj->colname};

		if ($column_obj->type==='title') {
			$this->page_title = $value;
				#dump($value, ' value ++ '.to_string());
		}

		return $value;
	}//end get_default_value



	/**
	* GET_IMAGE_VALUE
	* @return
	*/
	public function get_image_value($column_obj, $row) {

		$image_url = false;

		$value = $row->{$column_obj->colname};
		if (empty($value)) {
			return $image_url;
		}

		if (!property_exists($column_obj, 'target')) {

			# Direct value
			$image_url = $value;

		}else{

			# JSON array of element pointing to another table (target)
			if ((!empty($value) && is_string($value)) && ($value==='[]' || !$ar_value=json_decode($value))) {
				return $image_url;
			}

			if (!empty($ar_value)) {

				$ar_filter = [];
				foreach ($ar_value as $current_section_id) {
					$ar_filter[] = '`section_id`='.(int)$current_section_id;
				}
				$sql_filter = implode(' OR ', $ar_filter);

				$order = 'FIELD(`section_id`, '.implode(',', $ar_value).')';

				# resolves value
				$options = new stdClass();
					$options->dedalo_get 		= 'records';
					$options->lang 				= WEB_CURRENT_LANG_CODE;
					$options->table 			= $column_obj->target->table;
					$options->ar_fields 		= array($column_obj->target->colname);
					#$options->sql_filter 		= "section_id = ".reset($ar_value)." ";
					#$options->limit 			= 1;
					$options->sql_filter 		= $sql_filter;
					$options->limit 			= 0;
					$options->order 			= $order;

				# Http request in php to API
				$data = json_web_data::get_data($options);

				#if (!empty($data->result)) {
				#	$image_url = reset($data->result)->{$column_obj->target->colname};
				#}
				if (!empty($data->result)) {
					$image_url = [];
					foreach ($data->result as $key => $row) {
						$image_url[] = $row->{$column_obj->target->colname};
					}
				}
				#dump($data->result, ' image_url +++++++++++++++++++++++++++++ OPTIONS: '.to_string($options));
			}

		}//end if (isset($column_obj->target))

		return $image_url;
	}//end get_image_value



	/**
	* GET_video_VALUE
	* @return
	*/
	public function get_video_value($column_obj, $row) {

		return $this->get_image_value($column_obj, $row);
	}//end get_video_value



	/**
	* GET_REFERENCE_VALUE
	* @return
	*/
	public function get_reference_value($column_obj, $row) {

		$ar_reference_value = false;

		$value = $row->{$column_obj->colname};
		if (empty($value)) {
			return false;
		}

		if (!property_exists($column_obj, 'target')) {

			# Direct value
			$ar_reference_value = $value;

		}else{

			# JSON array of element pointing to another table (target)
			if ($value==='[]' || !$ar_value=json_decode($value)) {
				return $ar_reference_value;
			}
			#dump($column_obj->target->colname, '$column_obj->target->colname ++ '.to_string($column_obj->target->table));

			$ar_filter = [];
			foreach ($ar_value as $current_section_id) {
				$ar_filter[] = 'section_id = '.(int)$current_section_id;
			}
			$sql_filter = implode(' OR ', $ar_filter);

			# resolves value
			$options = new stdClass();
				$options->dedalo_get 		= 'records';
				$options->lang 				= WEB_CURRENT_LANG_CODE;
				$options->table 			= $column_obj->target->table;
				$options->ar_fields 		= array($column_obj->target->colname);
				#$options->sql_filter 		= "section_id = ".reset($ar_value)." ";
				#$options->limit 			= 1;
				$options->sql_filter 		= $sql_filter;
				$options->limit 			= 0;

			# Http request in php to API
			$data = json_web_data::get_data($options);

			#if (!empty($data->result)) {
			#	$ar_reference_value = reset($data->result)->{$column_obj->target->colname};
			#}
			if (!empty($data->result)) {
				$ar_reference_value = [];
				foreach ($data->result as $key => $row) {
					$ar_reference_value[] = $row->{$column_obj->target->colname};
				}
			}
			#dump($data->result, ' ar_reference_value ++ '.to_string());

		}//end if (isset($column_obj->target))


		return $ar_reference_value;
	}//end get_reference_value



	/**
	* GET_PORTAL_VALUE
	* @return
	*/
	public function get_portal_value($column_obj, $row, $max_records=5, $offset=0) {
		#$max_records=50; $offset=0;
		#$max_records = 2;
		#$offset = 2;

		if (isset($column_obj->max_records)) {
			$max_records = $column_obj->max_records;
		}
		if (isset($column_obj->offset)) {
			$offset = $column_obj->offset;
		}

		$column_name = $column_obj->colname;
		$value 		 = $row->{$column_name};
		if (empty($value)) {
			return false;
		}

		# Configure object with aditional info always
		$column_obj->max_records 	= (int)$max_records;
		$column_obj->offset 		= (int)$offset;


		if ($value==='[]' || !$ar_value=json_decode($value)) {
			$column_obj->total_records  = 0;
			return false;
		}
		#dump($ar_value, ' ar_value ++ '.to_string());

		$portal_template_map = $column_obj;	//$column_obj->list;
		$temp_page_mode 	 = 'list';
			#dump($column_obj, ' portal_template_map ++ '.to_string()); return;

		$ar_fields = array("section_id");
		foreach ($portal_template_map->{$temp_page_mode} as $key => $portal_template_map_value) {
			$ar_fields[] = $portal_template_map_value->colname;
		}

		# Configure object with aditional info
		#$portal_template_map->ar_value 		= (string)$value;
		#$portal_template_map->total_records = count($ar_value);
			#dump($column_obj, ' column_obj ++ '.to_string());


		// calls array
			/*
			$ar_calls = [];

				$options = new stdClass();
					$options->dedalo_get 	= 'records';
					$options->table 		= WEB_MENU_TABLE;
					$options->ar_fields 	= $ar_fields;
					$options->lang 			= WEB_CURRENT_LANG_CODE;

				$call = new stdClass();
					$call->id 		= 'menu_all';
					$call->options 	= $options;

				$ar_calls[] = $call;

			// call to api
				$options = new stdClass();
					$options->dedalo_get 	= 'combi';
					$options->ar_calls 		= $ar_calls;
				# Http request in php to the API
				$response = json_web_data::get_data($options);
			*/


		// filter
			$ar_filter = array_map(function($section_id){
				return '`section_id`='.(int)$section_id;
			}, $ar_value);

			$options = new stdClass();
				$options->dedalo_get 		= 'records';
				$options->lang 				= WEB_CURRENT_LANG_CODE;
				$options->table 			= $column_obj->table;
				$options->ar_fields 		= $ar_fields;
				$options->sql_filter 		= implode(' OR ', $ar_filter);
				$options->order 			= 'FIELD(`section_id`, '.implode(',', $ar_value).')';
			# Http request in php to API
			$rows_data = json_web_data::get_data($options);
				#dump($rows_data, ' rows_data ++ '.to_string());

		// iterate rows
			$html='';
			$portal_template_map->ar_value 		= (string)$value;
			$portal_template_map->total_records = count($rows_data->result);
			$i=1;foreach ($rows_data->result as $portal_row) {

				// skip records before offset
					if ($i<=$offset) {
						$i++;
						continue;
					}

				// new page for each portal. Note set '$this' as parameter to avoid reload identical page data again
					$temp_page = new page($this);
						$temp_page->area_name 	= $this->area_name;
						$temp_page->area_table 	= $column_obj->table;
						$temp_page->row 		= $portal_row;

					// html build from template
						$current_options = new stdClass();
							$current_options->template_map 		= $portal_template_map;
							$current_options->mode 				= $temp_page_mode;
							$current_options->add_common_css 	= false;
							$current_options->add_template_css 	= true;
							$current_options->resolve_values 	= true;
						$html .= $temp_page->get_template_html($current_options);

				// stop on max_records
					if ($i>=($max_records+$offset)) break;

			$i++;}


		/*
		$ar_to_resolve = array();
		$i=1;foreach ($ar_value as $key => $section_id) {

			# Skip records before offset
			# if ($i<=$offset) {
			# 	$i++;
			# 	continue;
			# }

			$options = new stdClass();
				$options->dedalo_get 		= 'records';
				$options->lang 				= WEB_CURRENT_LANG_CODE;
				$options->table 			= $column_obj->table;
				$options->ar_fields 		= $ar_fields;
				$options->sql_filter 		= "section_id = '".$section_id."'";
				#$options->order 			= "section_id DESC";
				$options->limit 			= 1;

			# Http request in php to API
			$data = json_web_data::get_data($options);
				#dump($data, ' data ++ '.to_string());
			if (!empty($data->result)) {
				# To resolve
				$ar_to_resolve[] = $data->result;
			}

			# foreach ((array)$data->result as $key => $portal_row) {
			# 	#dump($portal_row, ' portal_row ++ '.to_string());
			# 	$temp_page = new page();
			# 	$temp_page->area_name 	= $this->area_name;
			# 	$temp_page->area_table 	= $column_obj->table;
			# 	$temp_page->row 		= $portal_row;
			#
			# 	$html .= $temp_page->get_template_html($portal_template_map, $temp_page_mode);
			# }//end foreach ((array)$data->result as $key => $portal_row)

			# Stop on max_records
			#if ($i>=$max_records+$offset) break;

		$i++;}//end foreach ($ar_value as $key => $section_id)


		$portal_template_map->ar_value 		= (string)$value;
		$portal_template_map->total_records = count($ar_to_resolve);


		$i=1;foreach ($ar_to_resolve as $key => $data_result) {

			# Skip records before offset
			if ($i<=$offset) {
				$i++;
				continue;
			}
			foreach ((array)$data_result as $key => $portal_row) {
				#dump($portal_row, ' portal_row ++ '.to_string());
				$temp_page = new page();
					$temp_page->area_name 	= $this->area_name;
					$temp_page->area_table 	= $column_obj->table;
					$temp_page->row 		= $portal_row;

				#$html .= $temp_page->get_template_html($portal_template_map, $temp_page_mode);
				// html build from template
					$current_options = new stdClass();
						$current_options->template_map 		= $portal_template_map;
						$current_options->mode 				= $temp_page_mode;
						$current_options->add_common_css 	= false;
						$current_options->add_template_css 	= true;
						$current_options->resolve_values 	= true;
					$html .= $temp_page->get_template_html($current_options);
			}//end foreach ((array)$data->result as $key => $portal_row)

			# Stop on max_records
			if ($i>=$max_records+$offset) break;
		$i++;}
		*/

		# Add object property value
		#$column_obj->value = $html;


		return $html;
	}//end get_portal_value



	/**
	* GET_CHILDRENS_VALUE
	* @return string $html
	*/
	public function get_childrens_value($column_obj, $row, $max_records=100, $offset=0) {

		#$max_records = 2;
		#$offset = 2;
		#dump($max_records, ' $max_records ++ $offset: '.to_string($offset));

		$column_name = $column_obj->colname;
		$value 		 = $row->{$column_name};
		if (empty($value)) {
			return false;
		}

		# Configure object with aditional info always
		$column_obj->max_records 	= (int)$max_records;
		$column_obj->offset 		= (int)$offset;


		if ($value==='[]' || !$ar_value=json_decode($value)) {
			$column_obj->total_records  = 0;
			return false;
		}
		#dump($ar_value, ' ar_value ++ '.to_string());

		$childrens_template_map = $column_obj;	//$column_obj->list;
		$temp_page_mode 	 	= 'list';
		$table_name 			= $this->area_table; // Same table like curret page
			#dump($column_obj, ' childrens_template_map ++ '.to_string()); return;

		$ar_fields = array("section_id");
		foreach ($childrens_template_map->{$temp_page_mode} as $key => $childrens_template_map_value) {
			$ar_fields[] = $childrens_template_map_value->colname;
		}

		# Configure object with aditional info
		$childrens_template_map->ar_value 		= (string)$value;
		$childrens_template_map->total_records 	= count($ar_value);
			#dump($column_obj, ' column_obj ++ '.to_string());

		$html='';
		$i=1;foreach ($ar_value as $key => $current_locator) {

			$section_id = $current_locator->section_id;

			# Skip records before offset
			if ($i<=$offset) {
				$i++;
				continue;
			}

			$options = new stdClass();
				$options->dedalo_get 		= 'records';
				$options->lang 				= WEB_CURRENT_LANG_CODE;
				$options->table 			= $table_name;
				$options->ar_fields 		= $ar_fields;
				#$options->sql_filter 		= "section_id = '".$section_id."'";
				$options->sql_filter 		= "section_id = ".$section_id."";
				#$options->order 			= "section_id DESC";
				$options->limit 			= 1;

			# Http request in php to API
			$data = json_web_data::get_data($options);
				#dump($data, ' data ++ '.to_string($options));

			foreach ((array)$data->result as $key => $children_row) {
				#dump($children_row, ' children_row ++ '.to_string());

				# $temp_page = new page();
				# $temp_page->area_name 		= $this->area_name;
				# $temp_page->area_table 		= $table_name;
				# $temp_page->main_menu_data 	= $this->main_menu_data;

				$temp_page 		= clone($this);
				$temp_page->row	= $children_row;

				$html .= $temp_page->get_template_html($childrens_template_map, $temp_page_mode);
			}//end foreach ((array)$data->result as $key => $children_row)

			# Stop on max_records
			if ($i>=$max_records+$offset) break;

		$i++;}//end foreach ($ar_value as $key => $section_id)

		# Add object property value
		#$column_obj->value = $html;


		return $html;
	}//end get_childrens_value



	/**
	* GET_TEMPLATE_HTML
	* Resolve template values and render the current template html in requested mode
	* @param $template_map
	*	object
	* @param $mode
	*	string
	* @return string $template_html
	*/
	public function get_template_html($request_options) {

		$options = new stdClass();
			$options->template_map 		= false;
			$options->mode 				= false;
			$options->add_common_css 	= false;
			$options->add_template_css 	= true;
			$options->resolve_values 	= true;
			$options->content 		 	= false;
			foreach ($request_options as $key => $value) {if (property_exists($options, $key)) $options->$key = $value;}

		# Fix var to template acccess
		$template_map 	= $options->template_map;
		$mode 			= $options->mode;

		if(SHOW_DEBUG===true) {
			#$db = debug_backtrace();
			#dump($db, ' db ++ '.to_string());
			#throw new Exception("Error Processing Request", 1);
			#dump($options, ' $options ++ '.to_string());
		}

		if ($options->template_map===false) {
			# error template
			$template_name = 'error';

		}else{
			# RESOLVE VALUES
			if ($options->resolve_values===true) {
				if (!isset($template_map->{$mode})) {
					if(SHOW_DEBUG===true) {
						dump($template_map, ' invalid template_map ++ '.to_string());
						echo "Error on get template on mode: $mode";
					}
					return false;
				}
				foreach ($template_map->{$mode} as $key => $column_obj) {
					$this->resolve_column_value( $column_obj, $this->row );
				}//end foreach ($template_map->{$mode} as $key => $column_obj)
			}
			$template_name = $template_map->template;
		}
		#dump( $template_name, ' template_name ++ '.to_string($mode));
		#dump($this, ' this ++ '.to_string());

		# Add template common url to final header render
			#if ($options->add_common_css===true) {
			#	page::$css_ar_url[] = __WEB_ROOT_WEB__ . '/'. WEB_DISPATCH_DIR. '/tpl/' . WEB_ENTITY . '/tpl_common/css/tpl_common.css';
			#	page::$js_ar_url[]  = __WEB_ROOT_WEB__ . '/'. WEB_DISPATCH_DIR. '/tpl/' . WEB_ENTITY . '/tpl_common/js/tpl_common.js';
			#}

		#
		# TEMPLATE CSS / JS
			if ($options->add_template_css===true) {
				# Add url to final header render
				page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/' . $template_name . '/css/' . $template_name . CSS_SUFFIX . '.css';
				page::$js_ar_url[]  = __WEB_TEMPLATE_WEB__ . '/' . $template_name . '/js/'  . $template_name . JS_SUFFIX . '.js';
			}

		#
		# TEMPLATE_HTML
			# Compose html with current template file if exists or with basic html template
			ob_start();
			$html_content_file = __WEB_TEMPLATE_PATH__ . '/' . $template_name . '/html/' . $template_name . '.phtml';
			if (!include($html_content_file)) {
				if(SHOW_DEBUG===true) {
					#dump($html_content_file, ' html_content_file ++ '.to_string());
					trigger_error("Unable load template file: $template_name . $html_content_file");
				}
			}
			$template_html = ob_get_clean();


		return $template_html;
	}//end get_template_html



	/**
	* CLEAN_TEMPLATE_MAP
	* Used to remove unnecessary elements of the template object (values for example)
	* for easy send as json data to triggers
	* @return object $clean_template_map
	*/
	public function clean_template_map( $template_map ) {

		$clean_template_map = new stdClass();
		foreach ($template_map as $co_key => $co_value) {
			if($co_key==='value') continue;

			if($co_key==='list') {
				$elements = array();
				foreach ($template_map->{$co_key} as $colist_value) {
					$element = new stdClass();
					foreach ($colist_value as $_key => $_value) {
						if($_key==='value') continue;
						$element->{$_key} = $_value;
					}
					$elements[] = $element;
				}
				$clean_template_map->$co_key = $elements;
			}else{
				$clean_template_map->$co_key = $co_value;
			}
		}


		return $clean_template_map;
	}//end clean_template_map



	/**
	* GET_MENU_LINK
	* Build normal link, but besides, check if link element exists in menu (childrens case) and in this case
	* use the menu link instead default option
	* Default option is tablename
	* @return string $link
	*/
	public function get_menu_link($main_menu_data, $area_name, $table_name, $section_id) {

		# Default link, using table name path
		$link = __WEB_ROOT_WEB__ ."/$area_name/$table_name/$section_id";

		# Try to find in menu data the target section
		# $main_menu_data = $this->main_menu_data;
		if($main_menu_data!==false) foreach ($main_menu_data as $obj_value) {
			#dump($obj_value, ' obj_value ++ '.to_string());
			if ($obj_value->term_id === WEB_MENU_SECTION_TIPO .'_'. $section_id) {
				$link = __WEB_ROOT_WEB__ .'/'. $obj_value->web_path;
				break;
			}
		}
		#dump($main_menu_data, ' main_menu_data ++ '.to_string());

		return $link;
	}//end get_menu_link



	/**
	* GET_ELEMENT_FROM_TEMPLATE_MAP
	* Try to extract the title value from de template received
	* @return string $title
	*/
	public function get_element_from_template_map( $type, $template_map, $custom_filter=null ) {
		#dump($template_map, ' template_map ++ '.to_string($type));

		// reduce array template_map
			$element_objects = array_filter($template_map, function($item) use($type, $custom_filter){

				if($item->type!==$type) return false;

				if (!empty($custom_filter)) {
					// additional filter check using '$custom_filter' array like ['colname'=>'logos']
					foreach ($custom_filter as $property_name => $property_value) {
						if (property_exists($item, $property_name) && $item->{$property_name}===$property_value) {
							return $item;
						}
					}
				}else{
					// default case. only filtered by type
					return $item;
				}
			});
			#dump($element_objects, ' element_objects ++ '.to_string());

			if (count($element_objects)>1) {
				// merge equal type elements in one
				$element_object = reset($element_objects); // uses the first as base

				$mix_value = [];
				foreach ($element_objects as $key => $current_element_object) {
					if(empty($current_element_object->value)) continue;

					$mix_value = array_merge($mix_value, $current_element_object->value);

					// removel old item
					unset($current_element_object);
				}
				$element_object->value   = $mix_value;
				$element_object->variant = 'mixed_value';
				#dump($element_object, ' element_object ++ '.to_string());

			}else{
				$element_object = reset($element_objects);
			}


		// reduce array template_map
			/*
			$element_object = array_reduce($template_map, function($carry, $item) use($type, $custom_filter){
				#dump($item, ' item ++ '.to_string($type)." - ".json_encode($item->type===$type));
				if($item->type===$type) {
					#dump($item, ' match item ++ type: '.to_string($type));

					if (!empty($custom_filter)) {
						// additional filter check using '$custom_filter' array like ['colname'=>'logos']
							foreach ($custom_filter as $property_name => $property_value) {
								if (property_exists($item, $property_name) && $item->{$property_name}===$property_value) {
									return $item;
								}
							}
					}else{
						// default case. only filtered by type
							return $item;
					}
				}
				return $carry;
			});
			*/


		/* OLD way array filter
			$ar_elements = array_filter(
					$template_map,
					function ($template_map) use($type, $custom_filter) {
						if (!empty($custom_filter)) {

							$find = ($template_map->type === $type);
							foreach ($custom_filter as $key => $value) {
								if (!property_exists($template_map, $key) || $template_map->{$key}!=$value) {
									$find = false;
									dump($key, ' custom_filter ++ '.to_string($value));
									break;
								}

							}
							$filter = $find;
						}else{
							$filter = ($template_map->type === $type);
						}
						return $filter;
					}
			);
			#dump($ar_elements, ' ar_elements ++ '.to_string());


			$element_object = reset($ar_elements); //isset($ar_elements[$key]) ? $ar_elements[$key] : null;
			#if ($type==="image") {
			#	dump($ar_elements, ' ar_elements ++ custom_filter: '.to_string($custom_filter));
			#}
			*/

		$element_value = isset($element_object->value) ? $element_object->value : '';

		// debug fallback
			if(SHOW_DEBUG===true && isset($patata)) {
				if (empty($element_value)) {
					switch ($type) {
						case 'title':
							$element_value = "Title of lorem ipsum dolor sit amet";
							break;
						case 'abstract':
							$element_value = "Abstract of Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
							break;
						case 'body':
							$element_value = "Body of Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Laoreet id donec ultrices tincidunt arcu non sodales neque. Pellentesque elit ullamcorper dignissim cras tincidunt lobortis feugiat vivamus at. Feugiat sed lectus vestibulum mattis. Lacus luctus accumsan tortor posuere ac ut consequat semper. Tortor pretium viverra suspendisse potenti nullam ac tortor vitae. Semper feugiat nibh sed pulvinar proin gravida hendrerit lectus a. In aliquam sem fringilla ut morbi. Eget sit amet tellus cras. Est ante in nibh mauris cursus mattis. Et netus et malesuada fames ac turpis egestas sed.
							A cras semper auctor neque vitae tempus quam pellentesque. Blandit libero volutpat sed cras ornare arcu dui vivamus. Sit amet facilisis magna etiam. Amet aliquam id diam maecenas ultricies mi eget mauris pharetra. Vestibulum lorem sed risus ultricies. Quisque sagittis purus sit amet volutpat consequat mauris. Tellus pellentesque eu tincidunt tortor aliquam. Turpis egestas integer eget aliquet nibh praesent. Sagittis orci a scelerisque purus semper eget. Ultrices neque ornare aenean euismod elementum. Odio ut enim blandit volutpat maecenas volutpat blandit. Posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pretium quam vulputate dignissim suspendisse in est ante in. Dignissim cras tincidunt lobortis feugiat vivamus at augue eget. Auctor eu augue ut lectus. Enim blandit volutpat maecenas volutpat blandit. Semper quis lectus nulla at volutpat diam ut venenatis tellus. Blandit cursus risus at ultrices mi. Lobortis mattis aliquam faucibus purus. Vulputate enim nulla aliquet porttitor.
							Purus viverra accumsan in nisl nisi scelerisque. Sit amet dictum sit amet justo donec enim diam. Sodales neque sodales ut etiam. Quam id leo in vitae. Placerat orci nulla pellentesque dignissim enim sit amet venenatis. Faucibus a pellentesque sit amet porttitor eget. Faucibus in ornare quam viverra orci sagittis eu volutpat. Id aliquet lectus proin nibh nisl condimentum id. Magna fringilla urna porttitor rhoncus dolor. Quisque id diam vel quam elementum pulvinar etiam. Nulla aliquet enim tortor at auctor urna nunc id cursus. Nisl vel pretium lectus quam id leo in vitae turpis. Blandit cursus risus at ultrices mi tempus. Eget gravida cum sociis natoque penatibus et magnis dis. Euismod quis viverra nibh cras pulvinar mattis nunc sed. Tortor pretium viverra suspendisse potenti nullam ac tortor vitae purus. At in tellus integer feugiat scelerisque varius. Vitae tortor condimentum lacinia quis vel eros donec ac. Varius quam quisque id diam. Nisl condimentum id venenatis a condimentum vitae sapien pellentesque.
							Morbi tristique senectus et netus. Porta nibh venenatis cras sed felis eget velit aliquet sagittis. Nulla porttitor massa id neque aliquam vestibulum. Ipsum faucibus vitae aliquet nec ullamcorper. Nunc aliquet bibendum enim facilisis gravida neque convallis. Id diam vel quam elementum pulvinar etiam non. Posuere morbi leo urna molestie at elementum eu facilisis sed. Duis ultricies lacus sed turpis tincidunt. Laoreet suspendisse interdum consectetur libero id. Massa vitae tortor condimentum lacinia quis vel eros. Eleifend quam adipiscing vitae proin sagittis nisl rhoncus mattis. Mauris nunc congue nisi vitae suscipit tellus mauris. Sollicitudin tempor id eu nisl nunc mi ipsum faucibus.
							Nunc sed velit dignissim sodales ut eu. Felis bibendum ut tristique et egestas quis ipsum. Sed vulputate mi sit amet mauris commodo. Donec massa sapien faucibus et. Pellentesque habitant morbi tristique senectus et netus et malesuada fames. Ac turpis egestas sed tempus. Vehicula ipsum a arcu cursus vitae congue mauris rhoncus aenean. Id venenatis a condimentum vitae sapien pellentesque habitant morbi tristique. Tortor aliquam nulla facilisi cras fermentum. Dignissim convallis aenean et tortor at risus viverra adipiscing at. Aliquam id diam maecenas ultricies mi eget mauris pharetra. Enim nulla aliquet porttitor lacus luctus accumsan tortor. Et tortor at risus viverra. Massa placerat duis ultricies lacus sed turpis tincidunt id aliquet. Augue neque gravida in fermentum. Magnis dis parturient montes nascetur.
							Quam elementum pulvinar etiam non quam lacus suspendisse. Vel eros donec ac odio tempor orci dapibus. Amet est placerat in egestas erat. Fermentum dui faucibus in ornare quam viverra orci sagittis eu. Eget felis eget nunc lobortis mattis aliquam faucibus. Diam sollicitudin tempor id eu nisl nunc mi ipsum faucibus. Nulla pellentesque dignissim enim sit amet venenatis urna cursus eget. Porttitor massa id neque aliquam vestibulum. Mauris pharetra et ultrices neque ornare aenean euismod elementum. Purus gravida quis blandit turpis. Nisi porta lorem mollis aliquam ut porttitor leo a diam. Egestas integer eget aliquet nibh praesent tristique magna. Fusce id velit ut tortor pretium viverra. Eu lobortis elementum nibh tellus. Nunc sed velit dignissim sodales ut eu sem integer. Faucibus in ornare quam viverra orci sagittis eu. Viverra aliquet eget sit amet tellus cras adipiscing enim. Molestie at elementum eu facilisis sed odio morbi. Scelerisque eu ultrices vitae auctor eu augue ut. At volutpat diam ut venenatis tellus in metus vulputate.";
							break;
						case 'image':
							#$element_value = 'https://master.render.es/dedalo/lib/dedalo/themes/default/0.jpg';
							break;
						default:
							# code...
							break;
					}
				}
			}


		return $element_value;
	}//end get_element_from_template_map



	/**
	* SET_TEMPLATE_FROM_TABLE
	* @return string $template_name
	*/
	public function set_template_from_table($area_table, $area_name, $custom=null) {

		# Config values
		$TABLE_TO_TEMPLATE = (object)TABLE_TO_TEMPLATE;

		switch (true) {
			# case received custom
			case (!is_null($custom)):
				$template_name = $custom;
				break;
			# Same for all
			case (isset($TABLE_TO_TEMPLATE->all)):
				$template_name = $TABLE_TO_TEMPLATE->all;
				break;
			# Defined custom in config
			case (isset($TABLE_TO_TEMPLATE->$area_table)):
				$template_name = $TABLE_TO_TEMPLATE->$area_table;
				break;
			# Automatic set using area_name
			default:
				# Uses area_name as template name, like 'casos_front'
				$template_name = $area_name;
				break;
		}

		# Set template_name
		$this->row->template_name = $template_name;


		if(SHOW_DEBUG===true) {
			error_log("!!! Maped table '$area_table' to template_map name: '$template_name'");
		}


		return $template_name;
	}//end set_template_from_table



	/**
	* GET_PAGINATION
	* Call to class 'Pagination' to build pagination html
	* @return string $html
	*/
	public static function get_pagination($search_data, $crumbs=null) {
		$html = '';
		#
		# Pagination
		# dump($search_data, ' search_data ++ '.to_string());
		if(is_array($search_data)) $search_data = reset($search_data);
		if ( isset($search_data->total) ) {

			$viewed_records	= count($search_data->result);
			$total_records	= isset($search_data->total) ? $search_data->total : $viewed_records;
			$page_number	= $search_data->page_number;
			$rows_per_page	= $search_data->rows_per_page;

			if ($total_records > $viewed_records) {
				# pagination is needed
				include_once(__WEB_TEMPLATE_PATH__.'/lib/pagination/Pagination.class.php');
				# instantiate with page and records as constructor parameters
				$pagination = new Pagination($page_number, $total_records, $crumbs);
				$pagination->setRPP($rows_per_page);
				$markup 	= $pagination->parse();
				$html .= "<div class=\"pagination_wrap\">$markup</div>";
			}
		}

		return $html;
	}//end get_pagination



	/**
	* GET_CHILDREN
	*/
	public static function get_children($term_id, $menu_elements, $recursive=false, $children_column_name='childrens') {

		// filter menu tree for parent $term_id (and include root parent when is $term_id)
			$items = array_filter($menu_elements,function($item) use($term_id) {
				return ($item->parent==$term_id); //  || ($term_id===WEB_MENU_PARENT && $item->term_id===WEB_MENU_PARENT)
			});

		// sort by norder asc
			usort($items, function($a, $b){
				if ((int)$a->norder > (int)$b->norder) {
					return 1;
				}
				return 0;
			});

		// iterate items from filter
			if ($recursive===true) {

				foreach ($items as $menu_element) {

					if (!empty($menu_element->{$children_column_name})) {

						// recursion
							$children = self::get_children($menu_element->term_id, $menu_elements, $recursive, $children_column_name);

							$items = array_merge($items, $children);
					}
				}
			}


		return $items;
	}//end get_children



}//end class page
