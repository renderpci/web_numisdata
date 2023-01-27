<?php

	include dirname(dirname(dirname(dirname(__FILE__)))) . '/config/config.php';

	#
	# JSON_CONTENT edit
	# $json_content is an object decoded from json file and available here

	# code
		# Set current code as default code config
		$json_content->parameters->code->default = API_WEB_USER_CODE;


	# code
		$json_content->parameters->db_name->default = WEB_DB;

	# host
		# Set current host as object config host
		$json_content->host = 'monedaiberica.org'; // DEDALO_PUBLICATION_SERVER_HOST; // DEDALO_PUBLICATION_SERVER_HOST; // 'monedaiberica.org';

	# basePath
		# Path where will be maded the calls (json trigger base path)
		$json_content->basePath = '/dedalo/lib/dedalo/publication/server_api/v1/json/';

	# Protocols
		# Create protocols selector based on current protocol
		$check_https = function() {
			if ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || $_SERVER['SERVER_PORT'] == 443) {
				return true;
			}
			return false;
		};
		$protocol  = true===$check_https() ? 'https' : 'http';
		$protocol2 = ($protocol==='http') ? 'https' : 'http';
		$json_content->schemes = [$protocol, $protocol2];

	# Defaults examples
		# records table
		# Overrides default table example for 'get_records'
		$records_path = '/records';
		$records_parameters = $json_content->paths->{$records_path}->post->parameters;
		#	print_r($records_parameters);
		$ar = array_filter($records_parameters, function($element){
			if (property_exists($element, 'name') && $element->name==='table') {
				$element->default = 'catalog'; // Overwrite default
				return true;
			}
		});