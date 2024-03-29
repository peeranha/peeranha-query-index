import { Network } from 'src/models/event-models';

export class UserEntity {
  public id: string;

  public displayName: string;

  public postCount: number;

  public replyCount: number;

  public company: string;

  public position: string;

  public location: string;

  public about: string;

  public avatar: string;

  public creationTime: number;

  public ipfsHash: string;

  public ipfsHash2: string;

  public networkId: Network;

  constructor(user: {
    id: string;
    displayName: string;
    postCount: number;
    replyCount: number;
    company: string;
    position: string;
    location: string;
    about: string;
    avatar: string;
    creationTime: number;
    ipfsHash: string;
    ipfsHash2: string;
    network: Network;
  }) {
    this.id = user.id;
    this.displayName = user.displayName;
    this.postCount = user.postCount;
    this.replyCount = user.replyCount;
    this.company = user.company;
    this.position = user.position;
    this.location = user.location;
    this.about = user.about;
    this.avatar = user.avatar;
    this.creationTime = user.creationTime;
    this.ipfsHash = user.ipfsHash;
    this.ipfsHash2 = user.ipfsHash2;
    this.networkId = user.network;
  }
}

export class CommunityEntity {
  public id: string;

  public name: string;

  public description: string;

  public website: string;

  public communitySite: string;

  public language: string;

  public avatar: string;

  public isFrozen: boolean;

  public creationTime: number;

  public postCount: number;

  public documentationCount: number;

  public deletedPostCount: number;

  public replyCount: number;

  public tagsCount: number;

  public followingUsers: number;

  public ipfsHash: string;

  public ipfsHash2: string;

  public networkId: Network;

  constructor(community: {
    id: string;
    name: string;
    description: string;
    website: string;
    communitySite: string;
    language: string;
    avatar: string;
    isFrozen: boolean;
    creationTime: number;
    postCount: number;
    documentationCount: number;
    deletedPostCount: number;
    replyCount: number;
    tagsCount: number;
    followingUsers: number;
    ipfsHash: string;
    ipfsHash2: string;
    network: Network;
  }) {
    this.id = community.id;
    this.name = community.name;
    this.description = community.description;
    this.website = community.website;
    this.communitySite = community.communitySite;
    this.language = community.language;
    this.avatar = community.avatar;
    this.isFrozen = community.isFrozen;
    this.creationTime = community.creationTime;
    this.postCount = community.postCount;
    this.documentationCount = community.documentationCount;
    this.deletedPostCount = community.deletedPostCount;
    this.replyCount = community.replyCount;
    this.tagsCount = community.tagsCount;
    this.followingUsers = community.followingUsers;
    this.ipfsHash = community.ipfsHash;
    this.ipfsHash2 = community.ipfsHash2;
    this.networkId = community.network;
  }
}

export class UserCommunityEntity {
  public id: string;

  public userId: string;

  public communityId: string;

  constructor(userCommunity: {
    id: string;
    userId: string;
    communityId: string;
  }) {
    this.id = userCommunity.id;
    this.userId = userCommunity.userId;
    this.communityId = userCommunity.communityId;
  }
}

export class UserPermissionEntity {
  public id: string;

  public userId: string;

  public permission: string;

  constructor(userPermission: {
    id: string;
    userId: string;
    permission: string;
  }) {
    this.id = userPermission.id;
    this.userId = userPermission.userId;
    this.permission = userPermission.permission;
  }
}

export class UserCommunityRatingEntity {
  public id: string;

  public communityId: string;

  public rating: number;

  public userId: string;

  constructor(userCommunityRating: {
    id: string;
    communityId: string;
    rating: number;
    userId: string;
  }) {
    this.id = userCommunityRating.id;
    this.userId = userCommunityRating.userId;
    this.communityId = userCommunityRating.communityId;
    this.rating = userCommunityRating.rating;
  }
}

export class TagEntity {
  public id: string;

  public communityId: string;

  public name: string;

  public description: string;

  public postCount: number;

  public deletedPostCount: number;

  public language: number;

  public ipfsHash: string;

  public ipfsHash2: string;

