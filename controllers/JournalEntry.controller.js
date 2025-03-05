const JournalEntry = require("../models/JournalEntry.model");

// Get all journal entries based on user Id
exports.getAllJournalEntries = async (req, res) => {
  try {
    const { userId } = req.params;
    const journalEntries = await JournalEntry.find({ user: userId }).sort({
      createdAt: 1,
    });
    res.status(200).json({
      message: "All journal entries",
      success: true,
      data: journalEntries,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error, success: false });
  }
};

// Get a single journal entry
exports.getSingleJournalEntry = async (req, res) => {
  try {
    const { entryId } = req.params;

    const entry = await JournalEntry.findById(entryId);

    if (!entry) {
      return res
        .status(404)
        .json({ message: "Entry not found", success: false });
    }

    res
      .status(200)
      .json({ message: "Entry found", success: true, data: entry });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error, success: false });
  }
};

// Create a new journal entry
exports.createJournalEntry = async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, content } = req.body;

    const newEntry = new JournalEntry({
      user: userId,
      title,
      content,
    });

    const savedEntry = await newEntry.save();

    res
      .status(201)
      .json({ message: "Entry created", success: true, data: savedEntry });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error, success: false });
  }
};
// Update an entry
exports.updateJournalEntry = async (req, res) => {
  try {
    const { entryId } = req.params;
    const { title, content } = req.body;

    const entry = await JournalEntry.findById(entryId);

    if (!entry) {
      return res
        .status(404)
        .json({ message: "Entry not found", success: false });
    }

    const updatedEntry = await JournalEntry.findByIdAndUpdate(
      entryId,
      { title, content },
      {
        new: true,
        runValidators: true,
      }
    );

    res
      .status(200)
      .json({ message: "Entry updated", success: true, data: updatedEntry });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error, success: false });
  }
};
// Delete an entry
exports.deleteJournalEntry = async (req, res) => {
  try {
    const { entryId } = req.params;

    const entry = await JournalEntry.findById(entryId);
    if (!entry) {
      return res
        .status(404)
        .json({ message: "Entry not found", success: false });
    }

    await JournalEntry.findByIdAndDelete(entryId);

    res
      .status(200)
      .json({ message: "Entry deleted", success: true, data: entry });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error, success: false });
  }
};
