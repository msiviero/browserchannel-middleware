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

util = require('util');
XhrStreamingTransport = require('./transport/XhrStreamingTransport');
ForeverFrameTransport = require('./transport/ForeverFrameTransport');

/**
 * Browserchannel server class
 *
 * @constructor
 *
 * @param {SessionManager} sessionMgr
 * @param {BrowserChannelHandler} handler
 * @param {boolean} debug
 */
BrowserChannel = function(sessionMgr, handler, debug) {
    /**
     * @type {BaseTransport}
     */
    this.transport;

    /**
     * @type {SessionMgr}
     */
    this.sessionMgr = sessionMgr;

    /**
     * @type {BrowserChannelHandler}
     */
    this.handler = handler;

    /**
     * @type {boolean}
     */
    this.debug = debug ? true : false;
};

/**
 * Protocol version allowed
 *
 * @type string
 */
BrowserChannel.PROTOCOL_VERSION = '8';

/**
 * Log a message to stdout
 *
 * @param {Object} message
 */
BrowserChannel.prototype.log = function(message) {
    if (this.debug) {
        util.log(message);
    }
};

/**
 * Returns the current memory used (useful to search for memory leaks)
 *
 * @return {string}
 */
BrowserChannel.prototype.getMemoryFootPrint = function() {

    var stats = process.memoryUsage();

    for (var k in stats) {
        stats[k] = (stats[k] / 1048576).toFixed(2);
    }

    return JSON.stringify(stats);
};

/**
 * Checks that client identifies itself as version 8
 */
BrowserChannel.prototype.checkProtocolVersion = function() {

    var ver = /** @type {string} */ this.transport.request.query.VER;

    if (ver !== BrowserChannel.PROTOCOL_VERSION) {
        this.log('Protocol version is not 8');
        this.transport.sendResponse('Protocol version 8 is required');
    }

    this.log('Protocol version is 8');
};

/**
 * Determines, based on query string sended by browser, the transport used
 *
 * @param {string} type
 * @param {Object} req
 * @param {Object} res
 */
BrowserChannel.prototype.determineTransport = function(type, req, res) {

    var logMsg = '';

    switch (type) {

        case 'xmlhttp':
            logMsg = 'Chosen transport is XhrStreaming';
            this.transport = new XhrStreamingTransport(req, res);
            break;

        case 'html':
            logMsg = 'Chosen transport is ForeverFrame';
            this.transport = new ForeverFrameTransport(req, res);
            break;

        default:
            logMsg = 'Chosen transport is XhrStreaming';
            this.transport = new XhrStreamingTransport(req, res);
            break;
    }

    this.log(logMsg);
};

/**
 * Parse a forwardChannel POST request body and gives back an an object
 * acting as an associative array
 *
 * @param {Object} body
 * @return {Object}
 */
BrowserChannel.prototype.parseForwardRequest = function(body) {

    var result = {};

    for (var k in body) {
        if (k.indexOf('req0_') === 0) {
            var idx = k.replace('req0_', '');
            result[idx] = body[k];
        }
    }
    return result;
};

/**
 * Handler called when browser programmatically send disconnect signal
 *
 * @param {number} sid
 */
BrowserChannel.prototype.disconnectSession = function(sid) {

    var session = this.sessionMgr.sessions[sid];

    if (!session) {
        return;
    }

    this.log('client has disconnected. removing session ' + session.id);
    session.state = 'closed';
    this.handler.onClientDisconnect(session);
    delete this.sessionMgr.sessions[session.id];
    this.transport.response.setHeader('Content-Type', 'image/png');
    this.transport.response.end();
};

/**
 * Handle a forward channel message (message from browser)
 *
 * @param {String} sid
 * @param {Object} params
 * @return {void}
 */
