import peeranhaUserInterface from 'src/core/blockchain/contracts/abi/PeeranhaUser.json';
import { BaseContractWrapper } from 'src/core/blockchain/contracts/base-contract-wrapper';
import { ConfigurationError } from 'src/core/errors';

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

  public async getAchievementConfig(achievementId: number) {
    return this.contract.getAchievementConfig(achievementId);
  }

  public async getAchievementCommunity(achievementId: number): Promise<number> {
    return this.contract.getAchievementCommunity(achievementId);
  }

  public async getUserRatingCollection(address: string, communityId: number) {
    return this.contract.getUserRatingCollection(address, communityId);
  }

  public getAddress(): string {
    if (!process.env.USER_ADDRESS) {
      throw new ConfigurationError('USER_ADDRESS is not configured');
    }

    return process.env.USER_ADDRESS;
  }

  public getAbi() {
    return peeranhaUserInterface.abi;
  }
}
