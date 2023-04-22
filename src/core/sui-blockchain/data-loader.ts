import { CommunityData } from 'src/core/blockchain/entities/community';
import { PostData } from 'src/core/blockchain/entities/post';
import { TagData } from 'src/core/blockchain/entities/tag';
import { UserData } from 'src/core/blockchain/entities/user';
import { ConfigurationError, RuntimeError } from 'src/core/errors';
import { getObject, getDynamicFieldObject } from 'src/core/sui-blockchain/sui';
import { AddIpfsData, byteArrayToHexString } from 'src/core/utils/ipfs';
import { log, LogLevel } from 'src/core/utils/logger';
import { parseIntArray } from 'src/core/utils/parser';
import { UserRating } from 'src/core/blockchain/entities/user-rating';
import { ReplyData } from '../blockchain/entities/reply';

const TAG_DYNAMIC_FIELD_TYPE = 'u64';
const REPLY_DYNAMIC_FIELD_TYPE = 'u64';
const USER_RATING_DYNAMIC_FIELD_TYPE = '0x2::object::ID';

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
    tagsPromises.push(getDynamicFieldObject(tagTable, TAG_DYNAMIC_FIELD_TYPE, index.toString()));
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
  const tagObject = await getDynamicFieldObject(tagTable, TAG_DYNAMIC_FIELD_TYPE, tagId.toString());

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

  log(`Post object: ${JSON.stringify(postObject)}`);

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

export async function getReplyIpfsDoc(replyId: string) {
  const replyObject = await getObject(replyId);

  log(`Reply object: ${JSON.stringify(replyObject)}`);

  const fields = replyObject.data?.content?.fields;

  if (!fields) {
    throw new RuntimeError(
      `Missing 'fields' in response for reply ${replyObject}.`
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
    id: postMetaDataId,
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

export async function getSuiReply(
  postId: string,
  replyId: number,
  timestamp: number
): Promise<ReplyData | undefined> {
  try {
    const postMetaDataObject = await getObject(postId);
    const fields = postMetaDataObject.data?.content?.fields;
    if (!fields) {
      throw new RuntimeError(
        `Missing 'fields' in response for post meta data ${postId}.`
      );
    }
    const replyTableId = fields.replies?.fields?.id?.id;
    if(!replyTableId) {
      throw new RuntimeError(
        `Missing 'replies' in response for post meta data ${postId}.`
      );
    }

    const replyMetadataObject = await getDynamicFieldObject(replyTableId, REPLY_DYNAMIC_FIELD_TYPE, replyId.toString());
    log(`Reply: ${JSON.stringify(replyMetadataObject)}`);
    if(!replyMetadataObject) {
      throw new RuntimeError(
        `Unable to load reply ${replyId} from reply table ${replyTableId}.`
      );
    }

    const replyFields = replyMetadataObject.data?.content?.fields?.value?.fields;

    if (!replyFields) {
      throw new RuntimeError(
        `Missing 'fields' in response for reply meta data ${postId}, ${replyId}.`
      );
    }

    const ipfsDoc = await getReplyIpfsDoc(replyFields.replyId);

    const reply = new ReplyData({
      author: replyFields.author,
      ipfsDoc,
      parentReplyId: replyFields.parentReplyMetaDataKey,
      rating: Number(replyFields.rating?.fields?.bits),
      postTime: timestamp,
      propertyCount: 0,
      commentCount: parseInt(replyFields.comments?.fields?.size),
      isDeleted: replyFields.isDeleted,
      isFirstReply: replyFields.isFirstReply,
      isQuickReply: replyFields.isQuickReply
    });

    return await AddIpfsData(reply, reply.ipfsDoc[0]);
  } catch (err) {
    log(
      `Error during getting reply with id ${replyId} for postId ${postId}.\n${err}`,
      LogLevel.ERROR
    );
    return undefined;
  }
}

export async function getSuiUserRating(userId: string, communityId: string) {
  log(`Getting rating for user ${userId} in community ${communityId}`);

  if (!process.env.SUI_USERS_RATING_COLLECTION) {
    throw new ConfigurationError(
      'SUI_USERS_RATING_COLLECTION is not configured'
    );
  }

  const collectionObject = await getObject(
    process.env.SUI_USERS_RATING_COLLECTION
  );

  const fields = collectionObject.data?.content?.fields;

  if (!fields) {
    throw new RuntimeError(`Missing 'fields' in response for user collection ${process.env.SUI_USERS_RATING_COLLECTION}.`);
  }

  const tableId = fields?.usersCommunityRating?.fields?.id?.id;
  if(!tableId) {
    throw new RuntimeError(`Missing community rating table id in the response for user collection ${process.env.SUI_USERS_RATING_COLLECTION}.`)
  }

  log(`Loading user rating obj - ${tableId} ${USER_RATING_DYNAMIC_FIELD_TYPE} ${userId}`)
  const userRatingObject = await getDynamicFieldObject(tableId, USER_RATING_DYNAMIC_FIELD_TYPE, userId);
  if(!userRatingObject) {
    throw new RuntimeError(`User rating object is missing. Table id: ${tableId}. Type: ${USER_RATING_DYNAMIC_FIELD_TYPE}. User id: ${userId}`);
  }

  const userRatingContent : any[] = userRatingObject.data?.content?.fields?.value?.fields?.userRating?.fields?.contents;

  if(!userRatingContent) {
    throw new RuntimeError(`User rating content is empty for user rating collection ${process.env.SUI_USERS_RATING_COLLECTION} and user ${userId}`);
  }

  const communityUserRatings = userRatingContent.filter(communityRating => communityRating?.fields?.key === communityId);

  let active = false;
  let rating = 0;

  if(communityUserRatings.length >= 1) {
    const ratingStr = communityUserRatings[0].fields?.value?.fields?.bits;
    rating = parseInt(ratingStr);
    active = true;
  } 

  return new UserRating(
    {
      rating: rating,
      isActive: active
    }
  );
}
