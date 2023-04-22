import { PostRepository } from 'src/core/db/repositories/PostRepository';
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
} from 'src/core/sui-index/post';
import { createSuiUser, updateSuiUser } from 'src/core/sui-index/user';
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
} from 'src/models/sui-event-models';

const postRepository = new PostRepository();

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
  await createSuiCommunity(eventModel.communityId);
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

export async function handleCreateSuiReply(
  eventModel: ReplyCreatedSuiEventModel
) {
  const { postId, replyId, timestamp } = eventModel;

  const reply = await createSuiReply(postId, replyId, timestamp);
  if (!reply) {
    const post = await postRepository.get(postId);
    if (post) {
      await postRepository.update(postId, {
        replyCount: post.replyCount + 1,
      });
    }

    return;
  }

  await createHistory(eventModel, EntityType.Reply, OperationType.Create);
}

export async function handleEditSuiReply(eventModel: ReplyEditedSuiEventModel) {
  await editSuiReply(
    eventModel.postId,
    eventModel.replyId,
    eventModel.timestamp
  );
  await createHistory(eventModel, EntityType.Reply, OperationType.Edit);
}

export async function handleDeleteSuiReply(
  eventModel: ReplyDeletedSuiEventModel
) {
  await deleteSuiReply(
    eventModel.postId,
    eventModel.replyId,
    eventModel.timestamp
  );
  await createHistory(eventModel, EntityType.Reply, OperationType.Delete);
}

export async function handleChangeStatusBestSuiReply(
  eventModel: ReplyMarkedTheBestSuiEventModel
) {
  await changeStatusBestSuiReply(
    eventModel.postMetaDataId,
    eventModel.replyMetaDataKey,
    eventModel.timestamp
  );
}
