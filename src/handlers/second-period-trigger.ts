import { triggerPeriodForDb } from 'src/controllers/blockchain-controller';
import { SECOND_QUEUE } from 'src/core/constants';
import { handleScheduleRequest } from 'src/core/utils/schedule';
import { Network } from 'src/models/event-models';
import { TriggerPeriodRequestModel } from 'src/models/period-trigger-models';

export const handler = async () => {
  const request = new TriggerPeriodRequestModel(SECOND_QUEUE, Network.Polygon);
  await handleScheduleRequest(request, triggerPeriodForDb);
};
