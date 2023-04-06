import { providers } from 'ethers';

export const createRpcProvider = () =>
  new providers.JsonRpcProvider(process.env.RPC_ENDPOINT);
