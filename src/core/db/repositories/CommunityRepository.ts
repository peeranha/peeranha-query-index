import { CommunityEntity } from 'src/core/db/entities';
import { BaseRepository } from 'src/core/db/repositories/BaseRepository';

const TABLE_NAME = 'community';

export class CommunityRepository extends BaseRepository<
  CommunityEntity,
  string
> {
  constructor() {
    super(TABLE_NAME);
  }
}
