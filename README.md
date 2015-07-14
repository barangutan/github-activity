# github-activity

Retrieves a users GitHub activity (from their Atom feed) and parses it into some useful json. GitHub has capped the feed to only bring back the last 30 events.

## Installation ##

Use NPM to install:

    $ npm install --save github-activity
    $ npm test
    
## Usage ##

A simple example using the asynchronous `fetch()` method:

```javascript
var activity = require('github-activity');

activity.fetch('gullyfoyle', function(err, feed) {
    if(err) console.log(err);
    
    if(feed) {
        console.log('Returned %d feed items\n', feed.length);
        // Returned 30 feed items
        
        feed.forEach(function(item) {
            console.log('> %s (%s)', item.title, item.date);
            // > gullyfoyle starred chalk/chalk (15 hours ago)
        });
    }
});
```

Another example, this time using `stream()` method which emits custom events:

```javascript
var activity = require('github-activity');

activity.stream('gullyfoyle');

gully.on('item', function(item) {
    console.log('> %s (%s)', item.title, item.date);
    // > gullyfoyle starred chalk/chalk (15 hours ago)
});

gully.on('error', function(err) {
    console.log(error);
});

gully.on('end', function() {
    //console.log('Fin!');
});
```

### Config ###

Here are a few config options you can pass into the `fetch()` and `stream()` methods as a second argument:

```javascript
{
    types: ['issues', 'pull_request', 'push', 'issue_comments', 'watch'],
    megaIcons: true|false,
    dateFormat: 'MMMM Do YYYY'
}
```

* `types` - an array of valid 'event' types you want returned. 
