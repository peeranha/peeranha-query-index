import { JsonRpcProvider, devnetConnection } from '@mysten/sui.js';

export function createSuiProvider() {
  return new JsonRpcProvider(devnetConnection);
}

export async function getObject(id: string) {
  const provider = createSuiProvider();

  const object = await provider.getObject({
    id,
    options: {
      showType: true,
      showOwner: false,
      showPreviousTransaction: false,
      showDisplay: false,
      showContent: true,
      showBcs: false,
      showStorageRebate: false,
    },
  });

  return object;
}
