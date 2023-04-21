import { JsonRpcProvider, Connection } from '@mysten/sui.js';
import { ConfigurationError } from 'src/core/errors';

export function createSuiProvider() {
  if (!process.env.SUI_RPC_ENDPOINT) {
    throw new ConfigurationError('SUI_RPC_ENDPOINT is not configured');
  }

  const connection = new Connection({
    fullnode: process.env.SUI_RPC_ENDPOINT,
  });

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
              package: packageAddress,
            },
          },
        },
        cursor,
        maxTxNumber,
      ],
    }),
  });

  const responseObject = await response.json();

  return responseObject.result;
}

export async function getObject(objectId: string) {
  if (!process.env.SUI_RPC_ENDPOINT) {
    throw new ConfigurationError('SUI_RPC_ENDPOINT are not configured');
  }

  const response = await fetch(process.env.SUI_RPC_ENDPOINT, {
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
          showType: true,
          showOwner: true,
          showPreviousTransaction: true,
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

export async function getDynamicFieldObject(objectId: string, index: string) {
  if (!process.env.SUI_RPC_ENDPOINT) {
    throw new ConfigurationError('SUI_RPC_ENDPOINT are not configured');
  }

  const response = await fetch(process.env.SUI_RPC_ENDPOINT, {
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
          type: 'u64',
          value: index,
        },
        {
          showType: true,
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
