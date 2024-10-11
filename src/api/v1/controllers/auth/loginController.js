const User = require("../../models/User");
const { comparePassword, generateToken } = require("../../helpers/authHelper");
const { sendFailedLoginNotification } = require("../../services/emailService");

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_TIME = 60 * 60 * 1000; // 1 hour

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(403).json({ message: "Invalid credentials." });
    }

    // Check if the user is locked out
    if (user.isLocked) {
      const now = new Date();
      if (now < user.lockoutUntil) {
        const remainingTime = Math.ceil((user.lockoutUntil - now) / 1000);
        return res.status(403).json({
          message: `Maximum login attempts reached. Please try again in ${remainingTime} seconds.`,
          lockout: true,
        });
      } else {
        // Reset lockout status if the lockout period has expired
        user.isLocked = false;
        user.failedLoginAttempts = 0;
        user.lockoutUntil = null;
        await user.save(); // Saving changes after reset
      }
    }

    // Checking if the email is confirmed
    if (!user.emailConfirmed) {
      return res
        .status(403)
        .json({ message: "Please confirm your email before logging in." });
    }

    // Compare password
    const isMatch = await comparePassword(password, user.password);
    user.lastLoginAttempt = new Date();

    if (!isMatch) {
      // Increment failed login attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      // Check if failed login attempts reached max
      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.isLocked = true;
        user.lockoutUntil = new Date(Date.now() + LOCKOUT_TIME);
        await sendFailedLoginNotification(user);
        await user.save();
        return res.status(403).json({
          message: "You have been locked out due to too many failed attempts.",
          lockout: true,
        });
      }

      await user.save(); // Saving failed attempts
      return res.status(403).json({ message: "Invalid credentials." });
    }

    // Reset failed login attempts on successful login
    user.failedLoginAttempts = 0;
    user.isLocked = false;
    user.lockoutUntil = null;
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
    return res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

module.exports = {
  loginUser,
};