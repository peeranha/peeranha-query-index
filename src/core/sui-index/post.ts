import { PostEntity, PostTagEntity } from 'src/core/db/entities';
import { CommunityRepository } from 'src/core/db/repositories/CommunityRepository';
import { PostRepository } from 'src/core/db/repositories/PostRepository';
import { PostTagRepository } from 'src/core/db/repositories/PostTagRepository';
import { TagRepository } from 'src/core/db/repositories/TagRepository';
// import { ReplyRepository } from 'src/core/db/repositories/ReplyRepository';
import { UserRepository } from 'src/core/db/repositories/UserRepository';
import { getSuiPostById } from 'src/core/sui-blockchain/data-loader';
import { getSuiCommunity } from 'src/core/sui-index/community';
import { createSuiUser, updateSuiUserRating } from 'src/core/sui-index/user';

const postRepository = new PostRepository();
const communityRepository = new CommunityRepository();
const userRepository = new UserRepository();
const postTagRepository = new PostTagRepository();
const tagRepository = new TagRepository();

async function updateTagsPostCount(
  newTags: string[],
  oldTags: string[]
): Promise<string> {
  let tagNames = '';
  const promises: Promise<any>[] = [];

  newTags.forEach(async (newTag) => {
    const tag = await tagRepository.get(newTag);
    if (tag) {
      tagNames += ` ${tag.name}`;

      promises.push(
        tagRepository.update(newTag, {
          postCount: tag.postCount + 1,
        })
      );
    }
  });

  oldTags.forEach(async (oldTag) => {
    const tag = await tagRepository.get(oldTag);

    if (tag) {
      promises.push(
        tagRepository.update(oldTag, {
          postCount: tag.postCount - 1,
        })
      );
    }
  });

  await Promise.all(promises);
  return tagNames;
}

export async function createSuiPost(postMetaDataId: string, timestamp: number) {
  const peeranhaPost = await getSuiPostById(postMetaDataId, timestamp);

  const post = new PostEntity({
    id: peeranhaPost.id,
    postType: peeranhaPost.postType,
    communityId: peeranhaPost.communityId,
    title: peeranhaPost.title,
    content: peeranhaPost.content,
    postContent: `${peeranhaPost.title} ${peeranhaPost.content}`,
    author: peeranhaPost.author.toLowerCase(),
    isDeleted: false,
    postTime: peeranhaPost.postTime,
    lastMod: peeranhaPost.postTime,
    commentCount: 0,
    replyCount: 0,
    rating: 0,
    officialReply: '0',
    bestReply: peeranhaPost.bestReply,
    ipfsHash: peeranhaPost.ipfsDoc[0],
    ipfsHash2: peeranhaPost.ipfsDoc[1],
  });

  const tagIds = peeranhaPost.tags.map((tag) => `${post.communityId}-${tag}`);
  post.postContent += await updateTagsPostCount(tagIds, []);

  const community = await getSuiCommunity(post.communityId);

  let user = await userRepository.get(post.author);
  if (!user) {
    user = await createSuiUser(post.author, timestamp);
  }

  await Promise.all([
    communityRepository.update(community.id, {
      postCount: community.postCount + 1,
    }),

    userRepository.update(post.author, {
      postCount: user!.postCount + 1,
    }),

    postRepository.create(post),

    updateSuiUserRating(post.author, post.communityId),
  ]);

  const promises: Promise<any>[] = [];
  tagIds.forEach((tag) => {
    const postTag = new PostTagEntity({
      id: `${post.id}-${tag}`,
      postId: post.id,
      tagId: tag,
    });
    promises.push(postTagRepository.create(postTag));
  });
  await Promise.all(promises);

  return post;
}

export async function createSuiReply(
  postMetaDataId: string,
  parentReplyKey: number,
  replyMetaDataKey: number,
  timestamp: number
) {
  console.log(
    123123123,
    postMetaDataId,
    parentReplyKey,
    replyMetaDataKey,
    timestamp
  );
  return null;
  // const peeranhaPost = await getSuiPostById(postMetaDataId, timestamp);
  // const peeranhaReply = await getSuiReplyById(postMetaDataId, replyMetaDataKey); // need finish getSuiReplyById func

  // if (!peeranhaReply) {
  //   return undefined;
  // }

  // const reply = new ReplyEntity({
  //   id: `${peeranhaPost.id}-${parentReplyKey}`,
  //   postId: `${peeranhaPost.id}`,
  //   content: peeranhaReply.content,
  //   author: peeranhaReply.author.toLowerCase(),
  //   isDeleted: false,
  //   isFirstReply: peeranhaReply.isFirstReply,
  //   isQuickReply: peeranhaReply.isQuickReply,
  //   postTime: peeranhaReply.postTime,
  //   parentReplyId: peeranhaReply.parentReplyId,
  //   rating: 0,
  //   isBestReply: false,
  //   commentCount: 0,
  //   isOfficialReply: false,
  //   ipfsHash: peeranhaReply.ipfsDoc[0],
  //   ipfsHash2: peeranhaReply.ipfsDoc[1],
  // });

  // let user = await userRepository.get(reply.author);
  // if (!user) {
  //   user = await createSuiUser(reply.author, timestamp);
  // }

  // const promises: Promise<any>[] = [];

  // promises.push(
  //   userRepository.update(reply.author, {
  //     replyCount: user!.replyCount + 1,
  //   })
  // );

  // const post = await postRepository.get(peeranhaPost.id);
  // if (post) {
  //   const community = await getSuiCommunity(post.communityId);
  //   promises.push(
  //     communityRepository.update(post.communityId, {
  //       replyCount: community.replyCount + 1,
  //     })
  //   );

  // const officialReply = await changedStatusOfficialReply(
  //   peeranhaPost,
  //   String(replyId),
  //   post
  // );
  // reply.isOfficialReply = String(replyId) === officialReply;

  // promises.push(
  //   postRepository.update(peeranhaPost.id, {
  //     postContent: `${post.postContent} ${reply.content}`,
  //     replyCount: post.replyCount + 1,
  //     officialReply,
  //     lastMod: reply.postTime,
  //   }),

  //   updateUserRating(reply.author, post.communityId)
  // );

  // if (peeranhaReply.isFirstReply || peeranhaReply.isQuickReply) {
  //   promises.push(updateUserRating(reply.author, post.communityId));
  // }
  // }

  // await replyRepository.create(reply);
  // await Promise.all(promises);

  // return reply;
}
