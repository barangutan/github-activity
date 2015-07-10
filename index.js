var EventEmitter = require("events").EventEmitter;
var FeedParser = require('feedparser')
var request = require('request');
var util = require("util");

function GitHubFeed(username, options) {
 
    EventEmitter.call(this);
    
    var self = this;
    var feedparser = new FeedParser();
    var options = options || {};
 
    var req = request('https://github.com/' + username + ".atom");
    
    req.on('error', function (error) {
        self.emit("error", error);
    });
    
    req.on('response', function (response) {
        var stream = this;

        if (response.statusCode != 200) 
            return self.emit('error', new Error('Bad status code'));

        stream.pipe(feedparser);
    });
    
    feedparser.on('error', function(error) {
        self.emit("error", error);
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
            
            if(options.types && options.types.length > 0) {
                if(options.types.indexOf(local.type) > -1)
                    self.emit("data", local);
            } else {
                self.emit("data", local);
            }
        }
    });
}
 
util.inherits(GitHubFeed, EventEmitter);
 
module.exports = GitHubFeed;