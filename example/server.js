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
