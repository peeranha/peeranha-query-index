/* eslint-disable no-await-in-loop */
import {
  getComment,
  getItemProperty,
  getPost,
  getReply,
} from 'src/core/blockchain/data-loader';
import { PostTypes } from 'src/core/blockchain/entities';
import { PostData } from 'src/core/blockchain/entities/post';
import {
  CommentEntity,
  CommunityDocumentationEntity,
  PostEntity,
  PostTagEntity,
  ReplyEntity,
} from 'src/core/db/entities';
import { CommentRepository } from 'src/core/db/repositories/CommentRepository';
import { CommunityDocumentationRepository } from 'src/core/db/repositories/CommunityDocumentationRepository';
import { CommunityRepository } from 'src/core/db/repositories/CommunityRepository';
import { PostRepository } from 'src/core/db/repositories/PostRepository';
import { PostTagRepository } from 'src/core/db/repositories/PostTagRepository';
import { ReplyRepository } from 'src/core/db/repositories/ReplyRepository';
import { TagRepository } from 'src/core/db/repositories/TagRepository';
import { UserRepository } from 'src/core/db/repositories/UserRepository';
import { getCommunityById } from 'src/core/index/community';
import {
  createUser,
  updatePostUsersRatings,
  updateUserRating,
} from 'src/core/index/user';
import { ItemProperties } from 'src/core/index/utils';
import { getDataFromIpfs, getIpfsHashFromBytes32 } from 'src/core/utils/ipfs';
import { log } from 'src/core/utils/logger';

const postRepository = new PostRepository();
const replyRepository = new ReplyRepository();
const commentRepository = new CommentRepository();
const communityRepository = new CommunityRepository();
const tagRepository = new TagRepository();
const userRepository = new UserRepository();
const postTagRepository = new PostTagRepository();
const communityDocumentationRepository = new CommunityDocumentationRepository();

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

