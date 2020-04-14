var events = require('events');
var spasinfo = require("./spasinfo.js");

var SpasInfoEvents = function()
{
  this.message = '';
  this.isFirstRetrieve = true;
}

SpasInfoEvents.prototype = new events.EventEmitter;

SpasInfoEvents.prototype.getMessage = function() {
  return this.message;
};

SpasInfoEvents.prototype.onRetrieve = function(msgs) {
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

SpasInfoEvents.prototype.checkForUpdate = function() {

  self = this;

  spasinfo.retrieveMessages().then((msgs) => {
    self.onRetrieve(msgs);
  }).catch((err) => {
    self.emit('error', err);
  });

  var interval = setInterval(function(){
      spasinfo.retrieveMessages()
      .then((msgs) => {
        self.onRetrieve(msgs);
      })
      .catch((err) => {
        self.emit('error', err);
      });

  }, 10 * 60000 );
};

module.exports = SpasInfoEvents;
