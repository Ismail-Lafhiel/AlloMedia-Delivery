const express = require("express");
const router = express.Router();

const registerRoute = require("./auth/registerRoute");
const loginRoute = require("./auth/loginRoute");
const confirmEmailRoute = require("./auth/confirmEmailRoute");
const logoutRoute = require("./auth/logoutRoute");
const checkAuth = require("../middlewares/checkAuth");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.use("/register", checkAuth, registerRoute);
router.use("/login", checkAuth, loginRoute);
router.use("/confirm-email", confirmEmailRoute);
router.use("/logout", authenticateToken, logoutRoute);
module.exports = router;
