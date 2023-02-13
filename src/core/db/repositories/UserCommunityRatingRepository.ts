import { UserCommunityRatingEntity } from 'src/core/db/entities';
import { BaseRepository } from 'src/core/db/repositories/BaseRepository';

const TABLE_NAME = 'usercommunityrating';

export class UserCommunityRatingRepository extends BaseRepository<
  UserCommunityRatingEntity,
  string
> {
  constructor() {
    super(TABLE_NAME);
  }
}
