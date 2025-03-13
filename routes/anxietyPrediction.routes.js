const AnxietyPredictionController = require("../controllers/anxietyPrediction.controller");
const router = require("express").Router();

// Get anxiety prediction statistics for pie chart
router.get("/statsOccupation", AnxietyPredictionController.getStatsOccupation);

// Get anxiety prediction trends
router.get(
  "/statsTrends",
  AnxietyPredictionController.getAnxietySeverityTrendForAll
);

//Get sleep hours data
router.get(
  "/statsSleepHours",
  AnxietyPredictionController.getSeverityBySleepHours
);

//Get anxiety data diet quality vs anxiety severirty
router.get("/statsDietQuality", AnxietyPredictionController.getScatterPlotData);

// Get all predictions
router.get("/", AnxietyPredictionController.getAllPredictions);

router.get(
  "/lastPrediction/:userId",
  AnxietyPredictionController.getLastPrediction
);

router.get("/perMonth", AnxietyPredictionController.getSeverirtyScorePerMonth);

// Get all predictions by userId
router.get(
  "/user/:userId",
  AnxietyPredictionController.getAllPredictionsByUserID
);

// Count all predictions
router.get("/count", AnxietyPredictionController.countPredictions);

// Get a single prediction
router.get("/:predictionId", AnxietyPredictionController.getSinglePrediction);

// Create a new prediction
router.post("/:userId", AnxietyPredictionController.createPrediction);

module.exports = router;
