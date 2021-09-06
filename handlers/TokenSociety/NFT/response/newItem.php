<?php
function TokenSociety_NFT_response_newItem ($params) {
	$req = array_merge($_REQUEST, $params);
	$stream = TokenSociety::getNFTStream(Q::ifset($req, "userId", null));
	return array("publisherId" => $stream->publisherId, "streamName" => $stream->name);
}