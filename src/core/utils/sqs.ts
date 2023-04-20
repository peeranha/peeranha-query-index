import AWS from 'aws-sdk';
import fetch from 'cross-fetch';
import { DatabaseManager } from 'src/core/db/db-manager';
import { log, LogLevel } from 'src/core/utils/logger';
import { getSecretValue } from 'src/core/utils/secrets';
import { publishSlackMessage } from 'src/core/utils/slack';

global.fetch = fetch;

const client = new AWS.SQS({
  endpoint: process.env.SQS_ENDPOINT,
  region: process.env.REGION,
});

const QUEUE_URL = `${process.env.SQS_ENDPOINT}/${
  process.env.ENV === 'offline' ? 'queue' : process.env.AWS_ACCOUNT_ID
}/`;

export async function pushToSQS(queueName: string, content: any) {
  try {
    const result = await client
      .sendMessage({
        QueueUrl: QUEUE_URL + queueName,
        MessageBody: JSON.stringify(content),
        MessageGroupId: 'event',
      })
      .promise();
    log(
      `Successfully published event to SQS. Message ID: ${
        result.MessageId
      } Model: ${JSON.stringify(content)}`,
      LogLevel.DEBUG
    );
    return result;
  } catch (err: any) {
    log(`Unable to publish event to SQS. Error: ${err.stack}`);
    throw err;
  }
}

async function handleMessage(
  handlerFunc: (params: any) => any,
  body: any,
  attempt: number
): Promise<boolean> {
  try {
    const result = await handlerFunc(JSON.parse(body));
    log(
      `Handling of SQS event completed with result ${JSON.stringify(result)}`,
      LogLevel.INFO
    );
    return true;
  } catch (error: any) {
    log(
      `Error was found during working on model ${body}\n${error.stack}`,
      LogLevel.DEBUG
    );
    if (attempt === 1) {
      const slackChannel = await getSecretValue('API_ERRORS_SLACK_CHANNEL');
      await publishSlackMessage(
        slackChannel,
        `*API error reported: SQS handler ${handlerFunc.name} execution failed.*\n\`\`\`${error.stack}\`\`\``
      );
    }
    return false;
  }
}

export async function handleSqsEvent(
  handlerFunc: (params: any) => any,
  event: any,
  queueName: string
) {
  await DatabaseManager.initialize(queueName);
  const records = event.Records;
  for (let i = 0; i < records.length; i++) {
    /* eslint-disable no-await-in-loop */
    let isSuccess = false;
    let attempt = 0;
    while (!isSuccess) {
      attempt += 1;
      isSuccess = await handleMessage(handlerFunc, records[i].body, attempt);
    }
  }
}
