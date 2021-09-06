<?php

function TokenSociety_home_response_content($params)
{
	// Implement a home page for the user
	$user = Users::loggedInUser();
	
	// For now we will just internally forward to the welcome page
	Q_Dispatcher::forward("TokenSociety/welcome");
}

