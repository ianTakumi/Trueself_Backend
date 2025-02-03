const express = require("express");
const router = express.Router();
const moodEntryController = require("../controllers/moodEntry.controller");

// Get all mood entries based on user ID
router.get("/:userId", moodEntryController.getAllMoodEntriesBasedOnUserId);

// Get all mood per month based on userId
router.get(
  "/moodPerMonth/:userId",
  moodEntryController.getMoodPerMonthBasedOnUserId
);

// Get mood percentages based on user ID
router.get(
  "/moodPercentages/:userId",
  moodEntryController.getMoodPercentagesBasedOnUserId
);

// Create a new mood entry
router.post("/:userId", moodEntryController.createMoodEntry);

// Update a mood entry
router.put("/:moodEntryId", moodEntryController.updateMoodEntry);

// Delete a mood entry
router.delete("/:userId/:moodEntryId", moodEntryController.deleteMoodEntry);

module.exports = router;
