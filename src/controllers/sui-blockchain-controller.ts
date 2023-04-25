/* eslint-disable no-await-in-loop */
import { SuiTransactionBlockResponse } from '@mysten/sui.js';
import { SUI_INDEXING_FIRST_QUEUE } from 'src/core/constants';
import { DynamoDBConnector } from 'src/core/dynamodb/DynamoDbConnector';
import { Config } from 'src/core/dynamodb/entities/Config';
import {
  ConfigRepository,
  NEXT_CURSOR,
} from 'src/core/dynamodb/repositories/ConfigRepository';
import { ConfigurationError, RuntimeError } from 'src/core/errors';
import {
  USER_CREATED_SUI_EVENT_NAME,
  COMMUNITY_CREATED_SUI_EVENT_NAME,
  COMMUNITY_UPDATED_SUI_EVENT_NAME,
  TAG_CREATED_SUI_EVENT_NAME,
  TAG_UPDATED_SUI_EVENT_NAME,
  USER_UPDATED_SUI_EVENT_NAME,
  POST_CREATED_SUI_EVENT_NAME,
  REPLY_CREATED_SUI_EVENT_NAME,
  POST_EDITED_SUI_EVENT_NAME,
  POST_DELETED_SUI_EVENT_NAME,
  REPLY_DELETED_SUI_EVENT_NAME,
  REPLY_EDITED_SUI_EVENT_NAME,
  REPLY_MARKED_THE_BEST_SUI_EVENT_NAME,
  COMMENT_CREATED_SUI_EVENT_NAME,
  COMMENT_EDITED_SUI_EVENT_NAME,
  COMMENT_DELETED_SUI_EVENT_NAME,
  ITEM_VOTED_SUI_EVENT_NAME,
  FOLLOWED_COMMUNITY_SUI_EVENT_NAME,
  UNFOLLOWED_COMMUNITY_SUI_EVENT_NAME,
  ROLE_GRANTED_SUI_EVENT_NAME,
  ROLE_REVOKED_SUI_EVENT_NAME,
  MODERATOR_POST_EDITED_SUI_EVENT_NAME,
  MODERATOR_REPLY_EDITED_SUI_EVENT_NAME,
} from 'src/core/sui-blockchain/constants';
import {
  createSuiProvider,
  queryTransactionBlocks,
} from 'src/core/sui-blockchain/sui';
import { cleanEventType } from 'src/core/sui-blockchain/utils';
import { log } from 'src/core/utils/logger';
import { pushToSQS } from 'src/core/utils/sqs';
import {
  BaseSuiEventModel,
  CommunityCreatedSuiEventModel,
  CommunityUpdatedSuiEventModel,
  PostCreatedSuiEventModel,
  TagCreatedSuiEventModel,
  TagUpdatedSuiEventModel,
  UserCreatedSuiEventModel,
  UserUpdatedSuiEventModel,
  ReplyCreatedSuiEventModel,
  PostEditedSuiEventModel,
  PostDeletedSuiEventModel,
  ReplyEditedSuiEventModel,
  ReplyDeletedSuiEventModel,
  ReplyMarkedTheBestSuiEventModel,
  ItemVotedSuiEventModel,
  FollowedCommunitySuiEventModel,
  UnfollowedCommunitySuiEventModel,
  CommentCreatedSuiEventModel,
  CommentEditedSuiEventModel,
  CommentDeletedSuiEventModel,
  RoleGrantedSuiEventModel,
  RoleRevokedSuiEventModel,
} from 'src/models/sui-event-models';
import {
  ReadSuiEventsRequestModel,
  ReadSuiEventsResponseModel,
} from 'src/models/sui-models';

const TRANSACTIONS_MAX_NUMBER = 100;

const eventToModelType: Record<string, typeof BaseSuiEventModel> = {};
eventToModelType[USER_CREATED_SUI_EVENT_NAME] = UserCreatedSuiEventModel;
eventToModelType[USER_UPDATED_SUI_EVENT_NAME] = UserUpdatedSuiEventModel;
eventToModelType[COMMUNITY_CREATED_SUI_EVENT_NAME] =
  CommunityCreatedSuiEventModel;
eventToModelType[COMMUNITY_UPDATED_SUI_EVENT_NAME] =
  CommunityUpdatedSuiEventModel;
eventToModelType[TAG_CREATED_SUI_EVENT_NAME] = TagCreatedSuiEventModel;
eventToModelType[TAG_UPDATED_SUI_EVENT_NAME] = TagUpdatedSuiEventModel;
eventToModelType[POST_CREATED_SUI_EVENT_NAME] = PostCreatedSuiEventModel;
eventToModelType[POST_EDITED_SUI_EVENT_NAME] = PostEditedSuiEventModel;
eventToModelType[MODERATOR_POST_EDITED_SUI_EVENT_NAME] =
  PostEditedSuiEventModel;
eventToModelType[POST_DELETED_SUI_EVENT_NAME] = PostDeletedSuiEventModel;
eventToModelType[REPLY_CREATED_SUI_EVENT_NAME] = ReplyCreatedSuiEventModel;
eventToModelType[REPLY_EDITED_SUI_EVENT_NAME] = ReplyEditedSuiEventModel;
eventToModelType[MODERATOR_REPLY_EDITED_SUI_EVENT_NAME] =
  ReplyEditedSuiEventModel;
