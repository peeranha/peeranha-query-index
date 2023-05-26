import peeranhaCommunityInterface from 'src/core/blockchain/contracts/abi/PeeranhaCommunity.json';
import { BaseContractWrapper } from 'src/core/blockchain/contracts/base-contract-wrapper';
import { ConfigurationError } from 'src/core/errors';
import { Network } from 'src/models/event-models';

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

  public getAddress(network: Network): string {
    let communnityAddress;
    if (network === Network.Polygon) {
      communnityAddress = process.env.POLYGON_COMMUNITY_ADDRESS;
    }
    if (network === Network.Edgeware) {
      communnityAddress = process.env.EDGEWARE_COMMUNITY_ADDRESS;
    }

    if (!communnityAddress) {
      throw new ConfigurationError('COMMUNITY_ADDRESS is not configured');
    }

    return communnityAddress;
  }

  public getAbi() {
    return peeranhaCommunityInterface.abi;
  }
}
