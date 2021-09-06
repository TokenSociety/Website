<?php
function TokenSociety_likes_response_set ($params) {
	$loggedInUser = Users::loggedInUser(true);
	$loggedInUserId = Q::ifset($loggedInUser, 'id', null);
	$request = array_merge($_REQUEST, $params);
	$required = array('publisherId', 'streamName');
	Q_Valid::requireFields($required, $request, true);
	$request = Q::take($request, $required);
	$publisherId = $request["publisherId"];
	$streamName = $request["streamName"];

	$type = "TokenSociety/NFT";
	$forId = implode("/", array($publisherId, $streamName));

	$UsersVote = new Users_Vote();
	$UsersVote->userId = $loggedInUserId;
	$UsersVote->forType = $type;
	$UsersVote->forId = $forId;
	if ($UsersVote->retrieve()) {
		$UsersVote->remove();
		return array(
			"res" => false,
			"likes" => TokenSociety::getLikes($publisherId, $streamName)
		);
	} else {
		$UsersVote->value = 1;
		$UsersVote->save();
		return array(
			"res" => true,
			"likes" => TokenSociety::getLikes($publisherId, $streamName)
		);
	}
}