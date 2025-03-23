const CommentController = require("../controllers/Comment.Controller");
const express = require("express");
const router = express.Router();

// Get all comments
router.get("/:postId", CommentController.findAll);

// Create comment
router.post("/:userId/:postId", CommentController.create);

// Create reply
router.post("/:userId/:postId/:parentCommentId", CommentController.createReply);

// Update comment
router.put("/:commentId", CommentController.update);

// Delete comment
router.delete("/:commentId", CommentController.delete);

module.exports = router;
