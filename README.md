# github-activity

Retrieves a users GitHub activity (from their Atom feed) and parses it into a useful js object/json. GitHub has capped the feed to return the most recent 30 events.

## Installation ##

Use [npm](https://www.npmjs.com/) to install:

    $ npm install --save github-activity
    $ npm test
    
## Usage ##

A simple example using the asynchronous `fetch(username)` method:

```javascript
var activity = require('github-activity');

activity.fetch('barangutan', function(err, feed) {
    if(err) console.log(err);
    
    if(feed) {
        console.log('Returned %d feed items\n', feed.length);
        // Returned 30 feed items
        
        feed.forEach(function(item) {
            console.log('%s (%s)', item.action, item.date);
            // barangutan starred chalk/chalk (15 hours ago)
        });
    }
});
```

Another example, this time using `stream(username)` method which emits custom events:

```javascript
var activity = require('github-activity');

activity.stream('barangutan');

activity.on('item', function(item) {
    console.log('%s (%s)', item.action, item.date);
    // barangutan starred chalk/chalk (15 hours ago)
});

activity.on('error', function(err) {
    console.log(error);
});

activity.on('end', function(count) {
    console.log('\nReturned %d feed items', count);
    // Returned 30 feed items
});
```

### Results ###

`fetch()` returns an array of feed objects ('items') while `stream()` will obviously return one item at a time. The properties of said item should be self-explanatory.

```javascript
{
    "guid": "PushEvent/2972967863",
    "action": "barangutan pushed to master at barangutan/github-activity",
    "event": "push",
    "icon": "<span class='mega-octicon octicon-git-commit'></span>",
    "href": "https://github.com/barangutan/github-activity/compare/e178f00e59...8bd8b9b6ea",
    "date": "2 hours ago"
}
```

## Config ##

There are a handful of config options you can pass into the `fetch(username, config)` and `stream(username, config)` methods as a second argument:

```javascript
{
    events: ['issues', 'pull_request', 'push', 'issue_comments', 'watch'],
    megaIcons: true|false,
    dateFormat: 'MMMM Do YYYY'
}
```

* `events: []` - an array of valid 'event' types you want returned. Valid types are listed in the example above. Please note that a watch event is triggered when you Star a repo, and not when you 'Watch' it. GitHub doesn't differenciate between the two for its activity feed.
* `megaIcons: bool` - by default, GitHub adds the `mega-octicon` class to icons for events such as issue comments, pushes and pull requests in order to highlight their importance (this class makes the icon 32px instead of the standard 16px). If you would rather return a uniform size for _all_ your items, set this `megaIcons` flag to false.
* `dateFormat: string` - the default date returned is using the moment().fromNow() method (2 hours ago, yesterday etc). You can pass a date format string here to override.

**Example:**

So we're only interested in pull requests, disabling mega-icons and formatting the date to 'Day, nth of month year':

```javascript
var activity = require('github-activity');

activity.stream('barangutan', {
    events: ['pull_request'],
    megaIcons: false,
    dateFormat: 'dddd, Do of MMMM YYYY'
});

activity.on('item', function(item) {
    console.log('%s on %s', item.action, item.date);
    // barangutan opened pull request Marak/faker.js#236 on Thursday, 9th of July 2015
    console.log('Icon: %s', item.icon);
    // Icon: <span class="octicon octicon-git-pull-request"></span>
});
```
