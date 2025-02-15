const AnxietyPredictionController = require("../controllers/anxietyPrediction.controller");
const router = require("express").Router();

// Get all predictions
router.get("/", AnxietyPredictionController.getAllPredictions);

// Count all predictions
router.get("/count", AnxietyPredictionController.countPredictions);

// Get a single prediction
router.get("/:predictionId", AnxietyPredictionController.getSinglePrediction);

// Create a new prediction
router.post("/:userId", AnxietyPredictionController.createPrediction);

module.exports = router;
