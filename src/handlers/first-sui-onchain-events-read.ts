import { readSuiEvents } from 'src/controllers/sui-blockchain-controller';
import { handleScheduleRequest } from 'src/core/utils/schedule';
import { ReadSuiEventsRequestModel } from 'src/models/sui-models';

export const handler = async () => {
  const request = new ReadSuiEventsRequestModel();
  await handleScheduleRequest(request, readSuiEvents);
};