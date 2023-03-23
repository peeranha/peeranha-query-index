import { getAchievementConfig } from '../blockchain/data-loader';
import { AchievementData } from '../blockchain/entities/achievement';
import { AchievementEntity } from '../db/entities';
import { AchievementRepository } from '../db/repositories/AchievementRepository';

export async function createAchievement(
  achievementRepository: AchievementRepository,
  achievementId: number,
  achievementData: AchievementData
) {
  if (!achievementData) return;
  const peeranhaAchievementConfig = await getAchievementConfig(achievementId);

  const achievement = new AchievementEntity({
    id: achievementId,
    factCount: achievementData.factCount,
    maxCount: achievementData.maxCount,
    achievementURI: achievementData.achievementURI,
    name: achievementData.name,
    achievementsType: achievementData.achievementsType,
    lowerValue: peeranhaAchievementConfig?.lowerBound || 0,
    image: achievementData.image,
    attributes: achievementData.attributes,
    description: achievementData.description,
  });

  await achievementRepository.create(achievement);
}