BrowserChannel.prototype.forwardChannel = function(sid, params) {
    var session = this.sessionMgr.sessions[sid];

    if (!session) {
        this.transport.sendDisconnect();
        this.log('Unknown session ' + sid + ' sending terminate signal');
        return;
    }

    this.transport.sendHeaders();
    this.handler.onForwardChannel(session, params);

    this.log('Write through ' + session.id + ' forward channel');

    this.transport.sendForwardChannelResponse(session.arrId);
    this.transport.response.end();
};

/**
 * Handle backward channel
 *
 * @param {string} sid
 * @param {number} tries
 */
BrowserChannel.prototype.backwardChannel = function(sid, tries) {

    var session = /** @type {Session} */ this.sessionMgr.sessions[sid];

    this.transport.writeHeader();

    if (!session) {
        this.transport.sendDisconnect();
        this.log('Unknown session ' + sid + ' sending terminate signal');
        return;
    }

    session.state = 'ready';
    this.log('Restored session: ' + session.id);

    // heartbeat interval, used to keep connection alive
    // sends noop every 20 seconds (client seems to close after 30sec)
    var noop = setInterval(function() {

        var result = this.transport.sendHeartBeat(++session.arrId);
        this.log('Sended heartbeat to ' + session.id);

        if (!result) {
            this.log('client is died. removing session ' + session.id);
            session.state = 'closed';
            clearInterval(noop);
            this.handler.onClientDisconnect(session);
            delete this.sessionMgr.sessions[session.id];
        }
    }.bind(this), 20000);

    session.on('backchannel', function(message) {
        if (session.state === 'closed') {
            return;
        }

        this.transport.sendBackwardMessage(++session.arrId, message);

        this.log('Write through ' + session.id + ' backward channel');
        this.log(message);
    }.bind(this));

    if (tries === '1') {
        this.handler.onConnection(session);
    }
};

/**
 * Main handler, called by middeware
 *
 * @param {Object} request
 * @param {Object} response
 * @param {Function} next
 */
BrowserChannel.prototype.handle = function(request, response, next) {

    this.log('');
    this.log('Handling new request');

    if (request.path === '/channel/test' || request.path === '/channel/bind') {
        this.determineTransport(request.query.TYPE, request, response);
        this.checkProtocolVersion();
    } else {
        next();
    }
 
    // handle init phase
    if (request.path === '/channel/test' && request.query.MODE === 'init') {
        this.log('Handling "Check connection" phase');
        this.transport.sendResponse(JSON.stringify([null, null]));
    }

    // handle proxy buffering test phase
    if (request.path === '/channel/test' && request.query.MODE !== 'init') {
        this.log('Handling "Proxy buffering test" phase');
        this.transport.testBuffering();
    }

    // handle session creation
    if (request.path === '/channel/bind' &&
            request.query.SID === undefined && request.method === 'POST') {
        this.log('Handling "Session creation" phase');

        this.transport.sendHeaders();

        var session = this.sessionMgr.createSession();

        this.log('Created session with id: ' + session.id);
        this.log('Session count is now: ' + this.sessionMgr.getSessionCount());
        this.transport.sendSession(session.id);
        this.transport.response.end();
    }

    // handle backward channel
    if (request.path === '/channel/bind' && request.query.RID === 'rpc' &&
            request.method === 'GET') {

        this.log('Establishing backward channel');
        this.backwardChannel(request.query.SID, request.query.t);
    }


    if (request.path === '/channel/bind' && request.query.RID !== 'rpc' &&
            request.method === 'GET' &&
            request.query.TYPE === 'terminate') {

        this.log('Client sent disconnection');
        this.disconnectSession(request.query.SID);
    }

    // forward channel call handler
    if (request.path === '/channel/bind' &&
            request.query.SID !== undefined && request.method === 'POST') {

        var params = this.parseForwardRequest(request.body);
        this.forwardChannel(request.query.SID, params);
    }
};

/**
 * @type BrowserChannel
 */
module.exports = BrowserChannel;
