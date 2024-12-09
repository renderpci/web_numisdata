<?php
/**
* JSON_WEB_DATA
* Manage web source data with mysql using http request
*
*/
class json_web_data {


	# Version. Important!
	static $version = "1.0.7"; // 21-05-2019


	/**
	* GET_DATA
	* Exec a remote connection and get remote data with options as JSON
	* @return object $rows_data
	*/
	public static function get_data($request_options) {
		#debug_log(__METHOD__." request_options ". PHP_EOL . debug_backtrace()[1]['function'] .PHP_EOL. to_string($request_options) , 'DEBUG');

		$start_time = microtime(1);

		$request_options = clone $request_options;

		$options = new stdClass();
			$options->JSON_TRIGGER_URL  	= defined('JSON_TRIGGER_URL') ? JSON_TRIGGER_URL : null;
			$options->API_WEB_USER_CODE 	= defined('API_WEB_USER_CODE') ? API_WEB_USER_CODE : null;
			$options->WEB_CURRENT_LANG_CODE = defined('WEB_CURRENT_LANG_CODE') ? WEB_CURRENT_LANG_CODE : null;
			foreach ($request_options as $key => $value) {if (property_exists($options, $key)) $options->$key = $value;}
				#dump($options, ' options ++ '.to_string());
				#dump($request_options, ' request_options ++ '.to_string());

		# Remove options lasn ad use as request specific var
		$lang 	 = isset($request_options->lang) ? $request_options->lang : $options->WEB_CURRENT_LANG_CODE;
		#unset($request_options->lang);

		# Remove options dedalo_get var and use as dir to url
		$api_dir = $request_options->dedalo_get;
		unset($request_options->dedalo_get);

		#
		# URL . JSON URL IN SERVER SIDE
		$url_base = $options->JSON_TRIGGER_URL . '' . $api_dir .'/';
		$fields   = array(
			"code"		=> $options->API_WEB_USER_CODE,
			"db_name"	=> WEB_DB,
			"options"	=> json_encode($request_options, JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_TAG | JSON_HEX_AMP ), // rawurlencode JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
		);
		$fields_pairs = array();
		foreach ($fields as $key => $value) {
			$fields_pairs[] = $key .'='. rawurlencode($value);
		}
		$fields_string = implode('&', $fields_pairs);
		$url = $url_base . '?'. $fields_string;

		#
		# REQUEST CONTENT TO SERVER
		$request_helper = 'curl';	# curl | http_post | file_get_contents
		switch ($request_helper) {
			case 'curl':
				$dedalo_data_file 	= self::file_get_contents_curl($url_base, $fields_pairs, $fields_string);
				break;
			case 'http_post':
				$response 			= self::http_post($url, $fields);
				$headers  			= $response['headers'];
				$dedalo_data_file 	= $response['content'];
				break;
			case 'file_get_contents':
			default:
				$dedalo_data_file 	= file_get_contents($url);
				break;
		}

		#
		# RECEIVED JSON DATA
		$dedalo_data = json_decode( $dedalo_data_file, false, 512, JSON_UNESCAPED_UNICODE );

		if (!is_object($dedalo_data)) {
			if (is_string($dedalo_data)) {
				$info = "Error. ".$dedalo_data_file;
			}else{
				$info = "Error in response results. dedalo_data is not and object (verify your server json .htaccess file): ".print_r($dedalo_data_file, true);
			}
			$dedalo_data = new stdClass();
				$dedalo_data->result = array();
				if(SHOW_DEBUG===true) {
					$dedalo_data->debug = new stdClass();
					$dedalo_data->debug->info = $info;
				}
		}

		$dedalo_data->debug = isset($dedalo_data->debug) && is_object($dedalo_data->debug)
			? $dedalo_data->debug
			: new stdClass();
		$dedalo_data->debug->total_time = round(microtime(1)-$start_time,3);


		return (object)$dedalo_data;
	}//end get_data



	/**
	* FILE_GET_CONTENTS_CURL
	*/
	public static function file_get_contents_curl($url, $ar_fields, $fields_string) {

		//open connection
		$ch = curl_init();

		//set the url, number of POST vars, POST data
		curl_setopt($ch, CURLOPT_URL, $url); // LIke http://domain.com/get-post.php
		curl_setopt($ch, CURLOPT_POST, count($ar_fields));
		curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_string);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);

		# Session managements
		#if (empty(session_save_path())) {
		#	session_save_path('/tmp');
		#}
		$cookie_path = session_save_path() . '/web_api_cookie';
		curl_setopt($ch, CURLOPT_COOKIESESSION, true);
		curl_setopt($ch, CURLOPT_COOKIEJAR, $cookie_path);
		curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie_path);

		# Avoid verify SSL certificates (very slow)
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

		//execute post
		$result = curl_exec($ch);

		//close connection
		curl_close($ch);

		return $result;
	}//end file_get_contents_curl



	/**
	* HTTP_POST
	*	Make an http POST request and return the response content and headers
	*	@param string $url    url of the requested script
	*	@param array $data    hash array of request variables
	*	@return returns a hash array with response content and headers in the following form:
	*    array ('content'=>'my string json data'
	*          ,'headers'=>array ('HTTP/1.1 200 OK', 'Connection: close', ...)
	*          )
	*/
	public static function http_post($url, $data) {

	    $data_url = http_build_query ($data);
	    $data_len = strlen ($data_url);

	    return array ('content'=>file_get_contents ($url, false, stream_context_create (array ('http'=>array (
	    		  'method'=>'POST'
	            , 'header'=>"Connection: close\r\nContent-Length: $data_len\r\nContent-Type: application/x-www-form-urlencoded\r\n"
	            , 'content'=>$data_url
	            ))))
	        , 'headers'=>$http_response_header
	        );
	}//end http_post



}//end json_web_data
