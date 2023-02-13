import { UserRewardEntity } from 'src/core/db/entities';
import { BaseRepository } from 'src/core/db/repositories/BaseRepository';

const TABLE_NAME = 'userreward';

export class UserRewardRepository extends BaseRepository<
  UserRewardEntity,
  string
> {
  constructor() {
    super(TABLE_NAME);
  }
}
