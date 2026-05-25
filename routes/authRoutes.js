const express = require('express');
const { register, login } = require('../controllers/authController');
const { signupValidator, loginValidator } = require('../utils/validators');
const validate = require('../middleware/validation');

const router = express.Router();

router.post('/signup', signupValidator, validate, register);
router.post('/login', loginValidator, validate, login);

module.exports = router;
