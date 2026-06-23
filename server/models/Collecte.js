const mongoose = require('mongoose');

const wasteDetailSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['organique', 'recyclable', 'verre', 'residuels', 'encombrants'],
    required: true
  },
  volume: {
    type: Number, // en kg ou litres
    required: true
  },
  pricePerUnit: Number
});

const collecteSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  site: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  wasteDetails: [wasteDetailSchema],
  totalVolume: Number,
  notes: String,
  status: {
    type: String,
    enum: ['planifie', 'en_cours', 'termine', 'annule'],
    default: 'planifie'
  }
}, { timestamps: true });

module.exports = mongoose.model('Collecte', collecteSchema);