const express = require('express');
const router = express.Router();
const { 
  getMaintenance, 
  getMaintenanceRecord, 
  createMaintenance, 
  updateMaintenance, 
  deleteMaintenance,
  updateMaintenanceStatus
} = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Routes with all authentication
router.route('/')
  .get(getMaintenance)
  .post(authorize('admin', 'staff'), createMaintenance);

router.route('/:id')
  .get(getMaintenanceRecord)
  .put(authorize('admin', 'staff'), updateMaintenance)
  .delete(authorize('admin'), deleteMaintenance);

// Update maintenance status
router.put('/:id/status', authorize('admin', 'staff'), updateMaintenanceStatus);

module.exports = router;
