#node-channel

**Browserchannel** is a protocol developed by *google* in order to create a bidirectional, low latency channel of communication between browser and server over http.

The protocol provides two virtual channel, **backward** and **forward**. 

The client part of the protocol is implemented primarly in google's opensource **[closure library](http://docs.closure-library.googlecode.com/git/closure_goog_net_browserchannel.js.source.html)**.

As the server side implementation used by google is not yet [opensourced](http://books.google.com/books?id=p7uyWPcVGZsC&pg=PA179), **browserchannel-middleware** is a free implementation written as a express.js middleware.

Please note this must be considered as a **less-than-beta** version. Maybe it can be used in the real world and maybe will bring memory leaks, every kind of bug or *velociraptor attacks*.
This is the beauty of open source..

The tests are written with mocha testing tool. If you are interested on improve this library or find a bug please let me know. 

###Table of compatibility
| Browser        | Mode          |
| -------------- |:-------------:|
| IE 10          | xhrstreaming  |
| IE < 10        | forever frame |
| IE =< 6        | not tested    |
| Chrome         | xhrstreaming  |
| Safari         | xhrstreaming  |
| Firefox        | xhrstreaming  |
| Chrome android | xhrstreaming  |
| Safari IOS     | xhrstreaming  |

Thanks to *ahochhaus* for documenting the *[protocol](https://code.google.com/p/libevent-browserchannel-server/wiki/BrowserChannelProtocol)* and to *josephg* for his coffescript implementation, that gave me a good point to start.

##Example usage

(please note that the "example" directory contains a full broadcast chat example with browser and server code)

##### Request handler (Handler.js)
```javascript
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
```

##### Server (server.js)

```javascript
browserchannel = require('browserchannel-middleware');
util = require('util');
express = require('express');
Handler = require('./Handler.js');

// Server bootstrap
app = express();

// register middlewares
app.use(express.json());
app.use(express.urlencoded());

// serve static files
app.use("/", express.static(__dirname + "/static"));

// browserchannel options
browserchannel_opts = {
    debug: false, // this will print A LOT of informations of what is happening
    handler: new Handler() // register handler
};

// register middleware
app.use(browserchannel.server(browserchannel_opts));

// register a route, just to see it is handled outside browserchannel
app.get('/hello', function(req, res) {
    var body = 'Hello World';
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Length', body.length);
    res.end(body);
});

// start server
port = 4444;

console.log('Express.js server running on port ' + port);
app.listen(port);
```
