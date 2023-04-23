import { toHexString } from 'src/core/utils/parser';

export class BaseSuiEventModel {
  public transaction: string;

  public eventSeq: string;

  public packageId: string;

  public transactionModule: string;

  public sender: string;

  public type: string;

  public timestamp: number;

  constructor(event: any, timestamp: number) {
    this.transaction = event.id.txDigest;
    this.eventSeq = event.id.eventSeq;
    this.packageId = event.packageId;
    this.transactionModule = event.transactionModule;
    this.sender = event.sender;
    this.type = event.type;
    this.timestamp = Number(timestamp);
  }
}

export class UserCreatedSuiEventModel extends BaseSuiEventModel {
  public userId: string;

  constructor(event: any, timestamp: number) {
    super(event, timestamp);
    this.userId = event.parsedJson.userId;
  }
}

export class UserUpdatedSuiEventModel extends BaseSuiEventModel {
  public userId: string;

  constructor(event: any, timestamp: number) {
    super(event, timestamp);
    this.userId = event.parsedJson.userId;
  }
}

export class CommunityCreatedSuiEventModel extends BaseSuiEventModel {
  public userId: string;

  public communityId: string;

  constructor(event: any, timestamp: number) {
    super(event, timestamp);
    this.userId = event.parsedJson.userId;
    this.communityId = event.parsedJson.communityId;
  }
}

export class CommunityUpdatedSuiEventModel extends BaseSuiEventModel {
  public userId: string;

  public communityId: string;

  constructor(event: any, timestamp: number) {
    super(event, timestamp);
    this.userId = event.parsedJson.userId;
    this.communityId = event.parsedJson.communityId;
  }
}

export class TagCreatedSuiEventModel extends BaseSuiEventModel {
  public userId: string;

  public communityId: string;

  public tagId: number;

  constructor(event: any, timestamp: number) {
    super(event, timestamp);
    this.userId = event.parsedJson.userId;
    this.communityId = event.parsedJson.communityId;
    this.tagId = Number(event.parsedJson.tagKey);
  }
}

export class TagUpdatedSuiEventModel extends BaseSuiEventModel {
  public userId: string;

  public communityId: string;

  public tagId: number;

  constructor(event: any, timestamp: number) {
    super(event, timestamp);
    this.userId = event.parsedJson.userId;
    this.communityId = event.parsedJson.communityId;
    this.tagId = Number(event.parsedJson.tagKey);
  }
}

export class PostCreatedSuiEventModel extends BaseSuiEventModel {
  public userId: string;

  public communityId: string;

  public postId: string;

  constructor(event: any, timestamp: number) {
    super(event, timestamp);
    this.userId = event.parsedJson.userId;
    this.communityId = event.parsedJson.communityId;
    this.postId = event.parsedJson.postMetaDataId;
  }
}

export class PostEditedSuiEventModel extends BaseSuiEventModel {
  public userId: string;

  public postId: string;

  constructor(event: any, timestamp: number) {
    super(event, timestamp);
    this.userId = event.parsedJson.userId;
    this.postId = event.parsedJson.postMetaDataId;
  }
}

export class PostDeletedSuiEventModel extends BaseSuiEventModel {
  public userId: string;

  public postId: string;

  constructor(event: any, timestamp: number) {
    super(event, timestamp);
    this.userId = event.parsedJson.userId;
    this.postId = event.parsedJson.postMetaDataId;
  }
}

export class ReplyCreatedSuiEventModel extends BaseSuiEventModel {
  public userId: string;

  public postId: string;

  public parentReplyKey: number;

  public replyId: number;

  constructor(event: any, timestamp: number) {
    super(event, timestamp);
    this.userId = event.parsedJson.userId;
    this.postId = event.parsedJson.postMetaDataId;
    this.parentReplyKey = Number(event.parsedJson.parentReplyKey);
    this.replyId = Number(event.parsedJson.replyMetaDataKey);
  }
}

export class ReplyEditedSuiEventModel extends BaseSuiEventModel {
  public userId: string;

  public postId: string;

  public replyId: number;

  constructor(event: any, timestamp: number) {
    super(event, timestamp);
    this.userId = event.parsedJson.userId;
    this.postId = event.parsedJson.postMetaDataId;
    this.replyId = Number(event.parsedJson.replyMetaDataKey);
  }
}

