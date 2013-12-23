MockResponse = function() {
    this.headers = {};
    this.content = "";
};

MockResponse.prototype.header = function(k, v) {
    this.headers[k] = v;
};

MockResponse.prototype.end = function(text) {
    if (text) {
        this.content += text;
    }
};

MockResponse.prototype.write = function(text) {
    if (text) {
        this.content += text;
    }
};

module.exports = MockResponse;