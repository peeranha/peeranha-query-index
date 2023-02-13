import { UserCommunityEntity } from 'src/core/db/entities';
import { BaseRepository } from 'src/core/db/repositories/BaseRepository';

const TABLE_NAME = 'usercommunity';

export class UserCommunityRepository extends BaseRepository<
  UserCommunityEntity,
  string
> {
  constructor() {
    super(TABLE_NAME);
  }
}
