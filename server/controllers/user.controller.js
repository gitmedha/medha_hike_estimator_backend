const userServices = require('../services/user.services');

/**
 * @param {object} req
 * @param {object} res
 */
const LoginUser = async (req, res) => {
  try {

    const username = (req.body.username) || 0;
    const password = (req.body.password) || 0;

    const result = await userServices.LoginUser(username);
    if (!result) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const isPasswordValid = await userServices.comparePassword(result.data[0].password,password);

    // if (!isPasswordValid) return res.status(401).json({ error: 'Invalid password' });

    // Generate JWT token for authenticated user
    const token = await userServices.generateToken(result.data[0]);

    // Return user data and JWT token
    res.status(200).json({data:result.data, token:token});
  } catch (error) {
console.error(error);
    res.status(500).json({ error: 'Error Login User', details: error.message });
  }
};

module.exports = {
    LoginUser,
};
