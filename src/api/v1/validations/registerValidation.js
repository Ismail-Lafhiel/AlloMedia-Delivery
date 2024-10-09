const { body, validationResult } = require("express-validator");

const validateRegistration = [
  body("first_name")
    .notEmpty()
    .withMessage("First name is required")
    .isString()
    .withMessage("First name must be a string")
    .matches(/^[A-Za-z]+$/)
    .withMessage("First name must contain only letters")
    .isLength({ min: 3 })
    .withMessage("First name must be at least 3 characters long"),

  body("last_name")
    .notEmpty()
    .withMessage("Last name is required")
    .isString()
    .withMessage("Last name must be a string")
    .matches(/^[A-Za-z]+$/)
    .withMessage("Last name must contain only letters")
    .isLength({ min: 3 })
    .withMessage("Last name must be at least 3 characters long"),

  body("email").isEmail().withMessage("Email is invalid"),

  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .isString()
    .withMessage("Phone number must be a string")
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage("Phone number must be valid and in international format"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Confirm password does not match password");
    }
    return true;
  }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }
    next();
  },
];

module.exports = {
  validateRegistration,
};
