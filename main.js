var SpasInfoEvents = require('./spasInfoEvents.js');
var mongoose = require('mongoose');
var TelegramBot = require('node-telegram-bot-api');
var http = require('http');

var bot = new TelegramBot( process.env.TELEGRAM_BOT_DONTGOTOSCHOOL_TOKEN, { polling: true } );
mongoose.Promise = global.Promise;

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

var spasInfo = new SpasInfoEvents;

function notificate( msg ){
  Subscriber.find()
  .then( function( subsribers ) {
    for( var i = 0; i < subsribers.length; ++i ){
      bot.sendMessage( subsribers[i].userId, msg);
    }
  })
  .catch(function(error){
    console.log('error: ' + error );
  });
}

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

}, 10 * 60000 );

bot.on('message', function(msg) {
    console.log('onMessage');
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

bot.onText(/\/start/, function(msg){
  console.log('on start');
  var chatId = msg.chat.id;
  bot.sendMessage( chatId, "Для подписки на обновления информации об отмене занятий отправьте команду /subscribe" );
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
    if( spasInfo.getMessage().length > 0 ) {
        response = spasInfo.getMessage();
        bot.sendMessage( chatId, response );
    } else {
        response = "no information";
        bot.sendMessage( chatId, response );
    }
});

spasInfo.on('changed', (msg) => {
  console.log('on changed: ' + msg);
  notificate( msg );
});

spasInfo.on('error', (err) => {
  console.log('on error: ' + err );
});

spasInfo.on('firstretrieve', (msg) => {
  //console.log('firstretrieve: ' + msg );
});

spasInfo.on('retrieved', (msg) => {
  console.log('retrieved: ' + msg);
});

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
spasInfo.checkForUpdate();
