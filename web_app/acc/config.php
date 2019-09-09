<?php 
# config Dédalo API client (web_app)

# Used to build absolute calls to elements
define('__WEB_BASE_PATH__', dirname(dirname(dirname(__FILE__))));
/*
################################################################
# DEDALO 4 PRIVATE CONF FILE
	$file = 'web_app2_config.inc';
	$dir  = '/Users/paco/Trabajos/Dedalo/private/';
	$path = $dir . $file;
	include $path;
	*/


# Used to build absolute calls to elements
#define('__WEB_BASE_PATH__', __WEB_BASE_PATH__);



################################################################
# CUSTOM Development working vars (API CLIENT)
	$WEB_ENTITY = $_SERVER['SERVER_NAME'];
	if (isset($_GET['WEB_ENTITY'])) {
		$WEB_ENTITY = $_GET['WEB_ENTITY'];
	}
	define('WEB_ENTITY',$WEB_ENTITY);
	
	switch (WEB_ENTITY) {
		case 'bene':
		case 'hall_bene':
			$JSON_TRIGGER_URL 	= 'http://bene:8080/dedalo/lib/dedalo/publication/server_api/v1/json/';
			$API_WEB_USER_CODE 	= 'mckusteQlsadjEHgs34';
			$DEFAULT_LANG 		= 'lg-spa';
			$__WEB_BASE_URL__ 	= '';
			break;
		case 'cedis':
		case 'zwarolp':
			$JSON_TRIGGER_URL 	= 'http://dedalo.cedis.fu-berlin.de/dedalo/lib/dedalo/publication/server_api/v1/json/';
			$API_WEB_USER_CODE 	= '85df5s$dKlw8adQdp€';
			$DEFAULT_LANG 		= 'lg-ell';
			$__WEB_BASE_URL__ 	= 'http://dedalo.cedis.fu-berlin.de';
			break;
		case 'mdcat':
			#$JSON_TRIGGER_URL 	= 'https://dedalo4.bancmemorial.extranet.gencat.cat/dedalo/lib/dedalo/publication/server_api/v1/json/';
			$JSON_TRIGGER_URL 	= 'http://mdcat:8080/dedalo/lib/dedalo/publication/server_api/v1/json/';
			$API_WEB_USER_CODE 	= '85df5s$4KueñwQw5O2p4J1G9';
			$DEFAULT_LANG 		= 'lg-cat';
			$__WEB_BASE_URL__ 	= 'https://dedalo4.bancmemorial.extranet.gencat.cat';
			break;
		case 'memoria':
		case 'memoria_historica':
			$JSON_TRIGGER_URL 	= 'http://memoria:8080/dedalo/lib/dedalo/publication/server_api/v1/json/';
			#$JSON_TRIGGER_URL 	= 'http://memoria.dival.es/dedalo/lib/dedalo/publication/server_api/v1/json/';
			$API_WEB_USER_CODE 	= 'gkaiue6jkSgwR8524PjKqsw8';
			$DEFAULT_LANG 		= 'lg-vlca';
			#$__WEB_BASE_URL__ 	= '';
			$__WEB_BASE_URL__ 	= 'http://memoria.dival.es';
			break;
		case 'mht':
			$JSON_TRIGGER_URL 	= 'http://mht:8080/dedalo/lib/dedalo/publication/server_api/v1/json/';
			#$JSON_TRIGGER_URL 	= 'https://mujerymemoria.org/dedalo/lib/dedalo/publication/server_api/v1/json/';
			$API_WEB_USER_CODE 	= '5eDfj2ñlowqQqXjkas6sad87asWa';
			$DEFAULT_LANG 		= 'lg-spa';
			$__WEB_BASE_URL__ 	= 'https://mujerymemoria.org';
			break;	
		case 'murapa':
			$JSON_TRIGGER_URL 	= 'http://murapa:8080/dedalo/lib/dedalo/publication/server_api/v1/json/'; // 
			#$JSON_TRIGGER_URL 	= 'http://murapa.antropolis.net/dedalo/lib/dedalo/publication/server_api/v1/json/';
			$API_WEB_USER_CODE 	= '7WwlaksuQo5s0sjh2aWsFGaT97514lokjuTgd3';
			$DEFAULT_LANG 		= 'lg-vlca';			
			$__WEB_BASE_URL__ 	= 'http://murapa.antropolis.net';
			break;			
		case 'mupreva':
			$JSON_TRIGGER_URL 	= 'http://mupreva:8080/dedalo/lib/dedalo/publication/server_api/v1/json/';
			$API_WEB_USER_CODE 	= 'lsi8wM5s$4KueñwkoPwgs';
			$DEFAULT_LANG 		= 'lg-vlca';
			$__WEB_BASE_URL__ 	= 'http://www.museodeprehistoria.es';
			#$__WEB_BASE_URL__ 	= 'http://mupreva:8080';
			break;
		case 'sardinia':
			$JSON_TRIGGER_URL 	= 'http://sardinia:8080/dedalo/lib/dedalo/publication/server_api/v1/json/';
			#$JSON_TRIGGER_URL 	= 'http://sardinia.antropolis.net/dedalo/lib/dedalo/publication/server_api/v1/json/';
			$API_WEB_USER_CODE 	= 'lkwMasErM5wQ4KuÑksq43feA';
			$DEFAULT_LANG 		= 'lg-spa';
			$__WEB_BASE_URL__ 	= 'http://sardinia.antropolis.net';
			break;
		case 'emakumeak':
			$JSON_TRIGGER_URL 	= 'http://emakumeak:8080/dedalo/lib/dedalo/publication/server_api/v1/json/';
			#$JSON_TRIGGER_URL 	= 'http://sardinia.antropolis.net/dedalo/lib/dedalo/publication/server_api/v1/json/';
			$API_WEB_USER_CODE 	= 'pLusjE_Aeksj1wqD39kwnJhsq2';
			$DEFAULT_LANG 		= 'lg-spa';
			$__WEB_BASE_URL__ 	= 'http://emakumeak.antropolis.net';
			break;		
		case '192.168.0.7':
			$JSON_TRIGGER_URL 	= 'http://192.168.0.7:8080/dedalo/lib/dedalo/publication/server_api/v1/json/';
			$API_WEB_USER_CODE 	= '23df5s$85fKdw9wQ679z';
			$DEFAULT_LANG 		= 'lg-eng';
			$__WEB_BASE_URL__ 	= 'http://192.168.0.7:8080';
			break;
		default:
			exit("Please, configure this API connection entity: <strong>".$_SERVER['SERVER_NAME']."</strong>");
			break;
	}//end switch ($_SERVER['SERVER_NAME']) 



