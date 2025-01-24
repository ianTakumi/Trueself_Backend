const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EntrySchema = new Schema(
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
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true, collection: "entries" }
);

const Entry = mongoose.model("Entry", EntrySchema);
module.exports = Entry;
