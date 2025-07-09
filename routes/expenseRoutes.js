const express = require('express');
const router = express.Router();
const { 
  getExpenses, 
  getExpense, 
  createExpense, 
  updateExpense, 
  deleteExpense, 
  approveExpense,
  rejectExpense,
  uploadReceipt,
  uploadMiddleware
} = require('../controllers/expenseController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Routes with all authentication
router.route('/')
  .get(getExpenses)
  .post(authorize('admin', 'staff'), createExpense);

router.route('/:id')
  .get(getExpense)
  .put(authorize('admin', 'staff'), updateExpense)
  .delete(authorize('admin'), deleteExpense);

// Approval routes
router.put('/:id/approve', authorize('admin'), approveExpense);
router.put('/:id/reject', authorize('admin'), rejectExpense);

// Upload receipt
router.put('/:id/receipt', authorize('admin', 'staff'), uploadMiddleware, uploadReceipt);

module.exports = router;
