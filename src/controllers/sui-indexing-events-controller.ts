import { BaseRepository } from 'src/core/db/repositories/BaseRepository';
import { ConfigurationError } from 'src/core/errors';
import {
  COMMUNITY_CREATED_SUI_EVENT_NAME,
  USER_CREATED_SUI_EVENT_NAME,
  USER_UPDATED_SUI_EVENT_NAME,
  COMMUNITY_UPDATED_SUI_EVENT_NAME,
  TAG_CREATED_SUI_EVENT_NAME,
  TAG_UPDATED_SUI_EVENT_NAME,
  POST_CREATED_SUI_EVENT_NAME,
  REPLY_CREATED_SUI_EVENT_NAME,
  REPLY_EDITED_SUI_EVENT_NAME,
  REPLY_DELETED_SUI_EVENT_NAME,
  REPLY_MARKED_THE_BEST_SUI_EVENT_NAME,
  POST_DELETED_SUI_EVENT_NAME,
  POST_EDITED_SUI_EVENT_NAME,
  COMMENT_CREATED_SUI_EVENT_NAME,
  COMMENT_EDITED_SUI_EVENT_NAME,
  COMMENT_DELETED_SUI_EVENT_NAME,
  ITEM_VOTED_SUI_EVENT_NAME,
  FOLLOWED_COMMUNITY_SUI_EVENT_NAME,
  UNFOLLOWED_COMMUNITY_SUI_EVENT_NAME,
} from 'src/core/sui-blockchain/constants';
import { cleanEventType } from 'src/core/sui-blockchain/utils';
import {
  handleCreateSuiCommunity,
  handleCreateSuiUser,
  handleUpdateSuiUser,
  handleUpdateSuiCommunity,
  handleCreateSuiTag,
  handleUpdateSuiTag,
  handleCreateSuiPost,
  handleCreateSuiReply,
  handleEditSuiReply,
  handleDeleteSuiReply,
  handleChangeStatusBestSuiReply,
  handleEditSuiPost,
  handleDeleteSuiPost,
  handleNewSuiComment,
  handleEditedSuiComment,
  handleDeletedSuiComment,
  handleVoteSuiItem,
  handleFollowSuiCommunity,
  handleUnfollowSuiCommunity,
} from 'src/core/sui-index/mapping';
import { log } from 'src/core/utils/logger';
import { BaseSuiEventModel } from 'src/models/sui-event-models';

const eventToHandler: Record<string, Function> = {};
eventToHandler[USER_CREATED_SUI_EVENT_NAME] = handleCreateSuiUser;
eventToHandler[USER_UPDATED_SUI_EVENT_NAME] = handleUpdateSuiUser;
eventToHandler[COMMUNITY_CREATED_SUI_EVENT_NAME] = handleCreateSuiCommunity;
eventToHandler[COMMUNITY_UPDATED_SUI_EVENT_NAME] = handleUpdateSuiCommunity;
eventToHandler[TAG_CREATED_SUI_EVENT_NAME] = handleCreateSuiTag;
eventToHandler[TAG_UPDATED_SUI_EVENT_NAME] = handleUpdateSuiTag;
eventToHandler[POST_CREATED_SUI_EVENT_NAME] = handleCreateSuiPost;
eventToHandler[POST_EDITED_SUI_EVENT_NAME] = handleEditSuiPost;
eventToHandler[POST_DELETED_SUI_EVENT_NAME] = handleDeleteSuiPost;
eventToHandler[REPLY_CREATED_SUI_EVENT_NAME] = handleCreateSuiReply;
eventToHandler[REPLY_EDITED_SUI_EVENT_NAME] = handleEditSuiReply;
eventToHandler[REPLY_DELETED_SUI_EVENT_NAME] = handleDeleteSuiReply;
eventToHandler[REPLY_MARKED_THE_BEST_SUI_EVENT_NAME] =
  handleChangeStatusBestSuiReply;
eventToHandler[ITEM_VOTED_SUI_EVENT_NAME] = handleVoteSuiItem;
eventToHandler[FOLLOWED_COMMUNITY_SUI_EVENT_NAME] = handleFollowSuiCommunity;
eventToHandler[UNFOLLOWED_COMMUNITY_SUI_EVENT_NAME] =
  handleUnfollowSuiCommunity;

eventToHandler[COMMENT_CREATED_SUI_EVENT_NAME] = handleNewSuiComment;
eventToHandler[COMMENT_EDITED_SUI_EVENT_NAME] = handleEditedSuiComment;
eventToHandler[COMMENT_DELETED_SUI_EVENT_NAME] = handleDeletedSuiComment;

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
