import { processIndexing } from 'src/controllers/indexing-events-controller';
import { EDGEWARE_INDEXING_FIRST_QUEUE } from 'src/core/constants';
import { handleSqsEvent } from 'src/core/utils/sqs';

export const handler = async (event: any) => {
  await handleSqsEvent(processIndexing, event, EDGEWARE_INDEXING_FIRST_QUEUE);
};
