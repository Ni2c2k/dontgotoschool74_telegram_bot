var events = require('events');
var edds = require("./edds.js");

var EddsEvents = function()
{
  this.message = '';
  this.isFirstRetrieve = true;
}

EddsEvents.prototype = new events.EventEmitter;

EddsEvents.prototype.getMessage = function() {
  return this.message;
};

EddsEvents.prototype.onRetrieve = function(msgs) {
  var msg = '';
  for( var i = 0; i < msgs.length; ++i){
    msg += msgs[i];
  }

  self.emit('retrieved', msg);

  if( this.isFirstRetrieve ) {
    this.emit('firstretrieve', msg);
    this.isFirstRetrieve = false;
    this.message = msg;
  } else {
    if( this.message != msg ) {
      if (msg.search("школ") === -1 && msg.search("учебны")) {
        // do nothing
      } else {
        this.message = msg;
        this.emit('changed', this.message);
      }
    }
  }
};

EddsEvents.prototype.checkForUpdate = function() {

  self = this;

  edds.retrieveMessages().then((msgs) => {
    self.onRetrieve(msgs);
  }).catch((err) => {
    self.emit('error', err);
  });

  var interval = setInterval(function(){
      edds.retrieveMessages()
      .then((msgs) => {
        self.onRetrieve(msgs);
      })
      .catch((err) => {
        self.emit('error', err);
      });

  }, 10 * 60000 );
};

module.exports = EddsEvents;
