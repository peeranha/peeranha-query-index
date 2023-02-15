import { handleListenFirstWebhook } from 'src/controllers/event-listener-controller';
import { handleRequest } from 'src/core/utils/http';
import { EventListenerRequest } from 'src/models/event-models';

export const handler = async (event: any) =>
  handleRequest(EventListenerRequest, handleListenFirstWebhook, event);
