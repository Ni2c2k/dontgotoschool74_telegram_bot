var db = require('./db/db.js');
var http = require('http');
var dontsleep = require('./heroku/dontsleep.js')
var tgBot = require('./spasinfo_bot.js');
var esbt74Bot = require('./esbt74_bot.js');

var interval = setInterval(function(){
    console.log('interval');

    dontsleep.preventSleepHeroku()
    .then( res => {
      console.log( res );
    })
    .catch( e => {
      console.log(e);
    });

}, 10 * 60000 );

var server = http.createServer( function(request, response) {
  Subscriber.find()
  .then(function(subscribers){
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.end('Dontgotoschool bot: ' + request.url + '\n subscribers count = ' + subscribers.length );
  })
  .catch(function(error){
    console.log('error: ' + error );
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.end('Dontgotoschool bot: ' + request.url + '\n subscrbers count = ?');
  })

});

server.listen( process.env.PORT || 8000);
tgBot.startMonitorSpas74();
