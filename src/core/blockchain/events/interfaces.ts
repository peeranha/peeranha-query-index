import { Blockchain } from 'src/core/blockchain/constants';

export interface IBaseEvent {
  transaction: string;
  blockchain: Blockchain;
}

export interface IUserCreatedEvent extends IBaseEvent {
  user: string;
}

export interface IUserUpdatedEvent extends IBaseEvent {
  user: string;
}

export interface ICommunityCreatedEvent extends IBaseEvent {
  user: string;
  communityId: string;
}

export interface ICommunityUpdatedEvent extends IBaseEvent {
  user: string;
  communityId: string;
}

export interface ITagCreatedEvent extends IBaseEvent {
  user: string;
  communityId: string;
  tagId: number;
}

export interface ITagUpdatedEvent extends IBaseEvent {
  user: string;
  communityId: string;
  tagId: number;
}

export interface IPostCreatedEvent extends IBaseEvent {
  user: string;
  communityId: string;
  postId: string;
}

export interface IPostEditedEvent extends IBaseEvent {
  user: string;
  postId: string;
}

export interface IPostDeletedEvent extends IBaseEvent {
  user: string;
  postId: string;
}

export interface IReplyCreatedEvent extends IBaseEvent {
  user: string;
  postId: any;
  parentReplyId: number;
  replyId: number;
}

export interface IReplyEditedEvent extends IBaseEvent {
  user: string;
  postId: string;
  replyId: number;
}

export interface IReplyDeletedEvent extends IBaseEvent {
  user: string;
  postId: string;
  replyId: number;
}

export interface ICommentCreatedEvent extends IBaseEvent {
  user: string;
  postId: any;
  replyId: number;
  commentId: number;
}

export interface ICommentEditedEvent extends IBaseEvent {
  user: string;
  postId: string;
  replyId: number;
  commentId: number;
}

export interface ICommentDeletedEvent extends IBaseEvent {
  user: string;
  postId: string;
  replyId: number;
  commentId: number;
}

export interface IItemVotedEvent extends IBaseEvent {
  user: string;
  postId: any;
  replyId: number;
  commentId: number;
  voteDirection: number;
}

export interface IReplyMarkedTheBestEvent extends IBaseEvent {
  user: string;
  postId: any;
  replyId: number;
}

export interface IPostTypeChangedEvent extends IBaseEvent {
  user: string;
  postId: any;
  oldPostType: number;
}

export interface IPostCommunityChangedEvent extends IBaseEvent {
  user: string;
  postId: any;
  oldCommunityId: number;
}

export interface IFollowedCommunityEvent extends IBaseEvent {
  user: string;
  communityId: string;
}

export interface IUnfollowedCommunityEvent extends IBaseEvent {
  user: string;
  communityId: string;
}

export interface IRoleGrantedEvent extends IBaseEvent {
  role: string;
  user: string;
}

export interface IRoleRevokedEvent extends IBaseEvent {
  role: string;
  user: string;
}

export interface ISetDocumentationTreeEvent extends IBaseEvent {
  user: string;
  communityId: string;
}

export type IBlockchainEvent =
  | IUserCreatedEvent
  | IUserUpdatedEvent
  | ICommunityCreatedEvent
  | ICommunityUpdatedEvent
  | ITagCreatedEvent
  | ITagUpdatedEvent
  | IPostCreatedEvent
  | IPostEditedEvent
  | IPostDeletedEvent
  | IReplyCreatedEvent
  | IReplyEditedEvent
  | IReplyDeletedEvent
  | ICommentCreatedEvent
  | ICommentEditedEvent
  | ICommentDeletedEvent
  | IItemVotedEvent
  | IReplyMarkedTheBestEvent
  | IPostTypeChangedEvent
  | IPostCommunityChangedEvent
  | IFollowedCommunityEvent
  | IUnfollowedCommunityEvent
  | IRoleGrantedEvent
  | IRoleRevokedEvent
  | ISetDocumentationTreeEvent;
