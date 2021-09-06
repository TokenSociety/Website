<?php
	
function TokenSociety_register_post()
{
	$time = time();
	$name = Q_Utils::normalize($_POST['name']);
	$file = APP_FILES_DIR . DS . 'TokenSociety' . DS . 'registrations' . DS . "registration-$time-$name.txt";
	file_put_contents($file, Q::json_encode($_POST));
	echo 'SUCCESS'; exit;
}