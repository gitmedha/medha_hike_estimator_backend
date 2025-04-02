const db = require('../config/db');

/**
 * verify user details
 * @returns {object} - The user data
 */
const LoginUser = async (username) => {
  try {
    const user = await db('user_table')
    .select(
      'username',
      'password',
      'id',
      'designation',
      'name',
      'isadmin'
    ).where('username', username);

  return {
    data: user,
  };
    
  } catch (error) {
    console.error(error);
    
  }
 
};

/**
 * register a user
 * @param {String} username
 * @param {String} password
 * @returns {object} - The user data
 */

const RegisterUser = async (username, password,name,isAdmin) => {
    try {
        const user = await db('user_table')
           .insert({
                "username":username,
                "password":password,
                "name":name,
                "isadmin":isAdmin,
            })
            .returning(['username', 'name', 'id', 'designation', 'isadmin']);
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
    RegisterUser
};
