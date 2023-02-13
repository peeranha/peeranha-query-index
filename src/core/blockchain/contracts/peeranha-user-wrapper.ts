import { ConfigurationError } from 'src/core/errors';

import peeranhaUserInterface from './abi/PeeranhaUser.json';
import { BaseContractWrapper } from './base-contract-wrapper';

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

  public async getPeriod(): Promise<number> {
    return this.contract.getPeriod();
  }

  public async getActiveUsersInPeriod(period: number): Promise<string[]> {
    return this.contract.getActiveUsersInPeriod(period);
  }

  public async getUserRating(
    address: string,
    communityId: number
  ): Promise<number> {
    return this.contract.getUserRating(address, communityId);
  }

  public getAddress(): string {
    if (!process.env.USER_CONTRACT_ADDRESS) {
      throw new ConfigurationError('USER_CONTRACT_ADDRESS is not configured');
    }

    return process.env.USER_CONTRACT_ADDRESS;
  }

  public getAbi() {
    return peeranhaUserInterface.abi;
  }
}
