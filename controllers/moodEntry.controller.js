const MoodEntry = require("../models/moodEntry.model");
const mongoose = require("mongoose");
const dayjs = require("dayjs");

const getMoodPercentages = async (userId) => {
  try {
    const moodsList = ["Happy", "Sad", "Angry", "Anxious", "Neutral"];

    const result = await MoodEntry.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$mood", count: { $sum: 1 } } },
      {
        $group: {
          _id: null,
          total: { $sum: "$count" },
          moods: { $push: { mood: "$_id", count: "$count" } },
        },
      },
      {
        $unwind: { path: "$moods", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: 0,
          mood: "$moods.mood",
          count: "$moods.count",
          total: 1,
        },
      },
      {
        $addFields: {
          percentage: {
            $cond: {
              if: { $gt: ["$total", 0] },
              then: { $multiply: [{ $divide: ["$count", "$total"] }, 100] },
              else: 0,
            },
          },
        },
      },
      {
        $project: {
          mood: { $ifNull: ["$mood", "Unknown"] },
          percentage: 1,
        },
      },
    ]);

    // Ensure all moods exist in the result
    const moodMap = Object.fromEntries(
      result.map((item) => [item.mood, item.percentage])
    );
    const finalResult = moodsList.map((mood) => ({
      mood,
      percentage: moodMap[mood] || 0, // Default to 0% if not found
    }));

    return finalResult;
  } catch (error) {
    console.error("Error fetching mood percentages:", error);
    return [];
  }
};

// Get all mood entries based on user ID
exports.getAllMoodEntriesBasedOnUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const moodEntries = await MoodEntry.find({ user: userId });
    res.status(200).json({
      moodEntries,
      success: true,
      message: "Successfully fetch mood entries",
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// Get single mood entry based on user ID
exports.getSingleMoodBasedOnUserId = async (req, res) => {
  try {
    const { userId, moodEntryId } = req.params;

    const moodEntry = await MoodEntry.findOne({
      user: userId,
      _id: moodEntryId,
    });

    if (!moodEntry) {
      return res.status(404).json({
        message: "Mood entry not found",
        success: false,
      });
    }

    res.status(200).json({
      moodEntry,
      success: true,
      message: "Successfully fetch single mood entry",
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

exports.getMoodStatsByMonthWeek = async (req, res) => {
  try {
    const moodStats = await MoodEntry.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            createdAt: "$createdAt",
            mood: "$mood",
          },
          count: { $sum: 1 },
        },
      },
      {
        $addFields: {
          weekOfMonth: {
            $ceil: { $divide: [{ $dayOfMonth: "$_id.createdAt" }, 7] }, // Week within the month
          },
        },
      },
      {
        $group: {
          _id: {
            year: "$_id.year",
            month: "$_id.month",
            week: "$weekOfMonth",
          },
          moods: {
            $push: {
              mood: "$_id.mood",
              count: "$count",
            },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1 } },
    ]);

    const formattedData = moodStats.map((week) => {
      const monthName = dayjs()
        .month(week._id.month - 1)
        .format("MMMM");
      const weekLabel = `${monthName} - Week ${week._id.week}`;
      const moodCounts = { week: weekLabel };

      week.moods.forEach((mood) => {
        moodCounts[mood.mood] = mood.count;
      });

      return moodCounts;
    });

    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching mood stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all moods per month based on userId
exports.getMoodPerMonthBasedOnUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const objectIdUser = new mongoose.Types.ObjectId(userId.toString());

    const moodEntries = await MoodEntry.aggregate([
      {
        $match: {
          user: objectIdUser,
          createdAt: {
            $gte: new Date("2025-01-01T00:00:00.000Z"),
            $lt: new Date("2026-01-01T00:00:00.000Z"),
          },
        },
      },
      {
        $project: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          mood: 1,
        },
      },
      {
        $group: {
          _id: { year: "$year", month: "$month", mood: "$mood" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: { year: "$_id.year", month: "$_id.month" },
          moods: {
            $push: { mood: "$_id.mood", count: "$count" },
          },
        },
      },
      {
        $sort: { "_id.month": 1 },
      },
    ]);

    if (moodEntries.length === 0) {
      return res.status(404).json({
        message: "No mood entries found for this user in 2025.",
        success: false,
      });
    }

    res.status(200).json({ moodsPerMonth: moodEntries, success: true });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: error.message, success: false });
  }
};

exports.getMoodPercentagesBasedOnUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const moodPercentages = await getMoodPercentages(userId);
    res.status(200).json({
      moodPercentages,
      success: true,
      message: "Successfully fetch mood percentages",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message, success: false });
  }
};

exports.getMostFrequentMoodPerDay = async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, year } = req.query;

    const startDate = dayjs(`${year}-${month}-01`).startOf("month").toDate();
    const endDate = dayjs(startDate).endOf("month").toDate();

    const aggregatedData = await MoodEntry.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $project: {
          day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          mood: 1,
        },
      },
      {
        $group: {
          _id: { day: "$day", mood: "$mood" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.day": 1, count: -1 },
      },
      {
        $group: {
          _id: "$_id.day",
          mostFrequentMood: { $first: "$_id.mood" },
          moodCount: { $first: "$count" },
        },
      },
    ]);

    const result = aggregatedData.map((entry) => ({
      date: entry._id,
      mood: entry.mostFrequentMood,
      count: entry.moodCount,
    }));

    console.log(result);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in getting most frequent mood per day:", error);
    return res.status(500).json({ message: "Error retrieving mood data" });
  }
};

// Create a new mood entry
exports.createMoodEntry = async (req, res) => {
  try {
    const { userId } = req.params;
    const { mood, note } = req.body;

    if (!mood || !note) {
      return res.status(400).json({
        message: "Please provide a mood and note",
        success: false,
      });
    }

    const newMoodEntry = new MoodEntry({
      user: userId,
      mood,
      note,
    });

    await newMoodEntry.save();
    res.status(201).json({
      moodEntry: newMoodEntry,
      success: true,
      message: "Successfully created a new mood entry",
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};
// Update a mood entry
exports.updateMoodEntry = async (req, res) => {
  try {
    const { moodEntryId } = req.params;
    const { mood, note } = req.body;

    if (!mood || !note) {
      return res.status(400).json({
        message: "Please provide a mood and note",
        success: false,
      });
    }

    const updatedMoodEntry = await MoodEntry.findByIdAndUpdate(
      moodEntryId,
      { mood, note },
      { new: true }
    );

    if (!updatedMoodEntry) {
      return res.status(404).json({
        success: false,
        message: "Mood entry not found",
      });
    }

    res.status(200).json({
      moodEntry: updatedMoodEntry,
      success: true,
      message: "Successfully updated the mood entry",
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// Delete a mood entry
exports.deleteMoodEntry = async (req, res) => {
  try {
    const { moodEntryId, userId } = req.params;
    console.log(req.params);
    const moodEntry = await MoodEntry.findById(moodEntryId);

    if (!moodEntry) {
      console.log("Mood entry not found");
      return res.status(404).json({
        success: false,
        message: "Mood entry not found",
      });
    }

    if (moodEntry.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this entry",
      });
    }

    await moodEntry.deleteOne();

    res.status(200).json({
      success: true,
      message: "Successfully deleted the mood entry",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message, success: false });
  }
};
