import { UserEntity } from 'src/core/db/entities';
import { BaseRepository } from 'src/core/db/repositories/BaseRepository';

const TABLE_NAME = 'user';

export class UserRepository extends BaseRepository<UserEntity, string> {
  constructor() {
    super(TABLE_NAME);
  }
}
