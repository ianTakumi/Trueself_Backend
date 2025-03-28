const User = require("../models/user.model");
const upload = require("../middlewares/multer.middleware");
const path = require("path");
const {
  sendAdminEmail,
  sendDeactivateEmail,
  reactivateAccountEmail,
} = require("../configs/nodemailer.config");
const {
  uploadPic,
  removeFromCloudinary,
} = require("../configs/cloudinary.config");

// Check uniqueness
exports.checkUnique = async (req, res) => {
  try {
    const { email, id } = req.body; // Destructure id from the request body

    // Build the query: Check for email existence, excluding the user with the provided id
    const query = id ? { email, _id: { $ne: id } } : { email };

    const existingUser = await User.findOne(query);

    if (existingUser) {
      console.log("Email is already taken");
      return res
        .status(400)
        .json({ message: "Email is already taken", isUnique: false });
    }

    return res
      .status(200)
      .json({ message: "Email is available", isUnique: true });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// Deactvate user
exports.deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    user.status = "deactivated";
    await user.save();

    // Send email to user
    await sendDeactivateEmail(user.name, user.email);

    res.status(200).json({
      message: "User deactivated successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Activate user
exports.activateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    user.status = "activated";
    await user.save();

    reactivateAccountEmail(user.name, user.email);
    res.status(200).json({
      message: "User activated successfully",
      success: true,
    });
  } catch (error) {
    console.lo(error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

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

// Get user count
exports.getUserCount = async (req, res) => {
  try {
    // Count users excluding those with the 'admin' role
    const count = await User.countDocuments({ role: { $ne: "admin" } });
    res.status(200).json({
      message: "Successfully retrieved user count excluding admins",
      success: true,
      count,
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

// User leave space
exports.leaveSpace = async (req, res) => {
  try {
    const { userId } = req.params;
    const { spaceId } = req.body;
    const user = await User.findById(userId);
    user.spaces = user.spaces.filter((space) => space !== spaceId);
    await user.save();

    res.status(200).json({
      message: "Sucessfully leave space",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

exports.sendEmail = [
  upload.array("attachments"),
  async (req, res) => {
    try {
      const { to, subject, message } = req.body;

      if (!to || !subject || !message) {
        return res.status(400).json({
          message: "Please provide all fields",
          success: false,
        });
      }

      // Prepare attachments with correct path handling
      const attachments = req.files.map((file) => ({
        filename: file.originalname,
        content: file.buffer, // Use the file buffer directly
        contentType: file.mimetype, // Set the content type
      }));

      // Send the email
      await sendAdminEmail(to, subject, message, attachments);

      res.status(200).send({ message: "Email sent successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  },
];

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

exports.updateProfilePicture = [
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);

      if (!user) {
        return res
          .status(404)
          .json({ message: "User not found", success: false });
      }

      console.log(req.file);
      let profile;
      if (req.file) {
        const result = await uploadPic(req.file, "users");

        if (user.profile && user.profile.public_id) {
          await removeFromCloudinary(user.profile.public_id);
        }

        profile = {
          public_id: result.public_id,
          url: result.secure_url,
        };
      }

      if (profile) {
        user.profile = profile;
      }

      await user.save();

      // console.log(user);
      res
        .status(200)
        .json({ message: "Profile picture updated", success: true, user });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  },
];

exports.updateAdminProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, dob, phoneNumber } = req.body;

    const user = await User.findById(userId);
    user.name = name;
    user.email = email;
    user.dob = dob;
    user.phoneNumber = phoneNumber;
    await user.save();

    res.status(200).json({
      message: "Sucessfully update user",
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
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
