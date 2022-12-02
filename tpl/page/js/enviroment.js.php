<?php
# CONFIG
include(dirname(dirname(dirname(__FILE__))) . '/config/config.php');
# API PAGE GLOBALS
$page_globals = array(
	'JSON_TRIGGER_URL'			=> JSON_TRIGGER_URL,
	'SHOW_DEBUG'				=> SHOW_DEBUG,
	'__WEB_BASE_URL__'			=> __WEB_BASE_URL__,
	'WEB_CURRENT_LANG_CODE'		=> WEB_CURRENT_LANG_CODE,
	'__WEB_ROOT_WEB__'			=> __WEB_ROOT_WEB__,
	'__WEB_TEMPLATE_WEB__'		=> __WEB_TEMPLATE_WEB__,
	'WEB_ENTITY'				=> WEB_ENTITY,
	'__WEB_MEDIA_BASE_URL__'	=> __WEB_MEDIA_BASE_URL__,
	'WEB_DB'					=> WEB_DB,
	'API_WEB_USER_CODE'			=> API_WEB_USER_CODE,
	'OWN_CATALOG_ACRONYM' 		=> OWN_CATALOG_ACRONYM
);

$base_links = common::get_base_links();
define('BASE_LINKS', $base_links);

$lang_obj	= lang::get_lang_obj(WEB_CURRENT_LANG_CODE);
$titles		= json_encode($lang_obj, JSON_UNESCAPED_UNICODE);

# Page globals
header('Content-type: application/javascript');
?>
var page_globals=<?php echo json_encode($page_globals, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>;
SHOW_DEBUG=page_globals.SHOW_DEBUG;
var tstring=<?php echo $titles;?>;
__WEB_TEMPLATE_WEB__='<?php echo __WEB_TEMPLATE_WEB__ ?>';
BASE_LINKS='<?php echo ''. BASE_LINKS ?>';
IS_PRODUCTION=<?php echo json_encode(IS_PRODUCTION) ?>;
const dedalo_logged = typeof document!=='undefined' && document.cookie.indexOf('dedalo_logged')!==-1 ? true : false;

<?php if (defined('DEDALO_CONTROL_ACCESS') && DEDALO_CONTROL_ACCESS===true){ ?>
// dedalo_logged redirect
if (dedalo_logged!==true) {
	window.location.href = "/dedalo";
}
<?php } ?>


function dom_ready(fn) {
	if (document.readyState!=='loading'){
		fn();
	}else{
		document.addEventListener('DOMContentLoaded', fn);
	}
}