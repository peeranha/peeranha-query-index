import { DatabaseManager } from 'src/core/db/db-manager';
import { indexingPeriods } from 'src/core/index/period';
import {
  TriggerPeriodRequestModel,
  TriggerPeriodResponseModel,
} from 'src/models/period-trigger-models';

export async function triggerPeriodForDb(
  _request: TriggerPeriodRequestModel
): Promise<TriggerPeriodResponseModel> {
  await DatabaseManager.initialize();
  await indexingPeriods();
  return new TriggerPeriodResponseModel();
}
