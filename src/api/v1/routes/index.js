const express = require("express");
const router = express.Router();

const registerRoute = require("./auth/registerRoute");
const loginRoute = require("./auth/loginRoute");
const confirmEmailRoute = require("./auth/confirmEmailRoute");
const checkAuth = require("../middlewares/checkAuth");

router.use("/register", checkAuth, registerRoute);
router.use("/login", checkAuth, loginRoute);
router.use("/confirm-email", confirmEmailRoute);

module.exports = router;
