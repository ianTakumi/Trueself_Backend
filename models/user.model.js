const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SocialAccountSchema = require("./socialAccount.model");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    accountId: {
      type: String,
      trim: true,
    },
    fname: {
      type: String,
      required: "First Name is required!",
      trim: true,
    },
    lname: {
      type: String,
      required: "Last Name is required!",
      trim: true,
    },
    dob: {
      type: Date,
    },
    email: {
      type: String,
      required: "Email is required!",
      unique: true,
    },
    phoneNumber: {
      type: String,
    },
    profile: {
      public_id: {
        type: String,
        required: true,
        default: "r9fgjtxvl5p5p1iaui43",
      },
      url: {
        type: String,
        required: true,
        default:
          "https://res.cloudinary.com/dwmw3iig6/image/upload/v1726394807/users/r9fgjtxvl5p5p1iaui43.jpg",
      },
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      default: "customer",
      enum: ["customer", "serviceCrew", "admin"],
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      trim: true,
      enum: ["activated", "deactivated", "unverified"],
      default: "unverified",
    },
    Accounts: [SocialAccountSchema],
    // Fcm token
    token: {
      type: String,
      default: null, // You can set a default value if needed
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
UserSchema.pre("save", async function (next) {
  const user = this;

  if (!user.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(ussocialer.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};

UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
