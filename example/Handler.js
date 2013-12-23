browserchannel = require('browserchannel-middleware');

/**
 * Browserchannel Handler class
 *
 * @constructor
 * @extends {browserchannel.Handler}
 */
Handler = function() {
    Handler.super_.apply(this, arguments);

    /**
     * An associative array hoding sessions
     *
     * @type {Object}
     */
    this.sessions = {};
};
util.inherits(Handler, browserchannel.Handler);

/**
 * Return the number of current managed sessions
 *
 * @return {number}
 */
Handler.prototype.getSessionCount = function() {
    return Object.keys(this.sessions).length;
};

/**
 * Iterate and calls callback through sessions
 *
 * @param {Function} cb
 */
Handler.prototype.iterateSessions = function(cb) {

    for (var key in this.sessions) {
        if (this.sessions.hasOwnProperty(key)) {
            cb.call(this, this.sessions[key]);
        }
    }
};

/**
 * Writes to backward channel stream
 *
 * @param {Session} session
 * @param {Object} data
 */
Handler.prototype.backwardChannel = function(session, data) {
    session.emit('backchannel', data);
};

/**
 * Called when browser send a message to server to this session
 *
 * @param {Session} session
 * @param {Object} data
 */
Handler.prototype.onForwardChannel = function(session, data) {

    // broadcast message
    this.iterateSessions(function(session) {
        var msg = 'New message: ' + data.message + ' from ' + data.from;
        this.backwardChannel(session, msg);
    });
};

/**
 * Called when browser disconnects
 *
 * @param {Session} session
 */
Handler.prototype.onClientDisconnect = function(session) {
    var res = delete this.sessions[session.id];
};

/**
 * Called once when channel is ready
 *
 * @param {Session} session
 */
Handler.prototype.onConnection = function(session) {

    this.backwardChannel(session, 'Session opened callback! ' + session.id);
    this.sessions[session.id] = session;
};

module.exports = Handler;