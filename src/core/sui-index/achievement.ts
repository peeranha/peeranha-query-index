/* eslint-disable no-await-in-loop */
import { AchievementRepository } from 'src/core/db/repositories/AchievementRepository';
import { UserAchievementRepository } from 'src/core/db/repositories/UserAchievementRepository';
import { UserRepository } from 'src/core/db/repositories/UserRepository';
import {
  getSuiAchievementById,
} from 'src/core/sui-blockchain/data-loader';
import { log } from 'src/core/utils/logger';
import { RuntimeError } from 'src/core/errors';
import { Network } from 'src/models/event-models';
import { AchievementEntity, UserAchievementEntity } from 'src/core/db/entities';

const achievementRepository = new AchievementRepository();
const userAchievementRepository = new UserAchievementRepository();
const userRepository = new UserRepository();

export async function configureSuiAchievement(
  achievementId: string,
  network: Network
) {
  log(`Indexing achievement by id ${achievementId}`);

  const peeranhaAchievement = await getSuiAchievementById(achievementId);
  log(`Achievement: ${JSON.stringify(peeranhaAchievement)}`);

  if (!peeranhaAchievement) {
    throw new RuntimeError(
      `Missing 'fields' in response for achievement ${achievementId}.`
    );
  }

  const name = peeranhaAchievement.name;
  const description = peeranhaAchievement.description;
  const image_url = peeranhaAchievement.image_url;

  const achievementEntity = new AchievementEntity({
    id: achievementId,
    factCount: peeranhaAchievement.factCount,
    maxCount: peeranhaAchievement.maxCount,
    achievementURI: "",
    name: name,
    achievementsType: peeranhaAchievement.achievementsType,
    lowerValue: peeranhaAchievement?.lowerBound || 0,
    image: image_url,
    description: description,
    communityId: `${network}-${peeranhaAchievement.communityId}`,
    attrCommunityId: '0',
    attrEvent: '0',
    attrType: '0',
  });

  await achievementRepository.create(achievementEntity);

  return peeranhaAchievement;
}

export async function unlockSuiAchievement(
  userObjectId: string,
  achievementId: string
) {
  log(`User: ${userObjectId} unlock achievement: ${achievementId}`);

  const storedUser = await userRepository.get(userObjectId);
  if (!storedUser) {
    throw new RuntimeError(
      `Missing information about user: ${userObjectId}.`
    );
  }

  const storedAchievement = await achievementRepository.get(achievementId);
  if (!storedAchievement) {
    throw new RuntimeError(
      `Missing information about user: ${userObjectId}.`
    );
  }

  const userAchievementEntity = new UserAchievementEntity({
    id: `${userObjectId}-${achievementId}`,
    userId: userObjectId,
    achievementId: achievementId,
    isMinted: false,
  });

  await userAchievementRepository.create(userAchievementEntity);

  return userAchievementEntity;
}