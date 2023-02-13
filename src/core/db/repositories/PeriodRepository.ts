import { PeriodEntity } from 'src/core/db/entities';
import { BaseRepository } from 'src/core/db/repositories/BaseRepository';

const TABLE_NAME = 'period';

export class PeriodRepository extends BaseRepository<PeriodEntity, number> {
  constructor() {
    super(TABLE_NAME);
  }
}
