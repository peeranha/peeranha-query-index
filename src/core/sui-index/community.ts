import { TagData } from 'src/core/blockchain/entities/tag';
import { CommunityEntity, TagEntity } from 'src/core/db/entities';
import { CommunityRepository } from 'src/core/db/repositories/CommunityRepository';
import { TagRepository } from 'src/core/db/repositories/TagRepository';
import { getSuiCommunityById } from 'src/core/sui-blockchain/data-loader';

const communityRepository = new CommunityRepository();
const tagRepository = new TagRepository();

export async function createSuiTag(tag: TagData): Promise<TagEntity> {
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

export async function createSuiCommunity(id: string) {
  const peeranhaCommunity = await getSuiCommunityById(id);

  const communityEntity = new CommunityEntity({
    id,
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
  });

  await communityRepository.create(communityEntity);
}
