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
  .then(() => console.log("Database connected successfully!"))
  .catch((err) => console.error("Database connection error:", err));

const { faker } = require("@faker-js/faker");
const Contact = require("../models/contact.model");

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const generateRandomDate = () => {
  const startDate = new Date("2025-01-01");
  const endDate = new Date("2025-04-07");
  return new Date(
    startDate.getTime() +
      Math.random() * (endDate.getTime() - startDate.getTime())
  );
};

const generateContacts = async () => {
  try {
    const contacts = Array.from({ length: 100 }).map(() => ({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: `09${faker.number.int({ min: 100000000, max: 999999999 })}`,
      subject: faker.lorem.sentence(5),
      message: faker.lorem.paragraph(),
      status: faker.helpers.arrayElement([
        "pending",
        "in-progress",
        "resolved",
      ]),
      createdAt: generateRandomDate(),
      updatedAt: generateRandomDate(),
    }));

    await Contact.insertMany(contacts);
    console.log("✅ 100 new contacts inserted successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Error inserting contacts:", error);
    process.exit(1);
  }
};

generateContacts();
