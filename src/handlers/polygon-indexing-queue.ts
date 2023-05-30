import { processIndexing } from 'src/controllers/indexing-events-controller';
import { POLYGON_INDEXING_QUEUE } from 'src/core/constants';
import { handleSqsEvent } from 'src/core/utils/sqs';

export const handler = async (event: any) => {
  await handleSqsEvent(processIndexing, event, POLYGON_INDEXING_QUEUE);
};
