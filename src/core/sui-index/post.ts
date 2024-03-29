/* eslint-disable no-await-in-loop */
import {
  CommentEntity,
  CommentTranslationEntity,
  PostEntity,
  PostTagEntity,
  PostTranslationEntity,
  PostVoteHistoryEntity,
  ReplyEntity,
  ReplyTranslationEntity,
  ReplyVoteHistoryEntity,
} from 'src/core/db/entities';
import { CommentRepository } from 'src/core/db/repositories/CommentRepository';
import { CommentTranslationRepository } from 'src/core/db/repositories/CommentTranslationRepository';
import { CommunityDocumentationRepository } from 'src/core/db/repositories/CommunityDocumentationRepository';
import { CommunityRepository } from 'src/core/db/repositories/CommunityRepository';
import { PostRepository } from 'src/core/db/repositories/PostRepository';
import { PostTagRepository } from 'src/core/db/repositories/PostTagRepository';
import { PostTranslationRepository } from 'src/core/db/repositories/PostTranslationRepository';
import { PostVoteHistoryRepository } from 'src/core/db/repositories/PostVoteHistoryRepository';
import { ReplyRepository } from 'src/core/db/repositories/ReplyRepository';
import { ReplyTranslationRepository } from 'src/core/db/repositories/ReplyTranslationRepository';
import { ReplyVoteHistoryRepository } from 'src/core/db/repositories/ReplyVoteHistoryRepository';
import { TagRepository } from 'src/core/db/repositories/TagRepository';
import { UserRepository } from 'src/core/db/repositories/UserRepository';
import { setCommunityDocumentation } from 'src/core/index/post';
import {
  getSuiPostById,
  getSuiReply,
  getSuiComment,
  getSuiCommunityById,
} from 'src/core/sui-blockchain/data-loader';
import {
  getSuiCommunity,
  getTagTranslations,
} from 'src/core/sui-index/community';
import {
  createSuiUser,
  updateSuiPostUsersRatings,
  updateSuiUserRating,
} from 'src/core/sui-index/user';
import { translateForumItem } from 'src/core/translations';
import { Network } from 'src/models/event-models';

import { VoteDirection } from '../sui-blockchain/utils';

const postRepository = new PostRepository();
const replyRepository = new ReplyRepository();
const commentRepository = new CommentRepository();
const communityRepository = new CommunityRepository();
const tagRepository = new TagRepository();
const userRepository = new UserRepository();
const postTagRepository = new PostTagRepository();
const postTranslationRepository = new PostTranslationRepository();
const replyTranslationRepository = new ReplyTranslationRepository();
const commentTranslationRepository = new CommentTranslationRepository();
const communityDocumentationRepository = new CommunityDocumentationRepository();
const postVoteHistoryRepository = new PostVoteHistoryRepository();
const replyVoteHistoryRepository = new ReplyVoteHistoryRepository();

// TODO: fix translation author & ipfsHash
async function updatePostTranslations(post: PostEntity) {
  const translations = await translateForumItem(
    post.communityId,
    post.language,
    post.content,
    post.title
  );

  const oldTranslations = await postTranslationRepository.getListOfProperties(
    'id',
    'postId',
    post.id
  );

  const deletionPromises: Promise<any>[] = [];
  oldTranslations.forEach((translation) =>
    postTranslationRepository.delete(translation.id)
  );
  await Promise.all(deletionPromises);

  const postTranslations: PostTranslationEntity[] = [];
  Object.keys(translations).forEach((language) => {
    const translationData = translations[language]!;

    const postTranslation = new PostTranslationEntity({
      id: `${post.id}-${language}`,
      postId: post.id,
      author: post.author,
      title: translationData.title!,
      content: translationData.content,
      ipfsHash: '0x',
      language: Number(language),
    });

    postTranslations.push(postTranslation);
  });

  if (postTranslations.length !== 0) {
    await postTranslationRepository.create(postTranslations);
  }
}

