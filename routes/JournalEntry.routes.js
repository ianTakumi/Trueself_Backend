const JournalEntryController = require("../controllers/JournalEntry.controller");
const express = require("express");
const router = express.Router();

// Get a single journal entry
router.get(
  "/single/:userId/:entryId",
  JournalEntryController.getSingleJournalEntry
);

// Get user streak
router.get("/streak/:userId", JournalEntryController.getJournalStreak);

// Get journal entry per month
router.get(
  "/perMonth/:userId",
  JournalEntryController.getJournalEntriesPerMonth
);

// Get journal entry per month pie chart
router.get(
  "/perMonthPie/:userId",
  JournalEntryController.getJournalEntriesPerMonthPieChart
);

// Get journal entry per month line chart
router.get(
  `/perMonthAdmin`,
  JournalEntryController.getJournalEntriesPerMonthAdmin
);

// Get journal entry per month pie chart admin
router.get(
  `/perMonthPieAdmin`,
  JournalEntryController.getAllJournalEntriesPerMonthPieChartAdmin
);

// Get all journal entries
router.get("/:userId", JournalEntryController.getAllJournalEntries);

// Create a new journal entry
router.post("/:userId", JournalEntryController.createJournalEntry);

// Update a journal entry
router.put("/:entryId", JournalEntryController.updateJournalEntry);

// Delete a journal entry
router.delete("/:entryId", JournalEntryController.deleteJournalEntry);

module.exports = router;
