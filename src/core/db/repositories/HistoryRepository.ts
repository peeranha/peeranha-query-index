import { HistoryEntity } from 'src/core/db/entities';
import { BaseRepository } from 'src/core/db/repositories/BaseRepository';

const TABLE_NAME = 'history';

export class HistoryRepository extends BaseRepository<HistoryEntity, string> {
  constructor() {
    super(TABLE_NAME);
  }
}
