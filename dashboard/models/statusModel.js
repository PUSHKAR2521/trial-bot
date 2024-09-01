const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  dashboardStatus: String,
  botStatus: String,
});

module.exports = mongoose.model('Status', statusSchema);
