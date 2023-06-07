import { Network } from 'src/models/event-models';

export class TriggerPeriodRequestModel {
  public queueName: string;

  public network: Network;

  constructor(queueName: string, network: Network) {
    this.queueName = queueName;
    this.network = network;
  }
}

export class TriggerPeriodResponseModel {}
