import { ReplyTranslationEntity } from 'src/core/db/entities';
import { BaseRepository } from 'src/core/db/repositories/BaseRepository';

const TABLE_NAME = 'replytranslation';

export class ReplyTranslationRepository extends BaseRepository<
  ReplyTranslationEntity,
  string
> {
  constructor() {
    super(TABLE_NAME);
  }
}
