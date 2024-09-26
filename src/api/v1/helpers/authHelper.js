const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Number of salt rounds for bcryptjs hashing
// Some users may have the same password, so we need to ensure their hashed values will be different to prevent attackers from using precomputed tables (rainbow tables) to guess the password
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

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
};
