const Comment = require("../models/Comment.Model");

// Get all comments
exports.findAll = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId }).populate("user");

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
    console.log(req.params);

    if (!userId || !postId) {
      return res
        .status(400)
        .json({ message: "User ID and Post ID are required" });
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

// Create reply
exports.createReply = async (req, res) => {
  try {
    const { userId, postId, parentCommentId } = req.params;
    const { content } = req.body;

    if (!userId || !postId || !parentCommentId) {
      return res.status(400).json({
        message: "User ID, Post ID, and Parent Comment ID are required",
      });
    }

    const comment = new Comment({
      user: userId,
      post: postId,
      parentComment: parentCommentId,
      content,
    });

    await comment.save();

    res.status(201).send({ message: "Reply created", data: comment });
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
      return res.status(400).json({ message: "Comment ID is required" });
    }

    // Recursively delete all child comments
    const deleteCommentAndChildren = async (commentId) => {
      // Find all child comments
      const childComments = await Comment.find({ parentComment: commentId });

      for (const child of childComments) {
        await deleteCommentAndChildren(child._id); // Recursive call for nested children
      }

      // Delete the parent comment
      await Comment.findByIdAndDelete(commentId);
    };

    await deleteCommentAndChildren(commentId);

    res.status(200).json({ message: "Comment and its replies deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
