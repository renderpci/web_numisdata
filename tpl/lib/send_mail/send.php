<?php
	/*
	
	Envio de email html
	
	*/	
	#@ date_default_timezone_set('Europe/Madrid');	
		
	# 
	# PHPMailer
	require_once( dirname(__FILE__) . "/PHPMailer/PHPMailerAutoload.php");

	# Error report . Report simple running errors	# error_reporting(E_ALL ^ E_STRICT);	
	error_reporting(E_ERROR | E_WARNING | E_PARSE);
	
	# Verify data	
	if(empty($recipients) || empty($headers) || empty($content_text) || empty($content_html) ) {
		
		echo 'Error: missing data <pre>';
		print_r( $recipients );
		echo '<br> ';
		print_r( $headers );
		echo '<br> ';
		print_r( $content_text );
		echo '<br> ';
		#print_r( $content_html );
		echo '</pre> ';
		exit();
	}
	
	# verify email	
	if( !filter_var($to, FILTER_VALIDATE_EMAIL) || !preg_match('/^([a-zA-Z0-9\'\._\+-]+)\@((\[?)[a-zA-Z0-9\-\.]+\.([a-zA-Z]{2,7}|[0-9]{1,3})(\]?))$/', $to) ) {
		
		echo("Error: email $to is not valid !"); //$tx_error_al_enviar 
		exit();
	}

	# SEND
	try{

		$mail = new PHPMailer;

		$mail->SMTPDebug 	= 0;                                // Enable verbose debug output

		$mail->isSMTP();                                      	// Set mailer to use SMTP
		$mail->Host 		= $host;  							// Specify main and backup SMTP servers
		$mail->SMTPAuth 	= true;                             // Enable SMTP authentication
		$mail->Username 	= $username;                 		// SMTP username
		$mail->Password 	= $password;                        // SMTP password
		$mail->SMTPSecure 	= 'tls';                            // Enable TLS encryption, `ssl` also accepted
		$mail->Port 		= 587;                              // TCP port to connect to

		$mail->From 		= $from;
		$mail->FromName 	= $origen;	//'Mailer';
		$mail->addAddress($to);     	// Add a recipient
		#$mail->addAddress($bcc);               // Name is optional
		$mail->addReplyTo($reply_to);
		#$mail->addCC('cc@example.com');
		$mail->addBCC($bcc);
		#$mail->addBCC('paco@render.es');

		#$mail->addAttachment('/var/tmp/file.tar.gz');        	// Add attachments
		#$mail->addAttachment('/tmp/image.jpg', 'new.jpg');    	// Optional name
		$mail->isHTML(true);                                  	// Set email format to HTML

		$mail->Subject 	= utf8_decode($subject);
		$mail->Body    	= utf8_decode($content_html);		// 'This is the HTML message body <b>in bold!</b>';
		$mail->AltBody 	= utf8_decode($content_text);		// 'This is the body in plain text for non-HTML mail clients';

		if(!$mail->send()) {
			echo 'Message could not be sent.';
			echo 'Mailer Error: ' . $mail->ErrorInfo;
		} else {
			#echo 'ok. Message has been sent';
			echo 'Ok. Mensaje enviado';
		}


	}catch(Exception $e) {
		#echo 'Caught exception: ',  $e->getMessage(), "\n";
	}


	exit();


