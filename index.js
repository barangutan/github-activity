var EventEmitter = require("events").EventEmitter;
var FeedParser = require('feedparser')
var request = require('request');
var util = require("util");
var objectAssign = require('object-assign');

function GitHubFeed(username, config) {
    
    EventEmitter.call(this);
    this.username = username;
    this.config = config;
}
util.inherits(GitHubFeed, EventEmitter);

GitHubFeed.prototype.fetch = function(callback) {
    var output = [];
    
    var opts = objectAssign(
    {
        username: this.username,
        parser: new FeedParser(),
        callback: callback,
        isAsync: true
    }, this.options || {});
    var req = request('https://github.com/' + opts.username + ".atom");
    
    this._req(req, opts);
    
    opts.parser.on('error', function(error) {
        callback(new Error(error), null);
    });
    
    opts.parser.on('readable', function() {
        var stream = this;
        var item;

        while (item = stream.read()) {
            var type = item.description.match(/<!-- (.*?) -->/)[1];
            var icon = item.description.match(/<span class=(.*?)span>/)[0];    
            
            var local = {
                title: item.title,
                type: type,
                icon: icon
            };
            
            if(opts.types && opts.types.length > 0) {
                if(opts.types.indexOf(local.type) > -1)
                    output.push(local);
            } else {
                output.push(local);
            }
        }
    });
    
    opts.parser.on('end', function() {
        callback(null, output);
    });
};

GitHubFeed.prototype.stream = function() {
    
    var self = this;
    var opts = objectAssign(
    {
        username: this.username,
        parser: new FeedParser(),
        isAsync: false
    }, this.options || {});
    
    var req = request('https://github.com/' + opts.username + ".atom");
    
    this._req(req, opts);
    
    opts.parser.on('error', function(error) {
        self.emit('error', new Error(error));
    });
    
    opts.parser.on('readable', function() {
        var stream = this;
        var item;

        while (item = stream.read()) {
            var type = item.description.match(/<!-- (.*?) -->/)[1];
            var icon = item.description.match(/<span class=(.*?)span>/)[0];    
            
            var local = {
                title: item.title,
                type: type,
                icon: icon
            };
            
            if(opts.types && opts.types.length > 0) {
                if(opts.types.indexOf(local.type) > -1)
                    self.emit('item', local);
            } else {
                self.emit('item', local);
            }
        }
    });
    
    opts.parser.on('end', function() {
        self.emit('end');
    });
}

GitHubFeed.prototype._req = function(req, opts) {
    var self = this;
    req.on('error', function (error) {
        self.emit('error', new Error(error));
    });
    
    req.on('response', function (response) {
        var stream = this;

        if (response.statusCode === 404) 
        {
            var error = new Error('Unable to find feed for \'' + opts.username + '\'');
            return (opts.isAsync) ? opts.callback(error, null) : self.emit('error', error);
        } 
        else 
        if (response.statusCode !== 200) {
            var error = new Error('Bad status code');
            return (opts.isAsync) ? opts.callback(error, null) : self.emit('error', error);
        }

        stream.pipe(opts.parser);
    });   
}

module.exports = GitHubFeed;
