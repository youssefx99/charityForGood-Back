const express = require('express');
const router = express.Router();
const { 
  getTrips, 
  getTrip, 
  createTrip, 
  updateTrip, 
  deleteTrip, 
  completeTrip,
  cancelTrip
} = require('../controllers/tripController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Routes with all authentication
router.route('/')
  .get(getTrips)
  .post(authorize('admin', 'staff'), createTrip);

router.route('/:id')
  .get(getTrip)
  .put(authorize('admin', 'staff'), updateTrip)
  .delete(authorize('admin'), deleteTrip);

// Trip status routes
router.put('/:id/complete', authorize('admin', 'staff'), completeTrip);
router.put('/:id/cancel', authorize('admin', 'staff'), cancelTrip);

module.exports = router;
