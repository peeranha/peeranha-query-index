import { SuiTransactionBlockResponse } from '@mysten/sui.js';
import { SUI_FIRST_QUEUE } from 'src/core/constants';
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
} from 'src/models/sui-event-models';
import {
  ReadSuiEventsRequestModel,
  ReadSuiEventsResponseModel,
} from 'src/models/sui-models';

const TRANSACTIONS_MAX_NUMBER = 100;

const eventOrder = [
  USER_CREATED_SUI_EVENT_NAME,
  COMMUNITY_CREATED_SUI_EVENT_NAME,
  TAG_CREATED_SUI_EVENT_NAME,
  POST_CREATED_SUI_EVENT_NAME,
  USER_UPDATED_SUI_EVENT_NAME,
  COMMUNITY_UPDATED_SUI_EVENT_NAME,
  TAG_UPDATED_SUI_EVENT_NAME,
];

const getSortedEventModels = (eventModels: BaseSuiEventModel[]) =>
  eventModels.sort((a, b) => {
    if (a.timestamp < b.timestamp) return -1;
    if (a.timestamp > b.timestamp) return 1;
    if (
      eventOrder.indexOf(cleanEventType(a.type)) <
      eventOrder.indexOf(cleanEventType(b.type))
    )
      return -1;
    if (
      eventOrder.indexOf(cleanEventType(a.type)) >
      eventOrder.indexOf(cleanEventType(b.type))
    )
      return 1;
    return 0;
  });

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

  if (cursor != null && digests.find((d) => d === cursor)) {
    log(
      `Latest cursor ${cursor} is included in the list of digests. Skipping.`
    );
    return new ReadSuiEventsResponseModel();
  }

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

  const eventModels: BaseSuiEventModel[] = [];

  transactionBlocks.forEach((block) => {
    block.events?.forEach((event) => {
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

  const promises: Promise<any>[] = [];

  const sortedEventModels = getSortedEventModels(eventModels);

  for (let i = 0; i < sortedEventModels.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    await pushToSQS(SUI_FIRST_QUEUE, sortedEventModels[i]);
  }

  await Promise.all(promises);

  const configBlockNumber = new Config({
    key: NEXT_CURSOR,
    value: nextCursor,
  });

  log(`Updating next cursor in db - ${nextCursor}`);
  if (!cursorConfig) {
    await configRepository.put(configBlockNumber);
  } else {
    await configRepository.update(NEXT_CURSOR, configBlockNumber);
  }

  return new ReadSuiEventsResponseModel();
}
