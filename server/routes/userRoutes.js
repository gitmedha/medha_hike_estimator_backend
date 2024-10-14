const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.post('/login_user', userController.LoginUser);
module.exports = router;
