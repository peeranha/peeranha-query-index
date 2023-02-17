import { providers } from 'ethers';
import {
  CHANGE_POST_TYPE_EVENT_NAME,
  COMMENT_DELETED_EVENT_NAME,
  COMMENT_EDITED_EVENT_NAME,
  COMMUNITY_CREATED_EVENT_NAME,
  COMMUNITY_FROZEN_EVENT_NAME,
  COMMUNITY_UNFROZEN_EVENT_NAME,
  COMMUNITY_UPDATED_EVENT_NAME,
  CONFIGURE_NEW_ACHIEVEMENT_EVENT_NAME,
  FOLLOWED_COMMUNITY_EVENT_NAME,
  GET_REWARD_EVENT_NAME,
  COMMENT_CREATED_EVENT_NAME,
  ITEM_VOTED_EVENT_NAME,
  REPLY_CREATED_EVENT_NAME,
  POST_CREATED_EVENT_NAME,
  POST_DELETED_EVENT_NAME,
  POST_EDITED_EVENT_NAME,
  REPLY_DELETED_EVENT_NAME,
  REPLY_EDITED_EVENT_NAME,
  REPLY_MARKED_THE_BEST_EVENT_NAME,
  ROLE_GRANTED_EVENT_NAME,
  ROLE_REVOKED_EVENT_NAME,
  SET_DOCUMENTATION_TREE_EVENT_NAME,
  TAG_CREATED_EVENT_NAME,
  TAG_UPDATED_EVENT_NAME,
  TRANSFER_EVENT_NAME,
  UNFOLLOWED_COMMUNITY_EVENT_NAME,
  USER_CREATED_EVENT_NAME,
  USER_UPDATED_EVENT_NAME,
} from 'src/core/blockchain/constants';
import { createRpcProvider } from 'src/core/blockchain/infura';
import { FIRST_QUEUE, SECOND_QUEUE } from 'src/core/constants';
import { ConfigurationError } from 'src/core/errors';
import { pushToSQS } from 'src/core/utils/sqs';
import {
  BaseEventModel,
  ChangePostTypeEventModel,
  CommentCreatedEventModel,
  CommentDeletedEventModel,
  CommentEditedEventModel,
  CommunityCreatedEventModel,
  CommunityFrozenEventModel,
  CommunityUnfrozenEventModel,
  CommunityUpdatedEventModel,
  ConfigureNewAchievementNFTEventModel,
  EventListenerRequest,
  FollowedCommunityEventModel,
  GetRewardEventModel,
  ItemVotedEventModel,
  PostCreatedEventModel,
  PostDeletedEventModel,
  PostEditedEventModel,
  ReplyCreatedEventModel,
  ReplyDeletedEventModel,
  ReplyEditedEventModel,
  ReplyMarkedTheBestEventModel,
  RoleGrantedEventModel,
  RoleRevokedEventModel,
  SetDocumentationTreeEventModel,
  TagCreatedEventModel,
  TagUpdatedEventModel,
  TransferEventModel,
  UnfollowedCommunityEventModel,
  UserCreatedEventModel,
  UserUpdatedEventModel,
} from 'src/models/event-models';

const eventOrder = [
  USER_CREATED_EVENT_NAME,
  COMMUNITY_CREATED_EVENT_NAME,
  POST_CREATED_EVENT_NAME,
  REPLY_CREATED_EVENT_NAME,
  COMMENT_CREATED_EVENT_NAME,
  TAG_CREATED_EVENT_NAME,
  CONFIGURE_NEW_ACHIEVEMENT_EVENT_NAME,
  USER_UPDATED_EVENT_NAME,
  COMMUNITY_UPDATED_EVENT_NAME,
  FOLLOWED_COMMUNITY_EVENT_NAME,
  UNFOLLOWED_COMMUNITY_EVENT_NAME,
  ITEM_VOTED_EVENT_NAME,
  REPLY_MARKED_THE_BEST_EVENT_NAME,
  POST_EDITED_EVENT_NAME,
  REPLY_EDITED_EVENT_NAME,
  COMMENT_EDITED_EVENT_NAME,
  TAG_UPDATED_EVENT_NAME,
  POST_DELETED_EVENT_NAME,
  REPLY_DELETED_EVENT_NAME,
  COMMENT_DELETED_EVENT_NAME,
  CHANGE_POST_TYPE_EVENT_NAME,
  COMMUNITY_FROZEN_EVENT_NAME,
  COMMUNITY_UNFROZEN_EVENT_NAME,
  TRANSFER_EVENT_NAME,
  ROLE_GRANTED_EVENT_NAME,
  ROLE_REVOKED_EVENT_NAME,
  GET_REWARD_EVENT_NAME,
  SET_DOCUMENTATION_TREE_EVENT_NAME,
];

const eventToModelType: Record<string, typeof BaseEventModel> = {};
eventToModelType[ITEM_VOTED_EVENT_NAME] = ItemVotedEventModel;
eventToModelType[REPLY_MARKED_THE_BEST_EVENT_NAME] =
  ReplyMarkedTheBestEventModel;
