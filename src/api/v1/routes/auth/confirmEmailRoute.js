const express = require('express');
const { emailConfirmation } = require('../../controllers/auth/confirmEmailController');

const router = express.Router();

router.post('/', emailConfirmation);

module.exports = router;
