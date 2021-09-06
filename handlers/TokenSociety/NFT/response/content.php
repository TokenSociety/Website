<?php
function TokenSociety_NFT_response_content ($params) {
	$loggedInUser = Users::loggedInUser();
	$r = array_merge($_REQUEST, $params);
	$uri = Q_Dispatcher::uri();
	$loggedInUserId = Q::ifset($r, 'userId', Q::ifset($uri, 'userId', $loggedInUser->id));
	$publisherId = Q::ifset($r, 'publisherId', Q::ifset($uri, 'publisherId', null));
	$lastPart = Q::ifset($r, 'tokenId', Q::ifset($uri, 'lastPart', null));

	$needle = ".json";
	$isJson = substr_compare($lastPart, $needle, -strlen($needle)) === 0;
	if ($isJson) {
		$lastPart = str_replace($needle, "", $lastPart);
	}

	if (empty($publisherId)) {
		throw new Exception("NFT::view publisherId required!");
	}
	if (empty($lastPart)) {
		throw new Exception("NFT::view tokeId required!");
	}

    $communityId = Users::communityId();
    $texts = Q_Text::get($communityId.'/content');

	$stream = Streams::fetchOne(null, $publisherId, "TokenSociety/NFT/".$lastPart);
	$url = implode("/", array(Q_Request::baseUrl(), "NFT", $stream->publisherId, $lastPart));
	$image = $stream->iconUrl('500x700.png');
	$author = $stream->getAttribute("author");
	$owner = $stream->getAttribute("owner");

	if ($isJson) {
		echo Q::json_encode(array(
			"name" => $stream->title,
			"description" => $stream->content,
			"external_url" => $url,
			"image" => $image,
			"attributes" => $stream->getAllAttributes()
		), JSON_PRETTY_PRINT);
		exit;
	}

	$title = $stream->title;
	$description = $stream->content;
	$icon = $stream->iconUrl('700x980.png');
	$royalty = $stream->getAttribute("royalty");
	$relations = Streams_RelatedTo::select()->where(array(
		"fromPublisherId" => $stream->publisherId,
		"fromStreamName" => $stream->name,
		"type" => "NFT/category"
	))->fetchDbRows();
	$collections = array();
	foreach ($relations as $relation) {
		$interest = Streams::fetchOne(null, $relation->toPublisherId, $relation->toStreamName);
		$collections[] = $interest->title;
	}

	// get likes
	$res = false;
	if ($loggedInUserId) {
		$res = (boolean)TokenSociety::getLikes($publisherId, $stream->name, $loggedInUserId);
	}
	$likes = array(
		"res" => $res,
		"likes" => TokenSociety::getLikes($publisherId, $stream->name)
	);

	$defaultIconSize = Q_Config::expect("Q", "images", "NFT/icon", "defaultSize");

	Q_Response::addScript("js/pages/NFT.js");
	Q_Response::addStylesheet("css/pages/NFT.css");
	Q_Response::setScriptData("TokenSociety.NFT.publisherId", $stream->publisherId);
	Q_Response::setScriptData("TokenSociety.NFT.streamName", $stream->name);

	$keywords = Q::ifset($texts, 'profile', 'Keywords', null);
	Q_Response::setMeta(array(
		array('attrName' => 'name', 'attrValue' => 'title', 'content' => $title),
		array('attrName' => 'property', 'attrValue' => 'og:title', 'content' => $title),
		array('attrName' => 'property', 'attrValue' => 'twitter:title', 'content' => $title),
		array('attrName' => 'name', 'attrValue' => 'description', 'content' => $description),
		array('attrName' => 'property', 'attrValue' => 'og:description', 'content' => $description),
		array('attrName' => 'property', 'attrValue' => 'twitter:description', 'content' => $description),
		array('attrName' => 'name', 'attrValue' => 'keywords', 'content' => $keywords),
		array('attrName' => 'property', 'attrValue' => 'og:keywords', 'content' => $keywords),
		array('attrName' => 'property', 'attrValue' => 'twitter:keywords', 'content' => $keywords),
		array('attrName' => 'name', 'attrValue' => 'image', 'content' => $image),
		array('attrName' => 'property', 'attrValue' => 'og:image', 'content' => $image),
		array('attrName' => 'property', 'attrValue' => 'twitter:image', 'content' => $image),
		array('attrName' => 'property', 'attrValue' => 'og:url', 'content' => $url),
		array('attrName' => 'property', 'attrValue' => 'twitter:url', 'content' => $url),
		array('attrName' => 'property', 'attrValue' => 'twitter:card', 'content' => 'summary')
	));

	return Q::view('TokenSociety/content/NFT.php', compact("stream", "author", "owner", "icon", "royalty", "collections", "likes", "texts", "defaultIconSize"));
}