var activity = require("./index");

activity.stream('barangutan');


activity.on('item', function(item) {
    console.log('%s on %s', item.action, item.date);
    // gullyfoyle opened pull request Marak/faker.js#236 on Thursday, 9th of July 2015
    console.log('Icon: %s\n', item.icon);
    // Icon: <span class="octicon octicon-git-pull-request"></span>
});

activity.on('error', function(error) {
    console.log('Error >> %s', error);
});

activity.on('end', function(count) {
    console.log('%d items in total', count);
});