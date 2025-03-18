const Space = require("../models/space.model");
const {
  uploadSpacePic,
  removeFromCloudinary,
} = require("../configs/cloudinary.config");
const upload = require("../middlewares/multer.middleware");
const mongoose = require("mongoose");

// Get top 3 spaces
exports.getTopSpaces = async (req, res) => {
  try {
    const topSpaces = await Space.find().sort({ members: -1 }).limit(3);

    res.status(200).json({
      success: true,
      data: topSpaces,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// Get other spaces excluding specific IDs
exports.getOtherSpaces = async (req, res) => {
  try {
    const excludedIds = [
      "67c833d69fdac0bf83ddc589",
      "67c83855e670d3676c687169",
      "67c839d7e670d3676c68717b",
    ].map((id) => new mongoose.Types.ObjectId(id));

    const otherSpaces = await Space.find({ _id: { $nin: excludedIds } }).sort({
      members: -1,
    });

    res.status(200).json({
      success: true,
      data: otherSpaces,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// Get top 5 spaces
exports.getTop5Spaces = async (req, res) => {
  try {
    const top5Spaces = await Space.find()
      .sort({ members: -1 })
      .limit(5)
      .select("name members");

    const formattedData = top5Spaces.map((space) => ({
      name: space.name,
      memberCount: space.members.length, // Get the count of members
    }));

    res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error("Error fetching top spaces:", error);
    res.status(500).json({ message: error.message, success: false });
  }
};

// Get all spaces
exports.getSpaces = async (req, res) => {
  try {
    const spaces = await Space.find().populate("createdBy");
    res.json({
      message: "Successfully fetch spaces",
      success: true,
      data: spaces,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// Get space count
exports.getSpaceCount = async (req, res) => {
  try {
    const count = await Space.countDocuments();

    res.json({
      message: "Successfully fetch space count",
      success: true,
      count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// Get space by id
exports.getSpaceById = async (req, res) => {
  try {
    const { spaceId } = req.params;
    const space = await Space.findById(spaceId);
    if (!space) {
      return res.status(404).json({
        message: "Space not found",
        success: false,
      });
    }
    res.json({
      message: "Successfully fetch space",
      success: true,
      data: space,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

exports.createSpace = [
  upload.fields([
    { name: "profile", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { name, description, mission, rules } = req.body;
      const { userId } = req.params;
      const profileImageObj = req.files["profile"]
        ? req.files["profile"][0]
        : null;
      const bannerImageObj = req.files["banner"]
        ? req.files["banner"][0]
        : null;

      if (!name || !description || !mission || !rules) {
        return res
          .status(400)
          .json({ message: "Please fill all fields", success: false });
      }

      if (!profileImageObj || !bannerImageObj) {
        return res
          .status(400)
          .json({ message: "Both profile and banner images are required." });
      }

      const profileResult = await uploadSpacePic(profileImageObj, "spaces");
      const bannerResult = await uploadSpacePic(bannerImageObj, "spaces");

      const banner = {
        public_id: bannerResult.public_id,
        url: bannerResult.secure_url,
      };

      const profile = {
        public_id: profileResult.public_id,
        url: profileResult.secure_url,
      };

      const space = new Space({
        name,
        description,
        banner,
        mission,
        rules,
        profile,
        createdBy: userId,
        status: "Approved",
      });

      const savedSpace = await space.save();
      res.status(201).json({
        message: "Successfully created space",
        success: true,
        data: savedSpace,
      });
    } catch (error) {
      res.status(500).json({ message: error.message, success: false });
    }
  },
];

exports.joinSpace = async (req, res) => {
  try {
    const { spaceId, userId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(spaceId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid spaceId or userId", success: false });
    }

    const space = await Space.findById(spaceId);

    if (!space) {
      return res
        .status(404)
        .json({ message: "Space not found", success: false });
    }

    const restrictedStatuses = ["Rejected", "Suspended", "Archived"];
    if (restrictedStatuses.includes(space.status)) {
      return res.status(403).json({
        message: `Cannot join a ${space.status} space`,
        success: false,
      });
    }

    if (space.members.includes(userId)) {
      return res
        .status(400)
        .json({ message: "User is already a member", success: false });
    }

    space.members.push(userId);
    await space.save();

    res.json({
      message: "Successfully joined space",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message, success: false });
  }
};

// Update space
exports.updateSpace = [
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { name, description } = req.body;
      const { spaceId, userId } = req.params;
      const profileImageObj = req.files["profile"]
        ? req.files["profile"][0]
        : null;
      const bannerImageObj = req.files["banner"]
        ? req.files["banner"][0]
        : null;
      let profile;
      let banner;

      if (!name || !description) {
        return res
          .status(400)
          .json({ message: "Please fill all fields", success: false });
      }

      const space = await Space.findById(spaceId);

      space.name = name;
      space.description = description;

      if (!space) {
        return res
          .status(404)
          .json({ message: "Space not found", success: false });
      }

      if (profileImageObj) {
        const profileResult = await uploadSpacePic(profileImageObj, "spaces");

        const profile = {
          public_id: profileResult.public_id,
          url: profileResult.secure_url,
        };

        if (space.profile && space.profile.public_id) {
          await removeFromCloudinary(space.profile.public_id);
        }

        space.profile = profile;
      }

      if (bannerImageObj) {
        const bannerResult = await uploadSpacePic(bannerImageObj, "spaces");

        banner = {
          public_id: bannerResult.public_id,
          url: bannerResult.secure_url,
        };

        if (space.banner && space.banner.public_id) {
          await removeFromCloudinary(space.banner.public_id);
        }

        space.banner = banner;
      }

      await space.save();

      res.status(200).json({
        message: "Successfully updated space",
        success: true,
        data: space,
      });
    } catch (error) {
      res.status(500).json({ message: error.message, success: false });
    }
  },
];

// Delete space
exports.deleteSpace = async (req, res) => {
  try {
    const { spaceId } = req.params;
    const space = await Space.findByIdAndDelete(spaceId);

    // Check if space exists
    if (!space) {
      return res.status(404).json({
        message: "Space not found",
        success: false,
      });
    }

    if (space.profile?.public_id) {
      await removeFromCloudinary(space.image.public_id);
    }

    if (space.banner?.public_id) {
      await removeFromCloudinary(space.banner.public_id);
    }

    res.json({
      message: "Successfully deleted space",
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};
