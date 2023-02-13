import { getAchievementsNFTConfig } from 'src/core/blockchain/data-loader';
import { AchievementEntity } from 'src/core/db/entities';
import { BaseRepository } from 'src/core/db/repositories/BaseRepository';

const TABLE_NAME = 'achievement';

export class AchievementRepository extends BaseRepository<
  AchievementEntity,
  number
> {
  constructor() {
    super(TABLE_NAME);
  }

  public async add(id: number) {
    const peeranhaAchievement = await getAchievementsNFTConfig(id);
    if (!peeranhaAchievement) return;
    const achievement = new AchievementEntity({
      id,
      factCount: peeranhaAchievement.factCount,
      maxCount: peeranhaAchievement.maxCount,
      achievementURI: peeranhaAchievement.achievementURI,
      name: peeranhaAchievement.name,
      achievementsType: peeranhaAchievement.achievementsType,
      image: peeranhaAchievement.image,
      attributes: peeranhaAchievement.attributes,
      description: peeranhaAchievement.description,
    });

    await this.create(achievement);
  }
}
