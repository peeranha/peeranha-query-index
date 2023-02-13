import { CommentEntity } from 'src/core/db/entities';
import { BaseRepository } from 'src/core/db/repositories/BaseRepository';

const TABLE_NAME = 'comment';

export class CommentRepository extends BaseRepository<CommentEntity, string> {
  constructor() {
    super(TABLE_NAME);
  }
}
