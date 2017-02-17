var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var subscriberSchema = new mongoose.Schema({
  userId: String,
  chatId: Number,
  isSaturday: Boolean,
  onlyChanges: Boolean
});

//var Subscriber = mongoose.model('Subscriber', subscriberSchema);
module.exports = mongoose.model('Subscriber', subscriberSchema);
