import { processSuiIndexing } from 'src/controllers/sui-indexing-events-controller';
import { SUI_INDEXING_QUEUE } from 'src/core/constants';
import { handleSqsEvent } from 'src/core/utils/sqs';

export const handler = async (event: any) => {
  await handleSqsEvent(processSuiIndexing, event, SUI_INDEXING_QUEUE);
};
