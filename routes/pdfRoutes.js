const express = require('express');
const router = express.Router();
const { 
  generateComprehensiveReport,
  generateFinancialReport,
  generateMemberReport,
  generateVehicleReport
} = require('../controllers/pdfController');
const { protect } = require('../middleware/auth');

// Generate comprehensive report
router.get('/comprehensive', protect, generateComprehensiveReport);

// Generate financial report
router.get('/financial', protect, generateFinancialReport);

// Generate member report
router.get('/members', protect, generateMemberReport);

// Generate vehicle report
router.get('/vehicles', protect, generateVehicleReport);

module.exports = router; 