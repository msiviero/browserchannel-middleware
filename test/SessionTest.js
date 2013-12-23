describe('Session', function() {

    var assert = require("assert");
    var Session = require("../src/session/Session");

    var mockObj = new Session();

    it('Session must be a function', function() {
        assert(typeof Session === "function");
    });

    it('Session init', function() {
        assert(mockObj.arrId === 0);
        assert(typeof mockObj.arrId === 'number');
        assert(mockObj.state === 'inited');
        assert(typeof mockObj.state === 'string');
    });
});