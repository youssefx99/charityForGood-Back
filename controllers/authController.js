const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    console.log("HIOHIOHOIHo");
    console.log("Request body:", req.body);
    const { username, password, fullName, email, role } = req.body;

    // Validate required fields
    if (!username || !password || !fullName || !email) {
      return res.status(400).json({
        success: false,
        message: "جميع الحقول مطلوبة",
      });
    }

    // Check if user already exists
    console.log("Checking for existing user...");
    
    // Check for existing username
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: "اسم المستخدم موجود بالفعل",
      });
    }
    
    // Check for existing email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "البريد الإلكتروني موجود بالفعل",
      });
    }

    // Create user
    console.log("Creating user with data:", { username, fullName, email, role: role || "member" });
    let user;
    try {
      user = await User.create({
        username,
        password,
        fullName,
        email,
        role: role || "member",
      });
      console.log("User created successfully:", user._id);
    } catch (createError) {
      console.log("User creation error:", createError);
      return res.status(400).json({
        success: false,
        message: "خطأ في إنشاء المستخدم",
        error: createError.message,
      });
    }

    // Generate token
    console.log("Generating token for user:", user._id);
    const token = generateToken(user._id);
    console.log("Token generated successfully");

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في تسجيل المستخدم",
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(email, password);
    // Validate username & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "الرجاء إدخال اسم المستخدم وكلمة المرور",
      });
    }

    // Check for user
    console.log("Looking for user with email:", email);
    const user = await User.findOne({email: email});

    console.log("User found:", user);
    if (!user) {
      console.log("No user found with email:", email);
      return res.status(401).json({
        success: false,
        message: "بيانات الاعتماد غير صالحة",
      });
    }

    // Check if password matches
    console.log("Checking password for user:", user.username);
    console.log("Input password:", password);
    const isMatch = await user.comparePassword(password);
    console.log("Password match result:", isMatch);
    if (!isMatch) {
      console.log("Password does not match");
      return res.status(401).json({
        success: false,
        message: "بيانات الاعتماد غير صالحة",
      });
    }
    console.log("Password matches successfully");

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "خطأ في تسجيل الدخول",
      error: error.message,
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "خطأ في استرجاع بيانات المستخدم",
      error: error.message,
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "لا يوجد مستخدم بهذا البريد الإلكتروني",
      });
    }

    // In a real application, you would send an email with a reset token
    // For this implementation, we'll just return a success message

    res.status(200).json({
      success: true,
      message: "تم إرسال تعليمات إعادة تعيين كلمة المرور إلى بريدك الإلكتروني",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "خطأ في معالجة طلب نسيان كلمة المرور",
      error: error.message,
    });
  }
};

// @desc    Get all users (for debugging)
// @route   GET /api/auth/users
// @access  Public (for development only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "خطأ في استرجاع المستخدمين",
      error: error.message,
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword
// @access  Private
exports.resetPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "كلمة المرور الحالية غير صحيحة",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "تم تغيير كلمة المرور بنجاح",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "خطأ في تغيير كلمة المرور",
      error: error.message,
    });
  }
};
