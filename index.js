var EventEmitter = require("events").EventEmitter;
var FeedParser = require('feedparser')
var request = require('request');
var util = require("util");
var objectAssign = require('object-assign');
var moment = require('moment');

function GitHubActivity() {
    EventEmitter.call(this);
    this.config = {
        parser: new FeedParser()
    };
    this.output = [];
}
util.inherits(GitHubActivity, EventEmitter);

GitHubActivity.prototype.fetch = function(username, config, cb) {
    if(typeof username !== 'string')
        throw new Error('Unspecified username');
    
    var callback = (typeof cb === 'undefined') ? config : cb;
    this.config = objectAssign({username: username, callback: callback, isAsync: true}, config);
    
    var req = request('https://github.com/' + username + ".atom");
    this._run(req);
};

GitHubActivity.prototype.stream = function(username, config) {
    if(typeof username !== 'string')
        throw new Error('Unspecified username');
    
    this.config = objectAssign({username: username, isAsync: false}, config);
    this.removeAllListeners('error');
    
    var req = request('https://github.com/' + username + ".atom");
    this._run(req);
}

GitHubActivity.prototype._run = function(req) {
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

GitHubActivity.prototype._end = function() {
    var self = this, opts = this.config;
    if (opts.isAsync) {
        opts.callback(null, this.output);
    } else {
        self.emit('end', this.output.length);
    }
    this.output = [];
}

GitHubActivity.prototype._handleItem = function(item) {
    
    var self = this, opts = this.config;
    
    var type = item.description.match(/<!-- (.*?) -->/)[1];
    var icon = item.description.match(/<span class=(.*?)span>/)[0];
    var date = moment(item.date).fromNow();
    
    if(opts.megaIcons === false)
        icon = icon.replace('mega-', '');
    
    if(opts.dateFormat) 
        date = moment(item.date).format(opts.dateFormat);
            
    var local = {
        guid: item.guid.split(':').slice(1)[1],
        action: item.title,
        event: type,
        icon: icon,
        href: item.link,
        date: date
    };
                 
    if(opts.events && opts.events.length > 0) {
        if(opts.events.indexOf(local.event) > -1)
            self._sendItem(local);
    } else {
        self._sendItem(local);
        self.removeListener('error', function(error) {
            self._handleError(error);
        });
    }
}

GitHubActivity.prototype._sendItem = function(item) {
    var self = this, opts = this.config;
    this.output.push(item);
    if (!opts.isAsync)
        self.emit('item', item);
}

GitHubActivity.prototype._handleError = function(error, code) {
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

module.exports = new GitHubActivity();
