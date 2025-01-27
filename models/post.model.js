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
    type: {
      type: String,
      enum: ["text", "video", "image", "poll", "link"],
      required: true,
    },
    editorData: {
      type: Object, // Store data from Editor.js for text posts
      required: function () {
        return this.type === "text";
      },
    },
    video: {
      public_id: {
        type: String, // Cloudinary public ID for the video
        required: function () {
          return this.type === "video";
        },
      },
      url: {
        type: String, // Cloudinary URL for the video
        required: function () {
          return this.type === "video";
        },
      },
    },
    images: [
      {
        public_id: {
          type: String, // Cloudinary public ID for the image
          required: true,
        },
        url: {
          type: String, // Cloudinary URL for the image
          required: true,
        },
      },
    ],
    pollOptions: [
      {
        option: { type: String, required: true }, // Poll option text
        votes: { type: Number, default: 0 }, // Vote count for the option
      },
    ],
    linkUrl: {
      type: String, // URL for the link post
      required: function () {
        return this.type === "link";
      },
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    dislikes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { collection: "posts", timestamps: true }
);

const Post = mongoose.model("Post", PostSchema);
module.exports = Post;
