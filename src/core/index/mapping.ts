/* eslint-disable no-await-in-loop */
import {
  getAchievementsNFTConfig,
  getComment,
  getTranslation,
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
  CommentTranslationEntity,
  ReplyTranslationEntity,
  PostTranslationEntity,
  HistoryEntity,
} from 'src/core/db/entities';
import { AchievementRepository } from 'src/core/db/repositories/AchievementRepository';
import { CommentRepository } from 'src/core/db/repositories/CommentRepository';
import { CommentTranslationRepository } from 'src/core/db/repositories/CommentTranslationRepository';
import { CommunityDocumentationRepository } from 'src/core/db/repositories/CommunityDocumentationRepository';
import { CommunityRepository } from 'src/core/db/repositories/CommunityRepository';
import { HistoryRepository } from 'src/core/db/repositories/HistoryRepository';
import { PostRepository } from 'src/core/db/repositories/PostRepository';
import { PostTagRepository } from 'src/core/db/repositories/PostTagRepository';
import { PostTranslationRepository } from 'src/core/db/repositories/PostTranslationRepository';
import { ReplyRepository } from 'src/core/db/repositories/ReplyRepository';
import { ReplyTranslationRepository } from 'src/core/db/repositories/ReplyTranslationRepository';
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
  updateTag,
  updateCommunity,
} from 'src/core/index/community';
import {
  createComment,
  createPost,
  updatePostContent,
  createReply,
  setCommunityDocumentation,
} from 'src/core/index/post';
import {
  createUser,
  updatePostUsersRatings,
  updateUserRating,
} from 'src/core/index/user';
import { EntityType, OperationType } from 'src/core/index/utils';
import {
  Network,
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
  ItemVotedEventModel,
  ReplyMarkedTheBestEventModel,
  ReplyCreatedEventModel,
  CommentCreatedEventModel,
  TranslationCreatedEventModel,
  TranslationEditedEventModel,
  TranslationDeletedEventModel,
} from 'src/models/event-models';

import { RuntimeError } from '../errors';

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
const postTranslationRepository = new PostTranslationRepository();
const replyTranslationRepository = new ReplyTranslationRepository();
const commentTranslationRepository = new CommentTranslationRepository();

const POOL_NFT = 1_000_000;

export async function createHistory(
  event: any,
  entityType: EntityType,
  operationType: OperationType,
  network: Network
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
    network,
  });

  await historyRepository.create(history);
}

export async function handleConfigureNewAchievement(
  eventModel: ConfigureNewAchievementNFTEventModel
) {
  const { achievementId } = eventModel;
  await createAchievement(
    achievementRepository,
    achievementId,
    eventModel.network
  );
}

export async function handleTransfer(eventModel: TransferEventModel) {
  const { timestamp, to: user } = eventModel;
  const achievementId = Math.floor(
    (eventModel.tokenId?.hex
      ? Number(eventModel.tokenId?.hex)
      : eventModel.tokenId) /
      POOL_NFT +
      1
  );
  const achievement = await achievementRepository.get(
    `${eventModel.network}-${achievementId}`
  );

  if (achievement) {
    const peeranhaAchievement = await getAchievementsNFTConfig(
      achievementId,
      eventModel.network
    );
    await achievementRepository.update(
      `${eventModel.network}-${achievementId}`,
      {
        factCount: peeranhaAchievement.factCount,
      }
    );
  } else {
    await createAchievement(
      achievementRepository,
      achievementId,
      eventModel.network
    );
  }

  let userEntity = await userRepository.get(user);
  if (!userEntity) {
    userEntity = await createUser(user, timestamp, eventModel.network);
  }
  if (!userEntity) {
    return;
  }
  const userAchievement = new UserAchievementEntity({
    id: `${user}-${eventModel.network}-${achievementId}`,
    userId: user,
    achievementId: `${eventModel.network}-${achievementId}`,
  });

  await userAchievementRepository.create(userAchievement);
}

export async function handleNewUser(eventModel: UserCreatedEventModel) {
  await createUser(
    eventModel.userAddress,
    eventModel.timestamp,
    eventModel.network
  );
}

export async function handleUpdatedUser(eventModel: UserUpdatedEventModel) {
  const { timestamp, userAddress } = eventModel;
  if (!(await userRepository.get(userAddress))) {
    await createUser(userAddress, timestamp, eventModel.network);
  } else {
    const user = await getUserByAddress(userAddress, eventModel.network);
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
      networkId: eventModel.network,
    };
    await userRepository.update(userAddress, userForSave);
  }
}

