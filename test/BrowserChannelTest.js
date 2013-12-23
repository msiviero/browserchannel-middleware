MockRequest = require('./http/MockRequest');
MockResponse = require('./http/MockResponse');
BrowserChannel = require('../src/BrowserChannel');

describe('BrowserChannel', function() {
    
    var assert = require("assert");

    it('BrowserChannel must be a function', function() {
        assert(typeof BrowserChannel === 'function');
    });
});