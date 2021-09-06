(function (window, Q, undefined) {

/**
 * @module TokenSociety
 */
	
/**
 * YUIDoc description goes here
 * @class TokenSociety cool
 * @constructor
 * @param {Object} [options] Override various options for this stream
 *  @param {Q.Event} [options.onMove] Event that fires after a move
 */

Q.Streams.define("TokenSociety/cool", function () { // stream constructor
	this.onMove = new Q.Event(); // an event that the stream might trigger
}, {
	someMethod: function () {
		// a method of the stream
	}
});

// this is how you set an event handler to be triggered whenever
// any "TokenSociety/move" message is posted to any "TokenSociety/cool" stream
Q.Streams.onMessage("TokenSociety/cool", "TokenSociety/move").set(function (err, message) {
	// trigger our event
	this.onMove.handle(JSON.parse(message.instructions));
}, "TokenSociety");

})(window, Q);