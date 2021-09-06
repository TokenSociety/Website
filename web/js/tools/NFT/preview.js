(function (window, Q, $, undefined) {
    /**
     * @module TokenSociety
     */

    /**
     * YUIDoc description goes here
     * @class TokenSociety NFT/preview
     * @constructor
     * @param {Object} [options] Override various options for this tool
     *  @param {boolean} onMarketPlace default value of onMarketPlace
     *  @param {string} defaultCurrency default currency selected
     *  @param {Q.Event} [options.onInvoke] Event occur when user click on tool element.
     *  @param {Q.Event} [options.onAvatar] Event occur when click on Users/avatar tool inside tool element.
     */
    Q.Tool.define("TokenSociety/NFT/preview", ["Streams/preview"], function(options, preview) {
        var tool = this;
        var state = tool.state;
        var previewState = preview.state;
        tool.preview = preview;

        // <set Streams/preview imagepicker settings>
        previewState.imagepicker = {
            showSize: TokenSociety.NFT.icon.defaultSize,
            save: "NFT/icon"
        };
        previewState.imagepicker.saveSizeName = {};
        previewState.imagepicker.saveSizeName[previewState.imagepicker.showSize] = previewState.imagepicker.showSize;
        // </set Streams/preview imagepicker settings>

        var pipe = Q.pipe(['stylesheet', 'text'], function (params, subjects) {
            if (previewState.streamName) {
                previewState.onRefresh.add(function (stream) {
                    tool.stream = stream;

                    var pipe = new Q.pipe(["author", "owner", "commissionInfo", "saleInfo"], function (params, subjects) {
                        var author = params.author[1];
                        var owner = params.owner[1];
                        var commissionInfo = params.commissionInfo[1];
                        var saleInfo = params.saleInfo[1];

                        tool.refresh(stream, author, owner, commissionInfo, saleInfo);
                    });

                    var tokenId = stream.getAttribute("tokenId");
                    var network = stream.getAttribute("network");
                    Q.handle(NFT.getContract, tool, [function (contract) {
                        tool.contract = contract;

                        if (contract) {
                            Q.handle(NFT.getAuthor, tool, [tokenId, network, pipe.fill("author")]);
                            Q.handle(NFT.getOwner, tool, [tokenId, network, pipe.fill("owner")]);
                            Q.handle(NFT.commissionInfo, tool, [tokenId, network, pipe.fill("commissionInfo")]);
                            Q.handle(NFT.saleInfo, tool, [tokenId, network, pipe.fill("saleInfo")]);
                            return;
                        }

                        pipe.fill("author")(stream.getAttribute("author"));
                        pipe.fill("owner")();
                        pipe.fill("commissionInfo")();
                        pipe.fill("saleInfo")({
                            isSale: false,
                            price: null,
                            currencyToken: null
                        });
                    }, {
                        network: network
                    }]);
                }, tool);
            } else {
                previewState.onComposer.add(tool.composer.bind(tool), tool);
            }
        });

        Q.addStylesheet("css/tools/NFT/preview.css", pipe.fill('stylesheet'), { slotName: 'TokenSociety' });
        Q.Text.get('TokenSociety/content', function(err, text){
            tool.text = text;
            pipe.fill('text')();
        });
    },

{ // default options here
        defaultCurrency: "BNB",
        onMarketPlace: true,
        onInvoke: new Q.Event(),
        onAvatar: new Q.Event()
    },

{ // methods go here
        /**
         * Refreshes the appearance of the tool completely
         * @method refresh
         * @param {Streams_Stream} stream
         * @param {String} author
         * @param {String} owner
         * @param {object} comissionInfo
         * @param {object} saleInfo
         */
        refresh: function (stream, author, owner, comissionInfo, saleInfo) {
            var tool = this;
            var state = tool.state;
            var publisherId = stream.fields.publisherId;
            var streamName = stream.fields.name;
            var $toolElement = $(this.element);

            tool.preview.state.editable = false;

            if (Q.Users.loggedInUserId() === stream.fields.publisherId) {
                $toolElement.addClass("TokenSociety_NFT_self");
            }

            var tokenId = stream.getAttribute("tokenId");
            var fixedPrice = stream.getAttribute("fixedPrice");
            var timedAction = stream.getAttribute("timedAction");
            var openForBids = stream.getAttribute("openForBids");
            var network = stream.getAttribute("network");

            $toolElement.attr("data-owned", owner && owner !== author);
            $toolElement.attr("data-onSale", !!Q.getObject("isSale", saleInfo));

            var price = Q.getObject("priceDecimal", saleInfo) || null;

            // we can't get currency from tokenId because some currencies have same tokenId
            //var currency = stream.getAttribute("currency"); // saleInfo.currencyToken, network

            var bidText = tool.text.NFT.CurrentBid;
            var startTime = null;
            var endTime = null;
            var currency = null;
            if (Q.getObject("active", fixedPrice) === 'true') {
                currency = Q.getObject("currency", fixedPrice);
                bidText = tool.text.NFT.FixedBid;
            } else if (Q.getObject("active", timedAction)) {
                currency = Q.getObject("currency", timedAction);
                startTime = parseInt(Q.getObject("startTime", timedAction)) || 0;
                var currentTimeStamp = Date.now()/1000;
                if (startTime > currentTimeStamp) {
                    $toolElement.addClass("TokenSociety_NFT_notStarted");
                }
                endTime = parseInt(Q.getObject("endTime", timedAction)) || 0;
                if (endTime && endTime < currentTimeStamp) {
                    $toolElement.addClass("TokenSociety_NFT_ended");
                }
            }

            tool.contract && tool.contract.on("Transfer", function (oldAddress, newAddress, token) {
                var processedTokenId = parseInt(token._hex, 16);
                if (tokenId !== processedTokenId) {
                    return;
                }

                $(".NFT_owner", $toolElement).text(tool.minimizeAddress(newAddress, 20, 3));
                $toolElement.attr("data-owned", newAddress && newAddress !== author);
                Q.handle(NFT.saleInfo, tool, [tokenId, network, function (err, saleInfo) {
                    if (err) {
                        return Q.alert(err);
                    }

                    $toolElement.attr("data-onSale", !!Q.getObject("isSale", saleInfo));
                    $(".TokenSociety_NFT_price_value", $toolElement).text(Q.getObject("priceDecimal", saleInfo));
                }]);
            });

            Q.Template.render('TokenSociety/NFT/view', {
                title: stream.fields.title,
                price: price,
                currency: currency,
                bidText: bidText,
                owner: tool.minimizeAddress(owner, 20, 3),
                startTime: startTime,
                endTime: endTime
            }, (err, html) => {
                tool.element.innerHTML = html;

                $toolElement.activate();

                $(".TokenSociety_NFT_avatar", tool.element).tool("Users/avatar", {
                    userId: stream.fields.publisherId,
                    icon: 50,
                    contents: false,
                    editable: false
                }).activate(function () {
                    var userId = this.state.userId;
                    $(this.element).on(Q.Pointer.fastclick, function (e) {
                        Q.handle(state.onAvatar, this, [e]);
                    });
                });

                // apply Streams/preview icon behavior
                tool.preview.icon($("img.NFT_preview_icon", tool.element)[0]);

                var interests = [];
                // set categories
                stream.relatedFrom("NFT/category", function () {
                    Q.each(this.relatedStreams, function (index) {
                        if (this.fields.type === "Streams/interest") {
                            interests.push("<span>" + this.fields.title + "</span>");
                        }
                    });
                    $(".categories", tool.element).html(interests[0]);
                });

                // handle with days, hours, minutes visibility
                var $startDate = $(".TokenSociety_NFT_startDate", tool.element);
                var $endDate = $(".TokenSociety_NFT_endDate", tool.element);
                if ($startDate.length || $endDate.length) {
                    // apply Catalogs.countdown to startTime, endTime
                    $("[data-timestamp]", tool.element).each(function () {
                        $(this).tool("Q/countdown", {
                            onRefresh: function () {
                                var $currentElement = $(this.element);
                                var currentTimestamp = Date.now()/1000;
                                if (startTime > currentTimestamp) {
                                    $startDate.show();
                                    $endDate.hide();
                                } else {
                                    $startDate.hide();
                                    $endDate.show();
                                    $toolElement.removeClass("TokenSociety_NFT_notStarted");

                                    if (endTime && endTime < currentTimestamp) {
                                        $toolElement.addClass("TokenSociety_NFT_ended");
                                    }
                                }

                                $(".Q_days:visible, .Q_hours:visible, .Q_minutes:visible, .Q_seconds:visible", $currentElement).each(function () {
                                    var $this = $(this);
                                    if (($this.hasClass("Q_days") || $this.hasClass("Q_hours") || $this.hasClass("Q_minutes")) && $this.text() === "0") {
                                        var $parent = $this.parent();
                                        var $prevSpan = $parent.prev("span:visible");
                                        if (!$prevSpan.length) {
                                            $parent.hide();
                                        }
                                    }

                                    Q.each(["day", "hour", "minute"], function(i, val) {
                                        if (val === 'day') {
                                            if ($this.hasClass("Q_" +val + "s") && $this.text() === "1") {
                                                $this.next("." + val + "sText").text(tool.text.NFT[val.toCapitalized()]);
                                            } else {
                                                $this.next("." + val + "sText").text(tool.text.NFT[(val + "s").toCapitalized()]);
                                            }
                                        } else {
                                            $this.next("." + val + "sText").text(':');
                                        }

                                    });
                                });
                            }
                        }).activate();
                    });
                }

                // set onInvoke event
                var lastPart = streamName.split('/')[2];
                $toolElement.on(Q.Pointer.fastclick, function () {
                    Q.handle(state.onInvoke, tool, [publisherId, lastPart]);
                });

                // set onForward event
                $(".forward-btn", $toolElement).on(Q.Pointer.fastclick, function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    Q.Streams.invite(Q.Users.communityId, 'Streams/experience/main', {
                        appUrl: [Q.info.baseUrl, "NFT", publisherId, lastPart].join("/")
                    });
                });

                var $likes = $(".likes", $toolElement);
                // get likes
                Q.req("TokenSociety/likes", "get", function (err, data) {
                    if (err) {
                        return;
                    }

                    data = data.slots.get;

                    if (data.res) {
                        $likes.addClass("Q_selected");
                    } else {
                        $likes.removeClass("Q_selected");
                    }

                    $likes.text(data.likes);
                }, {
                    fields: {
                        publisherId: publisherId,
                        streamName: streamName
                    }
                });

                // set likes handler
                $likes.on(Q.Pointer.fastclick, function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (!Q.Users.loggedInUserId()) {
                        return Q.Users.login({
                            onSuccess: function () {
                                Q.handle(window.location.href);
                            }
                        });
                    }

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

                        $likes.text(data.likes);
                    }, {
                        fields: {
                            publisherId: publisherId,
                            streamName: streamName
                        }
                    });
                });

                $("button[name=placeBid]", tool.element).on(Q.Pointer.fastclick, function (e) {
                    e.stopPropagation();
                    e.preventDefault();

                    NFT.buy(tokenId, network, currency, function (err, transaction) {});
                });
            });
        },
        /**
         * Get long string and minimize to fixed length with some chars at the end and dots in the middle
         * @method minimizeAddress
         * @param {string} str
         * @param {integer} length result length
         * @param {integer} endChars amount of chars at the end
         */
        minimizeAddress: function (str, length, endChars) {
            if (!str) {
                return str;
            }

            endChars = endChars || 0;
            var strLength = str.length;
            if (strLength <= length) {
                return str;
            }

            return str.substr(0, length - endChars - 3) + "..." + str.substr(-endChars, endChars);
        },
        /**
         * Create composer
         * @method composer
         * @param {function} callback Need to call this function to start create stream process
         */
        composer: function (callback) {
            var tool = this;
            var state = tool.state;
            var $toolElement = $(this.element);
            var previewState = tool.preview.state;

            var relatedTool = Q.Tool.from($toolElement.closest(".Streams_related_tool")[0], "Streams/related");

            Q.Template.render('TokenSociety/NFT/composer', {}, function(err, html) {
                tool.element.innerHTML = html;

                var $composer = $(".tokensociety_create_tiles", tool.element);

                $composer.addClass("Q_working");

                // get or create composer stream
                Q.req("TokenSociety/NFT", "newItem", function (err, response) {
                    if (err) {
                        return;
                    }

                    var newItem = response.slots.newItem;

                    $composer.removeClass("Q_working");

                    previewState.publisherId = newItem.publisherId;
                    previewState.streamName = newItem.streamName;
                    var currenciesHTML = '<select name="currency">';
                    Q.each(TokenSociety.config.currencies, function (key, val) {
                        currenciesHTML += '<option '+(key.toLowerCase() === state.defaultCurrency.toLowerCase() ? "selected" : '')+'>' + key + '</option>';
                    });
                    currenciesHTML += '</select>';

                    $toolElement.on(Q.Pointer.fastclick, function () {
                        Q.Dialogs.push({
                            title: tool.text.NFT.CreateNFT,
                            className: "TokenSociety_NFT_preview_composer",
                            template: {
                                name: "TokenSociety/NFT/nftCreate",
                                fields: {
                                    currencies: currenciesHTML,
                                    onMarketPlace: state.onMarketPlace
                                }
                            },
                            onActivate: function (dialog) {
                                var $icon = $("img.NFT_preview_icon", dialog);

                                // apply Streams/preview icon behavior
                                tool.preview.icon($icon[0]);

                                var interests = [];
                                $(".tokensociety_nft_categories", dialog).tool("Streams/interests", {
                                    userId: false,
                                    canAdd: false,
                                    all: false,
                                    filter: null,
                                    skipSelect: true,
                                    onClick: function (element, normalized, category, title2, wasSelected) {
                                        if (wasSelected) {
                                            interests = interests.filter(function(value, index, arr){
                                                return value !== normalized;
                                            });
                                        } else {
                                            interests.push(normalized);
                                        }
                                    }
                                }).activate();

                                // simulate click event on icon
                                $(".tokensociety_nft_upload_button", dialog).on(Q.Pointer.fastclick, function (event) {
                                    event.preventDefault();
                                    $icon.trigger("click");
                                });

                                $(".tokensociety_nft_clickable", dialog).on(Q.Pointer.fastclick, function (event) {
                                    event.preventDefault();
                                    $(".tokensociety_nft_clickable").removeClass("active");
                                    $(this).closest(".tokensociety_nft_clickable").addClass("active");
                                });

                                var $onMarketPlace = $(".tokensociety_nft_check", dialog);
                                $onMarketPlace.click(function() {
                                    $(".tokensociety_nft_form_details", dialog).attr("data-active", $onMarketPlace.prop('checked'));
                                });

                                $(".time_details", dialog).hide();

                                $("[data-type=fixed]", dialog).on(Q.Pointer.fastclick, function (event) {
                                    event.preventDefault();
                                    $(".fixed_details", dialog).show();
                                    $(".time_details", dialog).hide();
                                });

                                $("[data-type=time]", dialog).on(Q.Pointer.fastclick, function (event) {
                                    event.preventDefault();
                                    $(".fixed_details", dialog).hide();
                                    $(".time_details", dialog).show();
                                });

                                $("[data-type=bid]", dialog).on(Q.Pointer.fastclick, function (event) {
                                    event.preventDefault();
                                    $(".fixed_details", dialog).hide();
                                    $(".time_details", dialog).hide();
                                });

                                $("button[name=save]", dialog).on(Q.Pointer.fastclick, function (event) {
                                    event.preventDefault();

                                    $(dialog).addClass("Q_working");

                                    var priceType = $(".tokensociety_market_button .active", dialog).attr("data-type");

                                    var startTime = $("input[name=startTime]", dialog).val();
                                    if (startTime) {
                                        startTime = Date.parse(startTime)/1000;
                                    }

                                    var endTime = $("input[name=endTime]", dialog).val();
                                    if (endTime) {
                                        endTime = Date.parse(endTime)/1000;
                                    }

                                    var currency = $("select[name=currency]:visible", dialog).val();
                                    if (!currency) {
                                        currency = $("select[name=currency]", dialog).val();
                                    }
                                    var royalty = $("input[name=royalty]", dialog).val();
                                    var price = parseFloat($("input[name=fixedPrice]:visible", dialog).val() || $("input[name=minBid]:visible", dialog).val());
                                    var onMarketPlace = $onMarketPlace.prop("checked");

                                    var _reqCreateNFT = function (tokenId, network) {
                                        Q.req("TokenSociety/NFT",function () {
                                            Q.Dialogs.pop();

                                            relatedTool.refresh(function () {
                                                tool.composer();
                                            });
                                        }, {
                                            method: "post",
                                            fields: {
                                                userId: TokenSociety.profile.userId,
                                                title: $("input[name=title]", dialog).val(),
                                                content: $("input[name=description]", dialog).val(),
                                                interests: interests,
                                                attributes: {
                                                    tokenId: tokenId || null,
                                                    network: network,
                                                    onMarketPlace: onMarketPlace,
                                                    fixedPrice: {
                                                        active: priceType === "fixed",
                                                        price: $("input[name=fixedPrice]", dialog).val(),
                                                        currency: $(".fixed_details select[name=currency]", dialog).val()
                                                    },
                                                    timedAction: {
                                                        active: priceType === "time",
                                                        price: $("input[name=minBid]", dialog).val(),
                                                        startTime: startTime,
                                                        endTime: endTime,
                                                        currency: $(".time_details select[name=currency]", dialog).val()
                                                    },
                                                    openForBids: {
                                                        active: priceType === "bid"
                                                    },
                                                    royalty: royalty
                                                }
                                            }
                                        });
                                    };

                                    // create token
                                    tool.createToken(price, currency, royalty, onMarketPlace, function (err, tokenId, network) {
                                        if (err) {
                                            return $(dialog).removeClass("Q_working");
                                        }

                                        _reqCreateNFT(tokenId, network);
                                    });
                                });
                            }
                        });
                    });
                }, {
                    fields: {
                        userId: TokenSociety.profile.userId
                    }
                });
            });
        },
        /**
         * Create token for NFT
         * @method createToken
         * @param {number} price
         * @param {string} currency
         * @param {number} royalty
         * @param {boolean} onSale If false, call contract.create which just create token, but not put NFT to listForSale
         * @param {function} callback
         */
        createToken: function (price, currency, royalty, onSale,  callback) {
            var tool = this;
            var previewState = tool.preview.state;
            var lastPart = previewState.streamName.split('/')[2];

            var currencyTokens = NFT.getCurrencyTokens(currency);
            if (!currencyTokens) {
                return Q.handle(callback, tool, [true]);
            }
            var currencyToken = currencyTokens.currencyToken;
            var commissionToken = currencyTokens.commissionToken;

            Q.Catalogs.connectWallet().then(function () {
                NFT.getContract(function (contract) {
                    if (!contract) {
                        return Q.handle(callback, tool, [tool.text.errors.WalletAbsent]);
                        // return Q.alert(tool.text.errors.WalletAbsent, {
                        //     title: tool.text.errors.Error
                        // });
                    }

                    tool.processedTokens = tool.processedTokens || [];

                    price = 1e18 * price.toFixed(4);
                    var reduceCommissionPercent = price ? 0 : 10000;
                    royalty = parseFloat(royalty).toFixed(2) || 0;
                    royalty = parseInt(royalty > 0 ? price/(100/royalty) : 0) || 0;
                    royalty = '0x'+(royalty).toString(16);
                    var commissionParams = [commissionToken, royalty, 1, 0, 1, reduceCommissionPercent];
                    if (onSale && !price) {
                        return Q.alert(tool.text.errors.PriceRequired, {
                            title: tool.text.errors.Error
                        });
                    }

                    contract.once("TokenCreated", (author, tokenId) => {
                        tokenId = tokenId.toString();

                        if (tool.processedTokens.includes(tokenId)) {
                            return;
                        }

                        tool.processedTokens.push(tokenId);

                        Q.handle(callback, tool, [null, tokenId.toString(), window.ethereum.chainId]);
                    });

                    /*contract.once("TokenSeriesCreated", (author, fromTokenId, toTokenId) => {

                    });*/

                    if (onSale) {
                        contract.createAndSale(
                            Q.url("NFT/" + previewState.publisherId + "/" + lastPart + ".json"),
                            commissionParams,
                            '0x'+(price).toString(16),
                            currencyToken
                        ).then(function () {

                        }, function () {
                            Q.handle(callback, tool, [true]);
                        });
                    } else {
                        var arrayArgs = [Q.url("NFT/" + previewState.publisherId + "/" + lastPart + ".json"), commissionParams];
                        if (tool.series) { // if series created, add one more argument
                            arrayArgs.push(tokensAmount);
                        }
                        contract.create.apply(null, arrayArgs).then(function () {

                        }, function (err) {
                            Q.handle(callback, tool, [true]);
                            Q.alert(err.reason);
                        });
                    }
                }, {
                    checkWallet: true
                });
            });
        },
        Q: {
            beforeRemove: function () {
                if (this.state.countdownTimeId) {
                    clearInterval(this.state.countdownTimeId);
                }
            }
        }
    });

    Q.Template.set('TokenSociety/NFT/view',
`<div class="tile-block">
            <div class="tile_block_header">
                <ul class="online-c TokenSociety_author">
                    <li><div class="TokenSociety_NFT_avatar"></div></li>
                </ul>
                <div>
                    <p class="categories"></p>
                    <div class="NFT_preview_owner">{{NFT.Owner}}: <span class="NFT_owner">{{owner}}</span></div>
                </div>
            </div>
            <div class="video-container">
                <img class="NFT_preview_icon">
            </div>
            <h2 class="tile-name">{{title}}</h2>
            <ul class="bid-info">
                <li class="TokenSociety_NFT_price">
                    <span>{{bidText}}</span>
                    <p><span class="TokenSociety_NFT_price_value">{{price}}</span> {{currency}}</p>
                </li>
                {{#if startTime}}
                    <li class="TokenSociety_NFT_startDate">
                        <span>{{NFT.StartingIn}}</span>
                        <p data-timestamp="{{startTime}}">
                            <span class="dateDays"><span class="Q_days"></span> <span class="daysText">{{NFT.Days}}</span></span>
                            <span class="dateHours"><span class="Q_hours"></span> <span class="hoursText"></span></span>
                            <span class="dateMinutes"><span class="Q_minutes"></span> <span class="minutesText"></span></span>
                            <span class="dateSeconds"><span class="Q_seconds"></span> <span class="secondsText"></span></span>
                        </p>
                    </li>
                {{/if}}
                {{#if endTime}}
                    <li class="TokenSociety_NFT_endDate">
                        <span>{{NFT.EndingIn}}</span>
                        <p data-timestamp="{{endTime}}">
                            <span class="dateDays"><span class="Q_days"></span> <span class="daysText">{{NFT.Days}}</span></span>
                            <span class="dateHours"><span class="Q_hours"></span> <span class="hoursText"></span></span>
                            <span class="dateMinutes"><span class="Q_minutes"></span> <span class="minutesText"></span></span>
                            <span class="dateSeconds"><span class="Q_seconds"></span> <span class="secondsText"></span></span>
                        </p>
                    </li>
                {{/if}}
            </ul>
        </div>
        <div class="action-block">
            <span class="likes"></span>
            <span class="forward-btn"></span>
            <button name="placeBid" class="Q_button btn-g">{{NFT.PlaceBid}}</button>
            <button name="soldOut" class="Q_button btn-g">{{NFT.SoldOut}}</button>
        </div>`,
        {text: ['TokenSociety/content']}
    );

    Q.Template.set('TokenSociety/NFT/composer',
		`<div class="tile-block tokensociety_create_tiles">
           <div class="video-container tokensociety_create_video">
               <h4>{{NFT.CreateNFT}}</h4>
           </div>
           <div class="tokensociety_create_video_footer"></div>
		</div>`,
        {text: ['TokenSociety/content']}
	);

    Q.Template.set('TokenSociety/NFT/nftCreate',
`<div class="tokensociety_nft">
        <form>
            <div class="tokensociety_nft_form_group">
                <label>{{NFT.NftName}}:</label>
                <input type="text" name="title" class="tokensociety_nft_form_control" placeholder="{{NFT.TitlePlaceholder}}">
            </div>
            <div class="tokensociety_nft_form_group">
                <label>{{NFT.Description}}:</label>
                <input type="text" name="description" class="tokensociety_nft_form_control" placeholder="{{NFT.DescribeYourNFT}}">
            </div>
            <div class="tokensociety_nft_form_group">
                <label>{{NFT.NftPicture}}:</label>
                <div class="tokensociety_nft_picture">
                    <img class="NFT_preview_icon">
                    <button class="tokensociety_nft_upload_button">{{NFT.UploadFile}}</button>
                </div>
            </div>
            <div class="tokensociety_nft_form_group">
                <label>{{NFT.SelectCategory}}:</label>
                <div class="tokensociety_nft_categories"></div>
            </div>
            <div class="tokensociety_nft_form_group">

                <div class="tokensociety_nft_market">
                    <div>
                        <label>{{NFT.PutOnMarketplace}} :</label>
                        <p>{{NFT.InstantPurchase}}</p>
                    </div>
                    <label class="switch">
                        <input type="checkbox" {{#if onMarketPlace}}checked{{/if}} class="tokensociety_nft_check">
                        <span class="slider round"></span>
                    </label>
                </div>
                <div class="tokensociety_nft_form_details" data-active="{{onMarketPlace}}">
                    <div class="tokensociety_market_button">
                        <div class="tokensociety_nft_clickable active" data-type="fixed">
                            <img src="img/price.svg" />
                            <span>{{NFT.FixedPrice}}</span>
                        </div>
                        <div class="tokensociety_nft_clickable" data-type="time">
                            <img src="img/time.svg" />
                            <span>{{NFT.TimedAuction}}</span>
                        </div>
                        <div class="tokensociety_nft_clickable" data-type="bid">
                            <img src="img/bid.svg" />
                            <span>{{NFT.OpenForBids}}</span>
                        </div>
                    </div>

                    <div class="fixed_details">
                        <div class="tokensociety_nft_form_group">
                            <label>{{NFT.Price}}</label>
                            <div class="tokenSociety_price">
                                <input type="text" name="fixedPrice" class="tokensociety_nft_form_control" placeholder="{{NFT.PriceOnePiece}}">
                                {{& currencies}}
                            </div>
                        </div>
                    </div>
                    <div class="time_details">
                        <div class="tokensociety_nft_form_group">
                            <label>{{NFT.MinimumBid}}</label>
                            <div class="tokenSociety_price">
                                <input type="text" name="minBid" class="tokensociety_nft_form_control" placeholder="{{NFT.EnterMinimumBid}}">
                                {{& currencies}}
                            </div>
                            <p>{{NFT.BidsBelowThisAmount}}</p>
                        </div>
                        <div class="tokensociety_nft_form_group">
                            <div class="tokenSociety_price">
                                <div>
                                    <label>{{NFT.StartingDate}}</label>
                                    <input type="datetime-local" name="startTime">
                                </div>
                                <div>
                                    <label>{{NFT.ExpirationDate}}</label>
                                    <input type="datetime-local" name="endTime">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="tokensociety_nft_form_group">
                <label>{{NFT.Royalties}}:</label>
                <div class="tokenSociety_royality">
                    <input type="number" name="royalty" class="tokensociety_nft_form_control" placeholder="{{NFT.RoyaltyPlaceholder}}">
                </div>
            </div>
            <button class="Q_button" name="save">{{NFT.CreateYourNFT}}</button>
        </form>
    </div>`,
    {text: ['TokenSociety/content']}
);

})(window, Q, jQuery);
