const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['client', 'staff', 'admin'],
    default: 'client'
  },
  phone: String,
  address: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Note: password hashing is done in the controller (authController.js)
// to ensure compatibility with both Mongoose and NeDB adapters.
// The pre('save') hook is removed to avoid double-hashing.

module.exports = mongoose.model('User', userSchema);