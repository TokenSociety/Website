<?php

function TokenSociety_explore_response_content()
{
    Q_Response::addStylesheet('css/pages/explore.css');

    $user = Users::loggedInUser();
	$text = Q_Text::get('TokenSociety/content');

    // join user to main category to listen messages
	if ($user) {
		$stream = Streams::fetchOne(null, Users::currentCommunityId(true), "TokenSociety/NFTs");
		$stream->join(array(
			'noVisit' => true
		));
	}

	$communityId = Users::currentCommunityId(true);
	$communityUser = Users_User::fetch($communityId);
	$title = $text['explore']['Title'];
	$description = $text['explore']['Description'];
	$keywords = $text['explore']['Keywords'];
	$url = Q_Uri::url("TokenSociety/explore");
	$communityIcon = Q_Uri::interpolateUrl($communityUser->icon.'/400.png');
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
		array('attrName' => 'name', 'attrValue' => 'image', 'content' => $communityIcon),
		array('attrName' => 'property', 'attrValue' => 'og:image', 'content' => $communityIcon),
		array('attrName' => 'property', 'attrValue' => 'twitter:image', 'content' => $communityIcon),
		array('attrName' => 'property', 'attrValue' => 'og:url', 'content' => $url),
		array('attrName' => 'property', 'attrValue' => 'twitter:url', 'content' => $url),
		array('attrName' => 'property', 'attrValue' => 'twitter:card', 'content' => 'summary')
	));

    return Q::view('TokenSociety/content/explore.php');
}