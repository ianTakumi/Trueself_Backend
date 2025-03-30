const mongoose = require("mongoose");
require("dotenv").config({ path: "../.env" });

const { faker } = require("@faker-js/faker");
const JournalEntry = require("../models/JournalEntry.model");

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

const userId = new mongoose.Types.ObjectId("67d95dd8300c7adb813d629d");

const titles = [
  "Aking Paglalakbay Ngayong Araw",
  "Pagninilay sa Buhay",
  "Mga Pangarap at Mithiin",
  "Isang Hindi Malilimutang Araw",
  "Bagong Simula",
  "Mga Bagay na Ikinatutuwa Ko",
  "Pagsubok na Nalampasan",
  "Aking Pinakamalaking Aral Ngayon",
  "Mga Taong Pinahahalagahan Ko",
  "Isang Sulat Para sa Aking Hinaharap na Sarili",
];

const randomContent = [
  `<h2>${faker.lorem.sentence()}</h2>
  <p>Ngayong araw, napag-isip-isip ko ang mga bagay na mahalaga sa akin. ${faker.lorem.paragraph()}</p>
  <blockquote>“${faker.lorem.sentence()}”</blockquote>
  <p>Ang buhay ay puno ng pagsubok, ngunit patuloy tayong lumalaban. ${faker.lorem.sentences(
    3
  )}</p>`,

  `<h3>Mga Natutunan Ko Ngayong Araw</h3>
  <ul>
    <li>${faker.lorem.sentence()}</li>
    <li>${faker.lorem.sentence()}</li>
    <li>${faker.lorem.sentence()}</li>
  </ul>
  <p>${faker.lorem.paragraph()}</p>`,

  `<h2>${faker.lorem.words(3)}</h2>
  <p>Isa na namang bagong araw, puno ng pag-asa. ${faker.lorem.sentences(4)}</p>
  <p>Hindi ko akalaing mararanasan ko ito ngayon: ${faker.lorem.sentence()}</p>
  <p>Ngunit kahit anong mangyari, tuloy lang ang buhay.</p>`,

  `<h3>Isang Sulat Para sa Aking Sarili</h3>
  <p>Dear self, huwag kang matakot harapin ang mga hamon ng buhay. ${faker.lorem.sentences(
    3
  )}</p>
  <p>Alalahanin mo na lagi kang may mga taong nagmamahal sa’yo. ${faker.lorem.sentences(
    2
  )}</p>`,
];

// Get dates from March 31 (Sunday) to the upcoming Friday
const getDateInRange = () => {
  const startDate = new Date("2025-03-31"); // March 31
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 5); // Upcoming Friday

  return new Date(
    startDate.getTime() +
      Math.random() * (endDate.getTime() - startDate.getTime())
  );
};

const generateJournalEntry = () => ({
  user: userId,
  title: faker.helpers.arrayElement(titles),
  content: faker.helpers.arrayElement(randomContent),
  createdAt: getDateInRange(),
  updatedAt: new Date(),
});

const seedDatabase = async () => {
  try {
    const entries = Array.from({ length: 100 }, generateJournalEntry);
    await JournalEntry.insertMany(entries);
    console.log("✅ Successfully inserted 100 journal entries!");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error inserting journal entries:", error);
    mongoose.connection.close();
  }
};

const deleteEntriesFrom2024 = async () => {
  try {
    const startOf2024 = new Date("2024-01-01T00:00:00Z");
    const endOf2024 = new Date("2024-12-31T23:59:59Z");

    const result = await JournalEntry.deleteMany({
      createdAt: { $gte: startOf2024, $lte: endOf2024 },
    });

    console.log(`🗑️ Deleted ${result.deletedCount} entries from 2024!`);
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error deleting entries:", error);
    mongoose.connection.close();
  }
};

deleteEntriesFrom2024();
