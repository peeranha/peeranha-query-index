import { AddIpfsData } from 'src/core/utils/ipfs';
import { log, LogLevel } from 'src/core/utils/logger';

import { PeeranhaCommunityWrapper } from './contracts/peeranha-community-wrapper';
import { PeeranhaContentWrapper } from './contracts/peeranha-content-wrapper';
import { PeeranhaNFTWrapper } from './contracts/peeranha-nft-wrapper';
import { PeeranhaTokenWrapper } from './contracts/peeranha-token-wrapper';
import { PeeranhaUserWrapper } from './contracts/peeranha-user-wrapper';
import { AchievementData } from './entities/achievement';
import { CommentData } from './entities/comment';
import { CommunityData } from './entities/community';
import { ContractInfo } from './entities/contract-info';
import { Documentation } from './entities/documentation';
import { PostData } from './entities/post';
import { ReplyData } from './entities/reply';
import { TagData } from './entities/tag';
import { UserData } from './entities/user';
import { createRpcProvider, getDelegateUserSigner } from './infura';

export async function getPost(postId: number): Promise<PostData> {
  const provider = createRpcProvider();
  const wallet = await getDelegateUserSigner(provider);
  const mainContract = new PeeranhaContentWrapper(provider, wallet);
  const post = new PostData(await mainContract.getPost(postId));
  return AddIpfsData(post, post.ipfsDoc[0]);
}

export async function getReply(
  postId: number,
  replyId: number
): Promise<ReplyData | undefined> {
  try {
    const provider = createRpcProvider();
    const wallet = await getDelegateUserSigner(provider);
    const mainContract = new PeeranhaContentWrapper(provider, wallet);
    const reply = new ReplyData(await mainContract.getReply(postId, replyId));
    return await AddIpfsData(reply, reply.ipfsDoc[0]);
  } catch (err) {
    log(
      `Error during getting reply with id ${replyId} for postId ${postId}.\n${err}`,
      LogLevel.ERROR
    );
    return undefined;
  }
}

export async function getComment(
  postId: number,
  replyId: number,
  commentId: number
): Promise<CommentData | undefined> {
  try {
    const provider = createRpcProvider();
    const wallet = await getDelegateUserSigner(provider);
    const mainContract = new PeeranhaContentWrapper(provider, wallet);
    const comment = new CommentData(
      await mainContract.getComment(postId, replyId, commentId)
    );
    return await AddIpfsData(comment, comment.ipfsDoc[0]);
  } catch (err) {
    log(
      `Error during getting comment with id ${commentId}, replyId - ${replyId}, postId - ${postId}.\n${err}`,
      LogLevel.ERROR
    );
    return undefined;
  }
}

export async function getContractInfo(): Promise<ContractInfo> {
  const provider = createRpcProvider();
  const wallet = await getDelegateUserSigner(provider);
  const userContract = new PeeranhaUserWrapper(provider, wallet);
  return new ContractInfo(await userContract.getContractInfo());
}

export async function getUserByAddress(address: string): Promise<UserData> {
  const provider = createRpcProvider();
  const wallet = await getDelegateUserSigner(provider);
  const userContract = new PeeranhaUserWrapper(provider, wallet);
  const user = new UserData(await userContract.getUserByAddress(address));
  return AddIpfsData(user, user.ipfsDoc[0]);
}

export async function getUserRating(
  address: string,
  communityId: number
): Promise<number> {
  const provider = createRpcProvider();
  const wallet = await getDelegateUserSigner(provider);
  const userContract = new PeeranhaUserWrapper(provider, wallet);
  return userContract.getUserRating(address, communityId);
}

export async function getPeriod(): Promise<number> {
  const provider = createRpcProvider();
  const wallet = await getDelegateUserSigner(provider);
  const userContract = new PeeranhaUserWrapper(provider, wallet);
  return userContract.getPeriod();
}

export async function getUserRewardGraph(
  user: string,
  period: number
): Promise<any> {
  const provider = createRpcProvider();
  const wallet = await getDelegateUserSigner(provider);
  const tokenContract = new PeeranhaTokenWrapper(provider, wallet);
  return tokenContract.getUserRewardGraph(user, period);
}

