<?php
$streamNames = array(
	"Streams/user/twitter",
	"Streams/user/linkedin",
	"Streams/user/github",
	"Streams/user/facebook",
	"Streams/user/instagram"
);
$users = Users_User::select()->where(array(
	"signedUpWith!=" => "none"
))->fetchDbRows();
foreach ($streamNames as $streamName) {
	foreach ($users as $user) {
		$stream = new Streams_Stream();
		$stream->publisherId = $user->id;
		$stream->name = $streamName;
		if (!$stream->retrieve()) {
			Streams::create($user->id, $user->id, "Streams/text", array("name" => $streamName));
		}
	}
}