import { ReplyVoteHistoryEntity } from 'src/core/db/entities';
import { BaseRepository } from 'src/core/db/repositories/BaseRepository';

const TABLE_NAME = 'replyvotehistory';

export class ReplyVoteHistoryRepository extends BaseRepository<
  ReplyVoteHistoryEntity,
  string
> {
  constructor() {
    super(TABLE_NAME);
  }
}
