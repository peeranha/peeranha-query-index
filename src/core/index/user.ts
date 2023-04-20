/* eslint-disable no-await-in-loop */
import {
  getUserByAddress,
  getActiveUsersInPeriod,
  getUserRewardGraph,
  getUserRatingCollection,
} from 'src/core/blockchain/data-loader';
import {
  PostEntity,
  UserCommunityRatingEntity,
  UserEntity,
  UserRewardEntity,
} from 'src/core/db/entities';
import { ReplyRepository } from 'src/core/db/repositories/ReplyRepository';
import { UserCommunityRatingRepository } from 'src/core/db/repositories/UserCommunityRatingRepository';
import { UserRepository } from 'src/core/db/repositories/UserRepository';
import { UserRewardRepository } from 'src/core/db/repositories/UserRewardRepository';
import { log, LogLevel } from 'src/core/utils/logger';

const replyRepository = new ReplyRepository();
const userRepository = new UserRepository();
const userCommunityRatingRepository = new UserCommunityRatingRepository();
const userRewardRepository = new UserRewardRepository();

const START_USER_RATING = 10;

export async function createUser(address: string, timestamp: number) {
  const storedUser = await userRepository.get(address);
  if (storedUser) {
    if (timestamp < storedUser.creationTime)
      await userRepository.update(address, {
        creationTime: timestamp,
      });
    return storedUser;
  }

  const peeranhaUser = await getUserByAddress(address);
  if (!peeranhaUser) {
    return undefined;
  }

  const user = new UserEntity({
    id: address,
    displayName:
      peeranhaUser.displayName ||
      `${address.slice(0, 6)}...${address.slice(-4)}`,
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

export async function updateUserRating(
  userAddress: string,
  communityId: string
) {
  const user = await userRepository.get(userAddress);
  if (!user) return;

  let rating = START_USER_RATING;

  const userRatingCollection = await getUserRatingCollection(
    userAddress,
    communityId
  );

  if (userRatingCollection.isActive) {
    rating = userRatingCollection.rating;
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

export async function updatePostUsersRatings(post: PostEntity) {
  const promises: Promise<any>[] = [];
  promises.push(updateUserRating(post.author, post.communityId));

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
      promises.push(updateUserRating(reply.author, post.communityId));
    }
  }
  await Promise.all(promises);
}

export async function indexingUserReward(
  period: number,
  timestamp: number
): Promise<void> {
  const activeUsersInPeriod = await getActiveUsersInPeriod(period);
  if (activeUsersInPeriod.length > 0) {
    log(
      `Number of active users in period ${period}: ${activeUsersInPeriod.length}`
    );
  }

  for (let i = 0; i < activeUsersInPeriod.length; i++) {
    const user = activeUsersInPeriod[i]!.toLowerCase();
    const userEntity = await userRepository.get(user);
    if (!userEntity) {
      log(`Creating non-existent user by address ${user}`, LogLevel.DEBUG);
      await createUser(user, timestamp);
    }

    const tokenReward = await getUserRewardGraph(user, period);
    const userReward = new UserRewardEntity({
      id: `${period}-${user}`,
      periodId: period,
      userId: user,
      tokenToReward: tokenReward.toString(),
      isPaid: false,
    });
    await userRewardRepository.create(userReward);

    log(
      `User by address ${user} was rewarded in period ${period}`,
      LogLevel.DEBUG
    );
  }
}
