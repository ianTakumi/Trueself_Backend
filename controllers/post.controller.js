const Post = require("../models/post.model");
const upload = require("../middlewares/multer.middleware");
const {
  uploadPic,
  uploadVideo,
  removeFromCloudinary,
} = require("../configs/cloudinary.config");

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

// Get a single post
exports.getSinglePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId).populate("user");

    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found", success: false });
    }

    res.status(200).json({
      data: post,
      message: "Successfully fetch post",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message, success: false });
  }
};

// Get all post based on COMMUNITY ID
exports.getPostBasedOnCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const posts = await Post.find({
      communityId,
      isArchieved: false,
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
        likes: [userId],
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
    const { postId } = req.params;
    const { userId } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found", success: false });
    }

    // Check if user has already liked the post
    if (post.likes.includes(userId)) {
      return res
        .status(400)
        .json({ message: "You have already liked this post", success: false });
    }

    // Remove user from dislikes if they have previously disliked the post
    post.dislikes = post.dislikes.filter((id) => id.toString() !== userId);

    // Add user to likes
    post.likes.push(userId);

    await post.save();

    res.status(200).json({
      message: "Successfully liked post",
      success: true,
      likesCount: post.likes.length,
      dislikesCount: post.dislikes.length,
    });
  } catch (error) {
    console.log("Error liking post:", error);
    res.status(500).json({ message: error.message, success: false });
  }
};

// Dislike a post
exports.dislikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found", success: false });
    }

    // Remove from likes if the user has already liked the post
    post.likes = post.likes.filter((id) => id.toString() !== userId);

    // Check if the user has already disliked the post
    if (!post.dislikes.includes(userId)) {
      post.dislikes.push(userId);
    }

    await post.save();

    res.status(200).json({
      message: "Successfully disliked post",
      success: true,
      data: post,
    });
  } catch (error) {
    console.log("Error disliking post:", error);
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
    let post = await Post.findById(postId);

    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found", success: false });
    }

    // Archive the post first
    post.isArchieved = true;
    await post.save(); // Ensure update is saved

    if (post.type === "image" && post.images.length) {
      await Promise.all(
        post.images.map((image) => removeFromCloudinary(image.public_id))
      );
    } else if (post.type === "video" && post.video) {
      await removeFromCloudinary(post.video.public_id);
    }

    return res.status(200).json({
      message: "Successfully archived post",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: error.message, success: false });
  }
};
