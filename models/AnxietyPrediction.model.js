const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AnxietyPredictionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    severityScore: {
      type: Number,
      required: [true, "Severity score is required"],
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
    },
    sleepHours: {
      type: Number,
      required: [true, "Sleep hours is required"],
    },
    physicalActivity: {
      type: Number,
      required: [true, "Physical activity is required"],
    },
    caffeeineIntake: {
      type: Number,
      required: [true, "Caffeine intake is required"],
    },
    alcoholConsumption: {
      type: Number,
      required: [true, "Alcohol consumption is required"],
    },
    smokingHabits: {
      type: Number,
      required: [true, "Smoking habits is required"],
    },
    familyHistory: {
      type: Number,
      required: [true, "Family history is required"],
    },
    stressLevel: {
      type: Number,
      required: [true, "Stress level is required"],
    },
    heartRate: {
      type: Number,
      required: [true, "Heart rate is required"],
    },
    breathingRate: {
      type: Number,
      required: [true, "Breathing rate is required"],
    },
    sweatingLevel: {
      type: Number,
      required: [true, "Sweating level is required"],
    },
    dizziness: {
      type: Number,
      required: [true, "Dizziness is required"],
    },
    medication: {
      type: Number,
      required: [true, "Medication is required"],
    },
    theraphySession: {
      type: Number,
      required: [true, "Theraphy session is required"],
    },
    recentMajorLifeEvent: {
      type: Number,
      required: [true, "Recent major life event is required"],
    },
    dietQuality: {
      type: Number,
      required: [true, "Diet quality is required"],
    },
    occupation: {
      type: String,
      required: [true, "Occupation is required"],
      enum: ["Engineer", "Other", "Student", "Teacher", "Unemployed"],
    },
  },
  { timestamps: true, collection: "anxietyPredictions" }
);

const AnxietyPrediction = mongoose.model(
  "AnxietyPrediction",
  AnxietyPredictionSchema
);
module.exports = AnxietyPrediction;
