/* eslint-disable no-underscore-dangle */
export class ContractInfo {
  startPeriodTime: number;

  periodLength: number;

  constructor(contractInfo: any) {
    this.startPeriodTime = Number(contractInfo.startPeriodTime._hex);
    this.periodLength = Number(contractInfo.periodLength._hex);
  }
}
