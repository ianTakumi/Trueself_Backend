const JournalEntry = require("../models/JournalEntry.model");
const mongoose = require("mongoose");

// Get all journal entries based on user Id
exports.getAllJournalEntries = async (req, res) => {
  try {
    const { userId } = req.params;
    const journalEntries = await JournalEntry.find({ user: userId }).sort({
      createdAt: 1,
    });
    res.status(200).json({
      message: "All journal entries",
      success: true,
      data: journalEntries,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error, success: false });
  }
};

// Get a single journal entry
exports.getSingleJournalEntry = async (req, res) => {
  try {
    const { entryId } = req.params;
    console.log(req.params);
    const entry = await JournalEntry.findById(entryId);

    if (!entry) {
      return res
        .status(404)
        .json({ message: "Entry not found", success: false });
    }

    res
      .status(200)
      .json({ message: "Entry found", success: true, data: entry });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error, success: false });
  }
};

// Create a new journal entry
exports.createJournalEntry = async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, content } = req.body;

    const newEntry = new JournalEntry({
      user: userId,
      title,
      content,
    });

    const savedEntry = await newEntry.save();
    // console.log(savedEntry);
    res
      .status(201)
      .json({ message: "Entry created", success: true, data: savedEntry });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error, success: false });
  }
};
// Update an entry
exports.updateJournalEntry = async (req, res) => {
  try {
    const { entryId } = req.params;
    const { title, content } = req.body;

    const entry = await JournalEntry.findById(entryId);

    if (!entry) {
      return res
        .status(404)
        .json({ message: "Entry not found", success: false });
    }

    const updatedEntry = await JournalEntry.findByIdAndUpdate(
      entryId,
      { title, content },
      {
        new: true,
        runValidators: true,
      }
    );

    res
      .status(200)
      .json({ message: "Entry updated", success: true, data: updatedEntry });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error, success: false });
  }
};
// Delete an entry
exports.deleteJournalEntry = async (req, res) => {
  try {
    const { entryId } = req.params;

    const entry = await JournalEntry.findById(entryId);
    if (!entry) {
      return res
        .status(404)
        .json({ message: "Entry not found", success: false });
    }

    await JournalEntry.findByIdAndDelete(entryId);

    res
      .status(200)
      .json({ message: "Entry deleted", success: true, data: entry });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error, success: false });
  }
};

const calculateJournalStreak = async (userId) => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Move to Sunday
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Move to Saturday
  endOfWeek.setHours(23, 59, 59, 999);

  // Fetch journal entries for this week
  const journalEntries = await JournalEntry.find({
    user: userId,
    createdAt: { $gte: startOfWeek, $lte: endOfWeek },
  }).sort({ createdAt: 1 });

  console.log("Journal Entries:", journalEntries.map((e) => e.createdAt.toISOString()));

  // Create a boolean array for the week (Sunday to Saturday)
  let streakArray = new Array(7).fill(false);

  // Store unique days with journal entries
  let uniqueDays = new Set();
  for (const entry of journalEntries) {
    const entryDate = new Date(entry.createdAt);
    entryDate.setHours(0, 0, 0, 0);
    uniqueDays.add(entryDate.getTime());
  }

  // Populate streak array
  for (let i = 0; i < 7; i++) {
    let currentDate = new Date(startOfWeek);
    currentDate.setDate(startOfWeek.getDate() + i);
    currentDate.setHours(0, 0, 0, 0);

    if (uniqueDays.has(currentDate.getTime())) {
      streakArray[i] = true;
    }
  }

  console.log("🔥 Streak Array:", streakArray);
  return streakArray;
};

exports.getJournalStreak = async (req, res) => {
  try {
    const { userId } = req.params;
    const streakArray = await calculateJournalStreak(userId);
    
    res.status(200).json({
      message: "Successfully fetched journal streak",
      success: true,
      streakArray,
    });
  } catch (err) {
    console.error("Error fetching journal streak:", err);
    res.status(500).json({
      message: "Error fetching journal streak",
      success: false,
    });
  }
};


// Get journal entries per month
exports.getJournalEntriesPerMonth = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
        success: false,
      });
    }

    const journalEntries = await JournalEntry.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: { $month: "$createdAt" }, // Group by month
          count: { $sum: 1 }, // Count number of entries per month
        },
      },
      { $sort: { _id: 1 } }, // Sort by month (1 = January, 12 = December)
    ]);

    // Convert month numbers to names
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const formattedEntries = journalEntries.map((entry) => ({
      month: months[entry._id - 1], // Convert 1-based month index to month name
      count: entry.count,
    }));

    res.status(200).json({
      success: true,
      data: formattedEntries,
    });
  } catch (err) {
    console.error("Error fetching journal entries per month:", err);
    res.status(500).json({
      message: "Error fetching journal entries per month",
      success: false,
    });
  }
};

// Get journal entries per month piechart
exports.getJournalEntriesPerMonthPieChart = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
        success: false,
      });
    }

    // Step 1: Get total number of journal entries for the user
    const totalEntries = await JournalEntry.countDocuments({
      user: new mongoose.Types.ObjectId(userId),
    });

    if (totalEntries === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // Step 2: Aggregate journal entries by month and count them
    const journalEntries = await JournalEntry.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: { $month: "$createdAt" }, // Extract month number (1-12)
          count: { $sum: 1 }, // Count entries per month
        },
      },
      { $sort: { _id: 1 } }, // Sort months in order
    ]);

    // Step 3: Convert month number to month name
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Step 4: Compute percentage of total entries for each month
    const formattedData = journalEntries.map((entry) => ({
      month: monthNames[entry._id - 1], // Convert month number to name
      percentage: ((entry.count / totalEntries) * 100).toFixed(2), // Percentage
    }));

    return res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error fetching data", success: false });
  }
};

// Get journal entries per month for admin
exports.getJournalEntriesPerMonthAdmin = async (req, res) => {
  try {
    const journalEntries = await JournalEntry.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const formattedEntries = journalEntries.map((entry) => ({
      month: months[entry._id - 1],
      count: entry.count,
    }));

    res.status(200).json({
      success: true,
      data: formattedEntries,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err, success: false });
  }
};

// Get journal entries per month as a pie chart for all users (Admin function)
exports.getAllJournalEntriesPerMonthPieChartAdmin = async (req, res) => {
  try {
    // Step 1: Get total number of journal entries across all users
    const totalEntries = await JournalEntry.countDocuments();

    if (totalEntries === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // Step 2: Aggregate journal entries by month and count them
    const journalEntries = await JournalEntry.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" }, // Extract month number (1-12)
          count: { $sum: 1 }, // Count entries per month
        },
      },
      { $sort: { _id: 1 } }, // Sort months in order
    ]);

    // Step 3: Convert month number to month name
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Step 4: Compute percentage of total entries for each month
    const formattedData = journalEntries.map((entry) => ({
      month: monthNames[entry._id - 1], // Convert month number to name
      percentage: ((entry.count / totalEntries) * 100).toFixed(2), // Percentage
    }));

    return res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error fetching data", success: false });
  }
};
