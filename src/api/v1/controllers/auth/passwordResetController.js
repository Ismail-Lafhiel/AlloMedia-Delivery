const User = require("../../models/User");
const {
  generateResetToken,
  verifyToken,
  hashPassword,
} = require("../../helpers/authHelper");
const { sendResetPasswordEmail } = require("../../services/emailService");
const {generate2FACode} = require("../../helpers/send2FACode")

let tempConfirmationCode;

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Generating a JWT token for password reset
  const token = generateResetToken(user);

  // Generating a temporary confirmation code (6-digit)
  tempConfirmationCode = generate2FACode();

  // Sending the reset password email
  await sendResetPasswordEmail(user, token, tempConfirmationCode);

  return res.status(200).json({
    message: "Password reset email sent. Please check your email for the confirmation code.",
    token,
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

  // Checking if the confirmation code is valid
  if (confirmationCode !== tempConfirmationCode) {
    return res.status(400).json({ message: "Invalid confirmation code" });
  }

  const hashedPassword = await hashPassword(newPassword);
  user.password = hashedPassword;
  await user.save();

  // Clearing the temporary confirmation code after use
  tempConfirmationCode = null;

  return res.status(200).json({ message: "Password reset successfully" });
};

module.exports = {
  requestPasswordReset,
  resetPassword,
};
