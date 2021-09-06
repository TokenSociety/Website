<?php

/**
 * TokenSociety
 * @module TokenSociety
 * @main TokenSociety
 */
/**
 * Static methods for the TokenSociety app
 * @class TokenSociety
 * @abstract
 */
abstract class TokenSociety {
	static $options = array();

	/**
	 * Get or create new NFT empty stream for composer
	 * @method getNFTStream
	 * @param {string} [$userId=null] If null loggedin user id used
	 * @return {Streams_Stream}
	 */
	static function getNFTStream ($userId = null) {
		$userId = $userId ?: Users::loggedInUser(true)->id;
		$streamName = "TokenSociety/user/NFTs";
		self::checkCategory($userId, $streamName);

		$stream = Streams::related($userId, $userId, $streamName, true, array(
			"type" => "new",
			"streamsOnly" => true,
			"ignoreCache" => true
		));

		if (empty($stream)) {
			return Streams::create($userId, $userId, "TokenSociety/NFT", array(), array(
				"publisherId" => $userId,
				"streamName" => $streamName,
				"type" => "new"
			));
		} else {
			return reset($stream);
		}
	}

	/**
	 * Check if relatedParticipants category exists, and create if not
	 * @method checkCategory
	 * @param string $publisherId If null - logged user id used.
	 * @param string $streamName
	 */
	static function checkCategory ($publisherId, $streamName) {
		if ($publisherId === null) {
			$publisherId = Users::loggedInUser(true)->id;
		}

		$res = Streams_Stream::select("count(*) as res")->where(array(
			"name" => $streamName,
			"publisherId" => $publisherId
		))->execute()->fetchAll(PDO::FETCH_ASSOC)[0]["res"];

		if (!$res) {
			Streams::create(null, $publisherId, 'Streams/category', array('name' => $streamName));
		}

		return Streams::fetchOne(null, $publisherId, $streamName);
	}

	/**
	 * Get likes for stream
	 * @method likesAmount
	 * @param string $publisherId
	 * @param string $streamName
	 * @param string [$userId] If defined search likes related to this user
	 */
	static function getLikes ($publisherId, $streamName, $userId = null) {
		$where = array(
			"forId" => implode("/", array($publisherId, $streamName)),
			"value" => 1
		);

		if ($userId) {
			$where["userId"] = $userId;
		}

		return Users_Vote::select("count(*) as res")->where($where)->ignoreCache()->execute()->fetchAll(PDO::FETCH_ASSOC)[0]["res"];
	}

	/**
	 * Get subscribers of stream
	 * @method getFollowers
	 * @param string $publisherId
	 * @param string $streamName
	 * @param string [$userId] If defined return whether subscribed this user
	 */
	static function getFollowers ($publisherId, $streamName, $userId = null) {
		$where = array(
			"publisherId" => $publisherId,
			"streamName" => $streamName,
			"userId !=" => $publisherId,
			"subscribed" => "yes"
		);

		if ($userId) {
			$where["userId"] = $userId;
		}

		return Streams_Participant::select("count(*) as res")->where($where)->ignoreCache()->execute()->fetchAll(PDO::FETCH_ASSOC)[0]["res"];
	}

	/**
	 * Get subscribers of stream
	 * @method getFollowers
	 * @param string $publisherId
	 * @param string $streamName
	 * @param string [$userId] If defined return whether subscribed this user
	 */
	static function getFollowing ($userId, $streamName) {
		$where = array(
			"publisherId !=" => $userId,
			"streamName" => $streamName,
			"userId" => $userId,
			"subscribed" => "yes"
		);

		return Streams_Participant::select("count(*) as res")->where($where)->ignoreCache()->execute()->fetchAll(PDO::FETCH_ASSOC)[0]["res"];
	}

