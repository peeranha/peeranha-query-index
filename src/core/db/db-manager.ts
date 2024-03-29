import MySql from 'serverless-mysql';
import { credentialsSecret } from 'src/core/constants';
import { ConfigurationError } from 'src/core/errors';
import { log, LogLevel } from 'src/core/utils/logger';
import { getSecretValue } from 'src/core/utils/secrets';

const Knex = require('knex');
const knexServerlessMysql = require('knex-serverless-mysql');

export class DatabaseManager {
  private static instance: any;

  public static async initialize(queueName: string) {
    if (this.instance) {
      log('Reusing existing instance of database manager.', LogLevel.INFO);
      return;
    }

    log('Initializing database manager.', LogLevel.INFO);
    const secret = credentialsSecret[queueName]!;
    const credentials = JSON.parse(await getSecretValue(secret));

    if (!(process.env.DB_NAME && credentials)) {
      throw new ConfigurationError(`${secret} or DB_NAME are not set`);
    }

    const mysql = MySql({
      config: {
        host: credentials.host,
        database: process.env.DB_NAME,
        user: credentials.username,
        password: credentials.password,
        charset: 'utf8mb4_unicode_ci',
      },
    });

    this.instance = Knex({
      client: knexServerlessMysql,
      mysql,
    });
    log('Database instance has been created', LogLevel.DEBUG);
  }

  public static getInstance() {
    return this.instance;
  }
}
