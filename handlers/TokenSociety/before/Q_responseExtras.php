<?php

function TokenSociety_before_Q_responseExtras()
{
	// set Q.Users.cover.sizes for imagepicker
	$temp = Q_Config::expect("Q", "images", "Users/cover", "sizes");
	$coverSizes = array();
	foreach ($temp as $t) {
		$coverSizes[$t] = $t.".png";
	}
	Q_Response::setScriptData('Q.plugins.Users.cover.sizes', $coverSizes);
	Q_Response::setScriptData('Q.plugins.Users.cover.defaultSize', Q_Config::expect("Q", "images", "Users/cover", "defaultSize"));
	Q_Response::setScriptData('Q.plugins.Users.cover.maxStretch', Q_Config::expect("Q", "images", "Users/cover", "maxStretch"));
    Q_Response::setScriptData('TokenSociety.config.currencies', Q_Config::expect("TokenSociety", "currencies"));
	Q_Response::setScriptData('TokenSociety.config.chainNetworks', Q_Config::expect("TokenSociety", "chainNetworks"));

	// set TokenSociety.NFT.icon.sizes for imagepicker
	Q_Response::setScriptData('TokenSociety.NFT.icon', Q_Config::expect("Q", "images", "NFT/icon"));

	Q_Response::addStylesheet("css/TokenSociety.css?".filemtime(APP_WEB_DIR.DS.'css/TokenSociety.css'), '@end');
	Q_Response::addScript("js/TokenSociety.js?".filemtime(APP_WEB_DIR.DS.'js/TokenSociety.js'), 'TokenSociety');
	if (Q_Request::isIE()) {
		header("X-UA-Compatible", "IE=edge");
	}
	Catalogs::addScripts();
	header('Vary: User-Agent');
	Q_Response::addStylesheet('https://fonts.googleapis.com/css?family=Open+Sans:400italic,400,300,700', 'TokenSociety');

}
