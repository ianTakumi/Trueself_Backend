const Post = require("../models/post.model");

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
    });

    res.status(200).json({
      data: posts,
      message: "Successfully fetch posts",
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, type, editorData, video, images, pollOptions, linkUrl } =
      req.body;

    if (!title || !type) {
      return res
        .status(400)
        .json({ message: "Please fill in all fields", success: false });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// Like a post
exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
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
