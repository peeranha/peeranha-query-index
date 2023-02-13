import { TagEntity } from 'src/core/db/entities';
import { BaseRepository } from 'src/core/db/repositories/BaseRepository';

const TABLE_NAME = 'tag';

export class TagRepository extends BaseRepository<TagEntity, string> {
  constructor() {
    super(TABLE_NAME);
  }
}
