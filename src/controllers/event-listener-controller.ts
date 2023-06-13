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
import { createRpcProvider } from 'src/core/blockchain/rpc';
import { POLYGON_INDEXING_QUEUE } from 'src/core/constants';
import { ConfigurationError } from 'src/core/errors';
import { pushToSQS } from 'src/core/utils/sqs';
import {
  Network,
  BaseEventModel,
  ChangePostTypeEventModel,
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
  PostCreatedEventModel,
  PostDeletedEventModel,
  PostEditedEventModel,
  ReplyDeletedEventModel,
  ReplyEditedEventModel,
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
import {
  ItemVotedEventModel,
  ReplyMarkedTheBestEventModel,
  ReplyCreatedEventModel,
  CommentCreatedEventModel,
} from 'src/models/notifications-events-models';

export const contractEvents = (network: Network) => {
  return {
    [network === Network.Edgeware
      ? process.env.EDGEWARE_USER_ADDRESS!.toLowerCase()
      : process.env.POLYGON_USER_ADDRESS!.toLowerCase()]: [
      USER_CREATED_EVENT_NAME,
      USER_UPDATED_EVENT_NAME,
      FOLLOWED_COMMUNITY_EVENT_NAME,
      UNFOLLOWED_COMMUNITY_EVENT_NAME,
      ROLE_GRANTED_EVENT_NAME,
      ROLE_REVOKED_EVENT_NAME,
    ],
    [network === Network.Edgeware
      ? process.env.EDGEWARE_COMMUNITY_ADDRESS!.toLowerCase()
      : process.env.POLYGON_COMMUNITY_ADDRESS!.toLowerCase()]: [
      COMMUNITY_CREATED_EVENT_NAME,
      TAG_CREATED_EVENT_NAME,
      COMMUNITY_UPDATED_EVENT_NAME,
      TAG_UPDATED_EVENT_NAME,
      COMMUNITY_FROZEN_EVENT_NAME,
      COMMUNITY_UNFROZEN_EVENT_NAME,
    ],
    [network === Network.Edgeware
      ? process.env.EDGEWARE_CONTENT_ADDRESS!.toLowerCase()
      : process.env.POLYGON_CONTENT_ADDRESS!.toLowerCase()]: [
      POST_CREATED_EVENT_NAME,
      REPLY_CREATED_EVENT_NAME,
      COMMENT_CREATED_EVENT_NAME,
      POST_EDITED_EVENT_NAME,
      REPLY_EDITED_EVENT_NAME,
      COMMENT_EDITED_EVENT_NAME,
      POST_DELETED_EVENT_NAME,
      REPLY_DELETED_EVENT_NAME,
      COMMENT_DELETED_EVENT_NAME,
      ITEM_VOTED_EVENT_NAME,
      REPLY_MARKED_THE_BEST_EVENT_NAME,
      CHANGE_POST_TYPE_EVENT_NAME,
      SET_DOCUMENTATION_TREE_EVENT_NAME,
    ],
    [network === Network.Edgeware
      ? process.env.EDGEWARE_TOKEN_ADDRESS!.toLowerCase()
      : process.env.POLYGON_TOKEN_ADDRESS!.toLowerCase()]: [
      GET_REWARD_EVENT_NAME,
    ],
    [network === Network.Edgeware
      ? process.env.EDGEWARE_NFT_ADDRESS!.toLowerCase()
      : process.env.POLYGON_NFT_ADDRESS!.toLowerCase()]: [
      CONFIGURE_NEW_ACHIEVEMENT_EVENT_NAME,
      TRANSFER_EVENT_NAME,
    ],
  };
};

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

const getEventModels = (transactions: any[], network: Network) =>
  transactions
    .filter((transaction) =>
      contractEvents(network)[transaction.contract_address]?.includes(
        transaction.event_name
      )
    )
    .map((transaction) => {
      const EventModeType = eventToModelType[transaction.event_name];
      if (!EventModeType) {
        throw new ConfigurationError(
          `Model type is not configured for event by name ${transaction.event_name}`
        );
      }
      return new EventModeType({ ...transaction, network });
    });

async function getEvents(transactions: any[], network: Network) {
  const provider = await createRpcProvider(network);

  const eventModels = getEventModels(transactions, network);

  const blockPromises: Promise<providers.Block>[] = [];
  eventModels.forEach((eventModel) =>
    blockPromises.push(provider.getBlock(eventModel.blockNumber))
  );

  const blocks = await Promise.all(blockPromises);
  for (let i = 0; i < blocks.length; i++) {
    eventModels[i]!.timestamp = blocks[i]!.timestamp;
  }

  return eventModels;
}

async function handleListenWebhook(
  request: EventListenerRequest,
  queueName: string
): Promise<void> {
  const events = await getEvents(request.transactions, request.network);

  // TODO: think about possible failed operations
  for (let i = 0; i < events.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    await pushToSQS(queueName, events[i]);
  }
}

export async function handleListenPolygonWebhook(
  request: EventListenerRequest
): Promise<void> {
  await handleListenWebhook(request, POLYGON_INDEXING_QUEUE);
}
