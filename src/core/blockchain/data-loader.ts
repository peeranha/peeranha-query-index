import { PeeranhaCommunityWrapper } from 'src/core/blockchain/contracts/peeranha-community-wrapper';
import { PeeranhaContentWrapper } from 'src/core/blockchain/contracts/peeranha-content-wrapper';
import { PeeranhaNFTWrapper } from 'src/core/blockchain/contracts/peeranha-nft-wrapper';
import { PeeranhaTokenWrapper } from 'src/core/blockchain/contracts/peeranha-token-wrapper';
import { PeeranhaUserWrapper } from 'src/core/blockchain/contracts/peeranha-user-wrapper';
import { AchievementData } from 'src/core/blockchain/entities/achievement';
import { AchievementConfig } from 'src/core/blockchain/entities/achievement-config';
import { CommentData } from 'src/core/blockchain/entities/comment';
import { CommunityData } from 'src/core/blockchain/entities/community';
import { ContractInfo } from 'src/core/blockchain/entities/contract-info';
import { Documentation } from 'src/core/blockchain/entities/documentation';
import { PostData } from 'src/core/blockchain/entities/post';
import { ReplyData } from 'src/core/blockchain/entities/reply';
import { TagData } from 'src/core/blockchain/entities/tag';
import { UserData } from 'src/core/blockchain/entities/user';
import { UserRating } from 'src/core/blockchain/entities/user-rating';
import { createRpcProvider } from 'src/core/blockchain/rpc';
import { AddIpfsData } from 'src/core/utils/ipfs';
import { log, LogLevel } from 'src/core/utils/logger';

export async function getPost(postId: number): Promise<PostData> {
  const provider = await createRpcProvider();
  const mainContract = new PeeranhaContentWrapper(provider);
  const post = new PostData(await mainContract.getPost(postId));
  return AddIpfsData(post, post.ipfsDoc[0]);
}

export async function getReply(
  postId: number,
  replyId: number
): Promise<ReplyData | undefined> {
  try {
    const provider = await createRpcProvider();
    const mainContract = new PeeranhaContentWrapper(provider);
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
    const provider = await createRpcProvider();
    const mainContract = new PeeranhaContentWrapper(provider);
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
  const provider = await createRpcProvider();
  const userContract = new PeeranhaUserWrapper(provider);
  return new ContractInfo(await userContract.getContractInfo());
}

export async function getUserByAddress(
  address: string
): Promise<UserData | undefined> {
  try {
    const provider = await createRpcProvider();
    const userContract = new PeeranhaUserWrapper(provider);
    const user = new UserData(await userContract.getUserByAddress(address));
    return await AddIpfsData(user, user.ipfsDoc[0]);
  } catch (err: any) {
    log(
      `Error during getting user. Params: address - ${address}\n${err}`,
      LogLevel.ERROR
    );
    return undefined;
  }
}

export async function getUserRating(
  address: string,
  communityId: number
): Promise<number> {
  const provider = await createRpcProvider();
  const userContract = new PeeranhaUserWrapper(provider);
  return userContract.getUserRating(address, communityId);
}

export async function getUserRewardGraph(
  user: string,
  period: number
): Promise<any> {
  const provider = await createRpcProvider();
  const tokenContract = new PeeranhaTokenWrapper(provider);
  return tokenContract.getUserRewardGraph(user, period);
}

export async function getActiveUsersInPeriod(
  period: number
): Promise<string[]> {
  const provider = await createRpcProvider();
  const userContract = new PeeranhaUserWrapper(provider);
  return userContract.getActiveUsersInPeriod(period);
}

export async function getCommunity(id: number): Promise<CommunityData> {
  const provider = await createRpcProvider();
  const contract = new PeeranhaCommunityWrapper(provider);
  const community = new CommunityData(await contract.getCommunity(id));
  return AddIpfsData(community, community.ipfsDoc[0]);
}

export async function getTags(communityId: number): Promise<TagData[]> {
  const provider = await createRpcProvider();
  const contract = new PeeranhaCommunityWrapper(provider);
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
  const provider = await createRpcProvider();
  const contract = new PeeranhaCommunityWrapper(provider);
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
  const provider = await createRpcProvider();
  const contract = new PeeranhaNFTWrapper(provider);
  const achievement = new AchievementData(
    await contract.getAchievementsNFTConfig(achievementId)
  );
  const achievementData: AchievementData = await AddIpfsData(
    achievement,
    achievement.achievementURI.slice(7)
  );
  return achievementData;
}

export async function getDocumentationTree(
  communityId: number
): Promise<Documentation> {
  const provider = await createRpcProvider();
  const contract = new PeeranhaContentWrapper(provider);
  return contract.getDocumentationTree(communityId);
}

export async function getItemProperty(
  propertyId: number,
  postId: number,
  replyId?: number,
  commentId?: number
): Promise<string | undefined> {
  try {
    const provider = await createRpcProvider();
    const contract = new PeeranhaContentWrapper(provider);
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

export async function getAchievementConfig(achievementId: number) {
  try {
    const provider = await createRpcProvider();
    const contract = new PeeranhaUserWrapper(provider);
    return new AchievementConfig(
      await contract.getAchievementConfig(achievementId)
    );
  } catch (err: any) {
    log(
      `Error during getting achievement config. Params: achievementId - ${achievementId}\n${err}`,
      LogLevel.ERROR
    );
    return undefined;
  }
}

export async function getAchievementCommunity(achievementId: number) {
  try {
    const provider = await createRpcProvider();
    const contract = new PeeranhaUserWrapper(provider);
    return await contract.getAchievementCommunity(achievementId);
  } catch (err: any) {
    log(
      `Error during getting achievement config. Params: achievementId - ${achievementId}\n${err}`,
      LogLevel.ERROR
    );
    return 0;
  }
}

export async function getUserRatingCollection(
  address: string,
  communityId: number
): Promise<UserRating | undefined> {
  try {
    const provider = await createRpcProvider();
    const userContract = new PeeranhaUserWrapper(provider);
    return new UserRating(
      await userContract.getUserRatingCollection(address, communityId)
    );
  } catch (err: any) {
    log(
      `Error during getting user rating collection. Params: user - ${address}, communityId - ${communityId}\n${err}`,
      LogLevel.ERROR
    );
    return undefined;
  }
}
