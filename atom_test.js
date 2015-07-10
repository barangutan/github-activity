var feed = require("./index");
var cheerio = require('cheerio');

var gullyFeed = new feed("gullyfoyle", {types: ['watch'] });
 

gullyFeed.on("data", function(data) {
    //var $ = cheerio.load(data.description);
    //var icon = $('div.title');
    //console.log(icon.html());
    console.log(data);
});
