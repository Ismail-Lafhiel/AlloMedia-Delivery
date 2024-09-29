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
  const text = `Hello ${user.first_name}, Please confirm your email by clicking the link: ${confirmationUrl}`;

  await sendEmail(user.email, subject, text);
};

// sending failed login attempt notification
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
  const resetUrl = `http://localhost:3000/api/reset-password?token=${token}`;

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
module.exports = {
  sendEmail,
  sendConfirmationEmail,
  sendFailedLoginNotification,
  sendResetPasswordEmail,
};
