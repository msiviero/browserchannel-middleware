describe('SessionMgr', function() {

    var assert = require("assert");
    var SessionMgr = require("../src/session/SessionMgr");

    var mockObj = new SessionMgr();

    it('SessionMgr must be a function', function() {
        assert(typeof SessionMgr === "function");
    });

    it('SessionMgr init', function() {
        assert(mockObj.sessions.toString() === '[object Object]');
        assert(typeof mockObj.sessions === 'object');
    });
    
    it('SessionMgr manage session',function(){
        
        var mockSession = mockObj.createSession();
        var sessId = mockSession.id;
        assert(mockObj.getSessionCount() === 1);
        
        mockObj.createSession();
        assert(mockObj.getSessionCount() === 2);
        
        delete mockObj.sessions[sessId];
        assert(mockObj.getSessionCount() === 1);
    });
});