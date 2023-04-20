import { BaseRepository } from 'src/core/db/repositories/BaseRepository';
import { ConfigurationError } from 'src/core/errors';
import { USER_CREATED_SUI_EVENT_NAME } from 'src/core/sui-blockchain/constants';
import { cleanEventType } from 'src/core/sui-blockchain/utils';
import { handleNewSuiUser } from 'src/core/sui-index/mapping';
import { log } from 'src/core/utils/logger';
import { BaseSuiEventModel } from 'src/models/sui-event-models';

const eventToHandler: Record<string, Function> = {};
eventToHandler[USER_CREATED_SUI_EVENT_NAME] = handleNewSuiUser;

export async function processSuiIndexing(eventModel: BaseSuiEventModel) {
  log(`Starting indexing event ${JSON.stringify(eventModel, null, 2)}`);

  const eventName = cleanEventType(eventModel.type);
  const handler = eventToHandler[eventName];
  if (!handler) {
    throw new ConfigurationError(
      `Handler for event ${eventName} is not configured`
    );
  }
  await BaseRepository.transaction(handler, eventModel);
  await handler(eventModel);
  return eventModel;
}
