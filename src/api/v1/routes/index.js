const express = require('express');
const router = express.Router();

const registerRoute = require('./auth/registerRoute');
// const loginRoute = require('./auth/loginRoute');

router.use('/register', registerRoute);
// router.use('/login', loginRoute);

module.exports = router;
