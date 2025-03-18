const Comment = require("../models/Comment.Model");

// Get all comments
exports.findAll = async (req, res) => {
  try {
    const { postId } = req.params;

    await Comment.find({ post: postId });

    res.status(200).send({ message: "Comments found", data: comments });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
};

// Create comment
exports.create = async (req, res) => {
  try {
    const { userId, postId } = req.params;
    const { content } = req.body;

    if (!userId || postId) {
      res.status(400).json({ message: "User ID and Post ID are required" });
    }

    const comment = new Comment({
      user: userId,
      post: postId,
      content,
    });

    await comment.save();

    res.status(201).send({ message: "Comment created", data: comment });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
};

// Update comment
exports.update = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!commentId || !content) {
      res.status(400).json({ message: "Comment ID and content is required" });
    }

    await Comment.findByIdAndUpdate(commentId, { content }, { new: true });

    res.status(200).send({ message: "Comment updated" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
};

// Delete comment
exports.delete = async (req, res) => {
  try {
    const { commentId } = req.params;

    if (!commentId) {
      res.status(400).json({ message: "Comment ID is required" });
    }

    await Comment.findByIdAndDelete(commentId);

    res.status(200).send({ message: "Comment deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
};
