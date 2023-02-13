import { ReplyEntity } from 'src/core/db/entities';
import { BaseRepository } from 'src/core/db/repositories/BaseRepository';

const TABLE_NAME = 'reply';

export class ReplyRepository extends BaseRepository<ReplyEntity, string> {
  constructor() {
    super(TABLE_NAME);
  }
}
