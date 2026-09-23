const mongoose = require('mongoose');

const BreachDetailSchema = new mongoose.Schema({
  name: { type: String, required: true },
  domain: { type: String, default: '' },
  breachDate: { type: String, default: 'Unknown' },
  exposedData: [{ type: String }],
  recordsExposed: { type: Number, default: 0 },
  passwordRisk: { type: String, default: 'unknown' },
  verified: { type: Boolean, default: false },
  description: { type: String, default: '' },
  industry: { type: String, default: '' },
  logoUrl: { type: String, default: '' },
  referenceUrl: { type: String, default: '' }
}, { _id: false });

const IncidentCheckSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  type: {
    type: String,
    default: 'breach',
    index: true
  },
  // Privacy safe: SHA-256 hashed email identifier
  emailHash: {
    type: String,
    required: true,
    index: true
  },
  // Privacy safe: Masked email for display (e.g. t***t@example.com)
  maskedEmail: {
    type: String,
    default: ''
  },
  breached: {
    type: Boolean,
    required: true
  },
  breachCount: {
    type: Number,
    default: 0
  },
  breaches: [BreachDetailSchema],
  source: {
    type: String,
    default: 'XposedOrNot'
  },
  checkedAt: {
    type: Date,
    default: Date.now
  },
  cachedAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // 24-hour TTL cache expiration
  }
}, { timestamps: true });

module.exports = mongoose.model('IncidentCheck', IncidentCheckSchema);
