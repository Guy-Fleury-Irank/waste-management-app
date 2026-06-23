const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  contactName: String,
  contactPhone: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  type: {
    type: String,
    enum: ['residentiel', 'commercial', 'industriel', 'public'],
    default: 'residentiel'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Site', siteSchema);