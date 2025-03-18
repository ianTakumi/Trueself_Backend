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
            href="http://localhost:3000/reset-password?token=${token}"
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
          href="${devUrl}/success-verified/${token}"
          href="http://localhost:3000/success-verified/${token}"

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

const deleteSuccessEmail = async (name, email) => {
  const htmlTemplate = `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Account Deleted</title>
  </head>
  <body
    style="
      background-color: #fffacd;
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 20px;
    "
  >
    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="
        max-width: 600px;
        margin: auto;
        background: #f4dad1;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      "
    >
      <tr>
        <td style="text-align: center">
          <h1 style="color: #c8a2c8">Account Successfully Deleted</h1>
          <p style="color: #5a5a5a; font-size: 16px">
            Your account and all associated data have been permanently removed.
          </p>
          <p style="color: #5a5a5a; font-size: 14px">
            If this was a mistake or you need assistance, please
            <a
              href="mailto:support@example.com"
              style="color: #b0e0e6; text-decoration: none"
              >contact support</a
            >.
          </p>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  const mailOptions = {
    from: process.env.GOOGLE_EMAIL,
    to: email,
    subject: "Account Deleted",
    html: htmlTemplate,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};

const sendOTPEmail = async (name, email, otp) => {
  let otpDigits = "";

  for (let i = 0; i < otp.length; i++) {
    otpDigits += `<span style="display: inline-block; padding: 4px;">${otp[i]}</span>`;
  }

  const htmlTemplate = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>OTP Email Verification</title>
      </head>
      <body style="background-color: #f7f7f7; text-align: center; padding: 40px">
        <div
          style="
            max-width: 400px;
            background: white;
            padding: 30px;
            margin: auto;
            border-radius: 12px;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
          "
        >
          <!-- Logo -->
          <img
            src="https://res.cloudinary.com/dco6n59if/image/upload/v1741011690/zsztuvvi6079a2i2k7o2.png"
            alt="True Self Logo"
            style="width: 80px; margin-bottom: 10px"
          />

          <h2 style="color: #333; font-weight: bold">
            Welcome to True Self, ${name}! 🎉
          </h2>
          <p style="color: #666; font-size: 14px; margin-bottom: 20px">
            You're almost there! To complete your sign-up, please enter the
            verification code below within
            <strong>10 minutes.</strong>
          </p>

          <!-- OTP Box -->
          <div
            style="
              display: flex;
              justify-content: center;
              align-items: center;
              background: linear-gradient(135deg, #444, #222);
              color: white;
              font-size: 22px;
              font-weight: bold;
              padding: 12px 18px;
              border-radius: 12px;
              letter-spacing: 8px;
              box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
              width: fit-content;
              margin: 20px auto;
            "
          >
            ${otpDigits}
          </div>

          <p style="color: #888; font-size: 12px; margin-top: 20px">
            If you didn’t request this, please ignore this email.<br />
            Need help?
            <a href="#" style="color: #007bff; text-decoration: none"
              >Contact Support</a
            >.
          </p>
        </div>
      </body>
    </html>
    `;

  const mailOptions = {
    from: process.env.GOOGLE_EMAIL,
    to: email,
    subject: "One Time Password",
    html: htmlTemplate,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Error sending otp email:", error);
    throw error;
  }
};

