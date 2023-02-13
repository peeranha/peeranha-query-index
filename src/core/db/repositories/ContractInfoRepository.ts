import { ContractInfoEntity } from 'src/core/db/entities';
import { BaseRepository } from 'src/core/db/repositories/BaseRepository';

const TABLE_NAME = 'contractinfo';

export class ContractInfoRepository extends BaseRepository<
  ContractInfoEntity,
  string
> {
  constructor() {
    super(TABLE_NAME);
  }
}
