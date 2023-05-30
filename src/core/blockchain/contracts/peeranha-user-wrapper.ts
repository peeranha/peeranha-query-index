import peeranhaUserInterface from 'src/core/blockchain/contracts/abi/PeeranhaUser.json';
import { BaseContractWrapper } from 'src/core/blockchain/contracts/base-contract-wrapper';
import { ConfigurationError } from 'src/core/errors';
import { Network } from 'src/models/event-models';

export class PeeranhaUserWrapper extends BaseContractWrapper {
  public async getUserByAddress(address: string): Promise<any> {
    return this.contract.getUserByAddress(address);
  }

  public async isUserExists(address: string): Promise<boolean> {
    return this.contract.isUserExists(address);
  }

  public async getContractInfo(): Promise<any> {
    return this.contract.getContractInformation();
  }

  public async getActiveUsersInPeriod(period: number): Promise<string[]> {
    return this.contract.getActiveUsersInPeriod(period);
  }

  public async getAchievementConfig(achievementId: string) {
    return this.contract.getAchievementConfig(achievementId.split('-')[1]);
  }

  public async getAchievementCommunity(achievementId: string): Promise<number> {
    return this.contract.getAchievementCommunity(achievementId.split('-')[1]);
  }

  public async getUserRatingCollection(address: string, communityId: string) {
    return this.contract.getUserRatingCollection(
      address,
      communityId.split('-')[1]
    );
  }

  public getAddress(network: Network): string {
    let userAddress;
    if (network === Network.Polygon) {
      userAddress = process.env.POLYGON_USER_ADDRESS;
    }
    if (network === Network.Edgeware) {
      userAddress = process.env.EDGEWARE_USER_ADDRESS;
    }
    if (!userAddress) {
      throw new ConfigurationError('USER_ADDRESS is not configured');
    }

    return userAddress;
  }

  public getAbi() {
    return peeranhaUserInterface.abi;
  }
}
