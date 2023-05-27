import peeranhaNFTInterface from 'src/core/blockchain/contracts/abi/PeeranhaNFT.json';
import { BaseContractWrapper } from 'src/core/blockchain/contracts/base-contract-wrapper';
import { ConfigurationError } from 'src/core/errors';
import { Network } from 'src/models/event-models';

export class PeeranhaNFTWrapper extends BaseContractWrapper {
  public getAchievementsNFTConfig(achievementId: string): Promise<any> {
    return this.contract.getAchievementsNFTConfig(achievementId.split('-')[1]);
  }

  public getAddress(network: Network): string {
    let nftAddress;
    if (network === Network.Polygon) {
      nftAddress = process.env.POLYGON_NFT_ADDRESS;
    }
    if (network === Network.Edgeware) {
      nftAddress = process.env.EDGEWARE_NFT_ADDRESS;
    }
    if (!nftAddress) {
      throw new ConfigurationError('NFT_ADDRESS is not configured');
    }

    return nftAddress;
  }

  public getAbi() {
    return peeranhaNFTInterface.abi;
  }
}
