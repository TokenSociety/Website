<?php
/**
 * @module TokenSociety
 */
/**
 * Class handle with NFT import
 *
 * @class TokenSociety_Import
 * @extends Communities_TokenSociety_Import
 */
class TokenSociety_Import extends Communities_Import
{
	/**
	 * Make users import from CSV file.
	 *
	 * @method users
	 * @static
	 * @param {Streams_Stream} $taskStream Required. Stream with filled instruction field.
	 * @throws
	 * @return void
	 */
	static function NFT ($taskStream) {
		// increase memory limit
		ini_set('memory_limit', '500M');

		$texts = Q_Text::get('TokenSociety/content')['NFT']['import'];

		if (!($taskStream instanceof Streams_Stream)) {
			throw new Exception($texts['taskStreamInvalid']);
		}

		$instructions = $taskStream->instructions;

		// init errors
		$taskStream->errors = json_encode(array());
		$taskStream->save();

		if (empty($instructions)) {
			throw new Exception($texts['instructionsEmpty']);
		}
		$instructions = json_decode($instructions);

		$luid = Users::loggedInUser(true)->id;

		// Send the response and keep going.
		// WARN: this potentially ties up the PHP thread for a long time
		$timeLimit = Q_Config::get('Streams', 'import', 'timeLimit', 100000);
		ignore_user_abort(true);
		set_time_limit($timeLimit);
		session_write_close();

		// count the number of rows
		$lineCount = count($instructions);
		$taskStream->setAttribute('items', $lineCount);

		$requiredFields = array("creator", "title", "image_url", "currency");

		// use empty arguments, so it will use main community
		// because we have json file only for main community
		$allInterests = Streams::interests();

		$fields = array();

		// start parsing the rows
		foreach ($instructions as $j => $line) {
			if (!$line) {
				continue;
			}
			if (++$j === 1) {
				// get the fields from the first row
				$fields = array_map(function ($val) {
					return Q_Utils::normalize(trim($val));
				}, $line);

				// check for required fields
				foreach($requiredFields as $key => $item) {
					if (is_array($item)) {
						$requiredFieldExist = false;
						foreach ($item as $item2) {
							if (is_array($item2) && count(array_intersect($item2, $fields)) == count($item2)) {
								$requiredFieldExist = true;
							} elseif (in_array($item2, $fields)) {
								$requiredFieldExist = true;
							}
						}

						if (!$requiredFieldExist) {
							throw new Exception(Q::interpolate($texts['fieldNotFound'], array($key)));
						}
					} elseif (!in_array($item, $fields)) {
						throw new Exception(Q::interpolate($texts['fieldNotFound'], array($item)));
					}
				}

				continue;
			}

			$processed = $taskStream->getAttribute('processed', 0);
			if ($j <= $processed) {
				continue;
			}
			$empty = true;
			foreach ($line as $v) {
				if ($v) {
					$empty = false;
					break;
				}
			}
			if ($empty) {
				continue;
			}

			$data = array();

			try {
				foreach ($line as $i => $value) {
					$field = $fields[$i];

					if ($field == 'categories') {
						$value = array_map('trim', preg_split("/\r\n|\n|\r/", trim($value)));

						foreach ($value as $interestKey => $item) {
							$parsedItem = array_map('trim', explode(":", $item));

							if (!Q::ifset($allInterests, $parsedItem[0], null)) {
								//throw new Exception(Q::interpolate($texts['interestAbsent'], array($item)));
								unset($value[$interestKey]);
								continue;
							}

							// create interest stream if not exists
							Streams::getInterest($item);
						}
					} else {
						$value = trim(preg_replace("/[\n\r|\n|\r]/", " ", $value));
					}

					$data[$field] = $value;
				}

				$user = null;
				if (Q_Valid::email($data['creator'], $emailAddress)) {
					$user = Users_User::select()->where(array(
						"emailAddress" => $emailAddress
					))->fetchDbRow();

					if (!$user) {
						$user = Users_User::select()->where(array(
							"emailAddressPending" => $emailAddress
						))->fetchDbRow();
					}
				} else if (Q_Valid::phone($data['creator'], $phoneNUmber)) {
					$user = Users_User::select()->where(array(
						"mobileNumber" => $phoneNUmber
					))->fetchDbRow();

					if (!$user) {
						$user = Users_User::select()->where(array(
							"mobileNumberPending" => $phoneNUmber
						))->fetchDbRow();
					}
				} else {
					$splittedName = Streams::splitFullName($data['creator']);
					$avatar = Streams_Avatar::select()->where(array(
						'firstName' => $splittedName['first'],
						'lastName' => $splittedName['last']
					))->fetchDbRow();
					if ($avatar) {
						$user = Users::fetch($avatar->publisherId);
					}
				}

				if (!$user) {
					throw new Exception("User with identificator ".$data['creator']." not found");
				}

				$attributes = array();
				if ($data["fixed_price"]) {
					$attributes["fixedPrice"] = array(
						"price" => $data["fixed_price"],
						"currency" => $data["currency"],
						"active" => $data["timed_price"] ? "false" : "true"
					);
				}
				if ($data["timed_price"]) {
					if (empty($data["start_time"])) {
						throw new Exception("Start Time required");
					}
					if (empty($data["end_time"])) {
						throw new Exception("End Time required");
					}

					$attributes["timedAction"] = array(
						"price" => $data["timed_price"],
						"startTime" => strtotime($data["start_time"]),
						"endTime" => strtotime($data["end_time"]),
						"currency" => $data["currency"],
						"onMarketPlace" => true,
						"active" => "true"
					);
				}
				if ($data["royalty"]) {
					$attributes["royalty"] = $data["royalty"];
				}

				$stream = TokenSociety::getNFTStream($user->id);
				TokenSociety::updateNFT($stream, array(
					"title" => $data["title"],
					"content" => $data["description"],
					"interests" => $data["categories"],
					"attributes" => $attributes
				));
				self::importIcon($data["image_url"], $stream);
			} catch (Exception $e) {
				// save error to stream
				$exceptions = json_decode($taskStream->errors, true);
				$exceptions[$j] = $e->getMessage();
				$taskStream->errors = json_encode($exceptions);
				$taskStream->save();
			}

			$processed = $j;
			$taskStream->setAttribute('processed', $processed);
			$progress = ($j/$lineCount) * 100;
			$taskStream->setAttribute('progress', $progress);
			$taskStream->save();
			$taskStream->post($luid, array(
				'type' => 'Streams/task/progress',
				'instructions' => compact('processed', 'progress'),
			), true);
		}

		$exceptions = json_decode($taskStream->errors, true);
		if (count($exceptions)) {
			$taskStream->setAttribute("processed", 0);
			$taskStream->setAttribute("progress", 0);
			$taskStream->save();

			$errors = array();
			foreach($exceptions as $i => $exception) {
				$errors[Q::interpolate($texts['errorLine'], array($i))] = $exception;
			}

			$taskStream->post($luid, array(
				'type' => 'Streams/task/error',
				'instructions' => $errors,
			), true);

			return;
		}

		// if we reached here, then the task has completed
		$taskStream->setAttribute('complete', 1);
		$taskStream->save();
		$taskStream->post($luid, array(
			'type' => 'Streams/task/complete'
		), true);
	}

	/**
	 * Import icon to NFT stream
	 * @method importIcon
	 * @static
	 * @param {String} $url image url
	 * @param {Streams_Stream} $stream NFT stream
	 */
	static function importIcon ($url, $stream) {
		if (!Q_Valid::url($url)) {
			return;
		}

		$icon = file_get_contents($url);

		// if icon is valid image
		if ($icon && imagecreatefromstring($icon)) {
			// upload image to stream
			Q_Image::save(array(
				'data' => $icon, // these frills, with base64 and comma, to format image data for Q/image/post handler.
				'path' => "Q/uploads/Streams",
				'subpath' => Q_Utils::splitId($stream->publisherId, 3, '/')."/".$stream->name."/icon/".time(),
				'save' => "NFT/icon"
			));
		}
	}
};