################################################################
# SITE CONFIG

	# __WEB_BASE_URL__ . Absolute url base to target web
	# Used to build absolute calls to elements
	define('__WEB_BASE_URL__', $__WEB_BASE_URL__);

	# __WEB_ROOT_WEB__ . Relative url base to current web initial folder
	#$base = parse_url($_SERVER["REQUEST_URI"])['path'];	
	#$base = substr($base,0,-1); # Remove last /	
	#$base = substr( $base, 0, strrpos($base, '/web/') ); // Use only from begin until /web path
	#error_log("base: $base");
	#echo $base;
	#$base2 = substr( $base, 0, strrpos($base, '/') );
	#$base2 = '/dedalo4/lib/dedalo/publication/client_api/v1/web_app';	 // sample2
	#switch (WEB_ENTITY) {
	#	case 'mupreva':
	#		$base2 = '/web_yacimientos';
	#		break;		
	#	default:
	#		$base2 = '/web_'.WEB_ENTITY;
	#}
	#$base2 = '/web_app2';
	$base2 = '/maternidades_robadas';
	
	#echo "$base <br> $base2";	
	define('__WEB_ROOT_WEB__', $base2);
	#error_log("__WEB_ROOT_WEB__: ".__WEB_ROOT_WEB__);

	# WEB_DISPATCH_DIR
	define('WEB_APP_DIR', 'web_app');	

	# WEB_DISPATCH_DIR
	define('WEB_DISPATCH_DIR', 'web');

	# __WEB_TEMPLATE_WEB_
	#define('__WEB_TEMPLATE_WEB__', __WEB_ROOT_WEB__ .'/'. WEB_DISPATCH_DIR . '/tpl/' . WEB_ENTITY );
	define('__WEB_TEMPLATE_WEB__', __WEB_ROOT_WEB__ .'/tpl' );
	define('__WEB_TEMPLATE_PATH__', __WEB_BASE_PATH__ .'/tpl');
	#exit(__WEB_TEMPLATE_PATH__);
		
	# Files
	#include(__WEB_BASE_PATH__ . '/common/core.php');	
	include(__WEB_TEMPLATE_PATH__ . '/version.inc');



