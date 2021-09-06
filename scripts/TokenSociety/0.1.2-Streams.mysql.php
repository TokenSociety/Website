<?php
$streamName = "TokenSociety/NFTs";
$communities = Users_User::select()->where(array(
	"signedUpWith" => "none"
))->fetchDbRows();
foreach ($communities as $community) {
	if (!Users::isCommunityId($community->id)) {
		continue;
	}

	$stream = new Streams_Stream();
	$stream->publisherId = $community->id;
	$stream->name = $streamName;
	if ($stream->retrieve()) {
		continue;
	}

	$stream = Streams::create($community->id, $community->id, 'Streams/category', array(
		'name' => $streamName
	));
}

$communityId = Users::communityId();
$items = array();
$categories = Streams_Stream::select()->where(array(
	"name" => "TokenSociety/user/NFTs"
))->fetchDbRows();
foreach ($categories as $category) {
	$relations = Streams_RelatedTo::select()->where(array(
		"toPublisherId" => $category->publisherId,
		"toStreamName" => $category->name,
		"type" => "NFT"
	))->fetchDbRows();

	foreach ($relations as $relation) {
		Streams::relate($communityId, $communityId, $streamName, "NFT", $relation->fromPublisherId, $relation->fromStreamName, array(
			"weight" => $relation->weight
		));
	}
}
