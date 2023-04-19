import { SuiTransactionBlockResponse } from '@mysten/sui.js';
import { createSuiProvider } from 'src/core/blockchain/sui';
import { SUI_FIRST_QUEUE } from 'src/core/constants';
import { DynamoDBConnector } from 'src/core/dynamodb/DynamoDbConnector';
import { Config } from 'src/core/dynamodb/entities/Config';
import {
  ConfigRepository,
  NEXT_CURSOR,
} from 'src/core/dynamodb/repositories/ConfigRepository';
import { ConfigurationError } from 'src/core/errors';
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
  if (!process.env.SUI_PACKAGE_ADDRESS || !process.env.SUI_RPC_ENDPOINT) {
    throw new ConfigurationError(
      'SUI_PACKAGE_ADDRESS or SUI_RPC_ENDPOINT are not configured'
    );
  }

  const provider = createSuiProvider(); // devnet connection

  const cursorConfig = await configRepository.get(NEXT_CURSOR);
  const CURSOR = cursorConfig ? cursorConfig.value : null;

  const response = await fetch(process.env.SUI_RPC_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'suix_queryTransactionBlocks',
      params: [
        {
          filter: {
            MoveFunction: {
              package: process.env.SUI_PACKAGE_ADDRESS,
            },
          },
        },
        CURSOR,
        TRANSACTIONS_MAX_NUMBER,
      ],
    }),
  });
  const responseObject = await response.json();

  const { data, nextCursor } = responseObject.result;
  const digests: string[] = data.map((block: any) => block.digest);

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

  if (nextCursor == null) {
    log('Next cursor is null');
    return new ReadSuiEventsResponseModel();
  }

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
