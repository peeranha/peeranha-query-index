/* eslint-disable no-await-in-loop */
import {
  PostEntity,
  UserCommunityRatingEntity,
  UserEntity,
} from 'src/core/db/entities';
import { ReplyRepository } from 'src/core/db/repositories/ReplyRepository';
import { UserCommunityRatingRepository } from 'src/core/db/repositories/UserCommunityRatingRepository';
import { UserRepository } from 'src/core/db/repositories/UserRepository';
import {
  getSuiUserById,
  getSuiUserRating,
} from 'src/core/sui-blockchain/data-loader';
import { log } from 'src/core/utils/logger';

const START_USER_RATING = 10;

const userRepository = new UserRepository();
const replyRepository = new ReplyRepository();
const userCommunityRatingRepository = new UserCommunityRatingRepository();

export async function createSuiUser(userId: string, timestamp: number) {
  log(`Indexing user by id ${userId}`);
  const storedUser = await userRepository.get(userId);
  if (storedUser) {
    if (timestamp < storedUser.creationTime)
      await userRepository.update(userId, {
        creationTime: timestamp,
      });
    return storedUser;
  }

  const peeranhaUser = await getSuiUserById(userId);
  if (!peeranhaUser) {
    return undefined;
  }

  const user = new UserEntity({
    id: userId,
    displayName: peeranhaUser.displayName || userId,
    postCount: 0,
    replyCount: 0,
    company: peeranhaUser.company || '',
    position: peeranhaUser.position || '',
    location: peeranhaUser.location || '',
    about: peeranhaUser.about || '',
    avatar: peeranhaUser.avatar || '',
    creationTime: timestamp,
    ipfsHash: peeranhaUser.ipfsDoc[0],
    ipfsHash2: peeranhaUser.ipfsDoc[1],
  });
  await userRepository.create(user);

  return user;
}

export async function updateSuiUser(userId: string, timestamp: number) {
  log(`Updating sui user by id ${userId}`);
  const storedUser = await userRepository.get(userId);
  if (!storedUser) {
    await createSuiUser(userId, timestamp);
  } else {
    const peeranhaUser = await getSuiUserById(userId);
    if (!peeranhaUser) {
      return;
    }

    const userForSave = {
      displayName:
        peeranhaUser.displayName ||
        `${userId.slice(0, 6)}...${userId.slice(-4)}`,
      company: peeranhaUser.company,
      position: peeranhaUser.position,
      location: peeranhaUser.location,
      about: peeranhaUser.about,
      avatar: peeranhaUser.avatar,
      ipfsHash: peeranhaUser.ipfsDoc[0],
      ipfsHash2: peeranhaUser.ipfsDoc[1],
    };
    await userRepository.update(userId, userForSave);
  }
}

export async function updateSuiUserRating(
  userAddress: string,
  communityId: string
) {
  const user = await userRepository.get(userAddress);
  if (!user) return;

  let rating = START_USER_RATING;

  const userRating = await getSuiUserRating(userAddress, communityId);

  if (userRating.isActive) {
    rating = userRating.rating;
  }

  const userRatingId = `${communityId} ${userAddress}`;
  let userComunityRating = await userCommunityRatingRepository.get(
    userRatingId
  );

  if (!userComunityRating) {
    userComunityRating = new UserCommunityRatingEntity({
      id: userRatingId,
      userId: userAddress,
      communityId,
      rating,
    });

    await userCommunityRatingRepository.create(userComunityRating);
  } else {
    await userCommunityRatingRepository.update(userRatingId, { rating });
  }
}

export async function updateSuiPostUsersRatings(post: PostEntity) {
  const promises: Promise<any>[] = [];
  promises.push(updateSuiUserRating(post.author, post.communityId));

  for (let i = 1; i <= post.replyCount; i++) {
    const reply = await replyRepository.get(`${post.id}-${i}`);

    if (
      reply &&
      !reply.isDeleted &&
      (reply.isFirstReply ||
        reply.isQuickReply ||
        reply.rating !== 0 ||
        reply.isBestReply)
    ) {
      promises.push(updateSuiUserRating(reply.author, post.communityId));
    }
  }
  await Promise.all(promises);
}
