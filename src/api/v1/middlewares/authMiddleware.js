const jwt = require("jsonwebtoken");
const { isBlacklisted } = require("../utils/tokenBlacklist");
require("dotenv").config();

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized access."  });
  }

  if (isBlacklisted(token)) {
    return res.status(401).json({ message: "Token has been blacklisted." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token." });
    }

    req.user = user;
    next();
  });
};

module.exports = {
  authenticateToken,
};
