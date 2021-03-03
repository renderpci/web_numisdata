<?php
// edited 11-09-2016

include dirname(dirname(dirname(__FILE__))) . '/config/config.php';

// close access
	// $ip = 	getenv('HTTP_CLIENT_IP')?:
	// 		getenv('HTTP_X_FORWARDED_FOR')?:
	// 		getenv('HTTP_X_FORWARDED')?:
	// 		getenv('HTTP_FORWARDED_FOR')?:
	// 		getenv('HTTP_FORWARDED')?:
	// 		getenv('REMOTE_ADDR');
	// $allow_ip = ['127.0.0.1','localhost','::1'];
	// if (!in_array($ip, $allow_ip)) {
	// 	die("You don't have access here! ".$ip);
	// }	


// base lang
	$base_lang = $_GET['lang'] ?? 'lg-eng';

// read all files in parent directory
	chdir('../');
	$files = glob("*.json");

	$data = [];
	foreach ($files as $key => $file_name) {
		$current_lang = substr($file_name, 0, -5);
		$data[$current_lang] = json_decode(file_get_contents($file_name));
	}
	#dump($data, ' data ++ '.to_string());

	$options = new stdClass();
		$options->data 		= $data;
		$options->base_lang = $base_lang;
		
?>
<!DOCTYPE html>
<html>
<head>
	<title>Translator</title>
	<style type="text/css" media="screen">
		input {
			width: 12.8%;
			padding: 0.6em;
			margin: 0;
			border: none;
			outline: 1px solid #c1c1c1;
			font-size: 1em;
			transition: 0.20s linear all;
		}
		input:focus  {
			background-color: #F2F2F2; 
		}
		input.saved {
			background-color: #CEF5AF;
		}
		input.not_saved {
			background-color: #FF0000;
		}
		input.header {
			background-color: #E84B12;
			color: white;
			position: sticky;
			top: 4px;
		}		
	</style>
	<script type="module">
		import {init_translator} from './translator.js';		
		init_translator(<?php echo json_encode($options) ?>)
	</script>
</head>
<body>
	<div id="main"></div>
</body>
</html>