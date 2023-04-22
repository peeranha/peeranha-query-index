/* eslint-disable no-await-in-loop */
import {
  getAchievementsNFTConfig,
  getComment,
  getCommunity,
  getUserByAddress,
  getPost,
  getReply,
  getTag,
  getDocumentationTree,
} from 'src/core/blockchain/data-loader';
import {
  UserPermissionEntity,
  UserCommunityEntity,
  UserAchievementEntity,
  HistoryEntity,
} from 'src/core/db/entities';
import { AchievementRepository } from 'src/core/db/repositories/AchievementRepository';
import { CommentRepository } from 'src/core/db/repositories/CommentRepository';
import { CommunityDocumentationRepository } from 'src/core/db/repositories/CommunityDocumentationRepository';
import { CommunityRepository } from 'src/core/db/repositories/CommunityRepository';
import { HistoryRepository } from 'src/core/db/repositories/HistoryRepository';
import { PostRepository } from 'src/core/db/repositories/PostRepository';
import { PostTagRepository } from 'src/core/db/repositories/PostTagRepository';
import { ReplyRepository } from 'src/core/db/repositories/ReplyRepository';
import { TagRepository } from 'src/core/db/repositories/TagRepository';
import { UserAchievementRepository } from 'src/core/db/repositories/UserAchievementRepository';
import { UserCommunityRepository } from 'src/core/db/repositories/UserCommunityRepository';
import { UserPermissionRepository } from 'src/core/db/repositories/UserPermissionRepository';
import { UserRepository } from 'src/core/db/repositories/UserRepository';
import { UserRewardRepository } from 'src/core/db/repositories/UserRewardRepository';
import { createAchievement } from 'src/core/index/achievement';
import {
  getCommunityById,
  createCommunity,
  createTag,
} from 'src/core/index/community';
import {
  createComment,
  createPost,
  updatePostContent,
  createReply,
  generateDocumentationPosts,
} from 'src/core/index/post';
import {
  createUser,
  updatePostUsersRatings,
  updateUserRating,
} from 'src/core/index/user';
import { EntityType, OperationType } from 'src/core/index/utils';
import {
  UserCreatedEventModel,
  FollowedCommunityEventModel,
  RoleGrantedEventModel,
  RoleRevokedEventModel,
  UnfollowedCommunityEventModel,
  UserUpdatedEventModel,
  CommunityCreatedEventModel,
  CommunityUpdatedEventModel,
  CommunityFrozenEventModel,
  TagCreatedEventModel,
  TagUpdatedEventModel,
  ConfigureNewAchievementNFTEventModel,
  TransferEventModel,
  CommunityUnfrozenEventModel,
  PostCreatedEventModel,
  PostEditedEventModel,
  ChangePostTypeEventModel,
  PostDeletedEventModel,
  ReplyDeletedEventModel,
  ReplyEditedEventModel,
  CommentEditedEventModel,
  CommentDeletedEventModel,
  GetRewardEventModel,
  SetDocumentationTreeEventModel,
  CommentCreatedEventModel,
  ItemVotedEventModel,
  ReplyCreatedEventModel,
  ReplyMarkedTheBestEventModel,
} from 'src/models/event-models';

const userAchievementRepository = new UserAchievementRepository();
const achievementRepository = new AchievementRepository();
const postRepository = new PostRepository();
const replyRepository = new ReplyRepository();
const historyRepository = new HistoryRepository();
const commentRepository = new CommentRepository();
const communityRepository = new CommunityRepository();
const userRepository = new UserRepository();
const tagRepository = new TagRepository();
const userPermissionRepository = new UserPermissionRepository();
const userRewardRepository = new UserRewardRepository();
const userCommunityRepository = new UserCommunityRepository();
const postTagRepository = new PostTagRepository();
const communityDocumentationRepository = new CommunityDocumentationRepository();

const POOL_NFT = 1_000_000;

