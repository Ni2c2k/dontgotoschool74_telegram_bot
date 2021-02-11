const http = require('http')
const dontsleep = require('./heroku/dontsleep.js')
const tgBot = require('./spasinfo_bot.js')
const Subscriber = require('./subscribers')

setInterval(function () {
  console.log('interval')

  dontsleep.preventSleepHeroku()
    .then(res => {
      console.log(res)
    })
    .catch(e => {
      console.log(e)
    })
}, 10 * 60000)

const server = http.createServer(function (request, response) {
  Subscriber.find()
    .then(subscribers => {
      response.writeHead(200, { 'Content-Type': 'text/plain' })
      response.end('Dontgotoschool bot: ' + request.url + '\n subscribers count = ' + subscribers.length)
    })
    .catch(e => {
      console.log('error: ' + e)
      response.writeHead(200, { 'Content-Type': 'text/plain' })
      response.end('Dontgotoschool bot: ' + request.url + '\n subscribers count = ?')
    })
})

server.listen(process.env.PORT || 8000)
tgBot.startMonitorSpas74()
