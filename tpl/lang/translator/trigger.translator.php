<?php
 // trigger.translator.php
$start_time=microtime(1);

	// includes
		// config
		include dirname(dirname(dirname(__FILE__))) . '/config/config.php';

	// header print as json data
		header('Content-Type: application/json');

	// get post vars
		$str_json = file_get_contents('php://input');
		//error_log(print_r($str_json,true));
		if (!empty($str_json)) {
			$options = json_decode( $str_json );
		}
		
	// action
		try {				

			$lang 		= $options->lang;
			$data 		= json_encode($options->data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
			$file_name 	= '../' . $lang . '.json';

			$action 	= file_put_contents($file_name, $data);

			$response = new stdClass();
				$response->result 	= $action;
				$response->msg 		= 'Action done';
			$result = json_encode($response, JSON_UNESCAPED_UNICODE);


		} catch (Exception $e) {
			$error_obj = new stdClass();
				$error_obj->result 	= false;
				$error_obj->msg 	= 'Exception when calling API: '. $e->getMessage();
			$result = json_encode($error_obj, JSON_UNESCAPED_UNICODE);				

			if(SHOW_DEBUG===true) {
				trigger_error($e->getMessage());
			}
		}
		

	// output
		echo $result;