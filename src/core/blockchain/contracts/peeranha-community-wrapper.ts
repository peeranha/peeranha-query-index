import peeranhaCommunityInterface from 'src/core/blockchain/contracts/abi/PeeranhaCommunity.json';
import { BaseContractWrapper } from 'src/core/blockchain/contracts/base-contract-wrapper';
import { ConfigurationError } from 'src/core/errors';
import { Network } from 'src/models/event-models';

export class PeeranhaCommunityWrapper extends BaseContractWrapper {
  public async getCommunitiesCount(): Promise<number> {
    return this.contract.getCommunitiesCount();
  }

  public async getCommunity(communityId: string): Promise<any> {
    return this.contract.getCommunity(communityId.split('-')[1]);
  }

  public async getTag(communityId: string, tagId: string): Promise<any> {
    return this.contract.getTag(communityId.split('-')[1], tagId.split('-')[1]);
  }

  public async getTags(communityId: string): Promise<any[]> {
    return this.contract.getTags(communityId.split('-')[1]);
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
