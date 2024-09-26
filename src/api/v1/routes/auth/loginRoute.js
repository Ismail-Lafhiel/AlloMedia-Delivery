const express = require('express');
const router = express.Router();
const { loginUser } = require('../../controllers/auth/loginController');
const { validateLogin } = require('../../validations/loginValidation');

router.post('/', validateLogin, loginUser);

module.exports = router;