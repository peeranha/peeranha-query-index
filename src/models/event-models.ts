import { QueueNames } from 'src/core/utils/sqs';

export class BaseEventModel {
  public contractEventName: string;

  public contractAddress: string;

  public transaction: string;

  public blockNumber: number;

  public timestamp: number;

  constructor(event: any) {
    this.contractEventName = event.event_name;
    this.contractAddress = event.contract_address;
    this.transaction = event.transaction_hash;
    this.blockNumber = event.block_number;
    this.timestamp = 0;
  }
}

export class EventListenerRequest {
  public transactions: any[];

  public queueName: string;

  constructor(req: any, queueName: string) {
    const transactions: any[] = [];
    req.body.payload.forEach((item: any) =>
      transactions.push(...item.transactions)
    );
    this.transactions = transactions;
    this.queueName = queueName;
  }
}

export class FirstEventListenerRequest extends EventListenerRequest {
  constructor(req: any) {
    super(req, QueueNames.FirstQueue);
  }
}

export class SecondEventListenerRequest extends EventListenerRequest {
  constructor(req: any) {
    super(req, QueueNames.SecondQueue);
  }
}

export class PostCreatedEventModel extends BaseEventModel {
  public user: string;

  public communityId: number;

  public postId: number;

  constructor(event: any) {
    super(event);
    this.user = event.user;
    this.communityId = event.communityId;
    this.postId = event.postId;
  }
}

export class PostEditedEventModel extends BaseEventModel {
  public user: string;

  public postId: number;

  constructor(event: any) {
    super(event);
    this.user = event.user;
    this.postId = event.postId;
  }
}

export class ReplyEditedEventModel extends BaseEventModel {
  public user: string;

  public postId: number;

  public replyId: number;

  constructor(event: any) {
    super(event);
    this.user = event.user;
    this.postId = event.postId;
    this.replyId = event.replyId;
  }
}

export class CommentEditedEventModel extends BaseEventModel {
  public user: string;

  public postId: number;

  public replyId: number;

  public commentId: number;

  constructor(event: any) {
    super(event);
    this.user = event.user;
    this.postId = event.postId;
    this.replyId = event.parentReplyId;
    this.commentId = event.commentId;
  }
}

export class UserCreatedEventModel extends BaseEventModel {
  public userAddress: string;

  constructor(event: any) {
    super(event);
    this.userAddress = event.userAddress;
  }
}

export class UserUpdatedEventModel extends BaseEventModel {
  public userAddress: string;

  constructor(event: any) {
    super(event);
    this.userAddress = event.userAddress;
  }
}

export class FollowedCommunityEventModel extends BaseEventModel {
  public userAddress: string;

  public communityId: number;

  constructor(event: any) {
    super(event);
    this.userAddress = event.userAddress;
    this.communityId = event.communityId;
  }
}

export class UnfollowedCommunityEventModel extends BaseEventModel {
  public userAddress: string;

  public communityId: number;

  constructor(event: any) {
    super(event);
    this.userAddress = event.userAddress;
    this.communityId = event.communityId;
  }
}

export class RoleGrantedEventModel extends BaseEventModel {
  public account: string;

  public role: string;

  constructor(event: any) {
    super(event);
    this.account = event.account;
    this.role = event.role;
  }
}

export class RoleRevokedEventModel extends BaseEventModel {
  public account: string;

  public role: string;

  constructor(event: any) {
    super(event);
    this.account = event.account;
    this.role = event.role;
  }
}

export class CommunityCreatedEventModel extends BaseEventModel {
  public user: string;

  public id: number;

  constructor(event: any) {
    super(event);
    this.user = event.user;
    this.id = event.id;
  }
}

export class CommunityUpdatedEventModel extends BaseEventModel {
  public user: string;

  public id: number;

  constructor(event: any) {
    super(event);
    this.user = event.user;
    this.id = event.id;
  }
}

export class CommunityFrozenEventModel extends BaseEventModel {
  public user: string;

  public communityId: number;

  constructor(event: any) {
    super(event);
    this.user = event.user;
    this.communityId = event.communityId;
  }
}

