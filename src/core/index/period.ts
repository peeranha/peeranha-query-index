/* eslint-disable no-await-in-loop */
import { getContractInfo } from 'src/core/blockchain/data-loader';
import { ContractInfoEntity, PeriodEntity } from 'src/core/db/entities';
import { ContractInfoRepository } from 'src/core/db/repositories/ContractInfoRepository';
import { PeriodRepository } from 'src/core/db/repositories/PeriodRepository';
import { ConfigurationError } from 'src/core/errors';
import { indexingUserReward } from 'src/core/index/user';
import { log } from 'src/core/utils/logger';
import { Network } from 'src/models/event-models';

const getPeriod = (startPeriodTime: number, periodLength: number) =>
  Math.floor((Date.now() / 1000 - startPeriodTime) / periodLength);

const contractInfoRepository = new ContractInfoRepository();
const periodRepository = new PeriodRepository();

export async function indexingPeriods(network: Network) {
  if (!process.env.USER_ADDRESS) {
    throw new ConfigurationError('USER_ADDRESS is not set');
  }
  const { USER_ADDRESS } = process.env;
  let contractInfo = await contractInfoRepository.get(USER_ADDRESS);
  if (!contractInfo) {
    const periodInfo = await getContractInfo(network);
    contractInfo = new ContractInfoEntity({
      id: USER_ADDRESS,
      periodLength: periodInfo.periodLength,
      deployTime: periodInfo.startPeriodTime,
      lastUpdatePeriod: 0,
    });
    await contractInfoRepository.create(contractInfo);
  } else {
    contractInfo.lastUpdatePeriod += 1;
  }

  const promises: Promise<void>[] = [];

  const period = Math.min(
    getPeriod(contractInfo.deployTime, contractInfo.periodLength),
    contractInfo.lastUpdatePeriod + 5 * (process.env.ENV === 'prod' ? 1 : 10)
  );
  for (
    ;
    contractInfo.lastUpdatePeriod <= period;
    contractInfo.lastUpdatePeriod++
  ) {
    const { lastUpdatePeriod } = contractInfo;
    const startPeriodTime =
      contractInfo.deployTime + contractInfo.periodLength * lastUpdatePeriod;
    const endPeriodTime =
      contractInfo.deployTime +
      contractInfo.periodLength * (lastUpdatePeriod + 1);
    const periodEntity = new PeriodEntity({
      id: lastUpdatePeriod,
      startPeriodTime,
      endPeriodTime,
      isFinished: false,
    });
    await periodRepository.create(periodEntity);

    const previousPeriod = lastUpdatePeriod - 2;
    if (previousPeriod >= 0) {
      const timestamp = startPeriodTime - contractInfo.periodLength * 2;
      promises.push(indexingUserReward(previousPeriod, timestamp, network));

      const previousPeriodEntity = await periodRepository.get(previousPeriod);
      if (previousPeriodEntity) {
        await periodRepository.update(previousPeriod, {
          isFinished: true,
        });
      }
    }
  }

  await Promise.all(promises);

  await contractInfoRepository.update(USER_ADDRESS, {
    lastUpdatePeriod: period,
  });

  log(`Last updated period: ${period}`);
}
