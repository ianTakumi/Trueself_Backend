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

// Preprocessing function for the dataset
const preprocessData = (data) => {
  // Loop through each item in the dataset
  data.forEach((item, index) => {
    // Check for missing or invalid values in each field
    const missingFields = Object.keys(item).filter(
      (key) => item[key] === null || item[key] === undefined || item[key] === ""
    );

    if (missingFields.length > 0) {
      console.log(
        `Row ${index} has missing values in fields: ${missingFields.join(", ")}`
      );
    }
  });

  // Now, filter out rows with missing values and map the valid rows to the desired format
  return data
    .filter(
      (item) =>
        item.Age !== null &&
        item["Sleep Hours"] !== null &&
        item["Physical Activity (hrs/week)"] !== null &&
        item["Caffeine Intake (mg/day)"] !== null &&
        item["Alcohol Consumption (drinks/week)"] !== null &&
        item["Stress Level (1-10)"] !== null &&
        item["Heart Rate (bpm during attack)"] !== null &&
        item["Breathing Rate (breaths/min)"] !== null &&
        item["Sweating Level (1-5)"] !== null &&
        item["Diet Quality (1-10)"] !== null &&
        item["Severity of Anxiety Attack (1-10)"] !== null
    )
    .map((item) => [
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
      item["Severity of Anxiety Attack (1-10)"], // Target label
    ]);
};

// Normalize data
const normalizeData = (data) => {
  const tensor = tf.tensor2d(data);
  const max = tensor.max(0);
  const min = tensor.min(0);

  // Save min and max values to a file for later use
  fs.writeFileSync(
    "./min_max.json",
    JSON.stringify({ min: min.arraySync(), max: max.arraySync() })
  );

  return tensor.sub(min).div(max.sub(min)).arraySync();
};

// Create the model
const createModel = () => {
  const model = tf.sequential();

  model.add(
    tf.layers.dense({
      units: 64,
      inputShape: [17], // 17 features from the dataset (excluding the target)
      activation: "relu",
    })
  );

  model.add(
    tf.layers.dense({
      units: 32,
      activation: "relu",
    })
  );

  model.add(
    tf.layers.dense({
      units: 1, // Single output for regression
      activation: "linear", // Linear activation for continuous output
    })
  );

  model.compile({
    optimizer: "adam",
    loss: "meanSquaredError", // Loss function for regression
    metrics: ["mae"], // Track Mean Absolute Error for evaluation
  });

  return model;
};

// Main function to load data, preprocess, and train the model
async function trainAI() {
  // Step 1: Load and preprocess the data
  const data = await loadCSV("./anxiety_attack_dataset.csv");
  const processedData = preprocessData(data);

  // Split data into inputs (X) and labels (Y)
  const inputs = processedData.map((item) => item.slice(0, -1)); // All columns except the last (label)
  const labels = processedData.map((item) => item[item.length - 1]); // Last column (Severity of Anxiety Attack)

  // Normalize inputs
  const normalizedInputs = normalizeData(inputs);

  // Convert inputs and labels to tensors
  const inputTensor = tf.tensor2d(normalizedInputs);
  const labelTensor = tf.tensor2d(labels, [labels.length, 1]); // Labels as 2D tensor

  // Step 2: Split data into training and validation sets
  const splitIndex = Math.floor(inputTensor.shape[0] * 0.8); // 80% for training
  const trainInputs = inputTensor.slice(0, splitIndex);
  const trainLabels = labelTensor.slice(0, splitIndex);
  const valInputs = inputTensor.slice(splitIndex);
  const valLabels = labelTensor.slice(splitIndex);

  // Step 3: Create and train the model
  const model = createModel();

  await model.fit(trainInputs, trainLabels, {
    epochs: 50, // Number of training iterations
    batchSize: 32, // Number of samples per batch
    validationData: [valInputs, valLabels], // Validation data
    callbacks: tf.callbacks.earlyStopping({ patience: 5 }), // Stop training early if no improvement
  });

  // Step 4: Evaluate the model
  const evalResults = await model.evaluate(valInputs, valLabels);

  // Log evaluation results
  console.log("Evaluation Results:");
  console.log(`Loss: ${evalResults[0].dataSync()[0]}`); // Loss
  console.log(`Mean Absolute Error: ${evalResults[1].dataSync()[0]}`);

  // Step 5: Save the trained model
  await model.save("file://./saved_model"); // Save locally
}

// Run the training function
trainAI();
