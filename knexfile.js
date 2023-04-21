require('dotenv').config();

/**
 * @type { Object.<string, import("knex").Knex.MySqlConnectionConfig> }
 */
module.exports = {
  client: 'mysql',
  connection: {
    host: '127.0.0.1',
    port: 3306,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'offline_cluster',
    multipleStatements: true,
    charset: 'utf8mb4',
  },
};
