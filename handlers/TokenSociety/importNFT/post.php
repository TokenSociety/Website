<?php

/**
 * @module TokenSociety
 */

/**
 * @class HTTP TokenSociety importNFT
 * @method post
 * @param {array} [$_REQUEST]
 * @param {string} [$_REQUEST.taskStreamName] Pass the name of a task stream to resume it.
 *    In this case, you don't need to pass the file, because it was saved.
 * @param {array} [$_FILES] Array consisting of one or more CSV files.
 *  The first line consists of titles or names of streams loaded from
 *  JSON files named under Streams/userStreams config.
 * @throws Users_Exception_NotAuthorized
 */
function TokenSociety_importNFT_post()
{
	ini_set('memory_limit', '1024M');

	$luid = Users::loggedInUser(true)->id;
	$taskStreamName = Q::ifset($_REQUEST, 'taskStreamName', null);
	if (empty($taskStreamName)) {
		throw new Exception("field taskStreamName required");
	}

	$texts = Q_Text::get('TokenSociety/content')['NFT']['import'];

	// check permissions
	$communityId = Users::currentCommunityId();
	$allowed = Q_Config::expect('Communities', 'users', 'canImport');
	if (!Users::roles($communityId, $allowed)) {
		throw new Users_Exception_NotAuthorized();
	}

	// get the instructions from uploaded file
	if (!empty($_FILES)) {
		$file = reset($_FILES);
		$tmp = $file['tmp_name'];

		// create array of csv lines from file
		$handle = fopen($tmp,'r');
		$instructions = array();
		while (($data = fgetcsv($handle)) !== FALSE ) {
			$instructions[] = $data;
		}

		if (empty($instructions)) {
			throw new Exception($texts['fileEmpty']);
		}

		// encode to json to save it to DB
		$instructions = json_encode($instructions);
	}

	$taskStream = Streams::fetchOne($luid, $luid, $taskStreamName);
	if (!$taskStream) {
		throw new Exception($texts['taskStreamInvalid']);
	}

	// if task stream not related to global category
	Streams::relate(
		null,
		Q::app(),
		"Streams/tasks/app",
		'TokenSociety/importNFT',
		$taskStream->publisherId,
		$taskStream->name,
		array(
			'skipAccess' => true,
			'weight' => time()
		)
	);

	// if new file uploaded, replace instructions in task stream
	if (!empty($instructions)) {
		$taskStream->instructions = $instructions;
	}

	// task stream reusing
	if ($taskStream->getAttribute('complete') == 1) {
		$taskStream->clearAllAttributes();
	}

	$taskStream->save();

	// call import only when task stream created and instructions loaded
	TokenSociety_Import::NFT($taskStream);
}