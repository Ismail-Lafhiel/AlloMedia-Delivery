const User = require("../../models/User");
const {
  generateResetToken,
  verifyToken,
  hashPassword,
} = require("../../helpers/authHelper");
const { sendResetPasswordEmail } = require("../../services/emailService");

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Generating a JWT token for password reset
  const token = generateResetToken(user);

  // Sending the reset password email
  await sendResetPasswordEmail(user, token);

  return res.status(200).json({
    message: "Password reset email sent",
    token,
  });
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  const { valid, decoded, message } = verifyToken(token);
  if (!valid) {
    return res.status(400).json({ message });
  }

  // Finding the user by ID from the decoded token
  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const hashedPassword = await hashPassword(newPassword);
  user.password = hashedPassword;
  await user.save();

  return res.status(200).json({ message: "Password reset successfully" });
};

module.exports = {
  requestPasswordReset,
  resetPassword,
};
