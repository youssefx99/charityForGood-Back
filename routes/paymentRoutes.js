const express = require('express');
const router = express.Router();
const { 
  getPayments, 
  getPayment, 
  createPayment, 
  updatePayment, 
  deletePayment, 
  getPaymentsByMember
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

// Get payments by member
router.get('/member/:memberId', getPaymentsByMember);

module.exports = router;
