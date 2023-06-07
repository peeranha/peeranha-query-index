import { createHistory } from 'src/core/index/mapping';
import { EntityType, OperationType } from 'src/core/index/utils';
import {
  createSuiCommunity,
  updateSuiCommunity,
  createSuiTag,
  updateSuiTag,
} from 'src/core/sui-index/community';
import {
  createSuiPost,
  createSuiReply,
  editSuiReply,
  deleteSuiReply,
  changeStatusBestSuiReply,
  deleteSuiPost,
  createSuiComment,
  voteSuiItem,
  deleteSuiComment,
  editSuiComment,
  editSuiPost,
  setDocumentationTree,
} from 'src/core/sui-index/post';
import {
  createSuiUser,
  updateSuiUser,
  followSuiCommunity,
  unfollowSuiCommunity,
  revokeSuiRole,
  grantSuiRole,
} from 'src/core/sui-index/user';
import {
  UserCreatedSuiEventModel,
  UserUpdatedSuiEventModel,
  CommunityCreatedSuiEventModel,
  CommunityUpdatedSuiEventModel,
  TagCreatedSuiEventModel,
  TagUpdatedSuiEventModel,
  PostCreatedSuiEventModel,
  ReplyCreatedSuiEventModel,
  ReplyEditedSuiEventModel,
  ReplyDeletedSuiEventModel,
  ReplyMarkedTheBestSuiEventModel,
  PostDeletedSuiEventModel,
  PostEditedSuiEventModel,
  CommentCreatedSuiEventModel,
  CommentDeletedSuiEventModel,
  CommentEditedSuiEventModel,
  ItemVotedSuiEventModel,
  FollowedCommunitySuiEventModel,
  UnfollowedCommunitySuiEventModel,
  RoleGrantedSuiEventModel,
  RoleRevokedSuiEventModel,
  SetDocumentationTreeSuiEventModel,
} from 'src/models/sui-event-models';

export async function handleCreateSuiUser(
  eventModel: UserCreatedSuiEventModel
) {
  await createSuiUser(
    eventModel.userId,
    eventModel.timestamp,
    eventModel.network
  );
}

export async function handleUpdateSuiUser(
  eventModel: UserUpdatedSuiEventModel
) {
  await updateSuiUser(
    eventModel.userId,
    eventModel.timestamp,
    eventModel.network
  );
}

export async function handleCreateSuiCommunity(
  eventModel: CommunityCreatedSuiEventModel
) {
  await createSuiCommunity(
    eventModel.communityId,
    eventModel.network,
    eventModel.timestamp
  );
}

export async function handleUpdateSuiCommunity(
  eventModel: CommunityUpdatedSuiEventModel
) {
  await updateSuiCommunity(eventModel.communityId, eventModel.network);
}

export async function handleCreateSuiTag(eventModel: TagCreatedSuiEventModel) {
  await createSuiTag(eventModel.communityId, eventModel.tagId);
}

export async function handleUpdateSuiTag(eventModel: TagUpdatedSuiEventModel) {
  await updateSuiTag(eventModel.communityId, eventModel.tagId);
}

export async function handleCreateSuiPost(
  eventModel: PostCreatedSuiEventModel
) {
  await createSuiPost(
    eventModel.postId,
    eventModel.timestamp,
    eventModel.network
  );
  await createHistory(
    eventModel,
    EntityType.Post,
    OperationType.Create,
    eventModel.network
  );
}

export async function handleEditSuiPost(eventModel: PostEditedSuiEventModel) {
  await editSuiPost(
    eventModel.postId,
    eventModel.timestamp,
    eventModel.network
  );
  await createHistory(
    eventModel,
    EntityType.Post,
    OperationType.Edit,
    eventModel.network
  );
}

export async function handleDeleteSuiPost(
  eventModel: PostDeletedSuiEventModel
) {
  await deleteSuiPost(eventModel.postId, eventModel.network);
  await createHistory(
    eventModel,
    EntityType.Post,
    OperationType.Delete,
    eventModel.network
  );
}

