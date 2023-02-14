import { DatabaseManager } from 'src/core/db/db-manager';
import { indexingPeriods } from 'src/core/index/period';
import {
  TriggerPeriodRequestModel,
  TriggerPeriodResponseModel,
} from 'src/models/period-trigger-models';

export async function triggerPeriodForFirstDb(
  request: TriggerPeriodRequestModel
): Promise<TriggerPeriodResponseModel> {
  await DatabaseManager.initialize(request.queueName);
  await indexingPeriods();
  return new TriggerPeriodResponseModel();
}

export async function triggerPeriodForSecondDb(
  request: TriggerPeriodRequestModel
): Promise<TriggerPeriodResponseModel> {
  await DatabaseManager.initialize(request.queueName);
  await indexingPeriods();
  return new TriggerPeriodResponseModel();
}