	/**
	 * Create array of needed params ("tabs", "urls", "classes", "attributes") to create dashboard menu
	 * @method dashboardMenu
	 * @return {Array}
	 */
	static function dashboardMenu () {
		$app = Q::app();
		$text = Q_Text::get("$app/content");
		$td = $text['dashboard'];

		$user = Users::loggedInUser();
		$isAdmin = false;
		$isCalendarsAdmin = false;
		$adminLabels = Q_Config::get("Communities", "community", "admins", null);
		$calendarsAdminLabels = Q_Config::get("Calendars", "events", "admins", null);
		if ($user) {
			$isAdmin = $adminLabels ? (bool)Users::roles(null, $adminLabels, array(), $user->id) : false;
			$isCalendarsAdmin = $calendarsAdminLabels ? (bool)Users::roles(null, $calendarsAdminLabels, array(), $user->id) : false;
		}

		$pages = array(
			"explore" => array(
				"public" => true,
				"name" => $td["Explore"],
				"url" => Q_Uri::url('TokenSociety/explore')
			),
			"profile" => array(
				"public" => false,
				"name" => $td["Profile"],
				"url" => Q_Uri::url("TokenSociety/profile")
			),
			"people" => array(
				"public" => true,
				"name" => $td["Authors"],
				"url" => Q_Uri::url("Communities/people")
			),
			"how" => array(
				"public" => true,
				"name" => $td["HowItWorks"],
				"url" => Q_Uri::url('TokenSociety/how')
			)
		);

		$tabs = $urls = $classes = $attributes = array();
		foreach ($pages as $page => $options) {
			if (!$options["public"]) {
				if (!$user) {
					continue;
				}
				if ($options["admin"] && !$isAdmin) {
					continue;
				}
				if ($options["calendarsAdmin"] && !$isCalendarsAdmin) {
					continue;
				}
				if ($options["admin"] === false && $isAdmin) {
					continue;
				}
			}

			$tabs[$page] = $attributes[$page]['data-touchlabel'] = Q::ifset($options, "name", $td[ucfirst($page)]);
			$urls[$page] = Q::ifset($options, "url", Q_Uri::url("TokenSociety/$page"));
			$classes[$page] = "Communities_aspect_$page Communities_clickable_effect";
		}

		return compact("tabs", "urls", "classes", "attributes");
	}

	/**
	 * Updated NFT stream with new data
	 * @method updateNFT
	 * @param {Streams_Stream} $stream NFT stream
	 * @param {array} $fields Array of data to update stream
	 * @return {Streams_Stream}
	 */
	static function updateNFT ($stream, $fields) {
		$communityId = Users::communityId();
		$userId = Users::loggedInUser(true)->id;

		$stream->title = $fields["title"];
		$stream->content = $fields["content"];
		$stream->setAttribute($fields["attributes"]);
		$stream->save();

		$interestsRelationType = "NFT/category";

		// remove relations
		$relateds = Streams_RelatedTo::select()->where(array(
			"type" => $interestsRelationType,
			"fromPublisherId" => $stream->publisherId,
			"fromStreamName" => $stream->name
		))->fetchDbRows();
		foreach ($relateds as $related) {
			Streams::unrelate($userId, $related->toPublisherId, $related->toStreamName, $interestsRelationType, $stream->publisherId, $stream->name);
		}

		if (!empty(Q::ifset($fields, "interests", null))) {
			foreach ($fields["interests"] as $key => $interest) {
				$fields["interests"][$key] = "Streams/interest/".Q_Utils::normalize(trim($interest));
			}

			// relate to interests
			Streams::relate($userId, $communityId, $fields["interests"], $interestsRelationType, $stream->publisherId, $stream->name);
		}

		// change stream relation
		$categoryStreamName = "TokenSociety/user/NFTs";
		Streams::unrelate($userId, $stream->publisherId, $categoryStreamName, "new", $stream->publisherId, $stream->name);
		Streams::relate($userId, $stream->publisherId, $categoryStreamName, "NFT", $stream->publisherId, $stream->name, array("weight" => time()));

		if (Q::ifset($fields, "attributes", "onMarketPlace", null) == "true") {
			// relate to main category
			Streams::relate($userId, $communityId, "TokenSociety/NFTs", "NFT", $stream->publisherId, $stream->name, array("weight" => time()));
		} else {
			// unrelate from main category
			Streams::unrelate($userId, $communityId, "TokenSociety/NFTs", "NFT", $stream->publisherId, $stream->name);
		}

		return $stream;
	}
}