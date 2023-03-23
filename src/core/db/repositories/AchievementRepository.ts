import { AchievementEntity } from 'src/core/db/entities';
import { BaseRepository } from 'src/core/db/repositories/BaseRepository';

const TABLE_NAME = 'achievement';

export class AchievementRepository extends BaseRepository<
  AchievementEntity,
  number
> {
  constructor() {
    super(TABLE_NAME);
  }
}
