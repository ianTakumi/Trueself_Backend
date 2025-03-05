const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// Check unique email
router.get("/check-email/:email", authController.checkUniqueEmail);

// Check unique phone
router.get("/check-phone/:phoneNumber", authController.checkUniquePhoneNumber);

router.post("/registerMobile", authController.registerMobile);

router.post("/verifyOTP", authController.verifyOTP);

// Register a new user
router.post("/register", authController.register);

// Verify email
router.get("/verifyEmail/:token", authController.verifyEmail);

// Login
router.post("/login", authController.login);

// Change password
router.put("/changePassword/:userId", authController.changePassword);

// Reset password
router.post("/resetPassword/:jwtToken", authController.resetPassword);

// Reset password request
router.post("/resetPasswordRequest", authController.resetPasswordRequest);

// Reset password mobile
router.post("/resetPasswordMobile", authController.resetPasswordRequestMobile);

//  Verify reset password OTP mobile
router.post("/verifyResetPasswordOTP", authController.verifyOTPReset);

// Google login
router.post("/googleLogin", authController.googleLogin);

// Google link account
router.put("/googleLinkAccount/:userId", authController.linkGoogle);

module.exports = router;
