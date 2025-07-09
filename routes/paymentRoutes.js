const express = require('express');
const router = express.Router();
const { 
  getPayments, 
  getPayment, 
  createPayment, 
  updatePayment, 
  deletePayment, 
  getMemberPayments,
  uploadReceipt,
  uploadMiddleware
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Routes with all authentication
router.route('/')
  .get(getPayments)
  .post(authorize('admin', 'staff'), createPayment);

router.route('/:id')
  .get(getPayment)
  .put(authorize('admin', 'staff'), updatePayment)
  .delete(authorize('admin'), deletePayment);

// Get member payment history
router.get('/member/:memberId', getMemberPayments);

// Upload receipt
router.put('/:id/receipt', authorize('admin', 'staff'), uploadMiddleware, uploadReceipt);

module.exports = router;