################################################################
# API CONFIG
	
	# JSON_TRIGGER_URL data source url
	define('JSON_TRIGGER_URL', $JSON_TRIGGER_URL);
	
	# API_WEB_USER_CODE
	# Verification user code (must be identical in config of client and server)
	define('API_WEB_USER_CODE', $API_WEB_USER_CODE);

	# COMMON core functions
	include(__WEB_BASE_PATH__ .'/'. WEB_APP_DIR . '/common/class.page.php');
	include(__WEB_BASE_PATH__ .'/'. WEB_APP_DIR . '/common/class.common.php');
	include(__WEB_BASE_PATH__ .'/'. WEB_APP_DIR . '/common/class.lang.php');

	# WEB_CURRENT_LANG_CODE
	# If received lang use it, else use default lg-ell (greek)
	if (session_status() !== PHP_SESSION_ACTIVE) {
		session_name('web_'.WEB_ENTITY);
		session_start();
	}
	# Lang cascade set
	define('WEB_DEFAULT_LANG_CODE', $DEFAULT_LANG);
	if (isset($_GET['lang'])) {
		$lang = $_GET['lang'];
		$_SESSION['web']['lang'] = $lang;
	}elseif (isset($_SESSION['web']['lang'])) {
		$lang = $_SESSION['web']['lang'];		
	}else{
		$lang = $DEFAULT_LANG;
	}
	if (strpos($lang, 'lg-')===false) {
		$lang = lang2iso3($lang);
	}
	define('WEB_CURRENT_LANG_CODE', $lang);
	define('WEB_LANG_BASE_PATH', __WEB_TEMPLATE_PATH__ . '/lang/');

		

	# SHOW_DEBUG
	# Show / hide debug messages
	$SHOW_DEBUG = true;
	#print_r($_SESSION); die();
	if (isset($_SESSION['dedalo4']['auth']['user_id']) && $_SESSION['dedalo4']['auth']['user_id']==-1) {
		$SHOW_DEBUG = true;
	}
	define('SHOW_DEBUG', $SHOW_DEBUG);



	# JSON_WEB_DATA COLECTOR
	# PHP version http request manager (via CURL)
	include(__WEB_BASE_PATH__ .'/'. WEB_APP_DIR . '/api/class.json_web_data.php');


	/*
	$class = new ReflectionClass('Titles');
	$arr = $class->getStaticProperties();
		#dump($arr, ' arr ++ '.to_string());
	$arr = json_encode($arr, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE); // , 
		dump($arr, ' arr ++ '.to_string()); die();
	*/



