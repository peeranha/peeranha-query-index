import { handleListenWebhook } from 'src/controllers/event-listener-controller';
import { handleRequest } from 'src/core/utils/http';
import { FirstEventListenerRequest } from 'src/models/event-models';

export const handler = async (event: any) =>
  handleRequest(FirstEventListenerRequest, handleListenWebhook, event);