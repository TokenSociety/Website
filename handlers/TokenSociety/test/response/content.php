<?php
function TokenSociety_test_response_content () {

	//Users_User::removeUser(array("bcohvaqp"));

	/*Streams::remove("TokenSociety", array(
		"Streams/interest/art_music",
		"Streams/interest/art_paintings",
		"Streams/interest/art_wine_and_spirits",
		"Streams/interest/art_sculpture",
		"Streams/interest/luxury_jewelry",
		"Streams/interest/luxury_collectibles",
		"Streams/interest/vehicles_cars",
		"Streams/interest/vehicles_boats",
		"Streams/interest/vehicles_planes",
		"Streams/interest/vehicles_exotic"
	));*/

	//$res = Q_Image::iconArrayWithUrl("cover_url", 'Users/cover');

//    exit;
	return Q::view("TokenSociety/content/test.php");
}