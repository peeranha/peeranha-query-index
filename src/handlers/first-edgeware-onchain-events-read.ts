import { readEvents } from 'src/controllers/evm-blockchain-controller';
import { handleScheduleRequest } from 'src/core/utils/schedule';
import {
  Network,
  ReadNotificationsRequestModel,
} from 'src/models/event-models';

export const handler = async () => {
  const request = new ReadNotificationsRequestModel(Network.Edgeware);
  await handleScheduleRequest(request, readEvents);
};
