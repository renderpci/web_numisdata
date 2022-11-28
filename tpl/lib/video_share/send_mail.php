<?php

# VIDEO SHARE SEND MAIL
#require_once( dirname( dirname(__FILE__) ) . '/config/config.php');



// vars
	$target_email 	= !empty($_REQUEST['target_email']) ? $_REQUEST['target_email'] : false;
	$video_url 		= !empty($_REQUEST['video_url']) ? $_REQUEST['video_url'] : false;
	$msg 			= !empty($_REQUEST['msg']) ? $_REQUEST['msg'] : false;
	$lang 			= 'lg-spa';
	$lang_iso_2		= 'es';

// mails
	$webmaste_mail 	= 'webmaster@mujerymemoria.org';
	$video_email 	= 'video_share@mujerymemoria.org';

// titles
	$page_title 	= 'Share video from: Madres e Hijas de la Transición Española';
	$page_mensaje 	= 'Mensaje en el cuerpo del mail';
	
	
	# MAIL VARS CONFIG
		$to					= $target_email;
		$bcc				= $webmaste_mail;
		$from				= $video_email;
		$reply_to			= $webmaste_mail;
		
		$origen				= "Site www.mujerymemoria.org";
		$now 				= date("d-m-Y H:i:s");
		$subject			= "Share video [$now]";
		
	
	# MAIL VARS $recipients, $headers, $body;
	
		# RECIPIENTS (STRING)
		$recipients			= "$to , $bcc";
		
		# HEADERS (ARRAY)
		$headers['From']	= $from;
		$headers['To']		= $to;
		$headers['Subject']	= $subject;
		$headers['Reply-To']= $reply_to;
	
	
	# BODY
		
		# Cuerpo texto plano
		$content_text 		 = '' ;
		$content_text 		.= " $page_title \n\n\n ".$page_mensaje.": \n\n $msg \n\n\n Video Link: \n\n $video_url \n\n\n\n www.mujerymemoria.org - $webmaste_mail \n\\n ";
		
		# Cuerpo HTML
		$file_include		= dirname(__FILE__) . '/html/mail_content.phtml';
		ob_start();			include ( $file_include );
		$content_html		= ob_get_clean();


	
	# MAILER . Configuración de envio (alfabetoibero@gmail.com  POR DEFECTO)
		$host 				= "smtp.1and1.es";	//:587
		$username 			= $video_email;
		$password 			= "WebmasterPs85k3";
		$authMail			= true;

	
	
// Send with mail lib (PEAR)
	include(dirname(dirname( dirname(__FILE__) )) . '/lib/send_mail/send.php');
