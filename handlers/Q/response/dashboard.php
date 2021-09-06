<?php

function Q_response_dashboard()
{	
	$app = Q::app();
	$slogan = "Powered by Qbix.";
	$user = Users::loggedInUser(false, false);
	$text = Q_Text::get("TokenSociety/content");

	$dashboardMenu = TokenSociety::dashboardMenu();
	$tabs = $dashboardMenu["tabs"];
	$urls = $dashboardMenu["urls"];
	$classes = $dashboardMenu["classes"];

	$isMobile = Q_Request::isMobile();
	// if ($isMobile && $dashboardStyle == 'icons') {
	// 	$tabs['me'] = Q::tool('Users/status', array(
	// 		'avatar' => array('icon' => 80)
	// 	), 'me');
	// } else {
	// 	$tabs['me'] = $td['Me'];
	// }

	$dashboardStyle = Q_Config::get(
		'Communities', 'layout', 'dashboard',
		$isMobile ? 'mobile' : 'desktop', 'contextual'
	);
	$communities = array();
	return Q::view("TokenSociety/dashboard.php", compact(
		'slogan', 'user', 'tabs', 'urls', 'classes', 'attributes', 'isMobile',
		'communityAvatar', 'communities', 'communityId', 'classes2', 'dashboardStyle', 'withTitles'
	));
}
