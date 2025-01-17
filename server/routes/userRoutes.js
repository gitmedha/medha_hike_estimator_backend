const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const {isAdmin} = require('../middlewares/AuthHandler.js');

router.post('/login_user', [isAdmin,userController.LoginUser]);
router.post('/create_user', userController.createUser);
module.exports = router;
