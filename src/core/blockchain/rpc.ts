import { providers } from 'ethers';
import { Network } from 'src/models/event-models';

import { getSecretValue } from '../utils/secrets';

export const DELEGATE_USERS_COUNT = 'DELEGATE_USERS_COUNT';
export const DELEGATE_USER_PRIVATE_KEY = 'DELEGATE_USER_PRIVATE_KEY_';

const NetworkEndpointName = {
  [Network.Polygon]: 'POLYGON',
  [Network.Edgeware]: 'EDGEWARE',
  [Network.Sui]: 'SUI',
};

export async function createRpcProvider(network: Network = 1) {
  const urlSecretName = `RPC_${NetworkEndpointName[network]}_ENDPOINT`;
  const url = await getSecretValue(urlSecretName);
  return new providers.JsonRpcProvider(url);
}
