const { body } = require("express-validator");

const validateLogin = [
  body("email").isEmail().withMessage("Must be a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
];

module.exports = {
  validateLogin,
};
