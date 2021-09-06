Q.page("TokenSociety/me", function () {
	var user = Q.Users.loggedInUser;
	if (user) {
		var splitId = user.id.splitId();
		var options = {
			saveSizeName: Q.Users.cover.sizes,
			maxStretch: Q.Users.cover.maxStretch,
			//showSize: state.icon || $img.width(),
			path: 'Q/uploads/Users',
			subpath: splitId + '/cover',
			save: "Users/cover",
			onSuccess: function () {
				var newUrl = Q.url("{{baseUrl}}/Q/uploads/Users/" + splitId + "/cover/" + Q.Users.cover.defaultSize + ".png?" + new Date().getTime());
				$(".banner-block").css("background-image", "url(" + newUrl + ")");
			}
		};

		$("button[name=coverPhoto]").plugin('Q/imagepicker', options, function () {

		});
	}

	return function () {
		// code to execute before page starts unloading
	};
	
}, 'TokenSociety');