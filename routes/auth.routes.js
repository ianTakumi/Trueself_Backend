const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// Register a new user
router.post("/register", authController.register);

// Login
router.post("/login", authController.login);

// Change password
router.put("/changePassword/:userId", authController.changePassword);

// Reset password
router.post("/resetPassword/:jwtToken", authController.resetPassword);

// Reset password request
router.post("/resetPasswordRequest", authController.resetPasswordRequest);

// Google login
router.post("/googleLogin", authController.googleLogin);

// Google link account
router.put("/googleLinkAccount/:userId", authController.linkGoogle);

// Facebook login
router.post("/facebookLogin", authController.facebookLogin);

module.exports = router;
