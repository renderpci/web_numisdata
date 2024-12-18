<?php
// config Dédalo API client (web_app)



// used to build absolute calls to elements
	define('__WEB_BASE_PATH__', dirname(dirname(dirname(__FILE__))));



// dedalo 4 private conf file
	$source_data_api = 'remote'; // remote , local



// custom development working vars (api client)
	define('WEB_ENTITY' 		,'coins');
	define('WEB_ENTITY_LABEL' 	,'My coins catalog');

// db . force use this db instead of default (useful for multiple publications)
	define('WEB_DB'	 ,'web_numisdata_coins');
	// define('WEB_DB'	 ,'web_numisdata_coins_pre');


// site config

	// __web_base_url__ . absolute url base to target web. Used to build absolute calls to elements
		define('__WEB_BASE_URL__', 'https://mycatalog.org');

	// media base url
		define('__WEB_MEDIA_BASE_URL__', 'https://mycatalog.org');

	// __web_root_web__
		$base = '/web_mycatalog';
		define('__WEB_ROOT_WEB__', $base);

	// is_production. used like 'mib_web'
		define('IS_PRODUCTION', true);

	// web_app_dir
		define('WEB_APP_DIR', 'web_app');

	// web_dispatch_dir
		define('WEB_DISPATCH_DIR', 'web');

	// OWN_CATALOG_ACRONYM
		define('OWN_CATALOG_ACRONYM', 'COINS');

	// EMAIL
		define('EMAIL', 'email@numisdata.org');

		// ISSB_ISSN
		define('ISSB_ISSN', null);
		define('ISSB_ISSN_URI', 'https://');

	// __web_template_web_
		define('__WEB_TEMPLATE_WEB__' , __WEB_ROOT_WEB__  .'/tpl' );
		define('__WEB_TEMPLATE_PATH__', __WEB_BASE_PATH__ .'/tpl');

	// version
		include(__WEB_TEMPLATE_PATH__ . '/version.inc');



// api config

	// json_trigger_url data source url
		define('JSON_TRIGGER_URL', ($source_data_api==='remote')
			? __WEB_BASE_URL__ . '/dedalo/lib/dedalo/publication/server_api/v1/json/'
			: __WEB_BASE_URL__ . '/dedalo/lib/dedalo/publication/server_api/v1/json/'
		);


	// json_web_data colector. PHP version http request manager (via CURL)
		include(__WEB_BASE_PATH__ .'/'. WEB_APP_DIR . '/api/class.json_web_data.php');

	// api_web_user_code
		# Verification user code (must be identical in config of client and server)
		define('API_WEB_USER_CODE', '654asdiKrhdTetQksluoQaW2'); // 5eDfj2ñlowqQqXjkas6sad87asWa

	// common core functions
		include(__WEB_BASE_PATH__ .'/'. WEB_APP_DIR . '/common/class.page.php');
		include(__WEB_BASE_PATH__ .'/'. WEB_APP_DIR . '/common/class.common.php');
		include(__WEB_BASE_PATH__ .'/'. WEB_APP_DIR . '/common/class.lang.php');

	// web_current_lang_code. If received lang use it, else use default lg-ell (greek)
		if (session_status() !== PHP_SESSION_ACTIVE) {
			session_name('web_'.WEB_ENTITY);
			session_start();
		}

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



// debug . Show / hide debug messages
	define('SHOW_DEBUG', (isset($_SESSION['dedalo4']['auth']['user_id']) && $_SESSION['dedalo4']['auth']['user_id']==-1)
		? true
		: true
	);



// web config
	define('WEB_MENU_TABLE', 		'ts_web');
	define('WEB_MENU_SECTION_TIPO', 'numisdata349');
	define('WEB_MENU_PARENT', 		'numisdata349_1');
	define('WEB_HOME_PATH', 		'web');

	define('WEB_AR_LANGS', json_encode([
		"lg-spa" => "Castellano",
		"lg-eng" => "English",
		"lg-fra" => "Français",
		"lg-ita" => "Italiano",
		"lg-por" => "Português",
		"lg-cat" => "Valencià"
	]));

	define('WEB_MAP_PROVIDER_URL', '//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');

	# Web template file json
	define('WEB_TEMPLATE_MAP', __WEB_BASE_PATH__ .'/config/template_maps/'.WEB_ENTITY);
	define('WEB_TEMPLATE_MAP_DEFAULT_SOURCE', 'db');

	# web_path_map . run name map for url's path like redirect 'mon' to 'catalogo'
	define('WEB_PATH_MAP',	[]);



// libraries
	define('BUILD_BREADCRUMB', false);



// table to temple
	define('TABLE_TO_TEMPLATE', json_encode([]));



// fields map
	define('WEB_FIELDS_MAP', json_encode([
		'section_id'	=> 'section_id',
		'term_id'		=> 'term_id',
		'term'			=> 'term',
		'web_path'		=> 'web_path',
		'menu'			=> 'menu',
		'active'		=> 'active',
		'parent'		=> 'parent',
		'children'		=> 'children',
		'template_name'	=> 'template_name',
		'title'			=> 'titulo', // before standard (compatibility)
		'abstract'		=> 'entradilla',
		'body'			=> 'cuerpo',
		'norder'		=> 'norder',
		'image'			=> 'imagen'
	]));



// suffix
	define('CSS_SUFFIX', '');
	define('JS_SUFFIX' , '-min'); // -min



// safe images url
	define('SAFE_IMAGES_URL', false);



// sendmail
	// mailer. Send configuration
		$mconfig = (object)[
			'Host'			=> 'smtp.mydomain.org',
			'SMTPAuth'		=> true,
			'Username'		=> 'user@mydomain.org',
			'Password'		=> 'XXXXXXXXXXXXXXXXX',
			'SMTPSecure'	=> 'tls',
			'Port'			=> 587
		];
	// mail vars config
		// sender info
		$mconfig->From		= $mconfig->Username;
		$mconfig->FromName	= "Site mydomain.org";
		// target info
		$mconfig->to		= 'user@mydomain.org';
		$mconfig->reply_to	= 'no-reply@mydomain.org';
		$mconfig->bcc		= 'webmaster@mydomain.org';
	// mail header logo
		$logo_url = 'https://mydomain.org/images/logo.svg';



// DEDALO_CONTROL_ACCESS. On true, web environment search for 'dedalo_logged' cookie. If not found, redirect page to /dedalo
	define('DEDALO_CONTROL_ACCESS', true);
