import peeranhaTokenInterface from 'src/core/blockchain/contracts/abi/PeeranhaToken.json';
import { BaseContractWrapper } from 'src/core/blockchain/contracts/base-contract-wrapper';
import { ConfigurationError } from 'src/core/errors';

export class PeeranhaTokenWrapper extends BaseContractWrapper {
  public async getUserRewardGraph(user: string, period: number): Promise<any> {
    return this.contract.getUserRewardGraph(user, period);
  }

  public getAddress(): string {
    if (!process.env.TOKEN_CONTRACT_ADDRESS) {
      throw new ConfigurationError('TOKEN_CONTRACT_ADDRESS is not configured');
    }

    return process.env.TOKEN_CONTRACT_ADDRESS;
  }

  public getAbi() {
    return peeranhaTokenInterface.abi;
  }
}
