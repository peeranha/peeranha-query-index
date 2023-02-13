import { DatabaseManager } from 'src/core/db/db-manager';
import { getSecretValue } from 'src/core/utils/secrets';
import { publishSlackMessage } from 'src/core/utils/slack';

import { log, LogLevel } from './logger';

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
  event: any
) {
  await DatabaseManager.initialize();
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
