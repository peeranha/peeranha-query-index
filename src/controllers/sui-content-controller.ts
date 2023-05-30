import {
  eventsForChangePostContent,
  eventsForTranslations,
} from 'src/controllers/sui-indexing-events-controller';
import { BaseRepository } from 'src/core/db/repositories/BaseRepository';
import { cleanEventType } from 'src/core/sui-blockchain/utils';
import {
  updateSuiPostContent,
  updateTranslations,
} from 'src/core/sui-index/post';
import { log } from 'src/core/utils/logger';
import { BaseSuiEventModel } from 'src/models/sui-event-models';

export async function processSuiContentIndexing(eventModel: BaseSuiEventModel) {
  const eventName = cleanEventType(eventModel.type);

  if (eventsForTranslations.includes(eventName)) {
    log(`Updating translations. Model ${JSON.stringify(eventModel)}`);
    await BaseRepository.transaction(updateTranslations, eventModel);
  }

  if (eventsForChangePostContent.includes(eventName)) {
    log(`Updating post content. Model ${JSON.stringify(eventModel)}`);
    await BaseRepository.transaction(updateSuiPostContent, eventModel);
  }

  return eventModel;
}
