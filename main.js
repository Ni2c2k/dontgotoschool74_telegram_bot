var spasinfo = require("./spasinfo.js");
var mongoose = require('mongoose');
var Promise = require('bluebird');
var TelegramBot = require('node-telegram-bot-api');
var http = require('http');

var token = '322598858:AAE3srLvFUxusepnmdgeOQhpas-Y_LvqI40';

var bot = new TelegramBot( token, { polling: true } );
mongoose.Promise = Promise;

var mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
mongoose.connect( mongodbUri, function( err, res) {
  if(err){
    console.log('error while connecting to mongodb: ' + err);
  } else{
    console.log('connected to mongodb');
  }
});

var db = mongoose.connection;

var subscriberSchema = new mongoose.Schema({
  userId: String,
  chatId: Number,
  isSaturday: Boolean,
  onlyChanges: Boolean
});

var Subscriber = mongoose.model('Subscriber', subscriberSchema);

db.on('error', function(err) {
  console.log('error: ', error);
});

db.on('open', function(){
  console.log('open');
});

var spasMessages = [];

function notificate(){
  Subscriber.find()
  .then( function( subsribers ) {
    for( var i = 0; i < subsribers.length; ++i ){
      bot.sendMessage( subsribers[i].userId, spasMessages[ 0 ]);
    }
  })
  .catch(function(error){
    console.log('error: ' + error );
  });
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
  http.get("http://dontgotoschool.herokuapp.com/", function(res) {
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

}, 10 * 60000 );

bot.on('message', function(msg) {
    console.log('onMessage');
    //var chatId = msg.chat.id;
    //bot.sendMessage(chatId, "Received");
});

bot.onText(/\/unsubscribe/, function(msg){
  console.log('on unsubscribe');
  var chatId = msg.chat.id;
  Subscriber.find({userId: chatId})
  .then( function( subscribers ){
    if( subscribers.length === 1 ) {
      subscriber = subscribers[0];
      subscriber.remove()
      .then(function(){
        console.log('removed');
        bot.sendMessage( chatId, "unsubscribed");
      })
      .catch(function(error){
        console.log('error: ' + error );
      });
    }
  })
  .catch(function(error){
    console.log('error: ' + error );
  });
});

bot.onText(/\/subscribe/, function(msg) {
  var chatId = msg.chat.id;

  Subscriber.find({userId: chatId})
  .then( function( subscribers ){
    if( subscribers.length === 0 ) {
      var subscriber = new Subscriber({
        userId: chatId,
        isSaturday: true,
        onlyChanges: true
      });
      subscriber.save()
      .then( function(subscriber){
        console.log('subscribed');
        bot.sendMessage( subscriber.userId, "subscribed");
      })
    } else {
      console.log('already subscribed');
      bot.sendMessage(subscribers[0].userId, "already subscribed");
    }
  })
  .catch(function(error){
    console.log('error: ' + error );
  });
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
