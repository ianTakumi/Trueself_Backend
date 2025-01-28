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
    name: {
      type: String,
      required: [true, "Please enter your name"],
      trim: true,
    },
    dob: {
      type: Date,
      required: [true, "Please enter your date of birth"],
    },
    email: {
      type: String,
      required: [true, "Email is required!"],
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required!"],
    },
    sexualOrientation: {
      type: String,
      required: [true, "Please enter your sexual orientation"],
      enum: [
        "Lesbian",
        "Gay",
        "Bisexual",
        "Pansexual",
        "Asexual",
        "Aromantic",
        "Demisexual",
        "Demiromantic",
        "Heterosexual",
        "Homosexual",
        "Queer",
        "Questioning",
        "Polysexual",
        "Androsexual",
        "Gynosexual",
        "Skoliosexual",
        "Omnisexual",
        "Graysexual",
        "Grayromantic",
        "Allosexual",
      ],
    },
    genderIdentity: {
      type: String,
      required: [true, "Please enter your gender identity"],
      enum: [
        "Cisgender",
        "Transgender",
        "Nonbinary",
        "Genderqueer",
        "Agender",
        "Bigender",
        "Demiboy",
        "Demigirl",
        "Two-spirit",
        "Androgynous",
        "Pangender",
        "Xenogender",
        "Questioning",
        "Third Gender",
        "Intersex",
      ],
    },
    pronouns: {
      type: String,
      required: [true, "Please enter your pronouns"],
      enum: [
        "He/Him/His",
        "She/Her/Hers",
        "They/Them/Theirs",
        "Ze/Zir/Zirs",
        "Xe/Xem/Xyrs",
        "Ve/Vir/Vis",
        "E/Em/Eirs",
        "Ey/Em/Eir (Spivak Pronouns)",
        "Other",
        "Prefer not to say",
      ],
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
      default: "user",
      enum: ["user", "admin"],
    },
    spaces: [
      {
        type: Schema.Types.ObjectId,
        ref: "Space",
      },
    ],
    status: {
      type: String,
      required: [true, "Status is required"],
      trim: true,
      enum: ["activated", "deactivated", "unverified"],
      default: "unverified",
    },
    socialAccounts: [SocialAccountSchema],
    // Fcm token
    token: {
      type: String,
      default: null, // You can set a default value if needed
    },
    password: {
      type: String,
      required: [true, "Password is required"],
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
    user.password = await bcrypt.hash(user.password, salt);
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
