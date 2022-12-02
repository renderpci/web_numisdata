<?php
//Import PHPMailer classes into the global namespace
//These must be at the top of your script, not inside a function
	use PHPMailer\PHPMailer\PHPMailer;
	use PHPMailer\PHPMailer\SMTP;
	use PHPMailer\PHPMailer\Exception;

//Load Composer's autoloader
// require 'vendor/autoload.php';
// require_once( dirname(__FILE__) . "/PHPMailer/PHPMailerAutoload.php");
require_once( dirname(__FILE__) . "/PHPMailer-master/src/PHPMailer.php");
require_once( dirname(__FILE__) . "/PHPMailer-master/src/SMTP.php");
require_once( dirname(__FILE__) . "/PHPMailer-master/src/Exception.php");

# Error report . Report simple running errors   # error_reporting(E_ALL ^ E_STRICT);    
	error_reporting(E_ERROR | E_WARNING | E_PARSE);

//Instantiation and passing `true` enables exceptions
$mail = new PHPMailer(true);

$result = false;
$errors = [];

try {

	// reference
		// //Server settings
		// $mail->SMTPDebug = SMTP::DEBUG_SERVER;                      //Enable verbose debug output
		// $mail->isSMTP();                                            //Send using SMTP
		// $mail->Host       = 'smtp.example.com';                     //Set the SMTP server to send through
		// $mail->SMTPAuth   = true;                                   //Enable SMTP authentication
		// $mail->Username   = 'user@example.com';                     //SMTP username
		// $mail->Password   = 'secret';                               //SMTP password
		// $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;         //Enable TLS encryption; `PHPMailer::ENCRYPTION_SMTPS` encouraged
		// $mail->Port       = 587;                                    //TCP port to connect to, use 465 for `PHPMailer::ENCRYPTION_SMTPS` above

		// //Recipients
		// $mail->setFrom('from@example.com', 'Mailer');
		// $mail->addAddress('joe@example.net', 'Joe User');     //Add a recipient
		// $mail->addAddress('ellen@example.com');               //Name is optional
		// $mail->addReplyTo('info@example.com', 'Information');
		// $mail->addCC('cc@example.com');
		// $mail->addBCC('bcc@example.com');

		// //Attachments
		// $mail->addAttachment('/var/tmp/file.tar.gz');         //Add attachments
		// $mail->addAttachment('/tmp/image.jpg', 'new.jpg');    //Optional name

		// //Content
		// $mail->isHTML(true);                                  //Set email format to HTML
		// $mail->Subject = 'Here is the subject';
		// $mail->Body    = 'This is the HTML message body <b>in bold!</b>';
		// $mail->AltBody = 'This is the body in plain text for non-HTML mail clients';

		// $mail->send();
		// echo 'Message has been sent';

	$mail->SMTPDebug    = 0;	// Enable verbose debug output

	$mail->isSMTP();							// Set mailer to use SMTP
	$mail->Host			= $mconfig->Host;		// Specify main and backup SMTP servers
	$mail->SMTPAuth		= $mconfig->SMTPAuth;	// Enable SMTP authentication
	$mail->Username		= $mconfig->Username;	// SMTP username
	$mail->Password		= $mconfig->Password;	// SMTP password
	$mail->SMTPSecure	= $mconfig->SMTPSecure;	// Enable TLS encryption, `ssl` also accepted
	$mail->Port			= $mconfig->Port;		// TCP port to connect to

	$mail->From			= $mconfig->From;
	$mail->FromName		= $mconfig->FromName;	//'Mailer';
	$mail->addAddress($mconfig->to);			// Add a recipient
	#$mail->addAddress($bcc);					// Name is optional
	$mail->addReplyTo($mconfig->reply_to);
	#$mail->addCC('cc@example.com');
	
	if (!empty($mconfig->bcc)) {
		$mail->addBCC($mconfig->bcc);
	}
	
	#$mail->addAttachment('/var/tmp/file.tar.gz');          // Add attachments
	#$mail->addAttachment('/tmp/image.jpg', 'new.jpg');     // Optional name
	$mail->isHTML(true);                                    // Set email format to HTML

	$mail->Subject	= utf8_decode($Subject);
	$mail->Body		= utf8_decode($Body);		// 'This is the HTML message body <b>in bold!</b>';
	$mail->AltBody	= utf8_decode($AltBody);	// 'This is the body in plain text for non-HTML mail clients';

	if(!$mail->send()) {
		echo 'Message could not be sent.';
		echo 'Mailer Error: ' . $mail->ErrorInfo;

		$errors[] = $mail->ErrorInfo;
	}else{
		// echo 'Message has been sent';
		echo 'Ok. Mensaje enviado';
		$result = true;
	}

} catch (Exception $e) {
	echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
	$errors[] = $mail->ErrorInfo;
	$errors[] = 'Caught exception: '.  $e->getMessage();
}