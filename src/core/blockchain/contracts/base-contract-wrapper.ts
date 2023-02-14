import { Contract, Wallet, providers } from 'ethers';
import { ConfigurationError } from 'src/core/errors';

export class BaseContractWrapper {
  contract: Contract;

  delegateUserWallet: Wallet;

  constructor(provider: providers.Provider, wallet: Wallet, address?: string) {
    this.contract = new Contract(
      address ?? this.getAddress(),
      this.getAbi(),
      provider
    );
    this.delegateUserWallet = wallet.connect(provider);
  }

  public getAddress(): string {
    throw new ConfigurationError('getAddress method is not implemented');
  }

  public getAbi(): any {
    throw new ConfigurationError('getAbi method is not implemented');
  }
}
