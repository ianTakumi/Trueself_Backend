const AnxietyPredictionController = require("../controllers/anxietyPrediction.controller");
const router = require("express").Router();

// Get all predictions
router.get("/", AnxietyPredictionController.getAllPredictions);

// Get a single prediction
router.get("/:predictionId", AnxietyPredictionController.getSinglePrediction);

// Create a new prediction
router.post("/:userId", AnxietyPredictionController.createPrediction);

module.exports = router;
