const userController = require("../controllers/user.controller");
const express = require("express");
const router = express.Router();

// Get all users
router.get("/", userController.getAllUsers);

// Deactivate user
router.put("/deactivate/:userId", userController.deactivateUser);

// Activate user
router.put("/activate/:userId", userController.activateUser);

// Get user count
router.get("/count", userController.getUserCount);

// Admin send email
router.post("/adminSendEmail", userController.sendEmail);

// Check unique email
router.post("/check-unique", userController.checkUnique);

// Get single user
router.get("/:userId", userController.getUser);

// Join space
router.post("/space/:userId", userController.joinSpace);

// Update profile
router.put("/:userId", userController.updateProfile);

// Update profile picture
router.put(
  "/update-profile-picture/:userId",
  userController.updateProfilePicture
);

// Update admin profile
router.put("/admin/:userId", userController.updateAdminProfile);

// Delete user
router.delete("/:userId", userController.deleteUser);

module.exports = router;
