const AnxietyPrediction = require("../models/AnxietyPrediction.model");

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

    res
      .status(200)
      .json({
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
