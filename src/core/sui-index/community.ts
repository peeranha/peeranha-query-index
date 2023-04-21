// import { TagData } from 'src/core/blockchain/entities/tag';
import { CommunityEntity, TagEntity } from 'src/core/db/entities';
import { CommunityRepository } from 'src/core/db/repositories/CommunityRepository';
import { TagRepository } from 'src/core/db/repositories/TagRepository';
import {
  getSuiCommunityById,
  getSuiTagById,
} from 'src/core/sui-blockchain/data-loader';
import { log } from 'src/core/utils/logger';

const communityRepository = new CommunityRepository();
const tagRepository = new TagRepository();

export async function createSuiTag(
  communityId: string,
  tagId: number
): Promise<TagEntity> {
  const peeranhaTag = await getSuiTagById(communityId, tagId);
  const tagEntity = new TagEntity({
    id: peeranhaTag.tagId,
    name: peeranhaTag.name,
    description: peeranhaTag.description,
    communityId: peeranhaTag.communityId,
    postCount: 0,
    deletedPostCount: 0,
    ipfsHash: peeranhaTag.ipfsDoc[0],
    ipfsHash2: peeranhaTag.ipfsDoc[1],
  });

  await tagRepository.create(tagEntity);

  return tagEntity;
}

export async function updateSuiTag(communityId: string, tagId: number) {
  log(`Updating sui tag by id ${communityId}-${tagId}`);

  const storedTag = await tagRepository.get(`${communityId}-${tagId}`);
  if (!storedTag) {
    await createSuiTag(communityId, tagId);
  } else {
    const peeranhaTag = await getSuiTagById(communityId, tagId);
    if (!peeranhaTag) {
      return;
    }

    const tagForSave = {
      id: peeranhaTag.tagId,
      name: peeranhaTag.name,
      description: peeranhaTag.description,
      communityId: peeranhaTag.communityId,
      postCount: 0,
      deletedPostCount: 0,
      ipfsHash: peeranhaTag.ipfsDoc[0],
      ipfsHash2: peeranhaTag.ipfsDoc[1],
    };
    await tagRepository.update(`${communityId}-${tagId}`, tagForSave);
  }
}

export async function createSuiCommunity(communityId: string) {
  const peeranhaCommunity = await getSuiCommunityById(communityId);
  for (let index = 1; index < peeranhaCommunity.tags.length + 1; index++) {
    createSuiTag(communityId, index);
  }

  const communityEntity = new CommunityEntity({
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
  });

  await communityRepository.create(communityEntity);
}

export async function updateSuiCommunity(communityId: string) {
  log(`Updating sui community by id ${communityId}`);

  const storedCommunity = await communityRepository.get(communityId);
  if (!storedCommunity) {
    await createSuiCommunity(communityId);
  } else {
    const peeranhaCommunity = await getSuiCommunityById(communityId);
    if (!peeranhaCommunity) {
      return;
    }

    const communityForSave = {
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
    };
    await communityRepository.update(communityId, communityForSave);
  }
}
