const express = require('express');
const router = express.Router();
const { 
  getMaintenanceRecords, 
  getMaintenanceRecord, 
  createMaintenanceRecord, 
  updateMaintenanceRecord, 
  deleteMaintenanceRecord, 
  completeMaintenance,
  uploadDocument,
  uploadMiddleware
} = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Routes with all authentication
router.route('/')
  .get(getMaintenanceRecords)
  .post(authorize('admin', 'staff'), createMaintenanceRecord);

router.route('/:id')
  .get(getMaintenanceRecord)
  .put(authorize('admin', 'staff'), updateMaintenanceRecord)
  .delete(authorize('admin'), deleteMaintenanceRecord);

// Complete maintenance
router.put('/:id/complete', authorize('admin', 'staff'), completeMaintenance);

// Upload document
router.put('/:id/document', authorize('admin', 'staff'), uploadMiddleware, uploadDocument);

module.exports = router;
