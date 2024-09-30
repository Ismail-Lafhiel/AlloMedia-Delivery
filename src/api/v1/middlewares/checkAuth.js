const checkAuth = (req, res, next) => {
  if (req.user) {
    return res.status(401).json({ message: "You are already logged in." });
  }
  next();
};

module.exports = checkAuth;
