<?php
$streamNames = array(
	"Streams/user/firstName",
	"Streams/user/lastName",
	"Assets/user/credits",
	"Streams/greeting/TokenSociety",
	"Streams/user/emailAddress",
	"Streams/user/icon",
	"Streams/user/interests",
	"Streams/user/mobileNumber",
	"Streams/user/username",
	"TokenSociety/user/NFTs",
	"TokenSociety/NFT/*"
);
$adminLabels = Q_Config::get("Communities", "community", "admins", null);
foreach ($streamNames as $streamName) {
	foreach ($adminLabels as $adminLabel) {
		$access = new Streams_Access();
		$access->publisherId = "";
		$access->streamName = $streamName;
		$access->ofContactLabel = $adminLabel;
		if (!$access->retrieve()) {
			$access->readLevel=40;
			$access->writeLevel=40;
			$access->adminLevel=40;
			$access->save();
		}
	}
}