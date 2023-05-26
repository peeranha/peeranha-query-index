import peeranhaTokenInterface from 'src/core/blockchain/contracts/abi/PeeranhaToken.json';
import { BaseContractWrapper } from 'src/core/blockchain/contracts/base-contract-wrapper';
import { ConfigurationError } from 'src/core/errors';
import { Network } from 'src/models/event-models';

export class PeeranhaTokenWrapper extends BaseContractWrapper {
  public async getUserRewardGraph(user: string, period: number): Promise<any> {
    return this.contract.getUserRewardGraph(user, period);
  }

  public getAddress(network: Network): string {
    const tokenAddress = !network
      ? process.env.POLYGON_TOKEN_ADDRESS
      : process.env.EDGEWARE_TOKEN_ADDRESS;
    if (!tokenAddress) {
      throw new ConfigurationError('TOKEN_ADDRESS is not configured');
    }

    return tokenAddress;
  }

  public getAbi() {
    return peeranhaTokenInterface.abi;
  }
}
