const { confirmEmail } = require("../../helpers/authHelper");
const User = require("../../models/User");

const emailConfirmation = async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  const result = await confirmEmail(token, User);

  if (!result.success) {
    return res.status(400).json({ message: result.message });
  }

  // Redirect to login page with success message
  return res.redirect(
    `${process.env.FRONTEND_URL}/login?message=Email successfully verified`
  );
};

module.exports = {
  emailConfirmation,
};
