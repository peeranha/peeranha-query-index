import MySql from 'serverless-mysql';
import { ConfigurationError } from 'src/core/errors';
import { log, LogLevel } from 'src/core/utils/logger';
import { getSecretValue } from 'src/core/utils/secrets';
import { QueueNames } from 'src/core/utils/sqs';

const Knex = require('knex');
const knexServerlessMysql = require('knex-serverless-mysql');

const FIRST_CLUSTER_CREDENTIALS = 'FIRST_CLUSTER_CREDENTIALS';
const SECOND_CLUSTER_CREDENTIALS = 'SECOND_CLUSTER_CREDENTIALS';

const credentialsSecret: { [index: string]: string } = {
  [QueueNames.FirstQueue]: FIRST_CLUSTER_CREDENTIALS,
  [QueueNames.SecondQueue]: SECOND_CLUSTER_CREDENTIALS,
};

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
