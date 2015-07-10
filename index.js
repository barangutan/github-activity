var EventEmitter = require("events").EventEmitter;
var FeedParser = require('feedparser')
var request = require('request');
var util = require("util");
var objectAssign = require('object-assign');

function GitHubFeed(username, config) {
    
    EventEmitter.call(this);
    this.username = username;
    this.config = config;
    this.caller = null;
}
util.inherits(GitHubFeed, EventEmitter);

GitHubFeed.prototype.fetch = function(callback) {
    var output = [];
    
    var opts = this.config || {};
    var feedparser = new FeedParser();
    var req = request('https://github.com/' + this.username + ".atom");
    
    req.on('error', function (error) {
        callback(new Error(error), null);
    });
    
    req.on('response', function (response) {
        var stream = this;

        if (response.statusCode === 404) 
        {
            var error = new Error('Unable to find feed for \'' + this.username + '\'');
            return callback(new Error(error), null);
        } 
        else 
        if (response.statusCode !== 200) {
            var error = new Error('Bad status code');
            return callback(new Error(error), null);
        }

        stream.pipe(feedparser);
    });
    
    feedparser.on('error', function(error) {
        callback(new Error(error), null);
    });
    
    feedparser.on('readable', function() {
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
    
    feedparser.on('end', function() {
        callback(null, output);
    });
};

GitHubFeed.prototype.stream = function() {
    
    var self = this;
    var opts = this.config || {};
    var feedparser = new FeedParser();
    
    this.caller = {func: 'stream', parser: feedparser};
    var req = request('https://github.com/' + this.username + ".atom");
    
    req.on('error', function (error) {
        self.emit('error', new Error(error));
    });
    
    req.on('response', function (response) {
        var stream = this;

        if (response.statusCode === 404) 
        {
            var err = new Error('Unable to find feed for \'' + this.username + '\'');
            return self.emit('error', new Error(err));
        } 
        else 
        if (response.statusCode !== 200) {
            var err = new Error('Bad status code');
            return self.emit('error', new Error(err));
        }

        stream.pipe(feedparser);
    });
    
    feedparser.on('error', function(error) {
        self.emit('error', new Error(error));
    });
    
    feedparser.on('readable', function() {
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
    
    feedparser.on('end', function() {
        self.emit('end');
    });
}

module.exports = GitHubFeed;
