const mongoose = require("mongoose");
require("dotenv").config({ path: "../.env" });

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  throw new Error("MONGODB_URL is not defined in the .env file!");
}

mongoose
  .connect(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Database connected successfully!"))
  .catch((err) => console.error("❌ Database connection error:", err));

const { faker } = require("@faker-js/faker");
const MoodEntry = require("../models/moodEntry.model");

const userId = new mongoose.Types.ObjectId("679ba7c4f745440a0e931ec2"); // Replace with actual user ID
const moods = ["Happy", "Sad", "Angry", "Anxious", "Neutral"];

// Function to generate a random Tagalog note
const getRandomTagalogNote = (mood) => {
  const notes = {
    Happy: [
      "Ang saya ng araw ko! Ang daming magandang nangyari!",
      "Masarap ang pagkain kanina! Busog na busog ako.",
      "Nakakuha ako ng mataas na grade sa exam! Worth it ang pagod.",
      "Ang saya mag-bonding kasama ang pamilya!",
      "Grabe, natupad ang isa sa mga pangarap ko!",
    ],
    Sad: [
      "Nakakalungkot ang araw na ‘to, parang ang bigat ng pakiramdam ko.",
      "Sana hindi na lang ako umalis ng bahay, ang lungkot ng gabi ko.",
      "Miss ko na ang lola ko, naaalala ko siya ngayon.",
      "Parang wala akong gana sa lahat ng bagay ngayon.",
      "Nalulungkot ako, di ko alam kung bakit.",
    ],
    Angry: [
      "Nakakainis! Ang bagal ng internet!",
      "Bwisit! May nanloko sa akin ngayon!",
      "Nag-away kami ng kaibigan ko, bad trip talaga.",
      "Nakakapikon ang ugali ng ibang tao!",
      "Ang init ng ulo ko, gusto ko na lang manahimik.",
    ],
    Anxious: [
      "Kinakabahan ako sa interview bukas!",
      "Hindi ako mapakali, parang may mali.",
      "Sana pumasa ako sa exam, sobra akong worried.",
      "Di ko alam kung anong mangyayari bukas, ang daming iniisip.",
      "Parang may kulang pero di ko alam kung ano.",
    ],
    Neutral: [
      "Walang gaanong nangyari ngayon, steady lang.",
      "Okay naman ang araw ko, walang masyadong ganap.",
      "Hindi naman masaya, hindi rin malungkot. Sakto lang.",
      "Parehas lang ang araw ko kahapon at ngayon.",
      "Tahimik lang ang araw ko, walang stress pero wala rin excitement.",
    ],
  };

  return faker.helpers.arrayElement(notes[mood]);
};

// Function to generate a random date
const getRandomDate = () => {
  const start = new Date("2025-01-01T00:00:00.000Z");
  const end = new Date("2025-04-07T23:59:59.999Z");
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

// Seed function
const seedMoodEntries = async () => {
  try {
    console.log("🌱 Seeding mood entries...");

    const moodEntries = Array.from({ length: 100 }, () => {
      const mood = faker.helpers.arrayElement(moods);
      return {
        user: userId,
        mood: mood,
        note: getRandomTagalogNote(mood),
        createdAt: getRandomDate(),
        updatedAt: getRandomDate(),
      };
    });

    await MoodEntry.insertMany(moodEntries);
    console.log("✅ 100 mood entries seeded successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    mongoose.connection.close();
  }
};

seedMoodEntries();
