var feed = require("./index");

// pull_request, issues, issue_comment, push,

var gully = new feed('gullyfoyle');

   /*
gully.fetch(function(err, feed) {
    if(err)
        console.log(err);
    
    if(feed) {
        console.log('Returned %d feed items\n', feed.length);
        feed.forEach(function(item) {
            console.log('%s (%s)', item.title, item.date);    
        });
    }
});
*/

gully.stream();

gully.on('item', function(item) {
    console.log(item);
});

gully.on('error', function(error) {
    console.log(error);
});

gully.on('end', function(error) {
    console.log(error);
});

