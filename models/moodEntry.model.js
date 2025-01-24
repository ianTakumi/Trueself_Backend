const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MoodEntrySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mood: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true, collection: "moodEntries" }
);

const MoodEntry = mongoose.model("MoodEntry", MoodEntrySchema);
module.exports = MoodEntry;
