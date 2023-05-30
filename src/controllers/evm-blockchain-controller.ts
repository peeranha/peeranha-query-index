/* eslint-disable no-await-in-loop */
import { Event, providers } from 'ethers';
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
import { PeeranhaCommunityWrapper } from 'src/core/blockchain/contracts/peeranha-community-wrapper';
import { PeeranhaContentWrapper } from 'src/core/blockchain/contracts/peeranha-content-wrapper';
import { PeeranhaNFTWrapper } from 'src/core/blockchain/contracts/peeranha-nft-wrapper';
import { PeeranhaTokenWrapper } from 'src/core/blockchain/contracts/peeranha-token-wrapper';
import { PeeranhaUserWrapper } from 'src/core/blockchain/contracts/peeranha-user-wrapper';
import { createRpcProvider } from 'src/core/blockchain/rpc';
import {
  EDGEWARE_INDEXING_QUEUE,
  POLYGON_INDEXING_QUEUE,
} from 'src/core/constants';
import { DynamoDBConnector } from 'src/core/dynamodb/DynamoDbConnector';
import { Config } from 'src/core/dynamodb/entities/Config';
import {
  ConfigRepository,
  getKeyForLastBlockByNetwork,
} from 'src/core/dynamodb/repositories/ConfigRepository';
import { ConfigurationError } from 'src/core/errors';
import { log, LogLevel } from 'src/core/utils/logger';
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
  ReadNotificationsRequestModel,
  ReadNotificationsResponseModel,
  Network,
} from 'src/models/event-models';

import { contractEvents } from './event-listener-controller';

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

const connDynamoDB = new DynamoDBConnector(process.env);
const configRepository = new ConfigRepository(connDynamoDB);