export async function getActiveUsersInPeriod(
  period: number
): Promise<string[]> {
  const provider = createRpcProvider();
  const wallet = await getDelegateUserSigner(provider);
  const userContract = new PeeranhaUserWrapper(provider, wallet);
  return userContract.getActiveUsersInPeriod(period);
}

export async function getCommunity(id: number): Promise<CommunityData> {
  const provider = createRpcProvider();
  const wallet = await getDelegateUserSigner(provider);
  const contract = new PeeranhaCommunityWrapper(provider, wallet);
  const community = new CommunityData(await contract.getCommunity(id));
  return AddIpfsData(community, community.ipfsDoc[0]);
}

export async function getCommunities(): Promise<CommunityData[]> {
  const provider = createRpcProvider();
  const wallet = await getDelegateUserSigner(provider);
  const contract = new PeeranhaCommunityWrapper(provider, wallet);
  const communitiesCount = await contract.getCommunitiesCount();
  const communities: CommunityData[] = [];
  const promises: Promise<any>[] = [];

  for (let i = 1; i <= communitiesCount; i++) {
    promises.push(
      getCommunity(i)
        .then((community) => {
          return {
            ...community,
            id: i,
          };
        })
        .then((community) =>
          !community.isFrozen ? communities.push(community) : community
        )
    );
  }

  await Promise.all(promises);
  return communities;
}

export async function getTags(communityId: number): Promise<TagData[]> {
  const provider = createRpcProvider();
  const wallet = await getDelegateUserSigner(provider);
  const contract = new PeeranhaCommunityWrapper(provider, wallet);
  const tags = await contract.getTags(communityId);
  const tagsWithIpfsData: TagData[] = [];
  const promises: Promise<any>[] = [];

  tags.forEach((tag, index) => {
    promises.push(
      AddIpfsData(new TagData(tag), tag.ipfsDoc[0])
        .then((tagData) => {
          return {
            ...tagData,
            tagId: `${communityId}-${index + 1}`,
            communityId,
          };
        })
        .then((tagWithIpfs) => tagsWithIpfsData.push(tagWithIpfs))
    );
  });
  await Promise.all(promises);
  return tagsWithIpfsData;
}

export async function getTag(
  communityId: number,
  tagId: number
): Promise<TagData> {
  const provider = createRpcProvider();
  const wallet = await getDelegateUserSigner(provider);
  const contract = new PeeranhaCommunityWrapper(provider, wallet);
  const tag = new TagData(await contract.getTag(communityId, tagId));
  const tagWithIpfs = await AddIpfsData(tag, tag.ipfsDoc[0]);
  return {
    ...tagWithIpfs,
    tagId: `${communityId}-${tagId}`,
    communityId,
  };
}

export async function getAchievementsNFTConfig(
  achievementId: number
): Promise<AchievementData> {
  const provider = createRpcProvider();
  const wallet = await getDelegateUserSigner(provider);
  const contract = new PeeranhaNFTWrapper(provider, wallet);
  const achievement = new AchievementData(
    await contract.getAchievementsNFTConfig(achievementId)
  );
  const achievementData: AchievementData = await AddIpfsData(
    achievement,
    achievement.achievementURI.slice(7)
  );
  achievementData.attributes = JSON.stringify(achievementData.attributes);
  return achievementData;
}

export async function getDocumentationTree(
  communityId: number
): Promise<Documentation> {
  const provider = createRpcProvider();
  const wallet = await getDelegateUserSigner(provider);
  const contract = new PeeranhaContentWrapper(provider, wallet);
  return contract.getDocumentationTree(communityId);
}

export async function getItemProperty(
  propertyId: number,
  postId: number,
  replyId?: number,
  commentId?: number
): Promise<string | undefined> {
  try {
    const provider = createRpcProvider();
    const wallet = await getDelegateUserSigner(provider);
    const contract = new PeeranhaContentWrapper(provider, wallet);
    const itemProperty = await contract.getItemProperty(
      propertyId,
      postId,
      replyId,
      commentId
    );
    return itemProperty;
  } catch (err) {
    log(
      `Error during getting item property. Params: commentId - ${commentId}, replyId - ${replyId}, postId - ${postId}.\n${err}`,
      LogLevel.ERROR
    );
    return undefined;
  }
}
