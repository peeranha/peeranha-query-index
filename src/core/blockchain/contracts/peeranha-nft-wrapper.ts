import { ConfigurationError } from 'src/core/errors';

import peeranhaNFTInterface from './abi/PeeranhaNFT.json';
import { BaseContractWrapper } from './base-contract-wrapper';

export class PeeranhaNFTWrapper extends BaseContractWrapper {
  public getAchievementsNFTConfig(achievementId: number): Promise<any> {
    return this.contract.getAchievementsNFTConfig(achievementId);
  }

  public getAddress(): string {
    if (!process.env.NFT_CONTRACT_ADDRESS) {
      throw new ConfigurationError('NFT_CONTRACT_ADDRESS is not configured');
    }

    return process.env.NFT_CONTRACT_ADDRESS;
  }

  public getAbi() {
    return peeranhaNFTInterface.abi;
  }
}
