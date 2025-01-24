const Entry = require("../models/entry.model");

// Get alL entry by USER ID
exports.getAllEntriesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const entries = await Entry.find({ user: userId });
    res.status(200).json({
      message: "All entries fetched successfully",
      success: true,
      entries,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};

// Create a new entry
exports.createEntry = async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, content } = req.body;

    const entry = new Entry({
      user: userId,
      title,
      content,
    });

    const savedEntry = await entry.save();

    res.status(201).json({
      message: "Entry created successfully",
      success: true,
      data: savedEntry,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};

// Update an entry
exports.updateEntry = async (req, res) => {
  try {
    const { entryId } = req.params;
    const { title, content } = req.body;

    const updatedEntry = await Entry.findByIdAndUpdate(
      entryId,
      { title, content },
      { new: true }
    );

    res.status(200).json({
      message: "Entry updated successfully",
      success: true,
      data: updatedEntry,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};

// Delete an entry
exports.deleteEntry = async (req, res) => {
  try {
    const { entryId } = req.params;

    await Entry.findByIdAndDelete(entryId);

    res.status(200).json({
      message: "Entry deleted successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};
