const Payment = require("../models/Payment");
const Member = require("../models/Member");
const multer = require("multer");
const path = require("path");

// Set up storage for receipt documents
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/receipts/");
  },
  filename: function (req, file, cb) {
    cb(null, `receipt-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images and PDFs
  if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
    return cb(new Error("يرجى تحميل ملف صورة أو PDF صالح"), false);
  }
  cb(null, true);
};

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB max
  fileFilter: fileFilter,
});

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
exports.getPayments = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Filter options
    let query = {};

    if (req.query.member) {
      query.member = req.query.member;
    }

    if (req.query.paymentType) {
      query.paymentType = req.query.paymentType;
    }

    if (req.query.isPaid) {
      query.isPaid = req.query.isPaid === "true";
    }

    if (req.query.startDate && req.query.endDate) {
      query.paymentDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    }

    // Execute query
    const payments = await Payment.find(query)
      .populate("member", "fullName nationalId")
      .populate("collectedBy", "fullName")
      .skip(startIndex)
      .limit(limit)
      .sort({ paymentDate: -1 });

    // Get total count
    const total = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      count: payments.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "خطأ في استرجاع بيانات المدفوعات",
      error: error.message,
    });
  }
};

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
exports.getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("member", "fullName nationalId")
      .populate("collectedBy", "fullName");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "المدفوعات غير موجودة",
      });
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "خطأ في استرجاع بيانات المدفوعات",
      error: error.message,
    });
  }
};

// @desc    Create new payment
// @route   POST /api/payments
// @access  Private
exports.createPayment = async (req, res) => {
  try {
    // Add collector info
    req.body.collectedBy = req.user.id;
    console.log(req.body);

    // Generate receipt number
    req.body.receiptNumber = `REC-${Date.now().toString().slice(-6)}`;
    console.log(req.body);

    // Create payment
    const payment = await Payment.create(req.body);
    
    console.log(payment);
    // Add payment to member's payment records
    await Member.findByIdAndUpdate(req.body.member, {
      $push: { paymentRecords: payment._id },
    });

    res.status(201).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "خطأ في إنشاء المدفوعات",
      error: error.message,
    });
  }
};

// @desc    Update payment
// @route   PUT /api/payments/:id
// @access  Private
exports.updatePayment = async (req, res) => {
  try {
    let payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "المدفوعات غير موجودة",
      });
    }

    // Update payment
    payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "خطأ في تحديث بيانات المدفوعات",
      error: error.message,
    });
  }
};

// @desc    Delete payment
// @route   DELETE /api/payments/:id
// @access  Private
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "المدفوعات غير موجودة",
      });
    }

    // Remove payment from member's payment records
    await Member.findByIdAndUpdate(payment.member, {
      $pull: { paymentRecords: payment._id },
    });

    await payment.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "خطأ في حذف المدفوعات",
      error: error.message,
    });
  }
};

// @desc    Get member payment history
// @route   GET /api/payments/member/:memberId
// @access  Private
exports.getMemberPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ member: req.params.memberId })
      .populate("collectedBy", "fullName")
      .sort({ paymentDate: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "خطأ في استرجاع سجل مدفوعات العضو",
      error: error.message,
    });
  }
};

// @desc    Upload payment receipt
// @route   PUT /api/payments/:id/receipt
// @access  Private
exports.uploadReceipt = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "المدفوعات غير موجودة",
      });
    }

    // Update receipt path
    payment.receipt = `/uploads/receipts/${req.file.filename}`;
    await payment.save();

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "خطأ في تحميل إيصال المدفوعات",
      error: error.message,
    });
  }
};

// Export the upload middleware for use in routes
exports.uploadMiddleware = upload.single("receipt");
