import { Contract, providers } from 'ethers';
import { ConfigurationError } from 'src/core/errors';

export class BaseContractWrapper {
  contract: Contract;

  constructor(provider: providers.Provider, address?: string) {
    this.contract = new Contract(
      address ?? this.getAddress(),
      this.getAbi(),
      provider
    );
  }

  public getAddress(): string {
    throw new ConfigurationError('getAddress method is not implemented');
  }

  public getAbi(): any {
    throw new ConfigurationError('getAbi method is not implemented');
  }
}
