<?php
function TokenSociety_importNFT_response_content () {
	$communityId = Users::communityId();

	$allowed = Q_Config::expect('Communities', 'users', 'canImport');
	if (!Users::roles($communityId, $allowed)) {
		throw new Users_Exception_NotAuthorized();
	}

	$uri = Q_Dispatcher::uri();
	$action = Q::ifset($uri, 'value', false);

	// if download sample
	if ($action == 'sample') {
		$f = fopen('php://memory', 'w');
		fputs($f, 'Creator,Title,Description,Image URL,Categories,Fixed Price,Timed Price,Start Time,End Time,Currency,Royalty'."\n");
		fseek($f, 0);

		header('Content-Type: application/csv');
		header('Content-Disposition: attachment; filename="importNFTSample.csv";');

		fpassthru($f);
		exit;
	}

	Q_Response::addStylesheet('{{TokenSociety}}/css/importNFT.css');

	return Q::view('TokenSociety/content/importNFT.php');
}