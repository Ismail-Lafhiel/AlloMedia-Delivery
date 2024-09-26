const { body } = require("express-validator");

const validateLogin = [
  body("email").isEmail().withMessage("Must be a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
];
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Invalid credentials",
      errors: errors.array(),
    });
  }
  next();
};

module.exports = {
  validateLogin,
};
