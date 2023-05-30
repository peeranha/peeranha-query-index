import { processSuiContentIndexing } from 'src/controllers/sui-content-controller';
import { SUI_CONTENT_QUEUE } from 'src/core/constants';
import { handleSqsEvent } from 'src/core/utils/sqs';

export const handler = async (event: any) => {
  await handleSqsEvent(
    processSuiContentIndexing,
    event,
    SUI_CONTENT_QUEUE
  );
};
