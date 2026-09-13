const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: false
  },
  age: {
    type: String,
    default: null
  },
  gender: {
    type: String,
    default: null
  },
  authMethod: {
    type: String,
    enum: ['email', 'google'],
    default: 'email'
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);