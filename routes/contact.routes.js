const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contact.controller");

// Get all contacts
router.get("/", contactController.getAllContact);

// Get a single contact
router.get("/:contactId", contactController.getSingleContact);

// Create a new contact
router.post("/", contactController.createContact);

// Update a contact
router.put("/:contactId", contactController.updateContact);

module.exports = router;