export async function handlerGrantedRole(eventModel: RoleGrantedEventModel) {
  const { role, timestamp, account } = eventModel;
  if (!(await userRepository.get(account))) {
    const user = await createUser(account, timestamp, eventModel.network);
    if (!user) return;
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
  if (!user)
    user = await createUser(userAddress, timestamp, eventModel.network);

  const userCommunity = new UserCommunityEntity({
    id: `${userAddress}-${communityId}`,
    userId: userAddress,
    communityId,
  });
  await userCommunityRepository.create(userCommunity);

  const community = await getCommunityById(communityId, eventModel.network);
  await communityRepository.update(communityId, {
    followingUsers: community.followingUsers + 1,
  });
}

export async function handlerUnfollowCommunity(
  eventModel: UnfollowedCommunityEventModel
) {
  const { communityId, timestamp, userAddress } = eventModel;

  let user = await userRepository.get(userAddress);
  if (!user)
    user = await createUser(userAddress, timestamp, eventModel.network);

  await userCommunityRepository.delete(`${userAddress}-${communityId}`);

  const community = await getCommunityById(communityId, eventModel.network);
  await communityRepository.update(communityId, {
    followingUsers: community.followingUsers - 1,
  });
}

export async function handleNewCommunity(
  eventModel: CommunityCreatedEventModel
) {
  await createCommunity(eventModel.id, eventModel.network);
}

export async function handleUpdatedCommunity(
  eventModel: CommunityUpdatedEventModel
) {
  const { id } = eventModel;
  const community = await communityRepository.get(id);
  if (!community) {
    await createCommunity(id, eventModel.network);
  } else {
    await updateCommunity(id, eventModel.network);
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
  const community = await getCommunityById(
    eventModel.communityId,
    eventModel.network
  );
  await communityRepository.update(community.id, {
    isFrozen: false,
  });
}

export async function handleNewTag(eventModel: TagCreatedEventModel) {
  const { communityId, tagId } = eventModel;
  if (await tagRepository.get(`${communityId}-${tagId}`)) return;
  const community = await getCommunityById(communityId, eventModel.network);

  const tag = await getTag(communityId, tagId, eventModel.network);
  await Promise.all([
    communityRepository.update(communityId, {
      tagsCount: community.tagsCount + 1,
    }),

    createTag(tag, eventModel.network),
  ]);
}

export async function handleEditedTag(eventModel: TagUpdatedEventModel) {
  const { communityId, tagId } = eventModel;
  const [tag, tagEntity] = await Promise.all([
    getTag(communityId, tagId, eventModel.network),
    tagRepository.get(`${communityId}-${tagId}`),
  ]);
  if (!tagEntity) {
    await createTag(tag, eventModel.network);
  } else {
    await updateTag(tag, eventModel.network);
  }
}

export async function handleNewPost(eventModel: PostCreatedEventModel) {
  const postId = String(eventModel.postId);
  await createPost(postId, eventModel.timestamp, eventModel.network);

  await createHistory(
    eventModel,
    EntityType.Post,
    OperationType.Create,
    eventModel.network
  );
}

export async function handleEditedPost(eventModel: PostEditedEventModel) {
  const postId = String(eventModel.postId);

  if (!(await postRepository.get(postId)))
    await createPost(postId, eventModel.timestamp, eventModel.network);

  await Promise.all([
    updatePostContent(postId, eventModel.timestamp, eventModel.network),
    createHistory(
      eventModel,
      EntityType.Post,
      OperationType.Edit,
      eventModel.network
    ),
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

      updatePostUsersRatings(post, eventModel.network),
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

    updateUserRating(author, communityId, eventModel.network),

    createHistory(
      eventModel,
      EntityType.Post,
      OperationType.Delete,
      eventModel.network
    )
  );

  const community = await getCommunityById(communityId, eventModel.network);
  let communityReplyCount = community.replyCount;

  for (let i = 1; i <= replyCount; i++) {
    const reply = await replyRepository.get(
      `${postId}-${eventModel.network}-${i}`
    );
    if (reply && !reply.isDeleted) {
      promises.push(
        updateUserRating(reply.author, communityId, eventModel.network)
      );

      const replyAuthor = await userRepository.get(reply.author);
      if (replyAuthor) {
        promises.push(
          userRepository.update(reply.author, {
            replyCount: replyAuthor.replyCount - 1,
          })
        );
      }

      for (let j = 1; j <= reply.commentCount; j++) {
        const comment = await commentRepository.get(
          `${postId.toString()}-${eventModel.network}-${i.toString()}-${
            eventModel.network
          }-${j.toString()}`
        );
        if (comment) {
          promises.push(
            commentRepository.update(
              `${postId.toString()}-${eventModel.network}-${i.toString()}-${
                eventModel.network
              }-${j.toString()}`,
              {
                isDeleted: true,
              }
            )
          );
        }
      }

      communityReplyCount -= 1;
    }
  }

  const tagsResponse = await postTagRepository.getListOfProperties(
    'tagId',
    'postId',
    post.id
  );
  const postTags = tagsResponse.map((tag) => tag.tagId?.toString());

  postTags.forEach(async (tag) => {
    const id = tag;
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

  const reply = await createReply(
    postId,
    replyId,
    timestamp,
    eventModel.network
  );
  if (!reply) {
    const post = await postRepository.get(postId);
    if (post) {
      await postRepository.update(postId, {
        replyCount: post.replyCount + 1,
      });
    }

    return;
  }

  await createHistory(
    eventModel,
    EntityType.Reply,
    OperationType.Create,
    eventModel.network
  );
}

export async function handleEditedReply(eventModel: ReplyEditedEventModel) {
  const { replyId, timestamp } = eventModel;
  const postId = String(eventModel.postId);
  let storedReply = await replyRepository.get(`${postId}-${replyId}`);
  let createdReply;

  if (!storedReply) {
    createdReply = await createReply(
      postId,
      replyId,
      timestamp,
      eventModel.network
    );
  }
  if (createdReply) return;

  if (!storedReply) {
    storedReply = createdReply;
  }

  const peeranhaReply = await getReply(postId, replyId, eventModel.network);
  if (!peeranhaReply) return;

  if (!storedReply) {
    throw new RuntimeError('Unexpected null stored reply');
  }

  await Promise.all([
    replyRepository.update(storedReply.id, {
      content: peeranhaReply.content,
      ipfsHash: peeranhaReply.ipfsDoc[0],
      ipfsHash2: peeranhaReply.ipfsDoc[1],
    }),

    createHistory(
      eventModel,
      EntityType.Reply,
      OperationType.Edit,
      eventModel.network
    ),
  ]);

  await updatePostContent(postId, timestamp, eventModel.network, replyId);
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
    const community = await getCommunityById(
      post.communityId,
      eventModel.network
    );

    promises.push(
      updateUserRating(reply.author, post.communityId, eventModel.network),

      communityRepository.update(post.communityId, {
        replyCount: community.replyCount - 1,
      }),

      postRepository.update(postId, {
        bestReply: reply.isBestReply ? '' : post.bestReply,
        officialReply: reply.isOfficialReply ? '' : post.officialReply,
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
    updatePostContent(postId, timestamp, eventModel.network),

    createHistory(
      eventModel,
      EntityType.Reply,
      OperationType.Delete,
      eventModel.network
    )
  );

  await Promise.all(promises);
}

export async function handleNewComment(eventModel: CommentCreatedEventModel) {
  const { replyId, commentId } = eventModel;
  const postId = String(eventModel.postId);

  const comment = await createComment(
    postId,
    replyId,
    commentId,
    eventModel.network
  );
  if (!comment) {
    const post = await postRepository.get(postId);
    if (post) {
      if (Number(replyId.split('-')[1]) === 0) {
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

  await createHistory(
    eventModel,
    EntityType.Comment,
    OperationType.Create,
    eventModel.network
  );
}

export async function handleEditedComment(eventModel: CommentEditedEventModel) {
  const { replyId, commentId, timestamp } = eventModel;
  const postId = String(eventModel.postId);

  let storedComment = await commentRepository.get(
    `${postId}-${replyId}-${commentId}`
  );
  let createdComment;

  if (!storedComment)
    createdComment = await createComment(
      postId,
      replyId,
      commentId,
      eventModel.network
    );
  if (!createdComment) return;

  if (!storedComment) storedComment = createdComment;

  const comment = await getComment(
    postId,
    replyId,
    commentId,
    eventModel.network
  );
  if (!comment) return;

  await Promise.all([
    commentRepository.update(storedComment.id, {
      content: comment.content,
      ipfsHash: comment.ipfsDoc[0],
      ipfsHash2: comment.ipfsDoc[1],
    }),

    createHistory(
      eventModel,
      EntityType.Comment,
      OperationType.Edit,
      eventModel.network
    ),
  ]);

  await updatePostContent(postId, timestamp, eventModel.network);
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
    promises.push(
      updateUserRating(comment.author, post.communityId, eventModel.network)
    );
  }

  promises.push(
    createHistory(
      eventModel,
      EntityType.Comment,
      OperationType.Delete,
      eventModel.network
    )
  );

  await updatePostContent(postId, timestamp, eventModel.network);

  await Promise.all(promises);
}

export async function handlerForumItemVoted(eventModel: ItemVotedEventModel) {
  const { replyId, commentId, timestamp, user } = eventModel;
  const postId = String(eventModel.postId);

  if (Number(commentId.split('-')[1]) !== 0) {
    let comment = await commentRepository.get(
      `${postId}-${replyId}-${commentId}`
    );

    if (!comment) {
      comment = await createComment(
        postId,
        replyId,
        commentId,
        eventModel.network
      );
    }
    if (comment) {
      const peeranhaComment = await getComment(
        postId,
        replyId,
        commentId,
        eventModel.network
      );
      if (peeranhaComment)
        await commentRepository.update(comment.id, {
          rating: peeranhaComment.rating,
        });
    }
  } else if (Number(replyId.split('-')[1]) !== 0) {
    let post = await postRepository.get(postId);
    if (!post) post = await createPost(postId, timestamp, eventModel.network);

    let reply = await replyRepository.get(`${postId}-${replyId}`);
    if (!reply)
      reply = await createReply(postId, replyId, timestamp, eventModel.network);

    const promises: Promise<any>[] = [];

    if (reply) {
      const peeranhaReply = await getReply(postId, replyId, eventModel.network);
      if (peeranhaReply) {
        promises.push(
          replyRepository.update(reply.id, {
            rating: peeranhaReply.rating,
          })
        );
      }
      promises.push(
        updateUserRating(reply.author, post.communityId, eventModel.network)
      );
    }

    promises.push(updateUserRating(user, post.communityId, eventModel.network));
    await Promise.all(promises);
  } else {
    let post = await postRepository.get(postId);
    if (!post) post = await createPost(postId, timestamp, eventModel.network);

    const promises: Promise<any>[] = [];

    const peeranhaPost = await getPost(postId, eventModel.network);
    if (peeranhaPost) {
      promises.push(
        postRepository.update(postId, {
          rating: peeranhaPost.rating,
        })
      );
    }

    promises.push(
      updateUserRating(post.author, post.communityId, eventModel.network),
      updateUserRating(user, post.communityId, eventModel.network)
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
  let previousBestReply = '';
  if (!post) {
    post = await createPost(postId, timestamp, eventModel.network);
  } else {
    previousBestReply = post.bestReply;

    await postRepository.update(postId, {
      bestReply: replyId,
    });
  }
  if (previousBestReply?.split('-')[1]) {
    let previousReply = await replyRepository.get(
      `${postId}-${previousBestReply}`
    );

    if (!previousReply)
      previousReply = await createReply(
        postId,
        `${eventModel.network}-${previousBestReply}`,
        timestamp,
        eventModel.network
      );

    if (previousReply) {
      await replyRepository.update(previousReply.id, {
        isBestReply: false,
      });

      await updateUserRating(
        previousReply.author,
        post.communityId,
        eventModel.network
      );
    }
  }

  let reply = await replyRepository.get(`${postId}-${replyId}`);
  if (!reply)
    reply = await createReply(postId, replyId, timestamp, eventModel.network);
  if (reply) {
    if (Number(replyId.split('-')[1]) !== 0) {
      if (reply.author !== post.author) {
        await updateUserRating(
          reply.author,
          post.communityId,
          eventModel.network
        );
      }
      await replyRepository.update(reply.id, {
        isBestReply: true,
      });
    }
    if (reply.author !== post.author) {
      await updateUserRating(post.author, post.communityId, eventModel.network);
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
    getDocumentationTree(communityId, eventModel.network),
  ]);

  if (
    communityDocumentation.hash === '' ||
    parseInt(communityDocumentation.hash, 16) === 0 ||
    (oldDocumentation &&
      oldDocumentation.ipfsHash === communityDocumentation.hash)
  ) {
    return;
  }

  await setCommunityDocumentation(
    communityId,
    userAddr,
    communityDocumentation.hash,
    timestamp,
    eventModel.network,
    oldDocumentation?.ipfsHash
  );
}

export async function handlerTranslationCreated(
  eventModel: TranslationCreatedEventModel
) {
  const { postId, replyId, commentId, language, network } = eventModel;

  const translation = await getTranslation(
    postId,
    replyId,
    commentId,
    language,
    network
  );

  if (Number(commentId?.split('-')[1]) !== 0) {
    const entityId = `${postId}-${replyId}-${commentId}`;

    const commentTranslation = new CommentTranslationEntity({
      id: `${entityId}-${language}`,
      commentId: entityId,
      author: translation.author,
      content: translation.content,
      ipfsHash: translation.ipfsDoc[0],
      language,
    });

    await commentTranslationRepository.create(commentTranslation);
  } else if (Number(replyId?.split('-')[1]) !== 0) {
    const entityId = `${postId}-${replyId}`;

    const replyTranslation = new ReplyTranslationEntity({
      id: `${entityId}-${language}`,
      replyId: entityId,
      author: translation.author,
      content: translation.content,
      ipfsHash: translation.ipfsDoc[0],
      language,
    });

    await replyTranslationRepository.create(replyTranslation);
  } else {
    const postTranslation = new PostTranslationEntity({
      id: `${postId}-${language}`,
      postId: String(postId),
      author: translation.author,
      title: translation.title!,
      content: translation.content,
      ipfsHash: translation.ipfsDoc[0],
      language,
    });

    await postTranslationRepository.create(postTranslation);
  }

  const post = await postRepository.get(String(postId));
  if (post) {
    await postRepository.update(String(postId), {
      postContent: `${post.postContent}${
        translation.title ? ` ${translation.title}` : ''
      } ${translation.content}`,
    });
  }
}

export async function handlerTranslationEdited(
  eventModel: TranslationEditedEventModel
) {
  const { postId, replyId, commentId, language, timestamp, network } =
    eventModel;

  const translation = await getTranslation(
    postId,
    replyId,
    commentId,
    language,
    network
  );

  if (Number(commentId?.split('-')[1]) !== 0) {
    const entityId = `${postId}-${replyId}-${commentId}`;

    const translationEntity = await commentTranslationRepository.get(
      `${entityId}-${language}`
    );

    if (translationEntity) {
      await commentTranslationRepository.update(`${entityId}-${language}`, {
        author: translation.author,
        content: translation.content,
        ipfsHash: translation.ipfsDoc[0],
      });
    }
  } else if (Number(replyId?.split('-')[1]) !== 0) {
    const entityId = `${postId}-${replyId}`;

    const translationEntity = await replyTranslationRepository.get(
      `${entityId}-${language}`
    );

    if (translationEntity) {
      await replyTranslationRepository.update(`${entityId}-${language}`, {
        author: translation.author,
        content: translation.content,
        ipfsHash: translation.ipfsDoc[0],
      });
    }
  } else {
    const translationEntity = await postTranslationRepository.get(
      `${postId}-${language}`
    );

    if (translationEntity) {
      await postTranslationRepository.update(`${postId}-${language}`, {
        author: translation.author,
        title: translation.title,
        content: translation.content,
        ipfsHash: translation.ipfsDoc[0],
      });
    }
  }

  await updatePostContent(String(postId), timestamp, network);
}

export async function handlerTranslationDeleted(
  eventModel: TranslationDeletedEventModel
) {
  const { postId, replyId, commentId, language, timestamp, network } =
    eventModel;

  if (Number(commentId?.split('-')[1]) !== 0) {
    const entityId = `${postId}-${replyId}-${commentId}`;

    await commentTranslationRepository.delete(`${entityId}-${language}`);
  } else if (Number(replyId?.split('-')[1]) !== 0) {
    const entityId = `${postId}-${replyId}`;

    await replyTranslationRepository.delete(`${entityId}-${language}`);
  } else {
    await postTranslationRepository.delete(`${postId}-${language}`);
  }

  await updatePostContent(String(postId), timestamp, network);
}
