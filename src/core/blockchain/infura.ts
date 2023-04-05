import { providers, Wallet } from 'ethers';
import { log, LogLevel } from 'src/core/utils/logger';
import { getSecretValue } from 'src/core/utils/secrets';

const DELEGATE_USERS_COUNT = 'DELEGATE_USERS_COUNT';
const DELEGATE_USER_PRIVATE_KEY = 'DELEGATE_USER_PRIVATE_KEY_';

export function createRpcProvider() {
  return new providers.JsonRpcProvider(process.env.RPC_ENDPOINT);
}

export async function getDelegateUserSigner(
  provider: providers.JsonRpcProvider
) {
  const walletsCount = Number(await getSecretValue(DELEGATE_USERS_COUNT));

  /* eslint-disable no-await-in-loop */
  for (let i = 0; i < walletsCount - 1; i++) {
    const wallet = new Wallet(
      await getSecretValue(`${DELEGATE_USER_PRIVATE_KEY}${i + 1}`)
    );

    const latestNoncePromise = provider.getTransactionCount(
      wallet.address,
      'latest'
    );
    const pendingNoncePromise = provider.getTransactionCount(
      wallet.address,
      'pending'
    );

    const accountNonces = await Promise.all([
      latestNoncePromise,
      pendingNoncePromise,
    ]);

    if (accountNonces[0] === accountNonces[1]) {
      log(
        `Use wallet ${wallet.address} to send meta transaction`,
        LogLevel.INFO
      );
      return wallet;
    }
  }
  /* eslint-disable no-await-in-loop */

  log(`Use the last resort account to submit meta transaction`, LogLevel.WARN);

  const wallet = new Wallet(
    await getSecretValue(`${DELEGATE_USER_PRIVATE_KEY}${walletsCount}`)
  );
  return wallet;
}