const sendRequestPasswordEmailMobile = async (name, email, otp) => {
  let otpDigits = "";

  for (let i = 0; i < otp.length; i++) {
    otpDigits += `<span style="display: inline-block; padding: 4px;">${otp[i]}</span>`;
  }

  const htmlTemplate = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reset Your Password</title>
      </head>
      <body style="background-color: #f7f7f7; text-align: center; padding: 40px">
        <div
          style="
            max-width: 400px;
            background: white;
            padding: 30px;
            margin: auto;
            border-radius: 12px;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
          "
        >
          <!-- Logo -->
          <img
            src="https://res.cloudinary.com/dco6n59if/image/upload/v1741011690/zsztuvvi6079a2i2k7o2.png"
            alt="True Self Logo"
            style="width: 80px; margin-bottom: 10px"
          />

          <h2 style="color: #333; font-weight: bold">
            Reset Your Password, ${name}
          </h2>
          <p style="color: #666; font-size: 14px; margin-bottom: 20px">
            We received a request to reset your password. Use the verification code
            below within
            <strong>10 minutes</strong> to proceed.
          </p>

          <!-- OTP Box -->
          <div
            style="
              display: flex;
              justify-content: center;
              align-items: center;
              background: linear-gradient(135deg, #444, #222);
              color: white;
              font-size: 22px;
              font-weight: bold;
              padding: 12px 18px;
              border-radius: 12px;
              letter-spacing: 8px;
              box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
              width: fit-content;
              margin: 20px auto;
            "
          >
            ${otpDigits}
          </div>

          <p style="color: #888; font-size: 12px; margin-top: 20px">
            If you didn’t request this, please ignore this email.<br />
            Need help?
            <a href="#" style="color: #007bff; text-decoration: none"
              >Contact Support</a
            >.
          </p>
        </div>
      </body>
    </html>
    `;

  const mailOptions = {
    from: process.env.GOOGLE_EMAIL,
    to: email,
    subject: "Reset Your Password",
    html: htmlTemplate,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Error sending otp email:", error);
    throw error;
  }
};

const sendDeactivateEmail = async (name, email) => {
  const htmlTemplate = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Account Deactivation Notice</title>
  </head>
  <body
    style="
      font-family: Arial, sans-serif;
      background-color: #f8f9fa;
      margin: 0;
      padding: 0;
    "
  >
    <div
      style="
        max-width: 600px;
        margin: 20px auto;
        background: #ffffff;
        padding: 25px;
        border-radius: 10px;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.08);
        text-align: center;
      "
    >
      <!-- Logo -->
      <img
        src="https://res.cloudinary.com/dco6n59if/image/upload/v1741011690/zsztuvvi6079a2i2k7o2.png"
        alt="True Self Logo"
        style="width: 80px; margin-bottom: 15px"
      />

      <!-- Header -->
      <h2 style="color: #333; font-size: 22px; margin-bottom: 10px">
        Hello, ${name}!
      </h2>
      <p
        style="
          color: #555;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 20px;
        "
      >
        Your account has been
        <strong style="color: #d9534f">deactivated</strong>. This means you will
        no longer be able to access its features or services.
      </p>

      <!-- Additional Info -->
      <p
        style="color: #666; font-size: 14px; margin-top: 20px; line-height: 1.5"
      >
        If you no longer wish to keep your account, no further action is needed.
        If you have any concerns, please
        <a href="[Support Link]" style="color: #6c63ff; text-decoration: none"
          >contact our support team</a
        >.
      </p>

      <!-- Footer -->
      <div style="margin-top: 30px; font-size: 12px; color: #888">
        &copy; 2025 True Self. All Rights Reserved.
      </div>
    </div>
  </body>
</html>
`;

  const mailOptions = {
    from: process.env.GOOGLE_EMAIL,
    to: email,
    subject: "Account Deactivated",
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

const reactivateAccountEmail = async (name, email) => {
  const htmlTemplate = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Account Reactivated</title>
  </head>
  <body
    style="
      font-family: Arial, sans-serif;
      background-color: #f8f9fa;
      margin: 0;
      padding: 0;
    "
  >
    <div
      style="
        max-width: 600px;
        margin: 20px auto;
        background: #ffffff;
        padding: 25px;
        border-radius: 10px;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.08);
        text-align: center;
      "
    >
      <!-- Logo -->
      <img
        src="https://res.cloudinary.com/dco6n59if/image/upload/v1741011690/zsztuvvi6079a2i2k7o2.png"
        alt="True Self Logo"
        style="width: 80px; margin-bottom: 15px"
      />

      <!-- Header -->
      <h2 style="color: #333; font-size: 22px; margin-bottom: 10px">
        Hello, ${name}!
      </h2>
      <p
        style="
          color: #555;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 20px;
        "
      >
        Good news! Your account has been
        <strong style="color: #28a745">successfully reactivated</strong>. You
        can now access all features and services as usual.
      </p>

      <!-- Footer -->
      <div style="margin-top: 30px; font-size: 12px; color: #888">
        &copy; 2025 True Self. All Rights Reserved.
      </div>
    </div>
  </body>
</html>
`;

  const mailOptions = {
    from: process.env.GOOGLE_EMAIL,
    to: email,
    subject: "Account Reactivated",
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

module.exports = {
  reactivateAccountEmail,
  sendDeactivateEmail,
  sendAdminEmail,
  sendRequestPasswordEmailMobile,
  sendRequestPasswordEmail,
  sendVerificationEmail,
  deleteSuccessEmail,
  sendOTPEmail,
};
