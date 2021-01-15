var TelegramBot = require('node-telegram-bot-api');
var EddsEvents = require('./edds/eddsEvents.js');

var bot = new TelegramBot( process.env.TELEGRAM_BOT_DONTGOTOSCHOOL_TOKEN, { polling: true } );

bot.on('message', function(msg) {
    console.log('onMessage');
});

bot.onText(/\/unsubscribe/, function(msg){
  console.log('on unsubscribe');
  var chatId = msg.chat.id;
  // Subscriber.find({userId: chatId})
  // .then( function( subscribers ){
  //   if( subscribers.length === 1 ) {
  //     subscriber = subscribers[0];
  //     subscriber.remove()
  //     .then(function(){
  //       console.log('removed');
  //       bot.sendMessage( chatId, "unsubscribed");
  //     })
  //     .catch(function(error){
  //       console.log('error: ' + error );
  //     });
  //   }
  // })
  // .catch(function(error){
  //   console.log('error: ' + error );
  // });
      });

bot.onText(/\/start/, function(msg){
  console.log('on start');
  var chatId = msg.chat.id;
  bot.sendMessage( chatId, "Для подписки на обновления информации об отмене занятий отправьте команду /subscribe" );
});

bot.onText(/\/subscribe/, function(msg) {
  var chatId = msg.chat.id;
  console.log('chatId ' + msg.chat.id);
  bot.sendMessage(chatId, "on subscribe " + chatId);

  // Subscriber.find({userId: chatId})
  // .then( function( subscribers ){
  //   if( subscribers.length === 0 ) {
  //     var subscriber = new Subscriber({
  //       userId: chatId,
  //       isSaturday: true,
  //       onlyChanges: true
  //     });
  //     subscriber.save()
  //     .then( function(subscriber){
  //       console.log('subscribed');
  //       bot.sendMessage( subscriber.userId, "subscribed");
  //     })
  //   } else {
  //     console.log('already subscribed');
  //     bot.sendMessage(subscribers[0].userId, "already subscribed");
  //   }
  // })
  // .catch(function(error){
  //   console.log('error: ' + error );
  // });
});

bot.onText(/\/request/, function(msg) {
    var chatId = msg.chat.id;
    var response = "";
    if( eddsInfo.getMessage().length > 0 ) {
        response = eddsInfo.getMessage();
        bot.sendMessage( chatId, response );
    } else {
        response = "no information";
        bot.sendMessage( chatId, response );
    }
});

function notificate( msg ){
  // Subscriber.find()
  // .then( function( subsribers ) {
  //   for( var i = 0; i < subsribers.length; ++i ){
  //     bot.sendMessage( subsribers[i].userId, msg);
  //   }
  // })
  // .catch(function(error){
  //   console.log('error: ' + error );
  // });
}

var eddsInfo = new EddsEvents;

eddsInfo.on('changed', (msg) => {
  console.log('on changed: ' + msg);
  notificate( msg );
});

eddsInfo.on('error', (err) => {
  console.log('on error: ' + err );
});

eddsInfo.on('firstretrieve', (msg) => {
  //console.log('firstretrieve: ' + msg );
});

eddsInfo.on('retrieved', (msg) => {
  console.log('retrieved: ' + msg);
});

function startMonitorSpas74() {
  eddsInfo.checkForUpdate();
};

module.exports.bot = bot;
module.exports.notificate = notificate;
module.exports.startMonitorSpas74 = startMonitorSpas74;
