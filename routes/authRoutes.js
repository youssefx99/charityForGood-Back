const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  getAllUsers,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgotpassword", forgotPassword);
router.get("/users", getAllUsers); // For debugging - remove in production

// Protected routes
router.get("/me", protect, getMe);
router.put("/resetpassword", protect, resetPassword);

module.exports = router;
