import { CommunityDocumentationEntity } from 'src/core/db/entities';
import { BaseRepository } from 'src/core/db/repositories/BaseRepository';

const TABLE_NAME = 'communitydocumentation';

export class CommunityDocumentationRepository extends BaseRepository<
  CommunityDocumentationEntity,
  number
> {
  constructor() {
    super(TABLE_NAME);
  }
}
