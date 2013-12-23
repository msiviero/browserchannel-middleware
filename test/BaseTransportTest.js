MockRequest = require('./http/MockRequest');
MockResponse = require('./http/MockResponse');
BaseTransport = require('../src/transport/BaseTransport');

describe('BaseTransport', function() {

    var assert = require("assert");

    it('BaseTransport must be a function', function() {
        assert(typeof BaseTransport === 'function');
    });

    it('BaseTransport sendHeaders', function() {
        var request = new MockRequest();
        var response = new MockResponse();
        var mockObj = new BaseTransport(request, response);

        mockObj.sendHeaders();

        assert(response.headers['Access-Control-Allow-Origin'] === '*');
        assert(response.headers['X-Content-Type-Options'] === 'nosniff');
    });

    it('BaseTransport sendResponse', function() {
        var request = new MockRequest();
        var response = new MockResponse();
        var mockObj = new BaseTransport(request, response);

        mockObj.sendResponse("ciao");

        assert(response.headers['Access-Control-Allow-Origin'] === '*');
        assert(response.headers['X-Content-Type-Options'] === 'nosniff');
        assert(response.content === "ciao");
    });
});