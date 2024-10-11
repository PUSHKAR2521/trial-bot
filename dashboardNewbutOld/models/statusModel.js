const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
    timestamp: { type: Date, required: true },
    dashboardStatus: { type: String, enum: ['Online', 'Offline'], required: true },
    botStatus: { type: String, enum: ['Online', 'Offline'], required: true }
});

module.exports = mongoose.model('Status', statusSchema);
