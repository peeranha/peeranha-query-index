import {
  getAchievementCommunity,
  getAchievementConfig,
  getAchievementsNFTConfig,
} from 'src/core/blockchain/data-loader';
import { AchievementEntity } from 'src/core/db/entities';
import { AchievementRepository } from 'src/core/db/repositories/AchievementRepository';
import { Network } from 'src/models/event-models';

export async function createAchievement(
  achievementRepository: AchievementRepository,
  achievementId: number,
  network: Network
) {
  const [achievementData, peeranhaAchievementConfig, achievementCommunity] =
    await Promise.all([
      getAchievementsNFTConfig(achievementId, network),
      getAchievementConfig(achievementId, network),
      getAchievementCommunity(achievementId, network),
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
    id: `${network}-${achievementId}`,
    factCount: achievementData.factCount,
    maxCount: achievementData.maxCount,
    achievementURI: achievementData.achievementURI,
    name: achievementData.name,
    achievementsType: achievementData.achievementsType,
    lowerValue: peeranhaAchievementConfig?.lowerBound || 0,
    image: achievementData.image,
    description: achievementData.description,
    communityId: `${network}-${String(achievementCommunity)}`,
    attrCommunityId: attrCommunityId || '0', // ???
    attrEvent,
    attrType,
  });

  await achievementRepository.create(achievement);
}
