import { ConfigurationError } from 'src/core/errors';

import peeranhaCommunityInterface from './abi/PeeranhaCommunity.json';
import { BaseContractWrapper } from './base-contract-wrapper';

export class PeeranhaCommunityWrapper extends BaseContractWrapper {
  public async getCommunitiesCount(): Promise<number> {
    return this.contract.getCommunitiesCount();
  }

  public async getCommunity(communityId: number): Promise<any> {
    return this.contract.getCommunity(communityId);
  }

  public async getTag(communityId: number, tagId: number): Promise<any> {
    return this.contract.getTag(communityId, tagId);
  }

  public async getTags(communityId: number): Promise<any[]> {
    return this.contract.getTags(communityId);
  }

  public getAddress(): string {
    if (!process.env.COMMUNITY_CONTRACT_ADDRESS) {
      throw new ConfigurationError(
        'COMMUNITY_CONTRACT_ADDRESS is not configured'
      );
    }

    return process.env.COMMUNITY_CONTRACT_ADDRESS;
  }

  public getAbi() {
    return peeranhaCommunityInterface.abi;
  }
}
