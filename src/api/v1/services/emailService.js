const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "9b40126cc7c059",
    pass: "64951e23ecdbc3",
  },
});

const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
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
  const confirmationUrl = `http://localhost:3000/api/confirm-email?token=${token}`;

  const subject = "Confirm your email";
  const text = `Hello ${user.first_name}, Please confirm your email by clicking the link: <a href='${confirmationUrl}' target='__blank'>Click hre to confirm</a>`;

  await sendEmail(user.email, subject, text);
};

module.exports = {
  sendEmail,
  sendConfirmationEmail,
};
