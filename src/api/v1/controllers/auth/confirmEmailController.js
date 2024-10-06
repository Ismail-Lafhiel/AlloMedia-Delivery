const { confirmEmail } = require("../../helpers/authHelper");
const User = require("../../models/User");

const emailConfirmation = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  // Calling the confirmEmail helper with the token
  const result = await confirmEmail(token, User);

  if (!result.success) {
    return res.status(400).json({ message: result.message });
  }

  return res.status(200).json({ message: result.message });
};

module.exports = {
  emailConfirmation,
};