<?php
$streamName = "TokenSociety/user/NFTs";
$users = Users_User::select()->where(array(
	"signedUpWith !=" => "none"
))->fetchDbRows();
foreach ($users as $user) {
	$stream = new Streams_Stream();
	$stream->publisherId = $user->id;
	$stream->name = $streamName;
	if ($stream->retrieve()) {
		continue;
	}

	$stream = Streams::create($user->id, $user->id, 'Streams/category', array(
		'name' => $streamName
	));
	$stream->subscribe(array("userId" => $user->id));
}