eventToModelType[REPLY_DELETED_SUI_EVENT_NAME] = ReplyDeletedSuiEventModel;
eventToModelType[REPLY_MARKED_THE_BEST_SUI_EVENT_NAME] =
  ReplyMarkedTheBestSuiEventModel;
eventToModelType[ITEM_VOTED_SUI_EVENT_NAME] = ItemVotedSuiEventModel;
eventToModelType[FOLLOWED_COMMUNITY_SUI_EVENT_NAME] =
  FollowedCommunitySuiEventModel;
eventToModelType[UNFOLLOWED_COMMUNITY_SUI_EVENT_NAME] =
  UnfollowedCommunitySuiEventModel;

eventToModelType[COMMENT_CREATED_SUI_EVENT_NAME] = CommentCreatedSuiEventModel;
eventToModelType[COMMENT_EDITED_SUI_EVENT_NAME] = CommentEditedSuiEventModel;
eventToModelType[COMMENT_DELETED_SUI_EVENT_NAME] = CommentDeletedSuiEventModel;

eventToModelType[ROLE_GRANTED_SUI_EVENT_NAME] = RoleGrantedSuiEventModel;
eventToModelType[ROLE_REVOKED_SUI_EVENT_NAME] = RoleRevokedSuiEventModel;

const connDynamoDB = new DynamoDBConnector(process.env);
const configRepository = new ConfigRepository(connDynamoDB);

export async function readSuiEvents(
  _readEventsRequest: ReadSuiEventsRequestModel
): Promise<ReadSuiEventsResponseModel> {
  if (!process.env.SUI_PACKAGE_ADDRESS) {
    throw new ConfigurationError('SUI_PACKAGE_ADDRESS is not configured');
  }

  const provider = createSuiProvider();

  const cursorConfig = await configRepository.get(NEXT_CURSOR);
  const cursor = cursorConfig ? cursorConfig.value : null;

  log(
    `Requesting ${TRANSACTIONS_MAX_NUMBER} transactions with cursor ${cursor}`
  );
  const result = await queryTransactionBlocks(
    process.env.SUI_PACKAGE_ADDRESS,
    cursor,
    TRANSACTIONS_MAX_NUMBER
  );

  log(`Response: ${JSON.stringify(result)}`);

  const { data, nextCursor } = result;

  if (nextCursor == null) {
    throw new RuntimeError('Next cursor on the response is missing');
  }

  const digests: string[] = data.map((block: any) => block.digest);

  log(`Received digests: ${digests}`);

  const transactionBlockPromises: Promise<SuiTransactionBlockResponse>[] = [];

  digests.forEach((digest) =>
    transactionBlockPromises.push(
      provider.getTransactionBlock({
        digest,
        options: {
          showInput: false,
          showEffects: false,
          showEvents: true,
          showObjectChanges: false,
          showBalanceChanges: false,
        },
      })
    )
  );

  const transactionBlocks = await Promise.all(transactionBlockPromises);

  const blockByStoredDigest = transactionBlocks.find(
    (block) => block.digest === cursor
  );
  const storedBlockTimestamp = blockByStoredDigest
    ? Number(blockByStoredDigest.timestampMs)
    : 0;

  const newBlocks = transactionBlocks
    .filter(
      (block) =>
        block.digest !== cursor &&
        Number(block.timestampMs) > storedBlockTimestamp
    )
    .sort((a: any, b: any) => {
      if (a.timestampMs < b.timestampMs) return -1;
      if (a.timestampMs > b.timestampMs) return 1;
      return 0;
    });

  log(`New transaction blocks: ${JSON.stringify(newBlocks)}`);

  if (newBlocks.length > 0) {
    const eventModels: BaseSuiEventModel[] = [];

    newBlocks.forEach((block) => {
      block.events
        ?.filter((event) => eventToModelType[cleanEventType(event.type)])
        .forEach((event) => {
          const eventName = cleanEventType(event.type);
          const EventModeType = eventToModelType[eventName];
          if (!EventModeType) {
            throw new ConfigurationError(
              `Model type is not configured for event by name ${eventName}`
            );
          }
          const eventModel = new EventModeType(
            event,
            block.timestampMs ? Math.floor(Number(block.timestampMs) / 1000) : 0
          );
          eventModels.push(eventModel);
        });
    });

    for (let i = 0; i < eventModels.length; i++) {
      await pushToSQS(SUI_INDEXING_FIRST_QUEUE, eventModels[i]);
    }

    const newNextCursor = newBlocks[newBlocks.length - 1]?.digest;
    const configBlockNumber = new Config({
      key: NEXT_CURSOR,
      value: newNextCursor,
    });

    log(`Updating next cursor in db - ${newNextCursor}`);
    if (!cursorConfig) {
      await configRepository.put(configBlockNumber);
    } else {
      await configRepository.update(NEXT_CURSOR, configBlockNumber);
    }
  }

  return new ReadSuiEventsResponseModel();
}
