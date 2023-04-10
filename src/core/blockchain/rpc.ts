import { providers } from 'ethers';
import { getSecretValue } from 'src/core/utils/secrets';

export async function createRpcProvider() {
  const apiKey = await getSecretValue('RPC_API_KEY');
  const url = `${process.env.RPC_ENDPOINT}/${apiKey}`;
  return new providers.JsonRpcProvider(url);
}
