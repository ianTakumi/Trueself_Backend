const tf = require("@tensorflow/tfjs-node");
const fs = require("fs");
const Papa = require("papaparse");

// Load CSV file
async function loadCSV(filePath) {
  const fileContent = fs.readFileSync(filePath, "utf8");
  return new Promise((resolve, reject) => {
    Papa.parse(fileContent, {
      header: true, // Treat the first row as headers
      dynamicTyping: true, // Automatically convert strings to numbers
      complete: (result) => resolve(result.data),
      error: (error) => reject(error),
    });
  });
}

// Encode categorical columns
const encodeOccupation = (occupation) => {
  switch (occupation) {
    case "Doctor":
      return 0;
    case "Engineer":
      return 1;
    case "Student":
      return 2;
    case "Unemployed":
      return 3;
    case "Teacher":
      return 4;
    case "Other":
      return 5;
    default:
      return -1;
  }
};

// Preprocess test data
const preprocessTestData = (data) => {
  return data.map((item) => [
    item.Age,
    encodeOccupation(item.Occupation),
    item["Sleep Hours"],
    item["Physical Activity (hrs/week)"],
    item["Caffeine Intake (mg/day)"],
    item["Alcohol Consumption (drinks/week)"],
    item.Smoking === "Yes" ? 1 : 0,
    item["Family History of Anxiety"] === "Yes" ? 1 : 0,
    item["Stress Level (1-10)"],
    item["Heart Rate (bpm during attack)"],
    item["Breathing Rate (breaths/min)"],
    item["Sweating Level (1-5)"],
    item.Dizziness === "Yes" ? 1 : 0,
    item.Medication === "Yes" ? 1 : 0,
    item["Therapy Sessions (per month)"],
    item["Recent Major Life Event"] === "Yes" ? 1 : 0,
    item["Diet Quality (1-10)"],
  ]);
};

// Load min and max values
const loadMinMax = () => {
  const minMaxData = fs.readFileSync("./min_max.json", "utf8");
  return JSON.parse(minMaxData);
};

// Normalize test data using the loaded min and max values
const normalizeTestData = (data) => {
  const { min, max } = loadMinMax();

  // Convert min and max back into tensors
  const minTensor = tf.tensor1d(min);
  const maxTensor = tf.tensor1d(max);

  const tensor = tf.tensor2d(data);

  // Perform normalization using tensor operations
  return tensor.sub(minTensor).div(maxTensor.sub(minTensor)).arraySync();
};

// Test the model with new data
async function testAI(testFilePath) {
  // Load the trained model
  const model = await tf.loadLayersModel("file://./saved_model/model.json");

  // Load and preprocess the test data
  const testData = await loadCSV(testFilePath);
  const processedTestData = preprocessTestData(testData);

  // Normalize the test data using the same min and max values as training data
  const normalizedTestData = normalizeTestData(processedTestData);

  // Convert to tensor
  const testTensor = tf.tensor2d(normalizedTestData);

  // Predict the target variable (Severity of Anxiety Attack) for the test data
  const predictions = model.predict(testTensor);

  // Log the predictions
  predictions.array().then((predArray) => {
    console.log("Predictions: ", predArray);
  });
}

// Run the testing function with your test CSV file
testAI("./testData.csv");