export async function readEvents(
  readEventsRequest: ReadNotificationsRequestModel
): Promise<ReadNotificationsResponseModel> {
  try {
    let Queue;
    if (readEventsRequest.network === Network.Edgeware) {
      Queue = EDGEWARE_INDEXING_QUEUE;
    } else {
      Queue = POLYGON_INDEXING_QUEUE;
    }
    const startsBlocks = {
      [Network.Polygon]: process.env.POLYGON_START_BLOCK_NUMBER,
      [Network.Edgeware]: process.env.EDGEWARE_START_BLOCK_NUMBER,
    };
    const provider = await createRpcProvider(readEventsRequest.network);
    const lastBlockNumber = await getKeyForLastBlockByNetwork(
      readEventsRequest.network
    );

    const configEndBlock = await configRepository.get(lastBlockNumber);

    const listenBlocksNumber = 2000 - 1;

    let startBlock: number;

    if (!configEndBlock) {
      startBlock =
        readEventsRequest.network === Network.Polygon ||
        readEventsRequest.network === Network.Edgeware
          ? parseInt(startsBlocks[readEventsRequest.network]!, 10)
          : 0;
    } else {
      startBlock = parseInt(configEndBlock?.value!.toString(), 10) + 1;
    }

    const endBlock = Math.min(
      startBlock + listenBlocksNumber,
      (await provider.getBlockNumber()) - 2
    ); // go 2 blocks back to account for forks

    const allEventsPromises: Record<string, Array<Promise<Event[]>>> = {};
    allEventsPromises[ITEM_VOTED_EVENT_NAME] = new Array<Promise<Event[]>>();
    allEventsPromises[REPLY_MARKED_THE_BEST_EVENT_NAME] = new Array<
      Promise<Event[]>
    >();
    allEventsPromises[REPLY_CREATED_EVENT_NAME] = new Array<Promise<Event[]>>();
    allEventsPromises[COMMENT_CREATED_EVENT_NAME] = new Array<
      Promise<Event[]>
    >();
    allEventsPromises[POST_CREATED_EVENT_NAME] = new Array<Promise<Event[]>>();
    allEventsPromises[POST_EDITED_EVENT_NAME] = new Array<Promise<Event[]>>();
    allEventsPromises[REPLY_EDITED_EVENT_NAME] = new Array<Promise<Event[]>>();
    allEventsPromises[COMMENT_EDITED_EVENT_NAME] = new Array<
      Promise<Event[]>
    >();
    allEventsPromises[USER_CREATED_EVENT_NAME] = new Array<Promise<Event[]>>();
    allEventsPromises[USER_UPDATED_EVENT_NAME] = new Array<Promise<Event[]>>();
    allEventsPromises[FOLLOWED_COMMUNITY_EVENT_NAME] = new Array<
      Promise<Event[]>
    >();
    allEventsPromises[UNFOLLOWED_COMMUNITY_EVENT_NAME] = new Array<
      Promise<Event[]>
    >();
    allEventsPromises[ROLE_GRANTED_EVENT_NAME] = new Array<Promise<Event[]>>();
    allEventsPromises[ROLE_REVOKED_EVENT_NAME] = new Array<Promise<Event[]>>();
    allEventsPromises[COMMUNITY_CREATED_EVENT_NAME] = new Array<
      Promise<Event[]>
    >();
    allEventsPromises[COMMUNITY_UPDATED_EVENT_NAME] = new Array<
      Promise<Event[]>
    >();
    allEventsPromises[COMMUNITY_FROZEN_EVENT_NAME] = new Array<
      Promise<Event[]>
    >();
    allEventsPromises[COMMUNITY_UNFROZEN_EVENT_NAME] = new Array<
      Promise<Event[]>
    >();
    allEventsPromises[TAG_CREATED_EVENT_NAME] = new Array<Promise<Event[]>>();
    allEventsPromises[TAG_UPDATED_EVENT_NAME] = new Array<Promise<Event[]>>();
    allEventsPromises[POST_DELETED_EVENT_NAME] = new Array<Promise<Event[]>>();
    allEventsPromises[CHANGE_POST_TYPE_EVENT_NAME] = new Array<
      Promise<Event[]>
    >();
    allEventsPromises[REPLY_DELETED_EVENT_NAME] = new Array<Promise<Event[]>>();
    allEventsPromises[COMMENT_DELETED_EVENT_NAME] = new Array<
      Promise<Event[]>
    >();
    allEventsPromises[CONFIGURE_NEW_ACHIEVEMENT_EVENT_NAME] = new Array<
      Promise<Event[]>
    >();
    allEventsPromises[TRANSFER_EVENT_NAME] = new Array<Promise<Event[]>>();
    allEventsPromises[GET_REWARD_EVENT_NAME] = new Array<Promise<Event[]>>();
    allEventsPromises[SET_DOCUMENTATION_TREE_EVENT_NAME] = new Array<
      Promise<Event[]>
    >();

    log(`Creating promise to read events from chain.`, LogLevel.INFO);
    const peeranhaContracts = {
      [readEventsRequest.network === Network.Edgeware
        ? process.env.EDGEWARE_USER_ADDRESS!.toLowerCase()
        : process.env.POLYGON_USER_ADDRESS!.toLowerCase()]:
        new PeeranhaUserWrapper(provider, readEventsRequest.network),
      [readEventsRequest.network === Network.Edgeware
        ? process.env.EDGEWARE_COMMUNITY_ADDRESS!.toLowerCase()
        : process.env.POLYGON_COMMUNITY_ADDRESS!.toLowerCase()]:
        new PeeranhaCommunityWrapper(provider, readEventsRequest.network),
      [readEventsRequest.network === Network.Edgeware
        ? process.env.EDGEWARE_CONTENT_ADDRESS!.toLowerCase()
        : process.env.POLYGON_CONTENT_ADDRESS!.toLowerCase()]:
        new PeeranhaContentWrapper(provider, readEventsRequest.network),
      [readEventsRequest.network === Network.Edgeware
        ? process.env.EDGEWARE_TOKEN_ADDRESS!.toLowerCase()
        : process.env.POLYGON_TOKEN_ADDRESS!.toLowerCase()]:
        new PeeranhaTokenWrapper(provider, readEventsRequest.network),
      [readEventsRequest.network === Network.Edgeware
        ? process.env.EDGEWARE_NFT_ADDRESS!.toLowerCase()
        : process.env.POLYGON_NFT_ADDRESS!.toLowerCase()]:
        new PeeranhaNFTWrapper(provider, readEventsRequest.network),
    };
    const contractEventsPromises = Object.keys(peeranhaContracts).map(
      (peeranhaContract: string) => {
        return peeranhaContracts[peeranhaContract]?.getEventsPromisesByNames(
          contractEvents(readEventsRequest.network)[peeranhaContract] || [],
          startBlock, // todo startBlock
          endBlock // todo endBlock
        );
      }
    );

    // const contractEventNamesArray = await Promise.all(contractEventsPromises);
    contractEventsPromises.forEach((contractEventNames) => {
      Object.keys(contractEventNames || {}).forEach((contractEventName) => {
        const eventPromises = contractEventNames
          ? contractEventNames[contractEventName]
          : null;
        if (eventPromises) {
          allEventsPromises[contractEventName]?.push(eventPromises);
        }
      });
    });

    const eventsResults: Record<string, any[]> = {};
    /* eslint-disable no-await-in-loop */
    /* eslint-disable no-restricted-syntax */
    for (const eventName of Object.keys(allEventsPromises)) {
      const eventPromises = allEventsPromises[eventName];
      if (eventPromises) {
        log(`Reading '${eventName}' events`, LogLevel.INFO);
        const evResults = await Promise.all(eventPromises);
        if (!eventsResults[eventName]) {
          eventsResults[eventName] = [];
        }
        eventsResults[eventName]?.push(...evResults);
      }
    }
    /* eslint-enable no-await-in-loop */
    /* eslint-enable no-restricted-syntax */

    const configBlockNumber = new Config({
      key: lastBlockNumber,
      value: endBlock!.toString(),
    });

    log(
      `Updating last read event block in db. - ${endBlock!.toString()}`,
      LogLevel.INFO
    );
    if (!configEndBlock) {
      await configRepository.put(configBlockNumber);
    } else {
      await configRepository.update(lastBlockNumber, configBlockNumber);
    }

    const configuratedEvents: any[] = [];

    Object.keys(eventsResults).forEach((eventName) => {
      const results = eventsResults[eventName];
      if (results) {
        results.forEach((events: Event[]) => {
          events.forEach(async (ev: Event) => {
            const EventModeType = eventToModelType[eventName];
            if (!EventModeType) {
              throw new ConfigurationError(
                `Model type is not configured for event by name ${eventName}`
              );
            }
            const model = new EventModeType({
              ...ev,
              network: readEventsRequest.network,
            });
            configuratedEvents.push(model);
          });
        });
      }
    });

    const blockPromises: Promise<providers.Block>[] = [];
    configuratedEvents.forEach((configuratedEvent) =>
      blockPromises.push(provider.getBlock(configuratedEvent.blockNumber))
    );

    const blocks = await Promise.all(blockPromises);
    for (let i = 0; i < blocks.length; i++) {
      configuratedEvents[i]!.timestamp = blocks[i]!.timestamp;
    }

    configuratedEvents.sort((firstEventModel, secondEventModel) =>
      firstEventModel.timestamp > secondEventModel.timestamp ? 1 : -1
    );

    for (let i = 0; i < configuratedEvents.length; i++) {
      log(
        `Prepared '${
          configuratedEvents[i].contractEventName
        }' event to be pushed to SQS - ${JSON.stringify(
          configuratedEvents[i]
        )}`,
        LogLevel.INFO
      );
      // eslint-disable-next-line no-await-in-loop
      await pushToSQS(Queue, configuratedEvents[i]);
    }

    log('DONE!', LogLevel.INFO);
    return new ReadNotificationsResponseModel();
  } catch (error) {
    log(`Failed to read events for network. Error: ${error}`, LogLevel.ERROR);
    throw error;
  }
}