export async function createHistory(
  event: any,
  entityType: EntityType,
  operationType: OperationType
) {
  const history = new HistoryEntity({
    id: event.transaction,
    transactionHash: event.transaction,
    postId: String(event.postId),
    replyId: event.replyId ? `${event.postId}-${event.replyId}` : undefined,
    commentId: event.commentId
      ? `${event.postId}-${event.replyId}-${event.commentId}`
      : undefined,
    eventEntity: entityType,
    eventName: operationType,
    actionUser: event.user ?? event.userId,
    timestamp: event.timestamp,
  });

  await historyRepository.create(history);
}

export async function handleConfigureNewAchievement(
  eventModel: ConfigureNewAchievementNFTEventModel
) {
  const { achievementId } = eventModel;
  await createAchievement(achievementRepository, achievementId);
}

export async function handleTransfer(eventModel: TransferEventModel) {
  const { timestamp, to: user } = eventModel;
  const achievementId = Math.floor(eventModel.tokenId / POOL_NFT + 1);
  const achievement = await achievementRepository.get(achievementId);

  if (achievement) {
    const peeranhaAchievement = await getAchievementsNFTConfig(achievementId);
    await achievementRepository.update(achievementId, {
      factCount: peeranhaAchievement.factCount,
    });
  } else {
    await createAchievement(achievementRepository, achievementId);
  }

  let userEntity = await userRepository.get(user);
  if (!userEntity) {
    userEntity = await createUser(user, timestamp);
  }
  if (!userEntity) {
    return;
  }
  const userAchievement = new UserAchievementEntity({
    id: `${user}-${achievementId}`,
    userId: user,
    achievementId,
  });

  await userAchievementRepository.create(userAchievement);
}

export async function handleNewUser(eventModel: UserCreatedEventModel) {
  await createUser(eventModel.userAddress, eventModel.timestamp);
}

export async function handleUpdatedUser(eventModel: UserUpdatedEventModel) {
  const { timestamp, userAddress } = eventModel;
  if (!(await userRepository.get(userAddress))) {
    await createUser(userAddress, timestamp);
  } else {
    const user = await getUserByAddress(userAddress);
    if (!user) {
      return;
    }
    const userForSave = {
      displayName:
        user.displayName ||
        `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`,
      company: user.company,
      position: user.position,
      location: user.location,
      about: user.about,
      avatar: user.avatar,
      ipfsHash: user.ipfsDoc[0],
      ipfsHash2: user.ipfsDoc[1],
    };
    await userRepository.update(userAddress, userForSave);
  }
}

export async function handlerGrantedRole(eventModel: RoleGrantedEventModel) {
  const { role, timestamp, account } = eventModel;
  if (!(await userRepository.get(account))) {
    await createUser(account, timestamp);
  }
  const userPermission = new UserPermissionEntity({
    id: `${account}-${role}`,
    userId: account,
    permission: role,
  });
  await userPermissionRepository.create(userPermission);
}

export async function handlerRevokedRole(eventModel: RoleRevokedEventModel) {
  const { role, account } = eventModel;
  await userPermissionRepository.delete(`${account}-${role}`);
}

export async function handlerFollowCommunity(
  eventModel: FollowedCommunityEventModel
) {
  const { communityId, timestamp, userAddress } = eventModel;

  let user = await userRepository.get(userAddress);
  if (!user) user = await createUser(userAddress, timestamp);

  const userCommunity = new UserCommunityEntity({
    id: `${userAddress}-${communityId}`,
    userId: userAddress,
    communityId,
  });
  await userCommunityRepository.create(userCommunity);

  const community = await getCommunityById(communityId);
  await communityRepository.update(communityId, {
    followingUsers: community.followingUsers + 1,
  });
}

export async function handlerUnfollowCommunity(
  eventModel: UnfollowedCommunityEventModel
) {
  const { communityId, timestamp, userAddress } = eventModel;

  let user = await userRepository.get(userAddress);
  if (!user) user = await createUser(userAddress, timestamp);

  await userCommunityRepository.delete(`${userAddress}-${communityId}`);

  const community = await getCommunityById(communityId);
  await communityRepository.update(communityId, {
    followingUsers: community.followingUsers - 1,
  });
}

export async function handleNewCommunity(
  eventModel: CommunityCreatedEventModel
) {
  await createCommunity(eventModel.id);
}

