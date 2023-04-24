import { TagTranslationEntity } from 'src/core/db/entities';
import { BaseRepository } from 'src/core/db/repositories/BaseRepository';

const TABLE_NAME = 'tagtranslation';

export class TagTranslationRepository extends BaseRepository<
  TagTranslationEntity,
  string
> {
  constructor() {
    super(TABLE_NAME);
  }
}
