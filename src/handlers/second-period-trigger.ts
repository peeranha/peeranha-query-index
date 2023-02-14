import { triggerPeriodForSecondDb } from 'src/controllers/blockchain-controller';
import { handleScheduleRequest } from 'src/core/utils/schedule';
import { QueueNames } from 'src/core/utils/sqs';

import { TriggerPeriodRequestModel } from '../models/period-trigger-models';

export const handler = async () => {
  const request = new TriggerPeriodRequestModel(QueueNames.SecondQueue);
  await handleScheduleRequest(request, triggerPeriodForSecondDb);
};
