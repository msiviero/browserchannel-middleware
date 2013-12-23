/*
 * Copyright 2013 msiviero <m.siviero83@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 *     
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Base handler class, meant to be extended
 *
 * @constructor
 */
BrowserChannelHandler = function() {

    /**
     * @type {string}
     */
    this.VER = '8';
};

/**
 * Return the number of current managed sessions
 *
 * @return {number}
 */
BrowserChannelHandler.prototype.getSessionCount = function() {
    return Object.keys(this.sessions).length;
};

/**
 * Iterate and calls callback through sessions
 *
 * @param {Function} cb
 */
BrowserChannelHandler.prototype.iterateSessions = function(cb) {

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
BrowserChannelHandler.prototype.backwardChannel = function(session, data) {
};

/**
 * Called when browser send a message to server to this session
 *
 * @param {Session} session
 * @param {Object} data
 */
BrowserChannelHandler.prototype.onForwardChannel = function(session, data) {
};

/**
 * Called when browser disconnects
 *
 * @param {Session} session
 */
BrowserChannelHandler.prototype.onClientDisconnect = function(session) {
};

/**
 * Called once when channel is ready
 *
 * @param {Session} session
 */
BrowserChannelHandler.prototype.onConnection = function(session) {
};

/**
 * @type BrowserChannelHandler
 */
module.exports = BrowserChannelHandler;
