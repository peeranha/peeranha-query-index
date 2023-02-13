import { triggerPeriodForDb } from 'src/controllers/blockchain-controller';
import { handleScheduleRequest } from 'src/core/utils/schedule';

import { TriggerPeriodRequestModel } from '../models/period-trigger-models';

export const handler = async () => {
  const request = new TriggerPeriodRequestModel();
  await handleScheduleRequest(request, triggerPeriodForDb);
};
