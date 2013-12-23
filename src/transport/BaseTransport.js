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
 * Transport layer used to communicate with the browser
 *
 * @constructor
 *
 * @param {Object} request Express.js Request object
 * @param {Object} response Express.js Response object
 */
BaseTransport = function(request, response) {

    /**
     * Express.js Request object
     *
     * @type {Object}
     */
    this.request = request;

    /**
     * Express.js Response stream object
     *
     * @type {Object}
     */
    this.response = response;


    /**
     * The array of headers given by the response to client
     *
     * @type {Object}
     */
    this.headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': 'Fri, 01 Jan 1990 00:00:00 GMT',
        'X-Content-Type-Options': 'nosniff'
    };
};

/**
 * Adds configured headers to the response
 *
 * @return {undefined}
 */
BaseTransport.prototype.sendHeaders = function() {
    for (var k in this.headers) {
        this.response.header(k, this.headers[k]);
    }
};

/**
 * This methods is meant to be overriden by subclasses, specially
 * by ForeverFrame transport
 */
BaseTransport.prototype.writeHeader = function() {
    this.sendHeaders();
};

/**
 * Sends a raw response with defined headers and closes connection
 *
 * @param {String} content
 * @return {void}
 */
BaseTransport.prototype.sendResponse = function(content) {
    this.sendHeaders();
    this.response.end(content);
};

/**
 *
 * @type BaseTransport
 */
module.exports = BaseTransport;
