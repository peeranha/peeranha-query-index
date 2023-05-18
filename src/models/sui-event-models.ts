import { Blockchain } from 'src/core/blockchain/constants';
import {
  ICommentEditedEvent,
  ICommentCreatedEvent,
  IItemVotedEvent,
  IPostCreatedEvent,
  IPostEditedEvent,
  IReplyCreatedEvent,
  IReplyEditedEvent,
  IReplyMarkedTheBestEvent,
  IUserCreatedEvent,
  IUserUpdatedEvent,
  ICommunityCreatedEvent,
  ITagCreatedEvent,
  ITagUpdatedEvent,
  IPostDeletedEvent,
  IReplyDeletedEvent,
  IFollowedCommunityEvent,
  IUnfollowedCommunityEvent,
  ICommentDeletedEvent,
  IRoleGrantedEvent,
  IRoleRevokedEvent,
  ISetDocumentationTreeEvent,
  IBaseEvent,
} from 'src/core/blockchain/events/interfaces';
import { toHexString } from 'src/core/utils/parser';

export type Event = {
  id: {
    txDigest: string;
    eventSeq: string;
  };
  packageId: string;
  transactionModule: string;
  sender: string;
  type: string;
  parsedJson?: Record<string, any> | undefined;
  bcs?: string | undefined;
  timestampMs?: string | undefined;
};

export class BaseSuiEventModel implements IBaseEvent {
  public transaction: string;

  public eventSeq: string;

  public packageId: string;

  public transactionModule: string;

  public sender: string;

  public type: string;

  public timestamp: number;

  public blockchain: Blockchain;

  constructor(event: Event) {
    this.transaction = event.id.txDigest;
    this.eventSeq = event.id.eventSeq;
    this.packageId = event.packageId;
    this.transactionModule = event.transactionModule;
    this.sender = event.sender;
    this.type = event.type;
    this.timestamp = Math.floor(Number(event.timestampMs) / 1000);
    this.blockchain = Blockchain.SUI;
  }
}

export class UserCreatedSuiEventModel
  extends BaseSuiEventModel
  implements IUserCreatedEvent
{
  public user: string;

  constructor(event: Event) {
    super(event);
    this.user = event.parsedJson?.userId;
  }
}

export class UserUpdatedSuiEventModel
  extends BaseSuiEventModel
  implements IUserUpdatedEvent
{
  public user: string;

  constructor(event: Event) {
    super(event);
    this.user = event.parsedJson?.userId;
  }
}

export class CommunityCreatedSuiEventModel
  extends BaseSuiEventModel
  implements ICommunityCreatedEvent
{
  public user: string;

  public communityId: string;

  constructor(event: Event) {
    super(event);
    this.user = event.parsedJson?.userId;
    this.communityId = event.parsedJson?.communityId;
  }
}

export class CommunityUpdatedSuiEventModel
  extends BaseSuiEventModel
  implements ICommunityCreatedEvent
{
  public user: string;

  public communityId: string;

  constructor(event: Event) {
    super(event);
    this.user = event.parsedJson?.userId;
    this.communityId = event.parsedJson?.communityId;
  }
}

export class TagCreatedSuiEventModel
  extends BaseSuiEventModel
  implements ITagCreatedEvent
{
  public user: string;

  public communityId: string;

  public tagId: number;

  constructor(event: Event) {
    super(event);
    this.user = event.parsedJson?.userId;
    this.communityId = event.parsedJson?.communityId;
    this.tagId = Number(event.parsedJson?.tagKey);
  }
}

export class TagUpdatedSuiEventModel
  extends BaseSuiEventModel
  implements ITagUpdatedEvent
{
  public user: string;

  public communityId: string;

  public tagId: number;

  constructor(event: Event) {
    super(event);
    this.user = event.parsedJson?.userId;
    this.communityId = event.parsedJson?.communityId;
    this.tagId = Number(event.parsedJson?.tagKey);
  }
}

export class PostCreatedSuiEventModel
  extends BaseSuiEventModel
  implements IPostCreatedEvent
{
  public user: string;

  public communityId: string;

  public postId: string;

  constructor(event: Event) {
    super(event);
    this.user = event.parsedJson?.userId;
    this.communityId = event.parsedJson?.communityId;
    this.postId = event.parsedJson?.postMetaDataId;
  }
}

export class PostEditedSuiEventModel
  extends BaseSuiEventModel
  implements IPostEditedEvent
{
  public user: string;

  public postId: string;

  constructor(event: Event) {
    super(event);
    this.user = event.parsedJson?.userId;
    this.postId = event.parsedJson?.postMetaDataId;
  }
}

export class PostDeletedSuiEventModel
  extends BaseSuiEventModel
  implements IPostDeletedEvent
{
  public user: string;

  public postId: string;

  constructor(event: Event) {
    super(event);
    this.user = event.parsedJson?.userId;
    this.postId = event.parsedJson?.postMetaDataId;
  }
}

export class ReplyCreatedSuiEventModel
  extends BaseSuiEventModel
  implements IReplyCreatedEvent
{
  public user: string;

  public postId: string;

  public parentReplyId: number;

  public replyId: number;

  constructor(event: Event) {
    super(event);
    this.user = event.parsedJson?.userId;
    this.postId = event.parsedJson?.postMetaDataId;
    this.parentReplyId = Number(event.parsedJson?.parentReplyKey);
    this.replyId = Number(event.parsedJson?.replyMetaDataKey);
  }
}

