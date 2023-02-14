import { processIndexing } from 'src/controllers/indexing-events-controller';
import { handleSqsEvent, QueueNames } from 'src/core/utils/sqs';

export const handler = async (event: any) => {
  await handleSqsEvent(processIndexing, event, QueueNames.SecondQueue);
};
