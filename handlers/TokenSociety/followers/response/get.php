<?php
function TokenSociety_followers_response_get ($params) {
	$loggedInUser = Users::loggedInUser();
	$loggedInUserId = Q::ifset($loggedInUser, 'id', null);
	$request = array_merge($_REQUEST, $params);
	$required = array('publisherId', 'streamName');
	Q_Valid::requireFields($required, $request, true);
	$request = Q::take($request, $required);
	$publisherId = $request["publisherId"];
	$streamName = $request["streamName"];

	$res = false;
	if ($loggedInUserId) {
		$res = (boolean)TokenSociety::getFollowers($publisherId, $streamName, $loggedInUserId);
	}

	return array(
		"res" => $res,
		"followers" => TokenSociety::getFollowers($publisherId, $streamName)
	);
}