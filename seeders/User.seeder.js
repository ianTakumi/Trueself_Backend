const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const User = require("../models/user.model");

require("dotenv").config({ path: "../.env" });

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  throw new Error("MONGODB_URL is not defined in the .env file!");
}

// Connect to MongoDB
mongoose
  .connect(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected successfully!"))
  .catch((err) => console.error("Database connection error:", err));

// Function to generate a random date of birth
const generateRandomDate = () => {
  const startDate = new Date("1980-01-01");
  const endDate = new Date("2005-12-31"); // Adjust age range
  return new Date(
    startDate.getTime() +
      Math.random() * (endDate.getTime() - startDate.getTime())
  );
};

// Function to generate fake users
const generateUsers = async (count = 10) => {
  try {
    const users = [];

    for (let i = 0; i < count; i++) {
      const user = new User({
        name: faker.person.fullName(),
        dob: generateRandomDate(),
        email: faker.internet.email(),
        phoneNumber: faker.phone.number("+63 9## ### ####"), // PH format
        sexualOrientation: faker.helpers.arrayElement([
          "Lesbian",
          "Gay",
          "Bisexual",
          "Pansexual",
          "Asexual",
          "Queer",
          "Heterosexual",
        ]),
        genderIdentity: faker.helpers.arrayElement([
          "Cisgender",
          "Transgender",
          "Nonbinary",
          "Genderqueer",
        ]),
        pronouns: faker.helpers.arrayElement([
          "He/Him/His",
          "She/Her/Hers",
          "They/Them/Theirs",
        ]),
        profile: {
          public_id: "default_user",
          url: "https://res.cloudinary.com/dwmw3iig6/image/upload/v1726394807/users/default_user.jpg",
        },
        role: "user",
        status: faker.helpers.arrayElement([
          "activated",
          "deactivated",
          "unverified",
          "verified",
        ]),
        password: "Test@1234", // You should hash passwords in a real-world scenario
      });

      users.push(user);
    }

    await User.insertMany(users);
    console.log(`${count} users added successfully!`);
  } catch (error) {
    console.error("Error generating users:", error);
  } finally {
    mongoose.connection.close();
  }
};

generateUsers(100);
