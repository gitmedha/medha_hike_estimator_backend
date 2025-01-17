const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Get Log in user
 * @param {String} username - The username 
 * @returns {object} - The matched user details
 */
const LoginUser = async (username) => {
  const result = await userModel.LoginUser(username);

  return {
    data: result.data
  };
};

/**
 * hashed password for user account
 * @param {String} password - password
 * @returns {Hash} - The Hashed password
 */

const HashPassword = async (password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
};

/**
 * hashed password for user account
 * @param {String} user-fetched user details from database
 * @param {String} password - password
 * @returns {Boolean} true if password matches, false otherwise 
 */

const comparePassword = async (user,password) => {   
    return await bcrypt.compare(password, user);
  };

/**
 * Register User
 * @param {String} username - The username
 * @param {String} password - The password
 * @returns {object} - The registered user details
 * */

const RegisterUser = async (username, password,name) => {
  const hashedPassword = await HashPassword(password);
  const result = await userModel.RegisterUser(username, hashedPassword,name);
  return {
    data: result.data
  };
};

/**
 * Generate the jwt token
 * @param {String} user - The user details
 * @returns {String} - the auth token
 * */

const generateToken = async (user) => {
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'my_secret', {
        expiresIn: '6h',
      });
      return token;
};



module.exports = {
    LoginUser,
    HashPassword,
    generateToken,
    comparePassword,
    RegisterUser
};
