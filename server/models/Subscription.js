const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  site: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site',
    required: true
  },
  type: {
    type: String,
    enum: ['hebdomadaire', 'mensuel', 'annuel'],
    required: true
  },
  isOrganization: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: Date,
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentMethod: {
    type: String,
    enum: ['carte_credit', 'paypal', 'lumicash', 'depot_siege'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['paye', 'en_attente', 'echoue'],
    default: 'en_attente'
  },
  status: {
    type: String,
    enum: ['actif', 'suspendu', 'expire', 'annule'],
    default: 'actif'
  },
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);