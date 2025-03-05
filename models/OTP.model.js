const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OTPSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required!"],
      trim: true,
      maxlength: 255,
      match: [/\S+@\S+\.\S+/, "Email format is invalid"],
    },
    code: {
      type: String,
      required: [true, "Code is required!"],
    },
    expiresAt: {
      type: Date,
      required: [true, "Expires At is required"],
    },
  },
  { timestamps: true, collection: "OTPs" }
);

OTPSchema.index({ email: 1 });

const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;
