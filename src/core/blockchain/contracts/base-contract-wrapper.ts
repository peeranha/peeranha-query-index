import { Contract, Wallet } from 'ethers';
import { ConfigurationError } from 'src/core/errors';
import { formatContractResponse } from 'src/core/utils/formatting';

export class BaseContractWrapper {
  contract: Contract;

  contractWithSigner: Contract;

  delegateUserWallet: Wallet;

  constructor(provider: any, wallet: any, address?: any) {
    this.contract = new Contract(
      address ?? this.getAddress(),
      this.getAbi(),
      provider
    );
    this.delegateUserWallet = wallet.connect(provider);
    this.contractWithSigner = this.contract.connect(this.delegateUserWallet);
  }

  public async callContract(action: string, args: any[]): Promise<any> {
    const result = await this.contract[action](...args);
    return formatContractResponse(result);
  }

  public getAddress(): string {
    throw new ConfigurationError('getAddress method is not implemented');
  }

  public getAbi(): any {
    throw new ConfigurationError('getAbi method is not implemented');
  }
}
