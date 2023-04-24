import { CommunityTranslationEntity } from 'src/core/db/entities';
import { BaseRepository } from 'src/core/db/repositories/BaseRepository';

const TABLE_NAME = 'communitytranslation';

export class CommunityTranslationRepository extends BaseRepository<
  CommunityTranslationEntity,
  string
> {
  constructor() {
    super(TABLE_NAME);
  }
}
