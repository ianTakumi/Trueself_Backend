const Post = require("../models/post.model");
const upload = require("../middlewares/multer.middleware");
const { uploadPic, uploadVideo } = require("../configs/cloudinary.config");

// Get all post based on USER ID
exports.getPostBasedOnUserID = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId });
    res.status(200).json({
      data: posts,
      message: "Successfully fetch posts",
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

exports.getPostBasedOnCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const posts = await Post.find({
      communityId,
    }).populate("user");

    res.status(200).json({
      data: posts,
      message: "Successfully fetch posts",
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// Create a post
exports.createPost = [
  upload.array("media"),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { title, type, pollOptions, linkUrl, content, id } = req.body;

      if (!id) {
        return res
          .status(400)
          .json({ message: "Community ID is required", success: false });
      }

      // Validation for different post types
      if (type === "text" && (!title || !content)) {
        return res
          .status(400)
          .json({ message: "Title and content are required", success: false });
      }
      if (type === "video" && !req.files.length) {
        return res
          .status(400)
          .json({ message: "Video file is required", success: false });
      }
      if (type === "image" && (!req.files || req.files.length === 0)) {
        return res
          .status(400)
          .json({ message: "At least one image is required", success: false });
      }
      if (type === "poll" && (!pollOptions || pollOptions.length < 2)) {
        return res.status(400).json({
          message: "At least two poll options are required",
          success: false,
        });
      }
      if (type === "url" && !linkUrl) {
        return res
          .status(400)
          .json({ message: "A valid URL is required", success: false });
      }

      let images = [];
      let video = null;

      // Upload images if post type is image
      if (type === "image" && req.files.length) {
        images = await Promise.all(
          req.files.map((file) => uploadPic(file, "postImages"))
        );
      }

      // Upload video if post type is video
      if (type === "video" && req.files.length) {
        video = await uploadVideo(req.files[0], "postVideos");
      }

      console.log("Video:", video);

      // Create the post object
      const post = new Post({
        communityId: id,
        user: userId,
        title: title,
        type,
        content: type === "text" ? content : undefined,
        video: type === "video" ? video : undefined,
        images: type === "image" ? images : undefined,
        pollOptions: type === "poll" ? pollOptions : undefined,
        linkUrl: type === "url" ? linkUrl : undefined,
      });

      await post.save();

      return res.status(201).json({
        message: "Successfully created post",
        success: true,
        data: post,
      });
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: error.message, success: false });
    }
  },
];

// Like a post
exports.likePost = async (req, res) => {
  try {
    const { postId, userId } = req.params;
    const post = await Post.findById(postId);

    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found", success: false });
    }

    post.likes.push(req.user._id);
    await post.save();

    res.status(200).json({
      message: "Successfully liked post",
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// Dislike a post
exports.dislikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found", success: false });
    }

    const index = post.likes.indexOf(req.user._id);
    if (index > -1) {
      post.likes.splice(index, 1);
    }

    await post.save();

    res.status(200).json({
      message: "Successfully disliked post",
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// Update post
exports.updatePost = async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, content } = req.body;
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found", success: false });
    }

    if (post.type === "video") {
    }
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};
