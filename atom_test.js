var feed = require("./index");

// pull_request, issues, issue_comment, push,

feed.fetch('gullyfoyle', {types: ['push']}, function(err, feed) {
    if(err)
        console.log(err);
    
    if(feed) {
        console.log('Returned %d feed items\n', feed.length);
        feed.forEach(function(item) {
            console.log('%s (%s)', item.title, item.date);    
        });
    }
});

/*
feed.stream('gullyfoyle', {dateFormat: 'MMMM Do YYYY', megaIcons: false});

feed.on('item', function(item) {
    console.log('%s (%s)', item.title, item.date);  
});

feed.on('error', function(error) {
    console.log(error);
});

feed.on('end', function() {
    console.log('Fin!');
});
*/
