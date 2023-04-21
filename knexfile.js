require('dotenv').config();

/**
 * @type { Object.<string, import("knex").Knex.MySqlConnectionConfig> }
 */
module.exports = {
  client: 'mysql',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
    charset: 'utf8mb4',
  },
};
