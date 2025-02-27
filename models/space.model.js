const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define Schema for Space
const SpaceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide the creator of the space"],
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Suspended", "Archived"],
      default: "Pending",
    },
    banner: {
      public_id: {
        type: String,
        required: true,
        trim: true,
      },
      url: {
        type: String,
        required: true,
        trim: true,
      },
    },
    profile: {
      public_id: {
        type: String,
        required: true,
        trim: true,
      },
      url: {
        type: String,
        required: true,
        trim: true,
      },
    },
  },
  { collection: "spaces", timestamps: true }
);

const Space = mongoose.model("Space", SpaceSchema);
module.exports = Space;
