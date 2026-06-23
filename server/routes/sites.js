const express = require('express');
const router = express.Router();
const { getSites, getSite, createSite, updateSite, deleteSite } = require('../controllers/siteController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getSites)
  .post(authorize('client', 'staff', 'admin'), createSite);

router.route('/:id')
  .get(getSite)
  .put(authorize('staff', 'admin'), updateSite)
  .delete(authorize('admin'), deleteSite);

module.exports = router;