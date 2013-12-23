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

crypto = require('crypto');
Session = require('./Session');

/**
 * @constructor
 */
SessionMgr = function() {

    /**
     * @type {Object} sessions
     */
    this.sessions = {};
};

/**
 * Return current managed sessions count
 *
 * @return {number}
 */
SessionMgr.prototype.getSessionCount = function() {
    return Object.keys(this.sessions).length;
};

/**
 * Creates a new managed session
 *
 * @return {Session}
 */
SessionMgr.prototype.createSession = function() {

    var session = new Session();

    var token = /** @type {string} */crypto.randomBytes(8);
    session.id = token.toString('hex');

    this.sessions[session.id] = /** @type {Session} */session;
    return session;
};

/**
 *
 * @type SessionMgr
 */
module.exports = SessionMgr;
