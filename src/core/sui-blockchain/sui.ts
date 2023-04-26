import { JsonRpcProvider, Connection } from '@mysten/sui.js';
import { ConfigurationError } from 'src/core/errors';
import { log } from 'src/core/utils/logger';
import { getSecretValue } from 'src/core/utils/secrets';

export async function createSuiProvider() {
  if (!process.env.SUI_RPC_ENDPOINT) {
    throw new ConfigurationError('SUI_RPC_ENDPOINT is not configured');
  }

  const apiKey = await getSecretValue('RPC_API_KEY');
  const fullnode = `${process.env.SUI_RPC_ENDPOINT}/${apiKey}`;

  const connection = new Connection({ fullnode });

  return new JsonRpcProvider(connection);
}

export async function queryTransactionBlocks(
  packageAddress: string,
  cursor: string | undefined | null,
  maxTxNumber: number
) {
  if (!process.env.SUI_RPC_ENDPOINT) {
    throw new ConfigurationError('SUI_RPC_ENDPOINT is not configured');
  }

  const apiKey = await getSecretValue('RPC_API_KEY');
  const url = `${process.env.SUI_RPC_ENDPOINT}/${apiKey}`;

  const response = await fetch(url, {
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
              package: packageAddress,
            },
          },
        },
        cursor,
        maxTxNumber,
      ],
    }),
  });

  const responseText = await response.text();
  log(`Response from suix_queryTransactionBlocks: ${responseText}`);
  const responseObject = JSON.parse(responseText);
  return responseObject.result;
}

export async function getObject(objectId: string) {
  if (!process.env.SUI_RPC_ENDPOINT) {
    throw new ConfigurationError('SUI_RPC_ENDPOINT are not configured');
  }

  const apiKey = await getSecretValue('RPC_API_KEY');
  const url = `${process.env.SUI_RPC_ENDPOINT}/${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'sui_getObject',
      params: [
        objectId,
        {
          showType: false,
          showOwner: false,
          showPreviousTransaction: false,
          showDisplay: false,
          showContent: true,
          showBcs: false,
          showStorageRebate: false,
        },
      ],
    }),
  });

  const responseObject = await response.json();

  return responseObject.result;
}

export async function getDynamicFieldObject(
  objectId: string,
  type: string,
  index: string
) {
  if (!process.env.SUI_RPC_ENDPOINT) {
    throw new ConfigurationError('SUI_RPC_ENDPOINT are not configured');
  }

  const apiKey = await getSecretValue('RPC_API_KEY');
  const url = `${process.env.SUI_RPC_ENDPOINT}/${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'suix_getDynamicFieldObject',
      params: [
        objectId,
        {
          type,
          value: index,
        },
        {
          showType: false,
          showOwner: false,
          showPreviousTransaction: false,
          showDisplay: false,
          showContent: true,
          showBcs: false,
          showStorageRebate: false,
        },
      ],
    }),
  });

  const responseObject = await response.json();

  return responseObject.result;
}
