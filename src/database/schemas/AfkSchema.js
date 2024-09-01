const mongoose = require('mongoose');

const afkSchema = new mongoose.Schema({
  Guild: {
    type: String,
    required: true,
  },
  User: {
    type: String,
    required: true,
  },
  Message: {
    type: String,
    default: 'No reason given',
  },
  Nickname: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('AFK', afkSchema);