const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
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
  const confirmationUrl = `${process.env.FRONTEND_URL}/confirm-email?token=${token}`;

  const subject = "Confirm your email";
  const text = `Hello ${user.first_name}, Please confirm your email by clicking the link: ${confirmationUrl}`;

  await sendEmail(user.email, subject, text);
};

// Sending failed login attempt notification
const sendFailedLoginNotification = async (user) => {
  const subject = "Failed Login Attempt";
  const text =
    `Hello ${user.first_name},\n\n` +
    `We noticed ${user.failedLoginAttempts} failed login attempts to your account. ` +
    `If this wasn't you, we recommend changing your password immediately.\n\n` +
    `Thank you, \nYour Security Team`;
  await sendEmail(user.email, subject, text);
};

// Sending a password reset email
const sendResetPasswordEmail = async (user, token, confirmationCode) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}&confirmationCode=${confirmationCode}`;

  const subject = "Reset Your Password";
  const text =
    `Hello ${user.first_name},\n\n` +
    `You requested to reset your password. Please click the link below to reset it:\n` +
    `${resetUrl}\n\n` +
    `Your confirmation code is: ${confirmationCode}\n` +
    `Please enter this code to proceed with your password reset.\n\n` +
    `If you did not request this, please ignore this email.\n\n` +
    `Thank you,\nYour Support Team`;

  await sendEmail(user.email, subject, text);
};

// Send 2FA code email
const send2FACodeEmail = async (user, confirmationCode) => {
  const subject = "Your 2FA Code for Password Reset";
  const text =
    `Hello ${user.first_name},\n\n` +
    `Here is your 2FA code for the password reset process: ${confirmationCode}\n\n` +
    `Please enter this code to proceed with resetting your password.\n\n` +
    `If you did not request this, please ignore this email.\n\n` +
    `Thank you,\nYour Support Team`;

  await sendEmail(user.email, subject, text);
};

module.exports = {
  sendEmail,
  sendConfirmationEmail,
  sendFailedLoginNotification,
  sendResetPasswordEmail,
  send2FACodeEmail,
};
