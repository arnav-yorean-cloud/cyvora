// server/models/History.js
const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    index: true
  },
  url: {
    type: String,
    required: true
  },
  domain: String,
  score: Number,
  grade: String,
  statusText: String,
  source: {
    type: String,
    default: 'manual'
  },
  timestamp: String,
  date: String,
  gaps: [String],
  metadata: {
    type: Object,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('History', HistorySchema);