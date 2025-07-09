const express = require('express');
const router = express.Router();
const { 
  getDashboardStats, 
  getFinancialReport, 
  getMemberReport, 
  getVehicleReport,
  exportMembers,
  exportFinancial
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Dashboard stats
router.get('/dashboard', getDashboardStats);

// Reports
router.get('/financial', authorize('admin', 'staff'), getFinancialReport);
router.get('/members', authorize('admin', 'staff'), getMemberReport);
router.get('/vehicles', authorize('admin', 'staff'), getVehicleReport);

// Export data
router.get('/export/members', authorize('admin'), exportMembers);
router.get('/export/financial', authorize('admin'), exportFinancial);

module.exports = router;
