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
    this.output = [];
}
util.inherits(GitHubFeed, EventEmitter);

GitHubFeed.prototype.fetch = function(callback) {
    this.config = objectAssign({callback: callback, isAsync: true}, this.config);
    var req = request('https://github.com/' + this.config.username + ".atom");
    
    this._run(req);
};

GitHubFeed.prototype.stream = function() {
    this.config = objectAssign({isAsync: false}, this.config);
    var req = request('https://github.com/' + this.config.username + ".atom");
    
    this._run(req);
}

GitHubFeed.prototype._run = function(req) {
    var self = this;
    var parser = new FeedParser();
    var opts = self.config;
    
    req.on('error', function (error) {
        self._handleError(error);
    });
    
    req.on('response', function (response) {
        var stream = this;

        if (response.statusCode !== 200) {
            return self._handleError(new Error('Bad status code'), response.statusCode);
        }
        
        stream.pipe(parser);
    });
    
    parser.on('error', function(error) {
        self._handleError(error);
    });
    
    parser.on('readable', function() {
        var stream = this, item;
        
        while (item = stream.read()) {
            self._handleItem(item);
        }
    });
    
    parser.on('end', function() {
        self._end();
    });
}

GitHubFeed.prototype._end = function() {
    var self = this, opts = this.config;
    if (opts.isAsync)
        opts.callback(null, this.output);
    else
        self.emit('end');
}

GitHubFeed.prototype._handleItem = function(item) {
    
    var self = this, opts = this.config;
    
    var type = item.description.match(/<!-- (.*?) -->/)[1];
    var icon = item.description.match(/<span class=(.*?)span>/)[0];
            
    if(opts.ignoreMega && opts.ignoreMega === true)
        icon = icon.replace('mega-', '');
            
    var local = {
        guid: item.guid.split(':').slice(1)[1],
        title: item.title,
        type: type,
        icon: icon,
        href: item.link
    };
                 
    if(opts.types && opts.types.length > 0) {
        if(opts.types.indexOf(local.type) > -1)
            self._sendItem(local);
    } else {
        self._sendItem(local);
    }
}

GitHubFeed.prototype._sendItem = function(item) {
    var self = this, opts = this.config;
    if (opts.isAsync)
        this.output.push(item);
    else
        self.emit('item', item);
}

GitHubFeed.prototype._handleError = function(error, code) {
    var self = this, opts = this.config, err;
    
    if (code && code === 404) 
    {
        error = 'Unable to find feed for \'' + opts.username + '\'';
    } 
    else 
    if (code) {
        error = 'Bad status code';
    }
    
    if(opts.isAsync)
        return opts.callback(new Error(error), null);
    else
        return self.emit('error', error);
}

module.exports = GitHubFeed;
