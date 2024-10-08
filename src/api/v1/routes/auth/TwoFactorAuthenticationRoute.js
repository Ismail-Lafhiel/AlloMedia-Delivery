const express = require("express");
const { verifyTwoFactorAuthentication } = require("../../controllers/auth/passwordResetController");
const router = express.Router();

router.post("/", verifyTwoFactorAuthentication);

module.exports = router;