export class ReplyDeletedSuiEventModel extends BaseSuiEventModel {
  public userId: string;

  public postId: string;

  public replyId: number;

  constructor(event: any, timestamp: number) {
    super(event, timestamp);
    this.userId = event.parsedJson.userId;
    this.postId = event.parsedJson.postMetaDataId;
    this.replyId = Number(event.parsedJson.replyMetaDataKey);
  }
}

export class ReplyMarkedTheBestSuiEventModel extends BaseSuiEventModel {
  public userId: string;

  public postId: string;

  public replyId: number;

  constructor(event: any, timestamp: number) {
    super(event, timestamp);
    this.userId = event.parsedJson.userId;
    this.postId = event.parsedJson.postMetaDataId;
    this.replyId = Number(event.parsedJson.replyMetaDataKey);
  }
}

export class ItemVotedSuiEventModel extends BaseSuiEventModel {
  public userId: string;

  public postId: string;

  public replyId: number;

  public commentId: number;

  public voteDirection: number;

  constructor(event: any, timestamp: number) {
    super(event, timestamp);
    this.userId = event.parsedJson.userId;
    this.postId = event.parsedJson.postMetaDataId;
    this.replyId = Number(event.parsedJson.replyMetaDataKey);
    this.commentId = Number(event.parsedJson.commentMetaDataKey);
    this.voteDirection = Number(event.parsedJson.voteDirection);
  }
}

export class FollowedCommunitySuiEventModel extends BaseSuiEventModel {
  public userId: string;

  public communityId: string;

  constructor(event: any, timestamp: number) {
    super(event, timestamp);
    this.userId = event.parsedJson.userId;
    this.communityId = event.parsedJson.communityId;
  }
}

export class UnfollowedCommunitySuiEventModel extends BaseSuiEventModel {
  public userId: string;

  public communityId: string;

  constructor(event: any, timestamp: number) {
    super(event, timestamp);
    this.userId = event.parsedJson.userId;
    this.communityId = event.parsedJson.communityId;
  }
}

export class CommentCreatedSuiEventModel extends BaseSuiEventModel {
  public userId: string;

  public postId: string;

  public replyId: number;

  public commentId: number;

  constructor(event: any, timestamp: number) {
    super(event, timestamp);
    this.userId = event.parsedJson.userId;
    this.postId = event.parsedJson.postMetaDataId;
    this.replyId = Number(event.parsedJson.parentReplyKey);
    this.commentId = Number(event.parsedJson.commentMetaDataKey);
  }
}

export class CommentEditedSuiEventModel extends BaseSuiEventModel {
  public userId: string;

  public postId: string;

  public replyId: number;

  public commentId: number;

  constructor(event: any, timestamp: number) {
    super(event, timestamp);
    this.userId = event.parsedJson.userId;
    this.postId = event.parsedJson.postMetaDataId;
    this.replyId = Number(event.parsedJson.parentReplyKey);
    this.commentId = Number(event.parsedJson.commentMetaDataKey);
  }
}

export class CommentDeletedSuiEventModel extends BaseSuiEventModel {
  public userId: string;

  public postId: string;

  public replyId: number;

  public commentId: number;

  constructor(event: any, timestamp: number) {
    super(event, timestamp);
    this.userId = event.parsedJson.userId;
    this.postId = event.parsedJson.postMetaDataId;
    this.replyId = Number(event.parsedJson.parentReplyKey);
    this.commentId = Number(event.parsedJson.commentMetaDataKey);
  }
}

export class RoleGrantedSuiEventModel extends BaseSuiEventModel {
  public role: string;

  public userId: string;

  constructor(event: any, timestamp: number) {
    super(event, timestamp);
    this.role = toHexString(event.parsedJson.role);
    this.userId = event.parsedJson.userId;
  }
}

export class RoleRevokedSuiEventModel extends BaseSuiEventModel {
  public role: string;

  public userId: string;

  constructor(event: any, timestamp: number) {
    super(event, timestamp);
    this.role = toHexString(event.parsedJson.role);
    this.userId = event.parsedJson.userId;
  }
}
