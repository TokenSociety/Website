(function(window, Q, $, undefined) {

/**
 * @module TokenSociety
 */

/**
 * YUIDoc description goes here
 * @class TokenSociety nft-filter
 * @constructor
 * @param {Object} [options] Override various options for this tool
 *  @param {String} [options.publisherId] user id of the publisher of the stream
 *  @param {String} [options.streamName] the stream's name
 */
Q.Tool.define("TokenSociety/NFT/filter", function(options) {
        var tool = this;
        var state = tool.state;


        // if (!state.publisherId || !state.streamName) {
        //     throw new Q.Exception(tool.id + ": publisherId or streamName is required");
        // }

        var pipe = Q.pipe(['stylesheet', 'text'], function(params, subjects) {
            tool.refresh();
        });

        Q.addStylesheet("css/tools/NFT/filter.css", pipe.fill('stylesheet'), {
            slotName: 'TokenSociety'
        });
        Q.Text.get('TokenSociety/content', function(err, text) {
            tool.text = text;
            pipe.fill('text')();
        });

    },

    { // default options here
        publisherId: null,
        streamName: null
    },

    { // methods go here

        /**
         * Refreshes the appearance of the tool completely
         * @method refresh
         * @param {Function} callback receives arguments (err) with this = stream
         */
        refresh: function() {
            var tool = this;
            var state = tool.state;
            var $toolElement = $(this.element);

            // code to execute after page finished loading
            Q.Text.get('TokenSociety/content', function(err, text) {
                var _filterByNFTCategories = function() {
                    var $filter = $(this);
                    Q.Dialogs.push({
                        title: text.NFT.filter.ByCategory.FilterByNFTCollections,
                        className: 'Streams_dialog_interests',
                        stylesheet: '{{Q}}/css/expandable.css',
                        content: Q.Tool.setUpElement('div', 'Streams/interests', {
                            filter: text.NFT.filter.ByCategory.ShowNFTCollection,
                            all: text.NFT.filter.ByCategory.AllCollections,
                            onClick: function(element, normalized, category, interest, wasSelected) {
                                var nft_preview_tool = $('.TokenSociety_NFT_preview_tool');
                                $('.tokensociety_nft_filter_tool_nft_category').text(interest);
                                $(element).addClass('Q_selected');
                                $('h2', element).addClass('Q_expanded');

                                Q.each(nft_preview_tool, function(key, val) {
                                    var categoriesTexts = $(val).find("p.categories").text();
                                    if (normalized === "*") {
                                        $(val).attr("data-active", true);
                                    } else {
                                        if (categoriesTexts.includes(interest)) {
                                            $(val).attr("data-active", true);
                                        } else {
                                            $(val).attr("data-active", false);
                                        }
                                    }
                                });

                                Q.Dialogs.pop();
                                return false;
                            },
                            onReady: function() {
                                var te = this.element;

                                var $elements = $(".TokenSociety_NFT_preview_tool");
                                var allowedIds = [];
                                Q.each($elements, function(index, element) {
                                    var categories = $(this).find("p.categories span");
                                    Q.each(categories, function(categoryIndex, categoryElement) {
                                        var normalizedCategoryElement = "Streams_interest_title_" + Q.normalize(categoryElement.innerHTML);
                                        if (allowedIds.indexOf(normalizedCategoryElement) === -1) {
                                            allowedIds.push(normalizedCategoryElement);
                                        }
                                    });
                                });

                                // remove interests out of allowedIds
                                Q.each($(".Streams_interest_title", te), function(index, element) {
                                    if (allowedIds && allowedIds.indexOf(element.id) < 0) {
                                        element.remove();
                                    }
                                });

                                // remove subcategories and categories
                                Q.each($(".Streams_interests_container .Q_expandable_tool", te), function(index, element) {
                                    if (!$(".Streams_interest_title", element).length) {
                                        element.remove();
                                    }
                                });

                                // remove preloader
                                $(te).closest(".Streams_dialog_interests").removeClass("Streams_dialog_interests_preloading");

                            }
                        })
                    });
                };

                function _updatedNFTAuthors(publisherId) {
                    var nft_preview_tool = $('.TokenSociety_NFT_preview_tool');

                    Q.each(nft_preview_tool, function(index, element) {
                        var publisherIdElement = $(element).attr('data-publisherid');
                        if (publisherId === "*") {
                            $(element).attr("data-active", true);
                        } else {
                            if (publisherId === publisherIdElement) {
                                $(element).attr("data-active", true);
                            } else {
                                $(element).attr("data-active", false);
                            }
                        }
                    });
                }

                Q.Template.set("Communities_filter_publishers",
                    '<button class="Communities_filter_publishers_all">{{text.NFT.filter.ByUser.AllAuthors}}</button>' +
                    '<div class="Communities_filter_publishers_users"></div>' +
                    '</div>'
                );

                var _filterByNFTUsers = function() {
                    var $filterElement = $(this);

                    Q.Dialogs.push({
                        title: text.NFT.filter.ByUser.FilterByAuthors,
                        className: 'Communities_filter_publishers_dialog',
                        template: {
                            name: "Communities_filter_publishers",
                            fields: {
                                text: text
                            }
                        },
                        onActivate: function(dialog) {

                            // collect authors
                            var authors = [];

                            var tools = Q.Tool.byName(['Streams/related']);

                            Q.each(tools, function(index, element) {
                                Q.each(element.state.result.relations, function() {
                                    var publisherId = Q.getObject("fromPublisherId", this);
                                    if (!publisherId || (authors && authors.indexOf(publisherId) >= 0)) {
                                        return;
                                    }
                                    authors.push(publisherId);
                                });
                            });

                            // create Users/list tool
                            $(".Communities_filter_publishers_users", dialog).tool("Users/list", {
                                userIds: authors,
                                avatar: {
                                    icon: 80
                                },
                                clickable: true,
                                onLoadMore: function(avatars) {
                                    Q.each(avatars, function() {
                                        $(this.element).on(Q.Pointer.fastclick, function(event) {
                                            event.stopPropagation();
                                            event.preventDefault();

                                            var avatarTool = Q.Tool.from(this);
                                            _updatedNFTAuthors(avatarTool.state.userId);

                                            Q.Tool.remove($(".tokensociety_nft_filter_tool_nft_user .Users_avatar_tool")[0], true, true);
                                            $(".tokensociety_nft_filter_tool_nft_user").append($("<div>").tool("Users/avatar", {userId: avatarTool.state.userId, short: true }).activate());
                                            $(".tokensociety_nft_filter_tool_nft_user span.everyone").attr("data-active", false);

                                            Q.Dialogs.pop();
                                            return false;
                                        });
                                    });
                                }
                            }).activate();

                            // all authors
                            $("button.Communities_filter_publishers_all", dialog).on(Q.Pointer.fastclick, function(event) {
                                _updatedNFTAuthors('*');

                                Q.Tool.remove($(".tokensociety_nft_filter_tool_nft_user .Users_avatar_tool")[0], true, true);
                                $(".tokensociety_nft_filter_tool_nft_user span.everyone").attr("data-active", true);

                                Q.Dialogs.pop();
                                return false;
                            });
                        }
                    });
                };

                Q.Template.render('TokenSociety/NFT/filter/view', state, (err, html) => {
                    tool.element.innerHTML = html;

                    $toolElement.find(".tokensociety_nft_filter_tool_nft_category").on(Q.Pointer.fastclick, _filterByNFTCategories);
                    $toolElement.find(".tokensociety_nft_filter_tool_nft_user").on(Q.Pointer.fastclick, _filterByNFTUsers);
                });
            });
        },
    });

    Q.Template.set('TokenSociety/NFT/filter/view',
`<ul>
            <li class="tokensociety_nft_filter_tool_nft_category">{{NFT.filter.ByCategory.AllCollections}}</li>
            <li class="tokensociety_nft_filter_tool_nft_user"><span class="everyone">{{NFT.filter.ByUser.AllUsers}}</span></li>
        </ul>`,
        {text: ['TokenSociety/content']}
    );

})(window, Q, jQuery);