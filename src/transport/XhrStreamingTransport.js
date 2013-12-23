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
var BaseTransport = require('./BaseTransport');

/**
 * A specialized transport layer, implementing the XhrStreaming technique
 *
 * @constructor
 * @extends {BaseTransport}
 */
XhrStreamingTransport = function() {
    // call parent
    XhrStreamingTransport.super_.apply(this, arguments);
};

util.inherits(XhrStreamingTransport, BaseTransport);

/**
 * Send hearbeat signal
 *
 * @param {number} arrId session's last array id
 *
 * @return {boolean}
 */
XhrStreamingTransport.prototype.sendHeartBeat = function(arrId) {

    var stream = JSON.stringify([[arrId, ['noop']]]);
    var response = stream.length + '\n' + stream;
    return this.response.write(response);
};

/**
 * Sends a response to browser's forward channel request
 *
 * @param {number} arrId
 * @return {boolean}
 */
XhrStreamingTransport.prototype.sendForwardChannelResponse = function(arrId) {
    var stream = JSON.stringify([1, arrId, 0]);
    var response = stream.length + '\n' + stream;
    return this.response.write(response);
};

/**
 * Sends disconnect signal to browser
 *
 * @return {boolean}
 */
XhrStreamingTransport.prototype.sendDisconnect = function() {
    var stream = JSON.stringify([[0, ['stop']]]);
    var response = stream.length + '\n' + stream;
    return this.response.write(response);
};

/**
 * Sends a chunked message through backward channel
 *
 * @param {number} arrId
 * @param {Object} message
 * @return {boolean}
 */
XhrStreamingTransport.prototype.sendBackwardMessage = function(arrId, message) {
    var data = [[arrId, [JSON.stringify(message)]]];
    var stream = JSON.stringify(data);
    var response = stream.length + '\n' + stream;
    return this.response.write(response);
};

/**
 * Sends session creation response
 *
 * @param {string} sessId
 * @return {boolean}
 */
XhrStreamingTransport.prototype.sendSession = function(sessId) {
    var data = [[0, ['c', sessId, null, 8]]];
    var stream = JSON.stringify(data);
    var response = stream.length + '\n' + stream;
    return this.response.write(response);
};

/**
 * Handler test buffering phase, sending a string literal '11111' and
 * after 2 seconds a '2' string
 */
XhrStreamingTransport.prototype.testBuffering = function() {
    this.writeHeader();
    this.response.write('11111');

    setTimeout(function() {
        this.response.write('2');
        this.response.end();
    }.bind(this), 2000);
};

/**
 *
 * @type XhrStreamingTransport
 */
module.exports = XhrStreamingTransport;