export class CommunityUnfrozenEventModel extends BaseEventModel {
  public user: string;

  public communityId: number;

  constructor(event: any) {
    super(event);
    this.user = event.user;
    this.communityId = event.communityId;
  }
}

export class TagCreatedEventModel extends BaseEventModel {
  public user: string;

  public tagId: number;

  public communityId: number;

  constructor(event: any) {
    super(event);
    this.user = event.user;
    this.tagId = event.tagId;
    this.communityId = event.communityId;
  }
}

export class TagUpdatedEventModel extends BaseEventModel {
  public user: string;

  public tagId: number;

  public communityId: number;

  constructor(event: any) {
    super(event);
    this.user = event.user;
    this.tagId = event.tagId;
    this.communityId = event.communityId;
  }
}

export class PostDeletedEventModel extends BaseEventModel {
  public user: string;

  public postId: number;

  constructor(event: any) {
    super(event);
    this.user = event.user;
    this.postId = event.postId;
  }
}

export class ChangePostTypeEventModel extends BaseEventModel {
  public user: string;

  public newPostType: number;

  public postId: number;

  constructor(event: any) {
    super(event);
    this.user = event.user;
    this.newPostType = event.newPostType;
    this.postId = event.postId;
  }
}

export class ReplyDeletedEventModel extends BaseEventModel {
  public user: string;

  public postId: number;

  public replyId: number;

  constructor(event: any) {
    super(event);
    this.user = event.user;
    this.postId = event.postId;
    this.replyId = event.replyId;
  }
}

export class CommentDeletedEventModel extends BaseEventModel {
  public user: string;

  public postId: number;

  public replyId: number;

  public commentId: number;

  constructor(event: any) {
    super(event);
    this.user = event.user;
    this.postId = event.postId;
    this.replyId = event.parentReplyId;
    this.commentId = event.commentId;
  }
}

export class ConfigureNewAchievementNFTEventModel extends BaseEventModel {
  public achievementId: any;

  constructor(event: any) {
    super(event);
    this.achievementId = event.achievementId;
  }
}

export class TransferEventModel extends BaseEventModel {
  public from: string;

  public to: string;

  public tokenId: any;

  constructor(event: any) {
    super(event);
    this.from = event.from;
    this.to = event.to;
    this.tokenId = event.tokenId;
  }
}

export class GetRewardEventModel extends BaseEventModel {
  public user: string;

  public period: number;

  constructor(event: any) {
    super(event);
    this.user = event.user;
    this.period = event.period;
  }
}

export class ItemVotedEventModel extends BaseEventModel {
  user: string;

  postId: number;

  replyId: number;

  commentId: number;

  voteDirection: number;

  constructor(event: any) {
    super(event);
    this.user = event.user;
    this.postId = event.postId;
    this.replyId = event.replyId;
    this.commentId = event.commentId;
    this.voteDirection = event.voteDirection;
  }
}

export class ReplyMarkedTheBestEventModel extends BaseEventModel {
  user: string;

  postId: number;

  replyId: number;

  constructor(event: any) {
    super(event);
    this.user = event.user;
    this.postId = event.postId;
    this.replyId = event.replyId;
  }
}

export class ReplyCreatedEventModel extends BaseEventModel {
  user: string;

  postId: number;

  parentReplyId: number;

  replyId: number;

  constructor(event: any) {
    super(event);
    this.user = event.user;
    this.parentReplyId = event.parentReplyId;
    this.postId = event.postId;
    this.replyId = event.replyId;
  }
}

export class CommentCreatedEventModel extends BaseEventModel {
  user: string;

  postId: number;

  replyId: number;

  commentId: number;

  constructor(event: any) {
    super(event);
    this.user = event.user;
    this.postId = event.postId;
    this.replyId = event.parentReplyId; // ~parentReplyId
    this.commentId = event.commentId;
  }
}

export class SetDocumentationTreeEventModel extends BaseEventModel {
  public userAddr: string;

  public communityId: number;

  constructor(event: any) {
    super(event);
    this.userAddr = event.userAddr;
    this.communityId = event.communityId;
  }
}