async function updateReplyTranslations(
  communityId: string,
  reply: ReplyEntity
) {
  const translations = await translateForumItem(
    communityId,
    reply.language,
    reply.content
  );

  const oldTranslations = await replyTranslationRepository.getListOfProperties(
    'id',
    'replyId',
    reply.id
  );

  const deletionPromises: Promise<any>[] = [];
  oldTranslations.forEach((translation) =>
    replyTranslationRepository.delete(translation.id)
  );
  await Promise.all(deletionPromises);

  const replyTranslations: ReplyTranslationEntity[] = [];
  Object.keys(translations).forEach((language) => {
    const translationData = translations[language]!;

    const replyTranslation = new ReplyTranslationEntity({
      id: `${reply.id}-${language}`,
      replyId: reply.id,
      author: reply.author,
      content: translationData.content,
      ipfsHash: '0x',
      language: Number(language),
    });

    replyTranslations.push(replyTranslation);
  });

  if (replyTranslations.length !== 0) {
    await replyTranslationRepository.create(replyTranslations);
  }
}

async function updateCommentTranslations(
  communityId: string,
  comment: CommentEntity
) {
  const translations = await translateForumItem(
    communityId,
    comment.language,
    comment.content
  );

  const oldTranslations =
    await commentTranslationRepository.getListOfProperties(
      'id',
      'commentId',
      comment.id
    );

  const deletionPromises: Promise<any>[] = [];
  oldTranslations.forEach((translation) =>
    commentTranslationRepository.delete(translation.id)
  );
  await Promise.all(deletionPromises);

  const commentTranslations: CommentTranslationEntity[] = [];
  Object.keys(translations).forEach((language) => {
    const translationData = translations[language]!;

    const commentTranslation = new CommentTranslationEntity({
      id: `${comment.id}-${language}`,
      commentId: comment.id,
      author: comment.author,
      content: translationData.content,
      ipfsHash: '0x',
      language: Number(language),
    });

    commentTranslations.push(commentTranslation);
  });

  if (commentTranslations.length !== 0) {
    await commentTranslationRepository.create(commentTranslations);
  }
}

export async function updateTranslations(eventModel: any) {
  const { postId, replyId, commentId } = eventModel;
  const post = await postRepository.get(postId);
  if (!post) {
    return;
  }

  if (commentId && commentId !== 0) {
    const comment = await commentRepository.get(
      `${postId}-${replyId}-${commentId}`
    );
    if (!comment) {
      return;
    }
    await updateCommentTranslations(post.communityId, comment);
  } else if (replyId && replyId !== 0) {
    const reply = await replyRepository.get(`${postId}-${replyId}`);
    if (!reply) {
      return;
    }
    await updateReplyTranslations(post.communityId, reply);
  } else {
    await updatePostTranslations(post);
  }
}

async function getTagNamesTranslations(postId: string) {
  let tagNames = '';

  const tags = await postTagRepository.getListOfProperties(
    'tagId',
    'postId',
    postId
  );
  tags.forEach(async (tag) => {
    const tagEntity = await tagRepository.get(tag.tagId);
    tagNames += tagEntity ? tagEntity.name : '';

    const translations = await getTagTranslations(tag.tagId);
    tagNames += translations.join(' ');
  });

  return tagNames;
}

