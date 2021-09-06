<?php
function TokenSociety_profile_response_content ($params) {
	Q::log("Visited", "test");

	$loggedInUser = Users::loggedInUser();
	$r = array_merge($_REQUEST, $params);
	$uri = Q_Dispatcher::uri();
	$loggedInUserId = Q::ifset($loggedInUser, 'id', null);
	$userId = Q::ifset($r, 'userId', Q::ifset($uri, 'userId', $loggedInUser->id));
	if ($userId) {
		$user = Users::fetch($userId, true);
	} else {
		$user = Users::loggedInUser(true);
	}

	Q_Response::setScriptData("TokenSociety.profile.userId", $user->id);

	$self = false;
	if ($loggedInUser) {
		$adminLabels = Q_Config::get("Communities", "community", "admins", null);
		if ($loggedInUser->id == $user->id) {
			$self = true;
		} else if ((bool)Users::roles(null, $adminLabels, array(), $loggedInUser->id)) {
			$self = true;
		}
	}

	$app = Q::app();
	$defaultSize = Q_Config::expect("Q", "images", "Users/cover", "defaultSize");
	$splitedId = Q_Utils::splitId($user->id, 3, '/');
	$coverUrl = null;
	if (is_file(APP_FILES_DIR."/".$app."/uploads/Users/".$splitedId."/cover/".$defaultSize.".png")) {
		$coverUrl = Q_Request::baseUrl()."/Q/uploads/Users/".$splitedId."/cover/".$defaultSize.".png";
	}
	
	$communityId = Users::communityId();
	$greeting = Streams::fetchOne(null, $user->id, "Streams/greeting/$communityId");

	Q_Response::addScript("js/pages/profile.js");
	Q_Response::addStylesheet("css/pages/profile.css");
	
	$isMobile = Q_Request::isMobile();

    $xids = array();
    foreach (array('facebook', 'twitter', 'linkedin', 'github', 'instagram') as $item) {
        $value = Q::event('Communities/profileInfo/response/social', array(
            'social' => $item,
            'userId' => $userId,
            'action' => 'get'
        ));

        if (!empty($value)) {
            $xids[$item.'/'.$app] = $value;
        }
    }

    // get total followers
	$followers = array(
		"res" => TokenSociety::getFollowers($user->id, "TokenSociety/user/NFTs", $loggedInUserId),
		"followers" => TokenSociety::getFollowers($user->id, "TokenSociety/user/NFTs")
	);

	$following = TokenSociety::getFollowing($user->id, "TokenSociety/user/NFTs");

	$text = Q_Text::get('TokenSociety/content');
	$title = Q::interpolate(Q::ifset($text, 'profile', 'Title', null), array("userName" => $user->displayName()));
	$description = Q::ifset($text, 'profile', 'Description', null);
	$keywords = Q::ifset($text, 'profile', 'Keywords', null);
	$url = implode("/", array(Q_Request::baseUrl(), "profile", $userId));
	$image = Q_Uri::interpolateUrl($user->icon.'/400.png');
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

	return Q::view('TokenSociety/content/profile.php', compact(
		"user", "coverUrl", "self", "greeting", "userId", "loggedInUserId", "isMobile", "app", "xids", "followers", "following"
	));
}