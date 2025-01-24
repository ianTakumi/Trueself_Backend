const express = require("express");
const router = express.Router();
const entryController = require("../controllers/entry.controller");

// Get all entry based on User ID
router.get("/:userId", entryController.getAllEntriesByUserId);

// Create a new entry
router.post("/", entryController.createEntry);

// Update an entry
router.put("/:entryId", entryController.updateEntry);

// Delete an entry
router.delete("/:entryId", entryController.deleteEntry);

module.exports = router;
