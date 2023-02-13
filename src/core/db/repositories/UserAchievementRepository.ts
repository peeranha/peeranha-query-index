import { UserAchievementEntity } from 'src/core/db/entities';
import { BaseRepository } from 'src/core/db/repositories/BaseRepository';

const TABLE_NAME = 'userachievement';

export class UserAchievementRepository extends BaseRepository<
  UserAchievementEntity,
  string
> {
  constructor() {
    super(TABLE_NAME);
  }
}
