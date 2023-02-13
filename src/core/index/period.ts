/* eslint-disable no-await-in-loop */
import { getContractInfo, getPeriod } from 'src/core/blockchain/data-loader';
import { ContractInfoEntity, PeriodEntity } from 'src/core/db/entities';
import { ContractInfoRepository } from 'src/core/db/repositories/ContractInfoRepository';
import { ConfigurationError } from 'src/core/errors';
import { indexingUserReward } from 'src/core/index/user';

import { PeriodRepository } from '../db/repositories/PeriodRepository';

const contractInfoRepository = new ContractInfoRepository();

const periodRepository = new PeriodRepository();

export async function indexingPeriods() {
  if (!process.env.USER_CONTRACT_ADDRESS) {
    throw new ConfigurationError('USER_CONTRACT_ADDRESS is not set');
  }
  const { USER_CONTRACT_ADDRESS } = process.env;
  let contractInfo = await contractInfoRepository.get(USER_CONTRACT_ADDRESS);
  if (!contractInfo) {
    const periodInfo = await getContractInfo();
    contractInfo = new ContractInfoEntity({
      id: USER_CONTRACT_ADDRESS,
      periodLength: periodInfo.periodLength,
      deployTime: periodInfo.startPeriodTime,
      lastUpdatePeriod: 0,
    });
    await contractInfoRepository.create(contractInfo);
  } else {
    contractInfo.lastUpdatePeriod += 1;
  }

  const period = Math.min(
    await getPeriod(),
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
      await indexingUserReward(previousPeriod, timestamp);

      const previousPeriodEntity = await periodRepository.get(previousPeriod);
      if (previousPeriodEntity) {
        await periodRepository.update(previousPeriod, {
          isFinished: true,
        });
      }
    }
  }

  await contractInfoRepository.update(USER_CONTRACT_ADDRESS, {
    lastUpdatePeriod: period,
  });
}
