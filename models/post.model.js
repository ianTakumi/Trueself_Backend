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
    communityId: {
      type: Schema.Types.ObjectId,
      ref: "Community",
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
    content: {
      type: String,
      required: function () {
        return this.type === "text";
      },
    },
    video: {
      public_id: {
        type: String,
        required: function () {
          return this.type === "video";
        },
      },
      url: {
        type: String,
        required: function () {
          return this.type === "video";
        },
      },
    },
    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    pollOptions: [
      {
        option: { type: String, required: true },
        votes: { type: Number, default: 0 },
      },
    ],
    linkUrl: {
      type: String,
      required: function () {
        return this.type === "link";
      },
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: Schema.Types.ObjectId, ref: "User" }],

    comments: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
        dislikes: [{ type: Schema.Types.ObjectId, ref: "User" }], // ✅ Add dislikes
        replies: [
          {
            user: {
              type: Schema.Types.ObjectId,
              ref: "User",
              required: true,
            },
            text: {
              type: String,
              required: true,
            },
            likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
            dislikes: [{ type: Schema.Types.ObjectId, ref: "User" }],
            createdAt: { type: Date, default: Date.now },
          },
        ],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isArchieved: {
      type: Boolean,
      default: false,
    },
  },
  { collection: "posts", timestamps: true }
);

const Post = mongoose.model("Post", PostSchema);
module.exports = Post;
