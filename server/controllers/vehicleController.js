const { getModel } = require('../utils/adapter');

// @route   GET /api/vehicles
exports.getVehicles = async (req, res) => {
  try {
    const Vehicle = getModel('Vehicle');
    const vehicles = await Vehicle.find();
    // Sort manually for NeDB compatibility
    vehicles.sort((a, b) => (a.plate || '').localeCompare(b.plate || ''));
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @route   GET /api/vehicles/:id
exports.getVehicle = async (req, res) => {
  try {
    const Vehicle = getModel('Vehicle');
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Véhicule non trouvé' });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @route   POST /api/vehicles
exports.createVehicle = async (req, res) => {
  try {
    const Vehicle = getModel('Vehicle');
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(vehicle);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Cette plaque d\'immatriculation existe déjà' });
    }
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @route   PUT /api/vehicles/:id
exports.updateVehicle = async (req, res) => {
  try {
    const Vehicle = getModel('Vehicle');
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body);
    if (!vehicle) return res.status(404).json({ message: 'Véhicule non trouvé' });
    const updatedVehicle = await Vehicle.findById(req.params.id);
    res.json(updatedVehicle);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @route   DELETE /api/vehicles/:id
exports.deleteVehicle = async (req, res) => {
  try {
    const Vehicle = getModel('Vehicle');
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Véhicule non trouvé' });
    res.json({ message: 'Véhicule supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};