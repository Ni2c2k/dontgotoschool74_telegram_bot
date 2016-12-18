var spasinfo = require("./spasinfo.js");
var TelegramBot = require('node-telegram-bot-api');
var http = require('http');

var token = '322598858:AAE3srLvFUxusepnmdgeOQhpas-Y_LvqI40';

var bot = new TelegramBot( token, { polling: true } );

var spasMessages = [];
var subsIds = [];

function notificate(){
  for( var i = 0; i < subsIds.length; ++i ){
      bot.sendMessage( subsIds[ i ], spasMessages[0] );
  }
}

function onRetrieveInterval(messages){
    console.log(messages);
    oldMsg = '';
    if( spasMessages.length > 0 ){
      oldMsg = spasMessages[ 0 ];
    }
    spasMessages = messages;

    if( spasMessages.length > 0 ){
      if( oldMsg === spasMessages[0]){
        console.log('message did not changed: ' + spasMessages[0]);
      } else {
        console.log('notificate');
        notificate();
      }
    } else {
      console.log('spasMessages.lenght = 0');
    }
};

function onError(){
    console.log("error occured");
};

function pingSelf(){
  http.get("https://dontgotoschool.herokuapp.com/", function(res) {
    res.on('data', function(chunk){

    });
    res.on('end', function() {
      console.log('ping ok');
    });
  }).on('error', function() {
    console.log('error while ping');
  });
};

var interval = setInterval(function(){
    console.log('interval');

    pingSelf();
    spasinfo.retrieveMessages( onRetrieveInterval, onError );

}, 60000 );

bot.on('message', function(msg) {
    console.log('onMessage');
    //var chatId = msg.chat.id;
    //bot.sendMessage(chatId, "Received");
});

bot.onText(/\/unsubscribe/, function(msg){
  var chatId = msg.chat.id;
  var index = subsIds.indexOf(chatId);
  if( index > -1 ) {
    subsIds.splice(index, 1);
    bot.sendMessage( chatId, "unsubscribed: OK");
    console.log('unsubscribed');
  }
});

bot.onText(/\/subscribe/, function(msg) {
    var chatId = msg.chat.id;

    if( subsIds.indexOf(chatId) === -1 ){
      subsIds.push(chatId);
      var infoMsg = '';
      if(spasMessages.length > 0 ){
        infoMsg = spasMessages[ 0 ];
      }
      bot.sendMessage( chatId, "you have been subscribed\n" + infoMsg );
      console.log('subscribed');
    } else {
      bot.sendMessage( chatId, "you're already subscribed");
      console.log('already subscribed');
    }
});

bot.onText(/\/request/, function(msg) {
    var chatId = msg.chat.id;
    var response = "";
    if( spasMessages.length > 0 ) {
        response = spasMessages[ 0 ];
        var opts = {
           //reply_to_message_id: msg.message_id,
           reply_markup: JSON.stringify({
               keyboard: [
               ['/subscribe'],
               ['/unsubscribe'],
               ['/request']]
           })
        };
        bot.sendMessage( chatId, response, opts );
    } else {
        response = "no information";
        bot.sendMessage( chatId, response );
    }
});

function onRetrieve(messages){
    console.log(messages);
    spasMessages = messages;
};

spasinfo.retrieveMessages( onRetrieve, onError );

var server = http.createServer( function(request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end('Dontgotoschool bot: ' + request.url + '\n subsIds.length = ' + subsIds.length );
});

server.listen( process.env.PORT || 8000);