export async function handleCreateSuiReply(
  eventModel: ReplyCreatedSuiEventModel
) {
  const { postId, replyId, timestamp } = eventModel;

  await createSuiReply(postId, replyId, timestamp, eventModel.network);
  await createHistory(
    eventModel,
    EntityType.Reply,
    OperationType.Create,
    eventModel.network
  );
}

export async function handleEditSuiReply(eventModel: ReplyEditedSuiEventModel) {
  const { postId, timestamp, replyId } = eventModel;

  await editSuiReply(postId, replyId, timestamp, eventModel.network);
  await createHistory(
    eventModel,
    EntityType.Reply,
    OperationType.Edit,
    eventModel.network
  );
}

export async function handleDeleteSuiReply(
  eventModel: ReplyDeletedSuiEventModel
) {
  const { postId, replyId } = eventModel;

  await Promise.all([
    deleteSuiReply(postId, replyId, eventModel.network),
    createHistory(
      eventModel,
      EntityType.Reply,
      OperationType.Delete,
      eventModel.network
    ),
  ]);
}

export async function handleChangeStatusBestSuiReply(
  eventModel: ReplyMarkedTheBestSuiEventModel
) {
  await changeStatusBestSuiReply(
    eventModel.postId,
    eventModel.replyId,
    eventModel.timestamp,
    eventModel.network
  );
}

export async function handleNewSuiComment(
  eventModel: CommentCreatedSuiEventModel
) {
  const { postId, replyId, commentId, timestamp } = eventModel;

  await createSuiComment(postId, replyId, commentId, timestamp);
  await createHistory(
    eventModel,
    EntityType.Comment,
    OperationType.Create,
    eventModel.network
  );
}

export async function handleEditedSuiComment(
  eventModel: CommentEditedSuiEventModel
) {
  const { postId, replyId, commentId, timestamp } = eventModel;

  await editSuiComment(postId, replyId, commentId, timestamp);
  await createHistory(
    eventModel,
    EntityType.Comment,
    OperationType.Edit,
    eventModel.network
  );
}

export async function handleDeletedSuiComment(
  eventModel: CommentDeletedSuiEventModel
) {
  const { postId, replyId, commentId } = eventModel;

  await Promise.all([
    deleteSuiComment(postId, replyId, commentId),
    createHistory(
      eventModel,
      EntityType.Comment,
      OperationType.Delete,
      eventModel.network
    ),
  ]);
}

export async function handleVoteSuiItem(eventModel: ItemVotedSuiEventModel) {
  await voteSuiItem(
    eventModel.userId,
    eventModel.postId,
    eventModel.replyId,
    eventModel.commentId,
    eventModel.timestamp,
    eventModel.voteDirection,
    eventModel.network
  );
}

export async function handleFollowSuiCommunity(
  eventModel: FollowedCommunitySuiEventModel
) {
  await followSuiCommunity(
    eventModel.userId,
    eventModel.communityId,
    eventModel.timestamp,
    eventModel.network
  );
}

export async function handleUnfollowSuiCommunity(
  eventModel: UnfollowedCommunitySuiEventModel
) {
  await unfollowSuiCommunity(
    eventModel.userId,
    eventModel.communityId,
    eventModel.timestamp,
    eventModel.network
  );
}

export async function handlerGrantedSuiRole(
  eventModel: RoleGrantedSuiEventModel
) {
  const { role, timestamp, userId } = eventModel;
  await grantSuiRole(userId, timestamp, role, eventModel.network);
}

export async function handlerRevokedSuiRole(
  eventModel: RoleRevokedSuiEventModel
) {
  const { role, userId } = eventModel;
  await revokeSuiRole(userId, role);
}

export async function handleSetDocumentationTree(
  eventModel: SetDocumentationTreeSuiEventModel
) {
  await setDocumentationTree(
    eventModel.communityId,
    eventModel.timestamp,
    eventModel.userId,
    eventModel.network
  );
}
