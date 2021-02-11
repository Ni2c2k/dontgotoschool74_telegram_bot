const TelegramBot = require('node-telegram-bot-api')
const EddsEvents = require('./edds/eddsEvents.js')
const Subscriber = require('./subscribers')

const bot = new TelegramBot(process.env.TELEGRAM_BOT_DONTGOTOSCHOOL_TOKEN, { polling: true })

bot.on('message', function (msg) {
  console.log('onMessage')
})

bot.onText(/\/unsubscribe/, function (msg) {
  console.log('on unsubscribe')
  const chatId = msg.chat.id

  Subscriber.delete(chatId)
    .then(res => {
      if (res.rowCount === 0) {
        bot.sendMessage(chatId, 'You have no subscription')
      } else {
        bot.sendMessage(chatId, "You've been unsubscribed!")
      }
    })
    .catch(e => {
      console.error(e.stack)
      bot.sendMessage(chatId, 'some error occured')
    })
})

bot.onText(/\/start/, function (msg) {
  console.log('on start')
  const chatId = msg.chat.id
  bot.sendMessage(chatId, 'Для подписки на обновления информации об отмене занятий отправьте команду /subscribe')
})

bot.onText(/\/subscribe/, function (msg) {
  const chatId = msg.chat.id
  console.log('chatId ' + msg.chat.id)

  Subscriber.find_by_id(chatId)
    .then(rows => {
      if (rows.length === 0) {
        console.log('not found in DB, subscribing...' + chatId)
        Subscriber.add(chatId)
          .then(res => {
            console.log('Subscribed ' + chatId)
            bot.sendMessage(chatId, 'Done!')
          })
      } else {
        bot.sendMessage(chatId, 'You have a subscription already')
      }
    })
    .catch(err => {
      console.error(err.stack)
      bot.sendMessage(chatId, 'some error occured')
    })
})

bot.onText(/\/request/, function (msg) {
  const chatId = msg.chat.id
  let response = ''
  if (eddsInfo.getMessage().length > 0) {
    response = eddsInfo.getMessage()
    bot.sendMessage(chatId, response)
  } else {
    response = 'no information'
    bot.sendMessage(chatId, response)
  }
})

bot.on('polling_error', console.log)

function notificate (msg) {
  Subscriber.find()
    .then(rows => {
      for (let i = 0; i < rows.length; ++i) {
        bot.sendMessage(rows[i].user_id, msg)
      }
    })
    .catch(e => {
      console.error(e.stack)
    })
}

const eddsInfo = new EddsEvents()

eddsInfo.on('changed', (msg) => {
  console.log('on changed: ' + msg)
  notificate(msg)
})

eddsInfo.on('error', (err) => {
  console.log('on error: ' + err)
})

eddsInfo.on('firstretrieve', (msg) => {
  // console.log('firstretrieve: ' + msg )
})

eddsInfo.on('retrieved', (msg) => {
  console.log('retrieved: ' + msg)
})

function startMonitorSpas74 () {
  eddsInfo.checkForUpdate()
};

module.exports.bot = bot
module.exports.notificate = notificate
module.exports.startMonitorSpas74 = startMonitorSpas74