export async function createPost(
  postId: string,
  timestamp: number
): Promise<PostEntity> {
  const [peeranhaPost, messengerUserData] = await Promise.all([
    getPost(Number(postId)),
    getItemProperty(ItemProperties.MessengerSender, Number(postId)),
  ]);

  const post = new PostEntity({
    id: postId,
    id2: '',
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

  if (messengerUserData) {
    post.handle = messengerUserData.slice(0, messengerUserData.length - 1);
    post.messengerType = Number(
      messengerUserData[messengerUserData.length - 1]
    );
  }

  const tagIds = peeranhaPost.tags.map((tag) => `${post.communityId}-${tag}`);
  post.postContent += await updateTagsPostCount(tagIds, []);

  const community = await getCommunityById(post.communityId);

  let user = await userRepository.get(post.author);
  if (!user) {
    user = await createUser(post.author, timestamp);
  }

  await Promise.all([
    communityRepository.update(community.id, {
      postCount: community.postCount + 1,
    }),

    userRepository.update(post.author, {
      postCount: user!.postCount + 1,
    }),

    postRepository.create(post),

    updateUserRating(post.author, post.communityId),
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

export async function createReply(
  postId: string,
  replyId: number,
  timestamp: number
): Promise<ReplyEntity | undefined> {
  const [peeranhaReply, peeranhaPost, messengerUserData] = await Promise.all([
    getReply(Number(postId), replyId),
    getPost(Number(postId)),
    getItemProperty(ItemProperties.MessengerSender, Number(postId), replyId),
  ]);

  if (!peeranhaReply) {
    return undefined;
  }

  const reply = new ReplyEntity({
    id: `${postId}-${replyId}`,
    id2: '',
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

  if (messengerUserData) {
    reply.handle = messengerUserData.slice(0, messengerUserData.length - 1);
    reply.messengerType = Number(
      messengerUserData[messengerUserData.length - 1]
    );
  }

  let user = await userRepository.get(reply.author);
  if (!user) {
    user = await createUser(reply.author, timestamp);
  }

  const promises: Promise<any>[] = [];

  promises.push(
    userRepository.update(reply.author, {
      replyCount: user!.replyCount + 1,
    })
  );

  const post = await postRepository.get(postId);
  if (post) {
    const community = await getCommunityById(post.communityId);
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

      updateUserRating(reply.author, post.communityId)
    );

    if (peeranhaReply.isFirstReply || peeranhaReply.isQuickReply) {
      promises.push(updateUserRating(reply.author, post.communityId));
    }
  }

  await replyRepository.create(reply);
  await Promise.all(promises);

  return reply;
}

export async function createComment(
  postId: string,
  parentReplyId: number,
  commentId: number
): Promise<CommentEntity | undefined> {
  const peeranhaComment = await getComment(
    Number(postId),
    parentReplyId,
    commentId
  );

  if (!peeranhaComment) {
    return undefined;
  }

  const comment = new CommentEntity({
    id: `${postId}-${parentReplyId}-${commentId}`,
    id2: '',
    postId,
    parentReplyId: String(parentReplyId),
    content: peeranhaComment.content,
    author: peeranhaComment.author.toLowerCase(),
    isDeleted: false,
    postTime: peeranhaComment.postTime,
    rating: 0,
    ipfsHash: peeranhaComment.ipfsDoc[0],
    ipfsHash2: peeranhaComment.ipfsDoc[1],
  });
  await commentRepository.create(comment);

  const post = await postRepository.get(postId);
  if (post) {
    const postCommentCount =
      parentReplyId === 0 ? post.commentCount + 1 : post.commentCount;
    if (parentReplyId !== 0) {
      const reply = await replyRepository.get(`${postId}-${parentReplyId}`);
      if (reply) {
        await replyRepository.update(reply.id, {
          commentCount: reply.commentCount + 1,
        });
      }
    }

    await Promise.all([
      postRepository.update(postId, {
        commentCount: postCommentCount,
        postContent: `${post.postContent} ${comment.content}`,
        lastMod: comment.postTime,
      }),

      updateUserRating(post.author, post.communityId),
    ]);
  }

  return comment;
}

export async function updatePostContent(
  postId: string,
  timestamp: number,
  editedReplyId?: number
) {
  const [post, peeranhaPost] = await Promise.all([
    postRepository.get(postId),
    getPost(Number(postId)),
  ]);
  if (!(post && peeranhaPost)) return;

  const promises: Promise<any>[] = [];

  const postForSave = {
    ...post,
    postContent: '',
    lastMod: timestamp,
    title: peeranhaPost.title,
    content: peeranhaPost.content,
    ipfsHash: peeranhaPost.ipfsDoc[0],
    ipfsHash2: peeranhaPost.ipfsDoc[1],
  };

  postForSave.postContent += ` ${postForSave.title}`;
  postForSave.postContent += ` ${postForSave.content}`;

  if (editedReplyId) {
    const officialReply = await changedStatusOfficialReply(
      peeranhaPost,
      String(editedReplyId),
      post
    );
    postForSave.officialReply = officialReply;
  }

  const newTags = peeranhaPost.tags.map(
    (tag) => `${peeranhaPost.communityId}-${tag}`
  );
  const oldTagsResponse = await postTagRepository.getListOfProperties(
    'tagId',
    'postId',
    post.id
  );
  const oldTags: string[] = oldTagsResponse.map(
    (tag: any) => `${post.communityId}-${tag.tagId}`
  );

  const uniqueNewTags = newTags.filter((newTag) => !oldTags.includes(newTag));
  const uniqueOldTags = oldTags.filter((oldTag) => !newTags.includes(oldTag));

  uniqueNewTags.forEach((tag) => {
    const postTag = new PostTagEntity({
      id: `${post.id}-${tag}`,
      postId: post.id,
      tagId: tag,
    });
    promises.push(postTagRepository.create(postTag));
  });
  uniqueOldTags.forEach((tag) =>
    promises.push(postTagRepository.delete(`${post.id}-${tag}`))
  );

  postForSave.postContent += await updateTagsPostCount(
    uniqueNewTags,
    uniqueOldTags
  );

  if (post.postType !== peeranhaPost.postType) {
    promises.push(updatePostUsersRatings(post));
    postForSave.postType = peeranhaPost.postType;
  }

  if (post.communityId !== peeranhaPost.communityId) {
    const [oldCommunity, newCommunity] = await Promise.all([
      communityRepository.get(post.communityId),
      communityRepository.get(peeranhaPost.communityId),
    ]);

    let postReplyCount = 0;

    for (let i = 1; i <= post.replyCount; i++) {
      const reply = await replyRepository.get(`${postId}-${i}`);
      if (reply && !reply.isDeleted) {
        postReplyCount += 1;
      }
    }

    if (oldCommunity) {
      promises.push(
        communityRepository.update(post.communityId, {
          postCount: oldCommunity.postCount - 1,
          replyCount: oldCommunity.replyCount - postReplyCount,
        })
      );
    }

    if (newCommunity) {
      promises.push(
        communityRepository.update(peeranhaPost.communityId, {
          postCount: newCommunity.postCount + 1,
          replyCount: newCommunity.replyCount + postReplyCount,
        })
      );
    }

    if (post.postType === peeranhaPost.postType) {
      promises.push(updatePostUsersRatings(post));
    }

    postForSave.communityId = peeranhaPost.communityId;
    promises.push(updatePostUsersRatings(postForSave));
  }

  for (let replyId = 1; replyId <= postForSave.replyCount; replyId++) {
    const reply = await replyRepository.get(`${postId}-${replyId}`);
    if (reply && !reply.isDeleted) {
      postForSave.postContent += ` ${reply.content}`;

      for (let commentId = 1; commentId <= reply.commentCount; commentId++) {
        const comment = await commentRepository.get(
          `${postId}-${replyId}-${commentId}`
        );

        if (comment && !comment.isDeleted) {
          postForSave.postContent += ` ${comment.content}`;
        }
      }
    }
  }

  for (let commentId = 1; commentId <= postForSave.commentCount; commentId++) {
    const comment = await commentRepository.get(`${postId}-0-${commentId}`);
    if (comment && !comment.isDeleted) {
      postForSave.postContent += ` ${comment.content}`;
    }
  }

  await Promise.all(promises);
  await postRepository.update(String(postId), postForSave);
}

function indexingJson(children: any[], posts: string[]) {
  children.forEach((child) => {
    const { id, title } = child;
    if (typeof id === 'string' && typeof title === 'string') {
      if (id !== '' && title !== '') {
        posts.push(id);
        if (typeof child === 'object') {
          if (child.children && Array.isArray(child.children)) {
            if (child.children.length > 0) {
              indexingJson(child.children, posts);
            }
          } else {
            log("field 'children' in children post is empty or not an array");
          }
        } else {
          log('children post is not an object');
        }
      } else {
        log('id or/and title of children post is empty');
      }
    } else {
      log('id or/and title of children post not found or not a string');
    }
  });
}

async function indexingDocumentation(ipfsHash: string) {
  const posts: string[] = [];
  const result = await getDataFromIpfs(getIpfsHashFromBytes32(ipfsHash));
  const documentationJSON = JSON.stringify(result);

  if (result) {
    const { pinnedPost, documentations } = result;

    if (pinnedPost && typeof pinnedPost === 'object') {
      const { id, title } = pinnedPost;
      if (typeof id === 'string' && typeof title === 'string') {
        if (id !== '' && title !== '') {
          posts.push(id);
        } else {
          log('id or/and title of pinned post is empty');
        }
      } else {
        log('id or/and title of pinned post not found or not a string');
      }
    }

    if (documentations && Array.isArray(documentations)) {
      for (let i = 0; i < documentations.length; i++) {
        const documentationObject = documentations[i];
        const { id, title } = documentationObject;
        if (typeof id === 'string' && typeof title === 'string') {
          if (id !== '' && title !== '') {
            const { children } = documentationObject;
            posts.push(id);
            if (children && Array.isArray(children) && children.length > 0) {
              indexingJson(children, posts);
            }
          } else {
            log('id or/and title of post is empty');
          }
        } else {
          log('id or/and title of post not found or not a string');
        }
      }
    } else {
      log('documentations not found or not an array');
    }
  }

  return { posts, documentationJSON };
}

export async function generateDocumentationPosts(
  communityId: string,
  userAddr: string,
  newDocumentationIpfsHash: string,
  timestamp: number,
  oldDocumentationIpfsHash?: string
) {
  const newPosts: string[] = [];
  const oldPosts: string[] = [];

  const documentationData = await indexingDocumentation(
    newDocumentationIpfsHash
  );
  newPosts.push(...documentationData.posts);

  if (oldDocumentationIpfsHash) {
    const oldDocumentationData = await indexingDocumentation(
      oldDocumentationIpfsHash
    );

    oldPosts.push(...oldDocumentationData.posts);
    await communityDocumentationRepository.update(communityId, {
      documentationJSON: documentationData.documentationJSON,
      ipfsHash: newDocumentationIpfsHash,
    });
  } else {
    const documentation = new CommunityDocumentationEntity({
      id: communityId,
      documentationJSON: documentationData.documentationJSON,
      ipfsHash: newDocumentationIpfsHash,
    });

    await communityDocumentationRepository.create(documentation);
  }

  const user = await userRepository.get(userAddr);
  if (!user) {
    await createUser(userAddr, timestamp);
  }

  const postsForCreating = newPosts.filter(
    (post, index) =>
      newPosts.indexOf(post) === index && oldPosts.indexOf(post) === -1
  );
  const postsForDeleting = oldPosts.filter(
    (post, index) =>
      oldPosts.indexOf(post) === index && newPosts.indexOf(post) === -1
  );
  const documentationCount =
    oldPosts.length - postsForDeleting.length + postsForCreating.length;

  const community = await getCommunityById(communityId);
  await communityRepository.update(community.id, {
    documentationCount,
  });

  const postPromises: Promise<void>[] = [];

  postsForCreating.forEach(async (post) => {
    const postData = await getDataFromIpfs(getIpfsHashFromBytes32(post));

    const postEntity = new PostEntity({
      id: post,
      id2: '',
      postType: PostTypes.Documentation,
      communityId,
      title: postData.title,
      content: postData.content,
      postContent: `${postData.title} ${postData.content}`,
      author: userAddr,
      isDeleted: false,
      rating: 0,
      postTime: timestamp,
      lastMod: timestamp,
      commentCount: 0,
      replyCount: 0,
      officialReply: '0',
      bestReply: '0',
      ipfsHash: post,
      ipfsHash2: '',
    });

    postPromises.push(postRepository.create(postEntity));
  });

  postsForDeleting.forEach((post) =>
    postPromises.push(postRepository.delete(post))
  );

  await Promise.all(postPromises);
}
