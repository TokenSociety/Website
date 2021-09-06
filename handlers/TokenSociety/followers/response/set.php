<?php
function TokenSociety_followers_response_set ($params) {
	$loggedInUser = Users::loggedInUser(true);
	$loggedInUserId = Q::ifset($loggedInUser, 'id', null);
	$request = array_merge($_REQUEST, $params);
	$required = array('publisherId', 'streamName');
	Q_Valid::requireFields($required, $request, true);
	$request = Q::take($request, $required);
	$publisherId = $request["publisherId"];
	$streamName = $request["streamName"];

	$participant = new Streams_Participant();
	$participant->userId = $loggedInUserId;
	$participant->publisherId = $publisherId;
	$participant->streamName = $streamName;
	if ($participant->retrieve() && $participant->subscribed == "yes") {
		Streams::unsubscribe($loggedInUserId, $publisherId, array($streamName));
		return array(
			"res" => false,
			"followers" => TokenSociety::getFollowers($publisherId, $streamName)
		);
	} else {
		Streams::subscribe($loggedInUserId, $publisherId, array($streamName));
		return array(
			"res" => true,
			"followers" => TokenSociety::getFollowers($publisherId, $streamName)
		);
	}
}