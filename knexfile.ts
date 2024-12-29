import "dotenv/config";

export default {
  development: {
    client: 'pg',
    connection: process.env.CONNECTION_STRING,
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },
  
  test: { // this is a connection to a local database in order to run tests in isolation.
    client: 'pg',
    connection: {
      host: '127.0.0.1',
      user: process.env.USERNAME,
      password: process.env.PASSWORD,
      database: 'matrix_test_db'
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
};