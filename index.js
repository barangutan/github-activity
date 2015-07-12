var EventEmitter = require("events").EventEmitter;
var FeedParser = require('feedparser')
var request = require('request');
var util = require("util");
var objectAssign = require('object-assign');

function GitHubFeed(username, config) {
    
    EventEmitter.call(this);
    this.config = objectAssign(
    {
        username: username,
        parser: new FeedParser()
    }, config || {});
    this.parser = new FeedParser();
}
util.inherits(GitHubFeed, EventEmitter);

GitHubFeed.prototype.fetch = function(callback) {
    var output = [];
    
    var opts = objectAssign({callback: callback, isAsync: true}, this.config);
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
                guid: item.guid,
                title: item.title,
                type: type,
                icon: icon,
                link: item.link
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
    var opts = objectAssign({isAsync: false}, this.config);
    
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
            
            if(opts.ignoreMega)
                icon = icon.replace('mega-', '');
            
            var local = {
                guid: item.guid.split(':').slice(1)[1],
                title: item.title,
                type: type,
                icon: icon,
                link: item.link
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
