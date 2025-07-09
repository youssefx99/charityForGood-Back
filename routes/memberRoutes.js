const express = require('express');
const router = express.Router();
const { 
  getMembers, 
  getMember, 
  createMember, 
  updateMember, 
  deleteMember
} = require('../controllers/memberController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Routes with all authentication
router.route('/')
  .get(getMembers)
  .post(authorize('admin', 'staff'), createMember);

router.route('/:id')
  .get(getMember)
  .put(authorize('admin', 'staff'), updateMember)
  .delete(authorize('admin'), deleteMember);

module.exports = router;
