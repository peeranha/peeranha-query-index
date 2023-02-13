import MySql from 'serverless-mysql';
import { ConfigurationError } from 'src/core/errors';
import { log, LogLevel } from 'src/core/utils/logger';
import { getSecretValue } from 'src/core/utils/secrets';

const Knex = require('knex');
const knexServerlessMysql = require('knex-serverless-mysql');

export class DatabaseManager {
  private static instance: any;

  public static async initialize() {
    if (this.instance) {
      log('Reusing existing instance of database manager.', LogLevel.INFO);
      return;
    }

    log('Initializing database manager.', LogLevel.INFO);
    const credentials = JSON.parse(await getSecretValue('CLUSTER_CREDENTIALS'));

    if (!(process.env.DB_NAME && credentials)) {
      throw new ConfigurationError(
        'CLUSTER_CREDENTIALS OR DB_NAME are not set'
      );
    }

    const mysql = MySql({
      config: {
        host: credentials.host,
        database: process.env.DB_NAME,
        user: credentials.username,
        password: credentials.password,
        typeCast: function castField(field: any, useDefaultTypeCasting: any) {
          if (field.type === 'BIT' && field.length === 1) {
            const bytes = field.buffer();
            return bytes[0] === 1;
          }
          return useDefaultTypeCasting();
        },
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
