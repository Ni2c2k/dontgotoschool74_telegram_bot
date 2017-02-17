var TelegramBot = require('node-telegram-bot-api');
var Subscriber = require('./db/subscriber.js');
var SpasInfoEvents = require('./spas74-client/spasinfoEvents.js');

var bot = new TelegramBot( process.env.TELEGRAM_BOT_DONTGOTOSCHOOL_TOKEN, { polling: true } );

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

var spasInfo = new SpasInfoEvents;

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

function startMonitorSpas74() {
  spasInfo.checkForUpdate();
};

module.exports.bot = bot;
module.exports.notificate = notificate;
module.exports.startMonitorSpas74 = startMonitorSpas74;
