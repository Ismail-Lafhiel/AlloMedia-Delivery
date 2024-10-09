const express = require("express");
const router = express.Router();

const registerRoute = require("./auth/registerRoute");
const loginRoute = require("./auth/loginRoute");
const confirmEmailRoute = require("./auth/confirmEmailRoute");
const logoutRoute = require("./auth/logoutRoute");
const requestResetPasswordRoute = require("./auth/requestResetPasswordRoute");
const resetPasswordRoute = require("./auth/resetPasswordRoute");
const TwoFactorAuthenticationRoute = require("./auth/TwoFactorAuthenticationRoute");
const resendTwoFactorCodeRoute = require("./auth/resendTwoFactorCodeRoute");
const checkAuth = require("../middlewares/checkAuth");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.use("/register", checkAuth, registerRoute);
router.use("/login", checkAuth, loginRoute);
router.use("/confirm-email", confirmEmailRoute);
router.use("/logout", authenticateToken, logoutRoute);
router.use("/request-password-reset", requestResetPasswordRoute);
router.use("/verify-2fa", TwoFactorAuthenticationRoute);
router.use("/resend-code", resendTwoFactorCodeRoute);
router.use("/reset-password", resetPasswordRoute);
module.exports = router;
