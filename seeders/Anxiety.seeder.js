const mongoose = require("mongoose");
require("dotenv").config({ path: "../.env" });
const { faker } = require("@faker-js/faker");
const AnxietyPrediction = require("../models/AnxietyPrediction.model");

const MONGODB_URL = process.env.MONGODB_URL;
if (!MONGODB_URL) {
  throw new Error("MONGODB_URL is not defined in the .env file!");
}

mongoose
  .connect(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected successfully!"))
  .catch((err) => console.error("Database connection error:", err));

const generateRandomDate = () => {
  const startDate = new Date("2025-01-01");
  const endDate = new Date("2025-04-07");
  return new Date(
    startDate.getTime() +
      Math.random() * (endDate.getTime() - startDate.getTime())
  );
};

const generateRecord = (sleepHours, severityRange) => ({
  userId: faker.database.mongodbObjectId(),
  severityScore: faker.number.int({
    min: severityRange[0],
    max: severityRange[1],
  }),
  age: faker.number.int({ min: 18, max: 78 }),
  sleepHours,
  physicalActivity: faker.number.int({ min: 0, max: 500 }),
  caffeeineIntake: faker.number.int({ min: 0, max: 500 }),
  alcoholConsumption: faker.number.int({ min: 0, max: 10 }),
  smokingHabits: faker.datatype.boolean() ? 1 : 0, // ✅ FIXED
  familyHistory: faker.number.int({ min: 0, max: 1 }),
  stressLevel: faker.number.int({ min: 1, max: 10 }),
  heartRate: faker.number.int({ min: 60, max: 140 }),
  breathingRate: faker.number.int({ min: 12, max: 22 }),
  sweatingLevel: faker.number.int({ min: 1, max: 5 }),
  dizziness: faker.datatype.boolean() ? 1 : 0, // ✅ FIXED
  medication: faker.datatype.boolean() ? 1 : 0, // ✅ FIXED
  theraphySession: faker.number.int({ min: 0, max: 5 }),
  recentMajorLifeEvent: faker.datatype.boolean() ? 1 : 0, // ✅ FIXED
  dietQuality: faker.number.int({ min: 1, max: 10 }),
  occupation: faker.helpers.arrayElement([
    "Engineer",
    "Other",
    "Student",
    "Teacher",
    "Unemployed",
  ]),
  createdAt: generateRandomDate(),
  updatedAt: generateRandomDate(),
});

const createAnxietyPredictions = async () => {
  try {
    const records = [];

    // Generate 50 records for sleep hours 1-2 (High Severity: 7-10)
    for (let i = 0; i < 50; i++) {
      records.push(
        generateRecord(faker.number.int({ min: 1, max: 2 }), [7, 10])
      );
    }

    // Generate 50 records for sleep hours 3-5 (Medium-High Severity: 5-9)
    for (let i = 0; i < 50; i++) {
      records.push(
        generateRecord(faker.number.int({ min: 3, max: 5 }), [5, 9])
      );
    }

    await AnxietyPrediction.insertMany(records);
    console.log("100 anxiety prediction records inserted successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error inserting records:", error);
    mongoose.connection.close();
  }
};

createAnxietyPredictions();
