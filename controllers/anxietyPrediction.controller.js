const AnxietyPrediction = require("../models/AnxietyPrediction.model");

exports.getAnxietySeverityTrendForAll = async (req, res) => {
  try {
    // Aggregate data to get the average severity score per date
    const data = await AnxietyPrediction.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Group by date
          averageSeverityScore: { $avg: "$severityScore" }, // Calculate average severity
          count: { $sum: 1 }, // Count entries per date
        },
      },
      { $sort: { _id: 1 } }, // Sort by date (ascending)
    ]);

    if (!data.length) {
      return res.status(404).json({ message: "No data found" });
    }

    // Format response for frontend charting
    const formattedData = data.map((entry) => ({
      date: entry._id,
      averageSeverityScore: entry.averageSeverityScore,
      count: entry.count,
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// Function to Calculate Correlation (Pearson's Correlation Coefficient)
const calculateCorrelation = (data) => {
  let n = data.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0,
    sumY2 = 0;

  data.forEach((d) => {
    sumX += d.x;
    sumY += d.y;
    sumXY += d.x * d.y;
    sumX2 += d.x * d.x;
    sumY2 += d.y * d.y;
  });

  let numerator = n * sumXY - sumX * sumY;
  let denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
  );

  return denominator === 0 ? 0 : (numerator / denominator).toFixed(3);
};

exports.getScatterPlotData = async (req, res) => {
  try {
    const data = await AnxietyPrediction.find(
      {},
      { dietQuality: 1, stressLevel: 1, _id: 0 }
    );

    const scatterData = data.map((entry) => ({
      x: entry.dietQuality,
      y: entry.stressLevel,
    }));

    // Key Observations and Analysis
    let totalEntries = scatterData.length;
    let avgDietQuality =
      scatterData.reduce((sum, d) => sum + d.x, 0) / totalEntries || 0;
    let avgStressLevel =
      scatterData.reduce((sum, d) => sum + d.y, 0) / totalEntries || 0;

    // Correlation Analysis (Basic Insight)
    let correlation =
      totalEntries > 1
        ? calculateCorrelation(scatterData)
        : "Insufficient data for correlation analysis";

    const analysis = {
      totalEntries,
      avgDietQuality: avgDietQuality.toFixed(2),
      avgStressLevel: avgStressLevel.toFixed(2),
      correlation,
      insights:
        correlation < 0
          ? "There may be an inverse relationship between diet quality and stress level."
          : correlation > 0
          ? "Higher diet quality may be associated with increased stress levels, indicating potential external factors."
          : "No strong relationship observed between diet quality and stress level.",
    };

    res.json({ scatterData, analysis });
  } catch (error) {
    console.error("Error fetching scatter plot data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAnxietyDietData = async (req, res) => {
  try {
    const results = await AnxietyPrediction.aggregate([
      {
        $group: {
          _id: {
            dietQuality: { $toInt: "$dietQuality" },
            anxietySeverity: { $toInt: "$severityScore" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          dietQuality: "$_id.dietQuality",
          anxietySeverity: "$_id.anxietySeverity",
          count: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSeverityBySleepHours = async (req, res) => {
  try {
    const sleepRanges = [
      { range: "1-2", min: 1, max: 2 },
      { range: "3-5", min: 3, max: 5 },
      { range: "6-8", min: 6, max: 8 },
      { range: "9+", min: 9, max: 24 },
    ];

    const data = await Promise.all(
      sleepRanges.map(async (range) => {
        const result = await AnxietyPrediction.aggregate([
          {
            $match: {
              sleepHours: { $gte: range.min, $lte: range.max },
            },
          },
          {
            $group: {
              _id: null,
              avgSeverity: { $avg: "$severityScore" },
              count: { $sum: 1 }, // Number of users in this range
            },
          },
        ]);

        return {
          sleepRange: range.range,
          avgSeverity: result.length ? result[0].avgSeverity.toFixed(2) : 0,
          count: result.length ? result[0].count : 0,
        };
      })
    );

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get anxiety prediction statistics for pie chart
exports.getStatsOccupation = async (req, res) => {
  try {
    const stats = await AnxietyPrediction.aggregate([
      {
        $group: {
          _id: "$occupation",
          count: { $sum: 1 },
          avgSeverity: { $avg: "$severityScore" },
        },
      },
      {
        $project: {
          _id: 0, // Hide MongoDB _id field
          occupation: "$_id", // Rename _id to occupation
          count: 1,
          avgSeverity: { $round: ["$avgSeverity", 2] }, // Round to 2 decimal places
        },
      },
      {
        $sort: { count: -1 }, // Sort in descending order by count
      },
    ]);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Get severity score per month
exports.getSeverirtyScorePerMonth = async (req, res) => {
  try {
    const severityScores = await AnxietyPrediction.aggregate([
      {
        $match: {
          createdAt: { $exists: true, $ne: null },
          updatedAt: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          mildCount: {
            $sum: {
              $cond: [{ $lte: ["$severityScore", 5] }, 1, 0], // Count mild scores
            },
          },
          severeCount: {
            $sum: {
              $cond: [{ $gt: ["$severityScore", 5] }, 1, 0], // Count severe scores
            },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }, // Sort results by year & month
    ]);

    return res.status(200).json({ success: true, data: severityScores });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Get all predictions
exports.getAllPredictions = async (req, res) => {
  try {
    const predictions = await AnxietyPrediction.find({
      createdAt: { $exists: true },
      updatedAt: { $exists: true },
    })
      .populate("userId")
      .sort({ createdAt: 1 });

    res
      .status(200)
      .json({ message: "All predictions", success: true, data: predictions });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error, success: false });
  }
};

// Get all prediction based on user id
exports.getAllPredictionsByUserID = async (req, res) => {
  const { userId } = req.params;

  try {
    const predictions = await AnxietyPrediction.find({
      userId: { $eq: userId.trim() },
    });

    if (!predictions.length) {
      return res
        .status(404)
        .json({ message: "No predictions found for this user." });
    }

    res.status(200).json({
      message: "Successfully fetched all predictions",
      success: true,
      data: predictions,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Count all predictions
exports.countPredictions = async (req, res) => {
  try {
    const count = await AnxietyPrediction.countDocuments(); // Count total predictions

    res.status(200).json({
      message: "Total number of predictions",
      success: true,
      count: count,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Get a single prediction
exports.getSinglePrediction = async (req, res) => {
  try {
    const { predictionId } = req.params;
    const prediction = await AnxietyPrediction.findById(predictionId);

    if (!prediction) {
      return res
        .status(404)
        .json({ message: "Prediction not found", success: false });
    }

    res
      .status(200)
      .json({ message: "Prediction found", success: true, data: prediction });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error, success: false });
  }
};

// Create a new prediction
exports.createPrediction = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      severityScore,
      age,
      sleepHours,
      physicalActivity,
      caffeineIntake,
      alcoholConsumption,
      smokingHabits,
      familyHistory,
      stressLevel,
      heartRate,
      breathingRate,
      sweatingLevel,
      dizziness,
      medication,
      therapySession,
      recentMajorLifeEvent,
      dietQuality,
      occupation,
    } = req.body;

    // Validate that occupation is one of the allowed values
    const validOccupations = [
      "Engineer",
      "Other",
      "Student",
      "Teacher",
      "Unemployed",
    ];
    if (!validOccupations.includes(occupation)) {
      return res.status(400).json({
        message: "Invalid occupation value",
        success: false,
      });
    }

    // Create a new prediction document
    const newPrediction = new AnxietyPrediction({
      userId,
      severityScore,
      age,
      sleepHours,
      physicalActivity,
      caffeineIntake,
      alcoholConsumption,
      smokingHabits,
      familyHistory,
      stressLevel,
      heartRate,
      breathingRate,
      sweatingLevel,
      dizziness,
      medication,
      therapySession,
      recentMajorLifeEvent,
      dietQuality,
      occupation,
    });

    // Save to database
    await newPrediction.save();

    return res.status(201).json({
      message: "Prediction created successfully",
      success: true,
      data: newPrediction,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

// Get the last created prediction
exports.getLastPrediction = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
        success: false,
      });
    }

    const lastPrediction = await AnxietyPrediction.findOne({ userId })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!lastPrediction) {
      return res.status(404).json({
        message: "No prediction found for this user",
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      data: lastPrediction,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message, success: false });
  }
};
