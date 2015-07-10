var EventEmitter = require("events").EventEmitter;
var FeedParser = require('feedparser')
var request = require('request');
var util = require("util");
var objectAssign = require('object-assign');

function GitHubFeed(username, config) {
    this.username = username;
    this.config = config;
}

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
/*
module.exports = { 
    sssstream: function(username, options) {
        _fetch(username, options);
    },
    
    sssfetch: function(username, options, cb) {
        
        if(typeof(cb) === 'undefined')
            _fetch(username, null, options);
        else
            _fetch(username, options, cb);
    }
};



function _fetch(username, options, callback) {
 
    var self = this;
    var feedparser = new FeedParser();
    var opts = options || {};
    var isAsync = false;
    var output = [];
    
    EventEmitter.call(this);
    
    if(callback && typeof(callback) == 'function') {
        isAsync = true;
    }
    
    console.log('isAsync? ' + isAsync);
 
    var req = request('https://github.com/' + username + ".atom");
    
    req.on('error', function (error) {
        handleError(error);
    });
    
    req.on('response', function (response) {
        var stream = this;

        if (response.statusCode === 404) 
        {
            var error = new Error('Unable to find feed for \'' + username + '\'');
            if(isAsync) 
                return cb(error, null) 
            else 
                return module.exports.emit('error', error);
        } 
        else 
        if (response.statusCode !== 200) {
            var error = new Error('Bad status code');
            if (isAsync) 
                return cb(error, null) 
            else 
                return module.exports.emit('error', error);
        }

        stream.pipe(feedparser);
    });
    
    feedparser.on('error', function(error) {
        handleError(error);
    });
    
    feedparser.on('readable', function() {
        var stream = this;
        var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
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
                    handleData(local)
            } else {
                handleData(local)
            }
        }
    });
    
    feedparser.on('end', function() {
        if(isAsync)
            return callback(null, output);
    });
    
    function handleData(data) {
        if(isAsync)
            output.push(data);
        else
            module.exports.emit("data", data);
    }
    
    handleError = function(error) {
        if(isAsync)
            callback(new Error(error), null);
        else
            module.exports.emit("error", error);
    }
}
*/
 
//util.inherits(GitHubFeed, EventEmitter);
 
module.exports = GitHubFeed;