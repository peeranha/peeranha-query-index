import { PostEntity, PostTagEntity, ReplyEntity } from 'src/core/db/entities';
// import { CommentRepository } from 'src/core/db/repositories/CommentRepository';
// import { CommunityDocumentationRepository } from 'src/core/db/repositories/CommunityDocumentationRepository';
import { CommunityRepository } from 'src/core/db/repositories/CommunityRepository';
import { PostRepository } from 'src/core/db/repositories/PostRepository';
import { PostTagRepository } from 'src/core/db/repositories/PostTagRepository';
import { ReplyRepository } from 'src/core/db/repositories/ReplyRepository';
import { TagRepository } from 'src/core/db/repositories/TagRepository';
import { UserRepository } from 'src/core/db/repositories/UserRepository';
import {
  getSuiPostById,
  getSuiReply,
} from 'src/core/sui-blockchain/data-loader';
import { getSuiCommunity } from 'src/core/sui-index/community';
import { createSuiUser, updateSuiUserRating } from 'src/core/sui-index/user';

import { PostData } from '../blockchain/entities/post';

const postRepository = new PostRepository();
const replyRepository = new ReplyRepository();
// const commentRepository = new CommentRepository();
const communityRepository = new CommunityRepository();
const tagRepository = new TagRepository();
const userRepository = new UserRepository();
const postTagRepository = new PostTagRepository();
// const communityDocumentationRepository = new CommunityDocumentationRepository();

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

async function changedStatusOfficialReply(
  peeranhaPost: PostData,
  replyId: string,
  post: PostEntity
) {
  let { officialReply } = post;
  let previousOfficialReplyId = '0';
  if (
    peeranhaPost.officialReply === replyId &&
    post.officialReply !== replyId
  ) {
    previousOfficialReplyId = post.officialReply;
    officialReply = replyId;
  } else if (
    peeranhaPost.officialReply === '0' &&
    post.officialReply === replyId
  ) {
    officialReply = '0';
  }

  if (previousOfficialReplyId !== '0') {
    const previousOfficialReply = await replyRepository.get(
      `${post.id}-${previousOfficialReplyId}`
    );

    if (previousOfficialReply) {
      await replyRepository.update(previousOfficialReply.id, {
        isOfficialReply: false,
      });
    }
  }

  return officialReply;
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
  postId: string,
  replyId: number,
  timestamp: number
): Promise<ReplyEntity | undefined> {
  const peeranhaPost = await getSuiPostById(postId, 0);
  const peeranhaReply = await getSuiReply(postId, replyId, timestamp);
  // const messengerUserData = getItemProperty(ItemProperties.MessengerSender, Number(postId), replyId)

  if (!peeranhaReply) {
    return undefined;
  }

  const reply = new ReplyEntity({
    id: `${postId}-${replyId}`,
    postId,
    content: peeranhaReply.content,
    author: peeranhaReply.author.toLowerCase(),
    isDeleted: false,
    isFirstReply: peeranhaReply.isFirstReply,
    isQuickReply: peeranhaReply.isQuickReply,
    postTime: peeranhaReply.postTime,
    parentReplyId: peeranhaReply.parentReplyId,
    rating: 0,
    isBestReply: false,
    commentCount: 0,
    isOfficialReply: false,
    ipfsHash: peeranhaReply.ipfsDoc[0],
    ipfsHash2: peeranhaReply.ipfsDoc[1],
  });

  // if (messengerUserData) {
  //   reply.handle = messengerUserData.slice(0, messengerUserData.length - 1);
  //   reply.messengerType = Number(
  //     messengerUserData[messengerUserData.length - 1]
  //   );
  // }

  let user = await userRepository.get(reply.author);
  if (!user) {
    user = await createSuiUser(reply.author, timestamp);
  }

  const promises: Promise<any>[] = [];

  promises.push(
    userRepository.update(reply.author, {
      replyCount: user!.replyCount + 1,
    })
  );

  const post = await postRepository.get(postId);
  if (post) {
    const community = await getSuiCommunity(post.communityId);
    promises.push(
      communityRepository.update(post.communityId, {
        replyCount: community.replyCount + 1,
      })
    );

    const officialReply = await changedStatusOfficialReply(
      peeranhaPost,
      String(replyId),
      post
    );
    reply.isOfficialReply = String(replyId) === officialReply;

    promises.push(
      postRepository.update(postId, {
        postContent: `${post.postContent} ${reply.content}`,
        replyCount: post.replyCount + 1,
        officialReply,
        lastMod: reply.postTime,
      }),

      updateSuiUserRating(reply.author, post.communityId)
    );

    if (peeranhaReply.isFirstReply || peeranhaReply.isQuickReply) {
      promises.push(updateSuiUserRating(reply.author, post.communityId));
    }
  }

  await replyRepository.create(reply);
  await Promise.all(promises);

  return reply;
}
