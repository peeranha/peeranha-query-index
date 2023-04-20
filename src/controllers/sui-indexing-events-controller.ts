import { BaseRepository } from 'src/core/db/repositories/BaseRepository';
import { ConfigurationError } from 'src/core/errors';
import {
  COMMUNITY_CREATED_SUI_EVENT_NAME,
  USER_CREATED_SUI_EVENT_NAME,
  USER_UPDATED_SUI_EVENT_NAME,
} from 'src/core/sui-blockchain/constants';
import { cleanEventType } from 'src/core/sui-blockchain/utils';
import {
  handleCreateSuiCommunity,
  handleCreateSuiUser,
  handleUpdateSuiUser,
} from 'src/core/sui-index/mapping';
import { log } from 'src/core/utils/logger';
import { BaseSuiEventModel } from 'src/models/sui-event-models';

const eventToHandler: Record<string, Function> = {};
eventToHandler[USER_CREATED_SUI_EVENT_NAME] = handleCreateSuiUser;
eventToHandler[USER_UPDATED_SUI_EVENT_NAME] = handleUpdateSuiUser;
eventToHandler[COMMUNITY_CREATED_SUI_EVENT_NAME] = handleCreateSuiCommunity;

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
  return eventModel;
}
