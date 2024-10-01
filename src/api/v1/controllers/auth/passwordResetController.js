const User = require("../../models/User");
const {
  generateResetToken,
  verifyToken,
  hashPassword,
} = require("../../helpers/authHelper");
const { sendResetPasswordEmail } = require("../../services/emailService");
const { generate2FACode } = require("../../helpers/send2FACode");

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Generating a JWT token for password reset
  const token = generateResetToken(user);

  // Generating a temporary confirmation code (6-digit)
  const tempConfirmationCode = generate2FACode();

  // Storing the confirmation code and its expiry in the database
  user.resetConfirmationCode = tempConfirmationCode;
  user.resetCodeExpires = Date.now() + 10 * 60 * 1000; // setting the resetCodeExpires to 10 minutes
  await user.save();

  // Send the reset password email
  await sendResetPasswordEmail(user, token, tempConfirmationCode);

  return res.status(200).json({
    message:
      "Password reset email sent. Please check your email for the confirmation code.",
  });
};

const resetPassword = async (req, res) => {
  const { token, newPassword, confirmationCode } = req.body;

  const { valid, decoded, message } = verifyToken(token);
  if (!valid) {
    return res.status(400).json({ message });
  }

  // Finding the user by ID from the decoded token
  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Checking if the confirmation code matches and has not expired
  if (confirmationCode !== user.resetConfirmationCode) {
    return res.status(400).json({ message: "Invalid confirmation code" });
  }

  if (Date.now() > user.resetCodeExpires) {
    return res.status(400).json({ message: "Confirmation code has expired" });
  }

  // Hashing the new password
  const hashedPassword = await hashPassword(newPassword);
  user.password = hashedPassword;

  // Clearing the reset fields after successful reset
  user.resetConfirmationCode = null;
  user.resetCodeExpires = null;

  await user.save();

  return res.status(200).json({ message: "Password reset successfully" });
};

module.exports = {
  requestPasswordReset,
  resetPassword,
};
