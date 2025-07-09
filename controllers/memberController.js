const Member = require('../models/Member');
const { configureMulter, processUploadedFile } = require('../utils/fileUpload');

// Configure multer for member profile photos
const { imageUpload } = configureMulter('uploads/profiles/', 5 * 1024 * 1024);

// @desc    Get all members
// @route   GET /api/members
// @access  Private
exports.getMembers = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Filter options
    let query = {};
    
    if (req.query.status) {
      query.membershipStatus = req.query.status;
    }
    
    if (req.query.search) {
      query.$or = [
        { 'fullName.first': { $regex: req.query.search, $options: 'i' } },
        { 'fullName.last': { $regex: req.query.search, $options: 'i' } },
        { nationalId: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Execute query
    const members = await Member.find(query)
      .skip(startIndex)
      .limit(limit)
      .sort({ joinDate: -1 });
    
    // Get total count
    const total = await Member.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: members.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: members
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في استرجاع بيانات الأعضاء',
      error: error.message
    });
  }
};

// @desc    Get single member
// @route   GET /api/members/:id
// @access  Private
exports.getMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id).populate('paymentRecords');
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'العضو غير موجود'
      });
    }
    
    res.status(200).json({
      success: true,
      data: member
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في استرجاع بيانات العضو',
      error: error.message
    });
  }
};

// @desc    Create new member
// @route   POST /api/members
// @access  Private
exports.createMember = async (req, res) => {
  try {
    // Check if member with same national ID exists
    const memberExists = await Member.findOne({ nationalId: req.body.nationalId });
    if (memberExists) {
      return res.status(400).json({
        success: false,
        message: 'يوجد عضو مسجل بنفس رقم الهوية'
      });
    }
    
    // Create member
    const member = await Member.create(req.body);
    
    res.status(201).json({
      success: true,
      data: member
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء العضو',
      error: error.message
    });
  }
};

// @desc    Update member
// @route   PUT /api/members/:id
// @access  Private
exports.updateMember = async (req, res) => {
  try {
    let member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'العضو غير موجود'
      });
    }
    
    // Update member
    member = await Member.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: member
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث بيانات العضو',
      error: error.message
    });
  }
};

// @desc    Delete member
// @route   DELETE /api/members/:id
// @access  Private
exports.deleteMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'العضو غير موجود'
      });
    }
    
    await member.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف العضو',
      error: error.message
    });
  }
};

// @desc    Upload member profile photo
// @route   POST /api/members/:id/photo
// @access  Private
exports.uploadProfilePhoto = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'العضو غير موجود'
      });
    }

    // Use the image upload middleware
    imageUpload.single('profilePhoto')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'يرجى تحميل ملف صورة'
        });
      }

      try {
        // Process the uploaded file
        const fileInfo = await processUploadedFile(req.file, 'profiles');
        
        // Update member with new profile photo
        member.profilePhoto = fileInfo.url;
        await member.save();

        res.status(200).json({
          success: true,
          message: 'تم تحميل الصورة بنجاح',
          data: {
            profilePhoto: fileInfo.url
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'خطأ في تحميل الصورة',
          error: error.message
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في تحميل الصورة',
      error: error.message
    });
  }
};