async function updateTagsPostCount(newTags: string[], oldTags: string[]) {
  const promises: Promise<any>[] = [];

  newTags.forEach(async (newTag) => {
    const tag = await tagRepository.get(newTag);
    if (tag) {
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
}

async function changeStatusOfficialReply(
  postId: string,
  oldOfficialReply: string,
  newOfficialReply: string
) {
  if (oldOfficialReply !== newOfficialReply && oldOfficialReply !== '0') {
    const previousOfficialReply = await replyRepository.get(
      `${postId}-${oldOfficialReply}`
    );

    if (previousOfficialReply) {
      await replyRepository.update(previousOfficialReply.id, {
        isOfficialReply: false,
      });
    }
  }
}

export async function updateSuiPostContent(eventModel: any) {
  const { postId } = eventModel;
  const post = await postRepository.get(postId);
  if (!post) {
    return;
  }

  const promises: Promise<any>[] = [];

  const postForSave = {
    ...post,
    postContent: `${post.title} ${post.content}`,
  };

  postForSave.postContent += await getTagNamesTranslations(postId);

  const postTranslations = await postTranslationRepository.getListOfProperties(
    ['title', 'content'],
    'postId',
    post.id
  );
  const postTranslationsText = postTranslations
    .map((translation) => `${translation.title} ${translation.content}`)
    .join(' ');
  postForSave.postContent += ` ${postTranslationsText}`;

  for (let replyId = 1; replyId <= postForSave.replyCount; replyId++) {
    const reply = await replyRepository.get(`${postId}-${replyId}`);
    if (reply && !reply.isDeleted) {
      postForSave.postContent += ` ${reply.content}`;

      const replyTranslations =
        await replyTranslationRepository.getListOfProperties(
          'content',
          'replyId',
          reply.id
        );
      const replyTranslationsText = replyTranslations
        .map((translation) => translation.content)
        .join(' ');
      postForSave.postContent += ` ${replyTranslationsText}`;

      for (let commentId = 1; commentId <= reply.commentCount; commentId++) {
        const comment = await commentRepository.get(
          `${postId}-${replyId}-${commentId}`
        );

        if (comment && !comment.isDeleted) {
          const commentTranslations =
            await commentTranslationRepository.getListOfProperties(
              'content',
              'commentId',
              comment.id
            );
          const commentTranslationsText = commentTranslations
            .map((translation) => translation.content)
            .join(' ');

          postForSave.postContent += ` ${comment.content} ${commentTranslationsText}`;
        }
      }
    }
  }

  for (let commentId = 1; commentId <= postForSave.commentCount; commentId++) {
    const comment = await commentRepository.get(`${postId}-0-${commentId}`);
    if (comment && !comment.isDeleted) {
      const commentTranslations =
        await commentTranslationRepository.getListOfProperties(
          'content',
          'commentId',
          comment.id
        );
      const commentTranslationsText = commentTranslations
        .map((translation) => translation.content)
        .join(' ');
      postForSave.postContent += ` ${commentTranslationsText}`;

      postForSave.postContent += ` ${comment.content} ${commentTranslations}`;
    }
  }

  await Promise.all(promises);
  await postRepository.update(postId, postForSave);
}

export async function createSuiPost(
  postId: string,
  timestamp: number,
  network: Network
) {
  const peeranhaPost = await getSuiPostById(postId, timestamp);

  const post = new PostEntity({
    id: `${network}-${peeranhaPost.id}`,
    id2: peeranhaPost.id2,
    postType: peeranhaPost.postType,
    communityId: `${network}-${peeranhaPost.communityId}`,
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
    officialReply: '',
    bestReply: `${network}-${peeranhaPost.bestReply}`,
    ipfsHash: peeranhaPost.ipfsDoc[0],
    ipfsHash2: peeranhaPost.ipfsDoc[1],
    language: peeranhaPost.language,
  });

  const tagIds = peeranhaPost.tags.map(
    (tag) => `${post.communityId}-${network}-${tag}`
  );

  const community = await getSuiCommunity(post.communityId, network);

  let user = await userRepository.get(post.author);
  if (!user) {
    user = await createSuiUser(post.author, timestamp, network);
  }

  await Promise.all([
    postRepository.create(post),

    updateTagsPostCount(tagIds, []),

    communityRepository.update(community.id, {
      postCount: community.postCount + 1,
    }),

    userRepository.update(post.author, {
      postCount: user!.postCount + 1,
    }),

    updateSuiUserRating(post.author, post.communityId),
  ]);

  const postTags: PostTagEntity[] = [];
  tagIds.forEach((tag) => {
    const postTag = new PostTagEntity({
      id: `${post.id}-${tag}`,
      postId: post.id,
      tagId: tag,
    });
    postTags.push(postTag);
  });

  if (postTags.length !== 0) {
    await postTagRepository.create(postTags);
  }

  return post;
}

export async function editSuiPost(
  postId: string,
  timestamp: number,
  network: Network
) {
  const post = await postRepository.get(postId);
  if (!post) {
    await createSuiPost(postId, timestamp, network);
  } else {
    const peeranhaPost = await getSuiPostById(postId, timestamp);

    const postForSave = {
      ...post,
      lastMod: timestamp,
      title: peeranhaPost.title,
      content: peeranhaPost.content,
      language: peeranhaPost.language,
      ipfsHash: peeranhaPost.ipfsDoc[0],
      ipfsHash2: peeranhaPost.ipfsDoc[1],
    };

    const promises: Promise<any>[] = [];

    const newTags = peeranhaPost.tags.map(
      (tag) => `${network}-${peeranhaPost.communityId}-${network}-${tag}`
    );
    const oldTags = (
      await postTagRepository.getListOfProperties('tagId', 'postId', post.id)
    ).map((tag) => tag.tagId);

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
      promises.push(postTagRepository.delete(`${network}-${post.id}-${tag}`))
    );

    if (post.postType !== peeranhaPost.postType) {
      promises.push(updateSuiPostUsersRatings(post));
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
        promises.push(updateSuiPostUsersRatings(post)); // for old community
      }

      postForSave.communityId = peeranhaPost.communityId;
      promises.push(updateSuiPostUsersRatings(postForSave));
    }

    await Promise.all(promises);
    await postRepository.update(postId, postForSave);
  }
}

export async function deleteSuiPost(postId: string, network: Network) {
  const post = await postRepository.get(postId);
  if (!post) return;

  const promises: Promise<any>[] = [];
  const { author, communityId, replyCount } = post;

  await postRepository.update(postId, { isDeleted: true });

  const postAuthor = await userRepository.get(author);
  if (postAuthor) {
    promises.push(
      userRepository.update(author, {
        postCount: postAuthor.postCount - 1,
      })
    );
  }

  promises.push(updateSuiUserRating(author, communityId));

  const community = await getSuiCommunity(communityId, network);
  let communityReplyCount = community.replyCount;

  for (let i = 1; i <= replyCount; i++) {
    const reply = await replyRepository.get(`${postId}-${i}`);
    if (reply && !reply.isDeleted) {
      promises.push(updateSuiUserRating(reply.author, communityId));

      const replyAuthor = await userRepository.get(reply.author);
      if (replyAuthor) {
        promises.push(
          userRepository.update(reply.author, {
            replyCount: replyAuthor.replyCount - 1,
          })
        );
      }

      communityReplyCount -= 1;
    }
  }

  const tagsResponse = await postTagRepository.getListOfProperties(
    'tagId',
    'postId',
    post.id
  );
  const postTags = tagsResponse.map((tag) => tag.tagId);

  postTags.forEach(async (tag) => {
    const tagEntity = await tagRepository.get(tag);
    if (tagEntity) {
      promises.push(
        tagRepository.update(tag, {
          postCount: tagEntity.postCount - 1,
          deletedPostCount: tagEntity.deletedPostCount + 1,
        })
      );
    }

    promises.push(postTagRepository.delete(`${post.id}-${tag}`));
  });

  const translationIds = await postTranslationRepository.getListOfProperties(
    'id',
    'postId',
    post.id
  );
  translationIds.forEach((translation) =>
    promises.push(postTranslationRepository.delete(translation.id))
  );

  const voteHistoryIds = await postVoteHistoryRepository.getListOfProperties(
    'id',
    'postId',
    postId
  );
  voteHistoryIds.forEach((voteHistory) => {
    promises.push(postVoteHistoryRepository.delete(voteHistory.id));
  });

  await Promise.all(promises);

  await communityRepository.update(communityId, {
    deletedPostCount: community.deletedPostCount + 1,
    postCount: community.postCount - 1,
    replyCount: communityReplyCount,
  });
}

export async function createSuiReply(
  postId: string,
  replyId: string,
  timestamp: number,
  network: Network
): Promise<ReplyEntity> {
  const peeranhaPost = await getSuiPostById(postId, 0);
  const peeranhaReply = await getSuiReply(postId, replyId, timestamp);
  // const messengerUserData = getItemProperty(ItemProperties.MessengerSender, Number(postId), replyId)

  const { officialReply } = peeranhaPost;

  const reply = new ReplyEntity({
    id: `${postId}-${replyId}`,
    id2: peeranhaReply.id2,
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
    isOfficialReply: String(replyId) === officialReply,
    ipfsHash: peeranhaReply.ipfsDoc[0],
    ipfsHash2: peeranhaReply.ipfsDoc[1],
    language: peeranhaReply.language,
  });

  // if (messengerUserData) {
  //   reply.handle = messengerUserData.slice(0, messengerUserData.length - 1);
  //   reply.messengerType = Number(
  //     messengerUserData[messengerUserData.length - 1]
  //   );
  // }

  let user = await userRepository.get(reply.author);
  if (!user) {
    user = await createSuiUser(reply.author, timestamp, network);
  }

  const promises: Promise<any>[] = [];

  promises.push(
    userRepository.update(reply.author, {
      replyCount: user!.replyCount + 1,
    })
  );

  const post = await postRepository.get(postId);
  if (post) {
    const community = await getSuiCommunity(post.communityId, network);
    promises.push(
      communityRepository.update(post.communityId, {
        replyCount: community.replyCount + 1,
      })
    );

    promises.push(
      changeStatusOfficialReply(postId, post.officialReply, officialReply)
    );

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

export async function editSuiReply(
  postId: string,
  replyId: string,
  timestamp: number,
  network: Network
) {
  const reply = await replyRepository.get(`${postId}-${replyId}`);
  if (!reply) {
    await createSuiReply(postId, replyId, timestamp, network);
  }

  const [peeranhaPost, peeranhaReply, post] = await Promise.all([
    getSuiPostById(postId, 0),
    getSuiReply(postId, replyId, timestamp),
    postRepository.get(postId),
  ]);

  if (!(peeranhaReply && peeranhaPost && post)) {
    return;
  }

  const { officialReply } = peeranhaPost;

  const promises: Promise<any>[] = [];

  promises.push(
    replyRepository.update(`${postId}-${replyId}`, {
      content: peeranhaReply.content,
      language: peeranhaReply.language,
      ipfsHash: peeranhaReply.ipfsDoc[0],
      ipfsHash2: peeranhaReply.ipfsDoc[1],
      isOfficialReply: String(replyId) === officialReply,
    }),

    changeStatusOfficialReply(postId, post.officialReply, officialReply)
  );

  if (post.officialReply !== officialReply) {
    promises.push(
      postRepository.update(postId, {
        officialReply,
      })
    );
  }

  await Promise.all(promises);
}

export async function deleteSuiReply(
  postId: string,
  replyId: string,
  network: Network
) {
  const reply = await replyRepository.get(`${postId}-${replyId}`);
  if (!reply) return;

  await replyRepository.update(reply.id, { isDeleted: true });

  const promises: Promise<any>[] = [];

  const post = await postRepository.get(postId);
  if (post) {
    const community = await getSuiCommunity(post.communityId, network);
    promises.push(
      updateSuiUserRating(reply.author, post.communityId),

      communityRepository.update(post.communityId, {
        replyCount: community.replyCount - 1,
      }),

      postRepository.update(postId, {
        bestReply: reply.isBestReply ? 0 : post.bestReply,
        officialReply: reply.isOfficialReply ? 0 : post.officialReply,
      })
    );
  }

  const user = await userRepository.get(reply.author);
  if (user) {
    promises.push(
      userRepository.update(reply.author, {
        replyCount: user.replyCount - 1,
      })
    );
  }

  const response = await replyTranslationRepository.getListOfProperties(
    'id',
    'replyId',
    reply.id
  );
  const translationIds = response.map((translation) => translation.id);
  translationIds.forEach((id) =>
    promises.push(replyTranslationRepository.delete(id))
  );

  const voteHistoryIds = await replyVoteHistoryRepository.getListOfProperties(
    'id',
    'replyId',
    reply.id
  );
  voteHistoryIds.forEach((voteHistory) => {
    promises.push(replyVoteHistoryRepository.delete(voteHistory.id));
  });

  await Promise.all(promises);
}

export async function changeStatusBestSuiReply(
  postId: string,
  replyId: string,
  timestamp: number,
  network: Network
) {
  let post = await postRepository.get(postId);
  let previousBestReply = `${network}-0`;
  if (!post) {
    post = await createSuiPost(postId, timestamp, network);
  } else {
    previousBestReply = post.bestReply;
    if (replyId !== previousBestReply) {
      await postRepository.update(postId, {
        bestReply: replyId,
      });
    } else {
      await postRepository.update(postId, {
        bestReply: `${network}-0`,
      });
    }
  }

  if (previousBestReply) {
    let previousReply = await replyRepository.get(
      `${postId}-${previousBestReply}`
    );

    if (!previousReply)
      previousReply = await createSuiReply(
        postId,
        previousBestReply,
        timestamp,
        network
      );

    if (previousReply) {
      await replyRepository.update(previousReply.id, {
        isBestReply: false,
      });

      await updateSuiUserRating(previousReply.author, post.communityId);
    }
  }

  let reply = await replyRepository.get(`${postId}-${replyId}`);
  if (!reply) {
    reply = await createSuiReply(postId, replyId, timestamp, network);
  }

  if (reply) {
    if (Number(replyId.split('-')[1]) !== 0 && replyId !== previousBestReply) {
      if (reply.author !== post.author) {
        await updateSuiUserRating(reply.author, post.communityId);
      }
      await replyRepository.update(reply.id, {
        isBestReply: true,
      });
    }
    if (reply.author !== post.author) {
      await updateSuiUserRating(post.author, post.communityId);
    }
  }
}

export async function createSuiComment(
  postId: string,
  parentReplyId: string,
  commentId: string,
  timestamp: number
): Promise<CommentEntity> {
  const peeranhaComment = await getSuiComment(
    postId,
    parentReplyId,
    commentId,
    timestamp
  );

  const comment = new CommentEntity({
    id: `${postId}-${parentReplyId}-${commentId}`,
    id2: peeranhaComment.id2,
    postId,
    parentReplyId: String(parentReplyId),
    content: peeranhaComment.content,
    author: peeranhaComment.author.toLowerCase(),
    isDeleted: false,
    postTime: peeranhaComment.postTime,
    rating: 0,
    ipfsHash: peeranhaComment.ipfsDoc[0],
    ipfsHash2: peeranhaComment.ipfsDoc[1],
    language: peeranhaComment.language,
  });

  await commentRepository.create(comment);

  const post = await postRepository.get(postId);
  if (post) {
    const postCommentCount =
      Number(parentReplyId.split('-')[1]) === 0
        ? post.commentCount + 1
        : post.commentCount;
    if (Number(parentReplyId.split('-')[1]) !== 0) {
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

      updateSuiUserRating(post.author, post.communityId),
    ]);
  }

  return comment;
}

export async function editSuiComment(
  postId: string,
  replyId: string,
  commentId: string,
  timestamp: number
) {
  let storedComment = await commentRepository.get(
    `${postId}-${replyId}-${commentId}`
  );

  if (!storedComment)
    storedComment = await createSuiComment(
      postId,
      replyId,
      commentId,
      timestamp
    );

  const comment = await getSuiComment(postId, replyId, commentId, 0);

  if (!comment) {
    return;
  }

  await commentRepository.update(storedComment.id, {
    content: comment.content,
    language: comment.language,
    ipfsHash: comment.ipfsDoc[0],
    ipfsHash2: comment.ipfsDoc[1],
  });
}

export async function deleteSuiComment(
  postId: string,
  replyId: string,
  commentId: string
) {
  const comment = await commentRepository.get(
    `${postId}-${replyId}-${commentId}`
  );
  if (!comment) {
    return;
  }

  await commentRepository.update(comment.id, {
    isDeleted: true,
  });

  const promises: Promise<any>[] = [];

  const post = await postRepository.get(postId);
  if (post && comment.author !== post.author) {
    promises.push(updateSuiUserRating(comment.author, post.communityId));
  }

  const response = await commentTranslationRepository.getListOfProperties(
    'id',
    'commentId',
    comment.id
  );
  const translationIds = response.map((translation) => translation.id);
  translationIds.forEach((id) =>
    promises.push(commentTranslationRepository.delete(id))
  );

  await Promise.all(promises);
}

export async function voteSuiItem(
  userId: string,
  postId: string,
  replyId: string,
  commentId: string,
  timestamp: number,
  voteDirection: number,
  network: Network
) {
  if (Number(commentId.split('-')[1]) !== 0) {
    let comment = await commentRepository.get(
      `${postId}-${replyId}-${commentId}`
    );

    if (!comment) {
      comment = await createSuiComment(postId, replyId, commentId, 0);
    }

    const peeranhaComment = await getSuiComment(postId, replyId, commentId, 0);
    if (peeranhaComment) {
      await commentRepository.update(comment.id, {
        rating: peeranhaComment.rating,
      });
    }
  } else if (Number(replyId.split('-')[1]) !== 0) {
    let post = await postRepository.get(postId);
    if (!post) {
      post = await createSuiPost(postId, timestamp, network);
    }

    let reply = await replyRepository.get(`${postId}-${replyId}`);
    if (!reply) {
      reply = await createSuiReply(postId, replyId, timestamp, network);
    }

    const promises: Promise<any>[] = [];

    const peeranhaReply = await getSuiReply(postId, replyId, timestamp);
    if (peeranhaReply) {
      promises.push(
        replyRepository.update(reply.id, {
          rating: peeranhaReply.rating,
        })
      );

      const replyVoteHistoryKey = `${postId}-${replyId}-${userId}`;
      if (
        [
          VoteDirection.DIRECTION_UPVOTE,
          VoteDirection.DIRECTION_DOWNVOTE,
        ].includes(voteDirection)
      ) {
        let historyVoteEntity = await replyVoteHistoryRepository.get(
          replyVoteHistoryKey
        );
        const userVote = peeranhaReply.historyVotes.find(
          (vote) => vote.userId === userId
        )!;

        if (!historyVoteEntity) {
          historyVoteEntity = new ReplyVoteHistoryEntity({
            id: replyVoteHistoryKey,
            userId,
            replyId: `${postId}-${replyId}`,
            direction: userVote.direction,
          });

          promises.push(replyVoteHistoryRepository.create(historyVoteEntity));
        } else if (historyVoteEntity.direction !== userVote.direction) {
          promises.push(
            replyVoteHistoryRepository.update(replyVoteHistoryKey, {
              direction: userVote.direction,
            })
          );
        }
      } else {
        promises.push(replyVoteHistoryRepository.delete(replyVoteHistoryKey));
      }

      promises.push(updateSuiUserRating(reply.author, post.communityId));
    }

    promises.push(updateSuiUserRating(userId, post.communityId));
    await Promise.all(promises);
  } else {
    let post = await postRepository.get(postId);
    if (!post) {
      post = await createSuiPost(postId, timestamp, network);
    }

    const promises: Promise<any>[] = [];

    const peeranhaPost = await getSuiPostById(postId, timestamp);
    if (peeranhaPost) {
      promises.push(
        postRepository.update(postId, {
          rating: peeranhaPost.rating,
        })
      );

      const postVoteHistoryKey = `${postId}-${userId}`;
      if (
        [
          VoteDirection.DIRECTION_UPVOTE,
          VoteDirection.DIRECTION_DOWNVOTE,
        ].includes(voteDirection)
      ) {
        let historyVoteEntity = await postVoteHistoryRepository.get(
          postVoteHistoryKey
        );
        const userVote = peeranhaPost.historyVotes.find(
          (vote) => vote.userId === userId
        )!;

        if (!historyVoteEntity) {
          historyVoteEntity = new PostVoteHistoryEntity({
            id: postVoteHistoryKey,
            userId,
            postId,
            direction: userVote.direction,
          });

          promises.push(postVoteHistoryRepository.create(historyVoteEntity));
        } else if (historyVoteEntity.direction !== userVote.direction) {
          promises.push(
            postVoteHistoryRepository.update(postVoteHistoryKey, {
              direction: userVote.direction,
            })
          );
        }
      } else {
        promises.push(postVoteHistoryRepository.delete(postVoteHistoryKey));
      }
    }

    promises.push(
      updateSuiUserRating(post.author, post.communityId),
      updateSuiUserRating(userId, post.communityId)
    );

    await Promise.all(promises);
  }
}

export async function setDocumentationTree(
  communityId: string,
  timestamp: number,
  userId: string,
  network: Network
) {
  const [oldDocumentation, community] = await Promise.all([
    communityDocumentationRepository.get(communityId),
    getSuiCommunityById(communityId),
  ]);

  const documentationHash = community.documentation![0];

  if (
    parseInt(documentationHash, 16) === 0 ||
    (oldDocumentation && oldDocumentation.ipfsHash === documentationHash)
  ) {
    return;
  }

  await setCommunityDocumentation(
    communityId,
    userId,
    documentationHash,
    timestamp,
    network,
    oldDocumentation?.ipfsHash
  );
}
