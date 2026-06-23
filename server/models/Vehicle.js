const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  plate: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: Number,
  type: {
    type: String,
    enum: ['camion', 'benne', 'compacteur', 'remorque', 'utilitaire'],
    required: true
  },
  capacity: {
    type: Number, // en kg ou m³
    required: true
  },
  fuelType: {
    type: String,
    enum: ['diesel', 'essence', 'electrique', 'hybride', 'gaz'],
    default: 'diesel'
  },
  status: {
    type: String,
    enum: ['actif', 'maintenance', 'hors_service'],
    default: 'actif'
  },
  lastMaintenance: Date,
  nextMaintenance: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);