################################################################
# WEB CONFIG
	switch (WEB_ENTITY) {
		case 'bene':
			$WEB_MENU_TABLE 				 = 'ts_web_bene';
			$WEB_MENU_SECTION_TIPO 			 = '';
			$WEB_MENU_PARENT 				 = '';
			$WEB_TEMPLATE_MAP 				 = __WEB_BASE_PATH__ .'/config/template_maps/'.WEB_ENTITY;
			$WEB_TEMPLATE_MAP_DEFAULT_SOURCE = 'file'; // file | db
			$WEB_HOME_PATH 					 = 'web';
			$WEB_AR_LANGS 					 = [
				"lg-vlca" => "Valencià",
				"lg-spa" => "Castellano"
			];
			// Maps
			$WEB_MAP_PROVIDER_URL = '//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
			$WEB_PATH_MAP = [];
			break;
		case 'emakumeak':
			$WEB_MENU_TABLE 				 = 'ts_web';
			$WEB_MENU_SECTION_TIPO 			 = 'ww1';
			$WEB_MENU_PARENT 				 = 'ww1_1';
			$WEB_TEMPLATE_MAP 				 = __WEB_BASE_PATH__ .'/config/template_maps/'.WEB_ENTITY;
			$WEB_TEMPLATE_MAP_DEFAULT_SOURCE = 'db'; // file | db
			$WEB_HOME_PATH 					 = 'web';
			$WEB_AR_LANGS 					 = [
				"lg-spa" => "Castellano",				
				"lg-eus" => "Euskara",
				"lg-eng" => "English"
			];
			// Maps
			$WEB_MAP_PROVIDER_URL = '//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
			$WEB_PATH_MAP = [];
			break;
		case 'memoria':
			$WEB_MENU_TABLE 				 = '';
			$WEB_MENU_SECTION_TIPO 			 = '';
			$WEB_MENU_PARENT 				 = '';
			$WEB_TEMPLATE_MAP 				 = __WEB_BASE_PATH__ .'/config/template_maps/'.WEB_ENTITY;
			$WEB_TEMPLATE_MAP_DEFAULT_SOURCE = 'file'; // file | db
			$WEB_HOME_PATH 					 = 'web';
			$WEB_AR_LANGS 					 = [
				"lg-vlca" => "Valencià",
				"lg-spa" => "Castellano"
			];
			// Maps
			$WEB_MAP_PROVIDER_URL = '//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
			$WEB_PATH_MAP = [];
			break;
		case 'murapa':
			$WEB_MENU_TABLE 				 = 'ts_web';
			$WEB_MENU_SECTION_TIPO 			 = 'ww1';
			$WEB_MENU_PARENT 				 = 'ww1_1';
			$WEB_TEMPLATE_MAP 				 = __WEB_BASE_PATH__ .'/config/template_maps/'.WEB_ENTITY;
			$WEB_TEMPLATE_MAP_DEFAULT_SOURCE = 'db'; // file | db
			$WEB_HOME_PATH 					 = 'web';
			$WEB_AR_LANGS 					 = [
				"lg-vlca" => "Valencià",
				"lg-spa" => "Castellano"
			];
			// Maps
			$WEB_MAP_PROVIDER_URL = '//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
			$WEB_PATH_MAP = [];
			break;
		case 'mdcat':
			$WEB_MENU_TABLE 				 = null;
			$WEB_MENU_SECTION_TIPO 			 = null;
			$WEB_MENU_PARENT 				 = null;
			$WEB_TEMPLATE_MAP 				 = null;
			$WEB_TEMPLATE_MAP_DEFAULT_SOURCE = 'file'; // file | db
			$WEB_HOME_PATH 					 = 'web';
			$WEB_AR_LANGS 					 = [
				"lg-cat" => "Català",
				"lg-spa" => "Castellano",			
				"lg-eng" => "English",
				"lg-fra" => "Français"
			];
			// Maps
			$WEB_MAP_PROVIDER_URL = '//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
			$WEB_PATH_MAP = [];
			break;
		case 'mht':
			$WEB_MENU_TABLE 				 = 'ts_web_maternidades';
			$WEB_MENU_SECTION_TIPO 			 = 'mht72';
			$WEB_MENU_PARENT 				 = 'mht72_1';
			$WEB_TEMPLATE_MAP 				 = __WEB_BASE_PATH__ .'/config/template_maps/'.WEB_ENTITY;
			$WEB_TEMPLATE_MAP_DEFAULT_SOURCE = 'db'; // file | db
			$WEB_HOME_PATH 					 = 'web';
			$WEB_AR_LANGS 					 = [
				"lg-spa" => "Castellano",
				"lg-eng" => "English"
			];
			// Maps
			$WEB_MAP_PROVIDER_URL = '//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
			$WEB_PATH_MAP = [];
			break;
		case 'mupreva':
			$WEB_MENU_TABLE 				 = 'ts_web_yacimientos';
			$WEB_MENU_SECTION_TIPO 			 = 'mupreva2564';
			$WEB_MENU_PARENT 				 = 'mupreva2564_1';
			$WEB_TEMPLATE_MAP 				 = __WEB_BASE_PATH__ .'/config/template_maps/'.WEB_ENTITY;
			$WEB_TEMPLATE_MAP_DEFAULT_SOURCE = 'db'; // db | file
			$WEB_HOME_PATH 					 = 'yacimientos';
			$WEB_AR_LANGS 					 = [
				"lg-vlca" => "Valencià",
				"lg-spa"  => "Castellano",				
				"lg-eng"  => "English",
			];
			// Maps
			$WEB_MAP_PROVIDER_URL = '//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
			$WEB_PATH_MAP = [];
			break;
		case 'sardinia':
			$WEB_MENU_TABLE 				 = 'ts_web_sardinia';
			$WEB_MENU_SECTION_TIPO 			 = 'numisdata349';
			$WEB_MENU_PARENT 				 = 'numisdata349_1';
			$WEB_TEMPLATE_MAP 				 = __WEB_BASE_PATH__ .'/config/template_maps/'.WEB_ENTITY;
			$WEB_TEMPLATE_MAP_DEFAULT_SOURCE = 'db'; // file | db
			$WEB_HOME_PATH 					 = 'web';
			$WEB_AR_LANGS 					 = [
				"lg-spa" => "Castellano",
				"lg-ita" => "Italiano",
				"lg-fra" => "Français",
				"lg-eng" => "English"
			];
			// Maps
			$WEB_MAP_PROVIDER_URL = '//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
			$WEB_PATH_MAP = [
				#'mon' => 'catalogo'
			];
			break;		
		default:
			$WEB_MENU_TABLE 				 = null;
			$WEB_MENU_SECTION_TIPO 			 = null;
			$WEB_MENU_PARENT 				 = null;
			$WEB_TEMPLATE_MAP 				 = null;
			$WEB_TEMPLATE_MAP_DEFAULT_SOURCE = 'file'; // file | db
			$WEB_HOME_PATH 					 = 'web';
			$WEB_AR_LANGS 					 = [
				"lg-spa" => "Castellano",
				"lg-vlca" => "Valencià",
				"lg-eng" => "English",
			];
			// Maps
			$WEB_MAP_PROVIDER_URL = '//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
			$WEB_PATH_MAP = [];
			break;
	}//end switch (WEB_ENTITY)

	define('WEB_MENU_TABLE', 		$WEB_MENU_TABLE);
	define('WEB_MENU_SECTION_TIPO', $WEB_MENU_SECTION_TIPO);
	define('WEB_MENU_PARENT', 		$WEB_MENU_PARENT);
	define('WEB_HOME_PATH', 		$WEB_HOME_PATH);

	define('WEB_AR_LANGS', json_encode($WEB_AR_LANGS));

	define('WEB_MAP_PROVIDER_URL',	$WEB_MAP_PROVIDER_URL);

	# Web template file json
	define('WEB_TEMPLATE_MAP', 				 $WEB_TEMPLATE_MAP);
	define('WEB_TEMPLATE_MAP_DEFAULT_SOURCE',$WEB_TEMPLATE_MAP_DEFAULT_SOURCE);

	# WEB_PATH_MAP . Run name map for url's path Like redirect 'mon' to 'catalogo'
	define('WEB_PATH_MAP',	$WEB_PATH_MAP);