  constructor(tag: {
    id: string;
    communityId: string;
    name: string;
    description: string;
    postCount: number;
    deletedPostCount: number;
    ipfsHash: string;
    ipfsHash2: string;
    language: number;
  }) {
    this.id = tag.id;
    this.name = tag.name;
    this.description = tag.description;
    this.communityId = tag.communityId;
    this.postCount = tag.postCount;
    this.deletedPostCount = tag.deletedPostCount;
    this.ipfsHash = tag.ipfsHash;
    this.ipfsHash2 = tag.ipfsHash2;
    this.language = tag.language;
  }
}

export class PostEntity {
  public id: string;

  public id2: string;

  public ipfsHash: string;

  public ipfsHash2: string;

  public postType: number;

  public author: string;

  public rating: number;

  public postTime: number;

  public lastMod: number;

  public communityId: string;

  public title: string;

  public content: string;

  public postContent: string;

  public commentCount: number;

  public replyCount: number;

  public isDeleted: boolean;

  public officialReply: string;

  public bestReply: string;

  public language: number;

  public handle?: string;

  public messengerType?: number;

  constructor(post: {
    id: string;
    id2: string;
    ipfsHash: string;
    ipfsHash2: string;
    postType: number;
    author: string;
    rating: number;
    postTime: number;
    lastMod: number;
    communityId: string;
    title: string;
    content: string;
    postContent: string;
    commentCount: number;
    replyCount: number;
    isDeleted: boolean;
    officialReply: string;
    bestReply: string;
    language: number;
    handle?: string;
    messengerType?: number;
  }) {
    this.id = post.id;
    this.id2 = post.id2;
    this.communityId = post.communityId;
    this.postType = post.postType;
    this.title = post.title;
    this.content = post.content;
    this.postContent = post.postContent;
    this.author = post.author;
    this.isDeleted = post.isDeleted;
    this.postTime = post.postTime;
    this.lastMod = post.lastMod;
    this.commentCount = post.commentCount;
    this.officialReply = post.officialReply;
    this.replyCount = post.replyCount;
    this.rating = post.rating;
    this.bestReply = post.bestReply;
    this.ipfsHash = post.ipfsHash;
    this.ipfsHash2 = post.ipfsHash2;
    this.language = post.language;
    this.handle = post.handle;
    this.messengerType = post.messengerType;
  }
}

export class PostTagEntity {
  public id: string;

  public postId: string;

  public tagId: string;

  constructor(postTag: { id: string; postId: string; tagId: string }) {
    this.id = postTag.id;
    this.postId = postTag.postId;
    this.tagId = postTag.tagId;
  }
}

export class ReplyEntity {
  public id: string;

  public id2: string;

  public ipfsHash: string;

  public ipfsHash2: string;

  public author: string;

  public rating: number;

  public postTime: number;

  public postId: string;

  public parentReplyId: string;

  public content: string;

  public commentCount: number;

  public isDeleted: boolean;

  public isOfficialReply: boolean;

  public isBestReply: boolean;

  public isFirstReply: boolean;

  public isQuickReply: boolean;

  public language: number;

  public handle?: string;

  public messengerType?: number;

  constructor(reply: {
    id: string;
    id2: string;
    ipfsHash: string;
    ipfsHash2: string;
    author: string;
    rating: number;
    postTime: number;
    postId: string;
    parentReplyId: string;
    content: string;
    commentCount: number;
    isDeleted: boolean;
    isOfficialReply: boolean;
    isBestReply: boolean;
    isFirstReply: boolean;
    isQuickReply: boolean;
    language: number;
    handle?: string;
    messengerType?: number;
  }) {
    this.id = reply.id;
    this.id2 = reply.id2;
    this.postId = reply.postId;
    this.parentReplyId = reply.parentReplyId;
    this.content = reply.content;
    this.author = reply.author;
    this.isDeleted = reply.isDeleted;
    this.isFirstReply = reply.isFirstReply;
    this.isQuickReply = reply.isQuickReply;
    this.postTime = reply.postTime;
    this.commentCount = reply.commentCount;
    this.isOfficialReply = reply.isOfficialReply;
    this.rating = reply.rating;
    this.isBestReply = reply.isBestReply;
    this.ipfsHash = reply.ipfsHash;
    this.ipfsHash2 = reply.ipfsHash2;
    this.language = reply.language;
    this.handle = reply.handle;
    this.messengerType = reply.messengerType;
  }
}

