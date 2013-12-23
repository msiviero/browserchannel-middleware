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
BaseTransport = require('./BaseTransport');

/**
 * A specialized transport layer, implementing the forever frame technique
 *
 * @constructor
 * @extends {BaseTransport}
 */
ForeverFrameTransport = function() {
    // call parent
    ForeverFrameTransport.super_.apply(this, arguments);

    /**
     * IE < 10 Junk, used to avoid full page buffering on forever frames
     *
     * @type {String}
     */
    this.ieJunk = '7cca69475363026330a0d99468e88d23ce95e222591126443015f5f462d9a177186c8701fb45a6ffee0daf1a178fc0f58cd309308fba7e6f011ac38c9cdd4580760f1d4560a84d5ca0355ecbbed2ab715a3350fe0c479050640bd0e77acec90c58c4d3dd0f5cf8d4510e68c8b12e087bd88cad349aafd2ab16b07b0b1b8276091217a44a9fe92fedacffff48092ee693af';

    /**
     * Override default headers
     */
    this.headers['Content-Type'] = 'text/html';
};

util.inherits(ForeverFrameTransport, BaseTransport);


/**
 * Ovveride default behaviour. This is necessary to send html open tags
 *
 * @return {undefined}
 */
ForeverFrameTransport.prototype.writeHeader = function() {

    ForeverFrameTransport.super_.prototype.writeHeader.apply(this, arguments);
    this.response.write('<html><body>' + this.ieJunk);
};

/**
 * Write a chunk message from server to browser
 *
 * @param {number} arrId
 * @param {Object} message
 * @return {boolean}
 */
ForeverFrameTransport.prototype.sendBackwardMessage = function(arrId, message) {
    var response = '<script>try {parent.m(\'[[' + arrId + ',' + JSON.stringify(message) + ']]\')} catch(e) {}</script>';
    return this.response.write(response);
};

/**
 * Send disconenct signal to client
 *
 * @return {boolean}
 */
ForeverFrameTransport.prototype.sendDisconnect = function() {
    return this.response.write("<script>try {parent.m(\'[[8,[\42stop\42]]]\')} catch(e) {}</script>");
};

/**
 * Send hearbeat signal
 *
 * @return {boolean}
 */
ForeverFrameTransport.prototype.sendHeartBeat = function() {
    return this.response.write("<script>try {parent.m(\'[[8,[\42noop\42]]]\')} catch(e) {}</script>");
};


/**
 * Handler test buffering phase, sending a string literal '11111' and
 * after 2 seconds a '2' string
 */
ForeverFrameTransport.prototype.testBuffering = function() {
    this.writeHeader();
    this.response.write("<script>try{document.domain='host';}catch(e){}</script><script>try {parent.m('11111')} catch(e) {}</script>");

    setTimeout(function() {
        this.response.write("<script>try {parent.m('2')} catch(e) {}</script>");
        this.response.end('<script>try  {parent.d(); }catch (e){}</script>');
    }.bind(this), 2000);
};

/**
 *
 * @type ForeverFrameTransport
 */
module.exports = ForeverFrameTransport;
