const express = require('express');
const router = express.Router();
const { getUsers, getUser, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// GET: admin et staff peuvent lire les users
router.get('/', authorize('admin', 'staff'), getUsers);
router.get('/:id', authorize('admin', 'staff'), getUser);

// POST/PUT/DELETE: admin only
router.post('/', authorize('admin'), createUser);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;