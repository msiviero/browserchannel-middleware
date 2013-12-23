MockRequest = require('./http/MockRequest');
MockResponse = require('./http/MockResponse');
ForeverFrameTransport = require('../src/transport/ForeverFrameTransport');

describe('ForeverFrameTransport', function() {

    var assert = require("assert");

    it('ForeverFrameTransport must be a function', function() {
        assert(typeof ForeverFrameTransport === 'function');
    });

    it('ForeverFrameTransport heartbeat', function() {
        var request = new MockRequest();
        var response = new MockResponse();
        var mockObj = new ForeverFrameTransport(request, response);

        mockObj.sendHeartBeat(1);

        assert(response.content === '<script>try {parent.m(\'[[8,["noop"]]]\')} catch(e) {}</script>');
    });

    it('ForeverFrameTransport send disconnect', function() {
        var request = new MockRequest();
        var response = new MockResponse();
        var mockObj = new ForeverFrameTransport(request, response);

        mockObj.sendDisconnect();

        assert(response.content === '<script>try {parent.m(\'[[8,["stop"]]]\')} catch(e) {}</script>');
    });

    it('ForeverFrameTransport header', function() {
        var request = new MockRequest();
        var response = new MockResponse();
        var mockObj = new ForeverFrameTransport(request, response);

        mockObj.writeHeader();

        assert(response.content === '<html><body>' + mockObj.ieJunk);
        assert(response.headers['Content-Type'] === 'text/html');
    });

    it('ForeverFrameTransport backward chunks', function() {
        var request = new MockRequest();
        var response = new MockResponse();
        var mockObj = new ForeverFrameTransport(request, response);

        var arrId = 0;

        mockObj.sendBackwardMessage(++arrId, "hello");
        mockObj.sendBackwardMessage(++arrId, "hello again");

        assert(response.content === '<script>try {parent.m(\'[[1,"hello"]]\')} catch(e) {}</script><script>try {parent.m(\'[[2,"hello again"]]\')} catch(e) {}</script>');
    });

    it('ForeverFrameTransport buffering test', function(done) {

        this.timeout(2500);

        var request = new MockRequest();
        var response = new MockResponse();
        var mockObj = new ForeverFrameTransport(request, response);

        mockObj.testBuffering();

        var firstChunkExpected = '<html><body>' + mockObj.ieJunk + '<script>try{document.domain=\'host\';}catch(e){}</script><script>try {parent.m(\'11111\')} catch(e) {}</script>';

        assert(response.content === firstChunkExpected);

        setTimeout(function() {
            var secondChunkExpected = '<html><body>' + mockObj.ieJunk + '<script>try{document.domain=\'host\';}catch(e){}</script><script>try {parent.m(\'11111\')} catch(e) {}</script><script>try {parent.m(\'2\')} catch(e) {}</script><script>try  {parent.d(); }catch (e){}</script>';
            assert(response.content === secondChunkExpected);
            done();
        }.bind(this), 2000);
    });
});