export class CommentEntity {
  public id: string;

  public id2: string;

  public ipfsHash: string;

  public ipfsHash2: string;

  public author: string;

  public rating: number;

  public postTime: number;

  public postId: string;

  public parentReplyId: string;

  public content: string;

  public language: number;

  public isDeleted: boolean;

  constructor(comment: {
    id: string;
    id2: string;
    ipfsHash: string;
    ipfsHash2: string;
    author: string;
    rating: number;
    postTime: number;
    postId: string;
    parentReplyId: string;
    content: string;
    language: number;
    isDeleted: boolean;
  }) {
    this.id = comment.id;
    this.id2 = comment.id2;
    this.postId = comment.postId;
    this.parentReplyId = comment.parentReplyId;
    this.content = comment.content;
    this.author = comment.author;
    this.isDeleted = comment.isDeleted;
    this.postTime = comment.postTime;
    this.rating = comment.rating;
    this.ipfsHash = comment.ipfsHash;
    this.ipfsHash2 = comment.ipfsHash2;
    this.language = comment.language;
  }
}

export class AchievementEntity {
  public id: string;

  public factCount: number;

  public maxCount: number;

  public achievementURI: string;

  public achievementsType: number;

  public lowerValue: number;

  public name: string;

  public description: string;

  public image: string;

  public communityId?: string;

  public attrCommunityId?: string;

  public attrEvent?: string;

  public attrType?: string;

  constructor(achievement: {
    id: string;
    factCount: number;
    maxCount: number;
    achievementURI: string;
    achievementsType: number;
    lowerValue: number;
    name: string;
    description: string;
    image: string;
    communityId?: string;
    attrCommunityId?: string;
    attrEvent?: string;
    attrType?: string;
  }) {
    this.id = achievement.id;
    this.factCount = achievement.factCount;
    this.maxCount = achievement.maxCount;
    this.achievementURI = achievement.achievementURI;
    this.name = achievement.name;
    this.image = achievement.image;
    this.description = achievement.description;
    this.achievementsType = achievement.achievementsType;
    this.lowerValue = achievement.lowerValue;
    this.communityId = achievement.communityId;
    this.attrCommunityId = achievement.attrCommunityId;
    this.attrEvent = achievement.attrEvent;
    this.attrType = achievement.attrType;
  }
}

export class PeriodEntity {
  public id: number;

  public startPeriodTime: number;

  public endPeriodTime: number;

  public isFinished: boolean;

  constructor(period: {
    id: number;
    startPeriodTime: number;
    endPeriodTime: number;
    isFinished: boolean;
  }) {
    this.id = period.id;
    this.startPeriodTime = period.startPeriodTime;
    this.endPeriodTime = period.endPeriodTime;
    this.isFinished = period.isFinished;
  }
}

export class UserRewardEntity {
  public id: string;

  public periodId: number;

  public userId: string;

  public tokenToReward: string;

  public isPaid: boolean;

  constructor(userReward: {
    id: string;
    periodId: number;
    userId: string;
    tokenToReward: string;
    isPaid: boolean;
  }) {
    this.id = userReward.id;
    this.periodId = userReward.periodId;
    this.userId = userReward.userId;
    this.tokenToReward = userReward.tokenToReward;
    this.isPaid = userReward.isPaid;
  }
}

export class ContractInfoEntity {
  public id: string;

  public periodLength: number;

  public deployTime: number;

  public lastUpdatePeriod: number;

  constructor(contractInfo: {
    id: string;
    periodLength: number;
    deployTime: number;
    lastUpdatePeriod: number;
  }) {
    this.id = contractInfo.id;
    this.periodLength = contractInfo.periodLength;
    this.deployTime = contractInfo.deployTime;
    this.lastUpdatePeriod = contractInfo.lastUpdatePeriod;
  }
}

export class HistoryEntity {
  public id: string;

  public transactionHash: string;

  public postId: string;

  public replyId?: string;

  public commentId?: string;

  public eventEntity: string;

  public eventName: string;

  public actionUser: string;

  public timestamp: number;

  public networkId: Network;

