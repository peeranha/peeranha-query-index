import { getCommunity, getTags } from 'src/core/blockchain/data-loader';
import { TagData } from 'src/core/blockchain/entities/tag';
import { CommunityEntity, TagEntity } from 'src/core/db/entities';
import { CommunityRepository } from 'src/core/db/repositories/CommunityRepository';
import { TagRepository } from 'src/core/db/repositories/TagRepository';
import { Network } from 'src/models/event-models';

const communityRepository = new CommunityRepository();
const tagRepository = new TagRepository();

export async function createTag(
  tag: TagData,
  network: Network
): Promise<TagEntity> {
  const tagEntity = new TagEntity({
    id: `${tag.communityId}-${network}-${tag.tagId}`,
    name: tag.name,
    description: tag.description,
    communityId: tag.communityId,
    postCount: 0,
    deletedPostCount: 0,
    ipfsHash: tag.ipfsDoc[0],
    ipfsHash2: tag.ipfsDoc[1],
    language: 0,
  });

  await tagRepository.create(tagEntity);

  return tagEntity;
}

export async function createCommunity(
  communityId: string,
  network: Network
): Promise<CommunityEntity> {
  const [peeranhaCommunity, peeranhaTags] = await Promise.all([
    getCommunity(communityId, network),
    getTags(communityId, network),
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
    documentationCount: 0,
    deletedPostCount: 0,
    replyCount: 0,
    tagsCount: peeranhaCommunity.tagsCount,
    followingUsers: 0,
    ipfsHash: peeranhaCommunity.ipfsDoc[0],
    ipfsHash2: peeranhaCommunity.ipfsDoc[1],
    network,
  });

  await communityRepository.create(community);

  const promises: Promise<TagEntity>[] = [];
  peeranhaTags.forEach((tag) => promises.push(createTag(tag, network)));
  await Promise.all(promises);

  return community;
}

export async function getCommunityById(
  communityId: string,
  network: Network
): Promise<CommunityEntity> {
  let community = await communityRepository.get(communityId);
  if (!community) {
    community = await createCommunity(communityId, network);
  }
  return community;
}
