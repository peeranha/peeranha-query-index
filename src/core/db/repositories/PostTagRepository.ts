import { PostTagEntity } from 'src/core/db/entities';
import { BaseRepository } from 'src/core/db/repositories/BaseRepository';

const TABLE_NAME = 'posttag';

export class PostTagRepository extends BaseRepository<PostTagEntity, string> {
  constructor() {
    super(TABLE_NAME);
  }
}
