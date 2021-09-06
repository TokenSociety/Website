Q.page("TokenSociety/NFT", function () {

    // code to execute after page finished loading
    $("#content .tokensociety_nft_tabs .tablinks").on(Q.Pointer.fastclick, function() {
        $(this).addClass('active').siblings('li').removeClass('active');
        $("#content .tokensociety_nft_details ." + this.id).addClass("active-content").siblings('.tabcontent').removeClass("active-content");
    });

    // set likes
    $("#content .tokensociety_nft_details_header_right .fa-heart").on(Q.Pointer.fastclick, function() {
        if (!Q.Users.loggedInUserId()) {
            return Q.Users.login({
                onSuccess: function () {
                    Q.handle(window.location.href);
                }
            });
        }

        var $likes = $(this).closest(".tokensociety_nft_details_header_right");
        Q.req("TokenSociety/likes", "set", function (err, data) {
            if (err) {
                return;
            }

            data = data.slots.set;

            if (data.res) {
                $likes.addClass("Q_selected");
            } else {
                $likes.removeClass("Q_selected");
            }

            $("span", $likes).text(data.likes);
        }, {
            fields: {
                publisherId: TokenSociety.NFT.publisherId,
                streamName: TokenSociety.NFT.streamName
            }
        });
    });

	return function () {
		// code to execute before page starts unloading
	};
	
}, 'TokenSociety');