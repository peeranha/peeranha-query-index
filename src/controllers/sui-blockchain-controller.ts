import { SuiTransactionBlockResponse } from '@mysten/sui.js';
import { createSuiProvider, queryTransactionBlocks } from 'src/core/blockchain/sui';
import { SUI_FIRST_QUEUE } from 'src/core/constants';
import { DynamoDBConnector } from 'src/core/dynamodb/DynamoDbConnector';
import { Config } from 'src/core/dynamodb/entities/Config';
import {
  ConfigRepository,
  NEXT_CURSOR,
} from 'src/core/dynamodb/repositories/ConfigRepository';
import { ConfigurationError, RuntimeError } from 'src/core/errors';
import { log } from 'src/core/utils/logger';
import { pushToSQS } from 'src/core/utils/sqs';
import {
  ReadSuiEventsRequestModel,
  ReadSuiEventsResponseModel,
} from 'src/models/sui-models';

const TRANSACTIONS_MAX_NUMBER = 100;

const connDynamoDB = new DynamoDBConnector(process.env);
const configRepository = new ConfigRepository(connDynamoDB);

export async function readSuiEvents(
  _readEventsRequest: ReadSuiEventsRequestModel
): Promise<ReadSuiEventsResponseModel> {
  if (!process.env.SUI_PACKAGE_ADDRESS) {
    throw new ConfigurationError(
      'SUI_PACKAGE_ADDRESS is not configured'
    );
  }

  const provider = createSuiProvider();
  
  const cursorConfig = await configRepository.get(NEXT_CURSOR);
  const cursor = cursorConfig ? cursorConfig.value : null;
  
  log(`Requesting ${TRANSACTIONS_MAX_NUMBER} transactions with cursor ${cursor}`);
  const result = await queryTransactionBlocks(process.env.SUI_PACKAGE_ADDRESS, cursor, TRANSACTIONS_MAX_NUMBER);

  console.log(`Response: ${JSON.stringify(result)}`);

  const { data, nextCursor } = result;

  if (nextCursor == null) {
    throw new RuntimeError('Next cursor on the response is missing');
  }

  const digests: string[] = data.map((block: any) => block.digest);

  log(`Received digests: ${digests}`);

  if( cursor != null && digests.find(d => d==cursor)) {
    log(`Latest cursor ${cursor} is included in the list of digests. Skipping.`);
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

  const promises: Promise<any>[] = [];
  transactionBlocks.forEach((block) => {
    block.events?.forEach((event) => {
      promises.push(pushToSQS(SUI_FIRST_QUEUE, event));
    });
  });

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
