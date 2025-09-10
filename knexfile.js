/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: '127.0.0.1',
      user: 'postgres',
      password: 'Deepak@2721',
      database: 'hike',
    },
    migrations: {
      directory: './knex/migrations',
    },
    seeds: {
      directory: './knex/seeds',
    },
  },
  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
    migrations: {
      directory: './knex/migrations',
    },
    seeds: {
      directory: './knex/seeds',
    },
  },
};
