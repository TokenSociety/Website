<?php
	
function TokenSociety_moduleCanHandle($params)
{
	$module = $params['fields']['module'];
	$action = $params['fields']['action'];
	return Q::canHandle("$module/$action/response/content")
		or Q::canHandle("$module/$action/response");
}