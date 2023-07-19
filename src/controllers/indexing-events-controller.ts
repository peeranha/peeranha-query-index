import {
  ITEM_VOTED_EVENT_NAME,
  REPLY_MARKED_THE_BEST_EVENT_NAME,
  POST_CREATED_EVENT_NAME,
  POST_EDITED_EVENT_NAME,
  REPLY_EDITED_EVENT_NAME,
  COMMENT_EDITED_EVENT_NAME,
  USER_CREATED_EVENT_NAME,
  USER_UPDATED_EVENT_NAME,
  FOLLOWED_COMMUNITY_EVENT_NAME,
  UNFOLLOWED_COMMUNITY_EVENT_NAME,
  ROLE_GRANTED_EVENT_NAME,
  ROLE_REVOKED_EVENT_NAME,
  COMMUNITY_CREATED_EVENT_NAME,
  COMMUNITY_UPDATED_EVENT_NAME,
  COMMUNITY_FROZEN_EVENT_NAME,
  COMMUNITY_UNFROZEN_EVENT_NAME,
  TAG_CREATED_EVENT_NAME,
  TAG_UPDATED_EVENT_NAME,
  POST_DELETED_EVENT_NAME,
  CHANGE_POST_TYPE_EVENT_NAME,
  REPLY_DELETED_EVENT_NAME,
  COMMENT_DELETED_EVENT_NAME,
  CONFIGURE_NEW_ACHIEVEMENT_EVENT_NAME,
  TRANSFER_EVENT_NAME,
  TRANSLATION_CREATED_EVENT_NAME,
  TRANSLATION_EDITED_EVENT_NAME,
  TRANSLATION_DELETED_EVENT_NAME,
  GET_REWARD_EVENT_NAME,
  SET_DOCUMENTATION_TREE_EVENT_NAME,
  REPLY_CREATED_EVENT_NAME,
  COMMENT_CREATED_EVENT_NAME,
} from 'src/core/blockchain/constants';
import { BaseRepository } from 'src/core/db/repositories/BaseRepository';
import { ConfigurationError } from 'src/core/errors';
import {
  handleChangedTypePost,
  handleUpdatedUser,
  handleConfigureNewAchievement,
  handleDeletedComment,
  handleDeletedPost,
  handleDeletedReply,
  handleEditedComment,
  handleEditedPost,
  handleEditedReply,
  handleEditedTag,
  handleFrozenCommunity,
  handleGetReward,
  handleNewComment,
  handleNewCommunity,
  handleNewPost,
  handleNewReply,
  handleNewTag,
  handleNewUser,
  handlerChangedStatusBestReply,
  handlerFollowCommunity,
  handlerForumItemVoted,
  handlerGrantedRole,
  handlerRevokedRole,
  handlerUnfollowCommunity,
  handleTransfer,
  handleUnfrozenCommunity,
  handleUpdatedCommunity,
  handlerSetDocumentationTree,
  handlerTranslationCreated,
  handlerTranslationEdited,
  handlerTranslationDeleted,
} from 'src/core/index/mapping';
import { log } from 'src/core/utils/logger';

const eventToHandler: Record<string, Function> = {};
eventToHandler[POST_CREATED_EVENT_NAME] = handleNewPost;
eventToHandler[POST_EDITED_EVENT_NAME] = handleEditedPost;
eventToHandler[USER_CREATED_EVENT_NAME] = handleNewUser;
eventToHandler[USER_UPDATED_EVENT_NAME] = handleUpdatedUser;
eventToHandler[ROLE_GRANTED_EVENT_NAME] = handlerGrantedRole;
eventToHandler[ROLE_REVOKED_EVENT_NAME] = handlerRevokedRole;
eventToHandler[FOLLOWED_COMMUNITY_EVENT_NAME] = handlerFollowCommunity;
eventToHandler[UNFOLLOWED_COMMUNITY_EVENT_NAME] = handlerUnfollowCommunity;
eventToHandler[COMMUNITY_CREATED_EVENT_NAME] = handleNewCommunity;
eventToHandler[COMMUNITY_UPDATED_EVENT_NAME] = handleUpdatedCommunity;
eventToHandler[COMMUNITY_FROZEN_EVENT_NAME] = handleFrozenCommunity;
eventToHandler[COMMUNITY_UNFROZEN_EVENT_NAME] = handleUnfrozenCommunity;
eventToHandler[TAG_CREATED_EVENT_NAME] = handleNewTag;
eventToHandler[TAG_UPDATED_EVENT_NAME] = handleEditedTag;
eventToHandler[CHANGE_POST_TYPE_EVENT_NAME] = handleChangedTypePost;
eventToHandler[POST_DELETED_EVENT_NAME] = handleDeletedPost;
eventToHandler[REPLY_CREATED_EVENT_NAME] = handleNewReply;
eventToHandler[REPLY_EDITED_EVENT_NAME] = handleEditedReply;
eventToHandler[REPLY_DELETED_EVENT_NAME] = handleDeletedReply;
eventToHandler[COMMENT_CREATED_EVENT_NAME] = handleNewComment;
eventToHandler[COMMENT_EDITED_EVENT_NAME] = handleEditedComment;
eventToHandler[COMMENT_DELETED_EVENT_NAME] = handleDeletedComment;
eventToHandler[GET_REWARD_EVENT_NAME] = handleGetReward;
eventToHandler[REPLY_MARKED_THE_BEST_EVENT_NAME] =
  handlerChangedStatusBestReply;
eventToHandler[CONFIGURE_NEW_ACHIEVEMENT_EVENT_NAME] =
  handleConfigureNewAchievement;
eventToHandler[TRANSFER_EVENT_NAME] = handleTransfer;
eventToHandler[ITEM_VOTED_EVENT_NAME] = handlerForumItemVoted;
eventToHandler[SET_DOCUMENTATION_TREE_EVENT_NAME] = handlerSetDocumentationTree;
eventToHandler[TRANSLATION_CREATED_EVENT_NAME] = handlerTranslationCreated;
eventToHandler[TRANSLATION_EDITED_EVENT_NAME] = handlerTranslationEdited;
eventToHandler[TRANSLATION_DELETED_EVENT_NAME] = handlerTranslationDeleted;

export async function processIndexing(eventModel: any) {
  log(`Starting indexing event ${JSON.stringify(eventModel, null, 2)}`);

  const eventName = eventModel.contractEventName;
  const handler = eventToHandler[eventName];
  if (!handler) {
    throw new ConfigurationError(
      `Handler for event ${eventName} is not configured`
    );
  }
  await BaseRepository.transaction(handler, eventModel);
  return eventModel;
}
