const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const JournalEntrySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, collection: "journal-entries" }
);

JournalEntrySchema.index({ title: 1 });

const JournalEntry = mongoose.model("JournalEntry", JournalEntrySchema);

module.exports = JournalEntry;
