import { triggerPeriodForDb } from 'src/controllers/blockchain-controller';
import { SECOND_QUEUE } from 'src/core/constants';
import { handleScheduleRequest } from 'src/core/utils/schedule';

import { TriggerPeriodRequestModel } from '../models/period-trigger-models';

export const handler = async () => {
  const request = new TriggerPeriodRequestModel(SECOND_QUEUE);
  await handleScheduleRequest(request, triggerPeriodForDb);
};
