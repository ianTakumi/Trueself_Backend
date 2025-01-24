const Space = require("../models/space.model");

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

// Create space
exports.createSpace = async (req, res) => {
  try {
    const { name, description } = req.body;
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// Update space
exports.updateSpace = async (req, res) => {
  try {
    const { name, description } = req.body;
    const space = await Space.findOneAndUpdate(
      { _id: req.params.id },
      { name, description },
      { new: true }
    );

    res.json({
      message: "Successfully updated space",
      success: true,
      data: space,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// Delete space
exports.deleteSpace = async (req, res) => {
  try {
    const { spaceId } = req.params;
    const space = await Space.findByIdAndDelete(spaceId);
    res.json({
      message: "Successfully deleted space",
      success: true,
      data: space,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};
