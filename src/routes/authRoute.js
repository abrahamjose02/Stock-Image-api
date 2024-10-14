// authRoutes.js
const express = require("express");
const {
  register,
  activateUser,
  login,
  refreshToken,
  logout,
  profileDetails,
  forgotPassword,
  verifyOTP,
  resetPassword,
  hello,
} = require("../controller/authController");
const { isvalidate } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/activate", activateUser);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.post("/profile", isvalidate, profileDetails);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);
router.get("/hello", hello);

module.exports = router;
