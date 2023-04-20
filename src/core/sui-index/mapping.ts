import { createSuiCommunity } from 'src/core/sui-index/community';
import { createSuiUser, updateSuiUser } from 'src/core/sui-index/user';
import {
  CommunityCreatedSuiEventModel,
  UserCreatedSuiEventModel,
  UserUpdatedSuiEventModel,
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
