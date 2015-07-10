var feed = require("./index");
//var cheerio = require('cheerio');

var gully = new feed('gullyfoyle', {types: ['watch']});
/*
gully.fetch(function(err, data) {
    if(err)
        console.log(err);
    
    if(data)
        console.log(data);
});
*/

gully.stream();

gully.on('item', function(item) {
    //var $ = cheerio.load(data.description);
    //var icon = $('div.title');
    //console.log(icon.html());
    console.log(item);
});

