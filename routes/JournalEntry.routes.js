const JournalEntryController = require("../controllers/JournalEntry.controller");
const express = require("express");
const router = express.Router();

// Get all journal entries
router.get("/:userId", JournalEntryController.getAllJournalEntries);

// Get a single journal entry
router.get("/:userId/:entryId", JournalEntryController.getSingleJournalEntry);

// Create a new journal entry
router.post("/:userId", JournalEntryController.createJournalEntry);

// Update a journal entry
router.put("/:entryId", JournalEntryController.updateJournalEntry);

// Delete a journal entry
router.delete("/:entryId", JournalEntryController.deleteJournalEntry);

module.exports = router;
