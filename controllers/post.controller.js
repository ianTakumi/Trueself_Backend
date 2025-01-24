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

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, content } = req.body;
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
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};
