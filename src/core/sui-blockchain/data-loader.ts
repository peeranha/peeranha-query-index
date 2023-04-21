import { CommunityData } from 'src/core/blockchain/entities/community';
import { PostData } from 'src/core/blockchain/entities/post';
import { TagData } from 'src/core/blockchain/entities/tag';
import { UserData } from 'src/core/blockchain/entities/user';
import { RuntimeError } from 'src/core/errors';
import { getObject, getDynamicFieldObject } from 'src/core/sui-blockchain/sui';
import { AddIpfsData, byteArrayToHexString } from 'src/core/utils/ipfs';
import { log, LogLevel } from 'src/core/utils/logger';
import { parseIntArray } from 'src/core/utils/parser';

export async function getSuiUserById(
  userId: string
): Promise<UserData | undefined> {
  try {
    const userObject = await getObject(userId);

    log(`User object: ${JSON.stringify(userObject)}`);

    const fields = userObject.data?.content?.fields;

    if (!fields) {
      throw new RuntimeError(
        `Missing 'fields' in response for user ${userId}.`
      );
    }

    const ipfsHash1 = byteArrayToHexString(fields.ipfsDoc.fields.hash);
    const ipfsHash2 = byteArrayToHexString(fields.ipfsDoc.fields.hash2);

    const user = new UserData([
      [ipfsHash1, ipfsHash2],
      fields.energy,
      fields.lastUpdatePeriod,
      fields.followedCommunities,
    ]);

    const userData = await AddIpfsData(user, user.ipfsDoc[0]);
    log(`User Data with Ipfs info: ${JSON.stringify(userData)}`);
    return userData;
  } catch (err: any) {
    log(
      `Error during getting user. Params: userId - ${userId}\n${err}`,
      LogLevel.ERROR
    );
    return undefined;
  }
}

export async function getSuiCommunityById(
  communityId: string
): Promise<CommunityData> {
  const communityObject = await getObject(communityId);

  log(`Community object: ${JSON.stringify(communityObject)}`);

  const fields = communityObject.data?.content?.fields;

  if (!fields) {
    throw new RuntimeError(
      `Missing 'fields' in response for community ${communityId}.`
    );
  }

  const ipfsHash1 = byteArrayToHexString(fields.ipfsDoc.fields.hash);
  const ipfsHash2 = byteArrayToHexString(fields.ipfsDoc.fields.hash2);

  const tagsCount = Number(fields.tags.fields.size);
  const tagTable = fields.tags.fields.id.id;
  const tagsPromises: Promise<any>[] = [];
  for (let index = 1; index < tagsCount + 1; index++) {
    tagsPromises.push(getDynamicFieldObject(tagTable, index.toString()));
  }

  const tags = await Promise.all(tagsPromises);

  const community = new CommunityData({
    id: communityId,
    ipfsDoc: [ipfsHash1, ipfsHash2],
    timeCreate: fields.timeCreate,
    isFrozen: fields.isFrozen,
    tagsCount,
    tags,
  });

  const communityData = await AddIpfsData(community, community.ipfsDoc[0]);
  log(`Community Data with Ipfs info: ${JSON.stringify(communityData)}`);
  return communityData;
}

export async function getSuiTagById(
  communityId: string,
  tagId: number
): Promise<TagData> {
  const communityObject = await getObject(communityId);

  log(`Community object: ${JSON.stringify(communityObject)}`);

  const communityFields = communityObject.data?.content?.fields;
  if (!communityFields) {
    throw new RuntimeError(
      `Missing 'fields' in response for community ${communityId}.`
    );
  }
  const tagTable = communityFields.tags.fields.id.id;
  const tagObject = await getDynamicFieldObject(tagTable, tagId.toString());

  log(`Tag object: ${JSON.stringify(tagObject)}`);

  const fields = tagObject.data?.content?.fields;

  if (!fields) {
    throw new RuntimeError(`Missing 'fields' in response for tag ${tagId}.`);
  }

  const ipfsHash1 = byteArrayToHexString(
    fields.value.fields.ipfsDoc.fields.hash
  );
  const ipfsHash2 = byteArrayToHexString(
    fields.value.fields.ipfsDoc.fields.hash2
  );

  const tag = new TagData({
    ipfsDoc: [ipfsHash1, ipfsHash2],
  });

  const tagData = await AddIpfsData(tag, tag.ipfsDoc[0]);
  tagData.tagId = `${communityId}-${tagId}`;
  tagData.communityId = communityId;
  log(`Tag Data with Ipfs info: ${JSON.stringify(tagData)}`);
  return tagData;
}

async function getPostIpfsDoc(postId: string) {
  const postObject = await getObject(postId);

  log(`Post meta data object: ${JSON.stringify(postObject)}`);

  const fields = postObject.data?.content?.fields;

  if (!fields) {
    throw new RuntimeError(
      `Missing 'fields' in response for post ${postObject}.`
    );
  }

  const ipfsHash1 = byteArrayToHexString(fields.ipfsDoc.fields.hash);
  const ipfsHash2 = byteArrayToHexString(fields.ipfsDoc.fields.hash2);

  return [ipfsHash1, ipfsHash2];
}

export async function getSuiPostById(
  postMetaDataId: string,
  timestamp: number
): Promise<PostData> {
  const postMetaDataObject = await getObject(postMetaDataId);

  log(`Post meta data object: ${JSON.stringify(postMetaDataObject)}`);

  const fields = postMetaDataObject.data?.content?.fields;

  if (!fields) {
    throw new RuntimeError(
      `Missing 'fields' in response for post meta data ${postMetaDataId}.`
    );
  }

  const ipfsDoc = await getPostIpfsDoc(fields.postId);

  const post = new PostData({
    id: fields.postId,
    ipfsDoc,
    postType: fields.postType,
    communityId: fields.communityId,
    author: fields.author,
    deletedReplyCount: fields.deletedReplyCount,
    postTime: timestamp,
    rating: Number(fields.rating.fields.bits),
    isDeleted: fields.isDeleted,
    tags: parseIntArray(fields.tags),
    officialReply: fields.officialReplyMetaDataKey,
    bestReply: fields.bestReplyMetaDataKey,
    replyCount: fields.replies.fields.size,
    commentCount: fields.comments.fields.size,
    propertyCount: fields.properties.length,
  });

  const postData = await AddIpfsData(post, post.ipfsDoc[0]);
  log(`Post Data with Ipfs info: ${JSON.stringify(postData)}`);
  return postData;
}
