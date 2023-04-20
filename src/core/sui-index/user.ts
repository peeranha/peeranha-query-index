import { UserRepository } from 'src/core/db/repositories/UserRepository';
import { UserEntity } from 'src/core/db/entities';
import { getSuiUserById } from 'src/core/sui-blockchain/data-loader';
import { log } from 'src/core/utils/logger';

const userRepository = new UserRepository();

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
    displayName:
      peeranhaUser.displayName || userId,
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