export async function handleUpdatedCommunity(
  eventModel: CommunityUpdatedEventModel
) {
  const { id } = eventModel;
  const community = await communityRepository.get(id);
  if (!community) {
    await createCommunity(id);
  } else {
    const peeranhaCommunity = await getCommunity(id);
    await communityRepository.update(id, {
      ipfsHash: peeranhaCommunity.ipfsDoc[0],
      ipfshash2: peeranhaCommunity.ipfsDoc[1],
      name: peeranhaCommunity.name,
      description: peeranhaCommunity.description,
      website: peeranhaCommunity.website,
      communitySite: peeranhaCommunity.communitySite,
      language: peeranhaCommunity.language,
      avatar: peeranhaCommunity.avatar,
    });
  }
}

export async function handleFrozenCommunity(
  eventModel: CommunityFrozenEventModel
) {
  const community = await communityRepository.get(eventModel.communityId);
  if (community)
    await communityRepository.update(community.id, {
      isFrozen: true,
    });
}

export async function handleUnfrozenCommunity(
  eventModel: CommunityUnfrozenEventModel
) {
  const community = await getCommunityById(eventModel.communityId);
  await communityRepository.update(community.id, {
    isFrozen: false,
  });
}

export async function handleNewTag(eventModel: TagCreatedEventModel) {
  const { communityId, tagId } = eventModel;
  if (await tagRepository.get(`${communityId}-${tagId}`)) return;
  const community = await getCommunityById(communityId);

  const tag = await getTag(communityId, tagId);
  await Promise.all([
    communityRepository.update(communityId, {
      tagsCount: community.tagsCount + 1,
    }),

    createTag(tag),
  ]);
}

export async function handleEditedTag(eventModel: TagUpdatedEventModel) {
  const { communityId, tagId } = eventModel;
  const [tag, tagEntity] = await Promise.all([
    getTag(communityId, tagId),
    tagRepository.get(`${communityId}-${tagId}`),
  ]);
  if (!tagEntity) {
    await createTag(tag);
  } else {
    await tagRepository.update(tag.tagId, {
      ipfsHash: tag.ipfsDoc[0],
      ipfsHash2: tag.ipfsDoc[1],
      name: tag.name,
      description: tag.description,
    });
  }
}

export async function handleNewPost(eventModel: PostCreatedEventModel) {
  const postId = String(eventModel.postId);
  await createPost(postId, eventModel.timestamp);

  await createHistory(eventModel, EntityType.Post, OperationType.Create);
}

export async function handleEditedPost(eventModel: PostEditedEventModel) {
  const postId = String(eventModel.postId);

  if (!(await postRepository.get(postId)))
    await createPost(postId, eventModel.timestamp);

  await Promise.all([
    updatePostContent(postId, eventModel.timestamp),
    createHistory(eventModel, EntityType.Post, OperationType.Edit),
  ]);
}

export async function handleChangedTypePost(
  eventModel: ChangePostTypeEventModel
) {
  const postId = String(eventModel.postId);
  const post = await postRepository.get(postId);
  if (post) {
    await Promise.all([
      postRepository.update(postId, {
        postType: eventModel.newPostType,
        lastMod: eventModel.timestamp,
      }),

      updatePostUsersRatings(post),
    ]);
  }
}

