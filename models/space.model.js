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
    image: {
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
