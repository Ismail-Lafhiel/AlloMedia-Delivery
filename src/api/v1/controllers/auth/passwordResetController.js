const User = require("../../models/User");
const {
  generateResetToken,
  verifyToken,
  hashPassword,
} = require("../../helpers/authHelper");
const { sendResetPasswordEmail, send2FACodeEmail } = require("../../services/emailService");
const { generate2FACode } = require("../../helpers/send2FACode");

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Generate a temporary 2FA confirmation code (6-digit)
  const tempConfirmationCode = generate2FACode();

  // Store the confirmation code and its expiry in the database
  user.resetConfirmationCode = tempConfirmationCode;
  user.resetCodeExpires = Date.now() + 10 * 60 * 500; // Code expires in 5 minutes
  await user.save();

  // Send the 2FA code via email
  await send2FACodeEmail(user, tempConfirmationCode);

  return res.status(200).json({
    message: "2FA code sent to your email. Please verify to proceed with password reset.",
  });
};

// Verify 2FA code and send the reset link
const verifyTwoFactorAuthentication = async (req, res) => {
  const { email, confirmationCode } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Check if the confirmation code matches and has not expired
  if (confirmationCode !== user.resetConfirmationCode) {
    return res.status(400).json({ message: "Invalid confirmation code" });
  }

  if (Date.now() > user.resetCodeExpires) {
    return res.status(400).json({ message: "Confirmation code has expired" });
  }

  // Generating a JWT token for password reset
  const token = generateResetToken(user);

  // Sending the reset password email with the token and confirmation code
  await sendResetPasswordEmail(user, token, user.resetConfirmationCode);

  // Clearing the confirmation code after successful verification
  user.resetConfirmationCode = null;
  user.resetCodeExpires = null;
  await user.save();

  return res.status(200).json({
    message: "2FA verified. Password reset email sent.",
  });
};

const resendTwoFactorCode = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Generating a new temporary 2FA confirmation code (6-digit)
  const newConfirmationCode = generate2FACode();

  // Updating the confirmation code and its expiry in the database
  user.resetConfirmationCode = newConfirmationCode;
  user.resetCodeExpires = Date.now() + 10 * 60 * 500;
  await user.save();

  await send2FACodeEmail(user, newConfirmationCode);

  return res.status(200).json({
    message: "New 2FA code sent to your email. Please verify to proceed.",
  });
};

// Reset the password
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  const { valid, decoded, message } = verifyToken(token);
  if (!valid) {
    return res.status(400).json({ message });
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Hash the new password
  const hashedPassword = await hashPassword(newPassword);
  user.password = hashedPassword;

  // Clear reset fields
  user.resetConfirmationCode = null;
  user.resetCodeExpires = null;

  await user.save();

  return res.status(200).json({ message: "Password reset successfully" });
};

module.exports = {
  requestPasswordReset,
  verifyTwoFactorAuthentication,
  resendTwoFactorCode,
  resetPassword,
};