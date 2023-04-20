import { CommunityData } from 'src/core/blockchain/entities/community';
import { TagData } from 'src/core/blockchain/entities/tag';
import { UserData } from 'src/core/blockchain/entities/user';
import { RuntimeError } from 'src/core/errors';
import { getObject } from 'src/core/sui-blockchain/sui';
import { AddIpfsData, byteArrayToHexString } from 'src/core/utils/ipfs';
import { log, LogLevel } from 'src/core/utils/logger';

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
    log(`User Data from contract: ${JSON.stringify(user)}`);
    await AddIpfsData(user, user.ipfsDoc[0]);
    log(`User Data with Ipfs info: ${JSON.stringify(user)}`);
    return user;
  } catch (err: any) {
    log(
      `Error during getting user. Params: userId - ${userId}\n${err}`,
      LogLevel.ERROR
    );
    return undefined;
  }
}

export async function getSuiCommunityById(communityId: string) {
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

  const community = new CommunityData({
    id: communityId,
    ipfsDoc: [ipfsHash1, ipfsHash2],
    timeCreate: fields.timeCreate,
    isFrozen: fields.isFrozen,
    tagsCount: Number(fields.tags.fields.size),
  });
  log(`Community Data from contract: ${JSON.stringify(community)}`);
  await AddIpfsData(community, community.ipfsDoc[0]);
  log(`Community Data with Ipfs info: ${JSON.stringify(community)}`);
  return community;
}

export async function getSuiTagById(tagId: string) {
  const tagObject = await getObject(tagId);

  log(`Tag object: ${JSON.stringify(tagObject)}`);

  const fields = tagObject.data?.content?.fields;

  if (!fields) {
    throw new RuntimeError(`Missing 'fields' in response for tag ${tagId}.`);
  }

  const ipfsHash1 = byteArrayToHexString(fields.value.fields.hash);
  const ipfsHash2 = byteArrayToHexString(fields.value.fields.hash2);

  const tag = new TagData({
    id: tagId,
    ipfsDoc: [ipfsHash1, ipfsHash2],
    name: fields.name,
  });
  log(`Tag Data from contract: ${JSON.stringify(tag)}`);
  await AddIpfsData(tag, tag.ipfsDoc[0]);
  log(`Tag Data with Ipfs info: ${JSON.stringify(tag)}`);
  return tag;
}
