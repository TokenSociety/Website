Q.page("TokenSociety/profile", function () {
	var userId = TokenSociety.profile.userId;
	if (userId) {
		var splitId = userId.splitId();
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

		$("button[name=coverPhoto]").plugin('Q/imagepicker', options, function () {});
	}

    var _socialHandlerProfile = function () {
        var $this = $(this);
        var social = $this.attr('data-type');
        var socialUserName = $this.attr('data-connected');

        const socialUrls = {
            "facebook": "https://www.facebook.com/",
            "twitter": "https://twitter.com/",
            "linkedin": "https://www.linkedin.com/in/",
            "github": "https://github.com/",
            "instagram": "https://www.instagram.com/"
        };

        if (userId !== Q.getObject("loggedInUser.id", Q.Users)) {
            var url = socialUserName;
            if (!url.includes(socialUrls[social])) {
                url = socialUrls[social] + url;
            }
            Q.openUrl(url);
            return;
        }

        $this.addClass('Q_working');

        Q.Text.get('Communities/content', function (err, content) {
            Q.req('Communities/profileInfo', 'social', function (err, data) {
                $this.removeClass('Q_working');

                var msg;
                if (msg = Q.firstErrorMessage(err, data && data.errors)) {
                    return;
                }

                var value = data.slots.social;
                Q.prompt(null, function (username) {
                    // dialog closed
                    if (username === null) {
                        return;
                    }

                    $this.addClass('Q_working');
                    Q.req('Communities/profileInfo', 'social', function (err, data) {
                        $this.removeClass('Q_working');
                        var msg;
                        if (msg = Q.firstErrorMessage(err, data && data.errors)) {
                            return;
                        }

                        $this.attr('data-connected', data.slots.social);
                    }, {
                        fields: {
                            social: social,
                            value: username,
                            action: "update"
                        }
                    });
                }, {
                    title: content.me.UpdateSocialTitle.replace('{{1}}', social),
                    initialText: value,
                    className: 'profile-social'
                });
            }, {
                fields: {
                    social: social,
                    action: "get"
                }
            });
        });

        return false;
    };
    $(".header-list-itms .Communities_social_icon[data-type=facebook]").on(Q.Pointer.fastclick, _socialHandlerProfile);
    $(".header-list-itms .Communities_social_icon[data-type=twitter]").on(Q.Pointer.fastclick, _socialHandlerProfile);
    $(".header-list-itms .Communities_social_icon[data-type=linkedin]").on(Q.Pointer.fastclick, _socialHandlerProfile);
    $(".header-list-itms .Communities_social_icon[data-type=github]").on(Q.Pointer.fastclick, _socialHandlerProfile);
    $(".header-list-itms .Communities_social_icon[data-type=instagram]").on(Q.Pointer.fastclick, _socialHandlerProfile);

    $("a.follow-btn").on(Q.Pointer.fastclick, function () {
        if (Q.Users.loggedInUser) {
            Q.req("TokenSociety/followers", "set", function (err, data) {
                data = data.slots.set;
                var $followers = $(".followers");

                if (data.res) {
                    $followers.addClass("Q_selected");
                } else {
                    $followers.removeClass("Q_selected");
                }

                $("span", $followers).text(data.followers);
            }, {
                fields: {
                    publisherId: TokenSociety.profile.userId,
                    streamName: "TokenSociety/user/NFTs"
                }
            });
        } else {
            Q.Users.login({
                onSuccess: function () {
                    Q.handle(window.location.href);
                }
            });
        }
    });

	return function () {
		// code to execute before page starts unloading
	};
	
}, 'TokenSociety');