export class ReplyEditedSuiEventModel
  extends BaseSuiEventModel
  implements IReplyEditedEvent
{
  public user: string;

  public postId: string;

  public replyId: number;

  constructor(event: Event) {
    super(event);
    this.user = event.parsedJson?.userId;
    this.postId = event.parsedJson?.postMetaDataId;
    this.replyId = Number(event.parsedJson?.replyMetaDataKey);
  }
}

export class ReplyDeletedSuiEventModel
  extends BaseSuiEventModel
  implements IReplyDeletedEvent
{
  public user: string;

  public postId: string;

  public replyId: number;

  constructor(event: Event) {
    super(event);
    this.user = event.parsedJson?.userId;
    this.postId = event.parsedJson?.postMetaDataId;
    this.replyId = Number(event.parsedJson?.replyMetaDataKey);
  }
}

export class ReplyMarkedTheBestSuiEventModel
  extends BaseSuiEventModel
  implements IReplyMarkedTheBestEvent
{
  public user: string;

  public postId: string;

  public replyId: number;

  constructor(event: Event) {
    super(event);
    this.user = event.parsedJson?.userId;
    this.postId = event.parsedJson?.postMetaDataId;
    this.replyId = Number(event.parsedJson?.replyMetaDataKey);
  }
}

export class ItemVotedSuiEventModel
  extends BaseSuiEventModel
  implements IItemVotedEvent
{
  public user: string;

  public postId: string;

  public replyId: number;

  public commentId: number;

  public voteDirection: number;

  constructor(event: Event) {
    super(event);
    this.user = event.parsedJson?.userId;
    this.postId = event.parsedJson?.postMetaDataId;
    this.replyId = Number(event.parsedJson?.replyMetaDataKey);
    this.commentId = Number(event.parsedJson?.commentMetaDataKey);
    this.voteDirection = Number(event.parsedJson?.voteDirection);
  }
}

export class FollowedCommunitySuiEventModel
  extends BaseSuiEventModel
  implements IFollowedCommunityEvent
{
  public user: string;

  public communityId: string;

  constructor(event: Event) {
    super(event);
    this.user = event.parsedJson?.userId;
    this.communityId = event.parsedJson?.communityId;
  }
}

export class UnfollowedCommunitySuiEventModel
  extends BaseSuiEventModel
  implements IUnfollowedCommunityEvent
{
  public user: string;

  public communityId: string;

  constructor(event: Event) {
    super(event);
    this.user = event.parsedJson?.userId;
    this.communityId = event.parsedJson?.communityId;
  }
}

export class CommentCreatedSuiEventModel
  extends BaseSuiEventModel
  implements ICommentCreatedEvent
{
  public user: string;

  public postId: string;

  public replyId: number;

  public commentId: number;

  constructor(event: Event) {
    super(event);
    this.user = event.parsedJson?.userId;
    this.postId = event.parsedJson?.postMetaDataId;
    this.replyId = Number(event.parsedJson?.parentReplyKey);
    this.commentId = Number(event.parsedJson?.commentMetaDataKey);
  }
}

export class CommentEditedSuiEventModel
  extends BaseSuiEventModel
  implements ICommentEditedEvent
{
  public user: string;

  public postId: string;

  public replyId: number;

  public commentId: number;

  constructor(event: Event) {
    super(event);
    this.user = event.parsedJson?.userId;
    this.postId = event.parsedJson?.postMetaDataId;
    this.replyId = Number(event.parsedJson?.parentReplyKey);
    this.commentId = Number(event.parsedJson?.commentMetaDataKey);
  }
}

export class CommentDeletedSuiEventModel
  extends BaseSuiEventModel
  implements ICommentDeletedEvent
{
  public user: string;

  public postId: string;

  public replyId: number;

  public commentId: number;

  constructor(event: Event) {
    super(event);
    this.user = event.parsedJson?.userId;
    this.postId = event.parsedJson?.postMetaDataId;
    this.replyId = Number(event.parsedJson?.parentReplyKey);
    this.commentId = Number(event.parsedJson?.commentMetaDataKey);
  }
}

export class RoleGrantedSuiEventModel
  extends BaseSuiEventModel
  implements IRoleGrantedEvent
{
  public role: string;

  public user: string;

  constructor(event: Event) {
    super(event);
    this.role = toHexString(event.parsedJson?.role);
    this.user = event.parsedJson?.userId;
  }
}

export class RoleRevokedSuiEventModel
  extends BaseSuiEventModel
  implements IRoleRevokedEvent
{
  public role: string;

  public user: string;

  constructor(event: Event) {
    super(event);
    this.role = toHexString(event.parsedJson?.role);
    this.user = event.parsedJson?.userId;
  }
}

export class SetDocumentationTreeSuiEventModel
  extends BaseSuiEventModel
  implements ISetDocumentationTreeEvent
{
  public user: string;

  public communityId: string;

  constructor(event: Event) {
    super(event);
    this.user = event.parsedJson?.userId;
    this.communityId = event.parsedJson?.communityId;
  }
}

export class SuiExportEventModel {
  public name!: string;

  public transactionHash: string;

  public args: any;

  constructor(event: Event) {
    this.transactionHash = event.id.txDigest;
    this.args = event.parsedJson;
  }
}
