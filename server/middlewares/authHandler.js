const db = require('../config/db');
const jwt = require('jsonwebtoken');

const isAdmin = async (req,res,next)=>{
    try {
        const user = await db('user_table')
       .select('isadmin')
       .where('username', req.body.username);
       
         if(!user[0]){
             return res.status(404).json({ message: "User not found." });
         }

         if(user[0].isadmin){
             req.isAdmin = true;
              return next();
         }
         else {
            req.isAdmin = false
            return next();
         }
        
    } catch (error) {
        return res.status(500).json({ error: error.message }); 
    }
}



module.exports = {
    isAdmin
};