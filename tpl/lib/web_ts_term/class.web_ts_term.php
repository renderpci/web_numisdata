<?php
/**
* TS_TERM
* Object like tesaurus term
*
*/
class web_ts_term {


	static $version = "1.0.1"; // 03-03-2018



	/**
	* __CONSTRUCT
	* Private. Call using static web_ts_term::get_web_ts_term_instance($terminoID, $lang, $request_options)
	*/
	public function __construct( $data ) {
		
		if (is_object($data)) {
			foreach ($data as $key => $value) {
				$this->$key = $value;
			}
		}else{
			dump($data, ' data ++ '.to_string());
		}
	}//end __construct



	/**
	* GET_HTML
	* @return string $html
	*/
	public function get_html( $mode='list' ) {

		$class_name = 'web_ts_term';	//(new \ReflectionClass($this))->getShortName();

		#
		# HTML BUFFER
		ob_start();
		include ( dirname(__FILE__) .'/html/'. $class_name .'_'. $mode .'.phtml' );
		$html =  ob_get_clean();


		return $html;
	}//end get_html



	/**
	* CHECK_PUBLISHED
	* @return bool
	*/
	public static function check_published($locator) {

		// check valid interview
			$q_table 	= 'interview';
			$ar_fields 	= ['section_id'];
			$filter 	= '`section_id` = ' . (int)$locator->section_top_id;
			
			// API Query
				$options = new stdClass();
					$options->dedalo_get 	= 'records';
					$options->table  	 	= $q_table;
					$options->ar_fields  	= $ar_fields;
					$options->lang  	 	= WEB_CURRENT_LANG_CODE;
					$options->limit 		= 1;
					$options->sql_filter 	= $filter;
				
				# Http request in php to the API
				$web_data = json_web_data::get_data($options);
					#dump($web_data, ' web_data interview ++ '.to_string());
				if (empty($web_data->result)) {
					return false;
				}

		// check valid audiovisual
			$q_table 	= 'audiovisual';
			$ar_fields 	= ['section_id'];
			$filter 	= '`section_id` = ' . (int)$locator->section_id;
			
			// API Query
				$options = new stdClass();
					$options->dedalo_get 	= 'records';
					$options->table  	 	= $q_table;
					$options->ar_fields  	= $ar_fields;
					$options->lang  	 	= WEB_CURRENT_LANG_CODE;
					$options->limit 		= 1;
					$options->sql_filter 	= $filter;
				
				# Http request in php to the API
				$web_data = json_web_data::get_data($options);
					#dump($web_data, ' web_data audiovisual ++ '.to_string());
				if (empty($web_data->result)) {
					return false;
				}

		return true;
	}//end check_published


	
}//end class ts_term
?>