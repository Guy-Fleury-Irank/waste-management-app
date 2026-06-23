const express = require('express');
const router = express.Router();
const { getVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getVehicles)
  .post(authorize('staff', 'admin'), createVehicle);

router.route('/:id')
  .get(getVehicle)
  .put(authorize('staff', 'admin'), updateVehicle)
  .delete(authorize('admin'), deleteVehicle);

module.exports = router;