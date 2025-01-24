const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MoodSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true, collection: "moods" }
);

const Mood = mongoose.model("Mood", MoodSchema);
module.exports = Mood;
