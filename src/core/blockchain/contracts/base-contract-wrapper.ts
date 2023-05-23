import { Contract, providers, Event } from 'ethers';
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

  public async getEvents(
    filter: any,
    startBlock: number,
    endBlock: number
  ): Promise<Event[]> {
    return this.contract.queryFilter(filter, startBlock, endBlock);
  }

  public async getEventsByName(
    eventName: string,
    startBlock: number,
    endBlock: number
  ): Promise<Event[]> {
    const createFilterFunc = this.contract.filters[eventName];
    if (!createFilterFunc) {
      throw new ConfigurationError(
        `Contract is missing ${eventName} event in ABI`
      );
    }
    const filter = createFilterFunc();
    return this.getEvents(filter, startBlock, endBlock);
  }

  public getEventsPromisesByNames(
    eventNames: string[],
    startBlock: number,
    endBlock: number
  ): Record<string, Promise<Event[]>> {
    const resultPromises: Record<string, Promise<Event[]>> = {};
    eventNames.forEach((eventName) => {
      resultPromises[eventName] = this.getEventsByName(
        eventName,
        startBlock,
        endBlock
      );
    });
    return resultPromises;
  }
}
