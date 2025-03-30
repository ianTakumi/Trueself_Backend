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

const generateRandomDate = () => {
  const startDate = new Date("2025-01-01");
  const endDate = new Date("2025-04-07");
  return new Date(
    startDate.getTime() +
      Math.random() * (endDate.getTime() - startDate.getTime())
  );
};

const subjects = [
  "Hindi ako makapag-login sa account ko",
  "Paano mag-reset ng password?",
  "May error kapag sinusubukan kong gamitin ang app",
  "Gusto ko pong i-update ang aking impormasyon",
  "Hindi ko natanggap ang verification email",
  "May duplicate entry sa records ko",
  "Nag-crash ang system habang ginagamit ko",
  "May hindi ako maintindihang feature sa app",
  "May scammer sa platform, paano i-report?",
  "May kulang sa mga datos ko",
  "Na-hack po yata ang account ko, paano po ito ma-recover?",
  "Paano mag-delete ng account?",
  "Hindi gumagana ang notification settings ko",
  "Gusto kong mag-request ng bagong feature sa system",
  "Paano mag-export ng data ko?",
  "Nagpalit ako ng number, paano i-update sa account?",
  "May mali sa pangalan ko sa profile, paano itama?",
  "Nakalimutan ko ang security question ko, paano ito ma-reset?",
  "May problema sa two-factor authentication",
  "Masyadong mabagal ang website, may issue po ba?",
  "Hindi ko ma-upload ang profile picture ko",
  "Mali ang natanggap kong email confirmation",
  "Nawawala ang ilan sa mga records ko, paano ko ito maibabalik?",
  "May nagpadala ng phishing email gamit ang pangalan niyo",
  "Paano mag-disable ng auto-login?",
  "May spam messages ako na natatanggap, paano i-block?",
  "Nagkaroon ng biglang logout, may security issue po ba?",
  "Paano i-recover ang accidentally deleted data?",
  "May mali sa access permissions ng account ko",
  "Gusto ko pong mag-change ng username",
];

const messages = [
  "Magandang araw! Hindi ako makapag-login sa account ko kahit tama naman ang password ko. Pwede po bang patingnan ito?",
  "Gusto ko pong palitan ang email address na nakaregister sa account ko, paano po ito gawin?",
  "Nagkaroon ako ng error habang ginagamit ang app. Naka-attach po ang screenshot ng error. Pakitingnan po.",
  "Hindi po gumagana ang verification link na natanggap ko sa email. Paano po ito maaayos?",
  "Napansin ko pong may duplicate entry sa records ko. Paano po ito maitatama?",
  "Nagkaroon ng problema habang ginagamit ko ang system, biglang nag-close ang app. Sana po ay matulungan ninyo ako.",
  "Paano po i-report ang isang user na mukhang scammer? Mukhang hindi siya legit.",
  "Pwede po bang humingi ng assistance sa paggamit ng bagong feature? Medyo hindi ko po maintindihan.",
  "Gusto ko pong malaman kung paano ko mae-export ang aking data mula sa system. Pakituro po kung paano.",
  "Napansin ko pong may kulang sa mga datos ko, may paraan po ba para ito ma-verify?",
  "Na-hack po yata ang account ko dahil may hindi ako kilalang login attempt. Ano pong dapat kong gawin?",
  "Gusto ko na pong i-delete ang account ko, ano po ang process?",
  "Matagal na po akong hindi nakakatanggap ng notifications, paano po ito ayusin?",
  "May suggestion po ako para sa bagong feature sa app, saan po ako pwedeng mag-submit?",
  "Nagbago po ako ng phone number, paano po ito ma-update sa account ko?",
  "May nakita po akong typo sa pangalan ko sa profile, paano po ito baguhin?",
  "Nakalimutan ko ang sagot sa security question ko, paano po ito ma-reset?",
  "Gusto ko pong mag-enable ng two-factor authentication para sa security ng account ko, paano po ito gawin?",
  "Parang mabagal po ang website nitong mga nakaraang araw, may issue po ba sa server?",
  "Hindi po ako makapag-upload ng profile picture ko, may error na lumalabas.",
  "Mali po ang natanggap kong email confirmation, paano po ito i-correct?",
  "Bigla pong nawala ang ilan sa records ko, paano po ito ma-recover?",
  "May nagpadala po ng email na nagpapanggap na support ninyo, paano ko ito mare-report?",
  "Paano po i-disable ang auto-login ng account ko?",
  "Nakakatanggap po ako ng spam messages sa account ko, paano po sila i-block?",
  "Bigla po akong na-logout sa lahat ng devices, may security breach po ba?",
  "Paano i-recover ang na-delete kong data?",
  "May problema po sa access permissions ng account ko, hindi ko makita ang ibang options.",
  "Gusto ko pong baguhin ang username ko, pero hindi ko mahanap ang settings.",
];

const generateContacts = async () => {
  try {
    await Contact.deleteMany({});

    const contacts = Array.from({ length: 200 }).map(() => ({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: `09${faker.number.int({ min: 100000000, max: 999999999 })}`,
      subject: faker.helpers.arrayElement(subjects),
      message: faker.helpers.arrayElement(messages),
      status: faker.helpers.arrayElement([
        "pending",
        "in-progress",
        "resolved",
      ]),
      createdAt: generateRandomDate(),
      updatedAt: generateRandomDate(),
    }));

    await Contact.insertMany(contacts);
    console.log("✅ 200 new contacts inserted successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Error inserting contacts:", error);
    process.exit(1);
  }
};

generateContacts();
