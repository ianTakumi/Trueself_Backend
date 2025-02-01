const nodemailer = require("nodemailer");
const path = require("path");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GOOGLE_EMAIL,
    pass: process.env.GOOGLE_PASSWORD,
  },
});
const devUrl = "http://localhost:3000";
const prodUrl = "https://example.com";

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

const sendRequestPasswordEmail = async (name, email, token) => {
  const htmlTemplate = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Reset Your Password - True Self</title>
    </head>
    <body
      style="
        font-family: Arial, sans-serif;
        background-color: #f9f9f9;
        margin: 0;
        padding: 0;
      "
    >
      <div
        style="
          background-color: #ffffff;
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        "
      >
        <h1
          style="
            text-align: center;
            color: #6b46c1;
            font-size: 24px;
            margin-bottom: 10px;
          "
        >
          True Self
        </h1>
        <div
          style="
            text-align: center;
            color: #333333;
            font-size: 16px;
            line-height: 1.5;2
            margin: 20px 0;
          "
        >
          <p style="margin: 0">Hello, ${name}</p>
          <p style="margin: 10px 0">
            We received a request to reset your password. Click the button below
            to proceed:
          </p>
          <a
            href="${devUrl}/reset-password?token=${token}"
            style="
              display: inline-block;
              margin-top: 20px;
              padding: 12px 20px;
              background-color: #6b46c1;
              color: #ffffff;
              text-decoration: none;
              border-radius: 8px;
              font-size: 16px;
              font-weight: bold;
            "
          >
            Reset Password
          </a>
          <p style="margin: 20px 0">
            If you didn’t request a password reset, you can safely ignore this
            email.
          </p>
        </div>
        <div
          style="
            text-align: center;
            color: #aaaaaa;
            font-size: 14px;
            margin-top: 30px;
          "
        >
          <p style="margin: 0">
            Thank you for being a part of the True Self community.
          </p>
          <p style="margin: 0">&copy; 2025 True Self. All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>
  `;

  const mailOptions = {
    from: process.env.GOOGLE_EMAIL,
    to: email,
    subject: "Password Reset Request",
    html: htmlTemplate,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};

const sendVerificationEmail = async (name, email, token) => {
  const htmlTemplate = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify Your Email - True Self</title>
  </head>
  <body
    style="
      font-family: Arial, sans-serif;
      background-color: #f9f9f9;
      margin: 0;
      padding: 0;
    "
  >
    <div
      style="
        background-color: #ffffff;
        max-width: 600px;
        margin: 20px auto;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      "
    >
      <h1
        style="
          text-align: center;
          color: #6b46c1;
          font-size: 24px;
          margin-bottom: 10px;
        "
      >
        True Self
      </h1>
      <div
        style="
          text-align: center;
          color: #333333;
          font-size: 16px;
          line-height: 1.5;
          margin: 20px 0;
        "
      >
        <p style="margin: 0">Hello, ${name}</p>
        <p style="margin: 10px 0">
          Thank you for signing up! Please confirm your email address by
          clicking the button below:
        </p>
        <a
          href="http://${devUrl}/success-verified/${token}"
          style="
            display: inline-block;
            margin-top: 20px;
            padding: 12px 20px;
            background-color: #6b46c1;
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
          "
        >
          Verify Email
        </a>
        <p style="margin: 20px 0">
          If you did not sign up for True Self, you can safely ignore this
          email.
        </p>
      </div>
      <div
        style="
          text-align: center;
          color: #aaaaaa;
          font-size: 14px;
          margin-top: 30px;
        "
      >
        <p style="margin: 0">Thank you for joining the True Self community.</p>
        <p style="margin: 0">&copy; 2025 True Self. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;

  const mailoptions = {
    from: process.env.GOOGLE_EMAIL,
    to: email,
    subject: "Verify your email",
    html: htmlTemplate,
  };

  try {
    const info = await transporter.sendMail(mailoptions);
    console.log("✅ Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};
module.exports = {
  sendAdminEmail,
  sendRequestPasswordEmail,
  sendVerificationEmail,
};
