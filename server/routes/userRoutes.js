const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken } = require('../middlewares/authHandler.js');

router.post('/login_user', userController.LoginUser);
router.post('/create_user', userController.createUser);


router.get('/me', authenticateToken, (req, res) => {
  return res.json({ message: 'Protected data', user: req.user });
});

module.exports = router;
