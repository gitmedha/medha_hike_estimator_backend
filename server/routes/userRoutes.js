const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const {isAuthenticated} = require('../middlewares/authHandler.js');

router.post('/login_user', userController.LoginUser);
router.post('/create_user', userController.createUser);
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("connect.sid"); // clear session cookie
    res.json({ message: "Logged out successfully" });
  });
});

router.get('/me', isAuthenticated, (req, res) => {
  res.json(req.session.user);
});

module.exports = router;
