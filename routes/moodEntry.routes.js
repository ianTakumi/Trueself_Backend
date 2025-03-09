const express = require("express");
const router = express.Router();
const moodEntryController = require("../controllers/moodEntry.controller");

// Get mood stats per week for admin
router.get("/moodStatsByWeek", moodEntryController.getMoodStatsByMonthWeek);

// Get mood per month based on userId (Move this above)
router.get(
  "/moodPerMonth/:userId",
  moodEntryController.getMoodPerMonthBasedOnUserId
);

// Get mood percentages based on user ID
router.get(
  "/moodPercentages/:userId",
  moodEntryController.getMoodPercentagesBasedOnUserId
);

// Get mood per day
router.get(
  "/moodPerDay/:userId",
  moodEntryController.getMostFrequentMoodPerDay
);

// Get single mood entry based on user ID (Keep this above)
router.get(
  "/:moodEntryId/:userId",
  moodEntryController.getSingleMoodBasedOnUserId
);

// Get all mood entries based on user ID (Move this to the last)
router.get("/:userId", moodEntryController.getAllMoodEntriesBasedOnUserId);

// Create a new mood entry
router.post("/:userId", moodEntryController.createMoodEntry);

// Update a mood entry
router.put("/:moodEntryId", moodEntryController.updateMoodEntry);

// Delete a mood entry
router.delete("/:userId/:moodEntryId", moodEntryController.deleteMoodEntry);

module.exports = router;