################################################################
# LIBRARIES
	switch (WEB_ENTITY) {
		case 'emakumeak':
			/*
			// JQuery
			page::$js_ar_url[]   	= __WEB_ROOT_WEB__ . '/lib/jquery/jquery.min.js';
			#page::$js_ar_url[]   	= '//code.jquery.com/jquery-3.2.1.slim.min.js';

			// JQuery ColorBox
			page::$js_ar_url[]   	= __WEB_ROOT_WEB__ . '/lib/jquery-colorbox/jquery.colorbox-min.js';
			page::$css_ar_url[]  	= __WEB_ROOT_WEB__ . '/lib/jquery-colorbox/example4/colorbox.css';

			# jquery ui
			page::$css_ar_url[] 	= __WEB_ROOT_WEB__ . '/lib/jquery/jquery-ui/jquery-ui.min.css';
			page::$js_ar_url[]  	= __WEB_ROOT_WEB__ . '/lib/jquery/jquery-ui/jquery-ui.min.js';

			// Bootstrap 4
			page::$css_ar_url[]  	= 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css';
			page::$js_ar_url[]   	= 'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js';
			page::$js_ar_url[]   	= 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js';

			// Maps
			$WEB_MAP_PROVIDER_URL = '//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
			// leaflet
			page::$js_ar_url[]   	= __WEB_ROOT_WEB__ . '/lib/leaflet/leaflet.js';
			page::$css_ar_url[]  	= __WEB_ROOT_WEB__ . '/lib/leaflet/leaflet.css';

			// fontawesome
			#page::$css_ar_url[]  	= __WEB_ROOT_WEB__ . '/lib/fontawesome/fa-brands.css';
			page::$css_ar_url[]  	= __WEB_ROOT_WEB__ . '/lib/fontawesome/css/fontawesome-all.css';

			// Menu
			#page::$css_ar_url[] = __WEB_ROOT_WEB__ . '/'. WEB_DISPATCH_DIR. '/tpl/' . WEB_ENTITY . '/menu/css/menu.css';
			*/
			$BUILD_BREADCRUMB = false;
			break;		
		case 'mht':
			/*
			// JQuery
			page::$js_ar_url[]   	= __WEB_ROOT_WEB__ . '/lib/jquery/jquery.min.js';
			#page::$js_ar_url[]   	= '//code.jquery.com/jquery-3.2.1.slim.min.js';

			// Bootstrap 4
			page::$css_ar_url[]  	= 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css';
			page::$js_ar_url[]   	= 'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js';
			page::$js_ar_url[]   	= 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js';

			// Maps
			$WEB_MAP_PROVIDER_URL = '//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
			
			// Menu
			page::$css_ar_url[] = __WEB_ROOT_WEB__ . '/'. WEB_DISPATCH_DIR. '/tpl/' . WEB_ENTITY . '/menu/css/menu.css';
			$BUILD_BREADCRUMB = false;

			# Include custom class
			include __WEB_BASE_PATH__ . '/'. WEB_DISPATCH_DIR. '/tpl/' . WEB_ENTITY . '/common/class.mht.php';
			*/
			$BUILD_BREADCRUMB = false;
			break;
		case 'mupreva':	
			// JQuery
			page::$js_ar_url[]   	= __WEB_ROOT_WEB__ . '/lib/jquery/jquery.min.js';
			#page::$js_ar_url[]   	= '//code.jquery.com/jquery-3.2.1.slim.min.js';

			// JQuery ColorBox
			// Colorbox see http://www.jacklmoore.com/colorbox/
			page::$js_ar_url[]   	= __WEB_ROOT_WEB__ . '/lib/jquery-colorbox/jquery.colorbox-min.js';
			page::$css_ar_url[]  	= __WEB_ROOT_WEB__ . '/lib/jquery-colorbox/example4/colorbox.css';

			// Bootstrap 4
			page::$css_ar_url[]  	= '//maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.min.css';
			page::$js_ar_url[]   	= '//cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.3/umd/popper.min.js';
			page::$js_ar_url[]   	= '//maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/js/bootstrap.min.js';

			// Maps
			$WEB_MAP_PROVIDER_URL = '//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
			// leaflet
			page::$js_ar_url[]   	= __WEB_ROOT_WEB__ . '/lib/leaflet/leaflet.js';
			page::$css_ar_url[]  	= __WEB_ROOT_WEB__ . '/lib/leaflet/leaflet.css';

			// Menu
			page::$css_ar_url[] = __WEB_ROOT_WEB__ . '/'. WEB_DISPATCH_DIR. '/tpl/' . WEB_ENTITY . '/menu/css/menu.css';

			$BUILD_BREADCRUMB = true;
			break;

		case 'sardinia':
			// JQuery
			page::$js_ar_url[]   	= __WEB_ROOT_WEB__ . '/lib/jquery/jquery.min.js';
			#page::$js_ar_url[]   	= '//code.jquery.com/jquery-3.2.1.slim.min.js';

			// JQuery ColorBox
			page::$js_ar_url[]   	= __WEB_ROOT_WEB__ . '/lib/jquery-colorbox/jquery.colorbox-min.js';
			page::$css_ar_url[]  	= __WEB_ROOT_WEB__ . '/lib/jquery-colorbox/example4/colorbox.css';

			# jquery ui
			page::$css_ar_url[] 	= __WEB_ROOT_WEB__ . '/lib/jquery/jquery-ui/jquery-ui.min.css';
			page::$js_ar_url[]  	= __WEB_ROOT_WEB__ . '/lib/jquery/jquery-ui/jquery-ui.min.js';

			// Bootstrap 4
			page::$css_ar_url[]  	= 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css';
			page::$js_ar_url[]   	= 'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js';
			page::$js_ar_url[]   	= 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js';

			// Maps
			$WEB_MAP_PROVIDER_URL = '//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
			// leaflet
			page::$js_ar_url[]   	= __WEB_ROOT_WEB__ . '/lib/leaflet/leaflet.js';
			page::$css_ar_url[]  	= __WEB_ROOT_WEB__ . '/lib/leaflet/leaflet.css';

			// fontawesome
			#page::$css_ar_url[]  	= __WEB_ROOT_WEB__ . '/lib/fontawesome/fa-brands.css';
			page::$css_ar_url[]  	= __WEB_ROOT_WEB__ . '/lib/fontawesome/css/fontawesome-all.css';

			// Menu
			page::$css_ar_url[] = __WEB_ROOT_WEB__ . '/'. WEB_DISPATCH_DIR. '/tpl/' . WEB_ENTITY . '/menu/css/menu.css';
			
			$BUILD_BREADCRUMB = false;
			break;		

		case 'murapa':
			// JQuery
			page::$js_ar_url[]   	= __WEB_ROOT_WEB__ . '/lib/jquery/jquery.min.js';
			#page::$js_ar_url[]   	= '//code.jquery.com/jquery-3.2.1.slim.min.js';

			// JQuery ColorBox
			page::$js_ar_url[]   	= __WEB_ROOT_WEB__ . '/lib/jquery-colorbox/jquery.colorbox-min.js';
			page::$css_ar_url[]  	= __WEB_ROOT_WEB__ . '/lib/jquery-colorbox/example4/colorbox.css';

			# jquery ui
			page::$css_ar_url[] 	= __WEB_ROOT_WEB__ . '/lib/jquery/jquery-ui/jquery-ui.min.css';
			page::$js_ar_url[]  	= __WEB_ROOT_WEB__ . '/lib/jquery/jquery-ui/jquery-ui.min.js';

			// Bootstrap 4
			page::$css_ar_url[]  	= 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css';
			page::$js_ar_url[]   	= 'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js';
			page::$js_ar_url[]   	= 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js';

			// Maps
			$WEB_MAP_PROVIDER_URL = '//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
			// leaflet
			page::$js_ar_url[]   	= __WEB_ROOT_WEB__ . '/lib/leaflet/leaflet.js';
			page::$css_ar_url[]  	= __WEB_ROOT_WEB__ . '/lib/leaflet/leaflet.css';

			// fontawesome
			#page::$css_ar_url[]  	= __WEB_ROOT_WEB__ . '/lib/fontawesome/fa-brands.css';
			page::$css_ar_url[]  	= __WEB_ROOT_WEB__ . '/lib/fontawesome/css/fontawesome-all.css';

			// Menu
			page::$css_ar_url[] = __WEB_ROOT_WEB__ . '/'. WEB_DISPATCH_DIR. '/tpl/' . WEB_ENTITY . '/menu/css/menu.css';
			
			$BUILD_BREADCRUMB = false;
			break;

		default:
			$BUILD_BREADCRUMB = true;
			break;
	}//end switch (WEB_ENTITY)
	define('BUILD_BREADCRUMB',$BUILD_BREADCRUMB);



