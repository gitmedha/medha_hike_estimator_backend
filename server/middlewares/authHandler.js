const db = require('../config/db');


function isAuthenticated(req, res, next) {
  console.log("Session data:", req.session);
  if (req.session && req.session.user) {
    console.log("Authenticated user:", req.session.user);
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}



module.exports = {
    isAuthenticated
};