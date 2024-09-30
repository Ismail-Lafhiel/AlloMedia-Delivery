const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const SALT_ROUNDS = 10;

const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error("Error while hashing the password");
  }
};

const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error("Error while comparing passwords");
  }
};

const generateToken = (user) => {
  try {
    const payload = {
      id: user._id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
  } catch (error) {
    throw new Error("Error while generating JWT token");
  }
};

// Confirm email helper function
const confirmEmail = async (token, User) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return { success: false, message: "Invalid token or user not found" };
    }

    if (user.emailConfirmed) {
      return { success: false, message: "Email already confirmed" };
    }

    user.emailConfirmed = true;
    await user.save();

    return { success: true, message: "Email confirmed successfully" };
  } catch (error) {
    return { success: false, message: "Invalid or expired token" };
  }
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, message: "Invalid or expired token." };
  }
};

const generateResetToken = (user) => {
  try {
    const payload = {
      id: user._id,
      email: user.email,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
  } catch (error) {
    throw new Error("Error while generating reset token");
  }
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  confirmEmail,
  verifyToken,
  generateResetToken,
};
