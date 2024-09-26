const authMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized access." });
  }
  next();
};

module.exports = authMiddleware;
