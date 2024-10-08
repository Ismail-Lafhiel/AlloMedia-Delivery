const express = require("express");
const {
  resendTwoFactorCode,
} = require("../../controllers/auth/passwordResetController");
const router = express.Router();

router.post("/", resendTwoFactorCode);

module.exports = router;
