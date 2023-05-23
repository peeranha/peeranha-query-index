export enum Network {
  Polygon = 0,
  Edgeware = 1,
  Sui = 2,
}

export class ReadNotificationsRequestModel {
  public network: Network;

  constructor(network: Network) {
    this.network = network;
  }
}

export class ReadNotificationsResponseModel {}

export class BaseEventModel {
  public contractEventName: string;

  public contractAddress: string;

  public transaction: string;

  public blockNumber: number;

  public timestamp: number;

  public network: Network;

  constructor(event: any) {
    this.contractEventName = event.event_name;
    this.contractAddress = event.contract_address;
    this.transaction = event.transaction_hash;
    this.blockNumber = event.block_number;
    this.timestamp = 0;
    this.network = event.network;
  }
}

export class EventListenerRequest {
  public transactions: any[];

  public network: Network;

  constructor(req: any) {
    const transactions: any[] = [];
    req.body.payload.forEach((item: any) =>
      transactions.push(...item.transactions)
    );
    this.transactions = transactions;
    this.network = req.network;
  }
}

export class PostCreatedEventModel extends BaseEventModel {
  public user: string;

  public communityId: string;

  public postId: number;

  constructor(event: any) {
    super(event);
    this.user = event.user;
    this.communityId = String(event.communityId);
    this.postId = event.postId?.toNumber();
  }
}

export class PostEditedEventModel extends BaseEventModel {
  public user: string;

  public postId: number;

  constructor(event: any) {
    super(event);
    this.user = event.user;
    this.postId = event.postId?.toNumber();
  }
}

export class ReplyEditedEventModel extends BaseEventModel {
  public user: string;

  public postId: number;

  public replyId: number;

  constructor(event: any) {
    super(event);
    this.user = event.user;
    this.postId = event.postId?.toNumber();
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
    this.postId = event.postId?.toNumber();
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

  public communityId: string;

  constructor(event: any) {
    super(event);
    this.userAddress = event.userAddress;
    this.communityId = String(event.communityId);
  }
}

export class UnfollowedCommunityEventModel extends BaseEventModel {
  public userAddress: string;

  public communityId: string;

  constructor(event: any) {
    super(event);
    this.userAddress = event.userAddress;
    this.communityId = String(event.communityId);
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

  public id: string;

  constructor(event: any) {
    super(event);
    this.user = event.user;
    this.id = String(event.id);
  }
}

export class CommunityUpdatedEventModel extends BaseEventModel {
  public user: string;

  public id: string;

  constructor(event: any) {
    super(event);
    this.user = event.user;
    this.id = String(event.id);
  }
}

export class CommunityFrozenEventModel extends BaseEventModel {
  public user: string;

  public communityId: string;

  constructor(event: any) {
    super(event);
    this.user = event.user;
    this.communityId = String(event.communityId);
  }
}

export class CommunityUnfrozenEventModel extends BaseEventModel {
  public user: string;

  public communityId: string;

  constructor(event: any) {
    super(event);
    this.user = event.user;
    this.communityId = String(event.communityId);
  }
}

export class TagCreatedEventModel extends BaseEventModel {
  public user: string;

  public tagId: number;

  public communityId: string;

  constructor(event: any) {
    super(event);
    this.user = event.user;
    this.tagId = event.tagId;
    this.communityId = String(event.communityId);
  }
}

export class TagUpdatedEventModel extends BaseEventModel {
  public user: string;

  public tagId: number;

  public communityId: string;

  constructor(event: any) {
    super(event);
    this.user = event.user;
    this.tagId = event.tagId;
    this.communityId = String(event.communityId);
  }
}

export class PostDeletedEventModel extends BaseEventModel {
  public user: string;

  public postId: number;

  constructor(event: any) {
    super(event);
    this.user = event.user;
    this.postId = event.postId?.toNumber();
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
    this.postId = event.postId?.toNumber();
  }
}

export class ReplyDeletedEventModel extends BaseEventModel {
  public user: string;

  public postId: number;

  public replyId: number;

  constructor(event: any) {
    super(event);
    this.user = event.user;
    this.postId = event.postId?.toNumber();
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
    this.postId = event.postId?.toNumber();
    this.replyId = event.parentReplyId;
    this.commentId = event.commentId;
  }
}

export class ConfigureNewAchievementNFTEventModel extends BaseEventModel {
  public achievementId: number;

  constructor(event: any) {
    super(event);
    this.achievementId = event.achievementId;
  }
}

export class TransferEventModel extends BaseEventModel {
  public from: string;

  public to: string;

  public tokenId: number;

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

  constructor(event: any) {
    super(event);
    this.user = event.user;
    this.postId = event.postId?.toNumber();
    this.replyId = event.replyId;
    this.commentId = event.commentId;
  }
}

export class ReplyMarkedTheBestEventModel extends BaseEventModel {
  user: string;

  postId: number;

  replyId: number;

  constructor(event: any) {
    super(event);
    this.user = event.user;
    this.postId = event.postId?.toNumber();
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
    this.postId = event.postId?.toNumber();
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
    this.postId = event.postId?.toNumber();
    this.replyId = event.parentReplyId; // ~parentReplyId
    this.commentId = event.commentId;
  }
}

export class SetDocumentationTreeEventModel extends BaseEventModel {
  public userAddr: string;

  public communityId: string;

  constructor(event: any) {
    super(event);
    this.userAddr = event.userAddr;
    this.communityId = String(event.communityId);
  }
}
