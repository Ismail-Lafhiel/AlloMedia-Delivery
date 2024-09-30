const User = require("../../models/User");
const { comparePassword, generateToken } = require("../../helpers/authHelper");
const { sendFailedLoginNotification } = require("../../services/emailService");

const MAX_FAILED_ATTEMPTS = 3;

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Check if the email is confirmed
    if (!user.emailConfirmed) {
      return res.status(403).json({ message: "Please confirm your email before logging in." });
    }

    // Compare password
    const isMatch = await comparePassword(password, user.password);
    user.lastLoginAttempt = new Date();

    if (!isMatch) {
      // Increment failed login attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      // Check if failed login attempts reached max
      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        await sendFailedLoginNotification(user); // Notify user about the failed attempts
        user.failedLoginAttempts = 0; // Reset after notification
      }

      await user.save();
      return res.status(403).json({ message: "Invalid credentials." });
    }

    // Reset failed login attempts on successful login
    user.failedLoginAttempts = 0;
    await user.save();

    // Generate a JWT token
    const token = generateToken(user);

    return res.status(200).json({
      message: "User logged in successfully.",
      token,
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error: ", error.message);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

module.exports = {
  loginUser,
};
