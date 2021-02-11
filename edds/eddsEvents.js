const events = require('events')
const edds = require('./edds.js')

const EddsEvents = function () {
  this.message = ''
  this.isFirstRetrieve = true
}

EddsEvents.prototype = new events.EventEmitter()

EddsEvents.prototype.getMessage = function () {
  return this.message
}

EddsEvents.prototype.onRetrieve = function (msgs) {
  let msg = ''
  for (let i = 0; i < msgs.length; ++i) {
    msg += msgs[i]
  }

  self.emit('retrieved', msg)

  if (this.isFirstRetrieve) {
    this.emit('firstretrieve', msg)
    this.isFirstRetrieve = false
    this.message = msg
  } else {
    if (this.message !== msg) {
      if (msg.search('школ') === -1 && msg.search('учебны')) {
        // do nothing
      } else {
        this.message = msg
        this.emit('changed', this.message)
      }
    }
  }
}

EddsEvents.prototype.checkForUpdate = function () {
  self = this

  edds.retrieveMessages().then((msgs) => {
    self.onRetrieve(msgs)
  }).catch((err) => {
    self.emit('error', err)
  })

  const interval = setInterval(function () {
    edds.retrieveMessages()
      .then((msgs) => {
        self.onRetrieve(msgs)
      })
      .catch((err) => {
        self.emit('error', err)
      })
  }, 10 * 60000)
}

module.exports = EddsEvents
