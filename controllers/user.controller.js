const User = require("../models/user.model");

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      message: "Sucessfully get all users",
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Get single user
exports.getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    res.status(200).json({
      message: "Sucessfully get user",
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// User join space
exports.joinSpace = async (req, res) => {
  try {
    const { userId } = req.params;
    const { spaceId } = req.body;
    const user = await User.findById(userId);
    user.spaces.push(spaceId);
    await user.save();

    res.status(200).json({
      message: "Sucessfully join space",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, dob } = req.body;
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    res.status(200).json({
      message: "Sucessfully delete user",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
