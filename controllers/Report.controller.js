const Report = require("../models/Report.model");
const User = require("../models/user.model");
const Admin = require("../configs/Firebase.config.js");

// Get all report
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find();

    res
      .status(200)
      .json({ message: "All reports", success: true, data: reports });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error, success: false });
  }
};

// Get a single report
exports.getSingleReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await Report.findById(reportId);

    if (!report) {
      return res
        .status(404)
        .json({ message: "Report not found", success: false });
    }

    res.status(200).json({ message: "Report", success: true, data: report });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error, success: false });
  }
};

// Get status distribution
exports.getStatusDistribution = async (req, res) => {
  try {
    const statusCounts = await Report.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json(statusCounts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// Create a report
exports.createReport = async (req, res) => {
  try {
    const { reporter, reportedItem, reportType, reason, details } = req.body;

    const report = new Report({
      reporter,
      reportedItem,
      reportType,
      reason,
      details,
    });

    await report.save();

    res.status(201).json({ message: "Report created", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// Update a report
exports.updateReport = async (req, res) => {
  try {
    const { reportId, status } = req.body;

    await Report.findByIdAndUpdate(reportId, { status }, { new: true });

    res.status(200).json({ message: "Report updated", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
