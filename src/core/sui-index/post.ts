/* eslint-disable no-await-in-loop */
import { PostData } from 'src/core/blockchain/entities/post';
import {
  CommentEntity,
  PostEntity,
  PostTagEntity,
  ReplyEntity,
} from 'src/core/db/entities';
import { CommentRepository } from 'src/core/db/repositories/CommentRepository';
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
  getSuiComment,
} from 'src/core/sui-blockchain/data-loader';
import { getSuiCommunity } from 'src/core/sui-index/community';
import {
  createSuiUser,
  updateSuiPostUsersRatings,
  updateSuiUserRating,
} from 'src/core/sui-index/user';

const postRepository = new PostRepository();
const replyRepository = new ReplyRepository();
const commentRepository = new CommentRepository();
const communityRepository = new CommunityRepository();
const tagRepository = new TagRepository();
const userRepository = new UserRepository();
const postTagRepository = new PostTagRepository();

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

async function changeStatusOfficialReply(
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

export async function updateSuiPostContent(
  postId: string,
  timestamp: number,
  editedReplyId?: number
) {
  const [post, peeranhaPost] = await Promise.all([
    postRepository.get(postId),
    getSuiPostById(postId, timestamp),
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
    const officialReply = await changeStatusOfficialReply(
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
  const oldTags: string[] = oldTagsResponse.map((tag: any) => tag.tagId);

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
      promises.push(updateSuiPostUsersRatings(post));
    }

    postForSave.communityId = peeranhaPost.communityId;
    promises.push(updateSuiPostUsersRatings(postForSave));
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

export async function createSuiPost(postId: string, timestamp: number) {
  const peeranhaPost = await getSuiPostById(postId, timestamp);

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

export async function deleteSuiPost(postId: string) {
  const post = await postRepository.get(postId);
  if (!post) return;

  const promises: Promise<any>[] = [];
  const { author, communityId, replyCount } = post;

  const postAuthor = await userRepository.get(author);
  if (postAuthor) {
    promises.push(
      userRepository.update(author, {
        postCount: postAuthor.postCount - 1,
      })
    );
  }

  promises.push(
    postRepository.update(postId, {
      isDeleted: true,
    }),

    updateSuiUserRating(author, communityId)
  );

  const community = await getSuiCommunity(communityId);
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
  const postTags: string[] = tagsResponse.map((tag: any) => tag.tagId);

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

  await Promise.all(promises);

  await communityRepository.update(communityId, {
    deletedPostCount: community.deletedPostCount + 1,
    postCount: community.postCount - 1,
    replyCount: communityReplyCount,
  });
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

    const officialReply = await changeStatusOfficialReply(
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

export async function editSuiReply(
  postId: string,
  replyId: number,
  timestamp: number
) {
  let storedReply = await replyRepository.get(`${postId}-${replyId}`);
  let createdReply;

  if (!storedReply) {
    createdReply = await createSuiReply(postId, replyId, timestamp);
  }
  if (!createdReply) return;

  if (!storedReply) {
    storedReply = createdReply;
  }

  const peeranhaReply = await getSuiReply(postId, replyId, timestamp);

  if (!peeranhaReply) {
    return;
  }

  await replyRepository.update(storedReply.id, {
    content: peeranhaReply.content,
    ipfsHash: peeranhaReply.ipfsDoc[0],
    ipfsHash2: peeranhaReply.ipfsDoc[1],
  });

  await updateSuiPostContent(postId, timestamp, replyId);
}

export async function deleteSuiReply(
  postId: string,
  replyId: number,
  timestamp: number
) {
  const reply = await replyRepository.get(`${postId}-${replyId}`);
  if (!reply) return;

  await replyRepository.update(reply.id, { isDeleted: true });

  const promises: Promise<any>[] = [];

  const post = await postRepository.get(postId);
  if (post) {
    const community = await getSuiCommunity(post.communityId);
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

  promises.push(updateSuiPostContent(postId, timestamp));
  await Promise.all(promises);
}

export async function changeStatusBestSuiReply(
  postId: string,
  replyId: number,
  timestamp: number
) {
  let post = await postRepository.get(postId);
  let previousBestReply = 0;
  if (!post) {
    post = await createSuiPost(postId, timestamp);
  } else {
    previousBestReply = Number(post.bestReply);

    await postRepository.update(postId, {
      bestReply: replyId,
    });
  }

  if (previousBestReply) {
    let previousReply = await replyRepository.get(
      `${postId}-${previousBestReply}`
    );

    if (!previousReply)
      previousReply = await createSuiReply(
        postId,
        previousBestReply,
        timestamp
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
    reply = await createSuiReply(postId, replyId, timestamp);
  }

  if (reply) {
    if (replyId !== 0) {
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
  parentReplyId: number,
  commentId: number,
  timestamp: number
): Promise<CommentEntity | undefined> {
  const peeranhaComment = await getSuiComment(
    postId,
    parentReplyId,
    commentId,
    timestamp
  );

  if (!peeranhaComment) {
    return undefined;
  }

  const comment = new CommentEntity({
    id: `${postId}-${parentReplyId}-${commentId}`,
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

      updateSuiUserRating(post.author, post.communityId),
    ]);
  }

  return comment;
}

export async function voteSuiItem(
  userId: string,
  postId: string,
  replyId: number,
  commentId: number,
  timestamp: number
) {
  if (commentId !== 0) {
    let comment = await commentRepository.get(
      `${postId}-${replyId}-${commentId}`
    );

    if (!comment) {
      comment = await createSuiComment(postId, replyId, commentId, 0);
    }

    if (comment) {
      const peeranhaComment = await getSuiComment(
        postId,
        replyId,
        commentId,
        0
      );
      if (peeranhaComment)
        await commentRepository.update(comment.id, {
          rating: peeranhaComment.rating,
        });
    }
  } else if (replyId !== 0) {
    let post = await postRepository.get(postId);
    if (!post) post = await createSuiPost(postId, timestamp);

    let reply = await replyRepository.get(`${postId}-${replyId}`);
    if (!reply) reply = await createSuiReply(postId, replyId, timestamp);

    const promises: Promise<any>[] = [];

    if (reply) {
      const peeranhaReply = await getSuiReply(postId, replyId, timestamp);
      if (peeranhaReply) {
        promises.push(
          replyRepository.update(reply.id, {
            rating: peeranhaReply.rating,
          })
        );
      }
      promises.push(updateSuiUserRating(reply.author, post.communityId));
    }

    promises.push(updateSuiUserRating(userId, post.communityId));
    await Promise.all(promises);
  } else {
    let post = await postRepository.get(postId);
    if (!post) post = await createSuiPost(postId, timestamp);

    const promises: Promise<any>[] = [];

    const peeranhaPost = await getSuiPostById(postId, timestamp);
    if (peeranhaPost) {
      promises.push(
        postRepository.update(postId, {
          rating: peeranhaPost.rating,
        })
      );
    }

    promises.push(
      updateSuiUserRating(post.author, post.communityId),
      updateSuiUserRating(userId, post.communityId)
    );

    await Promise.all(promises);
  }
}
