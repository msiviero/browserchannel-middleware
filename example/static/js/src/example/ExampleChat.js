/**
 * @fileoverview Example chat application developed with browserchannel
 * @author m.siviero83@gmail.com (Marco Siviero)
 */
goog.provide('example.ChannelHandler');
goog.provide('example.ExampleChat');

goog.require('goog.Uri');
goog.require('goog.dom');
goog.require('goog.style');
goog.require('goog.dom.classlist');
goog.require('goog.debug.Console');
goog.require('goog.debug.ErrorHandler');
goog.require('goog.net.BrowserChannel');
goog.require('goog.net.BrowserChannel.Handler');

/**
 * Channel handler implementation
 *
 * @constructor
 * @extends {goog.net.BrowserChannel.Handler}
 */
example.ChannelHandler = function() {
};
goog.inherits(example.ChannelHandler, goog.net.BrowserChannel.Handler);

/** @inheritDoc */
example.ChannelHandler.prototype.channelHandleArray = function(channel, data) {
    chat.log('Backward channel : ' + data);
};

/** @inheritDoc */
example.ChannelHandler.prototype.channelOpened = function(channel) {

    goog.dom.classlist.removeAll(chat.statusPanel, ['ready', 'error', 'disconnected']);
    goog.dom.classlist.add(chat.statusPanel, 'ready');

    chat.statusPanel.innerHTML = 'Channel opened, SID: ' + channel.getSessionId();

    goog.style.showElement(chat.connectBtn, false);
    goog.style.showElement(chat.disconnectBtn, true);
    goog.style.showElement(chat.input, true);
    goog.style.showElement(chat.sendBtn, true);
};

/** @inheritDoc */
example.ChannelHandler.prototype.channelClosed = function(
        channel, pendingMaps, undeliveredMaps) {

    chat.log('Channel comunication closed');
};

/** @inheritDoc */
example.ChannelHandler.prototype.badMapError = function(channel, map) {
};


/** @inheritDoc */
example.ChannelHandler.prototype.channelSuccess = function(
        channel, deliveredMaps) {

    var queuedMap = deliveredMaps[0];

    if (queuedMap) {
        var message = queuedMap.map.get('message');
        chat.log('Message "' + message + '" delivered');
    }
};

/** @inheritDoc */
example.ChannelHandler.prototype.channelError = function(channel, error) {

    switch (error) {
        case 7:
            goog.dom.classlist.removeAll(chat.statusPanel, ['ready', 'error', 'disconnected']);
            goog.dom.classlist.add(chat.statusPanel, 'error');
            chat.statusPanel.innerHTML = 'Server went away';
            break;
        case 2:
            goog.dom.classlist.removeAll(chat.statusPanel, ['ready', 'error', 'disconnected']);
            goog.dom.classlist.add(chat.statusPanel, 'error');
            chat.statusPanel.innerHTML = 'Server is unreachable';
            break;
        default:
            chat.log('Network error: ' + error);
            break;
    }
};



/**
 * Example browserchannel application
 *
 * @constructor
 */
example.ExampleChat = function() {

    /** @type {example.ChannelHandler} */
    this.channelHandler = new example.ChannelHandler();

    /** @type {goog.net.BrowserChannel} */
    this.channel = new goog.net.BrowserChannel('8');

    /** @type {Element} */
    this.statusPanel = goog.dom.getElement('status');
    /** @type {Element} */
    this.connectBtn = goog.dom.getElement('connect-btn');
    /** @type {Element} */
    this.disconnectBtn = goog.dom.getElement('disconnect-btn');
    /** @type {Element} */
    this.sendBtn = goog.dom.getElement('send-btn');
    /** @type {Element} */
    this.input = goog.dom.getElement('input');
    /** @type {Element} */
    this.logPanel = goog.dom.getElement('log');
};

/**
 * Return the server path (useful when the script is requested cross domain)
 *
 * @return {string}
 */
