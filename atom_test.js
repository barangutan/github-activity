var feed = require("./index");
var cheerio = require('cheerio');

/*
feed.fetch('gullyfoyle', {types:['fork']}, function(err, data) {
    if(err)
        console.log(err);
    
    if(data)
        console.log(data);
});
*/

feed.stream('gullyfoyle', {types:['fork']});


feed.on("data", function(data) {
    //var $ = cheerio.load(data.description);
    //var icon = $('div.title');
    //console.log(icon.html());
    console.log(data.title);
});

