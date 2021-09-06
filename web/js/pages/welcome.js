Q.page("TokenSociety/welcome", function () { 
	
	// code to execute after page finished loading
	$('.Catalogs_connect_wallet').click(function () {
		Q.Catalogs.connectWallet().then(function (provider) {
			Q.handle(Q.url('marketplace'));
		});
	});
	
	$('.TokenSociety_register').plugin('Q/clickable')
	.click(function () {
		// Q.handle(Q.url('register')); // TODO: fix
		$('#firstpart').hide();
		$('#secondpart').show();
		return false;
	});
	
	$('#TokenSociety_submit').plugin('Q/clickable');
	$('#secondpart').on('submit', function () {
		$('#secondpart').hide();
		$('#thirdpart').show();
		var formData = new FormData(this);
		var request = new XMLHttpRequest();
		request.open("POST", Q.action('TokenSociety/register'));
		request.send(formData);
		return false;
	});
	
	return function () {
		// code to execute before page starts unloading
	};
	
}, 'TokenSociety');