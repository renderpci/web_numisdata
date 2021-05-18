<?php

	
	// get vars from json object
		$str_json		= file_get_contents('php://input');
		$json_object	= !empty($str_json)
			? json_decode( $str_json )
			: null;


	// vars request
		$Subject	= $json_object->mail->subject ?? '';
		$AltBody	= $json_object->mail->message ?? ''; // Plain text mail body


	// mailer. Send configuration
		$mconfig = (object)[
			'Host'			=> 'smtp.ionos.es',
			'SMTPAuth'		=> true,
			'Username'		=> 'boot@render.es', 		// 'boot@render.es',
			'Password'		=> 'mogfym-3Kawbu-mofjyv', 	// 'mogfym-3Kawbu-mofjyv',
			'SMTPSecure'	=> 'tls',
			'Port'			=> 587
		];


	// mail vars config
		// sender info
		$mconfig->From		= $mconfig->Username;
		$mconfig->FromName	= "Site numisdata.org";
		// target info
		$mconfig->to		= 'paco@render.es';
		$mconfig->reply_to	= 'no-reply@numisdata.org';
		$mconfig->bcc		= 'jandro@render.es'; // webmaster@render.es


	// Body. Cuerpo HTML
		$Body  = '';
		function build_table($data, $add_styles=false) {

			$html = '';

			if ($add_styles===true) {
				$html .= trim('
				<style>
					body { background-color: white; }
					table { border: none; border-collapse:collapse; width: 100%;}
					td {
						outline: 1px solid #eeeeee;
						padding: 1em;
						width: 140px;
					}
					td.value {
						background-color: #fafafa;
						width: auto;						
					}
					td.key, td.value.info {
						background-color: #6c6c6c;
						color: white;
						text-align: right;												
						text-transform: uppercase;
					}
					td.value.info {
						text-align: left;
					}
					.logo {
						width: 100%;
						height: 160px;
						margin-bottom: 1em;
						padding: 1em;
					}
					.logo img {
						object-fit: contain;
						width: 100%;
						height: 100%;
					}
				</style>
				');

				// add logo always
				$logo_url = 'https://monedaiberica.org/v1/tpl/assets/images/logo_mib_marron.svg';
				$html .= '<div class="logo"><img src="'.$logo_url.'" /></div>';				
			}

			// build html table from data object
				$html .= '<table>';
				foreach ($data as $key => $value) {
					
					$html .= '<tr>';
					$html .= '<td class="key">'.$key.'</td>';

					if (is_object($value) || is_array($value)) {

						$html .= '<td class="value '.$key.'">'.build_table($value).'</td>';

					}else{

						if ($key==='image_url') {
							$value = '<img src="'.$value.'" height="360" />';
						}
						$html .= '<td class="value '.$key.'">'. nl2br($value) .'</td>';
					}
					
					$html .= '</tr>';
				}
				$html .= '</table>';

			return $html;
		}
		$Body = build_table($json_object->data, true);
	

	// Send with mail lib PHPMailer
		ob_start();
		include(dirname(__FILE__) . '/manager.php');
		$response_text = ob_get_clean();


	// response
		$response = new stdClass();
			$response->result	= $result;
			$response->msg		= $response_text;
			$response->errors	= $errors;


	// print as json data
		header('Content-Type: application/json');

		echo json_encode( $response );


