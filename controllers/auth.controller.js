const User = require("../models/user.model");
const upload = require("../middlewares/multer.middleware");
const {
  removeFromCloudinary,
  uploadPic,
} = require("../configs/cloudinary.config");

// Register a new user
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      phoneNumber,
      dob,
      genderIdentity,
      pronouns,
      password,
      sexualOrientation,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !phoneNumber ||
      !dob ||
      !genderIdentity ||
      !pronouns
    ) {
      return res
        .status(400)
        .json({ message: "Please fill all fields", success: false });
    }

    const user = new User({
      name,
      email,
      phoneNumber,
      dob,
      genderIdentity,
      sexualOrientation,
      pronouns,
      password,
    });

    await user.save();

    res.status(201).json({
      message: "Successfully created user",
      success: true,
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error, success: false });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    const { userId } = req.params;
  } catch (error) {
    return res.status(500).json({ message: error, success: false });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log(user);

    // Check if the user exists
    if (!user) {
      return res
        .status(404)
        .json({ message: "Invalid Email or Password", success: false });
    }

    if (user.status === "unverified") {
      return res
        .status(400)
        .json({ message: "Please verify your email", success: false });
    }

    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid Email or Password", success: false });
    }

    const token = user.getJwtToken();
    res.status(200).json({ token, success: true, user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error, success: false });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword, confirmPassword } = req.body;
  } catch (error) {
    return res.status(500).json({ message: error, success: false });
  }
};

// Google login
exports.googleLogin = async (req, res) => {
  try {
  } catch (error) {
    return res.status(500).json({ message: error, success: false });
  }
};

// Facebook login
exports.facebookLogin = async (req, res) => {
  try {
  } catch (error) {
    return res.status(500).json({ message: error, success: false });
  }
};
