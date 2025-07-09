const Vehicle = require('../models/Vehicle');
const multer = require('multer');
const path = require('path');

// Set up storage for vehicle documents
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/vehicles/');
  },
  filename: function(req, file, cb) {
    cb(null, `vehicle-${Date.now()}${path.extname(file.originalname)}`);
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
  limits: { fileSize: 1024 * 1024 * 10 }, // 10MB max
  fileFilter: fileFilter
});

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Private
exports.getVehicles = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Filter options
    let query = {};
    
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.search) {
      query.$or = [
        { make: { $regex: req.query.search, $options: 'i' } },
        { model: { $regex: req.query.search, $options: 'i' } },
        { licensePlate: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Execute query
    const vehicles = await Vehicle.find(query)
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // Get total count
    const total = await Vehicle.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: vehicles.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: vehicles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في استرجاع بيانات المركبات',
      error: error.message
    });
  }
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Private
exports.getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'المركبة غير موجودة'
      });
    }
    
    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في استرجاع بيانات المركبة',
      error: error.message
    });
  }
};

// @desc    Create new vehicle
// @route   POST /api/vehicles
// @access  Private
exports.createVehicle = async (req, res) => {
  try {
    // Check if vehicle with same license plate exists
    const vehicleExists = await Vehicle.findOne({ licensePlate: req.body.licensePlate });
    if (vehicleExists) {
      return res.status(400).json({
        success: false,
        message: 'توجد مركبة مسجلة بنفس رقم اللوحة'
      });
    }
    
    // Create vehicle
    const vehicle = await Vehicle.create(req.body);
    
    res.status(201).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء المركبة',
      error: error.message
    });
  }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private
exports.updateVehicle = async (req, res) => {
  try {
    let vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'المركبة غير موجودة'
      });
    }
    
    // If license plate is being updated, check if it already exists
    if (req.body.licensePlate && req.body.licensePlate !== vehicle.licensePlate) {
      const vehicleExists = await Vehicle.findOne({ licensePlate: req.body.licensePlate });
      if (vehicleExists) {
        return res.status(400).json({
          success: false,
          message: 'توجد مركبة مسجلة بنفس رقم اللوحة'
        });
      }
    }
    
    // Update vehicle
    vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث بيانات المركبة',
      error: error.message
    });
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'المركبة غير موجودة'
      });
    }
    
    await vehicle.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف المركبة',
      error: error.message
    });
  }
};

// @desc    Update vehicle status
// @route   PUT /api/vehicles/:id/status
// @access  Private
exports.updateVehicleStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['available', 'in_use', 'maintenance', 'out_of_service'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'يرجى تقديم حالة صالحة'
      });
    }
    
    let vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'المركبة غير موجودة'
      });
    }
    
    // Update status
    vehicle.status = status;
    await vehicle.save();
    
    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث حالة المركبة',
      error: error.message
    });
  }
};

// @desc    Upload vehicle document
// @route   PUT /api/vehicles/:id/document
// @access  Private
exports.uploadDocument = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'المركبة غير موجودة'
      });
    }
    
    // Add document path to vehicle documents array
    const documentPath = `/uploads/vehicles/${req.file.filename}`;
    vehicle.documents.push(documentPath);
    await vehicle.save();
    
    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في تحميل وثيقة المركبة',
      error: error.message
    });
  }
};

// Export the upload middleware for use in routes
exports.uploadMiddleware = upload.single('document');
