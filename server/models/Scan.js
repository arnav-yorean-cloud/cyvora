const mongoose = require('mongoose');

const ScanSchema = new mongoose.Schema({
  domain: {
    type: String,
    required: true,
    index: true
  },
  url: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  statusText: String,
  statusColor: String,
  gradeColor: String,
  metadata: {
    registrar: { type: String, default: 'Unknown' },
    protocol: { type: String, default: 'HTTP/1.1' },
    cipher: { type: String, default: 'None' },
    dmarc: { type: String, default: 'Not Configured' },
    ageDays: { type: Number, default: 0 }
  },
  gaps: [String],
  cachedAt: {
    type: Date,
    default: Date.now,
    expires: 43200 // 12-hour TTL cache
  }
}, { timestamps: true });

module.exports = mongoose.model('Scan', ScanSchema);