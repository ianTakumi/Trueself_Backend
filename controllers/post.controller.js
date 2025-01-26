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
    const { title, type } = req.body;
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
