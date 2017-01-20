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

SpasInfoEvents.prototype.checkForUpdate = function() {

  self = this;

  var interval = setInterval(function(){
      spasinfo.retrieveMessages()
      .then((msgs) => {
        var msg = '';
        for( var i = 0; i < msgs.length; ++i){
          msg += msgs[i];
        }

        self.emit('retrieved', msg);

        if( self.isFirstRetrieve ) {
          self.emit('firstretrieve', msg);
          self.isFirstRetrieve = false;
          self.message = msg;
        } else {
          if( self.message != msg ) {
            self.message = msg;
            self.emit('changed', self.message);
          }
        }

      })
      .catch((err) => {
        self.emit('error', err);
      });

  }, 10 * 60000 );
};

module.exports = SpasInfoEvents;
