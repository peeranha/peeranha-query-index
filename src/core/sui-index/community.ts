// import { TagData } from 'src/core/blockchain/entities/tag';
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
import {
  getSuiCommunityById,
  getSuiTagById,
} from 'src/core/sui-blockchain/data-loader';
import { log } from 'src/core/utils/logger';
import { Network } from 'src/models/event-models';

const communityRepository = new CommunityRepository();
const tagTranslationRepository = new TagTranslationRepository();
const communityTranslationRepository = new CommunityTranslationRepository();
const tagRepository = new TagRepository();

async function createTagTranslations(tag: TagData) {
  const promises: Promise<any>[] = [];

  if (tag.translations) {
    tag.translations.forEach((translation) => {
      const tagTranslation = new TagTranslationEntity({
        id: `${tag.tagId}-${translation.language}`,
        tagId: tag.tagId,
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

export async function createSuiTag(communityId: string, tagId: string) {
  if (await tagRepository.get(`${communityId}-${tagId}`)) {
    return;
  }

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
    language: 0,
  });

  await tagRepository.create(tagEntity);
  await createTagTranslations(peeranhaTag);
}

export async function updateSuiTag(communityId: string, tagId: string) {
  const id = `${communityId}-${tagId}`;
  log(`Updating sui tag by id ${id}`);

  const storedTag = await tagRepository.get(id);
  if (!storedTag) {
    await createSuiTag(communityId, tagId);
  } else {
    const peeranhaTag = await getSuiTagById(communityId, tagId);
    if (!peeranhaTag) {
      return;
    }

    const tagForSave = {
      name: peeranhaTag.name,
      description: peeranhaTag.description,
      ipfsHash: peeranhaTag.ipfsDoc[0],
      ipfsHash2: peeranhaTag.ipfsDoc[1],
    };
    await tagRepository.update(id, tagForSave);

    const oldTranslationsResponse =
      await tagTranslationRepository.getListOfProperties(
        'id',
        'tagId',
        peeranhaTag.tagId
      );
    const oldTranslations = oldTranslationsResponse.map(
      (translation) => translation.id
    );
    await deleteTagTranslations(oldTranslations);

    await createTagTranslations(peeranhaTag);
  }
}

async function createCommunityTranslations(
  communityId: string,
  translations: CommunityTranslation[]
) {
  const promises: Promise<any>[] = [];

  if (translations) {
    translations.forEach((translation) => {
      const communityTranslation = new CommunityTranslationEntity({
        id: `${communityId}-${translation.language}`,
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

  translations.forEach((id) => {
    promises.push(communityTranslationRepository.delete(id));
  });

  await Promise.all(promises);
}

export async function createSuiCommunity(
  communityId: string,
  network: Network,
  timestamp?: number
) {
  const peeranhaCommunity = await getSuiCommunityById(communityId);

  const communityEntity = new CommunityEntity({
    id: communityId,
    name: peeranhaCommunity.name,
    description: peeranhaCommunity.description,
    website: peeranhaCommunity.website,
    communitySite: peeranhaCommunity.communitySite,
    language: peeranhaCommunity.language,
    avatar: peeranhaCommunity.avatar,
    isFrozen: peeranhaCommunity.isFrozen,
    creationTime: timestamp!,
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

  await communityRepository.create(communityEntity);

  const tagsPromises: Promise<any>[] = [];
  for (let index = 1; index <= peeranhaCommunity.tags.length; index++) {
    tagsPromises.push(createSuiTag(communityId, `${network}-${index}`));
  }
  await Promise.all(tagsPromises);

  if (peeranhaCommunity.translations) {
    await createCommunityTranslations(
      communityId,
      peeranhaCommunity.translations
    );
  }

  return communityEntity;
}

export async function updateSuiCommunity(
  communityId: string,
  network: Network
) {
  log(`Updating sui community by id ${communityId}`);

  const storedCommunity = await communityRepository.get(communityId);
  if (!storedCommunity) {
    await createSuiCommunity(communityId, network);
  } else {
    const peeranhaCommunity = await getSuiCommunityById(communityId);
    if (!peeranhaCommunity) {
      return;
    }

    const communityForSave = {
      name: peeranhaCommunity.name,
      description: peeranhaCommunity.description,
      website: peeranhaCommunity.website,
      communitySite: peeranhaCommunity.communitySite,
      language: peeranhaCommunity.language,
      avatar: peeranhaCommunity.avatar,
      ipfsHash: peeranhaCommunity.ipfsDoc[0],
      ipfsHash2: peeranhaCommunity.ipfsDoc[1],
    };
    await communityRepository.update(communityId, communityForSave);

    const oldTranslationsResponse =
      await communityTranslationRepository.getListOfProperties(
        'id',
        'communityId',
        communityId
      );
    const oldTranslations = oldTranslationsResponse.map(
      (translation) => translation.id
    );
    await deleteCommunityTranslations(oldTranslations);

    const newTranslations = peeranhaCommunity.translations ?? [];
    await createCommunityTranslations(communityId, newTranslations);
  }
}

export async function getSuiCommunity(
  communityId: string,
  network: Network
): Promise<CommunityEntity> {
  let community = await communityRepository.get(communityId);
  if (!community) {
    community = await createSuiCommunity(communityId, network);
  }
  return community;
}

export async function getCommunityConfigLanguages(communityId: string) {
  const response = await communityTranslationRepository.getListOfProperties(
    ['language', 'enableAutotranslation'],
    'communityId',
    communityId
  );

  const result = response.map((item) => ({
    language: item.language,
    enableAutotranslation: item.enableAutotranslation,
  }));
  return result;
}

export async function getTagTranslations(id: string) {
  const properties = await tagTranslationRepository.getListOfProperties(
    'name',
    'tagId',
    id
  );

  const tagNames = properties.map((item) => item.name);
  return tagNames;
}
