const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contact.controller");

// Get all contacts
router.get("/", contactController.getAllContact);

// Get status distribution
router.get("/status-distribution", contactController.getStatusDistribution);

// Get monthly engagements
router.get("/monthly-engagements", contactController.getMonthlyEngagements);

// Get a single contact
router.get("/:contactId", contactController.getSingleContact);

// Create a new contact
router.post("/", contactController.createContact);

// Update a contact
router.put("/:contactId", contactController.updateContact);

module.exports = router;
