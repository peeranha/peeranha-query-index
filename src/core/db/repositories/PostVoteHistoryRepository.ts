import { PostVoteHistoryEntity } from 'src/core/db/entities';
import { BaseRepository } from 'src/core/db/repositories/BaseRepository';

const TABLE_NAME = 'postvotehistory';

export class PostVoteHistoryRepository extends BaseRepository<
  PostVoteHistoryEntity,
  string
> {
  constructor() {
    super(TABLE_NAME);
  }
}
