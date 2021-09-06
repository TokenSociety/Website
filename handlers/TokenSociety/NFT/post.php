<?php
function TokenSociety_NFT_post ($params) {
	$req = array_merge($_REQUEST, $params);
	$loggedInUserId = Users::loggedInUser(true)->id;
	$userId = Q::ifset($req, "userId", $loggedInUserId);

	$stream = TokenSociety::getNFTStream($userId);
	$fields = Q::take($req, array('title', 'content', 'attributes', 'interests'));

	TokenSociety::updateNFT($stream, $fields);
}