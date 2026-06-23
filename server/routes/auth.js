const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, updateProfile, createStaffOrAdmin } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.post('/create-staff-admin', protect, authorize('admin'), createStaffOrAdmin);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);

module.exports = router;