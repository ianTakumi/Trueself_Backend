const User = require("../models/user.model");
const upload = require("../middlewares/multer.middleware");
const jwt = require("jsonwebtoken");
const {
  removeFromCloudinary,
  uploadPic,
} = require("../configs/cloudinary.config");
const { sendRequestPasswordEmail } = require("../configs/nodemailer.config");

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

// Reset password request
exports.resetPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    await sendRequestPasswordEmail(user.name, email, token);

    res
      .status(200)
      .json({ token, success: true, message: "Token sent to email" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error, success: false });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { jwtToken } = req.params;
    const { password, confirmPassword } = req.body;
    console.log(req.params);
    console.log(req.body);

    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    console.log(decoded);
    const user = await User.findById(decoded.id);

    user.password = password;
    await user.save();

    res
      .status(200)
      .json({ message: "Password reset successful", success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error, success: false });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Please fill all fields", success: false });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid current password", success: false });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Passwords do not match", success: false });
    }

    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password updated", success: true });
  } catch (error) {
    return res.status(500).json({ message: error, success: false });
  }
};

// Google link account
exports.linkGoogle = async (req, res) => {
  try {
    const { userId } = req.params;
    const { provider_id } = req.body;

    if (!provider_id || !userId) {
      return res
        .status(400)
        .json({ error: "Provider ID and User ID are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingSocialAccount = user.socialAccounts.find(
      (account) => account.provider === "google"
    );

    if (existingSocialAccount) {
      return res
        .status(400)
        .json({ error: "Google account is already linked" });
    }

    user.socialAccounts.push({ provider: "google", provider_id });
    await user.save();
    return res.status(200).json({
      message: "Google account linked successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error, success: false });
  }
};

// Google login
exports.googleLogin = async (req, res) => {
  try {
    const { email, sub } = req.body;

    if (!email || !sub) {
      return res
        .status(400)
        .json({ message: "Email and sub are required", success: false });
    }

    let user = await User.findOne({ "socialAccounts.provider_id": sub, email });

    if (user) {
      const token = user.getJwtToken();
      return res.status(200).json({ token, success: true, user });
    } else {
      return res.status(400).json({
        message: "No account linked to this Google account",
        success: false,
      });
    }
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