eventToModelType[REPLY_CREATED_EVENT_NAME] = ReplyCreatedEventModel;
eventToModelType[COMMENT_CREATED_EVENT_NAME] = CommentCreatedEventModel;
eventToModelType[POST_CREATED_EVENT_NAME] = PostCreatedEventModel;
eventToModelType[POST_EDITED_EVENT_NAME] = PostEditedEventModel;
eventToModelType[REPLY_EDITED_EVENT_NAME] = ReplyEditedEventModel;
eventToModelType[COMMENT_EDITED_EVENT_NAME] = CommentEditedEventModel;
eventToModelType[USER_CREATED_EVENT_NAME] = UserCreatedEventModel;
eventToModelType[USER_UPDATED_EVENT_NAME] = UserUpdatedEventModel;
eventToModelType[FOLLOWED_COMMUNITY_EVENT_NAME] = FollowedCommunityEventModel;
eventToModelType[UNFOLLOWED_COMMUNITY_EVENT_NAME] =
  UnfollowedCommunityEventModel;
eventToModelType[ROLE_GRANTED_EVENT_NAME] = RoleGrantedEventModel;
eventToModelType[ROLE_REVOKED_EVENT_NAME] = RoleRevokedEventModel;
eventToModelType[COMMUNITY_CREATED_EVENT_NAME] = CommunityCreatedEventModel;
eventToModelType[COMMUNITY_UPDATED_EVENT_NAME] = CommunityUpdatedEventModel;
eventToModelType[COMMUNITY_FROZEN_EVENT_NAME] = CommunityFrozenEventModel;
eventToModelType[COMMUNITY_UNFROZEN_EVENT_NAME] = CommunityUnfrozenEventModel;
eventToModelType[TAG_CREATED_EVENT_NAME] = TagCreatedEventModel;
eventToModelType[TAG_UPDATED_EVENT_NAME] = TagUpdatedEventModel;
eventToModelType[POST_DELETED_EVENT_NAME] = PostDeletedEventModel;
eventToModelType[CHANGE_POST_TYPE_EVENT_NAME] = ChangePostTypeEventModel;
eventToModelType[REPLY_DELETED_EVENT_NAME] = ReplyDeletedEventModel;
eventToModelType[COMMENT_DELETED_EVENT_NAME] = CommentDeletedEventModel;
eventToModelType[CONFIGURE_NEW_ACHIEVEMENT_EVENT_NAME] =
  ConfigureNewAchievementNFTEventModel;
eventToModelType[TRANSFER_EVENT_NAME] = TransferEventModel;
eventToModelType[GET_REWARD_EVENT_NAME] = GetRewardEventModel;
eventToModelType[SET_DOCUMENTATION_TREE_EVENT_NAME] =
  SetDocumentationTreeEventModel;

const getEventModels = (transactions: any[]) =>
  transactions
    .filter((transaction) => eventOrder.includes(transaction.event_name))
    .map((transaction) => {
      const EventModeType = eventToModelType[transaction.event_name];
      if (!EventModeType) {
        throw new ConfigurationError(
          `Model type is not configured for event by name ${transaction.event_name}`
        );
      }
      return new EventModeType(transaction);
    });

const getSortedEvents = (events: BaseEventModel[]) =>
  events.sort((a, b) => {
    if (a.timestamp < b.timestamp) return -1;
    if (a.timestamp > b.timestamp) return 1;
    if (
      eventOrder.indexOf(a.contractEventName) <
      eventOrder.indexOf(b.contractEventName)
    )
      return -1;
    if (
      eventOrder.indexOf(a.contractEventName) >
      eventOrder.indexOf(b.contractEventName)
    )
      return 1;
    return 0;
  });

async function getEvents(transactions: any[]) {
  const provider = createRpcProvider();

  const eventModels = getEventModels(transactions);

  const blockPromises: Promise<providers.Block>[] = [];
  eventModels.forEach((eventModel) =>
    blockPromises.push(provider.getBlock(eventModel.blockNumber))
  );

  const blocks = await Promise.all(blockPromises);
  for (let i = 0; i < blocks.length; i++) {
    eventModels[i]!.timestamp = blocks[i]!.timestamp;
  }

  return getSortedEvents(eventModels);
}

async function handleListenWebhook(
  request: EventListenerRequest,
  queueName: string
): Promise<void> {
  const events = await getEvents(request.transactions);

  // TODO: think about possible failed operations
  events.forEach(async (event) => {
    await pushToSQS(queueName, event);
  });
}

export async function handleListenFirstWebhook(
  request: EventListenerRequest
): Promise<void> {
  await handleListenWebhook(request, FIRST_QUEUE);
}

export async function handleListenSecondWebhook(
  request: EventListenerRequest
): Promise<void> {
  await handleListenWebhook(request, SECOND_QUEUE);
}
