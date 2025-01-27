const Space = require("../models/space.model");
const {
  uploadSpacePic,
  removeFromCloudinary,
} = require("../configs/cloudinary.config");
const upload = require("../middlewares/multer.middleware");

// Get all spaces
exports.getSpaces = async (req, res) => {
  try {
    const spaces = await Space.find();
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
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, description } = req.body;

      if (!name || !description) {
        return res
          .status(400)
          .json({ message: "Please fill all fields", success: false });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({ message: "Please upload an image", success: false });
      }

      const result = await uploadSpacePic(req.file, "spaces");

      const image = {
        public_id: result.public_id,
        url: result.secure_url,
      };

      const space = new Space({
        name,
        description,
        image,
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

// Update space
exports.updateSpace = [
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, description } = req.body;
      const { spaceId } = req.params;

      if (!name || !description) {
        return res
          .status(400)
          .json({ message: "Please fill all fields", success: false });
      }

      const space = await Space.findById(spaceId);
      if (!space) {
        return res
          .status(404)
          .json({ message: "Space not found", success: false });
      }

      let image;
      if (req.file) {
        const result = await uploadSpacePic(req.file, "spaces");

        if (space.image && space.image.public_id) {
          await removeFromCloudinary(space.image.public_id);
        }

        image = {
          public_id: result.public_id,
          url: result.secure_url,
        };
      }
      space.name = name;
      space.description = description;

      if (image) {
        space.image = image;
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

    if (space.image?.public_id) {
      await removeFromCloudinary(space.image.public_id);
    }

    res.json({
      message: "Successfully deleted space",
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};