################################################################
# TABLE TO TEMPLE
	switch (WEB_ENTITY) {
		case 'mupreva':		
			$TABLE_TO_TEMPLATE = ['all' => 'site_area'];
			break;		
		default:
			$TABLE_TO_TEMPLATE = [];
			break;
	}//end switch (WEB_ENTITY)
	define('TABLE_TO_TEMPLATE', json_encode($TABLE_TO_TEMPLATE));



################################################################
# FIELDS MAP
	switch (WEB_ENTITY) {
		case 'bene':
		case 'mdcat':
		case 'memoria':
		case 'mupreva':
		case 'sardinia':
		case 'mht':
			// First projects (using 'titulo')
			$WEB_FIELDS_MAP = array(
				"term_id" 	=> 'term_id',
				"term"		=> 'term',
				"web_path"	=> 'web_path',
				"title"		=> 'titulo', // before standard (compatibility)
				"parent" 	=> 'parent',
				"childrens" => 'childrens'
			);
			break;
		default:
			// New projects	(using standard ww structure)
			$WEB_FIELDS_MAP = array(
				"term_id" 	=> 'term_id',
				"term"		=> 'term',
				"web_path"	=> 'web_path',
				"title"		=> 'title',
				"parent" 	=> 'parent',
				"childrens" => 'childrens'
			);
	}
	define('WEB_FIELDS_MAP', json_encode($WEB_FIELDS_MAP));


// suffix
	define('CSS_SUFFIX', '');
	define('JS_SUFFIX' , ''); // -min


// safe images url
	define('SAFE_IMAGES_URL', true);


