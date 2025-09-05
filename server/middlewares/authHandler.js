const db = require('../config/db');


function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}



module.exports = {
    isAuthenticated
};