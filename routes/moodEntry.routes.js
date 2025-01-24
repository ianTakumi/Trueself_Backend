const express = require("express");
const router = express.Router();
const moodEntryController = require("../controllers/moodEntry.controller");

// Get all mood entries based on user ID
router.get("/:userId", moodEntryController.getAllMoodEntriesBasedOnUserId);

// Create a new mood entry
router.post("/:userId", moodEntryController.createMoodEntry);

// Update a mood entry
router.put("/:moodEntryId", moodEntryController.updateMoodEntry);

// Delete a mood entry
router.delete("/:userId/:moodEntryId", moodEntryController.deleteMoodEntry);

module.exports = router;
