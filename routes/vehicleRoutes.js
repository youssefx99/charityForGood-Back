const express = require('express');
const router = express.Router();
const { 
  getVehicles, 
  getVehicle, 
  createVehicle, 
  updateVehicle, 
  deleteVehicle, 
  updateVehicleStatus,
  uploadDocument,
  uploadMiddleware
} = require('../controllers/vehicleController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Routes with all authentication
router.route('/')
  .get(getVehicles)
  .post(authorize('admin', 'staff'), createVehicle);

router.route('/:id')
  .get(getVehicle)
  .put(authorize('admin', 'staff'), updateVehicle)
  .delete(authorize('admin'), deleteVehicle);

// Update vehicle status
router.put('/:id/status', authorize('admin', 'staff'), updateVehicleStatus);

// Upload document
router.put('/:id/document', authorize('admin', 'staff'), uploadMiddleware, uploadDocument);

module.exports = router;
