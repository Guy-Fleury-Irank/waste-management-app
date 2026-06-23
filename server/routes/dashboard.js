const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('admin', 'staff'), getStats);

module.exports = router;