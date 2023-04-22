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
  await createSuiPost(eventModel.postMetaDataId, eventModel.timestamp);
}

export async function handleCreateSuiReply(
  eventModel: ReplyCreatedSuiEventModel
) {
  await createSuiReply(
    eventModel.postMetaDataId,
    eventModel.replyMetaDataKey,
    eventModel.timestamp
  );
}

export async function handleEditSuiReply(eventModel: ReplyEditedSuiEventModel) {
  await editSuiReply(
    eventModel.postMetaDataId,
    eventModel.replyMetaDataKey,
    eventModel.timestamp
  );
}

export async function handleDeleteSuiReply(
  eventModel: ReplyDeletedSuiEventModel
) {
  await deleteSuiReply(
    eventModel.postMetaDataId,
    eventModel.replyMetaDataKey
    // eventModel.timestamp
  );
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
