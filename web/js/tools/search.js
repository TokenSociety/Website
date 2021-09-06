(function (window, Q, $, undefined) {

    /**
     * @module TokenSociety
     */

    /**
     * YUIDoc description goes here
     * @class TokenSociety search
     * @constructor
     * @param {Object} [options] Override various options for this tool
     *  @param {String} [options.publisherId] user id of the publisher of the stream
     *  @param {String} [options.streamName] the stream's name
     */

    Q.Tool.define("TokenSociety/search", function (options) {
            var tool = this;
            var state = tool.state;

            var pipe = Q.pipe(['stylesheet', 'text'], function (params, subjects) {
                tool.refresh();
            });

            Q.addStylesheet("css/tools/search.css", pipe.fill('stylesheet'), { slotName: 'TokenSociety' });
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
                Q.Template.render('TokenSociety/search/view', state, (err, html) => {
                    tool.element.innerHTML = html;
                });
            }

        });

    Q.Template.set('TokenSociety/search/view',
        '<i className="tokensociety-icon-search icon-2x"></i>'+
        '<div className="TokenSociety_search">'+
        	'<input placeholder="{{dashboard.Search}}">'+
        '</div>'
    , {text: ['TokenSociety/content']});

})(window, Q, jQuery);