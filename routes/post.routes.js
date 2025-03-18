const express = require("express");
const router = express.Router();
const postController = require("../controllers/post.controller");

//Get all post based on user id
router.get("/:userId", postController.getPostBasedOnUserID);

//Get a single post
router.get("/singlePost/:postId", postController.getSinglePost);

//Get all post based on community id
router.get("/community/:communityId", postController.getPostBasedOnCommunity);

//Like post
router.post("/like/:postId", postController.likePost);

// Dislike post
router.post("/dislike/:postId", postController.dislikePost);

//Create a new post
router.post("/:userId", postController.createPost);

//Update post
router.put("/:userId/:postId", postController.updatePost);

//Delete post
router.delete("/:postId", postController.deletePost);

module.exports = router;
