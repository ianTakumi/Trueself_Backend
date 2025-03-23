const express = require("express");
const router = express.Router();
const reportController = require("../controllers/Report.controller");

// Get all reports
router.get("/", reportController.getAllReports);

// Get a single report
router.get("/:reportId", reportController.getSingleReport);

// Get status distribution
router.get("/status-distribution", reportController.getStatusDistribution);

// Create a new report
router.post("/", reportController.createReport);

// Update a report
router.put("/:reportId", reportController.updateReport);

module.exports = router;
