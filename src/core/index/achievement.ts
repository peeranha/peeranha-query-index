import {
  getAchievementCommunity,
  getAchievementConfig,
  getAchievementsNFTConfig,
} from '../blockchain/data-loader';
import { AchievementEntity } from '../db/entities';
import { AchievementRepository } from '../db/repositories/AchievementRepository';

export async function createAchievement(
  achievementRepository: AchievementRepository,
  achievementId: number
) {
  const achievementData = await getAchievementsNFTConfig(achievementId);
  if (!achievementData) return;

  const [peeranhaAchievementConfig, achievementCommunity] = await Promise.all([
    getAchievementConfig(achievementId),
    getAchievementCommunity(achievementId),
  ]);

  let attrCommunityId;
  let attrEvent;
  let attrType;

  if (Array.isArray(achievementData.attributes)) {
    const { attributes } = achievementData;

    attrCommunityId = attributes.find(
      (attribute) => attribute.trait_type === 'Community Id'
    )?.value;
    attrEvent = attributes.find(
      (attribute) => attribute.trait_type === 'Event'
    )?.value;
    attrType = attributes.find(
      (attribute) => attribute.trait_type === 'Type'
    )?.value;
  }

  const achievement = new AchievementEntity({
    id: achievementId,
    factCount: achievementData.factCount,
    maxCount: achievementData.maxCount,
    achievementURI: achievementData.achievementURI,
    name: achievementData.name,
    achievementsType: achievementData.achievementsType,
    lowerValue: peeranhaAchievementConfig?.lowerBound || 0,
    image: achievementData.image,
    description: achievementData.description,
    communityId: achievementCommunity,
    attrCommunityId: Number(attrCommunityId) || 0,
    attrEvent,
    attrType,
  });

  await achievementRepository.create(achievement);
}
