var feed = require("./index");
//var cheerio = require('cheerio');

var gully = new feed('gullyfoyle', {types: ['watch']});

gully.fetch(function(err, data) {
    if(err)
        console.log(err);
    
    if(data)
        console.log(data);
});

/*
gully.stream();

gully.on('item', function(item) {
    console.log(item.title);
});

gully.on('error', function(error) {
    console.log(error);
});
*/