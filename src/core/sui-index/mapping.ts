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
} from 'src/models/sui-event-models';

export async function handleCreateSuiUser(
  eventModel: UserCreatedSuiEventModel
) {
  await createSuiUser(eventModel.userId, eventModel.timestamp);
}

export async function handleUpdateSuiUser(
  eventModel: UserUpdatedSuiEventModel
) {
  await updateSuiUser(eventModel.userId, eventModel.timestamp);
}

export async function handleCreateSuiCommunity(
  eventModel: CommunityCreatedSuiEventModel
) {
  await createSuiCommunity(eventModel.communityId, eventModel.timestamp);
}

export async function handleUpdateSuiCommunity(
  eventModel: CommunityUpdatedSuiEventModel
) {
  await updateSuiCommunity(eventModel.communityId);
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
  await createSuiPost(eventModel.postId, eventModel.timestamp);
  await createHistory(eventModel, EntityType.Post, OperationType.Create);
}

export async function handleEditSuiPost(eventModel: PostEditedSuiEventModel) {
  await editSuiPost(eventModel.postId, eventModel.timestamp);
  await createHistory(eventModel, EntityType.Post, OperationType.Edit);
}

export async function handleDeleteSuiPost(
  eventModel: PostDeletedSuiEventModel
) {
  await deleteSuiPost(eventModel.postId);
  await createHistory(eventModel, EntityType.Post, OperationType.Delete);
}

export async function handleCreateSuiReply(
  eventModel: ReplyCreatedSuiEventModel
) {
  const { postId, replyId, timestamp } = eventModel;

  await createSuiReply(postId, replyId, timestamp);
  await createHistory(eventModel, EntityType.Reply, OperationType.Create);
}

export async function handleEditSuiReply(eventModel: ReplyEditedSuiEventModel) {
  const { postId, timestamp, replyId } = eventModel;

  await editSuiReply(postId, replyId, timestamp);
  await createHistory(eventModel, EntityType.Reply, OperationType.Edit);
}

export async function handleDeleteSuiReply(
  eventModel: ReplyDeletedSuiEventModel
) {
  const { postId, replyId } = eventModel;

  await Promise.all([
    deleteSuiReply(postId, replyId),
    createHistory(eventModel, EntityType.Reply, OperationType.Delete),
  ]);
}

export async function handleChangeStatusBestSuiReply(
  eventModel: ReplyMarkedTheBestSuiEventModel
) {
  await changeStatusBestSuiReply(
    eventModel.postId,
    eventModel.replyId,
    eventModel.timestamp
  );
}

export async function handleNewSuiComment(
  eventModel: CommentCreatedSuiEventModel
) {
  const { postId, replyId, commentId, timestamp } = eventModel;

  await createSuiComment(postId, replyId, commentId, timestamp);
  await createHistory(eventModel, EntityType.Comment, OperationType.Create);
}

export async function handleEditedSuiComment(
  eventModel: CommentEditedSuiEventModel
) {
  const { postId, replyId, commentId, timestamp } = eventModel;

  await editSuiComment(postId, replyId, commentId, timestamp);
  await createHistory(eventModel, EntityType.Comment, OperationType.Edit);
}

export async function handleDeletedSuiComment(
  eventModel: CommentDeletedSuiEventModel
) {
  const { postId, replyId, commentId } = eventModel;

  await Promise.all([
    deleteSuiComment(postId, replyId, commentId),
    createHistory(eventModel, EntityType.Comment, OperationType.Delete),
  ]);
}

export async function handleVoteSuiItem(eventModel: ItemVotedSuiEventModel) {
  await voteSuiItem(
    eventModel.userId,
    eventModel.postId,
    eventModel.replyId,
    eventModel.commentId,
    eventModel.timestamp
  );
}

export async function handleFollowSuiCommunity(
  eventModel: FollowedCommunitySuiEventModel
) {
  await followSuiCommunity(
    eventModel.userId,
    eventModel.communityId,
    eventModel.timestamp
  );
}

export async function handleUnfollowSuiCommunity(
  eventModel: UnfollowedCommunitySuiEventModel
) {
  await unfollowSuiCommunity(
    eventModel.userId,
    eventModel.communityId,
    eventModel.timestamp
  );
}

export async function handlerGrantedSuiRole(
  eventModel: RoleGrantedSuiEventModel
) {
  const { role, timestamp, userId } = eventModel;
  await grantSuiRole(userId, timestamp, role);
}

export async function handlerRevokedSuiRole(
  eventModel: RoleRevokedSuiEventModel
) {
  const { role, userId } = eventModel;
  await revokeSuiRole(userId, role);
}
