import { PostEntity } from 'src/core/db/entities';
import { BaseRepository } from 'src/core/db/repositories/BaseRepository';

const TABLE_NAME = 'post';

export class PostRepository extends BaseRepository<PostEntity, string> {
  constructor() {
    super(TABLE_NAME);
  }
}
