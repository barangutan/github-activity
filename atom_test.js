var feed = require("./index");

// pull_request, issues, issue_comment, push,

feed.fetch('gullyfoyle', {types: ['push'], dateFormat: 'dddd, Do of MMMM YYYY'}, function(err, feed) {
    if(err)
        console.log(err);
    
    if(feed) {
        console.log('Returned %d feed items\n', feed.length);
        feed.forEach(function(item) {
            console.log('%s on %s', item.action, item.date);
            // gullyfoyle opened pull request Marak/faker.js#236 on Thursday, 9th of July 2015
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
