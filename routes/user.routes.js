const userController = require("../controllers/user.controller");
const express = require("express");
const router = express.Router();

// Get all users
router.get("/", userController.getAllUsers);

// Get single user
router.get("/:userId", userController.getUser);

// Update profile
router.put("/:userId", userController.updateProfile);

// Delete user
router.delete("/:userId", userController.deleteUser);

module.exports = router;
