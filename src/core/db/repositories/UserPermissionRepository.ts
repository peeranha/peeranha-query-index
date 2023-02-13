import { UserPermissionEntity } from 'src/core/db/entities';
import { BaseRepository } from 'src/core/db/repositories/BaseRepository';

const TABLE_NAME = 'userpermission';

export class UserPermissionRepository extends BaseRepository<
  UserPermissionEntity,
  string
> {
  constructor() {
    super(TABLE_NAME);
  }
}
