const db = require('../config/db');

/**
 * verify user details
 * @returns {object} - The user data
 */
const LoginUser = async (username) => {
  const user = await db('user_table')
    .select(
      'username',
      'password',
      'id',
      'designation'
    ).where('username', username);

  return {
    data: user,
  };
};

/**
 * register a user
 * @param {String} username
 * @param {String} password
 * @returns {object} - The user data
 */

const RegisterUser = async (username, password) => {
    try {
        const user = await db('user_table')
           .insert({
                username,
                password
            })
        return {
            data: user,
        };

    } catch (error) {
        console.error(error);
        throw new Error('Failed to register user'); 
    }
}

module.exports = {
    LoginUser,
};
