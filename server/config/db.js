const knex = require('knex');
const knexfile = require('../../knexfile');
const environment = process.env.NODE_ENV || 'development';

const db = knex(knexfile[environment]);

db.raw('SELECT 1')
  .then(() => {
    console.log('Database connection established successfully!');
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
  });

module.exports = db;
