const User = require("../models/user.model");
const upload = require("../middlewares/multer.middleware");
const {
  removeFromCloudinary,
  uploadPic,
} = require("../configs/cloudinary.config");

// Register a new user
exports.register = [
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, email, password, phoneNumber, dob } = req.body;

      if (!name || !email || !password) {
        return res
          .status(400)
          .json({ message: "Please fill all fields", success: false });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({ message: "Please upload an image", success: false });
      }

      const result = await uploadPic(req.file, "users");

      const image = {
        public_id: result.public_id,
        url: result.secure_url,
      };

      const user = new User({
        name,
        email,
        password,
        phoneNumber,
        dob,
        image,
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
  },
];

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
    const user = await User.find({ email });
  } catch (error) {
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
