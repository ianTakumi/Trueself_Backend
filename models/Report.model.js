const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReportSchema = new Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reportedItem: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "reportType",
  },
  reportType: {
    type: String,
    enum: ["Post", "Comment", "User"],
    required: true,
  },
  reason: {
    type: String,
    enum: [
      "Spam",
      "Harassment",
      "Hate Speech",
      "Misinformation",
      "Violence",
      "Other",
    ],
    required: true,
  },
  details: {
    type: String,
    maxlength: 500,
  },
  status: {
    type: String,
    enum: ["Pending", "Reviewed", "Resolved"],
    default: "Pending",
  },
  adminResponse: {
    type: String,
    maxlength: 500,
  },
  actionTaken: {
    type: String,
    enum: ["None", "Post Deleted", "Comment Deleted", "User Deactivated"],
    default: "None",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Report", ReportSchema);
