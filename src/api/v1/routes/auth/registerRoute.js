const express = require('express');
const router = express.Router();
const { registerUser } = require('../../controllers/auth/registerController');
const { validateRegistration } = require('../../validations/registerValidation');

router.post('/', validateRegistration, registerUser);

module.exports = router;