const express = require("express");
const {
  requestPasswordReset,
} = require("../../controllers/auth/passwordResetController");
const router = express.Router();

router.post("/", requestPasswordReset);

module.exports = router;
