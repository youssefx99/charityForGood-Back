const Expense = require('../models/Expense');
const multer = require('multer');
const path = require('path');

// Set up storage for expense receipts
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/expenses/');
  },
  filename: function(req, file, cb) {
    cb(null, `expense-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images and PDFs
  if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
    return cb(new Error('يرجى تحميل ملف صورة أو PDF صالح'), false);
  }
  cb(null, true);
};

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB max
  fileFilter: fileFilter
});

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Filter options
    let query = {};
    
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    if (req.query.approvalStatus) {
      query.approvalStatus = req.query.approvalStatus;
    }
    
    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }
    
    // Execute query
    const expenses = await Expense.find(query)
      .populate('spentBy', 'fullName')
      .populate('approvedBy', 'fullName')
      .skip(startIndex)
      .limit(limit)
      .sort({ date: -1 });
    
    // Get total count
    const total = await Expense.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: expenses.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: expenses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في استرجاع بيانات المصروفات',
      error: error.message
    });
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
exports.getExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('spentBy', 'fullName')
      .populate('approvedBy', 'fullName');
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'المصروفات غير موجودة'
      });
    }
    
    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في استرجاع بيانات المصروفات',
      error: error.message
    });
  }
};

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
exports.createExpense = async (req, res) => {
  try {
    // Add spender info
    req.body.spentBy = req.user.id;
    
    // Create expense
    const expense = await Expense.create(req.body);
    
    res.status(201).json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء المصروفات',
      error: error.message
    });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = async (req, res) => {
  try {
    let expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'المصروفات غير موجودة'
      });
    }
    
    // Update expense
    expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث بيانات المصروفات',
      error: error.message
    });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'المصروفات غير موجودة'
      });
    }
    
    await expense.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف المصروفات',
      error: error.message
    });
  }
};

// @desc    Approve expense
// @route   PUT /api/expenses/:id/approve
// @access  Private (Admin only)
exports.approveExpense = async (req, res) => {
  try {
    let expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'المصروفات غير موجودة'
      });
    }
    
    // Update approval status
    expense.approvalStatus = 'approved';
    expense.approvedBy = req.user.id;
    await expense.save();
    
    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في الموافقة على المصروفات',
      error: error.message
    });
  }
};

// @desc    Reject expense
// @route   PUT /api/expenses/:id/reject
// @access  Private (Admin only)
exports.rejectExpense = async (req, res) => {
  try {
    let expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'المصروفات غير موجودة'
      });
    }
    
    // Update approval status
    expense.approvalStatus = 'rejected';
    expense.approvedBy = req.user.id;
    await expense.save();
    
    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في رفض المصروفات',
      error: error.message
    });
  }
};

// @desc    Upload expense receipt
// @route   PUT /api/expenses/:id/receipt
// @access  Private
exports.uploadReceipt = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'المصروفات غير موجودة'
      });
    }
    
    // Update receipt path
    expense.receipt = `/uploads/expenses/${req.file.filename}`;
    await expense.save();
    
    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في تحميل إيصال المصروفات',
      error: error.message
    });
  }
};

// Export the upload middleware for use in routes
exports.uploadMiddleware = upload.single('receipt');
