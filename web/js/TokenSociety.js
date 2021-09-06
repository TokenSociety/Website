if (!window.Q) { // You can remove this part after you've run install.php
	document.getElementsByTagName('body')[0].innerHTML = "<h1>Please run TokenSociety/scripts/Q/install.php --all</h1>";
	throw "Q is not defined";
}

var TokenSociety = (function (Q, $) {
	
	var $body = $("body");
	
	var TokenSociety = {
		userContextual: function (item) {
			var action = $(item).attr('data-action');
			if (TokenSociety.actions[action]) {
				Q.handle(TokenSociety.actions[action], TokenSociety, [item]);
			}
		},
		actions: {
			logout: Q.Users.logout,
			setIdentifier: Q.Users.setIdentifier
		}
	};
	
	
	Q.onInit.set(function () {
		Q.Streams.options.overrideUserRegistrationForm = false;
		Q.Text.get('TokenSociety/content'); // override some strings client-side
	}, 'TokenSociety', true);
	
	// customise Q/tabs tool getCurrentTab method to mark as current links like {baseUrl}/profile/userId
	$body[0].forEachTool("Q/tabs", function () {
		this.getCurrentTab = function (tab) {
			var tool = this;
			var state = tool.state;
			var $tabs = tool.$tabs;
			var name = tool.getName(tab);
			name = name || state.tabName;
			var url = location.hash.queryField('url');
			if (url === undefined) {
				url = window.location.href.split('#')[0];
				if (!state.checkQueryString) {
					url = url.split('?')[0];
				}
			} else {
				url = Q.url(url);
			}
			var defaultTab = null;
			if (!tab) {
				$tabs.each(function (k, t) {
					var tdn = tool.getName(t);
					var tu = tool.getUrl(t);
					if ((tdn && tdn === name)
						|| (!name && tu === url)
						|| (!name && tu === url.split('?')[0])
						|| (!name && url.startsWith(tu))) {
						tab = t;
						return false;
					}
					if (state.defaultTabName === tdn) {
						defaultTab = t;
					}
				});
			}
			if (!tab) {
				tab = defaultTab;
			}
			return tab;
		};
	}, "TokenSociety");

	var _avatarClick = function (e) {
		var tool = Q.typeOf(this) === "Q.Tool" ? this : Q.Tool.from(this, "Users/avatar");
		var url = Q.url("profile/" + tool.state.userId);
		if (document.location.href.startsWith(url)) {
			return;
		}

		e.stopPropagation();
		e.preventDefault();
		Q.handle(url);
	};

	// The following code is for all pages.
	// For specific pages, see web/js/pages directory. 
	Q.page('', function () {
		var $connectWallet = $("#TokenSociety_connect");
		if ($connectWallet.length) {
			switch (!!Q.Users.loggedInUser) {
				case true:
					$connectWallet.replaceWith($('<div />').tool('Users/avatar', {
						icon: 50,
						contents: false
					}).activate());
					break;
				default:
					$connectWallet.show().on(Q.Pointer.fastclick, function () {
						Q.Users.login({
							onSuccess: function () {
								Q.handle(Q.url("{{baseUrl}}/profile"))
							}
						});
						return false;
					});
			}
		}

		$('.TokenSociety_login').on(Q.Pointer.click, function () {
			Q.Users.login({
				onSuccess: function () {
					Q.handle(Q.url("{{baseUrl}}/profile"))
				}
			});
			return false;
		});

		// For example, we can hide notices when the user clicks/taps on them
		$('#notices li').on(Q.Pointer.fastclick, true, function () {
			var $this = $(this), key;
			$this.css('min-height', 0)
			.slideUp(300, function () {
				$(this).remove();
				if (!$('#notices li').length) {
					$('#notices_slot').empty();
				}
				Q.layout();
			});
			if (key = $this.attr('data-key')) {
				Q.req('Q/notice', 'data', null, {
					method: 'delete', 
					fields: {key: key} 
				});
			}
		}).css('cursor', 'pointer');

		$("#page")[0].forEachTool("TokenSociety/NFT/preview", function(){
			// onClick NFT/preview element tool
			this.state.onInvoke.set(function (publisherId, tokenId){
                Q.handle(Q.url("NFT/" + publisherId + "/" + tokenId))
			});

			// onClick Users/avatar tool
			this.state.onAvatar.set(_avatarClick);
        });

	}, 'TokenSociety');

	$body.on(Q.Pointer.fastclick, ".Users_avatar_tool", _avatarClick);

	// customise Communities.openUserProfile to open profile page
	Q.Communities.openUserProfile = function (userId) {
		Q.handle(Q.url("{{baseUrl}}/profile/" + userId));
	};

	Q.Tool.define.options('Communities/onboarding', {
		onComplete: new Q.Event(function () {
			Q.handle(Q.url("{{baseUrl}}/profile"));
		}, 'Communities')
	});

	// tell Q.handle to load pages using AJAX - much smoother
	Q.handle.options.loadUsingAjax = true;
	
	// make the app feel more native on touch devices
	Q.Pointer.preventRubberBand({
		direction: 'vertical'
	});
	Q.Pointer.startBlurringOnTouch();
	
	// set some options
	if (Q.info.isTouchscreen) {
		Q.Tool.jQuery.options("Q/clickable", {
			press: { size: 1.5 },
			release: { size: 3 },
			shadow: null
		});
	}
	
	Q.extend(Q.Tool.jQuery.loadAtStart, [
		'Q/clickfocus', 
		'Q/contextual', 
		'Q/scrollIndicators', 
		'Q/iScroll', 
		'Q/scroller', 
		'Q/touchscroll'
	]);
	
	Q.Tool.define({
		'TokenSociety/search': '{{TokenSociety}}/js/tools/search.js',
        'TokenSociety/NFT/preview': '{{TokenSociety}}/js/tools/NFT/preview.js',
        'TokenSociety/NFT/filter': '{{TokenSociety}}/js/tools/NFT/filter.js',
        'TokenSociety/featured': '{{TokenSociety}}/js/tools/featured.js',
		'TokenSociety/importNFT': '{{TokenSociety}}/js/tools/NFT/import.js'
    });
	
	//Q.Users.cache.where = 'local';
	//Q.Streams.cache.where = 'local';

	return TokenSociety;
	
})(Q, jQuery);

