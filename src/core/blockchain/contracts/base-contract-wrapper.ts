import { Contract, providers, Event } from 'ethers';
import { ConfigurationError } from 'src/core/errors';
import { Network } from 'src/models/event-models';

export class BaseContractWrapper {
  contract: Contract;

  constructor(
    provider: providers.Provider,
    network: Network,
    address?: string
  ) {
    this.contract = new Contract(
      address ?? this.getAddress(network),
      this.getAbi(),
      provider
    );
  }

  public getAddress(network: Network): string {
    throw new ConfigurationError(
      `getAddress method for ${Network[network]} network is not implemented`
    );
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