example.ExampleChat.prototype.getServerDomain = function() {

    /** @type {goog.Uri} */
    var uri = new goog.Uri(window.location);
    /** @type {string} */
    var protocol = uri.getScheme();
    /** @type {string} */
    var domain = uri.getDomain();

    return protocol + '://' + domain;
};

example.ExampleChat.prototype.log = function(message) {

    /** @type {Date} */
    var date = new Date();
    /** @type {number} */
    var s = date.getSeconds();
    /** @type {number} */
    var m = date.getMinutes();
    /** @type {number} */
    var h = date.getHours();

    /** @type {string} */
    var text = h + ':' + m + ':' + s + ' ' + message;

    /** @type {Element} */
    var msg = goog.dom.createDom('div', {}, text);

    goog.dom.classlist.add(msg, 'msg');
    goog.dom.appendChild(this.logPanel, msg);
};


/**
 * Runs the chat application
 *
 * @return {void}
 */
example.ExampleChat.prototype.run = function() {

    /** @type {goog.net.ChannelDebug} */
    var channelDebug = new goog.net.ChannelDebug();

    // attach console logger
    var debugConsole = new goog.debug.Console();
    debugConsole.setCapturing(true);

    // init browserchannel
    this.channel.setHandler(this.channelHandler);
    this.channel.setChannelDebug(channelDebug);

    // listen to connect click event
    goog.events.listen(
            this.connectBtn, goog.events.EventType.CLICK, function(e) {

        /** @type {number} */
        var state = this.channel.getState();
        if (state === goog.net.BrowserChannel.State.INIT) {
            this.channel.connect(this.getServerDomain() + ':4444/channel/test',
                    this.getServerDomain() + ':4444/channel/bind');
        }
    }, false, this);

    // listen to send button
    goog.events.listen(
            this.sendBtn, goog.events.EventType.CLICK, function(e) {

        e.preventDefault();

        /** @type {string} */
        var sid = this.channel.getSessionId();
        /** @type {string} */
        var val = this.input.value;

        /** @type {goog.structs.Map} */
        var message = new goog.structs.Map();

        message.set('from', sid);
        message.set('message', val);

        /** @type {number} */
        var state = this.channel.getState();

        if (state === goog.net.BrowserChannel.State.OPENED && val.length > 0) {
            this.channel.sendMap(message);
            this.input.value = '';
        }
    }, false, this);

    // listen to Enter keypress
    goog.events.listen(
            this.input, goog.events.EventType.KEYDOWN, function(e) {

        /** @type {number} */
        var state = this.channel.getState();
        /** @type {string} */
        var val = this.input.value;

        if (e.keyCode === 13 &&
                state === goog.net.BrowserChannel.State.OPENED &&
                val.length > 0) {

            /** @type {string} */
            var sid = this.channel.getSessionId();
            /** @type {goog.structs.Map} */
            var message = new goog.structs.Map();

            message.set('from', sid);
            message.set('message', val);

            this.channel.sendMap(message);
            this.input.value = '';
        }
    }, false, this);


    // listen to disconnect button
    goog.events.listen(
            this.disconnectBtn, goog.events.EventType.CLICK, function(e) {
        e.preventDefault();

        /** @type {number} */
        var state = this.channel.getState();

        if (state === 3) {
            this.channel.disconnect();
            
            goog.dom.classlist.removeAll(this.statusPanel, ['ready', 'error', 'disconnected']);
            goog.dom.classlist.add(this.statusPanel, 'disconnected');
            this.statusPanel.innerHTML = 'Session terminated';
            goog.style.showElement(this.connectBtn, false);
            goog.style.showElement(this.disconnectBtn, false);
            goog.style.showElement(this.input, false);
            goog.style.showElement(this.sendBtn, false);
        }
    }, false, this);

};

/** @type {example.ExampleChat} */
var chat = new example.ExampleChat();
chat.run();
