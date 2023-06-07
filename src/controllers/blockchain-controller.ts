import { DatabaseManager } from 'src/core/db/db-manager';
import { indexingPeriods } from 'src/core/index/period';
import {
  TriggerPeriodRequestModel,
  TriggerPeriodResponseModel,
} from 'src/models/period-trigger-models';

export async function triggerPeriodForDb(
  request: TriggerPeriodRequestModel
): Promise<TriggerPeriodResponseModel> {
  await DatabaseManager.initialize(request.queueName);
  await indexingPeriods(request.network);
  return new TriggerPeriodResponseModel();
}
