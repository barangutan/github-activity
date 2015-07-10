var EventEmitter = require("events").EventEmitter;
var FeedParser = require('feedparser')
var request = require('request');
var util = require("util");
var objectAssign = require('object-assign');

module.exports = { 
    stream: function(username, options) {
        _fetch(username, options);
    },
    
    fetch: function(username, options, cb) {
        if(typeof(cb) === 'undefined')
            _fetch(username, null, options);
        else
            _fetch(username, options, cb);
    }
};



function _fetch(username, options, callback) {
 
    var controller = new EventEmitter();
    
    var self = this;
    var feedparser = new FeedParser();
    var opts = options || {};
    var isAsync = false;
    var output = [];
    
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
                return controller.emit('error', error);
        } 
        else 
        if (response.statusCode !== 200) {
            var error = new Error('Bad status code');
            if (isAsync) 
                return cb(error, null) 
            else 
                return controller.emit('error', error);
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
            controller.emit("data", data);
    }
    
    handleError = function(error) {
        if(isAsync)
            callback(new Error(error), null);
        else
            controller.emit("error", error);
    }
}
 
util.inherits(_fetch, EventEmitter);
 
//module.exports = GitHubFeed;