// Importing the required modules
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const passport = require("./configs/passport.config");

// Importing routes
const userRoutes = require("./routes/user.routes");
const entryRoutes = require("./routes/entry.routes");
const spaceRoutes = require("./routes/space.routes");
const postRoutes = require("./routes/post.routes");
const authRoutes = require("./routes/auth.routes");
const moodEntryRoutes = require("./routes/moodEntry.routes");
const contactRoutes = require("./routes/contact.routes");
const anxietyPreditionRoutes = require("./routes/anxietyPrediction.routes");
const facebookRoutes = require("./routes/facebook-auth.routes");
const journalEntryRoutes = require("./routes/JournalEntry.routes");

// Initializing express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(passport.initialize());

// Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/entries", entryRoutes);
app.use("/api/v1/spaces", spaceRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/moodEntries", moodEntryRoutes);
app.use("/api/v1/contacts", contactRoutes);
app.use("/api/v1/anxietyPredictions", anxietyPreditionRoutes);
app.use("/api/v1/facebook", facebookRoutes);
app.use("/api/v1/journalEntries", journalEntryRoutes);

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(
        "Working and Running!!! Connected to db & listening on port",
        process.env.PORT
      );
    });
  })
  .catch((error) => {
    console.log(error);
  });
