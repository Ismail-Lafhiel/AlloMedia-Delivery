const checkAuth = (req, res, next) => {
  if (req.user) {
    // If the user is logged in, return an error message
    return res.status(403).json({ message: "You are already logged in." });
  }
  next();
};

module.exports = checkAuth;