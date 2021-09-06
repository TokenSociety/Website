<?php
	
function TokenSociety_metadata_response () {
	$uri = Q_Dispatcher::uri();
	$stream = Streams::fetchOne(null, $uri->publisherId, "TokenSociety/NFT/".$uri->itemId);
	$result = $stream
	? [
		'name' => $stream->title,
		'description' => $stream->content,
		'image' => $stream->iconUrl(),
		'attributes' => $stream->getAttribute('TokenSociety/NFT/attributes'),
		'external_url' => $stream->url()
	] : ['error' => 'No such NFT'];
	echo Q::json_encode($result, JSON_PRETTY_PRINT);
	return false;
}