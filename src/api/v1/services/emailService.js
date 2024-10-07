const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail address
    pass: process.env.GMAIL_PASS, // Your Gmail app password
  },
});

// Sending email function
const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Email sending failed");
  }
};

// Sending confirmation email function
const sendConfirmationEmail = async (user, token) => {
  const confirmationUrl = `${process.env.FRONTEND_URL}/confirm-email?token=${token}`;

  const subject = "Confirm your email";
  const text = `Hello ${user.first_name}, Please confirm your email by clicking the link: ${confirmationUrl}`;

  await sendEmail(user.email, subject, text);
};

// Exporting the functions
module.exports = {
  sendEmail,
  sendConfirmationEmail,
};