const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// Register a new user
router.post("/register", authController.register);

// Login
router.post("/login", authController.login);

// Change password
router.put("/changePassword/:userId", authController.changePassword);

// Logout
router.get("/logout/:userId", authController.logout);

// Reset password
router.post("/resetPassword/:userId", authController.resetPassword);

// Google login
router.post("/googleLogin", authController.googleLogin);

// Facebook login
router.post("/facebookLogin", authController.facebookLogin);

module.exports = router;
