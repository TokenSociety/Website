<?php
function TokenSociety_icons_response_content ($params)
{
	Q_Response::addStylesheet("{{TokenSociety}}/css/icons.css");
	Q_Response::addScript("{{TokenSociety}}/js/pages/icons.js");

	return Q::view('TokenSociety/content/icons.php');
}