const express = require('express');
const router = express.Router();
const { getCollectes, getCollecte, createCollecte, updateCollecte, deleteCollecte } = require('../controllers/collecteController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getCollectes)
  .post(authorize('staff', 'admin'), createCollecte);

router.route('/:id')
  .get(getCollecte)
  .put(authorize('staff', 'admin'), updateCollecte)
  .delete(authorize('admin'), deleteCollecte);

module.exports = router;