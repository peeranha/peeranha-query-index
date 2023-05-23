import { handleListenSecondWebhook } from 'src/controllers/event-listener-controller';
import { handleRequest } from 'src/core/utils/http';
import { EventListenerRequest, Network } from 'src/models/event-models';

export const handler = async (event: any) =>
  handleRequest(EventListenerRequest, handleListenSecondWebhook, {
    ...event,
    network: Network.Polygon,
  });
