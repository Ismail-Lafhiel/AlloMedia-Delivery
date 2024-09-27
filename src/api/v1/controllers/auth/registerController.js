const { hashPassword, generateToken } = require("../../helpers/authHelper");
const { sendConfirmationEmail } = require("../../services/emailService");
const User = require("../../models/User");

const registerUser = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      emailConfirmed: false,
    });

    // Generate a JWT token for email confirmation
    const token = generateToken(newUser);

    // Send confirmation email with token
    await sendConfirmationEmail(newUser, token);

    return res.status(201).json({
      message: "User registered successfully, please confirm your email.",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

module.exports = {
  registerUser,
};