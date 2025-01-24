const MoodEntry = require("../models/moodEntry.model");

// Get all mood entries based on user ID
exports.getAllMoodEntriesBasedOnUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const moodEntries = await MoodEntry.find({ user: userId });
    res.status(200).json({
      moodEntries,
      success: true,
      message: "Successfully fetch mood entries",
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// Create a new mood entry
exports.createMoodEntry = async (req, res) => {
  try {
    const { userId } = req.params;
    const { mood, note } = req.body;

    if (!mood || !note) {
      return res.status(400).json({
        message: "Please provide a mood and note",
        success: false,
      });
    }

    const newMoodEntry = new MoodEntry({
      user: userId,
      mood,
      note,
    });

    await newMoodEntry.save();
    res.status(201).json({
      moodEntry: newMoodEntry,
      success: true,
      message: "Successfully created a new mood entry",
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};
// Update a mood entry
exports.updateMoodEntry = async (req, res) => {
  try {
    const { moodEntryId } = req.params;
    const { mood, note } = req.body;

    if (!mood || !note) {
      return res.status(400).json({
        message: "Please provide a mood and note",
        success: false,
      });
    }

    const updatedMoodEntry = await MoodEntry.findByIdAndUpdate(
      moodEntryId,
      { mood, note },
      { new: true }
    );

    if (!updatedMoodEntry) {
      return res.status(404).json({
        success: false,
        message: "Mood entry not found",
      });
    }

    res.status(200).json({
      moodEntry: updatedMoodEntry,
      success: true,
      message: "Successfully updated the mood entry",
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// Delete a mood entry
exports.deleteMoodEntry = async (req, res) => {
  try {
    const { moodEntryId, userId } = req.params;
    console.log(req.params);
    const moodEntry = await MoodEntry.findById(moodEntryId);

    if (!moodEntry) {
      return res.status(404).json({
        success: false,
        message: "Mood entry not found",
      });
    }

    if (moodEntry.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this entry",
      });
    }

    await moodEntry.deleteOne();

    res.status(200).json({
      success: true,
      message: "Successfully deleted the mood entry",
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};
