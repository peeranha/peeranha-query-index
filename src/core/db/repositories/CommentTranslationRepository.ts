import { CommentTranslationEntity } from 'src/core/db/entities';
import { BaseRepository } from 'src/core/db/repositories/BaseRepository';

const TABLE_NAME = 'commenttranslation';

export class CommentTranslationRepository extends BaseRepository<
  CommentTranslationEntity,
  string
> {
  constructor() {
    super(TABLE_NAME);
  }
}
