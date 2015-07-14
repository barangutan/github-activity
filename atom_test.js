var activity = require("./index");

// pull_request, issues, issue_comment, push,
/*
activity.fetch('gullyfoyle', {types: ['push'], dateFormat: 'dddd, Do of MMMM YYYY'}, function(err, feed) {
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
*/
activity.stream('gullyfoyle', {
    events: ['pull_request'],
    megaIcons: false,
    dateFormat: 'dddd, Do of MMMM YYYY'
});

activity.on('item', function(item) {
    console.log('%s on %s', item.event, item.action, item.date);
    // gullyfoyle opened pull request Marak/faker.js#236 on Thursday, 9th of July 2015
    console.log('Icon: %s', item.icon);
    // Icon: <span class="octicon octicon-git-pull-request"></span>
});