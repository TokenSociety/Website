(function (window, Q, $, undefined) {

    /**
     * @module TokenSociety
     */

    /**
     * YUIDoc description goes here
     * @class TokenSociety featured
     * @constructor
     * @param {Object} [options] Override various options for this tool
     *  @param {String} [options.publisherId] user id of the publisher of the stream
     *  @param {String} [options.streamName] the stream's name
     */

    Q.Tool.define("TokenSociety/featured", function (options) {
            var tool = this;
            var state = tool.state;

            // if (!state.publisherId || !state.streamName) {
            //     throw new Q.Exception(tool.id + ": publisherId or streamName is required");
            // }

            var pipe = Q.pipe(['stylesheet', 'text'], function (params, subjects) {
                tool.refresh();
            });

            Q.addStylesheet("css/tools/featured.css", pipe.fill('stylesheet'), { slotName: 'TokenSociety' });
            Q.Text.get('TokenSociety/content', function(err, text){
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
            refresh: function () {
                var tool = this;
                var state = tool.state;
                Q.Template.render('TokenSociety/featured/view', state, (err, html) => {
                    tool.element.innerHTML = html;
                });
            }

        });

    Q.Template.set('TokenSociety/featured/view',
        `<div class="tokensociety_featured_tool_header-block">
            <div class="tokensociety_featured_tool_header-second">

                <div class="tokensociety_featured_tool_col-eight">
                    <div class="tokensociety_featured_bnr">
                        <img src="designs/featured.png" width="734" height="490" alt="bnr">
                    </div>

                </div>
                <div class="col-four">
                    <h1 class="tokensociety_featured_tool_header-title">{{headerTitle}}</h1>
                    <ul class="tokensociety_featured_tool_online-c">
                        <li><img src="designs/cl1.png" width="60" height="61" alt="1"></li>
                        <li><img src="designs/cl2.png" width="60" height="61" alt="1"></li>
                    </ul>

                    <ul class="tokensociety_featured_tool_bid-info">
                        <li><span>{{featured.CurrentBid}}</span>
                            <p>{{amount}} {{currency}}</p>
                        </li>
                        <li><span>{{featured.EndingIn}}</span>
                            <p><span class="tokensociety_featured_tool_hour-t">12</span> <span class="tokensociety_featured_tool_m-t">18</span> <span class="tokensociety_featured_tool_s-t">24</span></p>
                        </li>
                    </ul>

                    <ul class="tokensociety_featured_tool_bid">
                        <li><a href="#" class="tokensociety_featured_tool_bid_place">{{featured.PlaceBid}}</a></li>
                        <li><a href="#" class="tokensociety_featured_tool_bid_atwork">{{featured.ViewArtwork}}</a></li>
                    </ul>
                </div>
            </div>
        </div>`
        , {text: ['TokenSociety/content']});

})(window, Q, jQuery);