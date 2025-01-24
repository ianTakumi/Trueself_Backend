const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define Schema for Post
const PostSchema = new Schema(
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
  { collection: "posts", timestamps: true }
);

const Post = mongoose.model("Post", PostSchema);
module.exports = Post;
