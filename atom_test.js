var feed = require("./index");

// pull_request, issues, issue_comment, push,

var gully = new feed('gullyfoyle');

/*
gully.fetch(function(err, data) {
    if(err)
        console.log(err);
    
    if(data)
        console.log(data);
});
*/

var count = 0;
gully.stream();

gully.on('item', function(item) {
    console.log(item);
});

gully.on('error', function(error) {
    console.log(error);
});
