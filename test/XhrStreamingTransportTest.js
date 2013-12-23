MockRequest = require('./http/MockRequest');
MockResponse = require('./http/MockResponse');
XhrStreamingTransport = require('../src/transport/XhrStreamingTransport');

describe('XhrStreamingTransport', function() {

    var assert = require("assert");

    it('XhrStreamingTransport must be a function', function() {
        assert(typeof XhrStreamingTransport === 'function');
    });

    it('XhrStreamingTransport heartbeat', function() {
        var request = new MockRequest();
        var response = new MockResponse();
        var mockObj = new XhrStreamingTransport(request, response);

        mockObj.sendHeartBeat(1);

        assert(response.content === '14\n[[1,["noop"]]]');
    });

    it('XhrStreamingTransport forward channel', function() {
        var request = new MockRequest();
        var response = new MockResponse();
        var mockObj = new XhrStreamingTransport(request, response);

        mockObj.sendForwardChannelResponse(2);

        assert(response.content === '7\n[1,2,0]');
    });

    it('XhrStreamingTransport disconnect', function() {
        var request = new MockRequest();
        var response = new MockResponse();
        var mockObj = new XhrStreamingTransport(request, response);

        mockObj.sendDisconnect();

        assert(response.content === '14\n[[0,["stop"]]]');
    });

    it('XhrStreamingTransport backward chunks', function() {
        var request = new MockRequest();
        var response = new MockResponse();
        var mockObj = new XhrStreamingTransport(request, response);

        var arrId = 0;

        mockObj.sendBackwardMessage(++arrId, "hello");
        mockObj.sendBackwardMessage(++arrId, "hello again");

        assert(response.content === '19\n[[1,["\\"hello\\""]]]25\n[[2,["\\"hello again\\""]]]');
    });

    it('XhrStreamingTransport session', function() {
        var request = new MockRequest();
        var response = new MockResponse();
        var mockObj = new XhrStreamingTransport(request, response);

        mockObj.sendSession("abc");

        assert(response.content === '24\n[[0,["c","abc",null,8]]]');
    });

    it('XhrStreamingTransport buffering test', function(done) {

        this.timeout(2500);

        var request = new MockRequest();
        var response = new MockResponse();
        var mockObj = new XhrStreamingTransport(request, response);

        mockObj.testBuffering();

        assert(response.content === '11111');

        setTimeout(function() {
            assert(response.content === '111112');
            done();
        }.bind(this), 2000);
    });
});