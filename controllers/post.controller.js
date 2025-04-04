const Post = require("../models/post.model");
const upload = require("../middlewares/multer.middleware");
const {
  uploadPic,
  uploadVideo,
  removeFromCloudinary,
} = require("../configs/cloudinary.config");
const Space = require("../models/space.model");
const User = require("../models/user.model");
const Admin = require("../configs/Firebase.config.js");
const Comment = require("../models/Comment.Model");

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    // Get all posts where isArchieved is false
    const posts = await Post.find({ isArchieved: false })
      .populate({
        path: "user",
        select: "name profile",
      })
      .populate("communityId", "name _id")
      .sort({ createdAt: -1 })
      .lean();

    // Get post IDs
    const postIds = posts.map((post) => post._id);

    // Get comment count for each post
    const commentCounts = await Comment.aggregate([
      { $match: { post: { $in: postIds } } }, // Match comments related to these posts
      { $group: { _id: "$post", count: { $sum: 1 } } }, // Count comments per post
    ]);

    // Convert comment count array into a map
    const commentCountMap = {};
    commentCounts.forEach(({ _id, count }) => {
      commentCountMap[_id.toString()] = count;
    });

    // Attach comment count and ensure user profile contains only the URL
    const postsWithCommentCount = posts.map((post) => ({
      ...post,
      commentCount: commentCountMap[post._id.toString()] || 0,
      user: post.user
        ? {
            _id: post.user._id,
            name: post.user.name,
            profileUrl: post.user.profile?.url || null, // Extract profile URL
          }
        : null, // If no user, set to null
    }));

    res.status(200).json({ success: true, posts: postsWithCommentCount });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: error.message, success: false });
  }
};

// Get all post based on USER ID
exports.getPostBasedOnUserID = async (req, res) => {
  const { userId } = req.params;
  try {
    const posts = await Post.find({
      user: userId,
      $or: [{ isArchieved: false }, { isArchieved: { $exists: false } }],
    })
      .populate("user communityId")
      .lean();

    // Fetch comment count for each post
    const postIds = posts.map((post) => post._id);
    const commentsCount = await Comment.aggregate([
      { $match: { post: { $in: postIds } } },
      { $group: { _id: "$post", count: { $sum: 1 } } },
    ]);

    // Convert comment count array into a map for quick lookup
    const commentsCountMap = commentsCount.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Attach comment count to each post
    const postsWithCommentCount = posts.map((post) => ({
      ...post,
      commentCount: commentsCountMap[post._id] || 0,
    }));

    res.status(200).json({
      data: postsWithCommentCount,
      message: "Successfully fetched posts",
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
    const post = await Post.findById(postId).populate("user communityId");

    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found", success: false });
    }

    const commentCount = await Comment.countDocuments({ postId });

    res.status(200).json({
      data: {
        ...post.toObject(), // Convert Mongoose document to plain object
        commentCount, // Add the comment count inside the data object
      },
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

    // Fetch posts for the given community
    const posts = await Post.find({
      communityId,
      isArchieved: false,
    }).populate("user");

    // Fetch comment counts for each post
    const postsWithCommentCount = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await Comment.countDocuments({ post: post._id });
        return {
          ...post.toObject(),
          commentCount,
        };
      })
    );

    res.status(200).json({
      data: postsWithCommentCount,
      message: "Successfully fetched posts with comment count",
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

      const space = await Space.findById(id);

      if (space.members) {
        const members = await User.find({ _id: { $in: space.members } });
        const fcmMessages = members
          .filter((member) => member.token && member._id.toString() !== userId)
          .map((member) => ({
            notification: {
              title: `New post in ${space.name}`,
              body: `${post.title}`,
            },
            token: member.token,
          }));

        try {
          console.log("🟢 Before sending FCM:", new Date().toISOString());
          await Promise.all(
            fcmMessages.map((message) => Admin.messaging().send(message))
          );
          console.log("🔵 After sending FCM:", new Date().toISOString());
        } catch (error) {
          console.log(error);
        }
      }

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

    const owner = await User.findById(post.user);
    const userLiker = await User.findById(userId);
    if (owner.token && userLiker.token) {
      const fcmMessage = {
        notification: {
          title: `New like on your post`,
          body: `${userLiker.name} liked your post`,
        },
        token: owner.token,
      };

      try {
        console.log("🟢 Before sending FCM:", new Date().toISOString());
        await Admin.messaging().send(fcmMessage);
        console.log("🔵 After sending FCM:", new Date().toISOString());
      } catch (error) {
        console.log(error);
      }
    }
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

// Like post mobile
exports.likePostMobile = async (req, res) => {
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

    const owner = await User.findById(post.user);
    const userLiker = await User.findById(userId);

    if (owner.token && userLiker.token) {
      console.log("Sending FCM message");
      const fcmMessage = {
        notification: {
          title: `New dislike on your post`,
          body: `${userLiker.name} disliked your post`,
        },
        token: owner.token,
      };

      try {
        await Admin.messaging().send(fcmMessage);
      } catch (error) {
        console.log(error);
      }
    }
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

// Dislike post mobile
exports.dislikePostMobile = async (req, res) => {
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
