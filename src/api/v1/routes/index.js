const express = require("express");
const router = express.Router();

const registerRoute = require("./auth/registerRoute");
const loginRoute = require("./auth/loginRoute");
const checkAuth = require("../middlewares/checkAuth");

router.use("/register", checkAuth, registerRoute);
router.use("/login", checkAuth, loginRoute);

module.exports = router;
