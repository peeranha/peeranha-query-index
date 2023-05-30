import { providers } from 'ethers';
import { Network } from 'src/models/event-models';

export const DELEGATE_USERS_COUNT = 'DELEGATE_USERS_COUNT';
export const DELEGATE_USER_PRIVATE_KEY = 'DELEGATE_USER_PRIVATE_KEY_';

const NetworkEndpointName = {
  [Network.Polygon]: 'POLYGON',
  [Network.Edgeware]: 'EDGEWARE',
  [Network.Sui]: 'SUI',
};

export async function createRpcProvider(network: Network = 1) {
  const url = `${process.env[`RPC_${NetworkEndpointName[network]}_ENDPOINT`]}`;
  return new providers.JsonRpcProvider(url);
}
