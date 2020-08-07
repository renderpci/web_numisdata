// JavaScript Document

/*
// READY
jQuery(document).ready(function($) {
	
	
	$('#share_form').bind("submit", function(event) {						
		
		send_form($(this));
	});
	
	$('#target_email').bind("keydown", function(event) {					
						
		$(this).css('background-color','white');
	});
	
	
	$('#video_url').bind("focus", function(event) {				
						
		$(this).select();
	});
																					
});

$(window).load(function() {
	
	// FOCUS FIRST FROM FIELD
	$("#share_form :input:visible:enabled:first").focus();
});
*/


function send_form(obj) {
	
	var form_obj		= $(obj);				//alert(target_email.val())
	var target_email	= $("#target_email");			//alert(target_email.val())
	var video_url		= $("#video_url");				//alert(video_url.val())
	var msg				= $("#msg");					//alert(msg.val())
	
	// Verify email is valid
	var valid_email		= verifyEmail(target_email, target_email.val())
	if(valid_email !== true) {		
		alert(tstring.email_no_valido);		//alert("Please enter a valid email address.");
		target_email.focus().css('background-color','#F93');		
		return false;	
	}	
		
	// AJAX LOAD FORM PAGE
	const myurl		= 'tpl/lib/video_share/send_mail.php' ;
	const mydata	= { 
		target_email : target_email.val(),
		video_url 	 : video_url.val(),
		msg 		 : msg.val()
	}	
	$.ajax({
		url			: myurl,
		data		: mydata,
		type		: "POST",
		beforeSend	: function() {
						form_obj.html(' <div class="center_div_text"> Sending mail .. </div>');					
						form_obj.addClass("spinBG");//target_div.html("<div class=\"spinBG\"> Loading </div>");//div.html('');										
					},
		success		: function(reponse) {															
						form_obj.hide(0).html(reponse);						
						// Reset iframe load state for allow send another message
						//parent.loaded_iframe = false;							
					},
		complete	: function() {
						form_obj.removeClass("spinBG");
						form_obj.fadeIn("fast", function() {							
							// Fire parent function in video_view.js
							// parent.mostrarFormulario(null);
						});
					}
	});//fin $.ajax
	
}



function verifyEmail(obj, email_value) {
	
	var status = false;     
	var emailRegEx = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
	
	if (email_value.search(emailRegEx) == -1) {
		 
          //alert("Please enter a valid email address.");
		  
     }else {
		 
          status = true;
     }
	 
     return status;
}
