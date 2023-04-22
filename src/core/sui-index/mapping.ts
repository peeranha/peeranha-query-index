import { CommentRepository } from 'src/core/db/repositories/CommentRepository';
import { createHistory } from 'src/core/index/mapping';
import { EntityType, OperationType } from 'src/core/index/utils';
import {
  createSuiCommunity,
  updateSuiCommunity,
  createSuiTag,
  updateSuiTag,
} from 'src/core/sui-index/community';
import {
  createSuiPost,
  createSuiReply,
  editSuiReply,
  deleteSuiReply,
  changeStatusBestSuiReply,
  updateSuiPostContent,
  deleteSuiPost,
  createSuiComment,
  voteSuiItem,
} from 'src/core/sui-index/post';
import {
  createSuiUser,
  updateSuiUser,
  updateSuiUserRating,
  followSuiCommunity,
  unfollowSuiCommunity,
} from 'src/core/sui-index/user';
import {
  UserCreatedSuiEventModel,
  UserUpdatedSuiEventModel,
  CommunityCreatedSuiEventModel,
  CommunityUpdatedSuiEventModel,
  TagCreatedSuiEventModel,
  TagUpdatedSuiEventModel,
  PostCreatedSuiEventModel,
  ReplyCreatedSuiEventModel,
  ReplyEditedSuiEventModel,
  ReplyDeletedSuiEventModel,
  ReplyMarkedTheBestSuiEventModel,
  PostDeletedSuiEventModel,
  PostEditedSuiEventModel,
  CommentCreatedSuiEventModel,
  CommentDeletedSuiEventModel,
  CommentEditedSuiEventModel,
  ItemVotedSuiEventModel,
  FollowedCommunitySuiEventModel,
  UnfollowedCommunitySuiEventModel,
} from 'src/models/sui-event-models';

import { PostRepository } from '../db/repositories/PostRepository';
import { ReplyRepository } from '../db/repositories/ReplyRepository';
import { getSuiComment } from '../sui-blockchain/data-loader';

const commentRepository = new CommentRepository();
const postRepository = new PostRepository();
const replyRepository = new ReplyRepository();
// const historyRepository = new HistoryRepository();

export async function handleCreateSuiUser(
  eventModel: UserCreatedSuiEventModel
) {
  await createSuiUser(eventModel.userId, eventModel.timestamp);
}

export async function handleUpdateSuiUser(
  eventModel: UserUpdatedSuiEventModel
) {
  await updateSuiUser(eventModel.userId, eventModel.timestamp);
}

export async function handleCreateSuiCommunity(
  eventModel: CommunityCreatedSuiEventModel
) {
  await createSuiCommunity(eventModel.communityId);
}

export async function handleUpdateSuiCommunity(
  eventModel: CommunityUpdatedSuiEventModel
) {
  await updateSuiCommunity(eventModel.communityId);
}

export async function handleCreateSuiTag(eventModel: TagCreatedSuiEventModel) {
  await createSuiTag(eventModel.communityId, eventModel.tagId);
}

export async function handleUpdateSuiTag(eventModel: TagUpdatedSuiEventModel) {
  await updateSuiTag(eventModel.communityId, eventModel.tagId);
}

export async function handleCreateSuiPost(
  eventModel: PostCreatedSuiEventModel
) {
  await createSuiPost(eventModel.postId, eventModel.timestamp);
  await createHistory(eventModel, EntityType.Post, OperationType.Create);
}

export async function handleEditSuiPost(eventModel: PostEditedSuiEventModel) {
  const { postId, timestamp } = eventModel;

  if (!(await postRepository.get(postId))) {
    await createSuiPost(postId, timestamp);
  }

  await Promise.all([
    updateSuiPostContent(postId, timestamp),
    createHistory(eventModel, EntityType.Post, OperationType.Edit),
  ]);
}

export async function handleDeleteSuiPost(
  eventModel: PostDeletedSuiEventModel
) {
  await deleteSuiPost(eventModel.postId);
  await createHistory(eventModel, EntityType.Post, OperationType.Delete);
}

export async function handleCreateSuiReply(
  eventModel: ReplyCreatedSuiEventModel
) {
  const { postId, replyId, timestamp } = eventModel;

  const reply = await createSuiReply(postId, replyId, timestamp);
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

export async function handleEditSuiReply(eventModel: ReplyEditedSuiEventModel) {
  await editSuiReply(
    eventModel.postId,
    eventModel.replyId,
    eventModel.timestamp
  );
  await createHistory(eventModel, EntityType.Reply, OperationType.Edit);
}

export async function handleDeleteSuiReply(
  eventModel: ReplyDeletedSuiEventModel
) {
  await deleteSuiReply(
    eventModel.postId,
    eventModel.replyId,
    eventModel.timestamp
  );
  await createHistory(eventModel, EntityType.Reply, OperationType.Delete);
}

export async function handleChangeStatusBestSuiReply(
  eventModel: ReplyMarkedTheBestSuiEventModel
) {
  await changeStatusBestSuiReply(
    eventModel.postId,
    eventModel.replyId,
    eventModel.timestamp
  );
}

export async function handleNewSuiComment(
  eventModel: CommentCreatedSuiEventModel
) {
  const { postId, replyId, commentId, timestamp } = eventModel;

  const comment = await createSuiComment(postId, replyId, commentId, timestamp);
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
  }

  await createHistory(eventModel, EntityType.Comment, OperationType.Create);
}

export async function handleEditedSuiComment(
  eventModel: CommentEditedSuiEventModel
) {
  const { postId, replyId, commentId, timestamp } = eventModel;

  let storedComment = await commentRepository.get(
    `${postId}-${replyId}-${commentId}`
  );
  let createdComment;

  if (!storedComment)
    createdComment = await createSuiComment(
      postId,
      replyId,
      commentId,
      timestamp
    );
  if (!createdComment) return;

  if (!storedComment) storedComment = createdComment;

  const comment = await getSuiComment(postId, replyId, commentId, 0);

  if (!comment) return;
  if (!storedComment) return;

  await Promise.all([
    commentRepository.update(storedComment.id, {
      content: comment.content,
      ipfsHash: comment.ipfsDoc[0],
      ipfsHash2: comment.ipfsDoc[1],
    }),

    createHistory(eventModel, EntityType.Comment, OperationType.Edit),
  ]);

  await updateSuiPostContent(postId, timestamp);
}

export async function handleDeletedSuiComment(
  eventModel: CommentDeletedSuiEventModel
) {
  const { postId, replyId, commentId } = eventModel;

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
    promises.push(updateSuiUserRating(comment.author, post.communityId));
  }

  promises.push(
    createHistory(eventModel, EntityType.Comment, OperationType.Delete)
  );

  await updateSuiPostContent(postId, eventModel.timestamp);

  await Promise.all(promises);
}

export async function handleVoteSuiItem(eventModel: ItemVotedSuiEventModel) {
  await voteSuiItem(
    eventModel.userId,
    eventModel.postId,
    eventModel.replyId,
    eventModel.commentId,
    eventModel.voteDirection
  );
}

export async function handleFollowSuiCommunity(
  eventModel: FollowedCommunitySuiEventModel
) {
  await followSuiCommunity(
    eventModel.userId,
    eventModel.communityId,
    eventModel.timestamp
  );
}

export async function handleUnfollowSuiCommunity(
  eventModel: UnfollowedCommunitySuiEventModel
) {
  await unfollowSuiCommunity(
    eventModel.userId,
    eventModel.communityId,
    eventModel.timestamp
  );
}
