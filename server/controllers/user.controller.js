const userServices = require('../services/user.services');
const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');


/**
 * @param {object} req
 * @param {object} res
 */
const LoginUser = async (req, res) => {
  try {
    const userName = req.body.username || "";
    const userPassword = req.body.password || "";

    const {data} = await userServices.LoginUser(userName);

    if (!data || data.length === 0) {
      return res.status(401).json({ error: "Invalid username" });
    }
    const [user] = data;

    const { username, isadmin, id, password } = user;

    const isPasswordValid = await userServices.comparePassword(
      password,
      userPassword
    );
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

      const token = jwt.sign(
      { 
        userId:id,
        username: username,
        isAdmin: isadmin
      },
      process.env.JWT_SECRET || 'hikeAppLocalSecretKey',
      { expiresIn: '1h' }
    );

    const { password: _, ...safeUser } = user;

    return res.status(200).json({
      message: "Login successful",
      token,
      user: safeUser,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error Login User",
      details: error.message,
    });
  }
};


/**
 * @param {object} req
 * @param {object} res
 */

const createUser = async(req, res) => {
  try {
    const { name,username, password, adminUser, adminPwd, isAdmin} = req.body;  
//validate the admin credentials
    if(adminUser && adminPwd){
      // Fetch stored admin credentials from database
      const {data} = await userModel.LoginUser(adminUser);
      if(!data.length) return res.status(401).json({ error: 'Invalid admin username' });
      const adminPassword = data[0].password;
      // Compare admin credentials with stored credentials
      const isAdminCredentialsValid = await userServices.comparePassword(adminPassword, adminPwd);
      if(!isAdminCredentialsValid) return res.status(401).json({ error: 'Invalid admin credentials' });
    } else {
      return res.status(401).json({ error: 'Admin credentials are required' });
    }

//validate the user credentials

    if (!username ||!password || !name) return res.status(400).json({ error: 'Username and password are required' });
    const result =await userServices.RegisterUser(username, password,name,isAdmin);
    const token = await userServices.generateToken(result.data[0]);

    res.status(201).json({ data: result.data , token:token});


  }
  catch(err) {
    console.error(err);
    return res.status(400).json({ error: 'Invalid request' , message: err.message });
  }
}

module.exports = {
    LoginUser,
    createUser
};
