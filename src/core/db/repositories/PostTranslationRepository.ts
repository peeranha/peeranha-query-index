import { PostTranslationEntity } from 'src/core/db/entities';
import { BaseRepository } from 'src/core/db/repositories/BaseRepository';

const TABLE_NAME = 'posttranslation';

export class PostTranslationRepository extends BaseRepository<
  PostTranslationEntity,
  string
> {
  constructor() {
    super(TABLE_NAME);
  }
}
