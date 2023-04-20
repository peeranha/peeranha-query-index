import bs58 from 'bs58';
import { log } from 'src/core/utils/logger';

export const getIpfsHashFromBytes32 = (bytes32Hex: any) => {
  const hashHex = `1220${bytes32Hex.slice(2)}`;
  const hashBytes = Buffer.from(hashHex, 'hex');
  return bs58.encode(hashBytes);
};

export const byteArrayToHexString = (byteArray: any[]) => {
  return `0x${byteArray.map((n) => n.toString(16).padStart(2, '0')).join('')}`;
};

export const getDataFromIpfs = async (hashBytes: any): Promise<any> => {
  return fetch(process.env.IPFS_CDN_URL + hashBytes).then((x) => x.json());
};

export async function AddIpfsData(
  model: any,
  bytes32Hex: string
): Promise<any> {
  const ipfsHash =
    bytes32Hex.slice(0, 2) === '0x'
      ? getIpfsHashFromBytes32(bytes32Hex)
      : bytes32Hex;
  log(`Loading IPFS hash - ${ipfsHash}`);
  const content = await getDataFromIpfs(ipfsHash);
  log(`Content from IPFS: ${JSON.stringify(content)}`);
  const result = { ...model };
  Object.keys(content).forEach((key) => {
    if (Object.keys(model).some((modelKey) => modelKey === key)) {
      result[key] = content[key];
    } else {
      log(`WARNING! AddIpfsData: Model has no attribute ${key}`);
    }
  });
  return result;
}
