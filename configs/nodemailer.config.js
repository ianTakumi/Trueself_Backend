const nodemailer = require("nodemailer");
const path = require("path");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GOOGLE_EMAIL,
    pass: process.env.GOOGLE_PASSWORD,
  },
});

const sendAdminEmail = (to, subject, message, attachments = []) => {
  const mailOptions = {
    from: process.env.GOOGLE_EMAIL,
    to: to,
    subject: subject,
    text: message,
    attachments: attachments.map((file) => ({
      filename: file.filename, // Use file.filename from memory storage
      content: file.content, // Use file.content for the buffer
      contentType: file.contentType, // Use the correct content type
      disposition: "attachment", // Ensures it's sent as an attachment
    })),
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendAdminEmail,
};