var NFT = (function (Q, $) {

	var texts = null;
	var ABI = null;
	var erc20abi = null;
	Q.onInit.set(function () {
		var pipe = new Q.pipe(["texts", "abi", "erc20abi"], function () {
			if (Q.isEmpty(window.ethereum)) {
				return;
				// Q.alert(texts.errors.WalletAbsent, {
// 					title: texts.errors.Error
// 				});
			}

			var provider = new ethers.ethers.providers.Web3Provider(window.ethereum);

			// Subscribe to networkId change
			provider.on("networkChanged", (networkId) => {
				console.log('networkId', networkId);
				NFT.checkProvider();
			});
			// Subscribe to provider connect
			provider.on("connect", (info) => {
				console.log(info);
				NFT.checkProvider();
			});
			// Subscribe to provider disconnection
			provider.on("disconnect", (error) => {
				NFT.checkProvider();
			});

			// check provider connected and selected valid network
			NFT.checkProvider();
		});

		// get texts
		Q.Text.get('TokenSociety/content', function (err, content) {
			texts = content;
			pipe.fill("texts")();
		});

		// get ABI json
		$.getJSON(Q.url("js/nft-contract.abi.json"), function(data) {
			ABI = data;
			pipe.fill("abi")();
		});
		$.getJSON(Q.url("js/erc20.abi.json"), function(data) {
			erc20abi = data;
			pipe.fill('erc20abi')();
		});

	}, 'NFT');

	var NFT = {
		/**
		 * Check provider connected, and selected valid network
		 * @method checkProvider
		 */
		checkProvider: function () {
			// check MetaMask connected
			var $page = $("#page");

			window.ethereum.request({method: 'eth_accounts'}).then(function(accounts){
				if (!Q.getObject("length", accounts)) {
					return;
					// return Q.alert(texts.errors.UserNotLoggedInMetaMask, {
					// 	title: texts.errors.Error
					// });
				}

				// user logged in to MetaMask

				// check network
				var supported = false;
				var supportedNetwork = null;
				Q.each(TokenSociety.config.chainNetworks, function (key, val) {
					if (val.current) {
						if (window.ethereum.chainId === key) {
							supported = true;
						}
						supportedNetwork = val.name;
					}
				});
				if (!supported) {
					// return Q.alert(texts.errors.NetworkNotSupported.interpolate({supportedNetwork: supportedNetwork}), {
					// 	title: texts.errors.Error
					// });
				}
			}, function (err) {
				Q.alert(err.reason, {
					title: texts.errors.Error
				});
			});
		},
		/**
		 * Cet currencyToken, comissionToken for currently selected network
		 * @method getCurrencyTokens
		 * @param {String} currency "ETH", "USDC", ...
		 */
		getCurrencyTokens: function (currency) {
			var currencyTokens = TokenSociety.config.currencies[currency];
			var networkId = Q.getObject("chainId", window.ethereum);
			var currencyToken = Q.getObject(networkId, currencyTokens);
			var commissionToken = Q.getObject("commission_token", currencyTokens) || currencyToken;

			return {
				currencyToken: currencyToken,
				commissionToken: commissionToken
			};
		},
		/**
		 * Create contract for user
		 * @method getContract
		 * @params {function} callback
		 * @params {object} [options]
		 * @params {boolean} [options.checkWallet=false] If true, check wallet before create contract
		 * @params {String} [options.network=window.ethereum.chainId] Custom network
		 */
		getContract: function (callback, options) {
			if (Q.isEmpty(window.ethereum)) {
				// Q.alert(texts.errors.WalletAbsent, {
				// 	title: texts.errors.Error
				// });
				return Q.handle(callback, null, [null]);
			}

			var network = Q.getObject("network", options) || Q.getObject("chainId", window.ethereum);
			var provider = new ethers.ethers.providers.Web3Provider(window.ethereum);
			var contract = new ethers.Contract(TokenSociety.config.chainNetworks[network].contract, ABI, provider.getSigner()); //0xbafc62da00ba701117f5b6a533ecd61299ba62a6

			if (Q.getObject("checkWallet", options) === true) {
				Q.Catalogs.connectWallet().then(function () {
					Q.handle(callback, null, [contract]);
				});
				return;
			}

			Q.handle(callback, null, [contract]);
		},
		/**
		 * Get author of NFT by tokenId
		 * @method getAuthor
		 * @params {String} tokenId NFT tokenId
		 * @params {String} network Blockchain network where the tokenId was created
		 * @params {function} callback
		 */
		getAuthor: function (tokenId, network, callback) {
			var that = this;
			var _process = function (contract) {
				if (!that.contract) {
					that.contract = contract;
				}

				contract.authorOf(tokenId).then(function (address) {
					Q.handle(callback, null, [null, address, contract]);
				}, function (err) {
					Q.handle(callback, null, [err.reason]);
				});
			};

			if (that.contract) {
				_process(that.contract);
			} else {
				NFT.getContract(_process, {
					network: network
				});
			}
		},
		/**
		 * Get owner of NFT by tokenId
		 * @method getOwner
		 * @params {String} tokenId NFT tokenId
		 * @params {String} network Blockchain network where the tokenId was created
		 * @params {function} callback
		 */
		getOwner: function (tokenId, network, callback) {
			var that = this;
			var _process = function (contract) {
				if (!that.contract) {
					that.contract = contract;
				}

				contract.ownerOf(tokenId).then(function (address) {
					Q.handle(callback, null, [null, address, contract]);
				}, function (err) {
					Q.handle(callback, null, [err.reason]);
				});
			};

			if (that.contract) {
				_process(that.contract);
			} else {
				NFT.getContract(_process, {
					network: network
				});
			}
		},
		/**
		 * Get commissionInfo of NFT by tokenId
		 * @method commissionInfo
		 * @params {String} tokenId NFT tokenId
		 * @params {String} network Blockchain network where the tokenId was created
		 * @params {function} callback
		 */
		commissionInfo: function (tokenId, network, callback) {
			var that = this;
			var _process = function (contract) {
				if (!that.contract) {
					that.contract = contract;
				}

				contract.getCommission(tokenId).then(function (info) {
					Q.handle(callback, null, [null, info, contract]);
				}, function (err) {
					Q.handle(callback, null, [err.reason]);
				});
			};

			if (that.contract) {
				_process(that.contract);
			} else {
				NFT.getContract(_process, {
					network: network
				});
			}
		},
		/**
		 * Get saleInfo of NFT by tokenId
		 * @method saleInfo
		 * @params {String} tokenId NFT tokenId
		 * @params {String} network Blockchain network where the tokenId was created
		 * @params {function} callback
		 */
		saleInfo: function (tokenId, network, callback) {
			var that = this;
			var _process = function (contract) {
				if (!that.contract) {
					that.contract = contract;
				}

				contract.saleInfo(tokenId).then(function (info) {
					var price = Q.getObject("1._hex", info);
					Q.handle(callback, null, [null, {
						price: price,
						priceDecimal: parseInt((price || 0), 16)/1e18,
						currencyToken: Q.getObject("0", info) || null,
						isSale: !!Q.getObject("2", info)
					}, contract]);
				}, function (err) {
					Q.handle(callback, null, [err.reason]);
				});
			};

			if (that.contract) {
				_process(that.contract);
			} else {
				NFT.getContract(_process, {
					network: network
				});
			}
		},
		/**
		 * Transfer NFT from one wallet to another
		 * @method transferFrom
		 * @params {String} tokenId NFT tokenId
		 * @params {String} network Blockchain network where the tokenId was created
		 * @params {String} newAddress wallet address to transfer to
		 * @params {function} callback
		 */
		transferFrom: function (tokenId, network, newAddress, callback) {
			Q.handle(NFT.getOwner, this, [tokenId, network, function (err, owner, contract) {
				if (err) {
					return Q.alert(err);
				}

				contract.transferFrom(owner, newAddress, tokenId).then(function (info) {
					Q.handle(callback, null, [null, info]);
				}, function (err) {
					Q.handle(callback, null, [err.reason]);
				});
			}]);
		},
		/**
		 * Buy NFT
		 * @method buy
		 * @params {String} tokenId NFT tokenId
		 * @params {String} network Blockchain network where the tokenId was created
		 * @params {String} currency currency of NFT
		 * @params {function} callback
		 */
		buy: function (tokenId, network, currency, callback) {
			var _waitTransaction = function (transactionRequest) {
				if (!Q.getObject("wait", transactionRequest)) {
					return Q.alert("Transaction request invalid!");
				}

				transactionRequest.wait(1).then(function (TransactionReceipt) {
					if (Q.Catalogs.isSuccessfulTransaction(TransactionReceipt)) {
						Q.handle(callback, null, [null, TransactionReceipt]);
					} else {
						Q.handle(callback, null, ["transaction failed"]);
					}
				}, function (err) {
					Q.handle(callback, null, [err.reason]);
				});
			};

			NFT.saleInfo(tokenId, network, function (err, price) {
				var provider = new ethers.ethers.providers.Web3Provider(window.ethereum);
				var contractAddress = TokenSociety.config.chainNetworks[network].contract;

				NFT.getContract(function (contract) {
					if (price.currencyToken === "0x0000000000000000000000000000000000000000") {
						contract.estimateGas.buy(tokenId, {value: price.price, from: window.ethereum.selectedAddress}).then(function (gasAmount) {
							contract.buy(tokenId, {value: price.price, gasLimit: parseInt(gasAmount._hex, 16)}).then(_waitTransaction);
						}).catch(function (err) {
							debugger;
						});
						//contract.buy(tokenId, {value: price.price, gasLimit: 10000000}).then(_waitTransaction);
					} else {
						var erc20Contract = new ethers.Contract(price.currencyToken, erc20abi, provider.getSigner());
						erc20Contract.approve(contractAddress, price.price).then(function () {
							contract.estimateGas.buyWithToken(tokenId).then(function (gasAmount) {
								contract.buyWithToken(tokenId, {gasLimit: parseInt(gasAmount._hex, 16)}).then(_waitTransaction);
							}).catch(function (err) {
								debugger;
							});
							//contract.buyWithToken(tokenId, {gasLimit: 10000000}).then(_waitTransaction);
						});
					}
				}, {
					network: network
				});
			});
		}
	};

	return NFT;

})(Q, jQuery);