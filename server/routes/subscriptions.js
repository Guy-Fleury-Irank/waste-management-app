const express = require('express');
const router = express.Router();
const { getSubscriptions, getSubscription, createSubscription, updateSubscription, deleteSubscription, getPricing } = require('../controllers/subscriptionController');
const { protect, authorize } = require('../middleware/auth');

// Public pricing endpoint
router.get('/plans/pricing', getPricing);

router.use(protect);

router.route('/')
  .get(getSubscriptions)
  .post(createSubscription); // Clients et staff/admin peuvent créer

router.route('/:id')
  .get(getSubscription)
  .put(authorize('staff', 'admin'), updateSubscription)
  .delete(authorize('admin'), deleteSubscription);

module.exports = router;