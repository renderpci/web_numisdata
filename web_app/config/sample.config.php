<?php 
# config Dédalo API client



// used to build absolute calls to elements
	define('__WEB_BASE_PATH__', dirname(dirname(dirname(__FILE__))));



// source data api
	$source_data_api = 'local'; // remote , local



// custom development working vars (api client)	
	define('WEB_ENTITY' 		, 'entity_name');
	define('WEB_ENTITY_LABEL' 	, 'entity label');

// db . force use this db instead of default (usefull for multiple pubolications)
	define('WEB_DB' ,'web_entity');

// site config

	// __web_base_url__ . absolute url base to target web. Used to build absolute calls to elements	
		define('__WEB_BASE_URL__', ($source_data_api==='remote') ? 'http://mydomain.org' : 'http://'.$_SERVER['HTTP_HOST']);
	
	// __web_root_web__
		$parts = explode('/',$_SERVER['REQUEST_URI']);
		$base  = '/'.$parts[1];
		define('__WEB_ROOT_WEB__', $base);	

	// web_app_dir
		define('WEB_APP_DIR', 'web_app');

	// web_dispatch_dir
		define('WEB_DISPATCH_DIR', 'web');

	// __web_template_web_
		define('__WEB_TEMPLATE_WEB__' , __WEB_ROOT_WEB__  .'/tpl' );
		define('__WEB_TEMPLATE_PATH__', __WEB_BASE_PATH__ .'/tpl');
		
	// version
		include(__WEB_TEMPLATE_PATH__ . '/version.inc');



// api config
	
	// json_trigger_url data source url
		define('JSON_TRIGGER_URL', ($source_data_api==='remote') ? __WEB_BASE_URL__.'/dedalo/lib/dedalo/publication/server_api/v1/json/' : 'http://'.$_SERVER['HTTP_HOST'].'/dedalo/lib/dedalo/publication/server_api/v1/json/');
	
	// json_web_data colector. PHP version http request manager (via CURL)
		include(__WEB_BASE_PATH__ .'/'. WEB_APP_DIR . '/api/class.json_web_data.php');
	
	// api_web_user_code
		# Verification user code (must be identical in config of client and server)
		define('API_WEB_USER_CODE', 'XXXXXXXXXXXX');

	// common core functions
		include(__WEB_BASE_PATH__ .'/'. WEB_APP_DIR . '/common/class.page.php');
		include(__WEB_BASE_PATH__ .'/'. WEB_APP_DIR . '/common/class.common.php');
		include(__WEB_BASE_PATH__ .'/'. WEB_APP_DIR . '/common/class.lang.php');

	// session
		# if (session_status() !== PHP_SESSION_ACTIVE) {
		# 	session_name('web_'.WEB_ENTITY);
		# 	session_start();
		# }

	// lang cascade set
		define('WEB_DEFAULT_LANG_CODE', 'lg-spa');
		if (isset($_GET['lang'])) {
			$lang = $_GET['lang'];
			$_SESSION['web']['lang'] = $lang;
		}elseif (isset($_SESSION['web']['lang'])) {
			$lang = $_SESSION['web']['lang'];		
		}else{
			$lang = WEB_DEFAULT_LANG_CODE;
		}
		if (strpos($lang, 'lg-')===false) {
			$lang = lang2iso3($lang);
		}

	// web_current_lang_code
		define('WEB_CURRENT_LANG_CODE', $lang);

	// web_lang_base_path
		define('WEB_LANG_BASE_PATH', __WEB_TEMPLATE_PATH__ . '/lang/');



// debug . Show / hide debug messages . In production set as false (!)
	$SHOW_DEBUG = true;
	# if (isset($_SESSION['dedalo4']['auth']['user_id']) && $_SESSION['dedalo4']['auth']['user_id']==-1) {
	# 	$SHOW_DEBUG = true;
	# }
	define('SHOW_DEBUG', $SHOW_DEBUG);



// web config
	// mysql table name where is stored the menu data like ts_web_numisdata
		define('WEB_MENU_TABLE', 		'ts_web_XXXXXXXX');
	// section tipo of menu data like www1
		define('WEB_MENU_SECTION_TIPO', 'XXXXXXX');
	// term_id of global page of menu like www1_1
		define('WEB_MENU_PARENT', 		'XXXXXXX');
	// web inital path (default is 'web')
		define('WEB_HOME_PATH', 		'web');
	// array of all used web langs
		define('WEB_AR_LANGS', json_encode([
			"lg-spa" 	=> "Castellano",
			"lg-vlca" 	=> "Valencià"
		]));

	// maps provider if this site use it like '//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
		define('WEB_MAP_PROVIDER_URL', '');

	// templates data
		// source of templates. Values: db | file (default 'db')
			define('WEB_TEMPLATE_MAP_DEFAULT_SOURCE', 'db');
		// Web template json file if source is file
			define('WEB_TEMPLATE_MAP', __WEB_BASE_PATH__ .'/config/template_maps/'.WEB_ENTITY);

	// web_path_map . run name map for url's path like redirect 'mon' to 'catalogo'
		define('WEB_PATH_MAP',	[]);



// breadcrumb	
	define('BUILD_BREADCRUMB', false);



// table to temple 
	define('TABLE_TO_TEMPLATE', json_encode([]));



// fields map 
	define('WEB_FIELDS_MAP', json_encode([
		"term_id" 		=> 'term_id',
		"term"			=> 'term',
		"web_path"		=> 'web_path',
		"parent" 		=> 'parent',
		"childrens" 	=> 'childrens',

		'template_name' => 'template_name',
		"title"			=> 'title',
		'abstract' 		=> 'abstract',
		'body' 			=> 'body',
		'norder'		=> 'norder',
		'image'			=> 'image'
	]));



// suffix . Optional sufix for css/js files (normally '-min')
	define('CSS_SUFFIX', '');
	define('JS_SUFFIX' , ''); // -min



// safe images url . default false
	define('SAFE_IMAGES_URL', false);


