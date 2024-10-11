const jwt = require("jsonwebtoken");
const { addToBlacklist } = require("../../utils/tokenBlacklist");
const { verifyToken } = require("../../helpers/authHelper");
require("dotenv").config();

const logoutUser = (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided." });
    }

    // Verifying the token before logging out
    const { valid, message } = verifyToken(token);
    
    if (!valid) {
      return res.status(401).json({ message });
    }

    // Adding token to the blacklist
    addToBlacklist(token);

    // Clearing the cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error during logout.",
    });
  }
};

module.exports = {
  logoutUser,
};