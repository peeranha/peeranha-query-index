import { getCommunity, getTags } from 'src/core/blockchain/data-loader';
import { TagData } from 'src/core/blockchain/entities/tag';

import { CommunityEntity, TagEntity } from '../db/entities';
import { CommunityRepository } from '../db/repositories/CommunityRepository';
import { TagRepository } from '../db/repositories/TagRepository';

const communityRepository = new CommunityRepository();
const tagRepository = new TagRepository();

export async function createTag(tag: TagData): Promise<TagEntity> {
  const tagEntity = new TagEntity({
    id: tag.tagId,
    name: tag.name,
    description: tag.description,
    communityId: tag.communityId,
    postCount: 0,
    deletedPostCount: 0,
    ipfsHash: tag.ipfsDoc[0],
    ipfsHash2: tag.ipfsDoc[1],
  });

  await tagRepository.create(tagEntity);

  return tagEntity;
}

export async function createCommunity(
  communityId: number
): Promise<CommunityEntity> {
  const [peeranhaCommunity, peeranhaTags] = await Promise.all([
    getCommunity(communityId),
    getTags(communityId),
  ]);

  const community = new CommunityEntity({
    id: communityId,
    name: peeranhaCommunity.name,
    description: peeranhaCommunity.description,
    website: peeranhaCommunity.website,
    communitySite: peeranhaCommunity.communitySite,
    language: peeranhaCommunity.language,
    avatar: peeranhaCommunity.avatar,
    isFrozen: peeranhaCommunity.isFrozen,
    creationTime: peeranhaCommunity.timeCreate,
    postCount: 0,
    deletedPostCount: 0,
    replyCount: 0,
    tagsCount: peeranhaCommunity.tagsCount,
    followingUsers: 0,
    ipfsHash: peeranhaCommunity.ipfsDoc[0],
    ipfsHash2: peeranhaCommunity.ipfsDoc[1],
  });

  await communityRepository.create(community);

  const promises: Promise<TagEntity>[] = [];
  peeranhaTags.forEach((tag) => promises.push(createTag(tag)));
  await Promise.all(promises);

  return community;
}

export async function getCommunityById(
  communityId: number
): Promise<CommunityEntity> {
  let community = await communityRepository.get(communityId);
  if (!community) {
    community = await createCommunity(communityId);
  }
  return community;
}