export async function handleDeletedPost(eventModel: PostDeletedEventModel) {
  const postId = String(eventModel.postId);
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

    updateUserRating(author, communityId),

    createHistory(eventModel, EntityType.Post, OperationType.Delete)
  );

  const community = await getCommunityById(communityId);
  let communityReplyCount = community.replyCount;

  for (let i = 1; i <= replyCount; i++) {
    const reply = await replyRepository.get(`${postId}-${i}`);
    if (reply && !reply.isDeleted) {
      promises.push(updateUserRating(reply.author, communityId));

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
  const postTags: number[] = tagsResponse.map((tag: any) => tag.tagId);

  postTags.forEach(async (tag) => {
    const id = `${communityId}-${tag}`;
    const tagEntity = await tagRepository.get(id);
    if (tagEntity) {
      promises.push(
        tagRepository.update(id, {
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

export async function handleNewReply(eventModel: ReplyCreatedEventModel) {
  const { replyId, timestamp } = eventModel;
  const postId = String(eventModel.postId);

  const reply = await createReply(postId, replyId, timestamp);
  if (!reply) {
    const post = await postRepository.get(postId);
    if (post) {
      await postRepository.update(postId, {
        replyCount: post.replyCount + 1,
      });
    }

    return;
  }

  await createHistory(eventModel, EntityType.Reply, OperationType.Create);
}

export async function handleEditedReply(eventModel: ReplyEditedEventModel) {
  const { replyId, timestamp } = eventModel;
  const postId = String(eventModel.postId);
  let storedReply = await replyRepository.get(`${postId}-${replyId}`);
  let createdReply;

  if (!storedReply) {
    createdReply = await createReply(postId, replyId, timestamp);
  }
  if (!createdReply) return;

  if (!storedReply) {
    storedReply = createdReply;
  }

  const peeranhaReply = await getReply(Number(postId), replyId);
  if (!peeranhaReply) return;

  await Promise.all([
    replyRepository.update(storedReply.id, {
      content: peeranhaReply.content,
      ipfsHash: peeranhaReply.ipfsDoc[0],
      ipfsHash2: peeranhaReply.ipfsDoc[1],
    }),

    createHistory(eventModel, EntityType.Reply, OperationType.Edit),
  ]);

  await updatePostContent(postId, timestamp, replyId);
}

export async function handleDeletedReply(eventModel: ReplyDeletedEventModel) {
  const { replyId, timestamp } = eventModel;
  const postId = String(eventModel.postId);

  const reply = await replyRepository.get(`${postId}-${replyId}`);
  if (!reply) return;

  await replyRepository.update(reply.id, { isDeleted: true });

  const promises: Promise<any>[] = [];

  const post = await postRepository.get(postId);
  if (post) {
    const community = await getCommunityById(post.communityId);

    promises.push(
      updateUserRating(reply.author, post.communityId),

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

  promises.push(
    updatePostContent(postId, timestamp),

    createHistory(eventModel, EntityType.Reply, OperationType.Delete)
  );

  await Promise.all(promises);
}

export async function handleNewComment(eventModel: CommentCreatedEventModel) {
  const { replyId, commentId } = eventModel;
  const postId = String(eventModel.postId);

  const comment = await createComment(postId, replyId, commentId);
  if (!comment) {
    const post = await postRepository.get(postId);
    if (post) {
      if (replyId === 0) {
        await postRepository.update(post.id, {
          commentCount: post.commentCount + 1,
        });
      } else {
        const reply = await replyRepository.get(`${postId}-${replyId}`);
        if (reply) {
          await replyRepository.update(reply.id, {
            commentCount: reply.commentCount + 1,
          });
        }
      }
    }

    return;
  }

  await createHistory(eventModel, EntityType.Comment, OperationType.Create);
}

export async function handleEditedComment(eventModel: CommentEditedEventModel) {
  const { replyId, commentId, timestamp } = eventModel;
  const postId = String(eventModel.postId);

  let storedComment = await commentRepository.get(
    `${postId}-${replyId}-${commentId}`
  );
  let createdComment;

  if (!storedComment)
    createdComment = await createComment(postId, replyId, commentId);
  if (!createdComment) return;

  if (!storedComment) storedComment = createdComment;

  const comment = await getComment(Number(postId), replyId, commentId);
  if (!comment) return;

  await Promise.all([
    commentRepository.update(storedComment.id, {
      content: comment.content,
      ipfsHash: comment.ipfsDoc[0],
      ipfsHash2: comment.ipfsDoc[1],
    }),

    createHistory(eventModel, EntityType.Comment, OperationType.Edit),
  ]);

  await updatePostContent(postId, timestamp);
}

export async function handleDeletedComment(
  eventModel: CommentDeletedEventModel
) {
  const { replyId, commentId, timestamp } = eventModel;
  const postId = String(eventModel.postId);

  const comment = await commentRepository.get(
    `${postId}-${replyId}-${commentId}`
  );
  if (!comment) return;

  await commentRepository.update(comment.id, {
    isDeleted: true,
  });

  const promises: Promise<any>[] = [];

  const post = await postRepository.get(postId);
  if (post && comment.author !== post.author) {
    promises.push(updateUserRating(comment.author, post.communityId));
  }

  promises.push(
    createHistory(eventModel, EntityType.Comment, OperationType.Delete)
  );

  await updatePostContent(postId, timestamp);

  await Promise.all(promises);
}

export async function handlerForumItemVoted(eventModel: ItemVotedEventModel) {
  const { replyId, commentId, timestamp, user } = eventModel;
  const postId = String(eventModel.postId);

  if (commentId !== 0) {
    let comment = await commentRepository.get(
      `${postId}-${replyId}-${commentId}`
    );

    if (!comment) {
      comment = await createComment(postId, replyId, commentId);
    }
    if (comment) {
      const peeranhaComment = await getComment(
        Number(postId),
        replyId,
        commentId
      );
      if (peeranhaComment)
        await commentRepository.update(comment.id, {
          rating: peeranhaComment.rating,
        });
    }
  } else if (replyId !== 0) {
    let post = await postRepository.get(postId);
    if (!post) post = await createPost(postId, timestamp);

    let reply = await replyRepository.get(`${postId}-${replyId}`);
    if (!reply) reply = await createReply(postId, replyId, timestamp);

    const promises: Promise<any>[] = [];

    if (reply) {
      const peeranhaReply = await getReply(Number(postId), replyId);
      if (peeranhaReply) {
        promises.push(
          replyRepository.update(reply.id, {
            rating: peeranhaReply.rating,
          })
        );
      }
      promises.push(updateUserRating(reply.author, post.communityId));
    }

    promises.push(updateUserRating(user, post.communityId));
    await Promise.all(promises);
  } else {
    let post = await postRepository.get(postId);
    if (!post) post = await createPost(postId, timestamp);

    const promises: Promise<any>[] = [];

    const peeranhaPost = await getPost(Number(postId));
    if (peeranhaPost) {
      promises.push(
        postRepository.update(postId, {
          rating: peeranhaPost.rating,
        })
      );
    }

    promises.push(
      updateUserRating(post.author, post.communityId),
      updateUserRating(user, post.communityId)
    );

    await Promise.all(promises);
  }
}

export async function handlerChangedStatusBestReply(
  eventModel: ReplyMarkedTheBestEventModel
) {
  const { timestamp, replyId } = eventModel;
  const postId = String(eventModel.postId);

  let post = await postRepository.get(postId);
  let previousBestReply = 0;
  if (!post) {
    post = await createPost(postId, timestamp);
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
      previousReply = await createReply(postId, previousBestReply, timestamp);

    if (previousReply) {
      await replyRepository.update(previousReply.id, {
        isBestReply: false,
      });

      await updateUserRating(previousReply.author, post.communityId);
    }
  }

  let reply = await replyRepository.get(`${postId}-${replyId}`);
  if (!reply) reply = await createReply(postId, replyId, timestamp);
  if (reply) {
    if (replyId !== 0) {
      if (reply.author !== post.author) {
        await updateUserRating(reply.author, post.communityId);
      }
      await replyRepository.update(reply.id, {
        isBestReply: true,
      });
    }
    if (reply.author !== post.author) {
      await updateUserRating(post.author, post.communityId);
    }
  }
}

export async function handleGetReward(eventModel: GetRewardEventModel) {
  const { period, user } = eventModel;

  const userReward = await userRewardRepository.get(`${period}-${user}`);
  if (userReward) {
    await userRewardRepository.update(userReward.id, {
      isPaid: true,
    });
  }
}

export async function handlerSetDocumentationTree(
  eventModel: SetDocumentationTreeEventModel
) {
  const { communityId, timestamp, userAddr } = eventModel;

  const [oldDocumentation, communityDocumentation] = await Promise.all([
    communityDocumentationRepository.get(communityId),
    getDocumentationTree(communityId),
  ]);

  if (
    communityDocumentation.hash === '' ||
    parseInt(communityDocumentation.hash, 16) === 0 ||
    (oldDocumentation &&
      oldDocumentation.ipfsHash === communityDocumentation.hash)
  ) {
    return;
  }

  await generateDocumentationPosts(
    communityId,
    userAddr,
    communityDocumentation.hash,
    timestamp,
    oldDocumentation?.ipfsHash
  );
}
