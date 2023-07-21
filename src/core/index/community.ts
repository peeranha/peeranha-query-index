import { getCommunity, getTags } from 'src/core/blockchain/data-loader';
import { CommunityTranslation } from 'src/core/blockchain/entities/community';
import { TagData } from 'src/core/blockchain/entities/tag';
import {
  CommunityEntity,
  CommunityTranslationEntity,
  TagEntity,
  TagTranslationEntity,
} from 'src/core/db/entities';
import { CommunityRepository } from 'src/core/db/repositories/CommunityRepository';
import { CommunityTranslationRepository } from 'src/core/db/repositories/CommunityTranslationRepository';
import { TagRepository } from 'src/core/db/repositories/TagRepository';
import { TagTranslationRepository } from 'src/core/db/repositories/TagTranslationRepository';
import { Network } from 'src/models/event-models';

const communityRepository = new CommunityRepository();
const tagTranslationRepository = new TagTranslationRepository();
const communityTranslationRepository = new CommunityTranslationRepository();
const tagRepository = new TagRepository();

async function createTagTranslations(tag: TagData, network: Network) {
  const promises: Promise<any>[] = [];

  if (tag.translations) {
    tag.translations.forEach((translation) => {
      const tagTranslation = new TagTranslationEntity({
        id: `${tag.communityId}-${network}-${tag.tagId}-${translation.language}`,
        tagId: `${tag.communityId}-${network}-${tag.tagId}`,
        name: translation.name,
        description: translation.description,
        language: translation.language,
      });

      promises.push(tagTranslationRepository.create(tagTranslation));
    });
  }

  await Promise.all(promises);
}

async function deleteTagTranslations(translations: string[]) {
  const promises: Promise<any>[] = [];

  translations.forEach((id) =>
    promises.push(tagTranslationRepository.delete(id))
  );

  await Promise.all(promises);
}

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

export async function updateTag(tag: TagData, network: Network) {
  await tagRepository.update(`${tag.communityId}-${network}-${tag.tagId}`, {
    ipfsHash: tag.ipfsDoc[0],
    ipfsHash2: tag.ipfsDoc[1],
    name: tag.name,
    description: tag.description,
  });

  const oldTranslationsResponse =
    await tagTranslationRepository.getListOfProperties(
      'id',
      'tagId',
      `${tag.communityId}-${network}-${tag.tagId}`
    );
  const oldTranslations: string[] = oldTranslationsResponse.map(
    (translation: any) => translation.id
  );
  await deleteTagTranslations(oldTranslations);

  await createTagTranslations(tag, network);
}

async function createCommunityTranslations(
  communityId: string,
  translations: CommunityTranslation[]
) {
  const promises: Promise<any>[] = [];

  if (translations) {
    translations.forEach((translation) => {
      const communityTranslation = new CommunityTranslationEntity({
        id: `${communityId}-${translation.id}`,
        communityId,
        name: translation.name,
        description: translation.description,
        language: translation.language,
        enableAutotranslation: translation.enableAutotranslation,
      });

      promises.push(
        communityTranslationRepository.create(communityTranslation)
      );
    });
  }

  await Promise.all(promises);
}

async function deleteCommunityTranslations(translations: string[]) {
  const promises: Promise<any>[] = [];

  if (translations) {
    translations.forEach((id) => {
      promises.push(communityTranslationRepository.delete(id));
    });
  }

  await Promise.all(promises);
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

export async function updateCommunity(communityId: string, network: Network) {
  const peeranhaCommunity = await getCommunity(communityId, network);

  await communityRepository.update(communityId, {
    ipfsHash: peeranhaCommunity.ipfsDoc[0],
    ipfshash2: peeranhaCommunity.ipfsDoc[1],
    name: peeranhaCommunity.name,
    description: peeranhaCommunity.description,
    website: peeranhaCommunity.website,
    communitySite: peeranhaCommunity.communitySite,
    language: peeranhaCommunity.language,
    avatar: peeranhaCommunity.avatar,
  });

  const oldTranslationsResponse =
    await communityTranslationRepository.getListOfProperties(
      'id',
      'communityId',
      communityId
    );
  const oldTranslations: string[] = oldTranslationsResponse.map(
    (translation: any) => translation.id
  );
  await deleteCommunityTranslations(oldTranslations);

  const newTranslations = peeranhaCommunity.translations ?? [];
  await createCommunityTranslations(communityId, newTranslations);
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
