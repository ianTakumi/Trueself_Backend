const User = require("../models/user.model");
const upload = require("../middlewares/multer.middleware");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendOTPEmail } = require("../configs/nodemailer.config");

const {
  removeFromCloudinary,
  uploadPic,
} = require("../configs/cloudinary.config");
const {
  sendRequestPasswordEmail,
  sendVerificationEmail,
  sendRequestPasswordEmailMobile,
} = require("../configs/nodemailer.config");
const OTP = require("../models/OTP.model");

// Update Fcm Token
exports.updateFCMToken = async (req, res) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      return res
        .status(400)
        .json({ message: "User ID and token are required", success: false });
    }

    const user = await User.findByIdAndUpdate(userId, { token }, { new: true });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    return res.status(200).json({ message: "Token updated", success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error, success: false });
  }
};

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
      genderIdentity: genderIdentity.value,
      sexualOrientation: sexualOrientation.value,
      pronouns: pronouns.value,
      password,
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    await sendVerificationEmail(user.name, user.email, token);

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

// Register a new user on mobile
exports.registerMobile = async (req, res) => {
  try {
    const {
      name,
      email,
      phoneNumber,
      pronouns,
      sexualOrientation,
      genderIdentity,
      confirmPassword,
      password,
      dob,
    } = req.body;

    if (
      !name ||
      !email ||
      !phoneNumber ||
      !pronouns ||
      !sexualOrientation ||
      !genderIdentity ||
      !confirmPassword ||
      !password ||
      !dob
    ) {
      return res
        .status(400)
        .json({ message: "Please fill all fields", success: false });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Passwords do not match", success: false });
    }

    const user = new User({
      name,
      email,
      phoneNumber,
      pronouns,
      sexualOrientation,
      genderIdentity,
      password,
      dob,
    });

    await user.save();
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    await OTP.create({ email, code: otpCode, expiresAt: otpExpires });

    sendOTPEmail(user.name, user.email, otpCode);

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

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    console.log(token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    user.status = "verified";
    await user.save();
    res.status(200).json({ message: "Email verified", success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error, success: false });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password, fcmToken } = req.body;

    if (!email || !password || !fcmToken) {
      return res.status(400).json({
        message: "Please provide email, password and FCM token",
        success: false,
      });
    }

    const normalizedEmail = email.toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

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
      console.log("Password is incorrect");
      return res
        .status(400)
        .json({ message: "Invalid Email or Password", success: false });
    }

    user.token = fcmToken;
    await user.save();

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

// Reset password request mobile
exports.resetPasswordRequestMobile = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    const otpCode = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;
    await OTP.create({ email, code: otpCode, expiresAt: otpExpires });

    await sendRequestPasswordEmailMobile(user.name, email, otpCode);

    res.status(200).json({ message: "OTP sent to email", success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error, success: false });
  }
};

// Verify OTP RESET CODE MOBILE
exports.verifyOTPReset = async (req, res) => {
  try {
    const { otp, email } = req.body;

    if (!otp || !email) {
      return res
        .status(400)
        .json({ message: "Please provide OTP and email", success: false });
    }

    const otpData = await OTP.findOne({ email, code: otp });

    if (!otpData) {
      return res.status(409).json({ message: "Invalid OTP", success: false });
    }

    if (new Date(otpData.expiresAt) < new Date()) {
      await OTP.findOneAndDelete({ email: email, code: otp });
      return res
        .status(410)
        .json({ message: "OTP has expired", success: false });
    }

    await OTP.findOneAndDelete({ email: email, code: otp });

    const user = await User.findOne({ email });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "OTP verified", success: true, token });
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
    console.log(error);
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

// Google sign up
exports.googleSignUp = async (req, res) => {
  try {
    const { email, sub, name, dob, password } = req.body;

    if (!email || !sub || !name || !dob || !password) {
      return res
        .status(400)
        .json({ message: "Email, sub and name are required", success: false });
    }

    let user = await User.findOne({ email });

    if (user) {
      return res
        .status(400)
        .json({ message: "User already exists", success: false });
    }

    user = new User({
      email,
      name,
      password,
      dob,
      status: "verified",
      socialAccounts: [{ provider: "google", provider_id: sub }],
    });

    await user.save();
    const token = user.getJwtToken();
    return res.status(201).json({ token, success: true, user });
  } catch (error) {
    return res.status(500).json({ message: error, success: false });
  }
};

// Check unique email
exports.checkUniqueEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res
        .status(400)
        .json({ message: "Email is required", success: false });
    }

    const user = await User.findOne({
      email,
    });

    console.log(user);

    if (user) {
      return res
        .status(409)
        .json({ message: "Email already exists", success: false });
    }

    return res.status(200).json({ message: "Email is unique" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error, success: false });
  }
};

// Check phone number unique
exports.checkUniquePhoneNumber = async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    if (!phoneNumber) {
      return res
        .status(400)
        .json({ message: "Phone number is required", success: false });
    }

    const user = await User.findOne({
      phoneNumber,
    });

    if (user) {
      return res
        .status(409)
        .json({ message: "Phone number already exists", success: false });
    }

    return res.status(200).json({ message: "Phone number is unique" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error, success: false });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { otp, email } = req.body;

    if (!otp || !email) {
      return res
        .status(400)
        .json({ message: "Please provide OTP and email", success: false });
    }

    const otpData = await OTP.findOne({ email, code: otp });

    if (!otpData) {
      return res.status(400).json({ message: "Invalid OTP", success: false });
    }

    if (new Date(otpData.expiresAt) < new Date()) {
      await OTP.findOneAndDelete({ email: email, code: otp }); // Clean up expired OTP
      return res
        .status(410)
        .json({ message: "OTP has expired", success: false });
    }

    await OTP.findOneAndDelete({ email: email, code: otp });

    const user = await User.findOne({ email });

    user.status = "verified";
    await user.save();

    return res.status(200).json({ message: "Email verified", success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error, success: false });
  }
};