  constructor(history: {
    id: string;
    transactionHash: string;
    postId: string;
    replyId?: string;
    commentId?: string;
    eventEntity: string;
    eventName: string;
    actionUser: string;
    timestamp: number;
    network: Network;
  }) {
    this.id = history.id;
    this.transactionHash = history.transactionHash;
    this.postId = history.postId;
    this.replyId = history.replyId;
    this.commentId = history.commentId;
    this.eventEntity = history.eventEntity;
    this.eventName = history.eventName;
    this.actionUser = history.actionUser;
    this.timestamp = history.timestamp;
    this.networkId = history.network;
  }
}

export class UserAchievementEntity {
  public id: string;

  public userId: string;

  public achievementId: string;

  constructor(userAchievement: {
    id: string;
    userId: string;
    achievementId: string;
  }) {
    this.id = userAchievement.id;
    this.userId = userAchievement.userId;
    this.achievementId = userAchievement.achievementId;
  }
}

export class CommunityDocumentationEntity {
  public id: string;

  public documentationJSON: string;

  public ipfsHash: string;

  constructor(documentation: {
    id: string;
    documentationJSON: string;
    ipfsHash: string;
  }) {
    this.id = documentation.id;
    this.documentationJSON = documentation.documentationJSON;
    this.ipfsHash = documentation.ipfsHash;
  }
}

export class CommunityTranslationEntity {
  id: string;

  communityId: string;

  name: string;

  description: string;

  language: string;

  enableAutotranslation: boolean;

  constructor(params: {
    id: string;
    communityId: string;
    name: string;
    description: string;
    language: string;
    enableAutotranslation: boolean;
  }) {
    this.id = params.id;
    this.communityId = params.communityId;
    this.name = params.name;
    this.description = params.description;
    this.language = params.language;
    this.enableAutotranslation = params.enableAutotranslation;
  }
}

export class TagTranslationEntity {
  id: string;

  tagId: string;

  name: string;

  description: string;

  language: number;

  constructor(params: {
    id: string;
    tagId: string;
    name: string;
    description: string;
    language: number;
  }) {
    this.id = params.id;
    this.tagId = params.tagId;
    this.name = params.name;
    this.description = params.description;
    this.language = params.language;
  }
}

export class PostTranslationEntity {
  id: string;

  postId: string;

  author: string;

  title: string;

  content: string;

  ipfsHash: string;

  language: number;

  constructor(params: {
    id: string;
    postId: string;
    author: string;
    title: string;
    content: string;
    ipfsHash: string;
    language: number;
  }) {
    this.id = params.id;
    this.postId = params.postId;
    this.title = params.title;
    this.content = params.content;
    this.language = params.language;
    this.ipfsHash = params.ipfsHash;
    this.author = params.author;
  }
}

export class ReplyTranslationEntity {
  id: string;

  replyId: string;

  author: string;

  content: string;

  ipfsHash: string;

  language: number;

  constructor(params: {
    id: string;
    replyId: string;
    author: string;
    content: string;
    ipfsHash: string;
    language: number;
  }) {
    this.id = params.id;
    this.replyId = params.replyId;
    this.content = params.content;
    this.language = params.language;
    this.ipfsHash = params.ipfsHash;
    this.author = params.author;
  }
}

export class CommentTranslationEntity {
  id: string;

  commentId: string;

  author: string;

  content: string;

  ipfsHash: string;

  language: number;

  constructor(params: {
    id: string;
    commentId: string;
    author: string;
    content: string;
    ipfsHash: string;
    language: number;
  }) {
    this.id = params.id;
    this.commentId = params.commentId;
    this.content = params.content;
    this.language = params.language;
    this.ipfsHash = params.ipfsHash;
    this.author = params.author;
  }
}

export class PostVoteHistoryEntity {
  id: string;

  postId: string;

  userId: string;

  direction: number;

  constructor(params: {
    id: string;
    postId: string;
    userId: string;
    direction: number;
  }) {
    this.id = params.id;
    this.postId = params.postId;
    this.userId = params.userId;
    this.direction = params.direction;
  }
}

export class ReplyVoteHistoryEntity {
  id: string;

  replyId: string;

  userId: string;

  direction: number;

  constructor(params: {
    id: string;
    replyId: string;
    userId: string;
    direction: number;
  }) {
    this.id = params.id;
    this.replyId = params.replyId;
    this.userId = params.userId;
    this.direction = params.direction;
  }
}
